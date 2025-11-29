/**
 * Compensation Handler — Advanced Rollback Strategies
 * 
 * Features:
 * - Parallel compensation execution
 * - Compensation timeout handling
 * - Manual compensation triggers
 * - Compensation history tracking
 * 
 * @module workflows/compensation.handler
 */

import { eventBus } from '../events/event-bus';
import { appendAuditEntry } from '../audit/hash-chain.store';
import { toStepError } from './retry.policy';
import type {
    SagaStep,
    StepResult,
    WorkflowContext,
    CompensationResult,
    CompensationFailure,
    StepError,
} from './workflow.types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Compensation options
 */
export interface CompensationOptions {
    /** Execute compensations in parallel */
    parallel?: boolean;

    /** Timeout per compensation step (ms) */
    timeout?: number;

    /** Continue on failure */
    continueOnError?: boolean;

    /** Max concurrent compensations (if parallel) */
    concurrency?: number;
}

/**
 * Compensation history entry
 */
export interface CompensationHistoryEntry {
    sagaId: string;
    stepId: string;
    status: 'completed' | 'failed';
    error?: StepError;
    timestamp: Date;
    duration: number;
}

// ─────────────────────────────────────────────────────────────
// Compensation Handler Class
// ─────────────────────────────────────────────────────────────

/**
 * Handler for saga compensation operations
 */
export class CompensationHandler {
    private history: CompensationHistoryEntry[] = [];
    private readonly maxHistorySize = 1000;

    /**
     * Execute compensations for completed steps
     * 
     * @param steps - All saga steps
     * @param stepResults - Execution results
     * @param context - Workflow context
     * @param sagaId - Saga execution ID
     * @param options - Compensation options
     * @returns Compensation result
     */
    async compensate(
        steps: SagaStep[],
        stepResults: StepResult[],
        context: WorkflowContext,
        sagaId: string,
        options: CompensationOptions = {}
    ): Promise<CompensationResult> {
        const {
            parallel = false,
            timeout = 30000,
            continueOnError = true,
            concurrency = 5,
        } = options;

        const startedAt = new Date();
        const compensatedSteps: string[] = [];
        const failedCompensations: CompensationFailure[] = [];

        // Get completed steps that need compensation (reverse order)
        const stepsToCompensate = stepResults
            .filter(r => r.status === 'completed')
            .reverse()
            .map(r => ({
                step: steps.find(s => s.id === r.stepId)!,
                result: r,
            }))
            .filter(({ step }) => step?.compensate);

        if (stepsToCompensate.length === 0) {
            return {
                status: 'completed',
                compensatedSteps: [],
                failedCompensations: [],
                duration: 0,
            };
        }

        // Emit compensation started
        await eventBus.publish({
            type: 'workflow.saga.compensation.started',
            tenantId: context.tenantId,
            payload: {
                sagaId,
                stepsToCompensate: stepsToCompensate.map(s => s.step.id),
                parallel,
                timestamp: startedAt,
            },
        });

        if (parallel) {
            // Parallel compensation with concurrency limit
            const results = await this.compensateParallel(
                stepsToCompensate,
                context,
                sagaId,
                timeout,
                concurrency
            );

            for (const result of results) {
                if (result.success) {
                    compensatedSteps.push(result.stepId);
                } else {
                    failedCompensations.push({
                        stepId: result.stepId,
                        error: result.error!,
                    });

                    if (!continueOnError) break;
                }
            }
        } else {
            // Sequential compensation
            for (const { step, result } of stepsToCompensate) {
                const compResult = await this.compensateStep(
                    step,
                    result.output,
                    context,
                    sagaId,
                    timeout
                );

                if (compResult.success) {
                    compensatedSteps.push(step.id);
                } else {
                    failedCompensations.push({
                        stepId: step.id,
                        error: compResult.error!,
                    });

                    if (!continueOnError) break;
                }
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
                status,
                compensatedSteps,
                failedCompensations: failedCompensations.map(f => f.stepId),
                duration,
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
     * Compensate a single step
     */
    private async compensateStep(
        step: SagaStep,
        input: unknown,
        context: WorkflowContext,
        sagaId: string,
        timeout: number
    ): Promise<{ success: boolean; stepId: string; error?: StepError }> {
        const startedAt = new Date();

        try {
            await withTimeout(step.compensate!(input, context), timeout);

            const duration = Date.now() - startedAt.getTime();

            // Record history
            this.addToHistory({
                sagaId,
                stepId: step.id,
                status: 'completed',
                timestamp: new Date(),
                duration,
            });

            // Audit
            await appendAuditEntry({
                tenantId: context.tenantId,
                actorId: context.actorId,
                actionId: 'workflow.compensation.step.completed',
                payload: { sagaId, stepId: step.id, duration },
            });

            return { success: true, stepId: step.id };
        } catch (err) {
            const error = toStepError(err);
            const duration = Date.now() - startedAt.getTime();

            // Record history
            this.addToHistory({
                sagaId,
                stepId: step.id,
                status: 'failed',
                error,
                timestamp: new Date(),
                duration,
            });

            // Audit
            await appendAuditEntry({
                tenantId: context.tenantId,
                actorId: context.actorId,
                actionId: 'workflow.compensation.step.failed',
                payload: { sagaId, stepId: step.id, error: error.message },
            });

            return { success: false, stepId: step.id, error };
        }
    }

    /**
     * Compensate steps in parallel with concurrency limit
     */
    private async compensateParallel(
        stepsToCompensate: { step: SagaStep; result: StepResult }[],
        context: WorkflowContext,
        sagaId: string,
        timeout: number,
        concurrency: number
    ): Promise<{ success: boolean; stepId: string; error?: StepError }[]> {
        const results: { success: boolean; stepId: string; error?: StepError }[] = [];

        // Process in batches
        for (let i = 0; i < stepsToCompensate.length; i += concurrency) {
            const batch = stepsToCompensate.slice(i, i + concurrency);

            const batchResults = await Promise.all(
                batch.map(({ step, result }) =>
                    this.compensateStep(step, result.output, context, sagaId, timeout)
                )
            );

            results.push(...batchResults);
        }

        return results;
    }

    /**
     * Add entry to history (with size limit)
     */
    private addToHistory(entry: CompensationHistoryEntry): void {
        this.history.push(entry);

        // Trim if over limit
        if (this.history.length > this.maxHistorySize) {
            this.history = this.history.slice(-this.maxHistorySize);
        }
    }

    /**
     * Get compensation history for a saga
     * 
     * @param sagaId - Saga execution ID
     * @returns History entries
     */
    getHistory(sagaId: string): CompensationHistoryEntry[] {
        return this.history.filter(h => h.sagaId === sagaId);
    }

    /**
     * Get all compensation history
     */
    getAllHistory(): CompensationHistoryEntry[] {
        return [...this.history];
    }

    /**
     * Clear history
     */
    clearHistory(): void {
        this.history = [];
    }
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

/**
 * Execute promise with timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Compensation timed out after ${timeoutMs}ms`));
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
 * Global compensation handler instance
 */
export const compensationHandler = new CompensationHandler();

