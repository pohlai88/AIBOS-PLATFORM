/**
 * Cross-Orchestra Authorization
 * 
 * GRCD-KERNEL v4.0.0 F-17: Cross-orchestra authorization
 * Manages permissions and authorization between orchestras
 */

import type {
  OrchestrationDomain,
  CrossOrchestraAuthRequest,
  CrossOrchestraAuthResult,
  OrchestraExecutionContext,
} from "../types";
import { orchestraRegistry } from "../registry/orchestra-registry";
import { baseLogger as logger } from "../../observability/logger";
import { orchestraAuditLogger } from "../audit/orchestra-audit";
import { orchestraEventEmitter } from "../events/orchestra-events";
import { recordCrossAuthCheck } from "../telemetry/orchestra-metrics";

/**
 * Cross-Orchestra Authorization Rules
 * 
 * Defines which orchestras can communicate with each other
 * and what actions are permitted.
 */
const CROSS_ORCHESTRA_RULES: Record<
  OrchestrationDomain,
  {
    canCallDomains: OrchestrationDomain[];
    canBeCalledBy: OrchestrationDomain[];
    restrictedActions?: string[];
  }
> = {
  [OrchestrationDomain.DATABASE]: {
    canCallDomains: [], // Database is a leaf node
    canBeCalledBy: [
      OrchestrationDomain.BFF_API,
      OrchestrationDomain.BACKEND_INFRA,
      OrchestrationDomain.COMPLIANCE,
    ],
  },
  [OrchestrationDomain.UX_UI]: {
    canCallDomains: [OrchestrationDomain.BFF_API],
    canBeCalledBy: [OrchestrationDomain.BFF_API],
  },
  [OrchestrationDomain.BFF_API]: {
    canCallDomains: [
      OrchestrationDomain.DATABASE,
      OrchestrationDomain.BACKEND_INFRA,
      OrchestrationDomain.UX_UI,
    ],
    canBeCalledBy: [OrchestrationDomain.UX_UI],
  },
  [OrchestrationDomain.BACKEND_INFRA]: {
    canCallDomains: [
      OrchestrationDomain.DATABASE,
      OrchestrationDomain.OBSERVABILITY,
    ],
    canBeCalledBy: [
      OrchestrationDomain.BFF_API,
      OrchestrationDomain.COMPLIANCE,
    ],
  },
  [OrchestrationDomain.COMPLIANCE]: {
    canCallDomains: [
      OrchestrationDomain.DATABASE,
      OrchestrationDomain.BACKEND_INFRA,
      OrchestrationDomain.OBSERVABILITY,
    ],
    canBeCalledBy: [], // Compliance can access all, but cannot be called
  },
  [OrchestrationDomain.OBSERVABILITY]: {
    canCallDomains: [], // Observability is a leaf node (metrics/logs)
    canBeCalledBy: [
      OrchestrationDomain.BACKEND_INFRA,
      OrchestrationDomain.COMPLIANCE,
      OrchestrationDomain.DEVEX,
    ],
  },
  [OrchestrationDomain.FINANCE]: {
    canCallDomains: [
      OrchestrationDomain.DATABASE,
      OrchestrationDomain.COMPLIANCE,
    ],
    canBeCalledBy: [OrchestrationDomain.COMPLIANCE],
    restrictedActions: ["create", "update", "delete"], // Read-only for most
  },
  [OrchestrationDomain.DEVEX]: {
    canCallDomains: [
      OrchestrationDomain.OBSERVABILITY,
      OrchestrationDomain.BACKEND_INFRA,
    ],
    canBeCalledBy: [], // DevEx can observe, but cannot be called
  },
};

/**
 * Cross-Orchestra Authorization Manager
 */
export class CrossOrchestraAuth {
  private static instance: CrossOrchestraAuth;

  private constructor() {}

  public static getInstance(): CrossOrchestraAuth {
    if (!CrossOrchestraAuth.instance) {
      CrossOrchestraAuth.instance = new CrossOrchestraAuth();
    }
    return CrossOrchestraAuth.instance;
  }

  /**
   * Check if source orchestra can call target orchestra
   * 
   * @param request - Cross-orchestra authorization request
   * @returns Authorization result
   */
  public async authorize(
    request: CrossOrchestraAuthRequest
  ): Promise<CrossOrchestraAuthResult> {
    logger.debug(`Checking cross-orchestra auth: ${request.sourceDomain} → ${request.targetDomain}`);

    // 1. Verify both orchestras exist
    if (!orchestraRegistry.isActive(request.sourceDomain)) {
      const result = {
        allowed: false,
        reason: `Source orchestra not active: ${request.sourceDomain}`,
      };

      // Record denial
      await this.recordAuthResult(request, result);

      return result;
    }

    if (!orchestraRegistry.isActive(request.targetDomain)) {
      const result = {
        allowed: false,
        reason: `Target orchestra not active: ${request.targetDomain}`,
      };

      // Record denial
      await this.recordAuthResult(request, result);

      return result;
    }

    // 2. Check cross-orchestra rules
    const rules = CROSS_ORCHESTRA_RULES[request.sourceDomain];
    if (!rules) {
      const result = {
        allowed: false,
        reason: `No rules defined for source domain: ${request.sourceDomain}`,
      };

      await this.recordAuthResult(request, result);

      return result;
    }

    if (!rules.canCallDomains.includes(request.targetDomain)) {
      const result = {
        allowed: false,
        reason: `${request.sourceDomain} is not authorized to call ${request.targetDomain}`,
      };

      await this.recordAuthResult(request, result);

      return result;
    }

    // 3. Check restricted actions
    if (rules.restrictedActions && rules.restrictedActions.includes(request.action)) {
      const result = {
        allowed: false,
        reason: `Action ${request.action} is restricted for ${request.sourceDomain}`,
      };

      await this.recordAuthResult(request, result);

      return result;
    }

    // 4. Check context-based permissions
    const permissionCheck = this.checkContextPermissions(
      request.context,
      request.targetDomain,
      request.action
    );

    if (!permissionCheck.allowed) {
      await this.recordAuthResult(request, permissionCheck);

      return permissionCheck;
    }

    // All checks passed
    logger.info(`✅ Cross-orchestra auth granted: ${request.sourceDomain} → ${request.targetDomain}`);

    const result = {
      allowed: true,
    };

    await this.recordAuthResult(request, result);

    return result;
  }

  /**
   * Record authorization result (audit, events, metrics)
   */
  private async recordAuthResult(
    request: CrossOrchestraAuthRequest,
    result: CrossOrchestraAuthResult
  ): Promise<void> {
    // Audit
    await orchestraAuditLogger.auditCrossAuth(
      request.sourceDomain,
      request.targetDomain,
      request.action,
      result.allowed,
      result.reason,
      {
        tenantId: request.context.tenantId,
        userId: request.context.userId,
        traceId: request.context.traceId,
      }
    );

    // Events
    await orchestraEventEmitter.emitCrossAuth(
      request.sourceDomain,
      request.targetDomain,
      request.action,
      result.allowed
    );

    // Metrics
    recordCrossAuthCheck(request.sourceDomain, request.targetDomain, result.allowed);
  }

  /**
   * Check if a domain can be called by another domain
   */
  public canBeCalled(
    targetDomain: OrchestrationDomain,
    sourceDomain: OrchestrationDomain
  ): boolean {
    const rules = CROSS_ORCHESTRA_RULES[targetDomain];
    if (!rules) return false;

    return rules.canBeCalledBy.includes(sourceDomain);
  }

  /**
   * Get allowed target domains for a source domain
   */
  public getAllowedTargets(
    sourceDomain: OrchestrationDomain
  ): OrchestrationDomain[] {
    const rules = CROSS_ORCHESTRA_RULES[sourceDomain];
    return rules?.canCallDomains || [];
  }

  /**
   * Get domains that can call a target domain
   */
  public getAllowedCallers(
    targetDomain: OrchestrationDomain
  ): OrchestrationDomain[] {
    const rules = CROSS_ORCHESTRA_RULES[targetDomain];
    return rules?.canBeCalledBy || [];
  }

  /**
   * Check context-based permissions
   */
  private checkContextPermissions(
    context: OrchestraExecutionContext,
    targetDomain: OrchestrationDomain,
    action: string
  ): CrossOrchestraAuthResult {
    // Check if user has required permissions
    if (context.permissions) {
      const requiredPermission = `orchestra.${targetDomain}.${action}`;
      if (!context.permissions.includes(requiredPermission)) {
        return {
          allowed: false,
          reason: `Missing required permission: ${requiredPermission}`,
          requiredPermissions: [requiredPermission],
        };
      }
    }

    // Check if user has required roles
    if (context.roles) {
      // Admin role bypasses all restrictions
      if (context.roles.includes("admin")) {
        return { allowed: true };
      }

      // Check if user has orchestra-specific role
      const requiredRole = `orchestra.${targetDomain}`;
      if (!context.roles.includes(requiredRole)) {
        logger.warn(`User missing required role: ${requiredRole}`);
        // Don't block based on roles alone - permissions are primary
      }
    }

    return { allowed: true };
  }
}

/**
 * Export singleton instance
 */
export const crossOrchestraAuth = CrossOrchestraAuth.getInstance();

