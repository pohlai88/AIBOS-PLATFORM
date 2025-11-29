import { Hono } from "hono";
import { traceIdMiddleware } from "./middleware/trace-id";
import { httpMetricsMiddleware } from "./middleware/metrics";
import { authMiddleware } from "./middleware/auth";
import { registerActionRoutes } from "./routes/actions";
import { registerEngineRoutes } from "./routes/engines";
import { registerUiRoutes } from "./routes/ui";
import { registerMetadataRoutes } from "./routes/metadata";
import { registerTenantRoutes } from "./routes/tenants";
import { registerHealthRoutes } from "./routes/health";
import { registerDiagRoutes } from "./routes/diag";
import { registerAuditRoutes } from "./routes/audit";
import { registerMetricsRoutes } from "./routes/metrics";
import { registerMcpRoutes } from "./routes/mcp";
import { registerOrchestraRoutes } from "./routes/orchestra";
import { registerPolicyRoutes } from "./routes/policy";
import { registerAgentRoutes } from "./routes/agents";
import { registerApprovalRoutes } from "./routes/approvals";
import { registerSearchRoutes } from "./routes/search";
import { registerSecretRoutes } from "./routes/secrets";

// Extend Hono context variables for kernel-specific data.
declare module 'hono' {
    interface ContextVariableMap {
        principal: import('../auth/types').Principal | null;
        tenantId: string | null;
        traceId: string | null;
    }
}

export type KernelApp = Hono;

/**
 * Create and configure the kernel HTTP application.
 *
 * This function is the single entry point for all HTTP routing. It applies
 * global middleware (trace id, metrics, auth) and then mounts all feature
 * routes. This consolidates the previous split between `api/` and `http/`.
 */
export const createApiRouter = (): KernelApp => {
  const app = new Hono();

  // Global middlewares
  app.use('*', traceIdMiddleware);
  app.use('*', httpMetricsMiddleware);
  app.use('*', authMiddleware);

  // Health / diagnostics (no auth required for these)
  registerHealthRoutes(app);
  registerDiagRoutes(app);
  registerMetricsRoutes(app);

  // Core kernel domains
  registerActionRoutes(app);
  registerEngineRoutes(app);
  registerUiRoutes(app);
  registerMetadataRoutes(app);
  registerTenantRoutes(app);
  registerAuditRoutes(app);
  registerMcpRoutes(app);
  registerOrchestraRoutes(app);
  registerPolicyRoutes(app);
  registerAgentRoutes(app);
  registerApprovalRoutes(app);
  registerSearchRoutes(app);
  registerSecretRoutes(app);

  return app;
};

