/**
 * 🛡️ Resilience Manager v2.0
 * 
 * Kernel-grade orchestrator for:
 * - Multi-tenant execution
 * - Provider fallback
 * - Predictive degradation
 * - DLQ management
 * - Observability
 * 
 * @version 2.0.0
 */

import crypto from "crypto";
import { eventBus } from "../../../events/event-bus";
import { circuitBreakerV2, CircuitBreakerV2 } from "./circuit-breaker-v2";
import { retryEngineV2 } from "./retry-engine-v2";
import { ErrorClassifier } from "./error-classifier";
import { stateStore, generateAnomalyId } from "./state-store";
import { PROVIDER_CAPABILITIES, type ProviderId } from "../capability-matrix";
import {
  type ExecutionOptions,
  type ExecutionResult,
  type CircuitKey,
  type NormalizedError,
  type ResilienceSpan,
} from "./types";

// ═══════════════════════════════════════════════════════════
// Resilience Manager v2
// ═══════════════════════════════════════════════════════════

export class ResilienceManagerV2 {
  /**
   * Execute operation with full resilience
   */
  async execute<T = any>(
    executor: () => Promise<T>,
    options: ExecutionOptions,
    payload?: any
  ): Promise<ExecutionResult<T>> {
    const span = this.startSpan(options);
    const startTime = Date.now();

    // Build circuit key
    const circuitKey = CircuitBreakerV2.buildKey({
      provider: options.provider,
      region: options.region,
      engine: options.engine,
      tenantId: options.tenantId,
      resource: options.resource,
    });

    // Check for predictive degradation
    if (!options.skipCircuitBreaker) {
      const prediction = await circuitBreakerV2.predictDegradation(circuitKey);
      if (prediction.willDegrade && prediction.confidence > 0.7) {
        // Log warning anomaly
        await stateStore.logAnomaly({
          id: generateAnomalyId(),
          tenantId: options.tenantId,
          provider: options.provider,
          type: "degradation",
          severity: "medium",
          message: `Predicted degradation with ${Math.round(prediction.confidence * 100)}% confidence`,
          metadata: { circuitKey, timeToFailureMs: prediction.timeToFailureMs },
          detectedAt: new Date().toISOString(),
        });

        // Try fallback if available
        if (options.fallbackProviders?.length) {
          return this.executeWithFallback(executor, options, payload, span, startTime);
        }
      }
    }

    // Execute with retry
    const result = await retryEngineV2.execute(circuitKey, executor, options, payload);

    // Complete span
    span.endTime = new Date().toISOString();
    span.durationMs = Date.now() - startTime;
    span.status = result.success ? "success" : "failure";
    span.error = result.error;
    span.retryCount = result.context.attempt - 1;
    span.circuitState = (await circuitBreakerV2.getState(circuitKey)).state;

    await this.endSpan(span);

    // Get circuit state for metrics
    const circuitState = await circuitBreakerV2.getState(circuitKey);

    return {
      success: result.success,
      data: result.result,
      error: result.error,
      metrics: {
        attempts: result.context.attempt,
        totalDurationMs: Date.now() - startTime,
        providerUsed: options.provider,
        circuitState: circuitState.state,
        fromFallback: false,
      },
    };
  }

  /**
   * Execute with fallback providers
   */
  private async executeWithFallback<T>(
    executor: () => Promise<T>,
    options: ExecutionOptions,
    payload: any,
    span: ResilienceSpan,
    startTime: number
  ): Promise<ExecutionResult<T>> {
    const providers = [options.provider, ...(options.fallbackProviders || [])];
    let lastError: NormalizedError | undefined;

    for (const provider of providers) {
      const circuitKey = CircuitBreakerV2.buildKey({
        provider,
        region: options.region,
        engine: options.engine,
        tenantId: options.tenantId,
        resource: options.resource,
      });

      // Check if this provider's circuit is open
      const canExecute = await circuitBreakerV2.canExecute(circuitKey);
      if (!canExecute.allowed) {
        continue; // Try next provider
      }

      // Check health score
      const healthScore = await stateStore.getHealthScore(provider, options.tenantId);
      if (healthScore?.recommendedAction === "block") {
        continue; // Skip blocked providers
      }

      // Try execution
      const result = await retryEngineV2.execute(
        circuitKey,
        executor,
        { ...options, provider },
        payload
      );

      if (result.success) {
        const circuitState = await circuitBreakerV2.getState(circuitKey);

        span.endTime = new Date().toISOString();
        span.durationMs = Date.now() - startTime;
        span.status = "success";
        span.retryCount = result.context.attempt - 1;
        span.circuitState = circuitState.state;
        span.metadata.fallbackProvider = provider !== options.provider ? provider : undefined;

        await this.endSpan(span);

        return {
          success: true,
          data: result.result,
          metrics: {
            attempts: result.context.attempt,
            totalDurationMs: Date.now() - startTime,
            providerUsed: provider,
            circuitState: circuitState.state,
            fromFallback: provider !== options.provider,
          },
        };
      }

      lastError = result.error;
    }

    // All providers failed
    span.endTime = new Date().toISOString();
    span.durationMs = Date.now() - startTime;
    span.status = "failure";
    span.error = lastError;

    await this.endSpan(span);

    return {
      success: false,
      error: lastError,
      metrics: {
        attempts: providers.length,
        totalDurationMs: Date.now() - startTime,
        providerUsed: options.provider,
        circuitState: "open",
        fromFallback: true,
      },
    };
  }

  // ─────────────────────────────────────────────────────────
  // DLQ Management
  // ─────────────────────────────────────────────────────────

  /**
   * Retry DLQ entries for a tenant
   */
  async retryDLQ(
    tenantId: string,
    executor: (entry: any) => Promise<any>,
    limit = 10
  ): Promise<{ processed: number; succeeded: number; failed: number }> {
    const entries = await stateStore.listDLQ(tenantId, limit);
    let succeeded = 0;
    let failed = 0;

    for (const entry of entries) {
      await stateStore.updateDLQStatus(entry.id, "retrying");

      try {
        await executor(entry.payload);
        await stateStore.updateDLQStatus(entry.id, "resolved");
        succeeded++;
      } catch (error) {
        await stateStore.updateDLQStatus(entry.id, "pending");
        failed++;
      }
    }

    return { processed: entries.length, succeeded, failed };
  }

  /**
   * Get DLQ stats for tenant
   */
  async getDLQStats(tenantId: string): Promise<{ pending: number; entries: any[] }> {
    const entries = await stateStore.listDLQ(tenantId, 100);
    return { pending: entries.length, entries };
  }

  // ─────────────────────────────────────────────────────────
  // Health & Status
  // ─────────────────────────────────────────────────────────

  /**
   * Get provider health for tenant
   */
  async getProviderHealth(provider: string, tenantId: string) {
    return stateStore.getHealthScore(provider, tenantId);
  }

  /**
   * Get circuit state
   */
  async getCircuitState(key: CircuitKey) {
    const circuitKey = CircuitBreakerV2.buildKey(key);
    return circuitBreakerV2.getState(circuitKey);
  }

  /**
   * Reset circuit
   */
  async resetCircuit(key: CircuitKey) {
    const circuitKey = CircuitBreakerV2.buildKey(key);
    return circuitBreakerV2.reset(circuitKey);
  }

  /**
   * Get anomalies for tenant
   */
  async getAnomalies(tenantId: string, since?: string) {
    return stateStore.getAnomalies(tenantId, since);
  }

  /**
   * Get overall stats
   */
  async getStats() {
    return stateStore.getStats();
  }

  // ─────────────────────────────────────────────────────────
  // Observability (Spans)
  // ─────────────────────────────────────────────────────────

  private startSpan(options: ExecutionOptions): ResilienceSpan {
    return {
      traceId: crypto.randomUUID(),
      spanId: crypto.randomUUID(),
      operation: options.operation,
      provider: options.provider,
      tenantId: options.tenantId,
      startTime: new Date().toISOString(),
      status: "success",
      retryCount: 0,
      circuitState: "closed",
      metadata: {
        region: options.region,
        engine: options.engine,
        resource: options.resource,
      },
    };
  }

  private async endSpan(span: ResilienceSpan): Promise<void> {
    await eventBus.publish({
      type: "resilience.span.completed",
      traceId: span.traceId,
      spanId: span.spanId,
      operation: span.operation,
      provider: span.provider,
      tenantId: span.tenantId,
      durationMs: span.durationMs,
      status: span.status,
      retryCount: span.retryCount,
      circuitState: span.circuitState,
      errorCode: span.error?.code,
      timestamp: span.endTime,
    } as any);
  }
}

export const resilienceManagerV2 = new ResilienceManagerV2();

