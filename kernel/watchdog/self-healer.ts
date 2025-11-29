/**
 * 🩹 Self-Healer v1.0
 * 
 * Autonomous kernel recovery:
 * - Automatic issue resolution
 * - Service restart triggers
 * - Resource cleanup
 * - Graceful degradation
 * 
 * @version 1.0.0
 */

import { AnomalyDetector, type Anomaly, type AnomalyType } from "./anomaly-detector";
import { AutoTuner } from "./auto-tuner";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type HealingAction = 
  | "gc_trigger"
  | "cache_clear"
  | "rate_limit_reduce"
  | "connection_pool_reset"
  | "graceful_degradation"
  | "service_restart_signal"
  | "emergency_lockdown";

export interface HealingAttempt {
  id: string;
  action: HealingAction;
  anomalyType: AnomalyType;
  success: boolean;
  message: string;
  timestamp: number;
}

export interface HealingPolicy {
  anomalyType: AnomalyType;
  actions: HealingAction[];
  maxAttempts: number;
  cooldownMs: number;
}

// ═══════════════════════════════════════════════════════════
// Healing Policies
// ═══════════════════════════════════════════════════════════

const HEALING_POLICIES: HealingPolicy[] = [
  {
    anomalyType: "memory_leak",
    actions: ["gc_trigger", "cache_clear", "graceful_degradation"],
    maxAttempts: 3,
    cooldownMs: 30000,
  },
  {
    anomalyType: "heap_pressure",
    actions: ["gc_trigger", "cache_clear"],
    maxAttempts: 5,
    cooldownMs: 10000,
  },
  {
    anomalyType: "cpu_spike",
    actions: ["rate_limit_reduce", "graceful_degradation"],
    maxAttempts: 3,
    cooldownMs: 15000,
  },
  {
    anomalyType: "error_surge",
    actions: ["connection_pool_reset", "graceful_degradation"],
    maxAttempts: 3,
    cooldownMs: 20000,
  },
  {
    anomalyType: "latency_spike",
    actions: ["connection_pool_reset", "rate_limit_reduce"],
    maxAttempts: 3,
    cooldownMs: 15000,
  },
  {
    anomalyType: "request_flood",
    actions: ["rate_limit_reduce", "emergency_lockdown"],
    maxAttempts: 2,
    cooldownMs: 60000,
  },
  {
    anomalyType: "resource_exhaustion",
    actions: ["gc_trigger", "cache_clear", "emergency_lockdown"],
    maxAttempts: 2,
    cooldownMs: 60000,
  },
];

// ═══════════════════════════════════════════════════════════
// Self-Healer
// ═══════════════════════════════════════════════════════════

export class SelfHealer {
  private static healingHistory: HealingAttempt[] = [];
  private static lastHealingAttempt = new Map<AnomalyType, number>();
  private static attemptCounts = new Map<AnomalyType, number>();
  private static readonly MAX_HISTORY = 200;
  private static enabled = true;

  /**
   * Attempt to heal detected anomalies
   */
  static heal(): HealingAttempt[] {
    if (!this.enabled) return [];

    const report = AnomalyDetector.detect();
    const attempts: HealingAttempt[] = [];

    for (const anomaly of report.anomalies) {
      const attempt = this.healAnomaly(anomaly);
      if (attempt) {
        attempts.push(attempt);
      }
    }

    return attempts;
  }

  /**
   * Heal a specific anomaly
   */
  private static healAnomaly(anomaly: Anomaly): HealingAttempt | null {
    const policy = HEALING_POLICIES.find(p => p.anomalyType === anomaly.type);
    if (!policy) return null;

    // Check cooldown
    const lastAttempt = this.lastHealingAttempt.get(anomaly.type) || 0;
    if (Date.now() - lastAttempt < policy.cooldownMs) {
      return null;
    }

    // Check max attempts
    const attempts = this.attemptCounts.get(anomaly.type) || 0;
    if (attempts >= policy.maxAttempts) {
      // Reset after extended cooldown
      if (Date.now() - lastAttempt > policy.cooldownMs * 5) {
        this.attemptCounts.set(anomaly.type, 0);
      } else {
        return null;
      }
    }

    // Select action based on severity and attempt count
    const actionIndex = Math.min(attempts, policy.actions.length - 1);
    const action = policy.actions[actionIndex];

    // Execute healing action
    const result = this.executeHealingAction(action, anomaly);

    // Record attempt
    this.lastHealingAttempt.set(anomaly.type, Date.now());
    this.attemptCounts.set(anomaly.type, attempts + 1);
    this.healingHistory.push(result);

    if (this.healingHistory.length > this.MAX_HISTORY) {
      this.healingHistory = this.healingHistory.slice(-this.MAX_HISTORY);
    }

    // Emit event
    eventBus.publish({
      type: result.success ? "watchdog.healing.success" : "watchdog.healing.failed",
      attempt: result,
      timestamp: new Date().toISOString(),
    } as any);

    return result;
  }

  /**
   * Execute a healing action
   */
  private static executeHealingAction(action: HealingAction, anomaly: Anomaly): HealingAttempt {
    const id = `heal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let success = false;
    let message = "";

    try {
      switch (action) {
        case "gc_trigger":
          if (global.gc) {
            global.gc();
            success = true;
            message = "Garbage collection triggered";
          } else {
            message = "GC not exposed (run with --expose-gc)";
          }
          break;

        case "cache_clear":
          // Signal to clear caches (application-specific)
          eventBus.publish({ type: "kernel.cache.clear.requested" } as any);
          success = true;
          message = "Cache clear signal sent";
          break;

        case "rate_limit_reduce":
          AutoTuner.tune();
          success = true;
          message = "Rate limits adjusted via auto-tuner";
          break;

        case "connection_pool_reset":
          eventBus.publish({ type: "kernel.connections.reset.requested" } as any);
          success = true;
          message = "Connection pool reset signal sent";
          break;

        case "graceful_degradation":
          eventBus.publish({ 
            type: "kernel.degradation.activated",
            anomalyType: anomaly.type,
            severity: anomaly.severity,
          } as any);
          success = true;
          message = "Graceful degradation mode activated";
          break;

        case "service_restart_signal":
          eventBus.publish({ 
            type: "kernel.restart.recommended",
            reason: `Anomaly: ${anomaly.type}`,
          } as any);
          success = true;
          message = "Service restart recommended (signal sent)";
          break;

        case "emergency_lockdown":
          eventBus.publish({ 
            type: "kernel.emergency.lockdown",
            reason: `Critical anomaly: ${anomaly.type}`,
          } as any);
          success = true;
          message = "Emergency lockdown initiated";
          break;

        default:
          message = `Unknown healing action: ${action}`;
      }
    } catch (error: any) {
      message = `Healing action failed: ${error.message}`;
    }

    return {
      id,
      action,
      anomalyType: anomaly.type,
      success,
      message,
      timestamp: Date.now(),
    };
  }

  /**
   * Get healing history
   */
  static getHistory(limit?: number): HealingAttempt[] {
    return limit ? this.healingHistory.slice(-limit) : [...this.healingHistory];
  }

  /**
   * Get success rate
   */
  static getSuccessRate(): number {
    if (this.healingHistory.length === 0) return 1;
    const successes = this.healingHistory.filter(h => h.success).length;
    return successes / this.healingHistory.length;
  }

  /**
   * Enable/disable self-healing
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
   * Reset attempt counts (after manual intervention)
   */
  static resetAttempts(): void {
    this.attemptCounts.clear();
    this.lastHealingAttempt.clear();
  }

  /**
   * Full reset
   */
  static reset(): void {
    this.healingHistory = [];
    this.attemptCounts.clear();
    this.lastHealingAttempt.clear();
  }
}

export const selfHealer = SelfHealer;

