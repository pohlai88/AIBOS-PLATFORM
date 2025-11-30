/**
 * Policy Helpers
 * 
 * Risk ranking and scope checking utilities
 */

import type { RiskBand, SideEffectLevel } from "./types";

export const riskRank: Record<RiskBand, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

/**
 * Check if actual risk is within allowed maximum
 */
export function isRiskAllowed(
  allowedMax: RiskBand,
  actual: RiskBand
): boolean {
  return riskRank[actual] <= riskRank[allowedMax];
}

/**
 * Check if user has all required scopes
 */
export function hasRequiredScopes(
  userScopes: string[],
  requiredScopes: string[]
): boolean {
  if (requiredScopes.length === 0) return true;
  const set = new Set(userScopes);
  return requiredScopes.every((s) => set.has(s));
}

/**
 * Check if side effect level is allowed
 */
export function isSideEffectAllowed(
  allowedLevels: SideEffectLevel[],
  actual: SideEffectLevel
): boolean {
  return allowedLevels.includes(actual);
}

/**
 * Get the most permissive risk band from multiple policies
 */
export function getMaxRiskBand(policies: { maxRiskBand: RiskBand }[]): RiskBand {
  if (policies.length === 0) return "low";
  
  let max: RiskBand = "low";
  for (const policy of policies) {
    if (riskRank[policy.maxRiskBand] > riskRank[max]) {
      max = policy.maxRiskBand;
    }
  }
  return max;
}

/**
 * Merge allowed side effect levels from multiple policies
 */
export function mergeSideEffectLevels(
  policies: { allowedSideEffectLevels: SideEffectLevel[] }[]
): SideEffectLevel[] {
  const merged = new Set<SideEffectLevel>();
  for (const policy of policies) {
    for (const level of policy.allowedSideEffectLevels) {
      merged.add(level);
    }
  }
  return Array.from(merged);
}

