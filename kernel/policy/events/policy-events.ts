/**
 * Policy Event Emitter
 * 
 * GRCD-KERNEL v4.0.0: Policy lifecycle events
 * Emits policy events to kernel event bus
 */

import type {
    PolicyManifest,
    PolicyEvaluationRequest,
    PolicyEvaluationResult,
} from "../types";
import { POLICY_EVENTS } from "../types";
import { eventBus } from "../../events/event-bus";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Policy Event Emitter
 */
export class PolicyEventEmitter {
    private static instance: PolicyEventEmitter;

    private constructor() { }

    public static getInstance(): PolicyEventEmitter {
        if (!PolicyEventEmitter.instance) {
            PolicyEventEmitter.instance = new PolicyEventEmitter();
        }
        return PolicyEventEmitter.instance;
    }

    /**
     * Emit policy registered event
     */
    async emitPolicyRegistered(
        manifest: PolicyManifest,
        manifestHash: string
    ): Promise<void> {
        await this.emit(POLICY_EVENTS.POLICY_REGISTERED, {
            policyId: manifest.id,
            policyName: manifest.name,
            version: manifest.version,
            precedence: manifest.precedence,
            manifestHash,
        });
    }

    /**
     * Emit policy evaluated event
     */
    async emitPolicyEvaluated(
        request: PolicyEvaluationRequest,
        result: PolicyEvaluationResult
    ): Promise<void> {
        await this.emit(POLICY_EVENTS.POLICY_EVALUATED, {
            action: request.action,
            orchestra: request.orchestra,
            allowed: result.allowed,
            winningPolicy: result.winningPolicy,
            evaluationTimeMs: result.metadata?.evaluationTimeMs,
            tenantId: request.tenantId,
            traceId: request.traceId,
        });
    }

    /**
     * Emit policy violated event
     */
    async emitPolicyViolated(
        request: PolicyEvaluationRequest,
        result: PolicyEvaluationResult
    ): Promise<void> {
        if (result.allowed) return;

        await this.emit(POLICY_EVENTS.POLICY_VIOLATED, {
            action: request.action,
            orchestra: request.orchestra,
            winningPolicy: result.winningPolicy,
            reason: result.reason,
            tenantId: request.tenantId,
            userId: request.userId,
            traceId: request.traceId,
        });
    }

    /**
     * Emit policy conflict resolved event
     */
    async emitConflictResolved(
        request: PolicyEvaluationRequest,
        result: PolicyEvaluationResult
    ): Promise<void> {
        if ((result.metadata?.conflictsResolved || 0) === 0) return;

        await this.emit(POLICY_EVENTS.POLICY_CONFLICT_RESOLVED, {
            action: request.action,
            conflictingPolicies: result.evaluatedPolicies,
            winningPolicy: result.winningPolicy,
            traceId: request.traceId,
        });
    }

    /**
     * Emit policy disabled event
     */
    async emitPolicyDisabled(policyId: string, reason?: string): Promise<void> {
        await this.emit(POLICY_EVENTS.POLICY_DISABLED, {
            policyId,
            reason,
        });
    }

    /**
     * Internal event emission
     */
    private async emit(eventType: string, payload: Record<string, any>): Promise<void> {
        try {
            await eventBus.publish({
                type: eventType,
                name: eventType,
                tenantId: payload.tenantId || null,
                traceId: payload.traceId || null,
                timestamp: Date.now(),
                payload,
            });

            logger.debug(`📜 Emitted policy event: ${eventType}`, { payload });
        } catch (error) {
            logger.error(`❌ Failed to emit policy event: ${eventType}`, { error, payload });
        }
    }
}

/**
 * Export singleton instance
 */
export const policyEventEmitter = PolicyEventEmitter.getInstance();

