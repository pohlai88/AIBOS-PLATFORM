/**
 * 🧭 Conscious Router v1.0
 * 
 * Intelligent execution routing:
 * - Risk-aware decisions
 * - Load-based routing
 * - Pattern-informed paths
 * - Adaptive mode selection
 * 
 * @version 1.0.0
 */

import { PatternRecognitionEngine } from "./pattern-engine";
import { AutonomousTuner } from "./autonomous-tuner";
import { ResourceThrottler } from "../performance/resource-throttler";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type ExecutionMode = "normal" | "fast" | "safe" | "parallel" | "batch" | "throttled";

export interface RoutingDecision {
  mode: ExecutionMode;
  priority: "low" | "normal" | "high" | "critical";
  skipFirewall: boolean;
  useCache: boolean;
  timeout: number;
  reason: string;
}

export interface RoutingContext {
  context: string;
  tenantId: string;
  riskScore?: number;
  isInternal?: boolean;
}

// ═══════════════════════════════════════════════════════════
// Conscious Router
// ═══════════════════════════════════════════════════════════

export class ConsciousRouter {
  private static readonly DEFAULT_TIMEOUT = 30000;
  private static readonly FAST_TIMEOUT = 5000;
  private static readonly SAFE_TIMEOUT = 60000;

  /**
   * Make routing decision
   */
  static route(ctx: RoutingContext): RoutingDecision {
    const pattern = PatternRecognitionEngine.getPattern(ctx.context);
    const resourceState = ResourceThrottler.getState();
    const isFastPath = AutonomousTuner.isFastPath(ctx.context);

    // Critical resource pressure → throttle
    if (resourceState.pressure === "critical") {
      return {
        mode: "throttled",
        priority: "low",
        skipFirewall: false,
        useCache: true,
        timeout: this.SAFE_TIMEOUT,
        reason: "Critical resource pressure",
      };
    }

    // High risk score → safe mode
    if (ctx.riskScore && ctx.riskScore > 70) {
      return {
        mode: "safe",
        priority: "normal",
        skipFirewall: false,
        useCache: false,
        timeout: this.SAFE_TIMEOUT,
        reason: `High risk score (${ctx.riskScore})`,
      };
    }

    // Internal trusted call
    if (ctx.isInternal) {
      return {
        mode: "fast",
        priority: "high",
        skipFirewall: true,
        useCache: true,
        timeout: this.FAST_TIMEOUT,
        reason: "Internal trusted call",
      };
    }

    // Known fast path with good success rate
    if (isFastPath && pattern && pattern.successRate > 0.95) {
      return {
        mode: "fast",
        priority: "high",
        skipFirewall: true,
        useCache: true,
        timeout: this.FAST_TIMEOUT,
        reason: "Optimized fast path",
      };
    }

    // Error-prone pattern → safe mode
    if (pattern && pattern.successRate < 0.8) {
      return {
        mode: "safe",
        priority: "normal",
        skipFirewall: false,
        useCache: false,
        timeout: this.SAFE_TIMEOUT,
        reason: `Low success rate (${(pattern.successRate * 100).toFixed(0)}%)`,
      };
    }

    // Batch-friendly context (analytics, reports)
    if (ctx.context.includes("analytics") || ctx.context.includes("report")) {
      return {
        mode: "batch",
        priority: "low",
        skipFirewall: false,
        useCache: true,
        timeout: this.SAFE_TIMEOUT,
        reason: "Batch-friendly workload",
      };
    }

    // Parallelizable context
    if (ctx.context.includes("bulk") || ctx.context.includes("multi")) {
      return {
        mode: "parallel",
        priority: "normal",
        skipFirewall: false,
        useCache: false,
        timeout: this.DEFAULT_TIMEOUT,
        reason: "Parallelizable workload",
      };
    }

    // Default normal routing
    return {
      mode: "normal",
      priority: "normal",
      skipFirewall: false,
      useCache: pattern ? pattern.count > 10 : false,
      timeout: this.DEFAULT_TIMEOUT,
      reason: "Standard routing",
    };
  }

  /**
   * Quick check if should use fast path
   */
  static shouldUseFastPath(context: string): boolean {
    const pattern = PatternRecognitionEngine.getPattern(context);
    return AutonomousTuner.isFastPath(context) && 
           (!pattern || pattern.successRate > 0.9);
  }

  /**
   * Get recommended priority
   */
  static getPriority(context: string, tenantTier?: string): RoutingDecision["priority"] {
    if (tenantTier === "enterprise") return "high";
    if (context.includes("critical") || context.includes("urgent")) return "critical";
    if (context.includes("background") || context.includes("async")) return "low";
    return "normal";
  }

  /**
   * Check if should throttle
   */
  static shouldThrottle(): boolean {
    const state = ResourceThrottler.getState();
    return state.pressure === "high" || state.pressure === "critical";
  }
}

export const consciousRouter = ConsciousRouter;

