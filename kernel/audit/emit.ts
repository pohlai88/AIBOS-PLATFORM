/**
 * Audit Emit Functions
 *
 * Single entry point for emitting audit events from kernel subsystems.
 */

import type { AuthContext } from "../auth/types";
import type {
  KernelAuditEvent,
  AuditEventType,
  AuditSeverity,
  AuditCategory,
} from "./audit.types";
import { createAuditEventFromAuth, createAnonymousAuditEvent } from "./audit.types";
import { writeAuditEvent, writeAuditEventSync } from "./audit.store";
import { baseLogger, createTraceLogger } from "../observability/logger";

// ─────────────────────────────────────────────────────────────
// Main Emit Function
// ─────────────────────────────────────────────────────────────

/**
 * Emit an audit event (async, durable).
 */
export async function emitAuditEvent(event: KernelAuditEvent): Promise<void> {
  const logger = createTraceLogger(event.traceId);

  // Log to Pino (summarized)
  logger.info(
    {
      eventType: event.eventType,
      principalId: event.principalId,
      authMethod: event.principalAuthMethod,
      tenantId: event.tenantId,
      actionId: event.actionId,
      policyOutcome: event.policyOutcome,
      severity: event.severity,
    },
    "[Audit] %s",
    event.eventType,
  );

  // Write to durable store
  try {
    await writeAuditEvent(event);
  } catch (err) {
    logger.error({ err }, "[Audit] Write failed");
  }
}

/**
 * Emit an audit event (sync, fire-and-forget).
 */
export function emitAuditEventSync(event: KernelAuditEvent): void {
  baseLogger.info(
    {
      eventType: event.eventType,
      principalId: event.principalId,
      tenantId: event.tenantId,
    },
    "[Audit] %s",
    event.eventType,
  );

  writeAuditEventSync(event);
}

// ─────────────────────────────────────────────────────────────
// Auth Events
// ─────────────────────────────────────────────────────────────

export async function emitAuthSuccess(
  auth: AuthContext,
  options: {
    traceId?: string;
    ipAddress?: string;
    userAgent?: string;
  },
): Promise<void> {
  const event = createAuditEventFromAuth(auth, "auth.success", "info", {
    sourceComponent: "http",
    traceId: options.traceId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
  });
  await emitAuditEvent(event);
}

export async function emitAuthFailure(
  reason: string,
  options: {
    traceId?: string;
    ipAddress?: string;
    userAgent?: string;
  },
): Promise<void> {
  const event = createAnonymousAuditEvent("auth.failure", "warn", {
    sourceComponent: "http",
    traceId: options.traceId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    context: { reason },
  });
  await emitAuditEvent(event);
}

// ─────────────────────────────────────────────────────────────
// Policy Events
// ─────────────────────────────────────────────────────────────

export async function emitPolicyDecision(
  auth: AuthContext,
  actionId: string,
  outcome: "allow" | "deny",
  reason: string,
  options?: {
    traceId?: string;
    dataContractRef?: string;
    requiredScopes?: string[];
  },
): Promise<void> {
  const event = createAuditEventFromAuth(auth, "policy.decision", outcome === "deny" ? "warn" : "info", {
    actionId,
    policyOutcome: outcome,
    policyReason: reason,
    dataContractRef: options?.dataContractRef,
    sourceComponent: "kernel",
    traceId: options?.traceId,
    context: {
      requiredScopes: options?.requiredScopes,
    },
  });
  await emitAuditEvent(event);
}

// ─────────────────────────────────────────────────────────────
// Action Events
// ─────────────────────────────────────────────────────────────

export async function emitActionInvoked(
  auth: AuthContext,
  actionId: string,
  options?: {
    traceId?: string;
    dataContractRef?: string;
  },
): Promise<void> {
  const event = createAuditEventFromAuth(auth, "action.invoked", "info", {
    actionId,
    dataContractRef: options?.dataContractRef,
    sourceComponent: "kernel",
    traceId: options?.traceId,
  });
  await emitAuditEvent(event);
}

export async function emitActionCompleted(
  auth: AuthContext,
  actionId: string,
  options?: {
    traceId?: string;
    durationMs?: number;
  },
): Promise<void> {
  const event = createAuditEventFromAuth(auth, "action.completed", "info", {
    actionId,
    sourceComponent: "kernel",
    traceId: options?.traceId,
    context: {
      durationMs: options?.durationMs,
    },
  });
  await emitAuditEvent(event);
}

export async function emitActionFailed(
  auth: AuthContext,
  actionId: string,
  errorType: string,
  options?: {
    traceId?: string;
    errorMessage?: string;
  },
): Promise<void> {
  const event = createAuditEventFromAuth(auth, "action.failed", "error", {
    actionId,
    sourceComponent: "kernel",
    traceId: options?.traceId,
    context: {
      errorType,
      errorMessage: options?.errorMessage,
    },
  });
  await emitAuditEvent(event);
}

// ─────────────────────────────────────────────────────────────
// Security Events
// ─────────────────────────────────────────────────────────────

export async function emitSecurityViolation(
  auth: AuthContext | null,
  violationType: string,
  options?: {
    traceId?: string;
    ipAddress?: string;
    details?: Record<string, unknown>;
  },
): Promise<void> {
  const event = auth
    ? createAuditEventFromAuth(auth, "security.violation", "critical", {
        sourceComponent: "security",
        traceId: options?.traceId,
        ipAddress: options?.ipAddress,
        context: {
          violationType,
          ...options?.details,
        },
      })
    : createAnonymousAuditEvent("security.violation", "critical", {
        sourceComponent: "security",
        traceId: options?.traceId,
        ipAddress: options?.ipAddress,
        context: {
          violationType,
          ...options?.details,
        },
      });
  await emitAuditEvent(event);
}

// ─────────────────────────────────────────────────────────────
// Legacy Emit Functions (backward compatibility)
// ─────────────────────────────────────────────────────────────

import { logAudit } from "./audit-logger";

export function emitKernelEvent(action: string, details?: unknown): void {
  logAudit({
    category: "kernel",
    actor: "kernel",
    severity: "info",
    action,
    details,
  });
}

export function emitEngineEvent(engine: string, action: string, details?: unknown): void {
  logAudit({
    category: "engine",
    actor: engine,
    severity: "info",
    action,
    details,
  });
}

export function emitTenantEvent(tenantId: string, action: string, details?: unknown): void {
  logAudit({
    category: "tenant",
    actor: tenantId,
    severity: "info",
    action,
    details,
  });
}
