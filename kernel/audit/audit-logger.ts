/**
 * Audit Logger (Class-based)
 * 
 * Zod-validated audit logging with DB persistence
 * Trace-aware for full observability
 */

import { Database } from "../storage/db";
import { getConfig } from "../boot/kernel.config";
import { ZAuditEvent, AuditEvent } from "../contracts/schemas";
import { auditStore } from "./audit.store";
import { createTraceLogger } from "../observability/logger";
import { randomUUID } from "crypto";

export type AuditLogInput = {
  tenantId: string | null;
  subject: string | null;
  action: string;
  resource?: string | null;
  details?: Record<string, unknown> | null;
  severity?: "info" | "warn" | "error" | "critical";
  category?: "kernel" | "engine" | "tenant" | "security";
};

export class AuditLogger {
  /**
   * Log an audit event (DB + in-memory buffer)
   */
  async log(input: AuditLogInput): Promise<AuditEvent> {
    const traceId = (input.details?.traceId as string | undefined) ?? undefined;
    const logger = createTraceLogger(traceId);
    const config = getConfig();
    const now = new Date();

    try {
      if (config.storageMode === "SUPABASE") {
        const result = await Database.query<any>(
          `
          INSERT INTO kernel_audit_events
            (tenant_id, category, subject, action, resource, severity, details)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING
            id,
            tenant_id as "tenantId",
            category,
            subject,
            action,
            resource,
            severity,
            details,
            created_at as "createdAt"
          `,
          [
            input.tenantId,
            input.category ?? "kernel",
            input.subject,
            input.action,
            input.resource ?? null,
            input.severity ?? "info",
            input.details ? JSON.stringify(input.details) : null,
          ]
        );

        const row = result.rows[0];
        return ZAuditEvent.parse({
          ...row,
          createdAt: new Date(row.createdAt),
        });
      } else {
        // In-memory mode: use audit store
        const event: AuditEvent = {
          id: Math.floor(Math.random() * 1000000),
          tenantId: input.tenantId,
          category: input.category ?? "kernel",
          subject: input.subject,
          action: input.action,
          resource: input.resource ?? null,
          severity: input.severity ?? "info",
          details: input.details ?? null,
          createdAt: now,
        };

        // Also push to in-memory buffer for /diagz
        auditStore.push({
          id: randomUUID(),
          timestamp: now.getTime(),
          category: input.category ?? "kernel",
          actor: input.subject ?? "unknown",
          action: input.action,
          severity: input.severity ?? "info",
          details: input.details,
        });

        return event;
      }
    } catch (err) {
      logger.error({ err, input }, "[AuditLogger] Failed to persist audit event");
      throw err;
    }
  }
}

// Singleton instance
export const auditLogger = new AuditLogger();
