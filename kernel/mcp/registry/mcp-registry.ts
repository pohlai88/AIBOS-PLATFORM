/**
 * MCP Registry - Central registry for all MCP servers
 * 
 * GRCD-KERNEL v4.0.0 Section 6.1
 * Manages MCP server lifecycles, manifests, and validation
 */

import type {
  MCPManifest,
  MCPRegistryEntry,
  MCPValidationResult,
} from "../types";
import { validateMCPManifest } from "../schemas/mcp-manifest.schema";
import { mcpAuditLogger } from "../audit/mcp-audit";
import { mcpEventEmitter } from "../events/mcp-events";
import { recordManifestRegistration } from "../telemetry/mcp-metrics";
import { createHash } from "crypto";

/**
 * MCP Registry - Singleton pattern
 */
export class MCPRegistry {
  private static instance: MCPRegistry;
  private registry: Map<string, MCPRegistryEntry> = new Map();
  private manifestsByName: Map<string, string> = new Map(); // name -> hash lookup

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): MCPRegistry {
    if (!MCPRegistry.instance) {
      MCPRegistry.instance = new MCPRegistry();
    }
    return MCPRegistry.instance;
  }

  /**
   * Register an MCP server manifest
   * 
   * @param manifest - MCP manifest to register
   * @returns Registration result with manifest hash
   */
  public async register(manifest: unknown): Promise<{
    success: boolean;
    manifestHash?: string;
    error?: string;
  }> {
    // 1. Validate manifest schema
    const validation = validateMCPManifest(manifest);
    if (!validation.success) {
      // Record failed registration
      const manifestName = (manifest as any)?.name || "unknown";
      recordManifestRegistration(manifestName, false);
      
      return {
        success: false,
        error: `Manifest validation failed: ${JSON.stringify(validation.error.errors)}`,
      };
    }

    const validatedManifest: MCPManifest = validation.data as MCPManifest;

    // 2. Generate manifest hash
    const manifestHash = this.generateManifestHash(validatedManifest);

    // 3. Check for existing registration
    const existingHash = this.manifestsByName.get(validatedManifest.name);
    if (existingHash && existingHash !== manifestHash) {
      // Manifest changed - this is a new version
      const existingEntry = this.registry.get(existingHash);
      if (existingEntry) {
        existingEntry.status = "deprecated";
      }
    }

    // 4. Create registry entry
    const entry: MCPRegistryEntry = {
      manifestHash,
      manifest: validatedManifest,
      registeredAt: new Date(),
      status: "active",
    };

    // 5. Store in registry
    this.registry.set(manifestHash, entry);
    this.manifestsByName.set(validatedManifest.name, manifestHash);

    // 6. Audit registration
    await mcpAuditLogger.auditManifestRegistered(
      validatedManifest,
      manifestHash
    );

    // 7. Emit registration event
    await mcpEventEmitter.emitManifestRegistered(validatedManifest, manifestHash);

    // 8. Record metrics
    recordManifestRegistration(validatedManifest.name, true);

    return {
      success: true,
      manifestHash,
    };
  }

  /**
   * Get manifest by name (returns latest active)
   */
  public getByName(name: string): MCPRegistryEntry | null {
    const hash = this.manifestsByName.get(name);
    if (!hash) return null;
    return this.registry.get(hash) || null;
  }

  /**
   * Get manifest by hash
   */
  public getByHash(hash: string): MCPRegistryEntry | null {
    return this.registry.get(hash) || null;
  }

  /**
   * List all active manifests
   */
  public listActive(): MCPRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      (entry) => entry.status === "active"
    );
  }

  /**
   * Disable a manifest
   */
  public async disable(name: string, reason?: string): Promise<boolean> {
    const hash = this.manifestsByName.get(name);
    if (!hash) return false;

    const entry = this.registry.get(hash);
    if (!entry) return false;

    entry.status = "disabled";
    
    // Audit disable action
    await mcpAuditLogger.auditManifestDisabled(name, reason);
    
    // Emit disabled event
    await mcpEventEmitter.emitManifestDisabled(name, reason);
    
    return true;
  }

  /**
   * Generate deterministic hash for manifest
   */
  private generateManifestHash(manifest: MCPManifest): string {
    const canonical = JSON.stringify(manifest, Object.keys(manifest).sort());
    return createHash("sha256").update(canonical).digest("hex");
  }

  /**
   * Clear registry (for testing)
   */
  public clear(): void {
    this.registry.clear();
    this.manifestsByName.clear();
  }
}

/**
 * Export singleton instance
 */
export const mcpRegistry = MCPRegistry.getInstance();

