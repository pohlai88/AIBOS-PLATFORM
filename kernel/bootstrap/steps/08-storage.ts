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

export async function bootStorage() {
  const config = getConfig();
  console.log(`💾 Initializing storage (mode: ${config.storageMode})...`);

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
    console.log(`   ✅ Database: ${dbHealth.status} (${dbHealth.latencyMs}ms)`);
  } else {
    console.log(`   📦 Database: in-memory mode`);
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
      console.warn(`   ⚠️ Redis: ${redisHealth.status} - ${redisHealth.error}`);
      console.warn(`   ⚠️ Continuing in degraded mode (no distributed cache)`);
    } else {
      console.log(`   ✅ Redis: ${redisHealth.status} (${redisHealth.latencyMs}ms)`);
    }
  } else {
    console.log(`   📦 Redis: in-memory mode`);
  }

  // Note: Shutdown handlers are registered in api/index.ts
}
