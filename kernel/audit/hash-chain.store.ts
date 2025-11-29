// audit/hash-chain.store.ts
import crypto from "node:crypto";
import { kernelContainer } from "../core/container";

export interface AuditEntry {
  tenantId: string;
  actorId: string;
  actionId: string;
  payload: unknown;
  timestamp?: Date;
}

export interface AuditLogRecord extends AuditEntry {
  id: number;
  prevHash: string;
  hash: string;
  createdAt: Date;
}

/**
 * Deterministic JSON serialization
 * Ensures same object always produces same hash
 */
function serializeDeterministic(obj: unknown): string {
  if (obj === null) return "null";
  if (obj === undefined) return "undefined";
  if (typeof obj !== "object") return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return `[${obj.map(serializeDeterministic).join(",")}]`;
  }

  const sorted = Object.keys(obj as object)
    .sort()
    .map((key) => `"${key}":${serializeDeterministic((obj as any)[key])}`)
    .join(",");

  return `{${sorted}}`;
}

/**
 * Compute SHA-256 hash of audit entry
 */
function computeHash(entry: AuditEntry, prevHash: string): string {
  const content = serializeDeterministic({
    prevHash,
    tenantId: entry.tenantId,
    actorId: entry.actorId,
    actionId: entry.actionId,
    payload: entry.payload,
    timestamp: entry.timestamp?.toISOString() || new Date().toISOString(),
  });

  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Append audit entry to hash-chain
 * Returns the hash of the new entry
 */
export async function appendAuditEntry(entry: AuditEntry): Promise<string> {
  const db = await kernelContainer.getDatabase();

  // Get previous hash for this tenant's chain
  const [prev] = await db.query<{ hash: string }>(
    `SELECT hash 
     FROM kernel_audit_log 
     WHERE tenant_id = $1 
     ORDER BY id DESC 
     LIMIT 1`,
    [entry.tenantId]
  );

  const prevHash = prev?.hash || "GENESIS";
  const timestamp = entry.timestamp || new Date();
  const hash = computeHash({ ...entry, timestamp }, prevHash);

  await db.query(
    `INSERT INTO kernel_audit_log 
       (tenant_id, actor_id, action_id, payload, prev_hash, hash, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      entry.tenantId,
      entry.actorId,
      entry.actionId,
      JSON.stringify(entry.payload),
      prevHash,
      hash,
      timestamp,
    ]
  );

  return hash;
}

/**
 * Verify integrity of audit chain for a tenant
 * Returns { valid: boolean, errors: string[] }
 */
export async function verifyAuditChain(
  tenantId: string
): Promise<{ valid: boolean; errors: string[] }> {
  const db = await kernelContainer.getDatabase();

  const records = await db.query<AuditLogRecord>(
    `SELECT id, tenant_id as "tenantId", actor_id as "actorId", 
            action_id as "actionId", payload, prev_hash as "prevHash", 
            hash, created_at as "createdAt"
     FROM kernel_audit_log 
     WHERE tenant_id = $1 
     ORDER BY id ASC`,
    [tenantId]
  );

  const errors: string[] = [];
  let expectedPrevHash = "GENESIS";

  for (const record of records) {
    // Check 1: Previous hash links correctly
    if (record.prevHash !== expectedPrevHash) {
      errors.push(
        `Entry ${record.id}: Expected prevHash=${expectedPrevHash}, got ${record.prevHash}`
      );
    }

    // Check 2: Hash is correct for content
    const payload = JSON.parse(record.payload as any);
    const expectedHash = computeHash(
      {
        tenantId: record.tenantId,
        actorId: record.actorId,
        actionId: record.actionId,
        payload,
        timestamp: record.createdAt,
      },
      record.prevHash
    );

    if (record.hash !== expectedHash) {
      errors.push(
        `Entry ${record.id}: Hash mismatch (tampered or corrupted)`
      );
    }

    expectedPrevHash = record.hash;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get audit trail for a specific action/actor
 */
export async function getAuditTrail(filters: {
  tenantId: string;
  actorId?: string;
  actionId?: string;
  from?: Date;
  to?: Date;
  limit?: number;
}): Promise<AuditLogRecord[]> {
  const db = await kernelContainer.getDatabase();

  const conditions: string[] = ["tenant_id = $1"];
  const params: any[] = [filters.tenantId];
  let paramIndex = 2;

  if (filters.actorId) {
    conditions.push(`actor_id = $${paramIndex++}`);
    params.push(filters.actorId);
  }

  if (filters.actionId) {
    conditions.push(`action_id = $${paramIndex++}`);
    params.push(filters.actionId);
  }

  if (filters.from) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(filters.from);
  }

  if (filters.to) {
    conditions.push(`created_at <= $${paramIndex++}`);
    params.push(filters.to);
  }

  const limit = filters.limit || 100;

  return db.query<AuditLogRecord>(
    `SELECT id, tenant_id as "tenantId", actor_id as "actorId", 
            action_id as "actionId", payload, prev_hash as "prevHash", 
            hash, created_at as "createdAt"
     FROM kernel_audit_log 
     WHERE ${conditions.join(" AND ")}
     ORDER BY id DESC
     LIMIT $${paramIndex}`,
    [...params, limit]
  );
}

