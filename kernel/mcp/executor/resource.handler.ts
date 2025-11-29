/**
 * MCP Resource Handler
 * 
 * GRCD-KERNEL v4.0.0 F-5: Support engine lifecycle via MCP
 * Handles MCP resource requests with validation and audit
 */

import type { MCPResource } from "../types";
import { mcpRegistry } from "../registry/mcp-registry";
import { mcpAuditLogger } from "../audit/mcp-audit";
import { mcpEventEmitter } from "../events/mcp-events";
import { recordResourceAccess } from "../telemetry/mcp-metrics";

/**
 * Resource Request
 */
export interface ResourceRequest {
  uri: string;
  metadata?: {
    tenantId?: string;
    userId?: string;
    traceId?: string;
  };
}

/**
 * Resource Response
 */
export interface ResourceResponse {
  success: boolean;
  data?: {
    uri: string;
    name: string;
    mimeType?: string;
    content: any;
  };
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    fetchTimeMs: number;
    serverName: string;
  };
}

/**
 * MCP Resource Handler - Fetches and validates MCP resources
 */
export class MCPResourceHandler {
  /**
   * Get resource from MCP server
   * 
   * @param serverName - MCP server name
   * @param request - Resource request
   * @returns Resource response with content
   */
  public async getResource(
    serverName: string,
    request: ResourceRequest
  ): Promise<ResourceResponse> {
    const startTime = Date.now();

    try {
      // 1. Get manifest from registry
      const entry = mcpRegistry.getByName(serverName);
      if (!entry) {
        return {
          success: false,
          error: {
            code: "SERVER_NOT_FOUND",
            message: `MCP server not found: ${serverName}`,
          },
        };
      }

      if (entry.status !== "active") {
        return {
          success: false,
          error: {
            code: "SERVER_DISABLED",
            message: `MCP server is ${entry.status}: ${serverName}`,
          },
        };
      }

      // 2. Find resource in manifest
      const resource = entry.manifest.resources?.find(
        (r) => r.uri === request.uri
      );

      if (!resource) {
        return {
          success: false,
          error: {
            code: "RESOURCE_NOT_FOUND",
            message: `Resource not found: ${request.uri}`,
          },
        };
      }

      // 3. Fetch resource content (placeholder - actual implementation will use MCP SDK)
      const content = await this.fetchResourceContent(
        serverName,
        resource,
        request
      );

      // 4. Build response
      const response: ResourceResponse = {
        success: true,
        data: {
          uri: resource.uri,
          name: resource.name,
          mimeType: resource.mimeType,
          content,
        },
        metadata: {
          fetchTimeMs: Date.now() - startTime,
          serverName,
        },
      };

      // 5. Audit access
      await mcpAuditLogger.auditResourceAccess(
        serverName,
        request.uri,
        true,
        request.metadata
      );

      // 6. Emit event
      await mcpEventEmitter.emitResourceAccessed(
        serverName,
        request.uri,
        true,
        request.metadata
      );

      // 7. Record metrics
      recordResourceAccess(serverName, true);

      return response;
    } catch (error) {
      const errorResponse: ResourceResponse = {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        metadata: {
          fetchTimeMs: Date.now() - startTime,
          serverName,
        },
      };

      // Audit failed access
      await mcpAuditLogger.auditResourceAccess(
        serverName,
        request.uri,
        false,
        request.metadata
      );

      // Emit failure event
      await mcpEventEmitter.emitResourceAccessed(
        serverName,
        request.uri,
        false,
        request.metadata
      );

      // Record error metrics
      recordResourceAccess(serverName, false);

      return errorResponse;
    }
  }

  /**
   * List resources for a server
   * 
   * @param serverName - MCP server name
   * @returns List of available resources
   */
  public listResources(serverName: string): MCPResource[] {
    const entry = mcpRegistry.getByName(serverName);
    if (!entry) {
      return [];
    }

    return entry.manifest.resources || [];
  }

  /**
   * Check if resource exists
   * 
   * @param serverName - MCP server name
   * @param uri - Resource URI
   * @returns True if resource exists
   */
  public resourceExists(serverName: string, uri: string): boolean {
    const entry = mcpRegistry.getByName(serverName);
    if (!entry) {
      return false;
    }

    return (
      entry.manifest.resources?.some((r) => r.uri === uri) || false
    );
  }

  /**
   * Fetch resource content from MCP server (placeholder)
   * 
   * TODO: Implement actual MCP server communication
   * This will use @modelcontextprotocol/sdk to fetch resources
   */
  private async fetchResourceContent(
    serverName: string,
    resource: MCPResource,
    request: ResourceRequest
  ): Promise<any> {
    // Placeholder implementation
    // In production, this will:
    // 1. Connect to MCP server
    // 2. Send resource request
    // 3. Receive and return resource content
    
    // For now, return mock data based on mimeType
    if (resource.mimeType === "application/json") {
      return { mock: true, uri: resource.uri, name: resource.name };
    }
    
    return `Mock content for ${resource.name}`;
  }
}

/**
 * Export singleton instance
 */
export const mcpResourceHandler = new MCPResourceHandler();

