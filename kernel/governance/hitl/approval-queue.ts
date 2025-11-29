/**
 * Approval Queue Manager
 * 
 * GRCD Compliance: C-8 (Human-in-the-Loop)
 * Standard: EU AI Act, ISO 42001
 * 
 * Manages pending approval requests in memory (with optional persistence).
 */

import {
  ApprovalRequest,
  ApprovalStatus,
  RiskLevel,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("hitl-approval-queue");

export interface QueueFilter {
  /** Filter by tenant ID */
  tenantId?: string;
  
  /** Filter by status */
  status?: ApprovalStatus;
  
  /** Filter by risk level */
  riskLevel?: RiskLevel;
  
  /** Filter by assigned approver */
  assignedApprover?: string;
  
  /** Filter by requester */
  requester?: string;
  
  /** Only show expired requests */
  expiredOnly?: boolean;
}

export class ApprovalQueue {
  private queue: Map<string, ApprovalRequest> = new Map();
  private tenantIndex: Map<string, Set<string>> = new Map(); // tenantId -> request IDs
  private approverIndex: Map<string, Set<string>> = new Map(); // approverId -> request IDs
  private statusIndex: Map<ApprovalStatus, Set<string>> = new Map(); // status -> request IDs

  constructor() {
    // Initialize status indexes
    Object.values(ApprovalStatus).forEach((status) => {
      this.statusIndex.set(status, new Set());
    });

    logger.info("ApprovalQueue initialized");
  }

  /**
   * Add a request to the queue
   * 
   * @param request - Approval request
   */
  enqueue(request: ApprovalRequest): void {
    // Add to main queue
    this.queue.set(request.id, request);

    // Update indexes
    this.updateIndexes(request);

    logger.info("Request enqueued", {
      requestId: request.id,
      actionType: request.actionType,
      riskLevel: request.riskLevel,
      requester: request.requester,
      tenantId: request.tenantId,
      expiresAt: request.expiresAt,
    });
  }

  /**
   * Remove a request from the queue
   * 
   * @param requestId - Request ID
   * @returns Removed request (if exists)
   */
  dequeue(requestId: string): ApprovalRequest | null {
    const request = this.queue.get(requestId);
    
    if (!request) {
      logger.warn("Request not found in queue", { requestId });
      return null;
    }

    // Remove from main queue
    this.queue.delete(requestId);

    // Remove from indexes
    this.removeFromIndexes(request);

    logger.info("Request dequeued", {
      requestId,
      actionType: request.actionType,
      status: request.status,
    });

    return request;
  }

  /**
   * Get a request by ID
   * 
   * @param requestId - Request ID
   * @returns Request (if exists)
   */
  get(requestId: string): ApprovalRequest | null {
    return this.queue.get(requestId) || null;
  }

  /**
   * Update a request's status
   * 
   * @param requestId - Request ID
   * @param status - New status
   */
  updateStatus(requestId: string, status: ApprovalStatus): void {
    const request = this.queue.get(requestId);
    
    if (!request) {
      logger.warn("Cannot update status: request not found", { requestId });
      return;
    }

    const oldStatus = request.status;
    request.status = status;

    // Update status index
    this.statusIndex.get(oldStatus)?.delete(requestId);
    this.statusIndex.get(status)?.add(requestId);

    logger.debug("Request status updated", {
      requestId,
      oldStatus,
      newStatus: status,
    });
  }

  /**
   * Increment approvals received count
   * 
   * @param requestId - Request ID
   */
  incrementApprovals(requestId: string): void {
    const request = this.queue.get(requestId);
    
    if (!request) {
      logger.warn("Cannot increment approvals: request not found", { requestId });
      return;
    }

    request.approvalsReceived++;

    logger.debug("Approvals incremented", {
      requestId,
      approvalsReceived: request.approvalsReceived,
      approvalsRequired: request.approvalsRequired,
    });
  }

  /**
   * Get all pending requests
   * 
   * @param filter - Optional filter
   * @returns Array of pending requests
   */
  getPending(filter?: QueueFilter): ApprovalRequest[] {
    return this.getFiltered({ ...filter, status: ApprovalStatus.PENDING });
  }

  /**
   * Get all expired requests
   * 
   * @returns Array of expired requests
   */
  getExpired(): ApprovalRequest[] {
    const now = Date.now();
    
    return Array.from(this.queue.values()).filter((request) => {
      return request.status === ApprovalStatus.PENDING && request.expiresAt <= now;
    });
  }

  /**
   * Get requests approaching expiration
   * 
   * @param thresholdMs - Time threshold (milliseconds before expiration)
   * @returns Array of requests approaching expiration
   */
  getApproachingExpiration(thresholdMs: number = 10 * 60 * 1000): ApprovalRequest[] {
    const now = Date.now();
    const threshold = now + thresholdMs;
    
    return Array.from(this.queue.values()).filter((request) => {
      return (
        request.status === ApprovalStatus.PENDING &&
        request.expiresAt > now &&
        request.expiresAt <= threshold
      );
    });
  }

  /**
   * Get filtered requests
   * 
   * @param filter - Filter criteria
   * @returns Array of matching requests
   */
  getFiltered(filter: QueueFilter): ApprovalRequest[] {
    let requests: ApprovalRequest[] = Array.from(this.queue.values());

    // Filter by tenant
    if (filter.tenantId) {
      const tenantRequestIds = this.tenantIndex.get(filter.tenantId);
      if (tenantRequestIds) {
        requests = requests.filter((r) => tenantRequestIds.has(r.id));
      } else {
        return []; // No requests for this tenant
      }
    }

    // Filter by status
    if (filter.status) {
      requests = requests.filter((r) => r.status === filter.status);
    }

    // Filter by risk level
    if (filter.riskLevel) {
      requests = requests.filter((r) => r.riskLevel === filter.riskLevel);
    }

    // Filter by assigned approver
    if (filter.assignedApprover) {
      requests = requests.filter((r) => {
        return r.assignedApprovers?.includes(filter.assignedApprover!) ?? false;
      });
    }

    // Filter by requester
    if (filter.requester) {
      requests = requests.filter((r) => r.requester === filter.requester);
    }

    // Filter by expired
    if (filter.expiredOnly) {
      const now = Date.now();
      requests = requests.filter((r) => r.expiresAt <= now);
    }

    return requests;
  }

  /**
   * Get all requests for an approver
   * 
   * @param approverId - Approver ID
   * @returns Array of requests assigned to this approver
   */
  getForApprover(approverId: string): ApprovalRequest[] {
    const requestIds = this.approverIndex.get(approverId);
    
    if (!requestIds) {
      return [];
    }

    return Array.from(requestIds)
      .map((id) => this.queue.get(id))
      .filter((r): r is ApprovalRequest => r !== undefined);
  }

  /**
   * Get queue statistics
   * 
   * @returns Queue statistics
   */
  getStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    canceled: number;
    byRiskLevel: Record<RiskLevel, number>;
    byTenant: Record<string, number>;
  } {
    const stats = {
      total: this.queue.size,
      pending: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      canceled: 0,
      byRiskLevel: {
        [RiskLevel.LOW]: 0,
        [RiskLevel.MEDIUM]: 0,
        [RiskLevel.HIGH]: 0,
        [RiskLevel.CRITICAL]: 0,
      },
      byTenant: {} as Record<string, number>,
    };

    for (const request of this.queue.values()) {
      // Count by status
      switch (request.status) {
        case ApprovalStatus.PENDING:
          stats.pending++;
          break;
        case ApprovalStatus.APPROVED:
          stats.approved++;
          break;
        case ApprovalStatus.REJECTED:
          stats.rejected++;
          break;
        case ApprovalStatus.EXPIRED:
          stats.expired++;
          break;
        case ApprovalStatus.CANCELED:
          stats.canceled++;
          break;
      }

      // Count by risk level
      stats.byRiskLevel[request.riskLevel]++;

      // Count by tenant
      stats.byTenant[request.tenantId] = (stats.byTenant[request.tenantId] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clear all completed requests (approved, rejected, expired, canceled)
   * 
   * @returns Number of requests cleared
   */
  clearCompleted(): number {
    const completedStatuses = [
      ApprovalStatus.APPROVED,
      ApprovalStatus.REJECTED,
      ApprovalStatus.EXPIRED,
      ApprovalStatus.CANCELED,
    ];

    let cleared = 0;

    for (const request of this.queue.values()) {
      if (completedStatuses.includes(request.status)) {
        this.dequeue(request.id);
        cleared++;
      }
    }

    logger.info("Cleared completed requests", { count: cleared });
    return cleared;
  }

  /**
   * Clear all requests (for testing)
   */
  clear(): void {
    this.queue.clear();
    this.tenantIndex.clear();
    this.approverIndex.clear();
    this.statusIndex.forEach((set) => set.clear());
    logger.warn("Queue cleared");
  }

  /**
   * Get queue size
   * 
   * @returns Number of requests in queue
   */
  get size(): number {
    return this.queue.size;
  }

  /**
   * Update indexes when adding a request
   */
  private updateIndexes(request: ApprovalRequest): void {
    // Tenant index
    if (!this.tenantIndex.has(request.tenantId)) {
      this.tenantIndex.set(request.tenantId, new Set());
    }
    this.tenantIndex.get(request.tenantId)!.add(request.id);

    // Status index
    this.statusIndex.get(request.status)?.add(request.id);

    // Approver index
    if (request.assignedApprovers) {
      for (const approverId of request.assignedApprovers) {
        if (!this.approverIndex.has(approverId)) {
          this.approverIndex.set(approverId, new Set());
        }
        this.approverIndex.get(approverId)!.add(request.id);
      }
    }
  }

  /**
   * Remove request from indexes
   */
  private removeFromIndexes(request: ApprovalRequest): void {
    // Tenant index
    this.tenantIndex.get(request.tenantId)?.delete(request.id);

    // Status index
    this.statusIndex.get(request.status)?.delete(request.id);

    // Approver index
    if (request.assignedApprovers) {
      for (const approverId of request.assignedApprovers) {
        this.approverIndex.get(approverId)?.delete(request.id);
      }
    }
  }
}

// Singleton instance
export const approvalQueue = new ApprovalQueue();

