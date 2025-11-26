/**
 * Policy Engine
 * 
 * Evaluates authorization decisions for actions and engines
 */

import type { PolicyContext, PolicyDecision, RolePolicy, RiskBand, SideEffectLevel } from "./types";
import { rolePolicyRepository } from "./role-policy.repository";
import { isRiskAllowed, hasRequiredScopes } from "./helpers";
import type { ActionContract, McpEngineManifest } from "../contracts/schemas";
import { createTraceLogger } from "../observability/logger";
import { policyDecisionsTotal } from "../observability/metrics";

export class PolicyEngine {
  /**
   * Evaluate whether the caller can execute an Action.
   */
  async evaluateAction(
    ctx: PolicyContext,
    action: ActionContract
  ): Promise<PolicyDecision> {
    const logger = createTraceLogger(ctx.traceId);

    const { auth, tenantId } = ctx;
    const subject = auth.principal?.subject ?? "anonymous";
    const roles = auth.roles ?? [];
    const scopes = auth.scopes ?? [];

    // 0. Basic guardrails: no principal & destructive/high risk → deny
    if (!auth.principal) {
      if (action.sideEffectLevel !== "none" || action.riskBand !== "low") {
        logger.warn(
          {
            tenantId,
            subject,
            sideEffectLevel: action.sideEffectLevel,
            riskBand: action.riskBand,
          },
          "[PolicyEngine] Anonymous principal blocked from risky action"
        );
        policyDecisionsTotal.inc({
          resourceType: "action",
          effect: "deny",
          reason: "anonymous_principal_risky_action",
          tenantId: tenantId ?? "null",
        });
        return {
          effect: "deny",
          reason: "anonymous_principal_risky_action",
        };
      }
    }

    // 1. Load role policies
    const policies = await rolePolicyRepository.getPoliciesForTenant(tenantId, roles);

    if (policies.length === 0) {
      // If no policies exist, be strict: only allow low-risk, read-only actions
      if (action.sideEffectLevel === "none" && action.riskBand === "low") {
        policyDecisionsTotal.inc({
          resourceType: "action",
          effect: "allow",
          reason: "default_low_risk_read_only",
          tenantId: tenantId ?? "null",
        });
        return {
          effect: "allow",
          reason: "default_low_risk_read_only",
        };
      }
      logger.warn(
        { tenantId, subject, roles, actionId: action.actionId },
        "[PolicyEngine] No role policies; denying non-trivial action"
      );
      policyDecisionsTotal.inc({
        resourceType: "action",
        effect: "deny",
        reason: "no_role_policies_for_tenant",
        tenantId: tenantId ?? "null",
      });
      return {
        effect: "deny",
        reason: "no_role_policies_for_tenant",
      };
    }

    // 2. Aggregate policies across roles
    const maxRiskAllowed = this.aggregateMaxRisk(policies);
    const allowedSideEffects = this.aggregateSideEffects(policies);
    const requiredScopes = this.aggregateRequiredScopes(policies);

    // 3. Check risk band
    if (!isRiskAllowed(maxRiskAllowed, action.riskBand as RiskBand)) {
      logger.warn(
        {
          tenantId,
          subject,
          actionId: action.actionId,
          actionRisk: action.riskBand,
          maxRiskAllowed,
          roles,
        },
        "[PolicyEngine] Action risk band exceeds role max"
      );
      policyDecisionsTotal.inc({
        resourceType: "action",
        effect: "deny",
        reason: "risk_band_exceeds_role_limit",
        tenantId: tenantId ?? "null",
      });
      return {
        effect: "deny",
        reason: "risk_band_exceeds_role_limit",
      };
    }

    // 4. Check side effect level
    if (!allowedSideEffects.includes(action.sideEffectLevel as SideEffectLevel)) {
      logger.warn(
        {
          tenantId,
          subject,
          actionId: action.actionId,
          sideEffectLevel: action.sideEffectLevel,
          allowedSideEffects,
          roles,
        },
        "[PolicyEngine] Action side effect level not allowed for roles"
      );
      policyDecisionsTotal.inc({
        resourceType: "action",
        effect: "deny",
        reason: "side_effect_level_not_allowed",
        tenantId: tenantId ?? "null",
      });
      return {
        effect: "deny",
        reason: "side_effect_level_not_allowed",
      };
    }

    // 5. Check scopes
    if (!hasRequiredScopes(scopes, requiredScopes)) {
      logger.warn(
        {
          tenantId,
          subject,
          actionId: action.actionId,
          userScopes: scopes,
          requiredScopes,
          roles,
        },
        "[PolicyEngine] Missing required scopes"
      );
      policyDecisionsTotal.inc({
        resourceType: "action",
        effect: "deny",
        reason: "missing_required_scopes",
        tenantId: tenantId ?? "null",
      });
      return {
        effect: "deny",
        reason: "missing_required_scopes",
      };
    }

    logger.debug(
      {
        tenantId,
        subject,
        actionId: action.actionId,
        roles,
        scopes,
      },
      "[PolicyEngine] Action allowed"
    );

    policyDecisionsTotal.inc({
      resourceType: "action",
      effect: "allow",
      reason: "policy_allow",
      tenantId: tenantId ?? "null",
    });

    return {
      effect: "allow",
      reason: "policy_allow",
    };
  }

  /**
   * Evaluate whether the caller can manage an Engine (e.g., enable/register).
   */
  async evaluateEngine(
    ctx: PolicyContext,
    engine: McpEngineManifest
  ): Promise<PolicyDecision> {
    const logger = createTraceLogger(ctx.traceId);
    const { auth, tenantId } = ctx;
    const subject = auth.principal?.subject ?? "anonymous";
    const roles = auth.roles ?? [];
    const scopes = auth.scopes ?? [];

    const policies = await rolePolicyRepository.getPoliciesForTenant(tenantId, roles);
    if (policies.length === 0) {
      logger.warn(
        { tenantId, subject, roles, engineId: engine.engineId },
        "[PolicyEngine] No role policies for engine operation"
      );
      policyDecisionsTotal.inc({
        resourceType: "engine",
        effect: "deny",
        reason: "no_role_policies_for_tenant",
        tenantId: tenantId ?? "null",
      });
      return {
        effect: "deny",
        reason: "no_role_policies_for_tenant",
      };
    }

    const maxRiskAllowed = this.aggregateMaxRisk(policies);
    const requiredScopes = this.aggregateRequiredScopes(policies);

    if (!isRiskAllowed(maxRiskAllowed, engine.riskBand as RiskBand)) {
      logger.warn(
        {
          tenantId,
          subject,
          engineId: engine.engineId,
          engineRisk: engine.riskBand,
          maxRiskAllowed,
          roles,
        },
        "[PolicyEngine] Engine risk band exceeds role max"
      );
      policyDecisionsTotal.inc({
        resourceType: "engine",
        effect: "deny",
        reason: "engine_risk_band_exceeds_role_limit",
        tenantId: tenantId ?? "null",
      });
      return {
        effect: "deny",
        reason: "engine_risk_band_exceeds_role_limit",
      };
    }

    if (!hasRequiredScopes(scopes, requiredScopes)) {
      logger.warn(
        {
          tenantId,
          subject,
          engineId: engine.engineId,
          userScopes: scopes,
          requiredScopes,
          roles,
        },
        "[PolicyEngine] Missing required scopes for engine operation"
      );
      policyDecisionsTotal.inc({
        resourceType: "engine",
        effect: "deny",
        reason: "missing_required_scopes",
        tenantId: tenantId ?? "null",
      });
      return {
        effect: "deny",
        reason: "missing_required_scopes",
      };
    }

    logger.debug(
      {
        tenantId,
        subject,
        engineId: engine.engineId,
        roles,
        scopes,
      },
      "[PolicyEngine] Engine operation allowed"
    );

    policyDecisionsTotal.inc({
      resourceType: "engine",
      effect: "allow",
      reason: "policy_allow",
      tenantId: tenantId ?? "null",
    });

    return {
      effect: "allow",
      reason: "policy_allow",
    };
  }

  private aggregateMaxRisk(policies: RolePolicy[]): RiskBand {
    // allow the highest risk among the roles (most permissive)
    const ranks = policies.map((p) => p.maxRiskBand);
    if (ranks.includes("critical")) return "critical";
    if (ranks.includes("high")) return "high";
    if (ranks.includes("medium")) return "medium";
    return "low";
  }

  private aggregateSideEffects(policies: RolePolicy[]): SideEffectLevel[] {
    const set = new Set<SideEffectLevel>();
    for (const p of policies) {
      for (const lvl of p.allowedSideEffectLevels) set.add(lvl);
    }
    return Array.from(set);
  }

  private aggregateRequiredScopes(policies: RolePolicy[]): string[] {
    // intersection would be stricter, union is more permissive.
    // v1: union to avoid surprises; you can tighten later.
    const set = new Set<string>();
    for (const p of policies) {
      for (const s of p.requiredScopes) set.add(s);
    }
    return Array.from(set);
  }
}

// Singleton instance
export const policyEngine = new PolicyEngine();

