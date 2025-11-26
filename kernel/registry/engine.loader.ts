import * as fs from "fs";
import * as path from "path";
import { engineRegistry } from "./engine.registry";
import { validateManifest } from "../validation/manifest.validator";
import { loadMetadata } from "./metadata.loader";
import { loadActions } from "./actions.loader";
import { loadUI } from "./ui.loader";
import { log } from "../utils/logger";
import { loadConfig } from "../boot/kernel.config";

export async function loadEngines() {
  const { engineDir } = loadConfig();

  if (!fs.existsSync(engineDir)) {
    log.warn(`Engine directory not found: ${engineDir}`);
    return;
  }

  const engineFolders = fs.readdirSync(engineDir);

  for (const folder of engineFolders) {
    const enginePath = path.join(engineDir, folder);
    const manifestPath = path.join(enginePath, "manifest.json");

    // Skip if manifest missing
    if (!fs.existsSync(manifestPath)) {
      log.warn(`⚠️ Skipping ${folder}: manifest.json missing.`);
      continue;
    }

    // Load manifest
    const manifestRaw = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestRaw);

    // Validate manifest
    const validation = await validateManifest(manifest);
    if (!validation.ok) {
      log.error(`❌ Manifest invalid for ${folder}:`, validation.errors);
      continue;
    }

    // Load metadata
    const metadata = await loadMetadata(enginePath);

    // Load actions
    const actions = await loadActions(enginePath);

    // Load UI schema
    const ui = await loadUI(enginePath);

    // Register engine
    engineRegistry.register(folder, {
      manifest,
      metadata,
      actions,
      ui
    });

    log.info(`✅ Engine loaded: ${folder}`);
  }

  log.info("🚀 Engine loading completed.");
}

