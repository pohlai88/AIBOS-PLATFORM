/**
 * ⚙️ Auto-Tuner v1.0
 * 
 * Self-adjusting kernel parameters:
 * - Rate limit adjustment
 * - Timeout tuning
 * - Resource allocation
 * - Cooldown management
 * 
 * @version 1.0.0
 */

import { HealthBaselineModel } from "./health-baseline";
import { AnomalyDetector, type AnomalyType } from "./anomaly-detector";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface TunableParameters {
  globalRateLimitPerMinute: number;
  defaultTimeoutMs: number;
  maxConcurrentExecutions: number;
  maxMemoryPerExecutionMB: number;
  cooldownDurationMs: number;
  healthCheckIntervalMs: number;
}

export interface TuningAction {
  parameter: keyof TunableParameters;
  oldValue: number;
  newValue: number;
  reason: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════
// Default Parameters
// ═══════════════════════════════════════════════════════════

const DEFAULT_PARAMETERS: TunableParameters = {
  globalRateLimitPerMinute: 1000,
  defaultTimeoutMs: 5000,
  maxConcurrentExecutions: 100,
  maxMemoryPerExecutionMB: 128,
  cooldownDurationMs: 5000,
  healthCheckIntervalMs: 10000,
};

// ═══════════════════════════════════════════════════════════
// Auto-Tuner
// ═══════════════════════════════════════════════════════════

export class AutoTuner {
  private static parameters: TunableParameters = { ...DEFAULT_PARAMETERS };
  private static tuningHistory: TuningAction[] = [];
  private static readonly MAX_HISTORY = 100;
  private static enabled = true;

  /**
   * Run auto-tuning based on current health
   */
  static tune(): TuningAction[] {
    if (!this.enabled) return [];

    const report = AnomalyDetector.detect();
    const actions: TuningAction[] = [];

    if (report.overallHealth === "critical") {
      // Emergency tuning
      actions.push(...this.emergencyTune());
    } else if (report.overallHealth === "degraded") {
      // Targeted tuning based on anomaly types
      for (const anomaly of report.anomalies) {
        const action = this.tuneForAnomaly(anomaly.type, anomaly.severity);
        if (action) actions.push(action);
      }
    } else {
      // Gradually restore defaults if healthy
      actions.push(...this.restoreDefaults());
    }

    // Record actions
    for (const action of actions) {
      this.tuningHistory.push(action);
      eventBus.publish({
        type: "watchdog.tuning.applied",
        action,
        timestamp: new Date().toISOString(),
      } as any);
    }

    // Trim history
    if (this.tuningHistory.length > this.MAX_HISTORY) {
      this.tuningHistory = this.tuningHistory.slice(-this.MAX_HISTORY);
    }

    return actions;
  }

  /**
   * Emergency tuning for critical state
   */
  private static emergencyTune(): TuningAction[] {
    const actions: TuningAction[] = [];

    // Reduce rate limit by 50%
    const newRateLimit = Math.max(100, Math.floor(this.parameters.globalRateLimitPerMinute * 0.5));
    if (newRateLimit !== this.parameters.globalRateLimitPerMinute) {
      actions.push(this.applyTuning("globalRateLimitPerMinute", newRateLimit, "Emergency: Critical health state"));
    }

    // Reduce concurrent executions by 50%
    const newConcurrent = Math.max(10, Math.floor(this.parameters.maxConcurrentExecutions * 0.5));
    if (newConcurrent !== this.parameters.maxConcurrentExecutions) {
      actions.push(this.applyTuning("maxConcurrentExecutions", newConcurrent, "Emergency: Critical health state"));
    }

    // Increase cooldown
    const newCooldown = Math.min(30000, this.parameters.cooldownDurationMs * 2);
    if (newCooldown !== this.parameters.cooldownDurationMs) {
      actions.push(this.applyTuning("cooldownDurationMs", newCooldown, "Emergency: Extended cooldown"));
    }

    return actions;
  }

  /**
   * Tune for specific anomaly type
   */
  private static tuneForAnomaly(type: AnomalyType, severity: string): TuningAction | null {
    const multiplier = severity === "high" ? 0.7 : 0.85;

    switch (type) {
      case "cpu_spike":
      case "request_flood":
        const newRate = Math.max(100, Math.floor(this.parameters.globalRateLimitPerMinute * multiplier));
        if (newRate !== this.parameters.globalRateLimitPerMinute) {
          return this.applyTuning("globalRateLimitPerMinute", newRate, `Reducing rate limit due to ${type}`);
        }
        break;

      case "memory_leak":
      case "heap_pressure":
        const newMemory = Math.max(32, Math.floor(this.parameters.maxMemoryPerExecutionMB * multiplier));
        if (newMemory !== this.parameters.maxMemoryPerExecutionMB) {
          return this.applyTuning("maxMemoryPerExecutionMB", newMemory, `Reducing memory limit due to ${type}`);
        }
        break;

      case "latency_spike":
        const newTimeout = Math.min(30000, Math.floor(this.parameters.defaultTimeoutMs * 1.5));
        if (newTimeout !== this.parameters.defaultTimeoutMs) {
          return this.applyTuning("defaultTimeoutMs", newTimeout, `Increasing timeout due to ${type}`);
        }
        break;

      case "error_surge":
        const newConcurrent = Math.max(10, Math.floor(this.parameters.maxConcurrentExecutions * multiplier));
        if (newConcurrent !== this.parameters.maxConcurrentExecutions) {
          return this.applyTuning("maxConcurrentExecutions", newConcurrent, `Reducing concurrency due to ${type}`);
        }
        break;
    }

    return null;
  }

  /**
   * Gradually restore defaults when healthy
   */
  private static restoreDefaults(): TuningAction[] {
    const actions: TuningAction[] = [];
    const restoreRate = 1.1; // 10% restoration per cycle

    for (const [key, defaultValue] of Object.entries(DEFAULT_PARAMETERS)) {
      const currentValue = this.parameters[key as keyof TunableParameters];
      
      if (currentValue < defaultValue) {
        const newValue = Math.min(defaultValue, Math.ceil(currentValue * restoreRate));
        if (newValue !== currentValue) {
          actions.push(this.applyTuning(
            key as keyof TunableParameters,
            newValue,
            "Restoring toward default (healthy state)"
          ));
        }
      } else if (currentValue > defaultValue && key !== "defaultTimeoutMs") {
        const newValue = Math.max(defaultValue, Math.floor(currentValue / restoreRate));
        if (newValue !== currentValue) {
          actions.push(this.applyTuning(
            key as keyof TunableParameters,
            newValue,
            "Restoring toward default (healthy state)"
          ));
        }
      }
    }

    return actions;
  }

  /**
   * Apply a tuning change
   */
  private static applyTuning(
    parameter: keyof TunableParameters,
    newValue: number,
    reason: string
  ): TuningAction {
    const oldValue = this.parameters[parameter];
    this.parameters[parameter] = newValue;

    return {
      parameter,
      oldValue,
      newValue,
      reason,
      timestamp: Date.now(),
    };
  }

  /**
   * Get current parameters
   */
  static getParameters(): TunableParameters {
    return { ...this.parameters };
  }

  /**
   * Get specific parameter
   */
  static getParameter<K extends keyof TunableParameters>(key: K): TunableParameters[K] {
    return this.parameters[key];
  }

  /**
   * Manually set parameter
   */
  static setParameter<K extends keyof TunableParameters>(key: K, value: TunableParameters[K]): void {
    const oldValue = this.parameters[key];
    this.parameters[key] = value;

    this.tuningHistory.push({
      parameter: key,
      oldValue,
      newValue: value,
      reason: "Manual override",
      timestamp: Date.now(),
    });
  }

  /**
   * Get tuning history
   */
  static getHistory(limit?: number): TuningAction[] {
    return limit ? this.tuningHistory.slice(-limit) : [...this.tuningHistory];
  }

  /**
   * Enable/disable auto-tuning
   */
  static setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if enabled
   */
  static isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Reset to defaults
   */
  static reset(): void {
    this.parameters = { ...DEFAULT_PARAMETERS };
    this.tuningHistory = [];
  }
}

export const autoTuner = AutoTuner;

