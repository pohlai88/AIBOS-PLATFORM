/**
 * 🔗 Identity Chain v1.0
 * 
 * Connects User → MCP → Engine → Kernel:
 * - Full provenance tracking
 * - Chain validation
 * - Tenant binding
 * 
 * @version 1.0.0
 */

import crypto from "crypto";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface IdentityChain {
  chainId: string;
  userId: string;
  tenantId: string;
  mcpId: string;
  engineId: string;
  manifestFingerprint: string;
  parentChainId?: string; // For nested calls
  depth: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ChainValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ═══════════════════════════════════════════════════════════
// Identity Chain Manager
// ═══════════════════════════════════════════════════════════

export class IdentityChainManager {
  private static chains = new Map<string, IdentityChain>();
  private static readonly MAX_DEPTH = 10;

  /**
   * Create a new identity chain
   */
  static create(data: Omit<IdentityChain, "chainId" | "timestamp" | "depth">): IdentityChain {
    const chainId = crypto.randomUUID();
    const parentChain = data.parentChainId ? this.chains.get(data.parentChainId) : null;

    const chain: IdentityChain = {
      ...data,
      chainId,
      depth: parentChain ? parentChain.depth + 1 : 0,
      timestamp: Date.now(),
    };

    this.chains.set(chainId, chain);
    return chain;
  }

  /**
   * Validate an identity chain
   */
  static validate(chain: IdentityChain): ChainValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!chain.userId) errors.push("Missing userId");
    if (!chain.tenantId) errors.push("Missing tenantId");
    if (!chain.mcpId) errors.push("Missing mcpId");
    if (!chain.engineId) errors.push("Missing engineId");
    if (!chain.manifestFingerprint) errors.push("Missing manifestFingerprint");

    // Depth check
    if (chain.depth > this.MAX_DEPTH) {
      errors.push(`Chain depth (${chain.depth}) exceeds maximum (${this.MAX_DEPTH})`);
    }

    // Parent chain validation
    if (chain.parentChainId) {
      const parent = this.chains.get(chain.parentChainId);
      if (!parent) {
        warnings.push("Parent chain not found in registry");
      } else if (parent.tenantId !== chain.tenantId) {
        errors.push("Tenant mismatch with parent chain");
      }
    }

    // Timestamp sanity
    if (chain.timestamp > Date.now() + 60000) {
      errors.push("Chain timestamp is in the future");
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get chain by ID
   */
  static get(chainId: string): IdentityChain | undefined {
    return this.chains.get(chainId);
  }

  /**
   * Get full chain ancestry
   */
  static getAncestry(chainId: string): IdentityChain[] {
    const ancestry: IdentityChain[] = [];
    let current = this.chains.get(chainId);

    while (current) {
      ancestry.push(current);
      current = current.parentChainId ? this.chains.get(current.parentChainId) : undefined;
    }

    return ancestry;
  }

  /**
   * Verify tenant binding
   */
  static verifyTenant(chain: IdentityChain, expectedTenantId: string): boolean {
    return chain.tenantId === expectedTenantId;
  }

  /**
   * Clean up old chains
   */
  static cleanup(maxAgeMs: number = 3600000): number {
    const cutoff = Date.now() - maxAgeMs;
    let removed = 0;

    for (const [id, chain] of this.chains.entries()) {
      if (chain.timestamp < cutoff) {
        this.chains.delete(id);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get chain count
   */
  static count(): number {
    return this.chains.size;
  }
}

export const identityChainManager = IdentityChainManager;

