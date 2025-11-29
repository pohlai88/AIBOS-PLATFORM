/**
 * Metrics Routes
 *
 * Prometheus metrics endpoint.
 */

import type { Hono } from 'hono';
import { metricsRegistry } from '../../observability/metrics';

export function registerMetricsRoutes(app: Hono) {
  app.get('/metrics', async (c) => {
    const body = await metricsRegistry.metrics();
    return c.text(body, 200, {
      'Content-Type': metricsRegistry.contentType,
    });
  });
}
