/**
 * 🩹 Self-Healing Engine v1.0
 * 
 * Autonomous recovery system:
 * - Anomaly response
 * - Cache clearing
 * - Resource recovery
 * - Circuit reset
 * 
 * @version 1.0.0
 */

import { PatternRecognitionEngine } from "./pattern-engine";
import { CacheManager } from "../performance/cache-manager";
import { ExecutionPool } from "../performance/execution-pool";
import { ResourceThrottler } from "../performance/resource-throttler";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type HealingAction = 
  | "clear_cache"
  | "clear_tenant_cache"
  | "reset_patterns"
  | "clear_queue"
  | "request_gc"
  | "reduce_concurrency"
  | "soft_reset";

export interface HealingEvent {
  action: HealingAction;
  trigger: string;
  target?: string;
  timestamp: number;
  success: boolean;
}

export interface HealthIndicators {
  riskScore: number;
  errorRate: number;
  memoryPressure: boolean;
  queueBacklog: boolean;
  anomalyDetected: boolean;
}

// ═══════════════════════════════════════════════════════════
// Self-Healing Engine
// ═══════════════════════════════════════════════════════════

export class SelfHealingEngine {
  private static healingHistory: HealingEvent[] = [];
  private static readonly MAX_HISTORY = 50;
  private static lastHealTime = 0;
  private static readonly HEAL_COOLDOWN_MS = 30000;

  /**
   * Assess health and heal if needed
   */
  static assess(indicators: HealthIndicators): HealingEvent[] {
    const events: HealingEvent[] = [];

    // Cooldown check
    if (Date.now() - this.lastHealTime < this.HEAL_COOLDOWN_MS) {
      return events;
    }

    // Critical risk → aggressive healing
    if (indicators.riskScore > 90) {
      events.push(this.heal("clear_cache", "Critical risk score"));
      events.push(this.heal("clear_queue", "Critical risk score"));
      events.push(this.heal("request_gc", "Critical risk score"));
    }
    // High risk → moderate healing
    else if (indicators.riskScore > 70) {
      events.push(this.heal("clear_cache", "High risk score"));
    }

    // High error rate → pattern reset
    if (indicators.errorRate > 0.3) {
      events.push(this.heal("reset_patterns", "High error rate"));
    }

    // Memory pressure → cache clearing + GC
    if (indicators.memoryPressure) {
      events.push(this.heal("clear_cache", "Memory pressure"));
      events.push(this.heal("request_gc", "Memory pressure"));
    }

    // Queue backlog → reduce concurrency
    if (indicators.queueBacklog) {
      events.push(this.heal("reduce_concurrency", "Queue backlog"));
    }

    // Anomaly → soft reset
    if (indicators.anomalyDetected) {
      events.push(this.heal("soft_reset", "Anomaly detected"));
    }

    if (events.length > 0) {
      this.lastHealTime = Date.now();
      
      eventBus.publish({
        type: "selfhealer.actions",
        actions: events.map(e => e.action),
        timestamp: new Date().toISOString(),
      } as any);
    }

    return events;
  }

  /**
   * Perform a healing action
   */
  static heal(action: HealingAction, trigger: string, target?: string): HealingEvent {
    let success = true;

    try {
      switch (action) {
        case "clear_cache":
          CacheManager.clear();
          console.log("🩹 Self-Heal: Cleared global cache");
          break;

        case "clear_tenant_cache":
          if (target) {
            CacheManager.clearTenant(target);
            console.log(`🩹 Self-Heal: Cleared cache for tenant ${target}`);
          }
          break;

        case "reset_patterns":
          PatternRecognitionEngine.clear();
          console.log("🩹 Self-Heal: Reset pattern engine");
          break;

        case "clear_queue":
          const cleared = ExecutionPool.clearQueue();
          console.log(`🩹 Self-Heal: Cleared ${cleared} queued tasks`);
          break;

        case "request_gc":
          ResourceThrottler.requestGC();
          console.log("🩹 Self-Heal: Requested garbage collection");
          break;

        case "reduce_concurrency":
          ExecutionPool.setMaxConcurrent(5);
          console.log("🩹 Self-Heal: Reduced concurrency to 5");
          break;

        case "soft_reset":
          CacheManager.clear();
          PatternRecognitionEngine.applyDecay();
          ExecutionPool.resetStats();
          console.log("🩹 Self-Heal: Performed soft reset");
          break;
      }
    } catch (error) {
      success = false;
      console.error(`🩹 Self-Heal failed: ${action}`, error);
    }

    const event: HealingEvent = {
      action,
      trigger,
      target,
      timestamp: Date.now(),
      success,
    };

    this.recordEvent(event);
    return event;
  }

  /**
   * Manual trigger for specific tenant
   */
  static healTenant(tenantId: string, reason: string = "manual"): HealingEvent[] {
    return [
      this.heal("clear_tenant_cache", reason, tenantId),
    ];
  }

  /**
   * Emergency full reset
   */
  static emergencyReset(): HealingEvent[] {
    console.log("🚨 Self-Heal: EMERGENCY RESET");
    
    return [
      this.heal("clear_cache", "Emergency"),
      this.heal("clear_queue", "Emergency"),
      this.heal("reset_patterns", "Emergency"),
      this.heal("request_gc", "Emergency"),
      this.heal("reduce_concurrency", "Emergency"),
    ];
  }

  /**
   * Get healing history
   */
  static getHistory(limit?: number): HealingEvent[] {
    return limit ? this.healingHistory.slice(-limit) : [...this.healingHistory];
  }

  /**
   * Get stats
   */
  static getStats(): { totalHeals: number; lastHealTime: number; recentHeals: number } {
    const oneHourAgo = Date.now() - 3600000;
    const recentHeals = this.healingHistory.filter(e => e.timestamp > oneHourAgo).length;

    return {
      totalHeals: this.healingHistory.length,
      lastHealTime: this.lastHealTime,
      recentHeals,
    };
  }

  private static recordEvent(event: HealingEvent): void {
    this.healingHistory.push(event);
    if (this.healingHistory.length > this.MAX_HISTORY) {
      this.healingHistory.shift();
    }
  }
}

export const selfHealingEngine = SelfHealingEngine;

