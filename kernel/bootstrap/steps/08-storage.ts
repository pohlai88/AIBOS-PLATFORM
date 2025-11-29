/**
 * Boot Step 08: Storage Subsystem
 * 
 * Initialize DB (Supabase/Postgres) and Redis (ioredis)
 * with health checks and fail-fast behavior
 */

import { Database } from "../../storage/db";
import { RedisStore } from "../../storage/redis";
import { kernelState } from "../../hardening/diagnostics/state";
import { getConfig } from "../../boot/kernel.config";
import { KernelError } from "../../hardening/errors/kernel-error";
import { baseLogger } from "../../observability/logger";

export async function bootStorage() {
  const config = getConfig();
  baseLogger.info({ storageMode: config.storageMode }, "💾 Initializing storage (mode: %s)...", config.storageMode);

  // ─────────────────────────────────────────────────────────
  // Database
  // ─────────────────────────────────────────────────────────
  Database.init();
  const dbHealth = await Database.health();

  if (config.storageMode === "SUPABASE") {
    if (dbHealth.status === "down") {
      throw new KernelError(
        `Database connection failed: ${dbHealth.error}`,
        "DB_CONNECT_FAILED"
      );
    }
    baseLogger.info(
      { status: dbHealth.status, latencyMs: dbHealth.latencyMs },
      "   ✅ Database: %s (%dms)",
      dbHealth.status,
      dbHealth.latencyMs
    );
  } else {
    baseLogger.info("   📦 Database: in-memory mode");
  }
  kernelState.dbReady = true;

  // ─────────────────────────────────────────────────────────
  // Redis
  // ─────────────────────────────────────────────────────────
  RedisStore.init();
  const redisHealth = await RedisStore.health();

  if (config.storageMode === "SUPABASE" && config.redisUrl) {
    if (redisHealth.status === "down") {
      // Soft-fail: log warning but continue
      baseLogger.warn(
        { status: redisHealth.status, error: redisHealth.error },
        "   ⚠️ Redis: %s - %s",
        redisHealth.status,
        redisHealth.error
      );
      baseLogger.warn("   ⚠️ Continuing in degraded mode (no distributed cache)");
    } else {
      baseLogger.info(
        { status: redisHealth.status, latencyMs: redisHealth.latencyMs },
        "   ✅ Redis: %s (%dms)",
        redisHealth.status,
        redisHealth.latencyMs
      );
    }
  } else {
    baseLogger.info("   📦 Redis: in-memory mode");
  }

  // Note: Shutdown handlers are registered in api/index.ts
}
