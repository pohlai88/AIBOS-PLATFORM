/**
 * Orchestra Audit Logger
 * 
 * GRCD-KERNEL v4.0.0 F-16: Orchestra manifest validation & audit
 * Audits all orchestra operations and coordination sessions
 */

import type {
  OrchestraManifest,
  OrchestrationDomain,
  OrchestraActionRequest,
  OrchestraActionResult,
  OrchestraCoordinationSession,
} from "../types";
import { AuditLogger } from "../../audit/audit-logger";

/**
 * Orchestra Audit Event Types
 */
export type OrchestraAuditEventType =
  | "orchestra.manifest.registered"
  | "orchestra.manifest.validated"
  | "orchestra.manifest.disabled"
  | "orchestra.action.started"
  | "orchestra.action.completed"
  | "orchestra.action.failed"
  | "orchestra.coordination.started"
  | "orchestra.coordination.completed"
  | "orchestra.coordination.failed"
  | "orchestra.cross_auth.granted"
  | "orchestra.cross_auth.denied";

/**
 * Orchestra Audit Context
 */
export interface OrchestraAuditContext {
  tenantId?: string;
  userId?: string;
  traceId?: string;
  orchestrationId?: string;
}

/**
 * Orchestra Audit Logger - Singleton wrapper around AuditLogger
 */
export class OrchestraAuditLogger {
  private static instance: OrchestraAuditLogger;
  private auditLogger: AuditLogger;

  private constructor() {
    this.auditLogger = new AuditLogger();
  }

  public static getInstance(): OrchestraAuditLogger {
    if (!OrchestraAuditLogger.instance) {
      OrchestraAuditLogger.instance = new OrchestraAuditLogger();
    }
    return OrchestraAuditLogger.instance;
  }

  /**
   * Audit orchestra manifest registration
   */
  async auditManifestRegistered(
    manifest: OrchestraManifest,
    manifestHash: string,
    context?: OrchestraAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: "orchestra.manifest.registered",
      resource: `orchestra://manifests/${manifest.domain}`,
      category: "kernel",
      severity: "info",
      details: {
        domain: manifest.domain,
        manifestName: manifest.name,
        manifestVersion: manifest.version,
        manifestHash,
        agentsCount: manifest.agents.length,
        toolsCount: manifest.tools.length,
        policiesCount: manifest.policies.length,
        dependencies: manifest.dependencies || [],
        traceId: context?.traceId,
      },
    });
  }

  /**
   * Audit orchestra action execution
   */
  async auditAction(
    request: OrchestraActionRequest,
    result: OrchestraActionResult,
    context?: OrchestraAuditContext
  ): Promise<void> {
    const action = result.success
      ? "orchestra.action.completed"
      : "orchestra.action.failed";

    await this.auditLogger.log({
      tenantId: request.context.tenantId || context?.tenantId || null,
      subject: request.context.userId || context?.userId || "system",
      action,
      resource: `orchestra://${request.domain}/actions/${request.action}`,
      category: "kernel",
      severity: result.success ? "info" : "error",
      details: {
        domain: request.domain,
        actionName: request.action,
        arguments: request.arguments,
        success: result.success,
        executionTimeMs: result.metadata?.executionTimeMs,
        agentsInvolved: result.metadata?.agentsInvolved,
        toolsUsed: result.metadata?.toolsUsed,
        error: result.error,
        traceId: request.context.traceId || context?.traceId,
        orchestrationId: request.context.orchestrationId || context?.orchestrationId,
      },
    });
  }

  /**
   * Audit coordination session
   */
  async auditCoordination(
    eventType: "started" | "completed" | "failed",
    session: OrchestraCoordinationSession,
    context?: OrchestraAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: session.context.tenantId || context?.tenantId || null,
      subject: session.context.userId || context?.userId || "system",
      action: `orchestra.coordination.${eventType}`,
      resource: `orchestra://coordination/${session.orchestrationId}`,
      category: "kernel",
      severity: eventType === "failed" ? "error" : "info",
      details: {
        orchestrationId: session.orchestrationId,
        initiatingDomain: session.initiatingDomain,
        involvedDomains: session.involvedDomains,
        status: session.status,
        startedAt: session.startedAt,
        traceId: session.context.traceId || context?.traceId,
      },
    });
  }

  /**
   * Audit cross-orchestra authorization
   */
  async auditCrossAuth(
    sourceDomain: OrchestrationDomain,
    targetDomain: OrchestrationDomain,
    action: string,
    allowed: boolean,
    reason?: string,
    context?: OrchestraAuditContext
  ): Promise<void> {
    const auditAction = allowed
      ? "orchestra.cross_auth.granted"
      : "orchestra.cross_auth.denied";

    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: auditAction,
      resource: `orchestra://${sourceDomain}/cross-auth/${targetDomain}`,
      category: "kernel",
      severity: allowed ? "info" : "warn",
      details: {
        sourceDomain,
        targetDomain,
        action,
        allowed,
        reason,
        traceId: context?.traceId,
      },
    });
  }

  /**
   * Audit orchestra disabled
   */
  async auditManifestDisabled(
    domain: OrchestrationDomain,
    reason?: string,
    context?: OrchestraAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: "orchestra.manifest.disabled",
      resource: `orchestra://manifests/${domain}`,
      category: "kernel",
      severity: "warn",
      details: {
        domain,
        reason: reason || "Manual disable",
        traceId: context?.traceId,
      },
    });
  }
}

/**
 * Export singleton instance
 */
export const orchestraAuditLogger = OrchestraAuditLogger.getInstance();

