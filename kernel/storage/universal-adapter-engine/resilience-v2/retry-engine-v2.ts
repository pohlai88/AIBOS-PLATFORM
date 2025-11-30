/**
 * 🔄 Retry Engine v2.0
 * 
 * Kernel-grade retry with:
 * - Circuit breaker integration
 * - Backpressure awareness
 * - Tenant retry budgets
 * - DLQ integration
 * 
 * @version 2.0.0
 */

import { stateStore, generateDLQId, computeChecksum } from "./state-store";
import { circuitBreakerV2 } from "./circuit-breaker-v2";
import { ErrorClassifier } from "./error-classifier";
import { eventBus } from "../../../events/event-bus";
import {
  type RetryConfig,
  type RetryContext,
  type NormalizedError,
  type DLQEntry,
  type ExecutionOptions,
} from "./types";

// ═══════════════════════════════════════════════════════════
// Default Configuration
// ═══════════════════════════════════════════════════════════

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterFactor: 0.2,
  retryableCategories: [
    "network",
    "timeout",
    "server",
    "rate_limit",
    "throttling",
    "conflict",
    "offline_sync",
  ],
};

// ═══════════════════════════════════════════════════════════
// Retry Engine v2
// ═══════════════════════════════════════════════════════════

export class RetryEngineV2 {
  private configs: Map<string, RetryConfig> = new Map();

  /**
   * Set custom config
   */
  setConfig(key: string, config: Partial<RetryConfig>): void {
    this.configs.set(key, { ...DEFAULT_RETRY_CONFIG, ...config });
  }

  /**
   * Get config
   */
  getConfig(key: string): RetryConfig {
    return this.configs.get(key) || DEFAULT_RETRY_CONFIG;
  }

  /**
   * Execute with retry
   */
  async execute<T>(
    circuitKey: string,
    executor: () => Promise<T>,
    options: ExecutionOptions,
    payload?: any
  ): Promise<{ success: boolean; result?: T; error?: NormalizedError; context: RetryContext }> {
    const config = this.getConfig(circuitKey);
    const context: RetryContext = {
      attempt: 0,
      maxAttempts: config.maxAttempts,
      totalDelayMs: 0,
      errors: [],
      startedAt: new Date().toISOString(),
    };

    // Check retry budget
    const budget = await stateStore.getRetryBudget(options.tenantId);
    if (budget <= 0) {
      const error = ErrorClassifier.classify(
        new Error("Retry budget exhausted for tenant"),
        { tenantId: options.tenantId, provider: options.provider, operation: options.operation }
      );
      return { success: false, error, context };
    }

    while (context.attempt < config.maxAttempts) {
      context.attempt++;

      // Check circuit breaker before each attempt
      const circuitCheck = await circuitBreakerV2.canExecute(circuitKey);
      if (!circuitCheck.allowed) {
        const error = ErrorClassifier.classify(
          new Error(`Circuit breaker ${circuitCheck.state}: ${circuitCheck.reason}`),
          { tenantId: options.tenantId, provider: options.provider, operation: options.operation }
        );
        error.category = "server";
        error.retryable = false;

        // Send to DLQ if we have payload
        if (payload) {
          await this.enqueueToDLQ(options, payload, error, context);
        }

        return { success: false, error, context };
      }

      const startTime = Date.now();

      try {
        const result = await this.executeWithTimeout(executor, options.timeout || 30000);
        const latencyMs = Date.now() - startTime;

        // Record success
        await circuitBreakerV2.recordSuccess(circuitKey, latencyMs);

        return { success: true, result, context };
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        const error = ErrorClassifier.classify(err, {
          tenantId: options.tenantId,
          provider: options.provider,
          engine: options.engine,
          operation: options.operation,
          resource: options.resource,
        });

        context.errors.push(error);

        // Record failure
        await circuitBreakerV2.recordFailure(circuitKey, error, latencyMs);

        // Consume retry budget
        await stateStore.incrementRetryBudget(options.tenantId, -1);

        // Check if should retry
        if (!this.shouldRetry(error, context, config)) {
          // Send to DLQ if we have payload
          if (payload) {
            await this.enqueueToDLQ(options, payload, error, context);
          }

          return { success: false, error, context };
        }

        // Check backpressure
        const healthScore = await stateStore.getHealthScore(options.provider, options.tenantId);
        if (healthScore?.recommendedAction === "block") {
          // Provider is too degraded, don't retry
          if (payload) {
            await this.enqueueToDLQ(options, payload, error, context);
          }
          return { success: false, error, context };
        }

        // Calculate delay with backpressure adjustment
        let delay = this.calculateDelay(context.attempt, config, error);
        if (healthScore?.recommendedAction === "throttle") {
          delay *= 2; // Double delay if provider is degraded
        }

        context.totalDelayMs += delay;

        // Emit retry event
        await eventBus.publish({
          type: "resilience.retry.attempt",
          circuitKey,
          attempt: context.attempt,
          maxAttempts: config.maxAttempts,
          delayMs: delay,
          errorCode: error.code,
          timestamp: new Date().toISOString(),
        } as any);

        // Wait before retry
        await this.sleep(delay);
      }
    }

    // Max attempts reached
    const lastError = context.errors[context.errors.length - 1];
    if (payload) {
      await this.enqueueToDLQ(options, payload, lastError, context);
    }

    return { success: false, error: lastError, context };
  }

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: NormalizedError, context: RetryContext, config: RetryConfig): boolean {
    // Check if we have attempts left
    if (context.attempt >= config.maxAttempts) {
      return false;
    }

    // Check if error is retryable
    if (!error.retryable) {
      return false;
    }

    // Check if category is retryable
    if (!config.retryableCategories.includes(error.category)) {
      return false;
    }

    // Don't retry critical errors
    if (ErrorClassifier.isCritical(error)) {
      return false;
    }

    return true;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number, config: RetryConfig, error: NormalizedError): number {
    // Use retry-after if provided
    if (error.retryAfterMs) {
      return error.retryAfterMs;
    }

    // Exponential backoff
    const exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

    // Add jitter
    const jitterRange = cappedDelay * config.jitterFactor;
    const jitter = (Math.random() * 2 - 1) * jitterRange;

    return Math.round(cappedDelay + jitter);
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(executor: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      executor(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Enqueue failed operation to DLQ
   */
  private async enqueueToDLQ(
    options: ExecutionOptions,
    payload: any,
    error: NormalizedError,
    context: RetryContext
  ): Promise<void> {
    const entry: DLQEntry = {
      id: generateDLQId(),
      tenantId: options.tenantId,
      provider: options.provider,
      engine: options.engine,
      operation: options.operation,
      resource: options.resource,
      payload,
      payloadChecksum: computeChecksum(payload),
      error,
      retryContext: context,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: "pending",
    };

    await stateStore.enqueueDLQ(entry);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const retryEngineV2 = new RetryEngineV2();

