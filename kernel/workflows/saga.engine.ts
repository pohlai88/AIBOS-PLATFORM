/**
 * Saga Engine — Temporal-Lite Workflow Orchestrator
 * 
 * Features:
 * - Step-by-step execution with state tracking
 * - Automatic compensation on failure
 * - Retry with exponential backoff
 * - Event emission for observability
 * - Audit trail integration (hash-chain)
 * - Multi-tenant isolation
 * - Timeout handling
 * 
 * Inspired by: Temporal, Medusa Workflows, Camunda
 * 
 * @module workflows/saga.engine
 */

import { eventBus } from '../events/event-bus';
import { appendAuditEntry } from '../audit/hash-chain.store';
import { executeWithRetry, toStepError } from './retry.policy';
import type {
    SagaDefinition,
    SagaStep,
    SagaResult,
    StepResult,
    WorkflowContext,
    SagaError,
    StepStatus,
    SagaStatus,
    RetryPolicy,
    CompensationResult,
    CompensationFailure,
} from './workflow.types';
import { DEFAULT_RETRY_POLICY } from './workflow.types';

// ─────────────────────────────────────────────────────────────
// Saga Engine Class
// ─────────────────────────────────────────────────────────────

/**
 * Saga Engine for orchestrating distributed transactions
 */
export class SagaEngine {
    private runningCount = 0;

    /**
     * Execute a saga workflow
     * 
     * @param definition - Saga definition with steps
     * @param input - Initial input for the saga
     * @param context - Workflow context (tenant, actor, etc.)
     * @returns Saga execution result
     */
    async execute<TInput, TOutput>(
        definition: SagaDefinition<TInput, TOutput>,
        input: TInput,
        context: WorkflowContext
    ): Promise<SagaResult<TOutput>> {
        const sagaId = generateSagaId();
        const startedAt = new Date();
        const stepResults: StepResult[] = [];
        let currentOutput: unknown = input;
        let status: SagaStatus = 'running';
        let sagaError: SagaError | undefined;

        this.runningCount++;

        try {
            // Emit saga started event
            await this.emitSagaStarted(sagaId, definition, input, context);

            // Execute each step in sequence
            for (let i = 0; i < definition.steps.length; i++) {
                const step = definition.steps[i];
                const stepResult = await this.executeStep(
                    step,
                    currentOutput,
                    context,
                    sagaId,
                    definition.id,
                    i,
                    definition.steps.length,
                    definition.retryPolicy
                );

                stepResults.push(stepResult);

                if (stepResult.status === 'failed') {
                    // Step failed - trigger compensation
                    status = 'compensating';

                    const compensationResult = await this.compensate(
                        definition.steps,
                        stepResults,
                        context,
                        sagaId,
                        definition.id
                    );

                    status = compensationResult.status === 'completed' ? 'compensated' : 'failed';

                    sagaError = {
                        code: 'SAGA_FAILED',
                        message: `Saga failed at step '${step.name}'`,
                        failedStepId: step.id,
                        compensationStatus: compensationResult.status,
                        compensatedSteps: compensationResult.compensatedSteps,
                        failedCompensations: compensationResult.failedCompensations.map(f => f.stepId),
                    };

                    break;
                }

                currentOutput = stepResult.output;
            }

            if (!sagaError) {
                status = 'completed';
            }

        } catch (err) {
            status = 'failed';
            sagaError = {
                code: 'SAGA_UNEXPECTED_ERROR',
                message: err instanceof Error ? err.message : String(err),
                failedStepId: 'unknown',
                compensationStatus: 'none',
                compensatedSteps: [],
                failedCompensations: [],
            };
        } finally {
            this.runningCount--;
        }

        const completedAt = new Date();
        const duration = completedAt.getTime() - startedAt.getTime();

        const result: SagaResult<TOutput> = {
            sagaId,
            definitionId: definition.id,
            status,
            output: status === 'completed' ? (currentOutput as TOutput) : undefined,
            error: sagaError,
            steps: stepResults,
            startedAt,
            completedAt,
            duration,
        };

        // Emit completion/failure event
        if (status === 'completed') {
            await this.emitSagaCompleted(sagaId, definition.id, result, context);
        } else {
            await this.emitSagaFailed(sagaId, definition.id, result, context);
        }

        return result;
    }

    /**
     * Execute a single step with retry logic
     */
    private async executeStep(
        step: SagaStep,
        input: unknown,
        context: WorkflowContext,
        sagaId: string,
        definitionId: string,
        stepIndex: number,
        totalSteps: number,
        globalRetryPolicy?: RetryPolicy
    ): Promise<StepResult> {
        const startedAt = new Date();
        const retryPolicy = step.retryPolicy || globalRetryPolicy || DEFAULT_RETRY_POLICY;

        // Emit step started
        await eventBus.publish({
            type: 'workflow.saga.step.started',
            tenantId: context.tenantId,
            payload: {
                sagaId,
                definitionId,
                stepId: step.id,
                stepName: step.name,
                stepIndex,
                totalSteps,
                correlationId: context.correlationId,
                timestamp: startedAt,
            },
        });

        // Execute with retry
        const retryResult = await executeWithRetry(
            async () => {
                if (step.timeout) {
                    return withTimeout(step.execute(input, context), step.timeout);
                }
                return step.execute(input, context);
            },
            retryPolicy,
            { stepId: step.id, stepName: step.name }
        );

        const completedAt = new Date();
        const duration = completedAt.getTime() - startedAt.getTime();

        if (retryResult.success) {
            // Emit step completed
            await eventBus.publish({
                type: 'workflow.saga.step.completed',
                tenantId: context.tenantId,
                payload: {
                    sagaId,
                    definitionId,
                    stepId: step.id,
                    stepName: step.name,
                    stepIndex,
                    totalSteps,
                    output: retryResult.result,
                    duration,
                    correlationId: context.correlationId,
                    timestamp: completedAt,
                },
            });

            // Audit
            await appendAuditEntry({
                tenantId: context.tenantId,
                actorId: context.actorId,
                actionId: 'workflow.saga.step.completed',
                payload: { sagaId, stepId: step.id, duration },
            });

            return {
                stepId: step.id,
                stepName: step.name,
                status: 'completed' as StepStatus,
                output: retryResult.result,
                startedAt,
                completedAt,
                duration,
                retries: retryResult.attempts - 1,
            };
        } else {
            // Emit step failed
            await eventBus.publish({
                type: 'workflow.saga.step.failed',
                tenantId: context.tenantId,
                payload: {
                    sagaId,
                    definitionId,
                    stepId: step.id,
                    stepName: step.name,
                    stepIndex,
                    totalSteps,
                    error: retryResult.error,
                    willRetry: false,
                    retryCount: retryResult.attempts,
                    correlationId: context.correlationId,
                    timestamp: completedAt,
                },
            });

            // Audit
            await appendAuditEntry({
                tenantId: context.tenantId,
                actorId: context.actorId,
                actionId: 'workflow.saga.step.failed',
                payload: { sagaId, stepId: step.id, error: retryResult.error?.message },
            });

            return {
                stepId: step.id,
                stepName: step.name,
                status: 'failed' as StepStatus,
                error: retryResult.error,
                startedAt,
                completedAt,
                duration,
                retries: retryResult.attempts - 1,
            };
        }
    }

    /**
     * Compensate completed steps in reverse order
     */
    private async compensate(
        steps: SagaStep[],
        stepResults: StepResult[],
        context: WorkflowContext,
        sagaId: string,
        definitionId: string
    ): Promise<CompensationResult> {
        const startedAt = new Date();
        const compensatedSteps: string[] = [];
        const failedCompensations: CompensationFailure[] = [];

        // Emit compensation started
        await eventBus.publish({
            type: 'workflow.saga.compensation.started',
            tenantId: context.tenantId,
            payload: {
                sagaId,
                definitionId,
                stepsToCompensate: stepResults
                    .filter(r => r.status === 'completed')
                    .map(r => r.stepId),
                correlationId: context.correlationId,
                timestamp: startedAt,
            },
        });

        // Get completed steps to compensate (reverse order)
        const completedSteps = stepResults
            .filter(r => r.status === 'completed')
            .reverse();

        for (const stepResult of completedSteps) {
            const step = steps.find(s => s.id === stepResult.stepId);

            if (!step?.compensate) {
                // No compensation defined - skip
                continue;
            }

            try {
                await step.compensate(stepResult.output, context);
                compensatedSteps.push(step.id);

                // Audit
                await appendAuditEntry({
                    tenantId: context.tenantId,
                    actorId: context.actorId,
                    actionId: 'workflow.saga.step.compensated',
                    payload: { sagaId, stepId: step.id },
                });
            } catch (err) {
                failedCompensations.push({
                    stepId: step.id,
                    error: toStepError(err),
                });
            }
        }

        const completedAt = new Date();
        const duration = completedAt.getTime() - startedAt.getTime();

        // Determine status
        let status: 'completed' | 'partial' | 'failed';
        if (failedCompensations.length === 0) {
            status = 'completed';
        } else if (compensatedSteps.length > 0) {
            status = 'partial';
        } else {
            status = 'failed';
        }

        // Emit compensation completed
        await eventBus.publish({
            type: 'workflow.saga.compensation.completed',
            tenantId: context.tenantId,
            payload: {
                sagaId,
                definitionId,
                status,
                compensatedSteps,
                failedCompensations: failedCompensations.map(f => f.stepId),
                duration,
                correlationId: context.correlationId,
                timestamp: completedAt,
            },
        });

        return {
            status,
            compensatedSteps,
            failedCompensations,
            duration,
        };
    }

    /**
     * Emit saga started event
     */
    private async emitSagaStarted(
        sagaId: string,
        definition: SagaDefinition,
        input: unknown,
        context: WorkflowContext
    ): Promise<void> {
        await eventBus.publish({
            type: 'workflow.saga.started',
            tenantId: context.tenantId,
            payload: {
                sagaId,
                definitionId: definition.id,
                sagaName: definition.name,
                input,
                correlationId: context.correlationId,
                timestamp: new Date(),
            },
        });

        await appendAuditEntry({
            tenantId: context.tenantId,
            actorId: context.actorId,
            actionId: 'workflow.saga.started',
            payload: { sagaId, definitionId: definition.id },
        });
    }

    /**
     * Emit saga completed event
     */
    private async emitSagaCompleted(
        sagaId: string,
        definitionId: string,
        result: SagaResult,
        context: WorkflowContext
    ): Promise<void> {
        await eventBus.publish({
            type: 'workflow.saga.completed',
            tenantId: context.tenantId,
            payload: {
                sagaId,
                definitionId,
                output: result.output,
                duration: result.duration,
                stepsCompleted: result.steps.filter(s => s.status === 'completed').length,
                correlationId: context.correlationId,
                timestamp: new Date(),
            },
        });

        await appendAuditEntry({
            tenantId: context.tenantId,
            actorId: context.actorId,
            actionId: 'workflow.saga.completed',
            payload: { sagaId, definitionId, duration: result.duration },
        });
    }

    /**
     * Emit saga failed event
     */
    private async emitSagaFailed(
        sagaId: string,
        definitionId: string,
        result: SagaResult,
        context: WorkflowContext
    ): Promise<void> {
        await eventBus.publish({
            type: 'workflow.saga.failed',
            tenantId: context.tenantId,
            payload: {
                sagaId,
                definitionId,
                error: result.error,
                duration: result.duration,
                correlationId: context.correlationId,
                timestamp: new Date(),
            },
        });

        await appendAuditEntry({
            tenantId: context.tenantId,
            actorId: context.actorId,
            actionId: 'workflow.saga.failed',
            payload: { sagaId, definitionId, error: result.error?.message },
        });
    }

    /**
     * Get count of running sagas
     */
    getRunningCount(): number {
        return this.runningCount;
    }
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

/**
 * Generate unique saga ID
 */
function generateSagaId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    return `saga_${timestamp}_${random}`;
}

/**
 * Execute promise with timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Step timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        promise
            .then(result => {
                clearTimeout(timer);
                resolve(result);
            })
            .catch(err => {
                clearTimeout(timer);
                reject(err);
            });
    });
}

// ─────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────

/**
 * Global saga engine instance
 */
export const sagaEngine = new SagaEngine();

