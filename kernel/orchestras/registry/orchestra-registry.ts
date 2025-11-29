/**
 * Orchestra Registry
 * 
 * GRCD-KERNEL v4.0.0 F-15: Coordinate multiple AI orchestras
 * Central registry for all Orchestra manifests
 */

import type {
  OrchestraManifest,
  OrchestraRegistryEntry,
  OrchestrationDomain,
} from "../types";
import { validateOrchestraManifest } from "../schemas/orchestra-manifest.schema";
import { createHash } from "crypto";
import { baseLogger as logger } from "../../observability/logger";
import { orchestraAuditLogger } from "../audit/orchestra-audit";
import { orchestraEventEmitter } from "../events/orchestra-events";
import {
  recordOrchestraRegistration,
  updateAgentCount,
} from "../telemetry/orchestra-metrics";

/**
 * Orchestra Registry - Singleton pattern
 */
export class OrchestraRegistry {
  private static instance: OrchestraRegistry;
  private registry: Map<OrchestrationDomain, OrchestraRegistryEntry> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): OrchestraRegistry {
    if (!OrchestraRegistry.instance) {
      OrchestraRegistry.instance = new OrchestraRegistry();
    }
    return OrchestraRegistry.instance;
  }

  /**
   * Register an Orchestra manifest
   */
  public async register(manifest: unknown): Promise<{
    success: boolean;
    manifestHash?: string;
    error?: string;
  }> {
    try {
      // 1. Validate manifest schema
      const validation = validateOrchestraManifest(manifest);
      if (!validation.success) {
        return {
          success: false,
          error: `Orchestra manifest validation failed: ${JSON.stringify(validation.error.errors)}`,
        };
      }

      const validatedManifest: OrchestraManifest = validation.data as OrchestraManifest;

      // 2. Check for domain conflicts
      const existing = this.registry.get(validatedManifest.domain);
      if (existing && existing.status === "active") {
        logger.warn(`Orchestra already registered for domain: ${validatedManifest.domain}`);
        // Update existing registration
      }

      // 3. Generate manifest hash
      const manifestHash = this.generateManifestHash(validatedManifest);

      // 4. Validate dependencies
      if (validatedManifest.dependencies) {
        for (const dep of validatedManifest.dependencies) {
          if (!this.registry.has(dep)) {
            logger.warn(`Orchestra dependency not yet registered: ${dep}`);
          }
        }
      }

      // 5. Create registry entry
      const entry: OrchestraRegistryEntry = {
        manifestHash,
        manifest: validatedManifest,
        registeredAt: new Date(),
        status: "active",
      };

      // 6. Store in registry
      this.registry.set(validatedManifest.domain, entry);

      // 7. Emit audit, events, and metrics
      await orchestraAuditLogger.auditManifestRegistered(
        validatedManifest,
        manifestHash
      );
      await orchestraEventEmitter.emitManifestRegistered(
        validatedManifest,
        manifestHash
      );
      recordOrchestraRegistration(validatedManifest.domain, true);
      updateAgentCount(validatedManifest.domain, validatedManifest.agents.length);

      logger.info(`✅ Orchestra registered: ${validatedManifest.domain}`, {
        manifestHash: manifestHash.substring(0, 8),
        agents: validatedManifest.agents.length,
        tools: validatedManifest.tools.length,
      });

      return {
        success: true,
        manifestHash,
      };
    } catch (error) {
      // Record failed registration
      recordOrchestraRegistration(
        (manifest as any)?.domain || "unknown",
        false
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get orchestra by domain
   */
  public getByDomain(domain: OrchestrationDomain): OrchestraRegistryEntry | null {
    return this.registry.get(domain) || null;
  }

  /**
   * List all active orchestras
   */
  public listActive(): OrchestraRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      (entry) => entry.status === "active"
    );
  }

  /**
   * List all registered domains
   */
  public listDomains(): OrchestrationDomain[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Disable orchestra for domain
   */
  public async disable(domain: OrchestrationDomain, reason?: string): Promise<boolean> {
    const entry = this.registry.get(domain);
    if (!entry) {
      return false;
    }

    entry.status = "disabled";
    entry.errorMessage = reason;

    // Audit the disable event
    await orchestraAuditLogger.auditManifestDisabled(domain, reason);

    logger.info(`Orchestra disabled: ${domain}`, { reason });
    return true;
  }

  /**
   * Check if domain is registered and active
   */
  public isActive(domain: OrchestrationDomain): boolean {
    const entry = this.registry.get(domain);
    return entry?.status === "active" || false;
  }

  /**
   * Get dependencies for a domain
   */
  public getDependencies(domain: OrchestrationDomain): OrchestrationDomain[] {
    const entry = this.registry.get(domain);
    return entry?.manifest.dependencies || [];
  }

  /**
   * Validate all dependencies are registered
   */
  public validateDependencies(domain: OrchestrationDomain): boolean {
    const deps = this.getDependencies(domain);
    return deps.every((dep) => this.isActive(dep));
  }

  /**
   * Generate deterministic hash for manifest
   */
  private generateManifestHash(manifest: OrchestraManifest): string {
    const canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
    return createHash("sha256").update(canonical).digest("hex");
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
export const orchestraRegistry = OrchestraRegistry.getInstance();

