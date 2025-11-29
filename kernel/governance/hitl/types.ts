/**
 * Human-in-the-Loop (HITL) Types
 * 
 * GRCD Compliance: C-8 (Human-in-the-Loop for critical AI decisions)
 * Standard: EU AI Act, ISO 42001
 * 
 * Enables human oversight and approval for high-risk AI actions.
 */

export enum RiskLevel {
  /** Low risk - no approval required */
  LOW = "low",
  
  /** Medium risk - approval recommended */
  MEDIUM = "medium",
  
  /** High risk - approval required */
  HIGH = "high",
  
  /** Critical risk - senior approval required */
  CRITICAL = "critical",
}

export interface ApprovalRequest {
  /** Unique approval request ID */
  id: string;
  
  /** Type of action requiring approval (e.g., "policy.override", "data.delete") */
  actionType: string;
  
  /** Risk level of the action */
  riskLevel: RiskLevel;
  
  /** User/service requesting the action */
  requester: string;
  
  /** Tenant ID */
  tenantId: string;
  
  /** Detailed information about the requested action */
  details: {
    /** Action description */
    description: string;
    
    /** Resources affected */
    affectedResources?: string[];
    
    /** Estimated impact */
    estimatedImpact?: string;
    
    /** Justification for the action */
    justification?: string;
    
    /** Additional context (free-form) */
    context?: Record<string, any>;
  };
  
  /** Timeout (milliseconds) - request expires if not approved */
  timeout: number;
  
  /** Request creation timestamp */
  createdAt: number;
  
  /** Request expiration timestamp */
  expiresAt: number;
  
  /** Current status */
  status: ApprovalStatus;
  
  /** Assigned approvers (optional) */
  assignedApprovers?: string[];
  
  /** Number of approvals required */
  approvalsRequired: number;
  
  /** Approvals received so far */
  approvalsReceived: number;
}

export enum ApprovalStatus {
  /** Pending approval */
  PENDING = "pending",
  
  /** Approved (all required approvals received) */
  APPROVED = "approved",
  
  /** Rejected */
  REJECTED = "rejected",
  
  /** Expired (timeout reached) */
  EXPIRED = "expired",
  
  /** Canceled by requester */
  CANCELED = "canceled",
}

export interface ApprovalDecision {
  /** Request ID */
  requestId: string;
  
  /** Decision (approved or rejected) */
  decision: "approved" | "rejected";
  
  /** Approver identity */
  approverId: string;
  
  /** Reason for approval/rejection */
  reason: string;
  
  /** Decision timestamp */
  timestamp: number;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface ApprovalRule {
  /** Rule ID */
  id: string;
  
  /** Action type pattern (glob or regex) */
  actionTypePattern: string;
  
  /** Risk level for this action type */
  riskLevel: RiskLevel;
  
  /** Whether approval is required */
  requiresApproval: boolean;
  
  /** Timeout (milliseconds) */
  timeout: number;
  
  /** Number of approvals required */
  approvalsRequired: number;
  
  /** Allowed approvers (optional, roles or user IDs) */
  allowedApprovers?: string[];
  
  /** Rule priority (higher = evaluated first) */
  priority: number;
}

export interface ApprovalPolicy {
  /** Policy ID */
  id: string;
  
  /** Policy name */
  name: string;
  
  /** Tenant ID (or "global" for global policies) */
  tenantId: string;
  
  /** Approval rules */
  rules: ApprovalRule[];
  
  /** Default risk level (if no rules match) */
  defaultRiskLevel: RiskLevel;
  
  /** Default timeout (if no rules match) */
  defaultTimeout: number;
  
  /** Auto-expire old requests? */
  autoExpire: boolean;
  
  /** Auto-escalate if timeout approaching? */
  autoEscalate: boolean;
  
  /** Escalation threshold (fraction of timeout remaining) */
  escalationThreshold: number; // 0.0 - 1.0
}

export const DEFAULT_APPROVAL_TIMEOUTS: Record<RiskLevel, number> = {
  [RiskLevel.LOW]: 0, // No approval required
  [RiskLevel.MEDIUM]: 30 * 60 * 1000, // 30 minutes
  [RiskLevel.HIGH]: 2 * 60 * 60 * 1000, // 2 hours
  [RiskLevel.CRITICAL]: 4 * 60 * 60 * 1000, // 4 hours
};

export const DEFAULT_APPROVALS_REQUIRED: Record<RiskLevel, number> = {
  [RiskLevel.LOW]: 0,
  [RiskLevel.MEDIUM]: 1,
  [RiskLevel.HIGH]: 1,
  [RiskLevel.CRITICAL]: 2, // Requires 2 approvals for critical actions
};

/**
 * HITL Events
 */
export const HITL_EVENTS = {
  APPROVAL_REQUESTED: "hitl.approval.requested",
  APPROVAL_APPROVED: "hitl.approval.approved",
  APPROVAL_REJECTED: "hitl.approval.rejected",
  APPROVAL_EXPIRED: "hitl.approval.expired",
  APPROVAL_CANCELED: "hitl.approval.canceled",
  APPROVAL_ESCALATED: "hitl.approval.escalated",
} as const;

/**
 * HITL Action Types (common patterns)
 */
export const HITL_ACTION_TYPES = {
  /** Policy override */
  POLICY_OVERRIDE: "policy.override",
  
  /** Data deletion */
  DATA_DELETE: "data.delete",
  
  /** Data export */
  DATA_EXPORT: "data.export",
  
  /** Configuration change */
  CONFIG_CHANGE: "config.change",
  
  /** User permission grant */
  PERMISSION_GRANT: "permission.grant",
  
  /** Financial transaction */
  FINANCIAL_TRANSACTION: "financial.transaction",
  
  /** Model deployment */
  MODEL_DEPLOY: "model.deploy",
  
  /** Schema migration */
  SCHEMA_MIGRATE: "schema.migrate",
} as const;

