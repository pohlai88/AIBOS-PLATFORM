/**
 * Audit Types
 *
 * Core types for the kernel audit system.
 */

import type { AuthContext } from "../auth/types";

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export type AuditSeverity = "info" | "warn" | "error" | "critical";

export type AuditEventType =
  | "auth.success"
  | "auth.failure"
  | "action.invoked"
  | "action.completed"
  | "action.failed"
  | "policy.decision"
  | "security.violation"
  | "security.anomaly"
  | "engine.loaded"
  | "engine.failed"
  | "tenant.created"
  | "tenant.updated"
  | "system.startup"
  | "system.shutdown"
  | "system.event";

export type AuditCategory = "kernel" | "engine" | "tenant" | "security" | "auth" | "policy" | "action";

// ─────────────────────────────────────────────────────────────
// Audit Event (Rich)
// ─────────────────────────────────────────────────────────────

/**
 * Rich audit event with full principal and policy context.
 * This is the primary type for new audit events.
 */
export interface KernelAuditEvent {
  // Tenant and principal
  tenantId: string | null;
  principalId: string;
  principalAuthMethod: string;
  principalRoles: string[];
  principalScopes: string[];

  // Event classification
  eventType: AuditEventType;
  severity: AuditSeverity;
  category: AuditCategory;

  // Action context
  actionId?: string;
  dataContractRef?: string;

  // Policy context
  policyOutcome?: "allow" | "deny";
  policyReason?: string;

  // Source
  sourceComponent?: string;

  // Correlation
  traceId?: string;
  requestId?: string;
  correlationId?: string;

  // Network info
  ipAddress?: string;
  userAgent?: string;

  // Additional context
  context?: Record<string, unknown>;
}

/**
 * Legacy audit event type (for backward compatibility)
 */
export interface AuditEvent {
  id: string;
  timestamp: number;
  category: AuditCategory;
  actor: string;
  action: string;
  details?: unknown;
  severity: AuditSeverity;
}

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

/**
 * Create a KernelAuditEvent from AuthContext
 */
export function createAuditEventFromAuth(
  auth: AuthContext,
  eventType: AuditEventType,
  severity: AuditSeverity,
  options?: Partial<KernelAuditEvent>,
): KernelAuditEvent {
  return {
    tenantId: auth.tenantId,
    principalId: auth.principal?.subject ?? "anonymous",
    principalAuthMethod: auth.tokenType,
    principalRoles: auth.roles,
    principalScopes: auth.scopes,
    eventType,
    severity,
    category: eventType.split(".")[0] as AuditCategory,
    ...options,
  };
}

/**
 * Create anonymous audit event (for unauthenticated contexts)
 */
export function createAnonymousAuditEvent(
  eventType: AuditEventType,
  severity: AuditSeverity,
  options?: Partial<KernelAuditEvent>,
): KernelAuditEvent {
  return {
    tenantId: null,
    principalId: "anonymous",
    principalAuthMethod: "anonymous",
    principalRoles: [],
    principalScopes: [],
    eventType,
    severity,
    category: eventType.split(".")[0] as AuditCategory,
    ...options,
  };
}
