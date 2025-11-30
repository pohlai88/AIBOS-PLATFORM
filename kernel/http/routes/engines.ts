/**
 * Engine Routes
 *
 * HTTP endpoints for engine management with Zod validation
 */

import type { Hono } from 'hono';
import { z } from 'zod';
import { ZMcpEngineManifest, EngineStatusEnum } from '../../contracts/schemas';
import {
  validateJsonBody,
  validateParams,
  getValidBody,
  getValidParams,
} from '../zod-middleware';
import { engineLoader } from '../../engines/engine-loader';

export function registerEngineRoutes(app: Hono) {
  // Register a new engine
  app.post('/engines/register', validateJsonBody(ZMcpEngineManifest), async (c) => {
    const manifest = getValidBody<z.infer<typeof ZMcpEngineManifest>>(c);
    const tenantId = c.req.header('x-tenant-id') ?? null;
    const signature = c.req.header('x-engine-signature') ?? undefined;

    const engineRecord = await engineLoader.registerEngine(tenantId, manifest, signature);

    return c.json(engineRecord, 201);
  });

  // Get engine by ID
  const EngineIdParams = z.object({
    engineId: z.string().min(1),
  });

  app.get('/engines/:engineId', validateParams(EngineIdParams), async (c) => {
    const { engineId } = getValidParams<z.infer<typeof EngineIdParams>>(c);
    const tenantId = c.req.header('x-tenant-id') ?? null;

    const engine = await engineLoader.loadEngineRecord(tenantId, engineId);

    if (!engine) {
      return c.json({ error: 'Engine not found' }, 404);
    }

    return c.json(engine);
  });

  // List engines for tenant
  app.get('/engines', async (c) => {
    const tenantId = c.req.header('x-tenant-id') ?? null;
    const engines = await engineLoader.listByTenant(tenantId);
    return c.json({ engines });
  });

  // Update engine status
  const UpdateStatusBody = z.object({
    status: EngineStatusEnum,
  });

  app.patch(
    '/engines/:engineId/status',
    validateParams(EngineIdParams),
    validateJsonBody(UpdateStatusBody),
    async (c) => {
      const { engineId } = getValidParams<z.infer<typeof EngineIdParams>>(c);
      const { status } = getValidBody<z.infer<typeof UpdateStatusBody>>(c);
      const tenantId = c.req.header('x-tenant-id') ?? null;

      await engineLoader.updateStatus(tenantId, engineId, status);

      return c.json({ success: true, engineId, status });
    },
  );
}
