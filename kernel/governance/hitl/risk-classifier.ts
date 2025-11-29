/**
 * Risk Classifier for HITL
 * 
 * GRCD Compliance: C-8 (Human-in-the-Loop)
 * Standard: EU AI Act, ISO 42001
 * 
 * Classifies actions by risk level to determine approval requirements.
 */

import {
  RiskLevel,
  ApprovalRule,
  ApprovalPolicy,
  DEFAULT_APPROVAL_TIMEOUTS,
  DEFAULT_APPROVALS_REQUIRED,
  HITL_ACTION_TYPES,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("hitl-risk-classifier");

export class RiskClassifier {
  private policies: Map<string, ApprovalPolicy> = new Map();

  constructor() {
    // Register built-in global policy
    this.registerPolicy(this.getBuiltInPolicy());
  }

  /**
   * Classify an action's risk level
   * 
   * @param actionType - Type of action (e.g., "policy.override")
   * @param context - Action context (tenant, user, etc.)
   * @returns Risk level
   */
  classifyAction(actionType: string, context: { tenantId?: string; [key: string]: any }): RiskLevel {
    const tenantId = context.tenantId || "global";
    
    // Get applicable policy (tenant-specific or global)
    const policy =this.policies.get(tenantId) || this.policies.get("global");
    
    if (!policy) {
      logger.warn(`No policy found for tenant ${tenantId}, using default LOW risk`);
      return RiskLevel.LOW;
    }
    
    // Find matching rule (sorted by priority)
    const sortedRules = policy.rules.sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (this.matchesPattern(actionType, rule.actionTypePattern)) {
        logger.debug(`Action matched rule`, {
          actionType,
          ruleId: rule.id,
          riskLevel: rule.riskLevel,
        });
        return rule.riskLevel;
      }
    }
    
    // No rule matched - use default
    logger.debug(`Action did not match any rules, using default`, {
      actionType,
      defaultRiskLevel: policy.defaultRiskLevel,
    });
    return policy.defaultRiskLevel;
  }

  /**
   * Check if action requires approval
   * 
   * @param riskLevel - Risk level of the action
   * @returns Whether approval is required
   */
  requiresApproval(riskLevel: RiskLevel): boolean {
    return riskLevel !== RiskLevel.LOW;
  }

  /**
   * Get approval timeout for risk level
   * 
   * @param riskLevel - Risk level
   * @returns Timeout in milliseconds
   */
  getApprovalTimeout(riskLevel: RiskLevel): number {
    return DEFAULT_APPROVAL_TIMEOUTS[riskLevel];
  }

  /**
   * Get number of approvals required for risk level
   * 
   * @param riskLevel - Risk level
   * @returns Number of approvals required
   */
  getApprovalsRequired(riskLevel: RiskLevel): number {
    return DEFAULT_APPROVALS_REQUIRED[riskLevel];
  }

  /**
   * Register an approval policy
   * 
   * @param policy - Approval policy
   */
  registerPolicy(policy: ApprovalPolicy): void {
    this.policies.set(policy.tenantId, policy);
    logger.info(`Registered approval policy`, {
      policyId: policy.id,
      tenantId: policy.tenantId,
      rulesCount: policy.rules.length,
    });
  }

  /**
   * Get policy for tenant
   * 
   * @param tenantId - Tenant ID
   * @returns Approval policy (if exists)
   */
  getPolicy(tenantId: string): ApprovalPolicy | undefined {
    return this.policies.get(tenantId);
  }

  /**
   * Match action type against pattern (supports wildcards)
   * 
   * @param actionType - Action type
   * @param pattern - Pattern (glob-style with *)
   * @returns Whether action matches pattern
   */
  private matchesPattern(actionType: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, "\\.")
      .replace(/\*/g, ".*");
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(actionType);
  }

  /**
   * Get built-in global policy
   */
  private getBuiltInPolicy(): ApprovalPolicy {
    return {
      id: "global-default-policy",
      name: "Global Default HITL Policy",
      tenantId: "global",
      defaultRiskLevel: RiskLevel.LOW,
      defaultTimeout: 30 * 60 * 1000, // 30 minutes
      autoExpire: true,
      autoEscalate: true,
      escalationThreshold: 0.1, // Escalate when 10% of timeout remaining
      rules: [
        // Critical actions (require 2 approvals)
        {
          id: "critical-data-delete",
          actionTypePattern: "data.delete.*",
          riskLevel: RiskLevel.CRITICAL,
          requiresApproval: true,
          timeout: 4 * 60 * 60 * 1000, // 4 hours
          approvalsRequired: 2,
          priority: 100,
        },
        {
          id: "critical-financial",
          actionTypePattern: "financial.*",
          riskLevel: RiskLevel.CRITICAL,
          requiresApproval: true,
          timeout: 4 * 60 * 60 * 1000,
          approvalsRequired: 2,
          priority: 100,
        },
        
        // High risk actions (require 1 approval)
        {
          id: "high-policy-override",
          actionTypePattern: "policy.override.*",
          riskLevel: RiskLevel.HIGH,
          requiresApproval: true,
          timeout: 2 * 60 * 60 * 1000, // 2 hours
          approvalsRequired: 1,
          priority: 80,
        },
        {
          id: "high-permission-grant",
          actionTypePattern: "permission.grant.*",
          riskLevel: RiskLevel.HIGH,
          requiresApproval: true,
          timeout: 2 * 60 * 60 * 1000,
          approvalsRequired: 1,
          priority: 80,
        },
        {
          id: "high-model-deploy",
          actionTypePattern: "model.deploy.*",
          riskLevel: RiskLevel.HIGH,
          requiresApproval: true,
          timeout: 2 * 60 * 60 * 1000,
          approvalsRequired: 1,
          priority: 80,
        },
        {
          id: "high-schema-migrate",
          actionTypePattern: "schema.migrate.*",
          riskLevel: RiskLevel.HIGH,
          requiresApproval: true,
          timeout: 2 * 60 * 60 * 1000,
          approvalsRequired: 1,
          priority: 80,
        },
        
        // Medium risk actions
        {
          id: "medium-config-change",
          actionTypePattern: "config.change.*",
          riskLevel: RiskLevel.MEDIUM,
          requiresApproval: true,
          timeout: 30 * 60 * 1000, // 30 minutes
          approvalsRequired: 1,
          priority: 50,
        },
        {
          id: "medium-data-export",
          actionTypePattern: "data.export.*",
          riskLevel: RiskLevel.MEDIUM,
          requiresApproval: true,
          timeout: 30 * 60 * 1000,
          approvalsRequired: 1,
          priority: 50,
        },
      ],
    };
  }
}

// Singleton instance
export const riskClassifier = new RiskClassifier();

