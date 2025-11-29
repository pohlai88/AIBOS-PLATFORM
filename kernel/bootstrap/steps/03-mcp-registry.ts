/**
 * Bootstrap Step 3: MCP Registry Initialization
 * 
 * GRCD-KERNEL v4.0.0 F-2: Validate manifests before hydration
 * Loads and validates all MCP server manifests at boot time
 */

import { mcpRegistry, mcpManifestValidator } from "../../mcp";
import { manifestLoader } from "../../mcp/registry/manifest.loader";
import type { MCPManifest } from "../../mcp/types";
import { baseLogger as logger } from "../../observability/logger";

/**
 * MCP Registry Bootstrap Step
 */
export async function bootstrapMCPRegistry(): Promise<void> {
  logger.info("🔧 Bootstrapping MCP Registry...");

  try {
    // Load MCP manifests from configuration
    const manifests = await loadMCPManifests();

    let registered = 0;
    let failed = 0;

    for (const manifest of manifests) {
      try {
        // Validate manifest
        const validation = mcpManifestValidator.validate(manifest);
        
        if (!validation.valid) {
          logger.error(`❌ MCP manifest validation failed for ${manifest.name}:`, {
            errors: validation.errors,
          });
          failed++;
          continue;
        }

        // Log warnings if any
        if (validation.warnings && validation.warnings.length > 0) {
          logger.warn(`⚠️ MCP manifest warnings for ${manifest.name}:`, {
            warnings: validation.warnings,
          });
        }

        // Register manifest
        const result = await mcpRegistry.register(manifest);
        
        if (result.success) {
          logger.info(`✅ Registered MCP server: ${manifest.name} (hash: ${result.manifestHash?.substring(0, 8)}...)`);
          registered++;
        } else {
          logger.error(`❌ Failed to register MCP server: ${manifest.name}`, {
            error: result.error,
          });
          failed++;
        }
      } catch (error) {
        logger.error(`❌ Error processing MCP manifest:`, { error });
        failed++;
      }
    }

    logger.info(`✅ MCP Registry initialized: ${registered} registered, ${failed} failed`);

    if (failed > 0 && registered === 0) {
      throw new Error("MCP Registry initialization failed: no manifests registered");
    }
  } catch (error) {
    logger.error("❌ MCP Registry bootstrap failed:", { error });
    throw error;
  }
}

/**
 * Load MCP manifests from configuration
 * 
 * Loads from:
 * - File system (kernel/mcp/manifests/*.json)
 * - Environment variables (MCP_MANIFESTS)
 * - Remote registry (MCP_REGISTRY_URL)
 */
async function loadMCPManifests(): Promise<MCPManifest[]> {
  logger.info("📂 Loading MCP manifests...");

  try {
    const manifests = await manifestLoader.loadAll();
    logger.info(`✅ Loaded ${manifests.length} manifests from all sources`);
    return manifests;
  } catch (error) {
    logger.error("❌ Failed to load manifests:", { error });
    return [];
  }
}

/**
 * Export bootstrap step for kernel boot sequence
 */
export default {
  name: "mcp-registry",
  order: 3,
  execute: bootstrapMCPRegistry,
};

