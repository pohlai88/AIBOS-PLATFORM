/**
 * Health Routes
 *
 * Liveness and readiness endpoints for Kubernetes compatibility.
 */

import type { Hono } from 'hono';
import { Database } from '../../storage/db';
import { RedisStore } from '../../storage/redis';
import { getConfig } from '../../boot/kernel.config';

export function registerHealthRoutes(app: Hono) {
  // Liveness check - just returns 200 if the process is alive
  app.get('/healthz', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Readiness check - checks DB and Redis connectivity
  app.get('/readyz', async (c) => {
    const config = getConfig();
    const checks: Record<string, { status: string; latencyMs?: number }> = {};

    // DB check
    if (config.storageMode === 'SUPABASE') {
      const dbStart = Date.now();
      try {
        const healthy = await Database.health();
        checks.database = {
          status: healthy.status === 'healthy' ? 'ok' : 'degraded',
          latencyMs: Date.now() - dbStart,
        };
      } catch {
        checks.database = { status: 'error', latencyMs: Date.now() - dbStart };
      }
    } else {
      checks.database = { status: 'in_memory' };
    }

    // Redis check
    const redisStart = Date.now();
    try {
      const healthy = await RedisStore.health();
      checks.redis = {
        status: healthy.status === 'healthy' ? 'ok' : 'degraded',
        latencyMs: Date.now() - redisStart,
      };
    } catch {
      checks.redis = { status: 'error', latencyMs: Date.now() - redisStart };
    }

    const allOk = Object.values(checks).every(
      (check) => check.status === 'ok' || check.status === 'in_memory',
    );

    return c.json(
      {
        status: allOk ? 'ready' : 'not_ready',
        checks,
        timestamp: new Date().toISOString(),
      },
      allOk ? 200 : 503,
    );
  });
}

