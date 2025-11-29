/**
 * Workflow Types for AI-BOS Kernel
 * 
 * Defines all types for saga orchestration:
 * - SagaDefinition, SagaStep
 * - WorkflowContext
 * - SagaResult, StepResult
 * - RetryPolicy, CompensationResult
 * 
 * @module workflows/workflow.types
 */

import type { KernelEvent } from '../events/event-types';

// ─────────────────────────────────────────────────────────────
// Context Types
// ─────────────────────────────────────────────────────────────

/**
 * Workflow execution context (injected into every step)
 */
export interface WorkflowContext {
    /** Tenant identifier for multi-tenant isolation */
    tenantId: string;

    /** Actor (user/system) executing the workflow */
    actorId: string;

    /** Unique correlation ID for tracing */
    correlationId: string;

    /** Distributed trace ID (optional) */
    traceId?: string;

    /** Workflow start timestamp */
    startedAt: Date;

    /** Additional metadata */
    metadata?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
// Retry Policy
// ─────────────────────────────────────────────────────────────

/**
 * Retry policy for step execution
 */
export interface RetryPolicy {
    /** Maximum retry attempts */
    maxRetries: number;

    /** Initial delay in milliseconds */
    initialDelayMs: number;

    /** Maximum delay cap in milliseconds */
    maxDelayMs: number;

    /** Backoff multiplier (e.g., 2 for exponential) */
    backoffMultiplier: number;

    /** Retryable error codes (empty = all errors) */
    retryableErrors?: string[];
}

/**
 * Default retry policy
 */
export const DEFAULT_RETRY_POLICY: RetryPolicy = {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
};

// ─────────────────────────────────────────────────────────────
// Saga Step Types
// ─────────────────────────────────────────────────────────────

/**
 * Saga step definition
 */
export interface SagaStep<TInput = unknown, TOutput = unknown> {
    /** Unique step identifier */
    id: string;

    /** Human-readable step name */
    name: string;

    /** Step description */
    description?: string;

    /** Forward execution function */
    execute: (input: TInput, ctx: WorkflowContext) => Promise<TOutput>;

    /** Compensation (rollback) function - optional */
    compensate?: (input: TInput, ctx: WorkflowContext) => Promise<void>;

    /** Step-level retry policy override */
    retryPolicy?: RetryPolicy;

    /** Step timeout in milliseconds */
    timeout?: number;

    /** Whether this step is idempotent */
    idempotent?: boolean;
}

/**
 * Step execution status
 */
export type StepStatus =
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'compensating'
    | 'compensated'
    | 'skipped';

/**
 * Step execution result
 */
export interface StepResult {
    /** Step identifier */
    stepId: string;

    /** Step name */
    stepName: string;

    /** Execution status */
    status: StepStatus;

    /** Step output (if completed) */
    output?: unknown;

    /** Error details (if failed) */
    error?: StepError;

    /** Execution start time */
    startedAt: Date;

    /** Execution end time */
    completedAt?: Date;

    /** Duration in milliseconds */
    duration?: number;

    /** Number of retries attempted */
    retries: number;
}

/**
 * Step error details
 */
export interface StepError {
    code: string;
    message: string;
    stack?: string;
    retryable: boolean;
}

// ─────────────────────────────────────────────────────────────
// Saga Definition Types
// ─────────────────────────────────────────────────────────────

/**
 * Saga definition
 */
export interface SagaDefinition<TInput = unknown, TOutput = unknown> {
    /** Unique saga identifier */
    id: string;

    /** Human-readable saga name */
    name: string;

    /** Saga version (semver) */
    version: string;

    /** Saga description */
    description?: string;

    /** Ordered list of steps */
    steps: SagaStep<unknown, unknown>[];

    /** Global retry policy */
    retryPolicy?: RetryPolicy;

    /** Global timeout in milliseconds */
    timeout?: number;

    /** Input schema (Zod) - optional */
    inputSchema?: unknown;

    /** Output schema (Zod) - optional */
    outputSchema?: unknown;
}

/**
 * Saga execution status
 */
export type SagaStatus =
    | 'pending'
    | 'running'
    | 'completed'
    | 'failed'
    | 'compensating'
    | 'compensated';

/**
 * Saga execution result
 */
export interface SagaResult<TOutput = unknown> {
    /** Unique saga execution ID */
    sagaId: string;

    /** Saga definition ID */
    definitionId: string;

    /** Execution status */
    status: SagaStatus;

    /** Final output (if completed) */
    output?: TOutput;

    /** Error details (if failed) */
    error?: SagaError;

    /** All step results */
    steps: StepResult[];

    /** Execution start time */
    startedAt: Date;

    /** Execution end time */
    completedAt: Date;

    /** Total duration in milliseconds */
    duration: number;
}

/**
 * Saga error details
 */
export interface SagaError {
    /** Error code */
    code: string;

    /** Error message */
    message: string;

    /** Step that caused the failure */
    failedStepId: string;

    /** Compensation status */
    compensationStatus: 'completed' | 'partial' | 'failed' | 'none';

    /** Successfully compensated steps */
    compensatedSteps: string[];

    /** Steps that failed compensation */
    failedCompensations: string[];
}

// ─────────────────────────────────────────────────────────────
// Compensation Types
// ─────────────────────────────────────────────────────────────

/**
 * Compensation result
 */
export interface CompensationResult {
    /** Overall compensation status */
    status: 'completed' | 'partial' | 'failed';

    /** Successfully compensated steps */
    compensatedSteps: string[];

    /** Steps that failed compensation */
    failedCompensations: CompensationFailure[];

    /** Total compensation duration */
    duration: number;
}

/**
 * Compensation failure details
 */
export interface CompensationFailure {
    stepId: string;
    error: StepError;
}

// ─────────────────────────────────────────────────────────────
// Event Types
// ─────────────────────────────────────────────────────────────

/**
 * Workflow event types (subset of KernelEvent)
 */
export type WorkflowEventType = Extract<KernelEvent,
    | 'workflow.saga.started'
    | 'workflow.saga.step.started'
    | 'workflow.saga.step.completed'
    | 'workflow.saga.step.failed'
    | 'workflow.saga.step.retrying'
    | 'workflow.saga.compensation.started'
    | 'workflow.saga.compensation.completed'
    | 'workflow.saga.completed'
    | 'workflow.saga.failed'
>;

/**
 * Workflow event payload base
 */
export interface WorkflowEventPayload {
    tenantId: string;
    sagaId: string;
    definitionId: string;
    correlationId: string;
    timestamp: Date;
}

/**
 * Saga started event payload
 */
export interface SagaStartedPayload extends WorkflowEventPayload {
    sagaName: string;
    input: unknown;
}

/**
 * Step event payload
 */
export interface StepEventPayload extends WorkflowEventPayload {
    stepId: string;
    stepName: string;
    stepIndex: number;
    totalSteps: number;
}

/**
 * Step completed event payload
 */
export interface StepCompletedPayload extends StepEventPayload {
    output: unknown;
    duration: number;
}

/**
 * Step failed event payload
 */
export interface StepFailedPayload extends StepEventPayload {
    error: StepError;
    willRetry: boolean;
    retryCount: number;
}

/**
 * Saga completed event payload
 */
export interface SagaCompletedPayload extends WorkflowEventPayload {
    output: unknown;
    duration: number;
    stepsCompleted: number;
}

/**
 * Saga failed event payload
 */
export interface SagaFailedPayload extends WorkflowEventPayload {
    error: SagaError;
    duration: number;
}

