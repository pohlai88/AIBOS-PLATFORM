import { loadConfig } from "./kernel.config";
import { connectDatabase } from "../storage/db";
import { connectCache } from "../storage/redis";
import { initAI } from "../ai/lynx.adapter";
import { initRegistries } from "../registry/_init";
import { loadEngines } from "../registry/engine.loader";
import { startAPIServer } from "../api";

export async function bootKernel() {
  console.log("🟦 Booting AI-BOS Kernel...");

  // 1. Load config
  const config = loadConfig();
  console.log("⚙️ Config loaded.");

  // 2. Init services
  await connectDatabase();
  console.log("🗄️ Database connected.");

  await connectCache();
  console.log("📦 Redis connected.");

  await initAI();
  console.log("🤖 Lynx AI initialized.");

  // 3. Init registries
  initRegistries();
  console.log("📚 Registries initialized.");

  // 4. Load engines
  await loadEngines();
  console.log("🚀 Engines loaded.");

  // 5. Start API server
  await startAPIServer(config);
  console.log("🌐 Kernel API ready.");

  console.log("🔥 Kernel boot completed.");
}

