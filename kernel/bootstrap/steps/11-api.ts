/**
 * Boot Step 11: API Server
 * 
 * Start Hono HTTP server and register shutdown handlers
 */

import { startAPIServer, registerShutdownHandlers } from "../../api/index";
import { loadConfig } from "../../boot/kernel.config";
import { kernelState } from "../../hardening/diagnostics/state";
import { baseLogger } from "../../observability/logger";

export async function bootAPI() {
  baseLogger.info("🌐 Starting API server...");

  const config = loadConfig();
  await startAPIServer(config);

  // Register SIGINT/SIGTERM handlers for graceful shutdown
  registerShutdownHandlers();

  kernelState.apiReady = true;
  baseLogger.info({ port: config.port }, "   ✅ API running on port %d", config.port);
}
