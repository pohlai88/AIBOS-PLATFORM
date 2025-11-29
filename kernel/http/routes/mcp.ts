/**
 * MCP Routes
 * 
 * GRCD-KERNEL v4.0.0 F-1: Universal API gateway
 * HTTP endpoints for MCP governance operations
 */

import type { Hono } from "hono";
import { z } from "zod";
import {
  mcpRegistry,
  mcpToolExecutor,
  mcpManifestSchema,
} from "../../mcp";
import {
  validateJsonBody,
  validateParams,
  getValidBody,
  getValidParams,
} from "../zod-middleware";

/**
 * MCP Tool Invocation Request Schema
 */
const MCPToolInvocationSchema = z.object({
  tool: z.string().min(1),
  arguments: z.record(z.any()),
  metadata: z
    .object({
      tenantId: z.string().optional(),
      userId: z.string().optional(),
      traceId: z.string().optional(),
    })
    .optional(),
});

/**
 * MCP Server Name Params
 */
const MCPServerNameParams = z.object({
  serverName: z.string().min(1),
});

/**
 * Register all MCP routes
 */
export function registerMcpRoutes(app: Hono) {
  // GET /mcp/servers - List all registered MCP servers
  app.get("/mcp/servers", async (c) => {
    const servers = mcpRegistry.listActive();
    return c.json({
      count: servers.length,
      servers: servers.map((entry) => ({
        name: entry.manifest.name,
        version: entry.manifest.version,
        protocolVersion: entry.manifest.protocolVersion,
        description: entry.manifest.description,
        status: entry.status,
        registeredAt: entry.registeredAt,
        toolsCount: entry.manifest.tools?.length || 0,
        resourcesCount: entry.manifest.resources?.length || 0,
        promptsCount: entry.manifest.prompts?.length || 0,
      })),
    });
  });

  // GET /mcp/servers/:serverName - Get specific MCP server details
  app.get(
    "/mcp/servers/:serverName",
    validateParams(MCPServerNameParams),
    async (c) => {
      const { serverName } = getValidParams<z.infer<typeof MCPServerNameParams>>(c);
      const entry = mcpRegistry.getByName(serverName);

      if (!entry) {
        return c.json({ error: "MCP server not found" }, 404);
      }

      return c.json({
        manifestHash: entry.manifestHash,
        manifest: entry.manifest,
        status: entry.status,
        registeredAt: entry.registeredAt,
      });
    }
  );

  // POST /mcp/servers/:serverName/invoke - Invoke MCP tool
  app.post(
    "/mcp/servers/:serverName/invoke",
    validateParams(MCPServerNameParams),
    validateJsonBody(MCPToolInvocationSchema),
    async (c) => {
      const { serverName } = getValidParams<z.infer<typeof MCPServerNameParams>>(c);
      const invocation = getValidBody<z.infer<typeof MCPToolInvocationSchema>>(c);

      // Add trace ID from context if not provided
      if (!invocation.metadata?.traceId) {
        invocation.metadata = {
          ...invocation.metadata,
          traceId: c.get("traceId") || undefined,
        };
      }

      const result = await mcpToolExecutor.execute(serverName, invocation);

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: result.error,
            metadata: result.metadata,
          },
          result.error?.code === "SERVER_NOT_FOUND" ? 404 : 400
        );
      }

      return c.json(result);
    }
  );

  // POST /mcp/manifests - Register new MCP manifest
  app.post("/mcp/manifests", validateJsonBody(mcpManifestSchema), async (c) => {
    const manifest = getValidBody<z.infer<typeof mcpManifestSchema>>(c);

    const result = await mcpRegistry.register(manifest);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: result.error,
        },
        400
      );
    }

    return c.json(
      {
        success: true,
        manifestHash: result.manifestHash,
        message: `MCP server ${manifest.name} registered successfully`,
      },
      201
    );
  });

  // DELETE /mcp/servers/:serverName - Disable MCP server
  app.delete(
    "/mcp/servers/:serverName",
    validateParams(MCPServerNameParams),
    async (c) => {
      const { serverName } = getValidParams<z.infer<typeof MCPServerNameParams>>(c);
      const reason = c.req.query("reason") || "Manual disable via API";

      const success = await mcpRegistry.disable(serverName, reason);

      if (!success) {
        return c.json({ error: "MCP server not found" }, 404);
      }

      return c.json({
        success: true,
        message: `MCP server ${serverName} disabled`,
      });
    }
  );

  // GET /mcp/servers/:serverName/tools - List tools for a specific server
  app.get(
    "/mcp/servers/:serverName/tools",
    validateParams(MCPServerNameParams),
    async (c) => {
      const { serverName } = getValidParams<z.infer<typeof MCPServerNameParams>>(c);
      const entry = mcpRegistry.getByName(serverName);

      if (!entry) {
        return c.json({ error: "MCP server not found" }, 404);
      }

      const tools = entry.manifest.tools || [];

      return c.json({
        serverName,
        count: tools.length,
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      });
    }
  );

  // GET /mcp/servers/:serverName/resources - List resources for a specific server
  app.get(
    "/mcp/servers/:serverName/resources",
    validateParams(MCPServerNameParams),
    async (c) => {
      const { serverName } = getValidParams<z.infer<typeof MCPServerNameParams>>(c);
      const entry = mcpRegistry.getByName(serverName);

      if (!entry) {
        return c.json({ error: "MCP server not found" }, 404);
      }

      const resources = entry.manifest.resources || [];

      return c.json({
        serverName,
        count: resources.length,
        resources: resources.map((resource) => ({
          uri: resource.uri,
          name: resource.name,
          description: resource.description,
          mimeType: resource.mimeType,
        })),
      });
    }
  );
}

