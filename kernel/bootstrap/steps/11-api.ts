/**
 * Boot Step 11: API Server
 * 
 * Start Hono HTTP server and register shutdown handlers
 */

import { startAPIServer, registerShutdownHandlers } from "../../api/index";
import { loadConfig } from "../../boot/kernel.config";
import { kernelState } from "../../hardening/diagnostics/state";

export async function bootAPI() {
  console.log("🌐 Starting API server...");

  const config = loadConfig();
  await startAPIServer(config);

  // Register SIGINT/SIGTERM handlers for graceful shutdown
  registerShutdownHandlers();

  kernelState.apiReady = true;
  console.log(`   ✅ API running on port ${config.port}`);
}
