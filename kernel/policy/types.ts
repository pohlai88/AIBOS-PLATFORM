/**
 * Policy Types
 * 
 * GRCD-KERNEL v4.0.0 C-6: Policy Precedence (Legal > Industry > Internal)
 * Type definitions for the AI-BOS Policy Governance system
 */

/**
 * Policy Precedence Levels
 * 
 * Legal > Industry > Internal
 * Higher number = higher precedence
 */
export enum PolicyPrecedence {
  /** Internal company policies (lowest priority) */
  INTERNAL = 1,
  
  /** Industry-standard policies (medium priority) */
  INDUSTRY = 2,
  
  /** Legal/regulatory policies (highest priority) */
  LEGAL = 3,
}

/**
 * Policy Status
 */
export enum PolicyStatus {
  /** Policy is active and enforced */
  ACTIVE = "active",
  
  /** Policy is disabled (not enforced) */
  DISABLED = "disabled",
  
  /** Policy is in draft (not enforced) */
  DRAFT = "draft",
  
  /** Policy is deprecated (will be removed) */
  DEPRECATED = "deprecated",
}

/**
 * Policy Enforcement Mode
 */
export enum PolicyEnforcementMode {
  /** Block the action if policy violated */
  ENFORCE = "enforce",
  
  /** Warn but allow the action */
  WARN = "warn",
  
  /** Monitor only (log violation) */
  MONITOR = "monitor",
}

/**
 * Policy Scope
 * 
 * Defines what the policy applies to
 */
export interface PolicyScope {
  /** Orchestras this policy applies to */
  orchestras?: string[];
  
  /** Tenants this policy applies to */
  tenants?: string[];
  
  /** Users/roles this policy applies to */
  roles?: string[];
  
  /** Actions this policy applies to */
  actions?: string[];
  
  /** Resources this policy applies to */
  resources?: string[];
}

/**
 * Policy Condition
 * 
 * Conditions under which the policy is evaluated
 */
export interface PolicyCondition {
  /** Field to evaluate */
  field: string;
  
  /** Operator (eq, ne, gt, lt, in, contains, etc.) */
  operator: "eq" | "ne" | "gt" | "lt" | "gte" | "lte" | "in" | "nin" | "contains" | "regex";
  
  /** Value to compare against */
  value: any;
}

/**
 * Policy Rule
 * 
 * The actual rule to enforce
 */
export interface PolicyRule {
  /** Rule ID */
  id: string;
  
  /** Rule description */
  description: string;
  
  /** Conditions that must be met */
  conditions: PolicyCondition[];
  
  /** Effect when conditions match */
  effect: "allow" | "deny";
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Policy Manifest
 * 
 * Complete policy definition
 */
export interface PolicyManifest {
  /** Policy ID (unique) */
  id: string;
  
  /** Policy name */
  name: string;
  
  /** Policy version (semver) */
  version: string;
  
  /** Policy description */
  description: string;
  
  /** Policy precedence level */
  precedence: PolicyPrecedence;
  
  /** Policy status */
  status: PolicyStatus;
  
  /** Enforcement mode */
  enforcementMode: PolicyEnforcementMode;
  
  /** Policy scope */
  scope: PolicyScope;
  
  /** Policy rules */
  rules: PolicyRule[];
  
  /** Effective date (when policy becomes active) */
  effectiveDate?: Date;
  
  /** Expiration date (when policy expires) */
  expirationDate?: Date;
  
  /** Policy owner/author */
  owner?: string;
  
  /** Tags for categorization */
  tags?: string[];
  
  /** Additional metadata */
  metadata?: {
    /** Source of the policy (e.g., "GDPR", "HIPAA", "SOC2") */
    source?: string;
    
    /** Reference URL */
    referenceUrl?: string;
    
    /** Compliance framework */
    complianceFramework?: string;
    
    /** Custom metadata */
    [key: string]: any;
  };
}

/**
 * Policy Registry Entry
 */
export interface PolicyRegistryEntry {
  /** Policy manifest */
  manifest: PolicyManifest;
  
  /** Manifest hash (for integrity) */
  manifestHash: string;
  
  /** When policy was registered */
  registeredAt: Date;
  
  /** When policy was last updated */
  updatedAt?: Date;
  
  /** Current status */
  status: PolicyStatus;
  
  /** Error message if status is error */
  errorMessage?: string;
}

/**
 * Policy Evaluation Request
 */
export interface PolicyEvaluationRequest {
  /** Tenant ID */
  tenantId?: string;
  
  /** User ID */
  userId?: string;
  
  /** User roles */
  roles?: string[];
  
  /** Orchestra domain */
  orchestra?: string;
  
  /** Action being performed */
  action: string;
  
  /** Resource being accessed */
  resource?: string;
  
  /** Request context */
  context: Record<string, any>;
  
  /** Trace ID for correlation */
  traceId?: string;
}

/**
 * Policy Evaluation Result
 */
export interface PolicyEvaluationResult {
  /** Whether the action is allowed */
  allowed: boolean;
  
  /** Policies that were evaluated */
  evaluatedPolicies: {
    policyId: string;
    policyName: string;
    precedence: PolicyPrecedence;
    effect: "allow" | "deny";
    reason?: string;
  }[];
  
  /** The winning policy (highest precedence) */
  winningPolicy?: {
    policyId: string;
    policyName: string;
    precedence: PolicyPrecedence;
    effect: "allow" | "deny";
  };
  
  /** Reason for the decision */
  reason: string;
  
  /** Warnings (if any) */
  warnings?: string[];
  
  /** Metadata */
  metadata?: {
    evaluationTimeMs: number;
    policiesChecked: number;
    conflictsResolved: number;
  };
}

/**
 * Policy Conflict
 * 
 * When multiple policies apply with different effects
 */
export interface PolicyConflict {
  /** Policies in conflict */
  policies: {
    policyId: string;
    policyName: string;
    precedence: PolicyPrecedence;
    effect: "allow" | "deny";
  }[];
  
  /** How the conflict was resolved */
  resolution: {
    winningPolicyId: string;
    reason: string;
  };
}

/**
 * Policy Event Types
 */
export const POLICY_EVENTS = {
  POLICY_REGISTERED: "kernel.policy.registered",
  POLICY_UPDATED: "kernel.policy.updated",
  POLICY_DISABLED: "kernel.policy.disabled",
  POLICY_EVALUATED: "kernel.policy.evaluated",
  POLICY_VIOLATED: "kernel.policy.violated",
  POLICY_CONFLICT_RESOLVED: "kernel.policy.conflict_resolved",
} as const;

/**
 * Policy Metrics
 */
export interface PolicyMetrics {
  policyId: string;
  totalEvaluations: number;
  allowedCount: number;
  deniedCount: number;
  averageEvaluationTimeMs: number;
  lastEvaluatedAt?: Date;
}
