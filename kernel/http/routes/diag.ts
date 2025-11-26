/**
 * Diagnostics Routes
 *
 * Deep diagnostics endpoint for debugging and monitoring.
 */

import type { Hono } from 'hono';
import { getConfig } from '../../boot/kernel.config';
import { getRecentAuditEvents } from '../../audit/audit.store';
import { listRegisteredActions } from '../../registry/action.registry';

export function registerDiagRoutes(app: Hono) {
  app.get('/diagz', async (c) => {
    const config = getConfig();

    const diag = {
      timestamp: new Date().toISOString(),
      kernel: {
        storageMode: config.storageMode,
        authEnabled: config.authEnable,
      },
      actions: {
        registered: listRegisteredActions().length,
      },
      audit: {
        recentEventsCount: getRecentAuditEvents(10).length,
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      },
    };

    return c.json(diag);
  });
}

