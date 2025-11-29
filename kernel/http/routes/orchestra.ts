/**
 * Orchestra Routes
 * 
 * GRCD-KERNEL v4.0.0 F-15, F-16, F-17: Orchestra Coordination
 * HTTP endpoints for orchestra governance and coordination
 */

import type { Hono } from "hono";
import { z } from "zod";
import {
  orchestraRegistry,
  orchestraConductor,
  crossOrchestraAuth,
  orchestraManifestSchema,
  orchestraActionRequestSchema,
  orchestrationDomainSchema,
} from "../../orchestras";
import {
  validateJsonBody,
  validateParams,
  getValidBody,
  getValidParams,
} from "../zod-middleware";

/**
 * Orchestra Domain Params
 */
const OrchestrationDomainParams = z.object({
  domain: orchestrationDomainSchema,
});

/**
 * Register all Orchestra routes
 */
export function registerOrchestraRoutes(app: Hono) {
  // GET /orchestras - List all registered orchestras
  app.get("/orchestras", async (c) => {
    const orchestras = orchestraRegistry.listActive();

    return c.json({
      count: orchestras.length,
      domains: orchestraRegistry.listDomains(),
      orchestras: orchestras.map((entry) => ({
        domain: entry.manifest.domain,
        name: entry.manifest.name,
        version: entry.manifest.version,
        description: entry.manifest.description,
        status: entry.status,
        registeredAt: entry.registeredAt,
        agentsCount: entry.manifest.agents.length,
        toolsCount: entry.manifest.tools.length,
        policiesCount: entry.manifest.policies.length,
        dependencies: entry.manifest.dependencies || [],
      })),
    });
  });

  // GET /orchestras/:domain - Get specific orchestra details
  app.get(
    "/orchestras/:domain",
    validateParams(OrchestrationDomainParams),
    async (c) => {
      const { domain } = getValidParams<z.infer<typeof OrchestrationDomainParams>>(c);
      const entry = orchestraRegistry.getByDomain(domain);

      if (!entry) {
        return c.json({ error: "Orchestra not found" }, 404);
      }

      return c.json({
        manifestHash: entry.manifestHash,
        manifest: entry.manifest,
        status: entry.status,
        registeredAt: entry.registeredAt,
        errorMessage: entry.errorMessage,
      });
    }
  );

  // POST /orchestras/manifests - Register new orchestra manifest
  app.post(
    "/orchestras/manifests",
    validateJsonBody(orchestraManifestSchema),
    async (c) => {
      const manifest = getValidBody<z.infer<typeof orchestraManifestSchema>>(c);

      const result = await orchestraRegistry.register(manifest);

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
          message: `Orchestra ${manifest.domain} registered successfully`,
        },
        201
      );
    }
  );

  // POST /orchestras/:domain/actions - Execute action on orchestra
  app.post(
    "/orchestras/:domain/actions",
    validateParams(OrchestrationDomainParams),
    validateJsonBody(
      z.object({
        action: z.string().min(1),
        arguments: z.record(z.any()),
      })
    ),
    async (c) => {
      const { domain } = getValidParams<z.infer<typeof OrchestrationDomainParams>>(c);
      const body = getValidBody<{ action: string; arguments: Record<string, any> }>(c);

      const result = await orchestraConductor.coordinateAction({
        domain,
        action: body.action,
        arguments: body.arguments,
        context: {
          traceId: c.get("traceId") || undefined,
          tenantId: c.req.header("x-tenant-id") || undefined,
          userId: c.req.header("x-user-id") || undefined,
        },
      });

      if (!result.success) {
        return c.json(result, result.error?.code === "ORCHESTRA_NOT_FOUND" ? 404 : 400);
      }

      return c.json(result);
    }
  );

  // POST /orchestras/coordinate - Execute cross-orchestra workflow
  app.post(
    "/orchestras/coordinate",
    validateJsonBody(
      z.object({
        requests: z.array(orchestraActionRequestSchema),
        parallel: z.boolean().optional(),
      })
    ),
    async (c) => {
      const body = getValidBody<{
        requests: z.infer<typeof orchestraActionRequestSchema>[];
        parallel?: boolean;
      }>(c);

      const results = await orchestraConductor.coordinateCrossOrchestra(
        body.requests,
        body.parallel || false
      );

      const allSucceeded = results.every((r) => r.success);

      return c.json({
        success: allSucceeded,
        results,
        metadata: {
          total: results.length,
          succeeded: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      });
    }
  );

  // GET /orchestras/:domain/agents - List agents for orchestra
  app.get(
    "/orchestras/:domain/agents",
    validateParams(OrchestrationDomainParams),
    async (c) => {
      const { domain } = getValidParams<z.infer<typeof OrchestrationDomainParams>>(c);
      const entry = orchestraRegistry.getByDomain(domain);

      if (!entry) {
        return c.json({ error: "Orchestra not found" }, 404);
      }

      return c.json({
        domain,
        count: entry.manifest.agents.length,
        agents: entry.manifest.agents,
      });
    }
  );

  // GET /orchestras/:domain/tools - List tools for orchestra
  app.get(
    "/orchestras/:domain/tools",
    validateParams(OrchestrationDomainParams),
    async (c) => {
      const { domain } = getValidParams<z.infer<typeof OrchestrationDomainParams>>(c);
      const entry = orchestraRegistry.getByDomain(domain);

      if (!entry) {
        return c.json({ error: "Orchestra not found" }, 404);
      }

      return c.json({
        domain,
        count: entry.manifest.tools.length,
        tools: entry.manifest.tools,
      });
    }
  );

  // GET /orchestras/:domain/dependencies - Get orchestra dependencies
  app.get(
    "/orchestras/:domain/dependencies",
    validateParams(OrchestrationDomainParams),
    async (c) => {
      const { domain } = getValidParams<z.infer<typeof OrchestrationDomainParams>>(c);
      const entry = orchestraRegistry.getByDomain(domain);

      if (!entry) {
        return c.json({ error: "Orchestra not found" }, 404);
      }

      const dependencies = orchestraRegistry.getDependencies(domain);
      const dependenciesValid = orchestraRegistry.validateDependencies(domain);

      return c.json({
        domain,
        dependencies,
        valid: dependenciesValid,
        missing: dependencies.filter((dep) => !orchestraRegistry.isActive(dep)),
      });
    }
  );

  // POST /orchestras/authorize - Check cross-orchestra authorization
  app.post(
    "/orchestras/authorize",
    validateJsonBody(
      z.object({
        sourceDomain: orchestrationDomainSchema,
        targetDomain: orchestrationDomainSchema,
        action: z.string().min(1),
      })
    ),
    async (c) => {
      const body = getValidBody<{
        sourceDomain: z.infer<typeof orchestrationDomainSchema>;
        targetDomain: z.infer<typeof orchestrationDomainSchema>;
        action: string;
      }>(c);

      const result = await crossOrchestraAuth.authorize({
        sourceDomain: body.sourceDomain,
        targetDomain: body.targetDomain,
        action: body.action,
        context: {
          traceId: c.get("traceId") || undefined,
        },
      });

      return c.json(result);
    }
  );

  // GET /orchestras/sessions - List active coordination sessions
  app.get("/orchestras/sessions", async (c) => {
    const sessions = orchestraConductor.listActiveSessions();

    return c.json({
      count: sessions.length,
      sessions: sessions.map((s) => ({
        orchestrationId: s.orchestrationId,
        initiatingDomain: s.initiatingDomain,
        involvedDomains: s.involvedDomains,
        startedAt: s.startedAt,
        status: s.status,
      })),
    });
  });

  // DELETE /orchestras/:domain - Disable orchestra
  app.delete(
    "/orchestras/:domain",
    validateParams(OrchestrationDomainParams),
    async (c) => {
      const { domain } = getValidParams<z.infer<typeof OrchestrationDomainParams>>(c);
      const reason = c.req.query("reason") || "Manual disable via API";

      const success = orchestraRegistry.disable(domain, reason);

      if (!success) {
        return c.json({ error: "Orchestra not found" }, 404);
      }

      return c.json({
        success: true,
        message: `Orchestra ${domain} disabled`,
      });
    }
  );
}

