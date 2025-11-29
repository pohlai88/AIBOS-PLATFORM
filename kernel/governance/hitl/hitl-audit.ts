/**
 * HITL Audit Logger
 * 
 * GRCD Compliance: C-8 (Human-in-the-Loop), F-10 (Audit all interactions)
 * Standard: EU AI Act, ISO 42001, SOC2
 * 
 * Audits all human approval decisions for compliance and traceability.
 */

import { baseAudit } from "../../audit/audit";
import { AuditCategory, AuditSeverity } from "../../audit/types";
import {
  ApprovalRequest,
  ApprovalDecision,
  ApprovalStatus,
  RiskLevel,
} from "./types";

export class HITLAuditLogger {
  /**
   * Log approval request creation
   */
  logApprovalRequested(request: ApprovalRequest): void {
    baseAudit.log({
      action: "hitl.approval.requested",
      category: AuditCategory.GOVERNANCE,
      severity: this.getSeverityForRiskLevel(request.riskLevel),
      actor: request.requester,
      tenantId: request.tenantId,
      resource: `hitl:request:${request.id}`,
      details: {
        requestId: request.id,
        actionType: request.actionType,
        riskLevel: request.riskLevel,
        requester: request.requester,
        description: request.details.description,
        affectedResources: request.details.affectedResources,
        estimatedImpact: request.details.estimatedImpact,
        justification: request.details.justification,
        timeout: request.timeout,
        expiresAt: request.expiresAt,
        approvalsRequired: request.approvalsRequired,
        assignedApprovers: request.assignedApprovers,
      },
      metadata: {
        operation: "approval_request",
        riskLevel: request.riskLevel,
      },
    });
  }

  /**
   * Log approval decision (approved)
   */
  logApprovalApproved(request: ApprovalRequest, decision: ApprovalDecision): void {
    baseAudit.log({
      action: "hitl.approval.approved",
      category: AuditCategory.GOVERNANCE,
      severity: AuditSeverity.INFO,
      actor: decision.approverId,
      tenantId: request.tenantId,
      resource: `hitl:request:${request.id}`,
      details: {
        requestId: request.id,
        actionType: request.actionType,
        riskLevel: request.riskLevel,
        requester: request.requester,
        approverId: decision.approverId,
        reason: decision.reason,
        approvalsReceived: request.approvalsReceived,
        approvalsRequired: request.approvalsRequired,
        timestamp: decision.timestamp,
      },
      metadata: {
        operation: "approval_decision",
        decision: "approved",
        riskLevel: request.riskLevel,
      },
    });
  }

  /**
   * Log approval decision (rejected)
   */
  logApprovalRejected(request: ApprovalRequest, decision: ApprovalDecision): void {
    baseAudit.log({
      action: "hitl.approval.rejected",
      category: AuditCategory.GOVERNANCE,
      severity: AuditSeverity.WARNING,
      actor: decision.approverId,
      tenantId: request.tenantId,
      resource: `hitl:request:${request.id}`,
      details: {
        requestId: request.id,
        actionType: request.actionType,
        riskLevel: request.riskLevel,
        requester: request.requester,
        approverId: decision.approverId,
        reason: decision.reason,
        timestamp: decision.timestamp,
      },
      metadata: {
        operation: "approval_decision",
        decision: "rejected",
        riskLevel: request.riskLevel,
      },
    });
  }

  /**
   * Log approval expiration
   */
  logApprovalExpired(request: ApprovalRequest): void {
    baseAudit.log({
      action: "hitl.approval.expired",
      category: AuditCategory.GOVERNANCE,
      severity: AuditSeverity.WARNING,
      actor: "system",
      tenantId: request.tenantId,
      resource: `hitl:request:${request.id}`,
      details: {
        requestId: request.id,
        actionType: request.actionType,
        riskLevel: request.riskLevel,
        requester: request.requester,
        createdAt: request.createdAt,
        expiresAt: request.expiresAt,
        approvalsReceived: request.approvalsReceived,
        approvalsRequired: request.approvalsRequired,
      },
      metadata: {
        operation: "approval_expiration",
        riskLevel: request.riskLevel,
      },
    });
  }

  /**
   * Log approval cancellation
   */
  logApprovalCanceled(request: ApprovalRequest, reason: string): void {
    baseAudit.log({
      action: "hitl.approval.canceled",
      category: AuditCategory.GOVERNANCE,
      severity: AuditSeverity.INFO,
      actor: request.requester,
      tenantId: request.tenantId,
      resource: `hitl:request:${request.id}`,
      details: {
        requestId: request.id,
        actionType: request.actionType,
        riskLevel: request.riskLevel,
        requester: request.requester,
        reason,
        timestamp: Date.now(),
      },
      metadata: {
        operation: "approval_cancellation",
        riskLevel: request.riskLevel,
      },
    });
  }

  /**
   * Log approval escalation
   */
  logApprovalEscalated(request: ApprovalRequest, escalatedTo: string[]): void {
    baseAudit.log({
      action: "hitl.approval.escalated",
      category: AuditCategory.GOVERNANCE,
      severity: AuditSeverity.WARNING,
      actor: "system",
      tenantId: request.tenantId,
      resource: `hitl:request:${request.id}`,
      details: {
        requestId: request.id,
        actionType: request.actionType,
        riskLevel: request.riskLevel,
        requester: request.requester,
        escalatedTo,
        timeRemaining: request.expiresAt - Date.now(),
        timestamp: Date.now(),
      },
      metadata: {
        operation: "approval_escalation",
        riskLevel: request.riskLevel,
      },
    });
  }

  /**
   * Log unauthorized approval attempt
   */
  logUnauthorizedApprovalAttempt(
    requestId: string,
    attemptedBy: string,
    reason: string
  ): void {
    baseAudit.log({
      action: "hitl.approval.unauthorized_attempt",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.WARNING,
      actor: attemptedBy,
      tenantId: "system",
      resource: `hitl:request:${requestId}`,
      details: {
        requestId,
        attemptedBy,
        reason,
        timestamp: Date.now(),
      },
      metadata: {
        operation: "unauthorized_approval_attempt",
      },
    });
  }

  /**
   * Get audit severity based on risk level
   */
  private getSeverityForRiskLevel(riskLevel: RiskLevel): AuditSeverity {
    switch (riskLevel) {
      case RiskLevel.CRITICAL:
        return AuditSeverity.CRITICAL;
      case RiskLevel.HIGH:
        return AuditSeverity.WARNING;
      case RiskLevel.MEDIUM:
        return AuditSeverity.INFO;
      case RiskLevel.LOW:
        return AuditSeverity.DEBUG;
      default:
        return AuditSeverity.INFO;
    }
  }
}

// Singleton instance
export const hitlAudit = new HITLAuditLogger();

