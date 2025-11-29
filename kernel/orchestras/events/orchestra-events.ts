/**
 * Orchestra Event Integration
 * 
 * GRCD-KERNEL v4.0.0 F-15: Coordinate orchestras
 * Emits orchestra lifecycle events to the kernel event bus
 */

import type {
  OrchestraManifest,
  OrchestrationDomain,
  OrchestraActionRequest,
  OrchestraActionResult,
  OrchestraCoordinationSession,
} from "../types";
import { ORCHESTRA_EVENTS } from "../types";
import { eventBus } from "../../events/event-bus";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Orchestra Event Emitter - Emits orchestra lifecycle events
 */
export class OrchestraEventEmitter {
  private static instance: OrchestraEventEmitter;

  private constructor() {}

  public static getInstance(): OrchestraEventEmitter {
    if (!OrchestraEventEmitter.instance) {
      OrchestraEventEmitter.instance = new OrchestraEventEmitter();
    }
    return OrchestraEventEmitter.instance;
  }

  /**
   * Emit manifest registered event
   */
  async emitManifestRegistered(
    manifest: OrchestraManifest,
    manifestHash: string
  ): Promise<void> {
    await this.emit(ORCHESTRA_EVENTS.MANIFEST_REGISTERED, {
      domain: manifest.domain,
      manifestName: manifest.name,
      manifestVersion: manifest.version,
      manifestHash,
      agentsCount: manifest.agents.length,
      toolsCount: manifest.tools.length,
    });
  }

  /**
   * Emit action started event
   */
  async emitActionStarted(request: OrchestraActionRequest): Promise<void> {
    await this.emit(ORCHESTRA_EVENTS.ACTION_STARTED, {
      domain: request.domain,
      action: request.action,
      orchestrationId: request.context.orchestrationId,
      traceId: request.context.traceId,
      tenantId: request.context.tenantId,
    });
  }

  /**
   * Emit action completed event
   */
  async emitActionCompleted(
    request: OrchestraActionRequest,
    result: OrchestraActionResult
  ): Promise<void> {
    await this.emit(ORCHESTRA_EVENTS.ACTION_COMPLETED, {
      domain: request.domain,
      action: request.action,
      success: result.success,
      executionTimeMs: result.metadata?.executionTimeMs,
      orchestrationId: request.context.orchestrationId,
      traceId: request.context.traceId,
      tenantId: request.context.tenantId,
    });
  }

  /**
   * Emit action failed event
   */
  async emitActionFailed(
    request: OrchestraActionRequest,
    result: OrchestraActionResult
  ): Promise<void> {
    await this.emit(ORCHESTRA_EVENTS.ACTION_FAILED, {
      domain: request.domain,
      action: request.action,
      error: result.error,
      executionTimeMs: result.metadata?.executionTimeMs,
      orchestrationId: request.context.orchestrationId,
      traceId: request.context.traceId,
      tenantId: request.context.tenantId,
    });
  }

  /**
   * Emit cross-orchestra auth event
   */
  async emitCrossAuth(
    sourceDomain: OrchestrationDomain,
    targetDomain: OrchestrationDomain,
    action: string,
    allowed: boolean
  ): Promise<void> {
    await this.emit(ORCHESTRA_EVENTS.CROSS_ORCHESTRA_AUTH, {
      sourceDomain,
      targetDomain,
      action,
      allowed,
    });
  }

  /**
   * Emit coordination started event
   */
  async emitCoordinationStarted(session: OrchestraCoordinationSession): Promise<void> {
    await this.emit(ORCHESTRA_EVENTS.COORDINATION_STARTED, {
      orchestrationId: session.orchestrationId,
      initiatingDomain: session.initiatingDomain,
      involvedDomains: session.involvedDomains,
      traceId: session.context.traceId,
      tenantId: session.context.tenantId,
    });
  }

  /**
   * Emit coordination completed event
   */
  async emitCoordinationCompleted(session: OrchestraCoordinationSession): Promise<void> {
    await this.emit(ORCHESTRA_EVENTS.COORDINATION_COMPLETED, {
      orchestrationId: session.orchestrationId,
      initiatingDomain: session.initiatingDomain,
      involvedDomains: session.involvedDomains,
      status: session.status,
      traceId: session.context.traceId,
      tenantId: session.context.tenantId,
    });
  }

  /**
   * Internal event emission
   */
  private async emit(eventType: string, payload: Record<string, any>): Promise<void> {
    try {
      await eventBus.publish({
        type: eventType,
        name: eventType,
        tenantId: payload.tenantId || null,
        traceId: payload.traceId || null,
        timestamp: Date.now(),
        payload,
      });

      logger.debug(`🎭 Emitted orchestra event: ${eventType}`, { payload });
    } catch (error) {
      logger.error(`❌ Failed to emit orchestra event: ${eventType}`, {
        error,
        payload,
      });
      // Don't throw - event emission failures shouldn't break operations
    }
  }
}

/**
 * Export singleton instance
 */
export const orchestraEventEmitter = OrchestraEventEmitter.getInstance();

