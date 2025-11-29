/**
 * UI Routes
 *
 * Endpoints for UI schema retrieval.
 */

import type { Hono } from 'hono';

export function registerUiRoutes(app: Hono) {
  // Get UI schema for an entity
  app.get('/ui/:entityId', async (c) => {
    const entityId = c.req.param('entityId');
    const tenantId = c.req.header('x-tenant-id') ?? null;

    // TODO: Implement UI schema registry lookup
    return c.json({
      entityId,
      tenantId,
      schema: null,
      message: 'UI schema registry not yet implemented',
    });
  });
}

