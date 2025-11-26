/**
 * HTTP Router
 *
 * Unified HTTP layer for the kernel. Single entry point for all HTTP routing.
 * Applies global middleware and mounts all feature routes.
 */

import { Hono } from 'hono';

import { authMiddleware } from './middleware/auth';
import { httpMetricsMiddleware } from './middleware/metrics';
import { traceIdMiddleware } from './middleware/trace-id';

import { registerActionRoutes } from './routes/actions';
import { registerEngineRoutes } from './routes/engines';
import { registerUiRoutes } from './routes/ui';
import { registerMetadataRoutes } from './routes/metadata';
import { registerTenantRoutes } from './routes/tenants';
import { registerHealthRoutes } from './routes/health';
import { registerDiagRoutes } from './routes/diag';
import { registerMetricsRoutes } from './routes/metrics';
import { registerAuditRoutes } from './routes/audit';

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
export function createKernelApp(): KernelApp {
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

  return app;
}

// For simple deployments, you can expose a default app instance:
export const kernelHttpApp: KernelApp = createKernelApp();

