/**
 * Readiness Probe
 * 
 * Returns live health status of DB and Redis
 */

import { Hono } from "hono";
import { kernelState } from "../../hardening/diagnostics/state";
import { Database } from "../../storage/db";
import { RedisStore } from "../../storage/redis";
import { getConfig } from "../../boot/kernel.config";

export const readyRoute = new Hono();

readyRoute.get("/", async (c) => {
  const config = getConfig();

  // Get live health status
  const [dbHealth, redisHealth] = await Promise.all([
    Database.health(),
    RedisStore.health(),
  ]);

  const dbOk = dbHealth.status !== "down";
  const redisOk = redisHealth.status !== "down";

  // In SUPABASE mode, DB must be healthy
  // Redis can be degraded (soft-fail)
  const ready =
    kernelState.apiReady &&
    kernelState.tenantsReady &&
    (config.storageMode === "IN_MEMORY" || dbOk);

  const status = ready ? 200 : 503;

  return c.json(
    {
      ready,
      status: ready ? "healthy" : "unhealthy",
      storageMode: config.storageMode,
      checks: {
        api: { status: kernelState.apiReady ? "up" : "down" },
        tenants: { status: kernelState.tenantsReady ? "up" : "down" },
        ai: { status: kernelState.aiReady ? "up" : "down" },
        database: {
          status: dbHealth.status,
          latencyMs: dbHealth.latencyMs,
          error: dbHealth.error,
        },
        redis: {
          status: redisHealth.status,
          latencyMs: redisHealth.latencyMs,
          error: redisHealth.error,
        },
      },
      timestamp: Date.now(),
    },
    status
  );
});
