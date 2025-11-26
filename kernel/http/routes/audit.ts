/**
 * Audit Routes
 *
 * Endpoints for audit log access.
 */

import type { Hono } from 'hono';
import { getRecentAuditEvents } from '../../audit/audit.store';

export function registerAuditRoutes(app: Hono) {
  // Get recent audit events
  app.get('/audit', async (c) => {
    const limit = parseInt(c.req.query('limit') ?? '100', 10);
    const events = getRecentAuditEvents(Math.min(limit, 1000));

    return c.json({
      events: events.map((e) => ({
        id: e.id,
        createdAt: e.createdAt.toISOString(),
        eventType: e.event.eventType,
        severity: e.event.severity,
        principalId: e.event.principalId,
        tenantId: e.event.tenantId,
        actionId: e.event.actionId,
      })),
      count: events.length,
    });
  });
}

