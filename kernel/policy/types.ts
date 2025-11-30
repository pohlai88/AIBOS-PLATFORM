/**
 * Policy Types
 * 
 * Core types for PolicyEngine decisions
 */

import type { AuthContext } from "../auth/types";

export type PolicyDecisionEffect = "allow" | "deny";

export type PolicyResourceType = "action" | "engine";

export type RiskBand = "low" | "medium" | "high" | "critical";

export type SideEffectLevel = "none" | "local" | "external" | "destructive";

export interface PolicyDecision {
  effect: PolicyDecisionEffect;
  reason: string;
}

export interface PolicyContext {
  auth: AuthContext;
  tenantId: string | null;
  traceId?: string | null;
}

export interface RolePolicy {
  id?: string;
  tenantId: string | null;
  role: string;
  maxRiskBand: RiskBand;
  allowedSideEffectLevels: SideEffectLevel[];
  requiredScopes: string[];
}

