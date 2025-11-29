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

let server: ReturnType<typeof serve> | null = null;

export async function startAPIServer(config: { port: number }) {
  const app = createApiRouter();

  console.log(`🌍 Starting API server on port ${config.port} ...`);

  server = serve({
    fetch: app.fetch,
    port: config.port,
  });

  // NF-4: Start periodic memory tracking (every 60 seconds)
  const memoryTrackingInterval = setInterval(() => {
    memoryTracker.takeSnapshot();
    const stats = memoryTracker.getMemoryStats();
    if (!stats.compliant) {
      console.warn(`⚠️  Memory usage exceeds SLA: ${(stats.current / 1024 / 1024).toFixed(2)}MB > ${(stats.slaTarget / 1024 / 1024).toFixed(2)}MB`);
    }
  }, 60000); // Every 60 seconds

  // Store interval ID for cleanup
  (global as any).__memoryTrackingInterval = memoryTrackingInterval;

  return app;
}

export async function stopAPIServer(): Promise<void> {
  if (server) {
    console.log("🛑 Stopping API server...");
    
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
  console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);

  // NF-2: Mark system as down
  availabilityTracker.markDown("graceful-shutdown", `Received ${signal} signal`);

  const shutdownStart = Date.now();

  try {
    // 1. Stop accepting new requests
    await stopAPIServer();
    console.log("   ✅ API server stopped");

    // 2. Close Redis connection
    await RedisStore.shutdown();
    console.log("   ✅ Redis disconnected");

    // 3. Close database connection
    await Database.shutdown();
    console.log("   ✅ Database disconnected");

    const duration = Date.now() - shutdownStart;
    console.log(`✅ Graceful shutdown complete (${duration}ms)`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
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
    console.error("❌ Uncaught exception:", err);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled rejection:", reason);
    // Don't exit on unhandled rejection, just log
  });
}
