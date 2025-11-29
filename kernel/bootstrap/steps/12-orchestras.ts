/**
 * Bootstrap Step 12: Orchestra Initialization
 * 
 * GRCD-KERNEL v4.0.0 F-15: Coordinate multiple AI orchestras
 * Loads and validates all Orchestra manifests at boot time
 */

import { orchestraRegistry } from "../../orchestras";
import type { OrchestraManifest } from "../../orchestras/types";
import { baseLogger as logger } from "../../observability/logger";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

/**
 * Orchestra Registry Bootstrap Step
 */
export async function bootstrapOrchestras(): Promise<void> {
  logger.info("🎭 Bootstrapping Orchestra Registry...");

  try {
    // Load Orchestra manifests from domains
    const manifests = await loadOrchestraManifests();

    let registered = 0;
    let failed = 0;

    for (const manifest of manifests) {
      try {
        // Register manifest
        const result = await orchestraRegistry.register(manifest);

        if (result.success) {
          logger.info(
            `✅ Registered Orchestra: ${manifest.domain} (${manifest.name})`,
            {
              agents: manifest.agents.length,
              tools: manifest.tools.length,
              hash: result.manifestHash?.substring(0, 8),
            }
          );
          registered++;
        } else {
          logger.error(`❌ Failed to register Orchestra: ${manifest.domain}`, {
            error: result.error,
          });
          failed++;
        }
      } catch (error) {
        logger.error(`❌ Error processing Orchestra manifest:`, { error });
        failed++;
      }
    }

    logger.info(
      `✅ Orchestra Registry initialized: ${registered} registered, ${failed} failed`
    );

    if (failed > 0 && registered === 0) {
      throw new Error(
        "Orchestra Registry initialization failed: no orchestras registered"
      );
    }
  } catch (error) {
    logger.error("❌ Orchestra Registry bootstrap failed:", { error });
    throw error;
  }
}

/**
 * Load Orchestra manifests from domain directories
 */
async function loadOrchestraManifests(): Promise<OrchestraManifest[]> {
  const manifests: OrchestraManifest[] = [];
  const domainsPath = join(process.cwd(), "kernel/orchestras/domains");

  try {
    const domains = await readdir(domainsPath);

    for (const domain of domains) {
      // Skip README and non-directories
      if (domain === "README.md" || domain.startsWith(".")) {
        continue;
      }

      try {
        const manifestPath = join(domainsPath, domain, "manifest.json");
        const content = await readFile(manifestPath, "utf-8");
        const manifest = JSON.parse(content) as OrchestraManifest;
        manifests.push(manifest);
        logger.debug(`📄 Loaded orchestra manifest: ${domain}`);
      } catch (error) {
        logger.warn(`⚠️ No manifest found for domain: ${domain}`, { error });
      }
    }
  } catch (error) {
    logger.warn(`📂 Orchestras directory not found: ${domainsPath}`);
  }

  logger.info(`✅ Loaded ${manifests.length} orchestra manifests`);
  return manifests;
}

/**
 * Export bootstrap step for kernel boot sequence
 */
export default {
  name: "orchestras",
  order: 12,
  execute: bootstrapOrchestras,
};

