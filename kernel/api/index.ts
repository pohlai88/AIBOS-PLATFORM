/**
 * API Server
 * 
 * Hono HTTP server with graceful shutdown
 */

import { serve } from "@hono/node-server";
import { createApiRouter } from "./router";
import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";

let server: ReturnType<typeof serve> | null = null;

export async function startAPIServer(config: { port: number }) {
  const app = createApiRouter();

  console.log(`🌍 Starting API server on port ${config.port} ...`);

  server = serve({
    fetch: app.fetch,
    port: config.port,
  });

  return app;
}

export async function stopAPIServer(): Promise<void> {
  if (server) {
    console.log("🛑 Stopping API server...");
    server.close();
    server = null;
  }
}

/**
 * Graceful shutdown handler
 */
export async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🛑 Received ${signal}, initiating graceful shutdown...`);

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
