/**
 * Audit Store
 * 
 * Writes events to kernel_audit_events table
 * Keeps ring buffer in memory for /diagz
 */

import { AuditEvent } from "./audit.types";
import { Database } from "../storage/db";
import { getConfig } from "../boot/kernel.config";

const RING_BUFFER_SIZE = 500;

export class AuditStore {
  private buffer: AuditEvent[] = [];
  private maxSize = RING_BUFFER_SIZE;

  /**
   * Push event to both ring buffer and DB
   */
  async push(event: AuditEvent): Promise<void> {
    // Always add to ring buffer (for /diagz)
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(event);

    // Persist to DB if in SUPABASE mode
    const config = getConfig();
    if (config.storageMode === "SUPABASE") {
      await this.persistToDb(event);
    }
  }

  /**
   * Push sync (for non-async contexts) - only ring buffer
   */
  pushSync(event: AuditEvent): void {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(event);

    // Fire-and-forget DB persist
    const config = getConfig();
    if (config.storageMode === "SUPABASE") {
      this.persistToDb(event).catch((err) => {
        console.error("Audit persist failed:", err);
      });
    }
  }

  /**
   * Get all from ring buffer
   */
  all(): AuditEvent[] {
    return [...this.buffer];
  }

  /**
   * Filter ring buffer
   */
  filter(category?: string, actor?: string): AuditEvent[] {
    return this.buffer.filter(
      (e) =>
        (!category || e.category === category) && (!actor || e.actor === actor)
    );
  }

  /**
   * Clear ring buffer
   */
  clear(): void {
    this.buffer = [];
  }

  /**
   * Persist to database
   */
  private async persistToDb(event: AuditEvent): Promise<void> {
    try {
      await Database.query(
        `INSERT INTO kernel_audit_events (tenant_id, category, subject, action, resource, severity, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          null, // tenant_id - can be extracted from event.actor if needed
          event.category,
          event.actor,
          event.action,
          null, // resource
          event.severity,
          JSON.stringify(event.details || {}),
        ]
      );
    } catch (err) {
      // Don't throw - audit should never break the kernel
      console.error("Audit DB write failed:", err);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Database query methods
  // ─────────────────────────────────────────────────────────

  /**
   * Query audit events from DB
   */
  async query(options: {
    tenantId?: string;
    category?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditEvent[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      // Return from ring buffer
      let results = this.buffer;
      if (options.category) {
        results = results.filter((e) => e.category === options.category);
      }
      if (options.action) {
        results = results.filter((e) => e.action === options.action);
      }
      return results.slice(-(options.limit || 100));
    }

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (options.tenantId) {
      conditions.push(`tenant_id = $${paramIndex++}`);
      params.push(options.tenantId);
    }
    if (options.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(options.category);
    }
    if (options.action) {
      conditions.push(`action = $${paramIndex++}`);
      params.push(options.action);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    const result = await Database.query<any>(
      `SELECT id, category, subject as actor, action, severity, details, created_at as timestamp
       FROM kernel_audit_events
       ${where}
       ORDER BY created_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    , params);

    return result.rows.map((row) => ({
      id: row.id.toString(),
      category: row.category,
      actor: row.actor,
      action: row.action,
      severity: row.severity,
      details: row.details,
      timestamp: new Date(row.timestamp).getTime(),
    }));
  }

  /**
   * Count audit events
   */
  async count(options: {
    tenantId?: string;
    category?: string;
    since?: Date;
  }): Promise<number> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return this.buffer.length;
    }

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (options.tenantId) {
      conditions.push(`tenant_id = $${paramIndex++}`);
      params.push(options.tenantId);
    }
    if (options.category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(options.category);
    }
    if (options.since) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(options.since.toISOString());
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await Database.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM kernel_audit_events ${where}`,
      params
    );

    return parseInt(result.rows[0]?.count || "0", 10);
  }
}

export const auditStore = new AuditStore();
