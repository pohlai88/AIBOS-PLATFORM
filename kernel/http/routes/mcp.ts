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
  mcpResourceHandler,
  mcpSessionManager,
  mcpManifestSchema,
} from "../../mcp";
import { resourceDiscovery } from "../../mcp/discovery/resource-discovery";
import { promptTemplateRegistry, type PromptTemplate } from "../../mcp/prompts";
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

  // GET /mcp/servers/:serverName/health - Get MCP server health status
  app.get(
    "/mcp/servers/:serverName/health",
    validateParams(MCPServerNameParams),
    async (c) => {
      const { serverName } = getValidParams<z.infer<typeof MCPServerNameParams>>(c);
      
      const { mcpHealthMonitor } = await import("../../mcp/health");
      const healthCheck = await mcpHealthMonitor.checkHealth(serverName);
      const metrics = mcpHealthMonitor.getMetrics(serverName);

      return c.json({
        ...healthCheck,
        metrics: metrics || null,
      });
    }
  );

  // GET /mcp/health - Get health status of all MCP servers
  app.get("/mcp/health", async (c) => {
    const { mcpHealthMonitor } = await import("../../mcp/health");
    const healthChecks = await mcpHealthMonitor.checkAllHealth();
    const allMetrics = mcpHealthMonitor.getAllMetrics();

    const summary = {
      total: healthChecks.length,
      healthy: healthChecks.filter((h) => h.status === "healthy").length,
      degraded: healthChecks.filter((h) => h.status === "degraded").length,
      unhealthy: healthChecks.filter((h) => h.status === "unhealthy").length,
      unknown: healthChecks.filter((h) => h.status === "unknown").length,
    };

    return c.json({
      summary,
      servers: healthChecks,
      metrics: Object.fromEntries(allMetrics),
      timestamp: new Date().toISOString(),
    });
  });

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

  // GET /mcp/servers/:serverName/resources/:uri - Get specific resource
  const MCPResourceParams = z.object({
    serverName: z.string().min(1),
    uri: z.string().min(1),
  });

  app.get(
    "/mcp/servers/:serverName/resources/:uri",
    validateParams(MCPResourceParams),
    async (c) => {
      const { serverName, uri } = getValidParams<z.infer<typeof MCPResourceParams>>(c);

      const result = await mcpResourceHandler.getResource(serverName, {
        uri: decodeURIComponent(uri),
        metadata: {
          traceId: c.get("traceId") || undefined,
        },
      });

      if (!result.success) {
        return c.json(result, result.error?.code === "SERVER_NOT_FOUND" ? 404 : 400);
      }

      return c.json(result);
    }
  );

  // POST /mcp/sessions - Create new MCP session
  const CreateSessionSchema = z.object({
    serverName: z.string().min(1),
    tenantId: z.string().optional(),
    userId: z.string().optional(),
  });

  app.post("/mcp/sessions", validateJsonBody(CreateSessionSchema), async (c) => {
    const body = getValidBody<z.infer<typeof CreateSessionSchema>>(c);

    const session = await mcpSessionManager.createSession(body.serverName, {
      tenantId: body.tenantId,
      userId: body.userId,
      traceId: c.get("traceId") || undefined,
    });

    if (!session) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json(
      {
        sessionId: session.sessionId,
        serverName: session.manifest.name,
        state: session.state,
        createdAt: session.createdAt,
      },
      201
    );
  });

  // GET /mcp/sessions - List active sessions
  app.get("/mcp/sessions", async (c) => {
    const sessions = mcpSessionManager.listActiveSessions();

    return c.json({
      count: sessions.length,
      sessions: sessions.map((s) => ({
        sessionId: s.sessionId,
        serverName: s.manifest.name,
        state: s.state,
        createdAt: s.createdAt,
        lastAccessedAt: s.lastAccessedAt,
        accessCount: s.accessCount,
      })),
    });
  });

  // DELETE /mcp/sessions/:sessionId - Close session
  const SessionIdParams = z.object({
    sessionId: z.string().min(1),
  });

  app.delete(
    "/mcp/sessions/:sessionId",
    validateParams(SessionIdParams),
    async (c) => {
      const { sessionId } = getValidParams<z.infer<typeof SessionIdParams>>(c);
      const reason = c.req.query("reason") || "Manual close via API";

      const success = await mcpSessionManager.closeSession(sessionId, reason);

      if (!success) {
        return c.json({ error: "Session not found" }, 404);
      }

      return c.json({
        success: true,
        message: `Session ${sessionId} closed`,
      });
    }
  );

  // GET /mcp/resources - List resources (F-12: Resource Discovery)
  app.get("/mcp/resources", async (c) => {
    const serverId = c.req.query("serverId");
    const type = c.req.query("type");
    const query = c.req.query("query");
    const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined;

    let resources;

    if (query) {
      resources = await resourceDiscovery.searchResources(query, {
        serverId,
        type,
        limit,
      });
    } else if (serverId) {
      resources = await resourceDiscovery.listResources(serverId);
    } else if (type) {
      resources = await resourceDiscovery.getResourcesByType(type);
    } else {
      // List all resources
      const servers = mcpRegistry.list();
      resources = [];
      for (const manifest of servers) {
        const serverResources = await resourceDiscovery.listResources(manifest.id);
        resources.push(...serverResources);
      }
    }

    return c.json({
      count: resources.length,
      resources,
    });
  });

  // GET /mcp/resources/types - Get available resource types
  app.get("/mcp/resources/types", async (c) => {
    const types = await resourceDiscovery.getResourceTypes();
    return c.json({
      count: types.length,
      types,
    });
  });

  // GET /mcp/resources/:uri/metadata - Get resource metadata
  app.get("/mcp/resources/:uri/metadata", async (c) => {
    const uri = decodeURIComponent(c.req.param("uri"));
    const metadata = await resourceDiscovery.getResourceMetadata(uri);

    if (!metadata) {
      return c.json({ error: "Resource not found" }, 404);
    }

    return c.json(metadata);
  });

  // GET /mcp/prompts/templates - List prompt templates (F-13: Prompt Templates)
  app.get("/mcp/prompts/templates", async (c) => {
    const category = c.req.query("category");
    const templates = promptTemplateRegistry.listTemplates(category);
    
    return c.json({
      count: templates.length,
      templates,
    });
  });

  // GET /mcp/prompts/templates/:id - Get template by ID
  app.get("/mcp/prompts/templates/:id", async (c) => {
    const id = c.req.param("id");
    const template = promptTemplateRegistry.getTemplate(id);
    
    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }
    
    return c.json(template);
  });

  // POST /mcp/prompts/templates - Register new template
  app.post("/mcp/prompts/templates", validateJsonBody(z.any()), async (c) => {
    const body = await c.req.json<PromptTemplate>();
    const result = promptTemplateRegistry.registerTemplate(body);
    
    if (!result.valid) {
      return c.json({
        success: false,
        errors: result.errors,
        warnings: result.warnings,
      }, 400);
    }
    
    return c.json({
      success: true,
      message: "Template registered",
    });
  });

  // POST /mcp/prompts/templates/:id/render - Render template
  app.post("/mcp/prompts/templates/:id/render", validateJsonBody(z.any()), async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<{ variables: Record<string, any> }>();
    
    try {
      const rendered = promptTemplateRegistry.renderTemplate(id, body.variables || {});
      return c.json({
        success: true,
        data: rendered,
      });
    } catch (error) {
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }, 400);
    }
  });
}

