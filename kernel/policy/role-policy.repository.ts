/**
 * Role Policy Repository
 * 
 * Reads role policies from database
 */

import { Database } from "../storage/db";
import { getConfig } from "../boot/kernel.config";
import type { RolePolicy, RiskBand, SideEffectLevel } from "./types";

type RolePolicyRecord = {
  id: string;
  tenantId: string | null;
  role: string;
  maxRiskBand: string;
  allowedSideEffectLevels: string[];
  requiredScopes: string[];
};

export class RolePolicyRepository {
  /**
   * Get policies for specific roles in a tenant
   */
  async getPoliciesForTenant(
    tenantId: string | null,
    roles: string[]
  ): Promise<RolePolicy[]> {
    if (roles.length === 0) return [];

    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      // Return default policies for IN_MEMORY mode
      return this.getDefaultPolicies(roles);
    }

    const result = await Database.query<RolePolicyRecord>(
      `
      SELECT
        id,
        tenant_id as "tenantId",
        role,
        max_risk_band as "maxRiskBand",
        allowed_side_effect_levels as "allowedSideEffectLevels",
        required_scopes as "requiredScopes"
      FROM kernel_role_policies
      WHERE (tenant_id = $1 OR tenant_id IS NULL)
        AND role = ANY($2::text[])
      ORDER BY tenant_id NULLS LAST
      `,
      [tenantId, roles]
    );

    return result.rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      role: row.role,
      maxRiskBand: row.maxRiskBand as RiskBand,
      allowedSideEffectLevels: (row.allowedSideEffectLevels ?? []) as SideEffectLevel[],
      requiredScopes: row.requiredScopes ?? [],
    }));
  }

  /**
   * Get all policies for a tenant
   */
  async getAllForTenant(tenantId: string | null): Promise<RolePolicy[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return this.getDefaultPolicies(["admin", "operator", "service", "viewer"]);
    }

    const result = await Database.query<RolePolicyRecord>(
      `
      SELECT
        id,
        tenant_id as "tenantId",
        role,
        max_risk_band as "maxRiskBand",
        allowed_side_effect_levels as "allowedSideEffectLevels",
        required_scopes as "requiredScopes"
      FROM kernel_role_policies
      WHERE tenant_id = $1 OR tenant_id IS NULL
      ORDER BY role
      `,
      [tenantId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      role: row.role,
      maxRiskBand: row.maxRiskBand as RiskBand,
      allowedSideEffectLevels: (row.allowedSideEffectLevels ?? []) as SideEffectLevel[],
      requiredScopes: row.requiredScopes ?? [],
    }));
  }

  /**
   * Default policies for IN_MEMORY mode
   */
  private getDefaultPolicies(roles: string[]): RolePolicy[] {
    const defaults: Record<string, RolePolicy> = {
      admin: {
        tenantId: null,
        role: "admin",
        maxRiskBand: "critical",
        allowedSideEffectLevels: ["none", "local", "external", "destructive"],
        requiredScopes: [],
      },
      operator: {
        tenantId: null,
        role: "operator",
        maxRiskBand: "high",
        allowedSideEffectLevels: ["none", "local", "external"],
        requiredScopes: ["actions:execute"],
      },
      service: {
        tenantId: null,
        role: "service",
        maxRiskBand: "medium",
        allowedSideEffectLevels: ["none", "local"],
        requiredScopes: ["actions:execute"],
      },
      viewer: {
        tenantId: null,
        role: "viewer",
        maxRiskBand: "low",
        allowedSideEffectLevels: ["none"],
        requiredScopes: ["actions:read"],
      },
    };

    return roles
      .filter((role) => role in defaults)
      .map((role) => defaults[role]);
  }
}

// Singleton instance
export const rolePolicyRepository = new RolePolicyRepository();

