/**
 * Audit Schema
 */

import { z } from "zod";

export const AuditCategoryEnum = z.enum(["kernel", "engine", "tenant", "security"]);

export const AuditSeverityEnum = z.enum(["info", "warn", "error", "critical"]);

export const ZAuditEvent = z.object({
  id: z.number().int().positive(),
  tenantId: z.string().uuid().nullable(),
  category: AuditCategoryEnum.default("kernel"),
  subject: z.string().nullable(),
  action: z.string().min(1),
  resource: z.string().nullable(),
  severity: AuditSeverityEnum.default("info"),
  details: z.record(z.any()).nullable(),
  createdAt: z.date(),
});

export const ZCreateAuditEvent = ZAuditEvent.omit({
  id: true,
  createdAt: true,
});

export type AuditCategory = z.infer<typeof AuditCategoryEnum>;
export type AuditSeverity = z.infer<typeof AuditSeverityEnum>;
export type AuditEvent = z.infer<typeof ZAuditEvent>;
export type CreateAuditEvent = z.infer<typeof ZCreateAuditEvent>;

