/**
 * Human-in-the-Loop (HITL) Approval Engine
 * 
 * GRCD Compliance: C-8 (Human-in-the-Loop for critical AI decisions)
 * Standard: EU AI Act, ISO 42001
 * 
 * Orchestrates human approval workflows for high-risk AI actions.
 */

import crypto from "crypto";
import {
  ApprovalRequest,
  ApprovalDecision,
  ApprovalStatus,
  RiskLevel,
  HITL_EVENTS,
} from "./types";
import { approvalQueue, type QueueFilter } from "./approval-queue";
import { riskClassifier } from "./risk-classifier";
import { createTraceLogger } from "../../observability/logger";
import { eventBus } from "../../events/event-bus";

const logger = createTraceLogger("hitl-approval-engine");

export interface RequestApprovalOptions {
  /** Action type */
  actionType: string;
  
  /** Requester identity */
  requester: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Action description */
  description: string;
  
  /** Resources affected */
  affectedResources?: string[];
  
  /** Estimated impact */
  estimatedImpact?: string;
  
  /** Justification */
  justification?: string;
  
  /** Additional context */
  context?: Record<string, any>;
  
  /** Override risk level (optional) */
  overrideRiskLevel?: RiskLevel;
  
  /** Assigned approvers (optional) */
  assignedApprovers?: string[];
}

export class HITLApprovalEngine {
  private expirationCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start expiration checker (every 1 minute)
    this.startExpirationChecker();
    
    logger.info("HITLApprovalEngine initialized");
  }

  /**
   * Request approval for an action
   * 
   * @param options - Request options
   * @returns Request ID
   */
  async requestApproval(options: RequestApprovalOptions): Promise<string> {
    const startTime = Date.now();
    
    // 1. Classify risk
    const riskLevel = options.overrideRiskLevel || riskClassifier.classifyAction(
      options.actionType,
      { tenantId: options.tenantId, ...options.context }
    );

    // 2. Check if approval is required
    if (!riskClassifier.requiresApproval(riskLevel)) {
      logger.info("Action does not require approval (LOW risk)", {
        actionType: options.actionType,
        requester: options.requester,
      });
      
      // Return a synthetic "auto-approved" request ID
      return `auto-approved-${Date.now()}`;
    }

    // 3. Create approval request
    const requestId = this.generateRequestId();
    const timeout = riskClassifier.getApprovalTimeout(riskLevel);
    const approvalsRequired = riskClassifier.getApprovalsRequired(riskLevel);
    const now = Date.now();

    const request: ApprovalRequest = {
      id: requestId,
      actionType: options.actionType,
      riskLevel,
      requester: options.requester,
      tenantId: options.tenantId,
      details: {
        description: options.description,
        affectedResources: options.affectedResources,
        estimatedImpact: options.estimatedImpact,
        justification: options.justification,
        context: options.context,
      },
      timeout,
      createdAt: now,
      expiresAt: now + timeout,
      status: ApprovalStatus.PENDING,
      assignedApprovers: options.assignedApprovers,
      approvalsRequired,
      approvalsReceived: 0,
    };

    // 4. Enqueue request
    approvalQueue.enqueue(request);

    // 5. Emit event
    eventBus.publish({
      type: HITL_EVENTS.APPROVAL_REQUESTED,
      tenantId: options.tenantId,
      timestamp: Date.now(),
      data: {
        requestId,
        actionType: options.actionType,
        riskLevel,
        requester: options.requester,
        expiresAt: request.expiresAt,
        approvalsRequired,
      },
    });

    const duration = Date.now() - startTime;
    logger.info("Approval requested", {
      requestId,
      actionType: options.actionType,
      riskLevel,
      requester: options.requester,
      tenantId: options.tenantId,
      approvalsRequired,
      timeout,
      expiresAt: request.expiresAt,
      durationMs: duration,
    });

    return requestId;
  }

  /**
   * Approve an action
   * 
   * @param requestId - Request ID
   * @param approverId - Approver identity
   * @param reason - Approval reason
   */
  async approveAction(requestId: string, approverId: string, reason: string): Promise<void> {
    const request = approvalQueue.get(requestId);

    if (!request) {
      throw new Error(`Approval request not found: ${requestId}`);
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new Error(`Cannot approve: request is ${request.status}`);
    }

    // Check if expired
    if (request.expiresAt <= Date.now()) {
      throw new Error(`Cannot approve: request has expired`);
    }

    // Check if approver is authorized (if assigned approvers specified)
    if (request.assignedApprovers && !request.assignedApprovers.includes(approverId)) {
      throw new Error(`Approver ${approverId} is not authorized for this request`);
    }

    // Increment approvals
    approvalQueue.incrementApprovals(requestId);

    // Create decision record
    const decision: ApprovalDecision = {
      requestId,
      decision: "approved",
      approverId,
      reason,
      timestamp: Date.now(),
    };

    // Check if all required approvals received
    if (request.approvalsReceived >= request.approvalsRequired) {
      // Mark as approved
      approvalQueue.updateStatus(requestId, ApprovalStatus.APPROVED);

      // Emit event
      eventBus.publish({
        type: HITL_EVENTS.APPROVAL_APPROVED,
        tenantId: request.tenantId,
        timestamp: Date.now(),
        data: {
          requestId,
          actionType: request.actionType,
          approverId,
          reason,
          approvalsReceived: request.approvalsReceived,
        },
      });

      logger.info("Action approved", {
        requestId,
        actionType: request.actionType,
        approverId,
        approvalsReceived: request.approvalsReceived,
        approvalsRequired: request.approvalsRequired,
      });
    } else {
      logger.info("Partial approval recorded", {
        requestId,
        actionType: request.actionType,
        approverId,
        approvalsReceived: request.approvalsReceived,
        approvalsRequired: request.approvalsRequired,
      });
    }
  }

  /**
   * Reject an action
   * 
   * @param requestId - Request ID
   * @param approverId - Approver identity
   * @param reason - Rejection reason
   */
  async rejectAction(requestId: string, approverId: string, reason: string): Promise<void> {
    const request = approvalQueue.get(requestId);

    if (!request) {
      throw new Error(`Approval request not found: ${requestId}`);
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new Error(`Cannot reject: request is ${request.status}`);
    }

    // Mark as rejected (one rejection is enough)
    approvalQueue.updateStatus(requestId, ApprovalStatus.REJECTED);

    // Create decision record
    const decision: ApprovalDecision = {
      requestId,
      decision: "rejected",
      approverId,
      reason,
      timestamp: Date.now(),
    };

    // Emit event
    eventBus.publish({
      type: HITL_EVENTS.APPROVAL_REJECTED,
      tenantId: request.tenantId,
      timestamp: Date.now(),
      data: {
        requestId,
        actionType: request.actionType,
        approverId,
        reason,
      },
    });

    logger.info("Action rejected", {
      requestId,
      actionType: request.actionType,
      approverId,
      reason,
    });
  }

  /**
   * Wait for approval decision
   * 
   * @param requestId - Request ID
   * @param pollIntervalMs - Polling interval (default: 1000ms)
   * @returns Approval decision
   */
  async waitForApproval(requestId: string, pollIntervalMs: number = 1000): Promise<ApprovalDecision> {
    // If auto-approved, return immediately
    if (requestId.startsWith("auto-approved-")) {
      return {
        requestId,
        decision: "approved",
        approverId: "system",
        reason: "Low risk action - auto-approved",
        timestamp: Date.now(),
      };
    }

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(() => {
        const request = approvalQueue.get(requestId);

        if (!request) {
          clearInterval(pollInterval);
          reject(new Error(`Approval request not found: ${requestId}`));
          return;
        }

        if (request.status === ApprovalStatus.APPROVED) {
          clearInterval(pollInterval);
          resolve({
            requestId,
            decision: "approved",
            approverId: "system", // TODO: Track actual approver(s)
            reason: "Approved by authorized approver(s)",
            timestamp: Date.now(),
          });
        } else if (request.status === ApprovalStatus.REJECTED) {
          clearInterval(pollInterval);
          reject(new Error(`Action rejected`));
        } else if (request.status === ApprovalStatus.EXPIRED) {
          clearInterval(pollInterval);
          reject(new Error(`Approval request expired`));
        } else if (request.status === ApprovalStatus.CANCELED) {
          clearInterval(pollInterval);
          reject(new Error(`Approval request canceled`));
        }
      }, pollIntervalMs);
    });
  }

  /**
   * Cancel an approval request
   * 
   * @param requestId - Request ID
   * @param reason - Cancellation reason
   */
  async cancelRequest(requestId: string, reason: string): Promise<void> {
    const request = approvalQueue.get(requestId);

    if (!request) {
      throw new Error(`Approval request not found: ${requestId}`);
    }

    if (request.status !== ApprovalStatus.PENDING) {
      throw new Error(`Cannot cancel: request is ${request.status}`);
    }

    approvalQueue.updateStatus(requestId, ApprovalStatus.CANCELED);

    eventBus.publish({
      type: HITL_EVENTS.APPROVAL_CANCELED,
      tenantId: request.tenantId,
      timestamp: Date.now(),
      data: {
        requestId,
        actionType: request.actionType,
        reason,
      },
    });

    logger.info("Approval request canceled", {
      requestId,
      actionType: request.actionType,
      reason,
    });
  }

  /**
   * Get pending approvals for an approver
   * 
   * @param approverId - Approver ID (optional, returns all if not specified)
   * @returns Array of pending approval requests
   */
  getPendingApprovals(approverId?: string): ApprovalRequest[] {
    if (approverId) {
      return approvalQueue.getForApprover(approverId).filter((r) => r.status === ApprovalStatus.PENDING);
    }
    
    return approvalQueue.getPending();
  }

  /**
   * Get approval request by ID
   * 
   * @param requestId - Request ID
   * @returns Approval request (if exists)
   */
  getRequest(requestId: string): ApprovalRequest | null {
    return approvalQueue.get(requestId);
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return approvalQueue.getStats();
  }

  /**
   * Expire old requests
   * 
   * @returns Number of requests expired
   */
  async expireRequests(): Promise<number> {
    const expiredRequests = approvalQueue.getExpired();
    
    for (const request of expiredRequests) {
      approvalQueue.updateStatus(request.id, ApprovalStatus.EXPIRED);

      eventBus.publish({
        type: HITL_EVENTS.APPROVAL_EXPIRED,
        tenantId: request.tenantId,
        timestamp: Date.now(),
        data: {
          requestId: request.id,
          actionType: request.actionType,
          requester: request.requester,
        },
      });

      logger.warn("Approval request expired", {
        requestId: request.id,
        actionType: request.actionType,
        requester: request.requester,
        tenantId: request.tenantId,
      });
    }

    return expiredRequests.length;
  }

  /**
   * Start expiration checker (runs periodically)
   */
  private startExpirationChecker(): void {
    this.expirationCheckInterval = setInterval(async () => {
      const expired = await this.expireRequests();
      if (expired > 0) {
        logger.info("Expired old approval requests", { count: expired });
      }
    }, 60 * 1000); // Check every 1 minute

    logger.info("Expiration checker started");
  }

  /**
   * Stop expiration checker
   */
  stopExpirationChecker(): void {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval);
      this.expirationCheckInterval = null;
      logger.info("Expiration checker stopped");
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `hitl-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  }
}

// Singleton instance
export const hitlApprovalEngine = new HITLApprovalEngine();

