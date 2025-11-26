/**
 * Engine Routes
 * 
 * HTTP endpoints for engine management with Zod validation
 */

import { Hono } from "hono";
import { z } from "zod";
import { ZMcpEngineManifest, EngineStatusEnum } from "../../contracts/schemas";
import { validateJsonBody, validateParams, getValidBody, getValidParams } from "../zod-middleware";
import { engineLoader } from "../../engines/engine-loader";

const app = new Hono();

// Register a new engine
app.post(
  "/register",
  validateJsonBody(ZMcpEngineManifest),
  async (c) => {
    const manifest = getValidBody<z.infer<typeof ZMcpEngineManifest>>(c);
    const tenantId = c.req.header("x-tenant-id") ?? null;
    const signature = c.req.header("x-engine-signature") ?? undefined;

    const engineRecord = await engineLoader.registerEngine(tenantId, manifest, signature);

    return c.json(engineRecord, 201);
  }
);

// Get engine by ID
const EngineIdParams = z.object({
  engineId: z.string().min(1),
});

app.get(
  "/:engineId",
  validateParams(EngineIdParams),
  async (c) => {
    const { engineId } = getValidParams<z.infer<typeof EngineIdParams>>(c);
    const tenantId = c.req.header("x-tenant-id") ?? null;

    const engine = await engineLoader.loadEngineRecord(tenantId, engineId);

    if (!engine) {
      return c.json({ error: "Engine not found" }, 404);
    }

    return c.json(engine);
  }
);

// List engines for tenant
app.get("/", async (c) => {
  const tenantId = c.req.header("x-tenant-id") ?? null;
  const engines = await engineLoader.listByTenant(tenantId);
  return c.json({ engines });
});

// Update engine status
const UpdateStatusBody = z.object({
  status: EngineStatusEnum,
});

app.patch(
  "/:engineId/status",
  validateParams(EngineIdParams),
  validateJsonBody(UpdateStatusBody),
  async (c) => {
    const { engineId } = getValidParams<z.infer<typeof EngineIdParams>>(c);
    const { status } = getValidBody<z.infer<typeof UpdateStatusBody>>(c);
    const tenantId = c.req.header("x-tenant-id") ?? null;

    await engineLoader.updateStatus(tenantId, engineId, status);

    return c.json({ success: true, engineId, status });
  }
);

export default app;

