import { Hono } from "hono";
import { traceIdMiddleware } from "../http/middleware/trace-id";
import { httpMetricsMiddleware } from "../http/middleware/metrics";
import { authMiddleware, optionalAuthMiddleware } from "../http/middleware/auth";
import { registerMetadataRoutes } from "./routes/metadata.routes";
import { registerEngineRoutes } from "./routes/engines.routes";
import { registerActionRoutes } from "./routes/action.routes";
import { registerHealthRoutes } from "./routes/health.routes";
import { registerTenantRoutes } from "./routes/tenant.routes";
import { registerUIRoutes } from "./routes/ui.routes";
import { healthRoute } from "./routes/health";
import { readyRoute } from "./routes/ready";
import { diagRoute } from "./routes/diag";
import { auditRoute } from "./routes/audit";
import { registerActionRoutes as registerNewActionRoutes } from "../http/routes/actions";
import { registerEngineRoutes as registerNewEngineRoutes } from "../http/routes/engines";
import { registerMetricsRoutes } from "../http/routes/metrics";

export const createApiRouter = () => {
  const app = new Hono();

  // Global middleware (order: traceId → metrics → auth)
  app.use("*", traceIdMiddleware);
  app.use("*", httpMetricsMiddleware);

  // Prometheus metrics (no auth required)
  registerMetricsRoutes(app);

  // Health & diagnostics (no auth required)
  app.route("/healthz", healthRoute);
  app.route("/readyz", readyRoute);
  app.route("/diagz", diagRoute);
  app.route("/auditz", auditRoute);

  // API routes with auth
  app.use("/api/*", authMiddleware);
  registerNewActionRoutes(app);
  registerNewEngineRoutes(app);

  // Legacy routes (with optional auth for backward compat)
  app.use("/metadata/*", optionalAuthMiddleware);
  app.use("/engines/*", optionalAuthMiddleware);
  app.use("/actions/*", optionalAuthMiddleware);
  app.use("/tenants/*", optionalAuthMiddleware);
  app.use("/ui/*", optionalAuthMiddleware);

  registerMetadataRoutes(app);
  registerEngineRoutes(app);
  registerActionRoutes(app);
  registerHealthRoutes(app);
  registerTenantRoutes(app);
  registerUIRoutes(app);

  return app;
};

