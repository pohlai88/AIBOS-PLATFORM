import { loadConfig } from "./kernel.config";
import { connectDatabase } from "../storage/db";
import { connectCache } from "../storage/redis";
import { initAI } from "../ai/lynx.adapter";
import { initRegistries } from "../registry/_init";
import { loadEngines } from "../registry/engine.loader";
import { startAPIServer } from "../api";
import { baseLogger } from "../observability/logger";

export async function bootKernel() {
  baseLogger.info("🟦 Booting AI-BOS Kernel...");

  // 1. Load config
  const config = loadConfig();
  baseLogger.info("⚙️ Config loaded.");

  // 2. Init services
  await connectDatabase();
  baseLogger.info("🗄️ Database connected.");

  await connectCache();
  baseLogger.info("📦 Redis connected.");

  await initAI();
  baseLogger.info("🤖 Lynx AI initialized.");

  // 3. Init registries
  initRegistries();
  baseLogger.info("📚 Registries initialized.");

  // 4. Load engines
  await loadEngines();
  baseLogger.info("🚀 Engines loaded.");

  // 5. Start API server
  await startAPIServer(config);
  baseLogger.info("🌐 Kernel API ready.");

  baseLogger.info("🔥 Kernel boot completed.");
}

