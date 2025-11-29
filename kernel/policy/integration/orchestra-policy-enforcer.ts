/**
 * Orchestra Policy Enforcer
 * 
 * GRCD-KERNEL v4.0.0 C-6: Policy enforcement for Orchestra operations
 * Integrates policy engine with orchestra conductor
 */

import type {
  OrchestraActionRequest,
  OrchestraActionResult,
} from "../../orchestras/types";
import { policyEngine } from "../engine/policy-engine";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Orchestra Policy Enforcer
 * 
 * Middleware for orchestra actions to enforce policies
 */
export class OrchestraPolicyEnforcer {
  private static instance: OrchestraPolicyEnforcer;

  private constructor() {}

  public static getInstance(): OrchestraPolicyEnforcer {
    if (!OrchestraPolicyEnforcer.instance) {
      OrchestraPolicyEnforcer.instance = new OrchestraPolicyEnforcer();
    }
    return OrchestraPolicyEnforcer.instance;
  }

  /**
   * Enforce policies before orchestra action execution
   * 
   * @param request - Orchestra action request
   * @returns true if allowed, false if denied
   */
  public async enforceBeforeAction(
    request: OrchestraActionRequest
  ): Promise<{
    allowed: boolean;
    reason?: string;
    policyResult?: any;
  }> {
    logger.debug({
      domain: request.domain,
      action: request.action,
      tenantId: request.context.tenantId,
    }, "[OrchestraPolicyEnforcer] Enforcing policies");

    // Evaluate policies
    const policyResult = await policyEngine.evaluate({
      orchestra: request.domain,
      action: request.action,
      tenantId: request.context.tenantId,
      userId: request.context.userId,
      roles: request.context.roles,
      resource: `orchestra://${request.domain}/${request.action}`,
      context: {
        ...request.context,
        arguments: request.arguments,
      },
      traceId: request.context.traceId,
    });

    if (!policyResult.allowed) {
      logger.warn({
        domain: request.domain,
        action: request.action,
        reason: policyResult.reason,
        winningPolicy: policyResult.winningPolicy,
      }, "[OrchestraPolicyEnforcer] Action DENIED by policy");

      return {
        allowed: false,
        reason: policyResult.reason,
        policyResult,
      };
    }

    logger.debug({
      domain: request.domain,
      action: request.action,
    }, "[OrchestraPolicyEnforcer] Action ALLOWED by policy");

    return {
      allowed: true,
      policyResult,
    };
  }

  /**
   * Create policy denial result
   */
  public createDenialResult(
    request: OrchestraActionRequest,
    reason: string
  ): OrchestraActionResult {
    return {
      success: false,
      domain: request.domain,
      action: request.action,
      error: {
        code: "POLICY_DENIED",
        message: `Action denied by policy: ${reason}`,
        details: {
          domain: request.domain,
          action: request.action,
          reason,
        },
      },
      metadata: {
        executionTimeMs: 0,
      },
    };
  }
}

/**
 * Export singleton instance
 */
export const orchestraPolicyEnforcer = OrchestraPolicyEnforcer.getInstance();

