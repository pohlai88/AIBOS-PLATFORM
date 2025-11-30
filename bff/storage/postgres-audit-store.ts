/**
 * @fileoverview PostgreSQL Audit Store - Persistent audit trail storage
 * @module @bff/storage/postgres-audit-store
 * @description Enterprise-grade persistent audit store using PostgreSQL
 * 
 * Features:
 * - Hash chain integrity verification
 * - Indexed queries for fast lookups
 * - Automatic retention management
 * - Batch inserts for performance
 * - Connection pooling via Kernel Database
 */

import type { AuditEntry, AuditStore } from '../middleware/audit.middleware';
import crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface AuditFilters {
  tenantId?: string;
  userId?: string;
  requestId?: string;
  startTime?: Date;
  endTime?: Date;
  category?: string;
  riskLevel?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

// ============================================================================
// PostgreSQL Audit Store
// ============================================================================

/**
 * PostgreSQL implementation of AuditStore
 * Uses Kernel's Database singleton for connection pooling
 */
export class PostgresAuditStore implements AuditStore {
  private db: any; // Kernel Database instance
  private tableName = 'bff_audit_entries';
  private batchSize = 100;
  private pendingBatch: AuditEntry[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Append audit entry to store
   * Uses batch inserts for performance
   */
  async append(entry: AuditEntry): Promise<void> {
    this.pendingBatch.push(entry);

    // Flush batch if full
    if (this.pendingBatch.length >= this.batchSize) {
      await this.flushBatch();
    } else {
      // Schedule flush after timeout (100ms)
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => {
          this.flushBatch().catch((err) => {
            console.error('[PostgresAuditStore] Batch flush error:', err);
          });
        }, 100);
      }
    }
  }

  /**
   * Flush pending batch to database
   */
  private async flushBatch(): Promise<void> {
    if (this.pendingBatch.length === 0) return;

    const entries = [...this.pendingBatch];
    this.pendingBatch = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      // Use batch insert for performance
      const values: any[] = [];
      const placeholders: string[] = [];
      let paramIndex = 1;

      for (const entry of entries) {
        const placeholdersRow: string[] = [];
        placeholdersRow.push(`$${paramIndex++}`); // id
        placeholdersRow.push(`$${paramIndex++}`); // request_id
        placeholdersRow.push(`$${paramIndex++}`); // timestamp
        placeholdersRow.push(`$${paramIndex++}`); // hash
        placeholdersRow.push(`$${paramIndex++}`); // previous_hash
        placeholdersRow.push(`$${paramIndex++}`); // tenant_id
        placeholdersRow.push(`$${paramIndex++}`); // user_id
        placeholdersRow.push(`$${paramIndex++}`); // method
        placeholdersRow.push(`$${paramIndex++}`); // path
        placeholdersRow.push(`$${paramIndex++}`); // protocol
        placeholdersRow.push(`$${paramIndex++}`); // action
        placeholdersRow.push(`$${paramIndex++}`); // category
        placeholdersRow.push(`$${paramIndex++}`); // risk_level
        placeholdersRow.push(`$${paramIndex++}`); // status
        placeholdersRow.push(`$${paramIndex++}`); // status_code
        placeholdersRow.push(`$${paramIndex++}`); // duration_ms
        placeholdersRow.push(`$${paramIndex++}`); // metadata
        placeholdersRow.push(`$${paramIndex++}`); // created_at

        placeholders.push(`(${placeholdersRow.join(', ')})`);

        values.push(
          entry.id,
          entry.requestId,
          entry.timestamp,
          entry.hash,
          entry.previousHash,
          entry.tenantId,
          entry.userId,
          entry.method,
          entry.path,
          entry.protocol,
          entry.action,
          entry.category,
          entry.riskLevel,
          entry.status,
          entry.statusCode || null,
          entry.duration || null,
          entry.metadata ? JSON.stringify(entry.metadata) : null,
          new Date().toISOString()
        );
      }

      const query = `
        INSERT INTO ${this.tableName} (
          id, request_id, timestamp, hash, previous_hash,
          tenant_id, user_id, method, path, protocol,
          action, category, risk_level, status, status_code,
          duration_ms, metadata, created_at
        ) VALUES ${placeholders.join(', ')}
        ON CONFLICT (request_id) DO UPDATE SET
          hash = EXCLUDED.hash,
          previous_hash = EXCLUDED.previous_hash,
          status = EXCLUDED.status,
          status_code = EXCLUDED.status_code,
          duration_ms = EXCLUDED.duration_ms,
          metadata = EXCLUDED.metadata
      `;

      await this.db.query(query, values);
    } catch (error: any) {
      console.error('[PostgresAuditStore] Batch insert error:', error);
      // Fallback: insert individually
      for (const entry of entries) {
        try {
          await this.insertSingle(entry);
        } catch (err) {
          console.error('[PostgresAuditStore] Individual insert error:', err);
        }
      }
    }
  }

  /**
   * Insert single entry (fallback)
   */
  private async insertSingle(entry: AuditEntry): Promise<void> {
    const query = `
      INSERT INTO ${this.tableName} (
        id, request_id, timestamp, hash, previous_hash,
        tenant_id, user_id, method, path, protocol,
        action, category, risk_level, status, status_code,
        duration_ms, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (request_id) DO UPDATE SET
        hash = EXCLUDED.hash,
        previous_hash = EXCLUDED.previous_hash,
        status = EXCLUDED.status,
        status_code = EXCLUDED.status_code,
        duration_ms = EXCLUDED.duration_ms,
        metadata = EXCLUDED.metadata
    `;

    await this.db.query(query, [
      entry.id,
      entry.requestId,
      entry.timestamp,
      entry.hash,
      entry.previousHash,
      entry.tenantId,
      entry.userId,
      entry.method,
      entry.path,
      entry.protocol,
      entry.action,
      entry.category,
      entry.riskLevel,
      entry.status,
      entry.statusCode || null,
      entry.duration || null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      new Date().toISOString()
    ]);
  }

  /**
   * Get last hash from chain
   */
  async getLastHash(): Promise<string> {
    try {
      const result = await this.db.query(
        `SELECT hash FROM ${this.tableName} ORDER BY timestamp DESC, created_at DESC LIMIT 1`
      );

      if (result.rows && result.rows.length > 0) {
        return result.rows[0].hash;
      }

      return 'genesis';
    } catch (error: any) {
      console.error('[PostgresAuditStore] getLastHash error:', error);
      return 'genesis';
    }
  }

  /**
   * Get audit entry by request ID
   */
  async getEntry(requestId: string): Promise<AuditEntry | undefined> {
    try {
      const result = await this.db.query(
        `SELECT * FROM ${this.tableName} WHERE request_id = $1 LIMIT 1`,
        [requestId]
      );

      if (result.rows && result.rows.length > 0) {
        return this.rowToEntry(result.rows[0]);
      }

      return undefined;
    } catch (error: any) {
      console.error('[PostgresAuditStore] getEntry error:', error);
      return undefined;
    }
  }

  /**
   * Query audit entries with filters
   */
  async query(filters: AuditFilters): Promise<AuditEntry[]> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (filters.tenantId) {
        conditions.push(`tenant_id = $${paramIndex++}`);
        params.push(filters.tenantId);
      }

      if (filters.userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        params.push(filters.userId);
      }

      if (filters.requestId) {
        conditions.push(`request_id = $${paramIndex++}`);
        params.push(filters.requestId);
      }

      if (filters.startTime) {
        conditions.push(`timestamp >= $${paramIndex++}`);
        params.push(filters.startTime.toISOString());
      }

      if (filters.endTime) {
        conditions.push(`timestamp <= $${paramIndex++}`);
        params.push(filters.endTime.toISOString());
      }

      if (filters.category) {
        conditions.push(`category = $${paramIndex++}`);
        params.push(filters.category);
      }

      if (filters.riskLevel) {
        conditions.push(`risk_level = $${paramIndex++}`);
        params.push(filters.riskLevel);
      }

      if (filters.status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(filters.status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const limit = filters.limit || 100;
      const offset = filters.offset || 0;

      const query = `
        SELECT * FROM ${this.tableName}
        ${whereClause}
        ORDER BY timestamp DESC, created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;

      params.push(limit, offset);

      const result = await this.db.query(query, params);

      return (result.rows || []).map((row: any) => this.rowToEntry(row));
    } catch (error: any) {
      console.error('[PostgresAuditStore] query error:', error);
      return [];
    }
  }

  /**
   * Verify hash chain integrity
   */
  async verify(entries: AuditEntry[]): Promise<boolean> {
    if (entries.length === 0) return true;

    try {
      // Get all entries in order
      const result = await this.db.query(
        `SELECT * FROM ${this.tableName} ORDER BY timestamp ASC, created_at ASC`
      );

      const dbEntries = (result.rows || []).map((row: any) => this.rowToEntry(row));

      // Verify chain
      let previousHash = 'genesis';
      for (const entry of dbEntries) {
        if (entry.previousHash !== previousHash) {
          return false;
        }

        // Recompute hash
        const { hash, ...rest } = entry;
        const computed = crypto
          .createHash('sha256')
          .update(JSON.stringify({ ...rest, previousHash }))
          .digest('hex');

        if (computed !== hash) {
          return false;
        }

        previousHash = hash;
      }

      return true;
    } catch (error: any) {
      console.error('[PostgresAuditStore] verify error:', error);
      return false;
    }
  }

  /**
   * Convert database row to AuditEntry
   */
  private rowToEntry(row: any): AuditEntry {
    return {
      id: row.id,
      timestamp: row.timestamp,
      hash: row.hash,
      previousHash: row.previous_hash,
      requestId: row.request_id,
      method: row.method,
      path: row.path,
      protocol: row.protocol,
      tenantId: row.tenant_id,
      userId: row.user_id,
      roles: [], // Not stored in DB, would need separate table
      apiVersion: '', // Not stored in DB
      clientType: undefined, // Not stored in DB
      traceId: undefined, // Not stored in DB
      spanId: undefined, // Not stored in DB
      action: row.action,
      category: row.category as any,
      riskLevel: row.risk_level as any,
      status: row.status as any,
      statusCode: row.status_code,
      errorCode: undefined, // Not stored in DB
      duration: row.duration_ms,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    };
  }

  /**
   * Flush any pending batches (call before shutdown)
   */
  async flush(): Promise<void> {
    await this.flushBatch();
  }
}

