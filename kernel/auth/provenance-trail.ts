/**
 * 📜 Provenance Trail v1.0
 * 
 * Audit trail for identity chains:
 * - Full execution history
 * - Cryptographic logging
 * - Drift-proof records
 * 
 * @version 1.0.0
 */

import crypto from "crypto";
import { eventBus } from "../events/event-bus";
import { type IdentityChain } from "./identity-chain";
import { type ExecutionToken } from "./execution-token";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ProvenanceEntry {
  id: string;
  chain: IdentityChain;
  action: string;
  result: "success" | "failure" | "blocked";
  reason?: string;
  timestamp: number;
  hash: string;
  previousHash: string;
}

export interface ProvenanceQuery {
  tenantId?: string;
  mcpId?: string;
  userId?: string;
  action?: string;
  result?: ProvenanceEntry["result"];
  fromTimestamp?: number;
  toTimestamp?: number;
  limit?: number;
}

// ═══════════════════════════════════════════════════════════
// Provenance Trail
// ═══════════════════════════════════════════════════════════

export class ProvenanceTrail {
  private static entries: ProvenanceEntry[] = [];
  private static lastHash = "genesis";
  private static readonly MAX_ENTRIES = 10000;

  /**
   * Record a provenance entry
   */
  static record(
    chain: IdentityChain,
    action: string,
    result: ProvenanceEntry["result"],
    reason?: string
  ): ProvenanceEntry {
    const id = crypto.randomUUID();
    const timestamp = Date.now();

    // Create hash chain
    const dataToHash = JSON.stringify({
      id,
      chain,
      action,
      result,
      reason,
      timestamp,
      previousHash: this.lastHash,
    });
    const hash = crypto.createHash("sha256").update(dataToHash).digest("hex");

    const entry: ProvenanceEntry = {
      id,
      chain,
      action,
      result,
      reason,
      timestamp,
      hash,
      previousHash: this.lastHash,
    };

    this.entries.push(entry);
    this.lastHash = hash;

    // Trim if too large
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES / 2);
    }

    // Emit event
    eventBus.publish({
      type: "kernel.provenance.recorded",
      entryId: id,
      tenantId: chain.tenantId,
      action,
      result,
      timestamp: new Date(timestamp).toISOString(),
    } as any);

    return entry;
  }

  /**
   * Query provenance entries
   */
  static query(params: ProvenanceQuery): ProvenanceEntry[] {
    let results = this.entries;

    if (params.tenantId) {
      results = results.filter(e => e.chain.tenantId === params.tenantId);
    }
    if (params.mcpId) {
      results = results.filter(e => e.chain.mcpId === params.mcpId);
    }
    if (params.userId) {
      results = results.filter(e => e.chain.userId === params.userId);
    }
    if (params.action) {
      results = results.filter(e => e.action === params.action);
    }
    if (params.result) {
      results = results.filter(e => e.result === params.result);
    }
    if (params.fromTimestamp) {
      results = results.filter(e => e.timestamp >= params.fromTimestamp!);
    }
    if (params.toTimestamp) {
      results = results.filter(e => e.timestamp <= params.toTimestamp!);
    }

    if (params.limit) {
      results = results.slice(-params.limit);
    }

    return results;
  }

  /**
   * Verify chain integrity
   */
  static verifyIntegrity(): { valid: boolean; brokenAt?: number } {
    let previousHash = "genesis";

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];

      if (entry.previousHash !== previousHash) {
        return { valid: false, brokenAt: i };
      }

      // Recalculate hash
      const dataToHash = JSON.stringify({
        id: entry.id,
        chain: entry.chain,
        action: entry.action,
        result: entry.result,
        reason: entry.reason,
        timestamp: entry.timestamp,
        previousHash: entry.previousHash,
      });
      const calculatedHash = crypto.createHash("sha256").update(dataToHash).digest("hex");

      if (calculatedHash !== entry.hash) {
        return { valid: false, brokenAt: i };
      }

      previousHash = entry.hash;
    }

    return { valid: true };
  }

  /**
   * Get entry by ID
   */
  static get(id: string): ProvenanceEntry | undefined {
    return this.entries.find(e => e.id === id);
  }

  /**
   * Get recent entries
   */
  static getRecent(count: number = 100): ProvenanceEntry[] {
    return this.entries.slice(-count);
  }

  /**
   * Get stats
   */
  static getStats(): {
    total: number;
    byResult: Record<string, number>;
    byTenant: Record<string, number>;
  } {
    const byResult: Record<string, number> = {};
    const byTenant: Record<string, number> = {};

    for (const entry of this.entries) {
      byResult[entry.result] = (byResult[entry.result] || 0) + 1;
      byTenant[entry.chain.tenantId] = (byTenant[entry.chain.tenantId] || 0) + 1;
    }

    return {
      total: this.entries.length,
      byResult,
      byTenant,
    };
  }

  /**
   * Export for persistence
   */
  static export(): { entries: ProvenanceEntry[]; lastHash: string } {
    return {
      entries: [...this.entries],
      lastHash: this.lastHash,
    };
  }

  /**
   * Import from persistence
   */
  static import(data: { entries: ProvenanceEntry[]; lastHash: string }): void {
    this.entries = data.entries;
    this.lastHash = data.lastHash;
  }
}

export const provenanceTrail = ProvenanceTrail;

