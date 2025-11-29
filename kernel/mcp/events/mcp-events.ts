/**
 * MCP Event Integration
 * 
 * GRCD-KERNEL v4.0.0 F-4: Route all requests via event bus
 * Emits MCP lifecycle events for observability and cross-system integration
 */

import type {
  MCPManifest,
  MCPToolInvocation,
  MCPToolResult,
} from "../types";
import { eventBus } from "../../events/event-bus";
import { baseLogger as logger } from "../../observability/logger";

/**
 * MCP Event Types (aligned with kernel event types)
 */
export const MCP_EVENTS = {
  MANIFEST_REGISTERED: "kernel.mcp.manifest.registered",
  MANIFEST_VALIDATED: "kernel.mcp.manifest.validated",
  MANIFEST_DISABLED: "kernel.mcp.manifest.disabled",
  TOOL_INVOKED: "kernel.mcp.tool.invoked",
  TOOL_SUCCEEDED: "kernel.mcp.tool.succeeded",
  TOOL_FAILED: "kernel.mcp.tool.failed",
  RESOURCE_ACCESSED: "kernel.mcp.resource.accessed",
  SESSION_CREATED: "kernel.mcp.session.created",
  SESSION_CLOSED: "kernel.mcp.session.closed",
} as const;

/**
 * MCP Event Emitter - Emits MCP lifecycle events to event bus
 */
export class MCPEventEmitter {
  private static instance: MCPEventEmitter;

  private constructor() {}

  public static getInstance(): MCPEventEmitter {
    if (!MCPEventEmitter.instance) {
      MCPEventEmitter.instance = new MCPEventEmitter();
    }
    return MCPEventEmitter.instance;
  }

  /**
   * Emit manifest registered event
   */
  async emitManifestRegistered(
    manifest: MCPManifest,
    manifestHash: string,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.MANIFEST_REGISTERED, {
      manifestName: manifest.name,
      manifestVersion: manifest.version,
      manifestHash,
      protocolVersion: manifest.protocolVersion,
      toolsCount: manifest.tools?.length || 0,
      resourcesCount: manifest.resources?.length || 0,
      promptsCount: manifest.prompts?.length || 0,
      ...context,
    });
  }

  /**
   * Emit manifest validated event
   */
  async emitManifestValidated(
    manifestName: string,
    valid: boolean,
    errors?: any[],
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.MANIFEST_VALIDATED, {
      manifestName,
      valid,
      errors: errors || [],
      ...context,
    });
  }

  /**
   * Emit tool invoked event
   */
  async emitToolInvoked(
    serverName: string,
    toolName: string,
    invocation: MCPToolInvocation,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.TOOL_INVOKED, {
      serverName,
      toolName,
      arguments: invocation.arguments,
      ...context,
      traceId: invocation.metadata?.traceId || context?.traceId,
    });
  }

  /**
   * Emit tool succeeded event
   */
  async emitToolSucceeded(
    serverName: string,
    toolName: string,
    result: MCPToolResult,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.TOOL_SUCCEEDED, {
      serverName,
      toolName,
      executionTimeMs: result.metadata?.executionTimeMs,
      ...context,
    });
  }

  /**
   * Emit tool failed event
   */
  async emitToolFailed(
    serverName: string,
    toolName: string,
    result: MCPToolResult,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.TOOL_FAILED, {
      serverName,
      toolName,
      error: result.error,
      executionTimeMs: result.metadata?.executionTimeMs,
      ...context,
    });
  }

  /**
   * Emit resource accessed event
   */
  async emitResourceAccessed(
    serverName: string,
    resourceUri: string,
    success: boolean,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.RESOURCE_ACCESSED, {
      serverName,
      resourceUri,
      success,
      ...context,
    });
  }

  /**
   * Emit session created event
   */
  async emitSessionCreated(
    sessionId: string,
    serverName: string,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.SESSION_CREATED, {
      sessionId,
      serverName,
      ...context,
    });
  }

  /**
   * Emit session closed event
   */
  async emitSessionClosed(
    sessionId: string,
    serverName: string,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.SESSION_CLOSED, {
      sessionId,
      serverName,
      ...context,
    });
  }

  /**
   * Emit manifest disabled event
   */
  async emitManifestDisabled(
    manifestName: string,
    reason?: string,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<void> {
    await this.emit(MCP_EVENTS.MANIFEST_DISABLED, {
      manifestName,
      reason: reason || "Manual disable",
      ...context,
    });
  }

  /**
   * Internal event emission
   */
  private async emit(
    eventType: string,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      await eventBus.publish({
        type: eventType,
        name: eventType,
        tenantId: payload.tenantId || null,
        traceId: payload.traceId || null,
        timestamp: Date.now(),
        payload,
      });

      logger.debug(`📡 Emitted MCP event: ${eventType}`, { payload });
    } catch (error) {
      logger.error(`❌ Failed to emit MCP event: ${eventType}`, {
        error,
        payload,
      });
      // Don't throw - event emission failures shouldn't break MCP operations
    }
  }
}

/**
 * Export singleton instance
 */
export const mcpEventEmitter = MCPEventEmitter.getInstance();

