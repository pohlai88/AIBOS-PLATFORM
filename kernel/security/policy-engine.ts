/**
 * PolicyEngine - Declarative policy enforcement for limits and risk bands
 * 
 * Hardening v2: Centralized policy management
 */

export type RiskBand = "low" | "medium" | "high" | "critical";

export interface PolicyContext {
  tenantId?: string;
  engineName?: string;
  toolName?: string;
  actionName?: string;
  userRole?: string;
  riskBand?: RiskBand;
  resource?: string;
  metadata?: Record<string, any>;
}

export interface PolicyDecision {
  allow: boolean;
  reason?: string;
  maxDurationMs?: number;
  maxCallsPerMinute?: number;
  requiresApproval?: boolean;
  auditLevel?: "none" | "basic" | "full";
}

type PolicyRule = (ctx: PolicyContext) => PolicyDecision | null;

export class PolicyEngine {
  private static rules: PolicyRule[] = [];
  private static defaultDecision: PolicyDecision = { allow: true };

  /**
   * Register a policy rule
   */
  static registerRule(rule: PolicyRule): void {
    this.rules.push(rule);
  }

  /**
   * Set default decision when no rules match
   */
  static setDefaultDecision(decision: PolicyDecision): void {
    this.defaultDecision = decision;
  }

  /**
   * Evaluate all rules against context
   */
  static evaluate(ctx: PolicyContext): PolicyDecision {
    for (const rule of this.rules) {
      const res = rule(ctx);
      if (res) return res;
    }
    return this.defaultDecision;
  }

  /**
   * Check if action is allowed (shorthand)
   */
  static isAllowed(ctx: PolicyContext): boolean {
    return this.evaluate(ctx).allow;
  }

  /**
   * Assert action is allowed (throws if not)
   */
  static assertAllowed(ctx: PolicyContext): void {
    const decision = this.evaluate(ctx);
    if (!decision.allow) {
      throw new Error(`Policy violation: ${decision.reason || "Action not allowed"}`);
    }
  }

  /**
   * Get rate limit for context
   */
  static getRateLimit(ctx: PolicyContext): number | undefined {
    return this.evaluate(ctx).maxCallsPerMinute;
  }

  /**
   * Get timeout for context
   */
  static getTimeout(ctx: PolicyContext): number | undefined {
    return this.evaluate(ctx).maxDurationMs;
  }

  /**
   * Clear all rules (for testing)
   */
  static clearRules(): void {
    this.rules = [];
  }

  /**
   * Get rule count
   */
  static getRuleCount(): number {
    return this.rules.length;
  }
}

// Default rules (can be overridden)
PolicyEngine.registerRule(ctx => {
  if (ctx.riskBand === "critical") {
    return {
      allow: false,
      reason: "Critical risk band not allowed by default",
      auditLevel: "full"
    };
  }
  return null;
});

PolicyEngine.registerRule(ctx => {
  if (ctx.riskBand === "high") {
    return {
      allow: true,
      maxDurationMs: 5000,
      maxCallsPerMinute: 10,
      auditLevel: "full"
    };
  }
  return null;
});

PolicyEngine.registerRule(ctx => {
  if (ctx.riskBand === "medium") {
    return {
      allow: true,
      maxDurationMs: 10000,
      maxCallsPerMinute: 100,
      auditLevel: "basic"
    };
  }
  return null;
});
