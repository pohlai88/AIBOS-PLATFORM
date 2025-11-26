import { loadConfig } from "../../boot/kernel.config";

export async function bootConfig() {
  console.log("⚙️  Loading config...");
  const config = loadConfig();
  console.log(`   Root: ${config.rootDir}`);
  console.log(`   Engines: ${config.engineDir}`);
  console.log(`   Port: ${config.port}`);
}

