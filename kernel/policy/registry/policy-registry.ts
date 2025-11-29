/**
 * Policy Registry
 * 
 * GRCD-KERNEL v4.0.0 C-6: Central registry for all policy manifests
 * Manages policy storage, retrieval, and precedence
 */

import type {
  PolicyManifest,
  PolicyRegistryEntry,
  PolicyPrecedence,
  PolicyStatus,
} from "../types";
import { validatePolicyManifest } from "../schemas/policy-manifest.schema";
import { createHash } from "crypto";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Policy Registry - Singleton pattern
 */
export class PolicyRegistry {
  private static instance: PolicyRegistry;
  private registry: Map<string, PolicyRegistryEntry> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): PolicyRegistry {
    if (!PolicyRegistry.instance) {
      PolicyRegistry.instance = new PolicyRegistry();
    }
    return PolicyRegistry.instance;
  }

  /**
   * Register a policy manifest
   */
  public async register(manifest: unknown): Promise<{
    success: boolean;
    manifestHash?: string;
    error?: string;
  }> {
    try {
      // 1. Validate manifest schema
      const validation = validatePolicyManifest(manifest);
      if (!validation.success) {
        return {
          success: false,
          error: `Policy manifest validation failed: ${JSON.stringify(validation.error.errors)}`,
        };
      }

      const validatedManifest: PolicyManifest = validation.data as PolicyManifest;

      // 2. Check for ID conflicts
      const existing = this.registry.get(validatedManifest.id);
      if (existing && existing.status === "active") {
        logger.warn({
          policyId: validatedManifest.id,
          existingVersion: existing.manifest.version,
          newVersion: validatedManifest.version,
        }, "[PolicyRegistry] Policy already registered, updating");
      }

      // 3. Validate dates
      if (validatedManifest.effectiveDate && validatedManifest.expirationDate) {
        if (validatedManifest.effectiveDate >= validatedManifest.expirationDate) {
          return {
            success: false,
            error: "Effective date must be before expiration date",
          };
        }
      }

      // 4. Generate manifest hash
      const manifestHash = this.generateManifestHash(validatedManifest);

      // 5. Create registry entry
      const now = new Date();
      const entry: PolicyRegistryEntry = {
        manifestHash,
        manifest: validatedManifest,
        registeredAt: existing?.registeredAt || now,
        updatedAt: existing ? now : undefined,
        status: validatedManifest.status,
      };

      // 6. Store in registry
      this.registry.set(validatedManifest.id, entry);

      logger.info({
        policyId: validatedManifest.id,
        policyName: validatedManifest.name,
        precedence: validatedManifest.precedence,
        manifestHash: manifestHash.substring(0, 8),
      }, "✅ Policy registered");

      return {
        success: true,
        manifestHash,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get policy by ID
   */
  public getById(policyId: string): PolicyRegistryEntry | null {
    return this.registry.get(policyId) || null;
  }

  /**
   * List all active policies
   */
  public listActive(): PolicyRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      (entry) => entry.status === "active" && this.isPolicyEffective(entry.manifest)
    );
  }

  /**
   * List policies by precedence level
   */
  public listByPrecedence(precedence: PolicyPrecedence): PolicyRegistryEntry[] {
    return this.listActive().filter(
      (entry) => entry.manifest.precedence === precedence
    );
  }

  /**
   * List policies by scope (orchestra, tenant, action, etc.)
   */
  public listByScope(filters: {
    orchestra?: string;
    tenant?: string;
    role?: string;
    action?: string;
    resource?: string;
  }): PolicyRegistryEntry[] {
    return this.listActive().filter((entry) => {
      const scope = entry.manifest.scope;

      // If scope is empty, policy applies to all
      const isGlobalPolicy = 
        !scope.orchestras?.length &&
        !scope.tenants?.length &&
        !scope.roles?.length &&
        !scope.actions?.length &&
        !scope.resources?.length;

      if (isGlobalPolicy) return true;

      // Check each filter
      if (filters.orchestra && scope.orchestras?.length) {
        if (!scope.orchestras.includes(filters.orchestra)) return false;
      }

      if (filters.tenant && scope.tenants?.length) {
        if (!scope.tenants.includes(filters.tenant)) return false;
      }

      if (filters.role && scope.roles?.length) {
        if (!scope.roles.some((r) => filters.role === r)) return false;
      }

      if (filters.action && scope.actions?.length) {
        if (!scope.actions.includes(filters.action)) return false;
      }

      if (filters.resource && scope.resources?.length) {
        if (!scope.resources.includes(filters.resource)) return false;
      }

      return true;
    });
  }

  /**
   * Disable policy
   */
  public async disable(policyId: string, reason?: string): Promise<boolean> {
    const entry = this.registry.get(policyId);
    if (!entry) {
      return false;
    }

    entry.status = "disabled";
    entry.errorMessage = reason;
    entry.updatedAt = new Date();

    logger.info({
      policyId,
      reason,
    }, "Policy disabled");

    return true;
  }

  /**
   * Enable policy
   */
  public async enable(policyId: string): Promise<boolean> {
    const entry = this.registry.get(policyId);
    if (!entry) {
      return false;
    }

    entry.status = "active";
    entry.errorMessage = undefined;
    entry.updatedAt = new Date();

    logger.info({ policyId }, "Policy enabled");

    return true;
  }

  /**
   * Check if policy is active
   */
  public isActive(policyId: string): boolean {
    const entry = this.registry.get(policyId);
    return entry?.status === "active" && this.isPolicyEffective(entry.manifest) || false;
  }

  /**
   * Check if policy is currently effective (within date range)
   */
  private isPolicyEffective(policy: PolicyManifest): boolean {
    const now = new Date();

    if (policy.effectiveDate && now < policy.effectiveDate) {
      return false; // Not yet effective
    }

    if (policy.expirationDate && now > policy.expirationDate) {
      return false; // Expired
    }

    return true;
  }

  /**
   * Generate deterministic hash for manifest
   */
  private generateManifestHash(manifest: PolicyManifest): string {
    const canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
    return createHash("sha256").update(canonical).digest("hex");
  }

  /**
   * Get policy count by precedence
   */
  public getCountByPrecedence(): Record<PolicyPrecedence, number> {
    const counts = {
      [1]: 0, // INTERNAL
      [2]: 0, // INDUSTRY
      [3]: 0, // LEGAL
    } as Record<PolicyPrecedence, number>;

    for (const entry of this.listActive()) {
      counts[entry.manifest.precedence]++;
    }

    return counts;
  }

  /**
   * Clear registry (for testing)
   */
  public clear(): void {
    this.registry.clear();
  }
}

/**
 * Export singleton instance
 */
export const policyRegistry = PolicyRegistry.getInstance();

