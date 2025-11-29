/**
 * Policy Evaluation Engine
 * 
 * GRCD-KERNEL v4.0.0 C-6: Policy evaluation with precedence
 * Evaluates requests against registered policies and enforces governance
 */

import type {
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  PolicyManifest,
  PolicyRule,
  PolicyCondition,
} from "../types";
import { policyRegistry } from "../registry/policy-registry";
import { policyPrecedenceResolver } from "./precedence-resolver";
import { baseLogger as logger } from "../../observability/logger";
import { policyAuditLogger } from "../audit/policy-audit";
import { policyEventEmitter } from "../events/policy-events";
import { recordPolicyEvaluation, recordPolicyConflict } from "../telemetry/policy-metrics";

/**
 * Policy Evaluation Engine
 */
export class PolicyEngine {
  private static instance: PolicyEngine;

  private constructor() { }

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  /**
   * Evaluate a request against all applicable policies
   * 
   * @param request - The request to evaluate
   * @returns Evaluation result (allowed/denied)
   */
  public async evaluate(
    request: PolicyEvaluationRequest
  ): Promise<PolicyEvaluationResult> {
    const startTime = Date.now();

    logger.debug({
      action: request.action,
      orchestra: request.orchestra,
      tenantId: request.tenantId,
      userId: request.userId,
    }, "[PolicyEngine] Evaluating request");

    // Step 1: Find all applicable policies
    const applicablePolicies = policyRegistry.listByScope({
      orchestra: request.orchestra,
      tenant: request.tenantId,
      role: request.roles?.[0], // Simplified - in production, check all roles
      action: request.action,
      resource: request.resource,
    });

    if (applicablePolicies.length === 0) {
      // No policies apply - default to allow
      logger.info({
        action: request.action,
        orchestra: request.orchestra,
      }, "[PolicyEngine] No applicable policies found, defaulting to ALLOW");

      return {
        allowed: true,
        evaluatedPolicies: [],
        reason: "No policies apply to this request (default allow)",
        metadata: {
          evaluationTimeMs: Date.now() - startTime,
          policiesChecked: 0,
          conflictsResolved: 0,
        },
      };
    }

    // Step 2: Evaluate each policy's rules
    const evaluatedPolicies: {
      policy: PolicyManifest;
      effect: "allow" | "deny";
      reason?: string;
    }[] = [];

    for (const entry of applicablePolicies) {
      const policyEffect = this.evaluatePolicy(entry.manifest, request);

      if (policyEffect) {
        evaluatedPolicies.push({
          policy: entry.manifest,
          effect: policyEffect.effect,
          reason: policyEffect.reason,
        });
      }
    }

    if (evaluatedPolicies.length === 0) {
      // Policies apply but none of their rules matched
      return {
        allowed: true,
        evaluatedPolicies: [],
        reason: "Policies found but no rules matched (default allow)",
        metadata: {
          evaluationTimeMs: Date.now() - startTime,
          policiesChecked: applicablePolicies.length,
          conflictsResolved: 0,
        },
      };
    }

    // Step 3: Resolve precedence if multiple policies apply
    const resolution = policyPrecedenceResolver.resolve(evaluatedPolicies);

    const allowed = resolution.winningPolicy.effect === "allow";

    logger.info({
      action: request.action,
      allowed,
      winningPolicy: resolution.winningPolicy.policyName,
      precedence: resolution.winningPolicy.precedence,
      conflictDetected: !!resolution.conflict,
    }, `[PolicyEngine] Request ${allowed ? "ALLOWED" : "DENIED"}`);

    const result: PolicyEvaluationResult = {
      allowed,
      evaluatedPolicies: evaluatedPolicies.map((p) => ({
        policyId: p.policy.id,
        policyName: p.policy.name,
        precedence: p.policy.precedence,
        effect: p.effect,
        reason: p.reason,
      })),
      winningPolicy: resolution.winningPolicy,
      reason: resolution.reason,
      warnings: resolution.conflict ? [`Policy conflict resolved: ${resolution.conflict.resolution.reason}`] : undefined,
      metadata: {
        evaluationTimeMs: Date.now() - startTime,
        policiesChecked: applicablePolicies.length,
        conflictsResolved: resolution.conflict ? 1 : 0,
      },
    };

    // Emit audit, events, metrics
    await policyAuditLogger.auditPolicyEvaluation(request, result);
    await policyEventEmitter.emitPolicyEvaluated(request, result);

    if (!allowed) {
      await policyAuditLogger.auditPolicyViolation(request, result);
      await policyEventEmitter.emitPolicyViolated(request, result);
    }

    if (resolution.conflict) {
      await policyAuditLogger.auditConflictResolution(request, result);
      await policyEventEmitter.emitConflictResolved(request, result);
      recordPolicyConflict(resolution.winningPolicy.precedence);
    }

    recordPolicyEvaluation(
      allowed,
      result.metadata.evaluationTimeMs,
      resolution.winningPolicy.precedence,
      request.orchestra,
      applicablePolicies.length
    );

    return result;
  }

  /**
   * Evaluate a single policy against a request
   * 
   * @param policy - Policy to evaluate
   * @param request - Request context
   * @returns Effect (allow/deny) if any rules match, null if no match
   */
  private evaluatePolicy(
    policy: PolicyManifest,
    request: PolicyEvaluationRequest
  ): { effect: "allow" | "deny"; reason: string } | null {
    // Evaluate all rules in the policy
    for (const rule of policy.rules) {
      const ruleMatches = this.evaluateRule(rule, request);

      if (ruleMatches) {
        logger.debug({
          policyId: policy.id,
          ruleId: rule.id,
          effect: rule.effect,
        }, "[PolicyEngine] Rule matched");

        return {
          effect: rule.effect,
          reason: `Rule '${rule.id}' matched: ${rule.description}`,
        };
      }
    }

    // No rules matched
    return null;
  }

  /**
   * Evaluate a single rule's conditions
   * 
   * @param rule - Rule to evaluate
   * @param request - Request context
   * @returns true if all conditions match, false otherwise
   */
  private evaluateRule(
    rule: PolicyRule,
    request: PolicyEvaluationRequest
  ): boolean {
    // All conditions must be true (AND logic)
    return rule.conditions.every((condition) =>
      this.evaluateCondition(condition, request)
    );
  }

  /**
   * Evaluate a single condition
   * 
   * @param condition - Condition to evaluate
   * @param request - Request context
   * @returns true if condition matches, false otherwise
   */
  private evaluateCondition(
    condition: PolicyCondition,
    request: PolicyEvaluationRequest
  ): boolean {
    // Get the field value from request context
    const fieldValue = this.getFieldValue(condition.field, request);

    switch (condition.operator) {
      case "eq":
        return fieldValue === condition.value;

      case "ne":
        return fieldValue !== condition.value;

      case "gt":
        return typeof fieldValue === "number" && fieldValue > condition.value;

      case "lt":
        return typeof fieldValue === "number" && fieldValue < condition.value;

      case "gte":
        return typeof fieldValue === "number" && fieldValue >= condition.value;

      case "lte":
        return typeof fieldValue === "number" && fieldValue <= condition.value;

      case "in":
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);

      case "nin":
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue);

      case "contains":
        if (typeof fieldValue === "string") {
          return fieldValue.includes(condition.value);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        return false;

      case "regex":
        if (typeof fieldValue === "string") {
          const regex = new RegExp(condition.value);
          return regex.test(fieldValue);
        }
        return false;

      default:
        logger.warn({ operator: condition.operator }, "[PolicyEngine] Unknown operator");
        return false;
    }
  }

  /**
   * Get field value from request context
   * 
   * Supports dot notation (e.g., "context.tenantId")
   */
  private getFieldValue(field: string, request: PolicyEvaluationRequest): any {
    // Handle top-level fields
    if (field in request) {
      return (request as any)[field];
    }

    // Handle nested fields with dot notation
    const parts = field.split(".");
    let value: any = request;

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Check if a specific action is allowed (convenience method)
   */
  public async isAllowed(
    action: string,
    context: Record<string, any>,
    options?: {
      orchestra?: string;
      tenantId?: string;
      userId?: string;
      roles?: string[];
      resource?: string;
      traceId?: string;
    }
  ): Promise<boolean> {
    const result = await this.evaluate({
      action,
      context,
      ...options,
    });

    return result.allowed;
  }
}

/**
 * Export singleton instance
 */
export const policyEngine = PolicyEngine.getInstance();

