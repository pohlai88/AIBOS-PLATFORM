/**
 * Metadata Routes
 *
 * Endpoints for metadata and catalog access.
 */

import type { Hono } from 'hono';
import { createOpenApiHandler } from '../openapi';

export function registerMetadataRoutes(app: Hono) {
  // OpenAPI spec
  app.get(
    '/openapi.json',
    createOpenApiHandler({
      version: '1.0.0',
      title: 'AI-BOS Kernel API',
    }),
  );

  // Get metadata for an entity
  app.get('/metadata/:entityId', async (c) => {
    const entityId = c.req.param('entityId');
    const tenantId = c.req.header('x-tenant-id') ?? null;

    // TODO: Implement metadata registry lookup
    return c.json({
      entityId,
      tenantId,
      metadata: null,
      message: 'Metadata registry lookup not yet implemented',
    });
  });
}

