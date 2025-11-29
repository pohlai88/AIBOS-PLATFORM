/**
 * Policy Audit Logger
 * 
 * GRCD-KERNEL v4.0.0 F-10: Policy audit logging
 * Comprehensive audit trail for all policy operations
 */

import type {
    PolicyManifest,
    PolicyEvaluationRequest,
    PolicyEvaluationResult,
} from "../types";
import { AuditLogger } from "../../audit/audit-logger";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Policy Audit Logger
 */
export class PolicyAuditLogger {
    private static instance: PolicyAuditLogger;
    private auditLogger: AuditLogger;

    private constructor() {
        this.auditLogger = new AuditLogger();
    }

    public static getInstance(): PolicyAuditLogger {
        if (!PolicyAuditLogger.instance) {
            PolicyAuditLogger.instance = new PolicyAuditLogger();
        }
        return PolicyAuditLogger.instance;
    }

    /**
     * Audit policy registration
     */
    async auditPolicyRegistered(
        manifest: PolicyManifest,
        manifestHash: string,
        tenantId?: string,
        userId?: string
    ): Promise<void> {
        await this.auditLogger.log({
            tenantId: tenantId || null,
            subject: userId || "system",
            action: "policy.registered",
            resource: `policy://${manifest.id}`,
            category: "kernel",
            severity: "info",
            details: {
                policyId: manifest.id,
                policyName: manifest.name,
                version: manifest.version,
                precedence: manifest.precedence,
                enforcementMode: manifest.enforcementMode,
                manifestHash,
                rulesCount: manifest.rules.length,
            },
        });
    }

    /**
     * Audit policy evaluation
     */
    async auditPolicyEvaluation(
        request: PolicyEvaluationRequest,
        result: PolicyEvaluationResult
    ): Promise<void> {
        await this.auditLogger.log({
            tenantId: request.tenantId || null,
            subject: request.userId || "system",
            action: "policy.evaluated",
            resource: request.resource || `action://${request.action}`,
            category: "kernel",
            severity: result.allowed ? "info" : "warn",
            details: {
                action: request.action,
                orchestra: request.orchestra,
                allowed: result.allowed,
                winningPolicy: result.winningPolicy,
                policiesEvaluated: result.evaluatedPolicies.length,
                evaluationTimeMs: result.metadata?.evaluationTimeMs,
                traceId: request.traceId,
            },
        });
    }

    /**
     * Audit policy violation
     */
    async auditPolicyViolation(
        request: PolicyEvaluationRequest,
        result: PolicyEvaluationResult
    ): Promise<void> {
        if (result.allowed) return; // Not a violation

        await this.auditLogger.log({
            tenantId: request.tenantId || null,
            subject: request.userId || "system",
            action: "policy.violated",
            resource: request.resource || `action://${request.action}`,
            category: "kernel",
            severity: "error",
            details: {
                action: request.action,
                orchestra: request.orchestra,
                winningPolicy: result.winningPolicy,
                reason: result.reason,
                traceId: request.traceId,
            },
        });
    }

    /**
     * Audit policy disabled
     */
    async auditPolicyDisabled(
        policyId: string,
        reason?: string,
        tenantId?: string,
        userId?: string
    ): Promise<void> {
        await this.auditLogger.log({
            tenantId: tenantId || null,
            subject: userId || "system",
            action: "policy.disabled",
            resource: `policy://${policyId}`,
            category: "kernel",
            severity: "warn",
            details: {
                policyId,
                reason: reason || "Manual disable",
            },
        });
    }

    /**
     * Audit policy conflict resolution
     */
    async auditConflictResolution(
        request: PolicyEvaluationRequest,
        result: PolicyEvaluationResult
    ): Promise<void> {
        if (!result.warnings || result.warnings.length === 0) return;

        await this.auditLogger.log({
            tenantId: request.tenantId || null,
            subject: request.userId || "system",
            action: "policy.conflict_resolved",
            resource: `action://${request.action}`,
            category: "kernel",
            severity: "info",
            details: {
                action: request.action,
                conflictingPolicies: result.evaluatedPolicies,
                winningPolicy: result.winningPolicy,
                reason: result.reason,
                traceId: request.traceId,
            },
        });
    }
}

/**
 * Export singleton instance
 */
export const policyAuditLogger = PolicyAuditLogger.getInstance();

