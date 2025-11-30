/**
 * Audit Store
 *
 * Durable audit storage with Postgres + in-memory ring buffer.
 * Append-only semantics enforced by DB triggers.
 */

import type { AuditEvent, KernelAuditEvent } from "./audit.types";
import { getDB } from "../storage/db";
import { getConfig } from "../boot/kernel.config";
import { baseLogger } from "../observability/logger";

const RING_BUFFER_SIZE = 5000;

// ─────────────────────────────────────────────────────────────
// Ring Buffer (for /diagz and fast access)
// ─────────────────────────────────────────────────────────────

interface RingBufferItem {
  id?: string;
  createdAt: Date;
  event: KernelAuditEvent;
}

const ringBuffer: RingBufferItem[] = [];
let ringIndex = 0;
let ringFilled = false;

function pushToRingBuffer(event: KernelAuditEvent, id?: string): void {
  const item: RingBufferItem = {
    id,
    createdAt: new Date(),
    event,
  };
  ringBuffer[ringIndex] = item;
  ringIndex = (ringIndex + 1) % RING_BUFFER_SIZE;
  if (ringIndex === 0) ringFilled = true;
}

// ─────────────────────────────────────────────────────────────
// Write Functions
// ─────────────────────────────────────────────────────────────

/**
 * Write audit event to Postgres (durable) + ring buffer.
 */
export async function writeAuditEvent(event: KernelAuditEvent): Promise<void> {
  const config = getConfig();

  // Always push to ring buffer
  let insertedId: string | undefined;

  // Persist to DB if in SUPABASE mode
  if (config.storageMode === "SUPABASE") {
    try {
      const db = getDB().getClient();

      const res = await db.query<{ id: string }>(
        `
        INSERT INTO kernel_audit_events (
          tenant_id,
          principal_id,
          principal_auth_method,
          principal_roles,
          principal_scopes,
          event_type,
          category,
          severity,
          action_id,
          data_contract_ref,
          policy_outcome,
          policy_reason,
          source_component,
          trace_id,
          request_id,
          ip_address,
          user_agent,
          correlation_id,
          details,
          action,
          subject
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18,
          $19, $20, $21
        )
        RETURNING id
        `,
        [
          event.tenantId,
          event.principalId,
          event.principalAuthMethod,
          event.principalRoles,
          event.principalScopes,
          event.eventType,
          event.category,
          event.severity,
          event.actionId ?? null,
          event.dataContractRef ?? null,
          event.policyOutcome ?? null,
          event.policyReason ?? null,
          event.sourceComponent ?? null,
          event.traceId ?? null,
          event.requestId ?? null,
          event.ipAddress ?? null,
          event.userAgent ?? null,
          event.correlationId ?? null,
          event.context ? JSON.stringify(event.context) : "{}",
          event.actionId ?? event.eventType, // legacy action column
          event.principalId, // legacy subject column
        ],
      );

      insertedId = res.rows[0]?.id?.toString();
    } catch (err) {
      // Never break the kernel for audit failures
      baseLogger.error({ err, event }, "[AuditStore] DB write failed");
    }
  }

  pushToRingBuffer(event, insertedId);
}

/**
 * Write audit event synchronously (fire-and-forget DB persist).
 */
export function writeAuditEventSync(event: KernelAuditEvent): void {
  pushToRingBuffer(event);

  const config = getConfig();
  if (config.storageMode === "SUPABASE") {
    writeAuditEvent(event).catch((err) => {
      baseLogger.error({ err }, "[AuditStore] Async write failed");
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Read Functions
// ─────────────────────────────────────────────────────────────

/**
 * Get recent audit events from ring buffer.
 */
export function getRecentAuditEvents(limit = 100): RingBufferItem[] {
  const items: RingBufferItem[] = [];
  const total = ringFilled ? RING_BUFFER_SIZE : ringIndex;
  if (total === 0) return items;

  const start = (ringFilled ? ringIndex : ringIndex) - 1;
  for (let i = 0; i < Math.min(limit, total); i++) {
    const idx = (start - i + RING_BUFFER_SIZE) % RING_BUFFER_SIZE;
    const item = ringBuffer[idx];
    if (item) items.push(item);
  }

  return items;
}

/**
 * Query audit events from DB.
 */
export async function queryAuditEvents(options: {
  tenantId?: string;
  eventType?: string;
  actionId?: string;
  principalId?: string;
  policyOutcome?: string;
  since?: Date;
  limit?: number;
  offset?: number;
}): Promise<KernelAuditEvent[]> {
  const config = getConfig();

  if (config.storageMode !== "SUPABASE") {
    // Return from ring buffer
    let results = getRecentAuditEvents(options.limit ?? 100);
    if (options.eventType) {
      results = results.filter((r) => r.event.eventType === options.eventType);
    }
    if (options.actionId) {
      results = results.filter((r) => r.event.actionId === options.actionId);
    }
    return results.map((r) => r.event);
  }

  const db = getDB().getClient();
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (options.tenantId) {
    conditions.push(`tenant_id = $${paramIndex++}`);
    params.push(options.tenantId);
  }
  if (options.eventType) {
    conditions.push(`event_type = $${paramIndex++}`);
    params.push(options.eventType);
  }
  if (options.actionId) {
    conditions.push(`action_id = $${paramIndex++}`);
    params.push(options.actionId);
  }
  if (options.principalId) {
    conditions.push(`principal_id = $${paramIndex++}`);
    params.push(options.principalId);
  }
  if (options.policyOutcome) {
    conditions.push(`policy_outcome = $${paramIndex++}`);
    params.push(options.policyOutcome);
  }
  if (options.since) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(options.since.toISOString());
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = options.limit ?? 100;
  const offset = options.offset ?? 0;

  const res = await db.query<any>(
    `
    SELECT
      tenant_id as "tenantId",
      principal_id as "principalId",
      principal_auth_method as "principalAuthMethod",
      principal_roles as "principalRoles",
      principal_scopes as "principalScopes",
      event_type as "eventType",
      category,
      severity,
      action_id as "actionId",
      data_contract_ref as "dataContractRef",
      policy_outcome as "policyOutcome",
      policy_reason as "policyReason",
      source_component as "sourceComponent",
      trace_id as "traceId",
      request_id as "requestId",
      ip_address as "ipAddress",
      user_agent as "userAgent",
      correlation_id as "correlationId",
      details as context,
      created_at
    FROM kernel_audit_events
    ${where}
    ORDER BY created_at DESC
    LIMIT ${limit} OFFSET ${offset}
    `,
    params,
  );

  return res.rows;
}

/**
 * Count audit events.
 */
export async function countAuditEvents(options: {
  tenantId?: string;
  eventType?: string;
  since?: Date;
}): Promise<number> {
  const config = getConfig();

  if (config.storageMode !== "SUPABASE") {
    return ringFilled ? RING_BUFFER_SIZE : ringIndex;
  }

  const db = getDB().getClient();
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (options.tenantId) {
    conditions.push(`tenant_id = $${paramIndex++}`);
    params.push(options.tenantId);
  }
  if (options.eventType) {
    conditions.push(`event_type = $${paramIndex++}`);
    params.push(options.eventType);
  }
  if (options.since) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(options.since.toISOString());
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const res = await db.query<{ count: string }>(
    `SELECT COUNT(*) as count FROM kernel_audit_events ${where}`,
    params,
  );

  return parseInt(res.rows[0]?.count ?? "0", 10);
}

// ─────────────────────────────────────────────────────────────
// Legacy AuditStore class (backward compatibility)
// ─────────────────────────────────────────────────────────────

export class AuditStore {
  private buffer: AuditEvent[] = [];
  private maxSize = 500;

  async push(event: AuditEvent): Promise<void> {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(event);

    // Convert to new format and persist
    const kernelEvent: KernelAuditEvent = {
      tenantId: null,
      principalId: event.actor,
      principalAuthMethod: "internal",
      principalRoles: [],
      principalScopes: [],
      eventType: "system.event",
      severity: event.severity,
      category: event.category,
      actionId: event.action,
      context: event.details as Record<string, unknown>,
    };

    await writeAuditEvent(kernelEvent);
  }

  pushSync(event: AuditEvent): void {
    if (this.buffer.length >= this.maxSize) {
      this.buffer.shift();
    }
    this.buffer.push(event);

    const kernelEvent: KernelAuditEvent = {
      tenantId: null,
      principalId: event.actor,
      principalAuthMethod: "internal",
      principalRoles: [],
      principalScopes: [],
      eventType: "system.event",
      severity: event.severity,
      category: event.category,
      actionId: event.action,
      context: event.details as Record<string, unknown>,
    };

    writeAuditEventSync(kernelEvent);
  }

  all(): AuditEvent[] {
    return [...this.buffer];
  }

  filter(category?: string, actor?: string): AuditEvent[] {
    return this.buffer.filter(
      (e) =>
        (!category || e.category === category) && (!actor || e.actor === actor),
    );
  }

  clear(): void {
    this.buffer = [];
  }
}

export const auditStore = new AuditStore();
