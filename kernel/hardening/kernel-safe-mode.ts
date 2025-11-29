/**
 * 🛑 Kernel Safe Mode v1.0
 * 
 * Emergency fail-safe for critical situations:
 * - Reduces all limits
 * - Blocks non-essential operations
 * - Enables recovery mode
 * 
 * @version 1.0.0
 */

import { SovereignMode } from "./sovereign-mode";
import { AutoTuner } from "../watchdog/auto-tuner";
import { eventBus } from "../events/event-bus";
import { baseLogger } from "../observability/logger";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type SafeModeLevel = "normal" | "cautious" | "restricted" | "emergency";

export interface SafeModeState {
  level: SafeModeLevel;
  activatedAt?: number;
  activatedBy?: string;
  reason?: string;
  autoRecovery: boolean;
}

// ═══════════════════════════════════════════════════════════
// Kernel Safe Mode
// ═══════════════════════════════════════════════════════════

export class KernelSafeMode {
  private static state: SafeModeState = {
    level: "normal",
    autoRecovery: true,
  };

  /**
   * Activate safe mode
   */
  static activate(
    level: SafeModeLevel,
    reason: string,
    activatedBy: string = "system"
  ): void {
    const previousLevel = this.state.level;

    this.state = {
      level,
      activatedAt: Date.now(),
      activatedBy,
      reason,
      autoRecovery: level !== "emergency",
    };

    // Apply restrictions based on level
    switch (level) {
      case "cautious":
        // Reduce limits by 25%
        this.applyRestrictions(0.75);
        break;

      case "restricted":
        // Reduce limits by 50%
        this.applyRestrictions(0.5);
        break;

      case "emergency":
        // Enable sovereign mode
        SovereignMode.emergencyLockdown(activatedBy);
        this.applyRestrictions(0.1);
        break;
    }

    eventBus.publish({
      type: "kernel.safemode.activated",
      level,
      previousLevel,
      reason,
      activatedBy,
      timestamp: new Date().toISOString(),
    } as any);

    baseLogger.warn(
      { level, reason, activatedBy },
      "🛑 Kernel Safe Mode: %s — %s",
      level.toUpperCase(),
      reason
    );
  }

  /**
   * Deactivate safe mode
   */
  static deactivate(deactivatedBy: string = "system"): void {
    if (this.state.level === "normal") return;

    const previousLevel = this.state.level;

    // Disable sovereign mode if active
    if (previousLevel === "emergency") {
      SovereignMode.disable(deactivatedBy);
    }

    this.state = {
      level: "normal",
      autoRecovery: true,
    };

    // Restore defaults
    AutoTuner.reset();

    eventBus.publish({
      type: "kernel.safemode.deactivated",
      previousLevel,
      deactivatedBy,
      timestamp: new Date().toISOString(),
    } as any);

    baseLogger.info("🟢 Kernel Safe Mode: DEACTIVATED");
  }

  /**
   * Get current state
   */
  static getState(): SafeModeState {
    return { ...this.state };
  }

  /**
   * Check if in safe mode
   */
  static isActive(): boolean {
    return this.state.level !== "normal";
  }

  /**
   * Get current level
   */
  static getLevel(): SafeModeLevel {
    return this.state.level;
  }

  /**
   * Check if operation is allowed
   */
  static isOperationAllowed(operation: string): boolean {
    switch (this.state.level) {
      case "normal":
        return true;

      case "cautious":
        // Block high-risk operations
        return !["delete", "truncate", "drop"].some(op =>
          operation.toLowerCase().includes(op)
        );

      case "restricted":
        // Only allow read operations
        return ["read", "get", "list", "query", "health"].some(op =>
          operation.toLowerCase().includes(op)
        );

      case "emergency":
        // Only health checks
        return operation.toLowerCase().includes("health");

      default:
        return false;
    }
  }

  /**
   * Apply restrictions via auto-tuner
   */
  private static applyRestrictions(multiplier: number): void {
    const params = AutoTuner.getParameters();

    AutoTuner.setParameter(
      "globalRateLimitPerMinute",
      Math.floor(params.globalRateLimitPerMinute * multiplier)
    );
    AutoTuner.setParameter(
      "maxConcurrentExecutions",
      Math.floor(params.maxConcurrentExecutions * multiplier)
    );
  }

  /**
   * Auto-escalate based on risk score
   */
  static autoEscalate(riskScore: number): void {
    if (riskScore >= 90 && this.state.level !== "emergency") {
      this.activate("emergency", `Critical risk score: ${riskScore}`, "watchdog");
    } else if (riskScore >= 70 && this.state.level === "normal") {
      this.activate("restricted", `High risk score: ${riskScore}`, "watchdog");
    } else if (riskScore >= 50 && this.state.level === "normal") {
      this.activate("cautious", `Elevated risk score: ${riskScore}`, "watchdog");
    }
  }

  /**
   * Auto-recover if conditions improve
   */
  static autoRecover(riskScore: number): void {
    if (!this.state.autoRecovery) return;

    if (riskScore < 30 && this.state.level !== "normal") {
      // Check if stable for sufficient time
      const stableTime = Date.now() - (this.state.activatedAt || 0);
      if (stableTime > 60000) { // 1 minute stable
        this.deactivate("auto-recovery");
      }
    }
  }
}

export const kernelSafeMode = KernelSafeMode;

