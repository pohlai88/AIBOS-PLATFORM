/**
 * Orchestra Conductor - Conductor-of-Conductors Pattern
 * 
 * GRCD-KERNEL v4.0.0 F-15: Coordinate multiple AI orchestras
 * Central coordination engine for all domain-specific orchestras
 */

import type {
  OrchestrationDomain,
  OrchestraActionRequest,
  OrchestraActionResult,
  OrchestraCoordinationSession,
} from "../types";
import { orchestraRegistry } from "../registry/orchestra-registry";
import { baseLogger as logger } from "../../observability/logger";
import { randomUUID } from "crypto";
import { orchestraAuditLogger } from "../audit/orchestra-audit";
import { orchestraEventEmitter } from "../events/orchestra-events";
import {
  recordOrchestraAction,
  recordCoordination,
  recordCoordinationStarted,
  recordCoordinationEnded,
  recordOrchestraError,
} from "../telemetry/orchestra-metrics";
import { orchestraImplementationRegistry } from "../implementations";
import { orchestraPolicyEnforcer } from "../../policy/integration/orchestra-policy-enforcer";
import { hitlApprovalEngine, riskClassifier } from "../../governance/hitl";

/**
 * Orchestra Conductor - Coordinates all domain orchestras
 * 
 * Implements the "conductor-of-conductors" pattern where this central
 * conductor routes requests to appropriate domain-specific orchestras
 * and coordinates cross-orchestra workflows.
 */
export class OrchestraConductor {
  private static instance: OrchestraConductor;
  private activeSessions: Map<string, OrchestraCoordinationSession> = new Map();

  private constructor() { }

  public static getInstance(): OrchestraConductor {
    if (!OrchestraConductor.instance) {
      OrchestraConductor.instance = new OrchestraConductor();
    }
    return OrchestraConductor.instance;
  }

  /**
   * Coordinate an action to a specific orchestra domain
   * 
   * This is the main entry point for all orchestra operations.
   * 
   * @param request - Orchestra action request
   * @returns Action result from the target orchestra
   */
  public async coordinateAction(
    request: OrchestraActionRequest
  ): Promise<OrchestraActionResult> {
    const startTime = Date.now();
    const orchestrationId = request.context.orchestrationId || randomUUID();

    try {
      logger.info({
        orchestrationId,
        domain: request.domain,
        action: request.action,
      }, `🎼 Conducting action: ${request.domain}.${request.action}`);

      // Emit action started event
      await orchestraEventEmitter.emitActionStarted(request);

      // 1. Verify orchestra exists and is active
      const entry = orchestraRegistry.getByDomain(request.domain);
      if (!entry) {
        return this.buildErrorResult(
          request,
          "ORCHESTRA_NOT_FOUND",
          `Orchestra not found for domain: ${request.domain}`,
          startTime
        );
      }

      if (entry.status !== "active") {
        return this.buildErrorResult(
          request,
          "ORCHESTRA_DISABLED",
          `Orchestra is ${entry.status}: ${request.domain}`,
          startTime
        );
      }

      // 2. Validate dependencies are available
      const depsValid = orchestraRegistry.validateDependencies(request.domain);
      if (!depsValid) {
        const deps = orchestraRegistry.getDependencies(request.domain);
        return this.buildErrorResult(
          request,
          "DEPENDENCIES_MISSING",
          `Missing dependencies for ${request.domain}: ${deps.join(", ")}`,
          startTime
        );
      }

      // 2.5. Enforce policies (C-6 requirement)
      const policyCheck = await orchestraPolicyEnforcer.enforceBeforeAction(request);
      if (!policyCheck.allowed) {
        return orchestraPolicyEnforcer.createDenialResult(request, policyCheck.reason || "Policy denied");
      }

      // 2.6. Human-in-the-Loop approval for high-risk actions (F-20 / C-8 requirement)
      const actionType = `${request.domain}.${request.action}`;
      const riskLevel = riskClassifier.classifyAction(actionType, {
        tenantId: request.context.tenantId || "default",
        userId: request.context.userId,
        ...request.context,
      });

      if (riskClassifier.requiresApproval(riskLevel)) {
        logger.info({
          orchestrationId,
          actionType,
          riskLevel,
        }, `🔐 High-risk action requires human approval: ${actionType}`);

        const approvalRequestId = await hitlApprovalEngine.requestApproval({
          actionType,
          requester: request.context.userId || request.context.tenantId || "system",
          tenantId: request.context.tenantId || "default",
          description: `Orchestra action: ${request.domain}.${request.action}`,
          affectedResources: [`orchestra://${request.domain}/${request.action}`],
          context: {
            orchestrationId,
            domain: request.domain,
            action: request.action,
            arguments: request.arguments,
          },
        });

        // Check if auto-approved (low risk) or requires human approval
        if (!approvalRequestId.startsWith("auto-approved-")) {
          logger.info({
            orchestrationId,
            approvalRequestId,
          }, `⏳ Waiting for human approval: ${approvalRequestId}`);

          try {
            const approval = await hitlApprovalEngine.waitForApproval(approvalRequestId);

            if (approval.decision !== "approved") {
              logger.warn({
                orchestrationId,
                approvalRequestId,
                decision: approval.decision,
              }, `❌ Action denied by human approver`);

              return this.buildErrorResult(
                request,
                "HITL_DENIED",
                `Action denied by human approver: ${approval.reason}`,
                startTime
              );
            }

            logger.info({
              orchestrationId,
              approvalRequestId,
            }, `✅ Action approved by human approver`);
          } catch (error) {
            // Approval request expired, rejected, or canceled
            logger.error({
              orchestrationId,
              approvalRequestId,
              error: error instanceof Error ? error.message : String(error),
            }, `❌ Approval request failed`);

            return this.buildErrorResult(
              request,
              "HITL_FAILED",
              `Human approval failed: ${error instanceof Error ? error.message : String(error)}`,
              startTime
            );
          }
        } else {
          logger.debug({
            orchestrationId,
            actionType,
            riskLevel,
          }, `✅ Action auto-approved (low risk)`);
        }
      }

      // 3. Create coordination session
      const session = await this.createSession(request.domain, request.context, orchestrationId);

      // 4. Execute action on target orchestra
      // TODO: Implement actual orchestra execution
      // This will invoke the domain-specific orchestra implementation
      const result = await this.executeOrchestraAction(request, session);

      // 5. Complete session
      this.completeSession(orchestrationId, result.success);

      // 6. Emit audit, events, metrics
      const executionTimeMs = Date.now() - startTime;
      await orchestraAuditLogger.auditAction(request, result);

      if (result.success) {
        await orchestraEventEmitter.emitActionCompleted(request, result);
        recordOrchestraAction(request.domain, request.action, "success", executionTimeMs);
      } else {
        await orchestraEventEmitter.emitActionFailed(request, result);
        recordOrchestraAction(request.domain, request.action, "failed", executionTimeMs);
        recordOrchestraError(
          request.domain,
          result.error?.code || "UNKNOWN",
          "coordinateAction"
        );
      }

      logger.info({
        orchestrationId,
        success: result.success,
        executionTimeMs,
      }, `✅ Action completed: ${request.domain}.${request.action}`);

      return result;
    } catch (error) {
      // Mark session as failed
      const session = this.activeSessions.get(orchestrationId);
      if (session) {
        session.status = "failed";
      }

      logger.error({
        orchestrationId,
        error,
      }, `❌ Action failed: ${request.domain}.${request.action}`);

      return this.buildErrorResult(
        request,
        "EXECUTION_ERROR",
        error instanceof Error ? error.message : "Unknown error",
        startTime
      );
    }
  }

  /**
   * Coordinate a cross-orchestra workflow
   * 
   * This enables orchestrating actions across multiple orchestras in sequence or parallel.
   * 
   * @param requests - Array of action requests to coordinate
   * @param parallel - Execute in parallel (true) or sequence (false)
   * @returns Results from all orchestras
   */
  public async coordinateCrossOrchestra(
    requests: OrchestraActionRequest[],
    parallel: boolean = false
  ): Promise<OrchestraActionResult[]> {
    const startTime = Date.now();
    const orchestrationId = randomUUID();

    logger.info({
      orchestrationId,
      domains: requests.map((r) => r.domain),
      parallel,
    }, `🎭 Cross-orchestra coordination started`);

    // Record coordination started
    recordCoordinationStarted();

    // Add orchestration ID to all requests
    const enrichedRequests = requests.map((req) => ({
      ...req,
      context: {
        ...req.context,
        orchestrationId,
      },
    }));

    let results: OrchestraActionResult[];

    if (parallel) {
      // Execute all in parallel
      results = await Promise.all(
        enrichedRequests.map((req) => this.coordinateAction(req))
      );
    } else {
      // Execute in sequence
      results = [];
      for (const req of enrichedRequests) {
        const result = await this.coordinateAction(req);
        results.push(result);

        // Stop on first failure
        if (!result.success) {
          logger.warn(`Cross-orchestra stopped due to failure in ${req.domain}`);
          break;
        }
      }
    }

    // Record coordination completed
    const allSucceeded = results.every((r) => r.success);
    const executionTimeMs = Date.now() - startTime;

    recordCoordination(
      requests[0].domain,
      allSucceeded ? "success" : "failed",
      requests.length,
      executionTimeMs,
      parallel
    );
    recordCoordinationEnded();

    return results;
  }

  /**
   * Get active coordination session
   */
  public getSession(orchestrationId: string): OrchestraCoordinationSession | null {
    return this.activeSessions.get(orchestrationId) || null;
  }

  /**
   * List all active coordination sessions
   */
  public listActiveSessions(): OrchestraCoordinationSession[] {
    return Array.from(this.activeSessions.values()).filter(
      (s) => s.status === "active"
    );
  }

  /**
   * Create coordination session
   */
  private async createSession(
    domain: OrchestrationDomain,
    context: OrchestraActionRequest["context"],
    orchestrationId: string
  ): Promise<OrchestraCoordinationSession> {
    const session: OrchestraCoordinationSession = {
      orchestrationId,
      initiatingDomain: domain,
      involvedDomains: [domain],
      startedAt: new Date(),
      status: "active",
      context,
    };

    this.activeSessions.set(orchestrationId, session);

    // Emit coordination started event
    await orchestraEventEmitter.emitCoordinationStarted(session);

    return session;
  }

  /**
   * Complete coordination session
   */
  private async completeSession(orchestrationId: string, success: boolean): Promise<void> {
    const session = this.activeSessions.get(orchestrationId);
    if (session) {
      session.status = success ? "completed" : "failed";

      // Emit coordination completed event
      await orchestraEventEmitter.emitCoordinationCompleted(session);

      // Audit the coordination
      await orchestraAuditLogger.auditCoordination(
        success ? "completed" : "failed",
        session
      );
    }
  }

  /**
   * Execute action on target orchestra
   * 
   * Routes the action to the appropriate domain-specific orchestra implementation.
   */
  private async executeOrchestraAction(
    request: OrchestraActionRequest,
    session: OrchestraCoordinationSession
  ): Promise<OrchestraActionResult> {
    // Use the implementation registry to execute the action
    return await orchestraImplementationRegistry.executeAction(request);
  }

  /**
   * Build error result
   */
  private buildErrorResult(
    request: OrchestraActionRequest,
    code: string,
    message: string,
    startTime: number
  ): OrchestraActionResult {
    return {
      success: false,
      domain: request.domain,
      action: request.action,
      error: {
        code,
        message,
      },
      metadata: {
        executionTimeMs: Date.now() - startTime,
      },
    };
  }

  /**
   * Clear all sessions (for testing)
   */
  public clearSessions(): void {
    this.activeSessions.clear();
  }
}

/**
 * Export singleton instance
 */
export const orchestraConductor = OrchestraConductor.getInstance();

