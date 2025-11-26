/**
 * Types of logs emitted by the kernel.
 */
export type AuditCategory =
  | "kernel"
  | "engine"
  | "tenant"
  | "security";

export interface AuditEvent {
  id: string;
  timestamp: number;
  category: AuditCategory;
  actor: string;         // tenantId | engineName | kernel
  action: string;        // e.g. engine.action.execute
  details?: any;         // metadata / extended info
  severity: "info" | "warn" | "error" | "critical";
}

