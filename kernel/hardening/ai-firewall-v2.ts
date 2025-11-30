/**
 * 🔥 AI Firewall 2.0 v1.0
 * 
 * Main enforcement layer:
 * - Intent-aware filtering
 * - LLM behavioral model
 * - Sovereign mode integration
 * - Context-aware blocking
 * 
 * @version 1.0.0
 */

import { IntentGuardian, type IntentInspection } from "./intent-guardian";
import { SovereignMode } from "./sovereign-mode";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface FirewallResult {
  allowed: boolean;
  inspection: IntentInspection;
  timestamp: number;
  context: string;
}

export interface FirewallStats {
  totalChecks: number;
  blocked: number;
  allowed: number;
  byContext: Record<string, { blocked: number; allowed: number }>;
}

// ═══════════════════════════════════════════════════════════
// AI Firewall 2.0
// ═══════════════════════════════════════════════════════════

export class AIFirewallV2 {
  private static stats: FirewallStats = {
    totalChecks: 0,
    blocked: 0,
    allowed: 0,
    byContext: {},
  };

  /**
   * Enforce firewall with full LLM analysis
   */
  static async enforce(code: string, context: string): Promise<FirewallResult> {
    this.stats.totalChecks++;

    // Check sovereign mode first
    if (SovereignMode.isActive()) {
      const sovereignState = SovereignMode.getState();
      if (!sovereignState.config.allowedOperations.includes("execute")) {
        this.recordBlock(context);

        const result: FirewallResult = {
          allowed: false,
          inspection: {
            allowed: false,
            level: "malicious",
            reason: "Kernel is in Sovereign Mode — execution blocked",
            details: {},
          },
          timestamp: Date.now(),
          context,
        };

        await this.emitEvent("blocked", result, code);
        throw new Error(`AI Firewall 2.0: Sovereign Mode active — execution blocked`);
      }
    }

    // Full intent inspection
    const inspection = await IntentGuardian.inspect(code, context);

    const result: FirewallResult = {
      allowed: inspection.allowed,
      inspection,
      timestamp: Date.now(),
      context,
    };

    if (!inspection.allowed) {
      this.recordBlock(context);
      await this.emitEvent("blocked", result, code);
      throw new Error(
        `AI Firewall 2.0 blocked execution — Level: ${inspection.level}. Reason: ${inspection.reason}`
      );
    }

    this.recordAllow(context);
    return result;
  }

  /**
   * Enforce firewall with static-only analysis (faster)
   */
  static enforceSync(code: string, context: string): FirewallResult {
    this.stats.totalChecks++;

    // Check sovereign mode
    if (SovereignMode.isActive()) {
      const sovereignState = SovereignMode.getState();
      if (!sovereignState.config.allowedOperations.includes("execute")) {
        this.recordBlock(context);
        throw new Error(`AI Firewall 2.0: Sovereign Mode active — execution blocked`);
      }
    }

    // Quick static inspection
    const inspection = IntentGuardian.inspectSync(code, context);

    if (!inspection.allowed) {
      this.recordBlock(context);

      eventBus.publish({
        type: "kernel.firewall.blocked",
        context,
        level: inspection.level,
        reason: inspection.reason,
        timestamp: new Date().toISOString(),
      } as any);

      throw new Error(
        `AI Firewall 2.0 blocked execution — Level: ${inspection.level}. Reason: ${inspection.reason}`
      );
    }

    this.recordAllow(context);

    return {
      allowed: true,
      inspection,
      timestamp: Date.now(),
      context,
    };
  }

  /**
   * Check without throwing (for preview)
   */
  static async check(code: string, context: string): Promise<FirewallResult> {
    const inspection = await IntentGuardian.inspect(code, context);

    return {
      allowed: inspection.allowed,
      inspection,
      timestamp: Date.now(),
      context,
    };
  }

  /**
   * Get firewall stats
   */
  static getStats(): FirewallStats {
    return { ...this.stats };
  }

  /**
   * Reset stats
   */
  static resetStats(): void {
    this.stats = {
      totalChecks: 0,
      blocked: 0,
      allowed: 0,
      byContext: {},
    };
  }

  /**
   * Check if firewall is active
   */
  static isActive(): boolean {
    return true; // Always active
  }

  private static recordBlock(context: string): void {
    this.stats.blocked++;
    if (!this.stats.byContext[context]) {
      this.stats.byContext[context] = { blocked: 0, allowed: 0 };
    }
    this.stats.byContext[context].blocked++;
  }

  private static recordAllow(context: string): void {
    this.stats.allowed++;
    if (!this.stats.byContext[context]) {
      this.stats.byContext[context] = { blocked: 0, allowed: 0 };
    }
    this.stats.byContext[context].allowed++;
  }

  private static async emitEvent(
    action: "blocked" | "allowed",
    result: FirewallResult,
    code: string
  ): Promise<void> {
    await eventBus.publish({
      type: `kernel.firewall.${action}`,
      context: result.context,
      level: result.inspection.level,
      reason: result.inspection.reason,
      codePreview: code.slice(0, 200),
      timestamp: new Date().toISOString(),
    } as any);
  }
}

export const aiFirewallV2 = AIFirewallV2;

