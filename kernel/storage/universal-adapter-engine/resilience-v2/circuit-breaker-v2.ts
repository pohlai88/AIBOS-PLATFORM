/**
 * ⚡ Circuit Breaker v2.0
 * 
 * Kernel-grade circuit breaker with:
 * - Multi-tenant isolation
 * - Provider-region-engine scoping
 * - Persistent state
 * - Health scoring integration
 * - Predictive degradation
 * 
 * @version 2.0.0
 */

import { eventBus } from "../../../events/event-bus";
import { stateStore, generateAnomalyId } from "./state-store";
import { ErrorClassifier } from "./error-classifier";
import {
  type CircuitState,
  type CircuitKey,
  type CircuitBreakerState,
  type CircuitBreakerConfig,
  type NormalizedError,
  type ProviderHealthScore,
  type HealthMetrics,
} from "./types";

// ═══════════════════════════════════════════════════════════
// Default Configuration
// ═══════════════════════════════════════════════════════════

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  openDurationMs: 30000,
  halfOpenMaxAttempts: 3,
  slidingWindowMs: 60000,
};

// ═══════════════════════════════════════════════════════════
// Circuit Breaker v2
// ═══════════════════════════════════════════════════════════

export class CircuitBreakerV2 {
  private configs: Map<string, CircuitBreakerConfig> = new Map();
  private healthWindows: Map<string, Array<{ success: boolean; latencyMs: number; timestamp: number }>> = new Map();

  /**
   * Generate circuit key from components
   */
  static buildKey(key: CircuitKey): string {
    const parts = [
      key.provider,
      key.region || "default",
      key.engine || "default",
      key.tenantId,
      key.resource || "default",
    ];
    return parts.join(":");
  }

  /**
   * Set custom config for a circuit
   */
  setConfig(key: string, config: Partial<CircuitBreakerConfig>): void {
    this.configs.set(key, { ...DEFAULT_CONFIG, ...config });
  }

  /**
   * Get config for a circuit
   */
  getConfig(key: string): CircuitBreakerConfig {
    return this.configs.get(key) || DEFAULT_CONFIG;
  }

  /**
   * Check if circuit allows execution
   */
  async canExecute(key: string): Promise<{ allowed: boolean; state: CircuitState; reason?: string }> {
    const state = await this.getState(key);
    const config = this.getConfig(key);

    switch (state.state) {
      case "closed":
        return { allowed: true, state: "closed" };

      case "open":
        // Check if cooldown has passed
        if (state.cooldownEndsAt && new Date(state.cooldownEndsAt) <= new Date()) {
          // Transition to half-open
          await this.transitionTo(key, "half-open");
          return { allowed: true, state: "half-open" };
        }
        return { 
          allowed: false, 
          state: "open", 
          reason: `Circuit open until ${state.cooldownEndsAt}` 
        };

      case "half-open":
        // Allow limited attempts in half-open
        if (state.successes + state.failures < config.halfOpenMaxAttempts) {
          return { allowed: true, state: "half-open" };
        }
        return { 
          allowed: false, 
          state: "half-open", 
          reason: "Half-open attempt limit reached" 
        };

      default:
        return { allowed: true, state: "closed" };
    }
  }

  /**
   * Record successful execution
   */
  async recordSuccess(key: string, latencyMs: number): Promise<void> {
    const state = await this.getState(key);
    const config = this.getConfig(key);

    // Update health window
    this.recordHealthMetric(key, true, latencyMs);

    if (state.state === "half-open") {
      state.successes++;
      state.lastSuccess = new Date().toISOString();

      if (state.successes >= config.successThreshold) {
        // Transition to closed
        await this.transitionTo(key, "closed");
      } else {
        await stateStore.setCircuitState({ ...state, version: state.version + 1 });
      }
    } else if (state.state === "closed") {
      // Reset failure count on success
      if (state.failures > 0) {
        state.failures = Math.max(0, state.failures - 1);
        state.lastSuccess = new Date().toISOString();
        await stateStore.setCircuitState({ ...state, version: state.version + 1 });
      }
    }

    // Update health score
    await this.updateHealthScore(key);
  }

  /**
   * Record failed execution
   */
  async recordFailure(key: string, error: NormalizedError, latencyMs: number): Promise<void> {
    const state = await this.getState(key);
    const config = this.getConfig(key);

    // Update health window
    this.recordHealthMetric(key, false, latencyMs);

    state.failures++;
    state.lastFailure = new Date().toISOString();

    if (state.state === "closed") {
      if (state.failures >= config.failureThreshold) {
        // Transition to open
        await this.transitionTo(key, "open");

        // Log anomaly if critical
        if (ErrorClassifier.isCritical(error)) {
          await this.logAnomalyForCircuit(key, error);
        }
      } else {
        await stateStore.setCircuitState({ ...state, version: state.version + 1 });
      }
    } else if (state.state === "half-open") {
      // Any failure in half-open goes back to open
      await this.transitionTo(key, "open");
    }

    // Update health score
    await this.updateHealthScore(key);
  }

  /**
   * Get current state
   */
  async getState(key: string): Promise<CircuitBreakerState> {
    const existing = await stateStore.getCircuitState(key);
    if (existing) return existing;

    // Initialize new state
    const initial: CircuitBreakerState = {
      key,
      state: "closed",
      failures: 0,
      successes: 0,
      version: 0,
    };
    await stateStore.setCircuitState(initial);
    return initial;
  }

  /**
   * Transition to new state
   */
  private async transitionTo(key: string, newState: CircuitState): Promise<void> {
    const state = await this.getState(key);
    const config = this.getConfig(key);
    const now = new Date();

    const oldState = state.state;
    state.state = newState;
    state.version++;

    switch (newState) {
      case "open":
        state.openedAt = now.toISOString();
        state.cooldownEndsAt = new Date(now.getTime() + config.openDurationMs).toISOString();
        state.successes = 0;
        break;

      case "half-open":
        state.halfOpenAt = now.toISOString();
        state.failures = 0;
        state.successes = 0;
        break;

      case "closed":
        state.failures = 0;
        state.successes = 0;
        state.openedAt = undefined;
        state.halfOpenAt = undefined;
        state.cooldownEndsAt = undefined;
        break;
    }

    await stateStore.setCircuitState(state);

    await eventBus.publish({
      type: "resilience.circuit.transition",
      key,
      from: oldState,
      to: newState,
      timestamp: now.toISOString(),
    } as any);
  }

  /**
   * Force reset circuit
   */
  async reset(key: string): Promise<void> {
    await this.transitionTo(key, "closed");
  }

  // ─────────────────────────────────────────────────────────
  // Health Scoring
  // ─────────────────────────────────────────────────────────

  private recordHealthMetric(key: string, success: boolean, latencyMs: number): void {
    const window = this.healthWindows.get(key) || [];
    const config = this.getConfig(key);
    const now = Date.now();

    // Add new metric
    window.push({ success, latencyMs, timestamp: now });

    // Remove old metrics outside sliding window
    const cutoff = now - config.slidingWindowMs;
    const filtered = window.filter(m => m.timestamp >= cutoff);

    this.healthWindows.set(key, filtered);
  }

  private async updateHealthScore(key: string): Promise<void> {
    const window = this.healthWindows.get(key) || [];
    if (window.length === 0) return;

    const [provider, region, engine, tenantId] = key.split(":");

    const successes = window.filter(m => m.success).length;
    const failures = window.length - successes;
    const latencies = window.map(m => m.latencyMs).sort((a, b) => a - b);

    const metrics: HealthMetrics = {
      successRate: successes / window.length,
      avgLatencyMs: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      p95LatencyMs: latencies[Math.floor(latencies.length * 0.95)] || 0,
      p99LatencyMs: latencies[Math.floor(latencies.length * 0.99)] || 0,
      errorRate: failures / window.length,
      retryRate: 0, // Would need retry tracking
      schemaViolationRate: 0, // Would need schema tracking
      lastUpdated: new Date().toISOString(),
    };

    // Calculate score (0-100)
    let score = 100;
    score -= metrics.errorRate * 50;
    score -= Math.min(metrics.avgLatencyMs / 100, 20);
    score = Math.max(0, Math.min(100, score));

    // Determine status
    let status: ProviderHealthScore["status"] = "healthy";
    let recommendedAction: ProviderHealthScore["recommendedAction"] = "none";

    if (score < 30) {
      status = "unhealthy";
      recommendedAction = "block";
    } else if (score < 60) {
      status = "degraded";
      recommendedAction = "throttle";
    } else if (score < 80) {
      status = "degraded";
      recommendedAction = "none";
    }

    const healthScore: ProviderHealthScore = {
      provider,
      region,
      tenantId,
      score,
      status,
      metrics,
      anomalies: [],
      recommendedAction,
    };

    await stateStore.setHealthScore(healthScore);
  }

  private async logAnomalyForCircuit(key: string, error: NormalizedError): Promise<void> {
    const [provider, region, engine, tenantId] = key.split(":");

    await stateStore.logAnomaly({
      id: generateAnomalyId(),
      tenantId,
      provider,
      type: "degradation",
      severity: error.severity,
      message: `Circuit opened due to ${error.category}: ${error.message}`,
      metadata: { circuitKey: key, errorCode: error.code },
      detectedAt: new Date().toISOString(),
    });
  }

  // ─────────────────────────────────────────────────────────
  // Predictive Degradation
  // ─────────────────────────────────────────────────────────

  async predictDegradation(key: string): Promise<{
    willDegrade: boolean;
    confidence: number;
    timeToFailureMs?: number;
  }> {
    const window = this.healthWindows.get(key) || [];
    if (window.length < 10) {
      return { willDegrade: false, confidence: 0 };
    }

    // Simple trend analysis
    const recentHalf = window.slice(-Math.floor(window.length / 2));
    const olderHalf = window.slice(0, Math.floor(window.length / 2));

    const recentErrorRate = recentHalf.filter(m => !m.success).length / recentHalf.length;
    const olderErrorRate = olderHalf.filter(m => !m.success).length / olderHalf.length;

    const trend = recentErrorRate - olderErrorRate;

    if (trend > 0.1) {
      // Error rate increasing
      const config = this.getConfig(key);
      const state = await this.getState(key);
      const remainingFailures = config.failureThreshold - state.failures;
      const avgTimeBetweenFailures = config.slidingWindowMs / window.length;

      return {
        willDegrade: true,
        confidence: Math.min(trend * 5, 1),
        timeToFailureMs: remainingFailures * avgTimeBetweenFailures,
      };
    }

    return { willDegrade: false, confidence: 0 };
  }
}

export const circuitBreakerV2 = new CircuitBreakerV2();

