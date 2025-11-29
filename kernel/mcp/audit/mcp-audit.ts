/**
 * MCP Audit Logger
 * 
 * GRCD-KERNEL v4.0.0 F-10: Audit all MCP server interactions
 * Wraps existing audit system with MCP-specific event tracking
 */

import type { MCPToolInvocation, MCPToolResult, MCPManifest } from "../types";
import { AuditLogger } from "../../audit/audit-logger";
import { randomUUID } from "crypto";

/**
 * MCP Audit Event Types
 */
export type MCPAuditEventType =
  | "mcp.manifest.registered"
  | "mcp.manifest.validated"
  | "mcp.manifest.disabled"
  | "mcp.tool.invoked"
  | "mcp.tool.succeeded"
  | "mcp.tool.failed"
  | "mcp.resource.accessed"
  | "mcp.session.created"
  | "mcp.session.closed";

/**
 * MCP Audit Context
 */
export interface MCPAuditContext {
  tenantId?: string;
  userId?: string;
  traceId?: string;
  sessionId?: string;
}

/**
 * MCP Audit Logger - Singleton wrapper around AuditLogger
 */
export class MCPAuditLogger {
  private static instance: MCPAuditLogger;
  private auditLogger: AuditLogger;

  private constructor() {
    this.auditLogger = new AuditLogger();
  }

  public static getInstance(): MCPAuditLogger {
    if (!MCPAuditLogger.instance) {
      MCPAuditLogger.instance = new MCPAuditLogger();
    }
    return MCPAuditLogger.instance;
  }

  /**
   * Audit MCP manifest registration
   */
  async auditManifestRegistered(
    manifest: MCPManifest,
    manifestHash: string,
    context?: MCPAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: "mcp.manifest.registered",
      resource: `mcp://manifests/${manifest.name}`,
      category: "kernel",
      severity: "info",
      details: {
        manifestName: manifest.name,
        manifestVersion: manifest.version,
        manifestHash,
        protocolVersion: manifest.protocolVersion,
        toolsCount: manifest.tools?.length || 0,
        resourcesCount: manifest.resources?.length || 0,
        promptsCount: manifest.prompts?.length || 0,
        traceId: context?.traceId,
      },
    });
  }

  /**
   * Audit MCP manifest validation
   */
  async auditManifestValidated(
    manifestName: string,
    valid: boolean,
    errors?: any[],
    context?: MCPAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: "mcp.manifest.validated",
      resource: `mcp://manifests/${manifestName}`,
      category: "kernel",
      severity: valid ? "info" : "warn",
      details: {
        manifestName,
        valid,
        errors: errors || [],
        traceId: context?.traceId,
      },
    });
  }

  /**
   * Audit MCP tool invocation
   */
  async auditToolInvocation(
    serverName: string,
    invocation: MCPToolInvocation,
    result: MCPToolResult,
    context?: MCPAuditContext
  ): Promise<void> {
    const success = result.success;
    const action = success ? "mcp.tool.succeeded" : "mcp.tool.failed";

    await this.auditLogger.log({
      tenantId: invocation.metadata?.tenantId || context?.tenantId || null,
      subject: invocation.metadata?.userId || context?.userId || "system",
      action,
      resource: `mcp://${serverName}/tools/${invocation.tool}`,
      category: "kernel",
      severity: success ? "info" : "error",
      details: {
        serverName,
        toolName: invocation.tool,
        arguments: invocation.arguments,
        success,
        executionTimeMs: result.metadata?.executionTimeMs,
        error: result.error,
        traceId: invocation.metadata?.traceId || context?.traceId,
        sessionId: context?.sessionId,
      },
    });
  }

  /**
   * Audit MCP resource access
   */
  async auditResourceAccess(
    serverName: string,
    resourceUri: string,
    success: boolean,
    context?: MCPAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: "mcp.resource.accessed",
      resource: resourceUri,
      category: "kernel",
      severity: success ? "info" : "warn",
      details: {
        serverName,
        resourceUri,
        success,
        traceId: context?.traceId,
        sessionId: context?.sessionId,
      },
    });
  }

  /**
   * Audit MCP session lifecycle
   */
  async auditSession(
    eventType: "mcp.session.created" | "mcp.session.closed",
    sessionId: string,
    serverName: string,
    context?: MCPAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: eventType,
      resource: `mcp://${serverName}/sessions/${sessionId}`,
      category: "kernel",
      severity: "info",
      details: {
        sessionId,
        serverName,
        traceId: context?.traceId,
      },
    });
  }

  /**
   * Audit MCP manifest disabled
   */
  async auditManifestDisabled(
    manifestName: string,
    reason?: string,
    context?: MCPAuditContext
  ): Promise<void> {
    await this.auditLogger.log({
      tenantId: context?.tenantId || null,
      subject: context?.userId || "system",
      action: "mcp.manifest.disabled",
      resource: `mcp://manifests/${manifestName}`,
      category: "kernel",
      severity: "warn",
      details: {
        manifestName,
        reason: reason || "Manual disable",
        traceId: context?.traceId,
      },
    });
  }
}

/**
 * Export singleton instance
 */
export const mcpAuditLogger = MCPAuditLogger.getInstance();

