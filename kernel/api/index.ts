/**
 * API Server
 * 
 * Hono HTTP server with graceful shutdown
 */

import { serve } from "@hono/node-server";
import { createApiRouter } from "./router";
import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";
import { availabilityTracker } from "../observability/sla/availability-tracker";
import { memoryTracker } from "../observability/performance/memory-tracker";
import { baseLogger } from "../observability/logger";

let server: ReturnType<typeof serve> | null = null;

export async function startAPIServer(config: { port: number }) {
  const app = createApiRouter();

  baseLogger.info({ port: config.port }, "🌍 Starting API server on port %d ...", config.port);

  server = serve({
    fetch: app.fetch,
    port: config.port,
  });

  // NF-4: Start periodic memory tracking (every 60 seconds)
  const memoryTrackingInterval = setInterval(() => {
    memoryTracker.takeSnapshot();
    const stats = memoryTracker.getMemoryStats();
    if (!stats.compliant) {
      baseLogger.warn(
        {
          currentMB: (stats.current / 1024 / 1024).toFixed(2),
          slaTargetMB: (stats.slaTarget / 1024 / 1024).toFixed(2),
        },
        "⚠️  Memory usage exceeds SLA: %sMB > %sMB",
        (stats.current / 1024 / 1024).toFixed(2),
        (stats.slaTarget / 1024 / 1024).toFixed(2)
      );
    }
  }, 60000); // Every 60 seconds

  // Store interval ID for cleanup
  (global as any).__memoryTrackingInterval = memoryTrackingInterval;

  return app;
}

export async function stopAPIServer(): Promise<void> {
  if (server) {
    baseLogger.info("🛑 Stopping API server...");

    // NF-4: Stop memory tracking
    if ((global as any).__memoryTrackingInterval) {
      clearInterval((global as any).__memoryTrackingInterval);
      (global as any).__memoryTrackingInterval = null;
    }

    server.close();
    server = null;
  }
}

/**
 * Graceful shutdown handler
 */
export async function gracefulShutdown(signal: string): Promise<void> {
  baseLogger.info({ signal }, "🛑 Received %s, initiating graceful shutdown...", signal);

  // NF-2: Mark system as down
  availabilityTracker.markDown("graceful-shutdown", `Received ${signal} signal`);

  const shutdownStart = Date.now();

  try {
    // 1. Stop accepting new requests
    await stopAPIServer();
    baseLogger.info("   ✅ API server stopped");

    // 2. Close Redis connection
    await RedisStore.shutdown();
    baseLogger.info("   ✅ Redis disconnected");

    // 3. Close database connection
    await Database.shutdown();
    baseLogger.info("   ✅ Database disconnected");

    const duration = Date.now() - shutdownStart;
    baseLogger.info({ duration }, "✅ Graceful shutdown complete (%dms)", duration);

    process.exit(0);
  } catch (err) {
    baseLogger.error({ err }, "❌ Error during shutdown");
    process.exit(1);
  }
}

/**
 * Register shutdown handlers
 */
export function registerShutdownHandlers(): void {
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  // Handle uncaught errors gracefully
  process.on("uncaughtException", (err) => {
    baseLogger.error({ err }, "❌ Uncaught exception");
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    baseLogger.error({ reason }, "❌ Unhandled rejection");
    // Don't exit on unhandled rejection, just log
  });
}
