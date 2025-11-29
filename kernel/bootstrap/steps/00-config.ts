import { loadConfig } from "../../boot/kernel.config";
import { baseLogger } from "../../observability/logger";

export async function bootConfig() {
  baseLogger.info("⚙️  Loading config...");
  const config = loadConfig();
  baseLogger.info(
    {
      rootDir: config.rootDir,
      engineDir: config.engineDir,
      port: config.port,
    },
    "   Root: %s, Engines: %s, Port: %d",
    config.rootDir,
    config.engineDir,
    config.port
  );
}

