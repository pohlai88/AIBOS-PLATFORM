// events/event-types.ts
/**
 * Canonical Event Types for AI-BOS Kernel
 * 
 * The Event Bus is the nervous system of the kernel.
 * All kernel subsystems communicate via typed events for:
 * - Loose coupling
 * - Audit trail completeness
 * - AI Guardian observability
 * - Self-healing capabilities
 * - Workflow orchestration
 */

/**
 * All kernel events (discriminated union)
 */
export type KernelEvent =
  | AuditEvent
  | WorkflowEvent
  | DomainEvent
  | AutomationEvent
  | AiEvent
  | SystemEvent;

/**
 * Audit & Security Events
 */
export type AuditEvent =
  | "audit.entry.appended"
  | "audit.chain.tampered"
  | "audit.chain.verified"
  | "security.permission.denied"
  | "security.token.rotated"
  | "security.secret.rotated"
  | "security.secret.promoted"
  | "security.secret.rotation.requested"
  | "security.secret.rotation_failed"
  | "security.secret.stale_warning"
  | "security.simulation.completed";

/**
 * Workflow & Saga Events
 */
export type WorkflowEvent =
  | "workflow.saga.started"
  | "workflow.saga.step.started"
  | "workflow.saga.step.completed"
  | "workflow.saga.step.failed"
  | "workflow.saga.compensation.started"
  | "workflow.saga.compensation.completed"
  | "workflow.saga.completed"
  | "workflow.saga.failed";

/**
 * Domain Events (Business Logic)
 */
export type DomainEvent =
  | "journal.entry.created"
  | "journal.entry.updated"
  | "invoice.generated"
  | "invoice.sent"
  | "metadata.entity.created"
  | "metadata.entity.updated"
  | "metadata.entity.deleted"
  | "metadata.migration.plan_created"
  | "metadata.migration.phase_started"
  | "metadata.migration.phase_completed"
  | "metadata.migration.phase_executed"
  | "metadata.migration.completed"
  | "metadata.migration.failed"
  | "metadata.migration.drift_detected"
  | "contract.created"
  | "contract.updated"
  | "contract.deprecated"
  | "engine.registered"
  | "engine.unregistered";

/**
 * Automation & Trigger Events
 */
export type AutomationEvent =
  | "automation.trigger.fired"
  | "automation.task.started"
  | "automation.task.completed"
  | "automation.task.failed";

/**
 * AI Guardian Events
 */
export type AiEvent =
  | "ai.guardian.decision"
  | "ai.schema.review.started"
  | "ai.schema.review.completed"
  | "ai.validation.override"
  | "ai.prediction.generated"
  | "ai.drift.detected"
  | "ai.healing.applied";

/**
 * System & Kernel Events
 */
export type SystemEvent =
  | "kernel.booted"
  | "kernel.shutdown"
  | "kernel.info"
  | "kernel.warn"
  | "kernel.error"
  | "kernel.health.check"
  | "action.dispatched"
  | "action.completed"
  | "action.failed";

/**
 * Event payload base interface
 */
export interface EventPayload<T = unknown> {
  /** Event type (for discrimination) */
  type: KernelEvent;

  /** Tenant ID (for multi-tenant isolation) */
  tenantId?: string | null;

  /** Actor/User ID (who triggered the event) */
  actorId?: string;

  /** Timestamp (ISO string or epoch ms) */
  timestamp?: string | number;

  /** Trace ID (for distributed tracing) */
  traceId?: string;

  /** Correlation ID (for request correlation) */
  correlationId?: string;

  /** Event-specific payload */
  payload: T;
}

/**
 * Dead Letter Queue Entry
 */
export interface DeadLetterEntry {
  /** Failed event */
  event: KernelEvent;

  /** Event payload */
  payload: unknown;

  /** Error that caused failure */
  error: Error;

  /** Timestamp of failure */
  failedAt: Date;

  /** Number of retry attempts */
  retries: number;
}

