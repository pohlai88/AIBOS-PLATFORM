/**
 * MCP Manifest Loader
 * 
 * GRCD-KERNEL v4.0.0 F-2: Load and validate MCP manifests
 * Loads manifests from multiple sources: filesystem, environment, remote
 */

import type { MCPManifest } from "../types";
import { baseLogger as logger } from "../../observability/logger";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { mcpManifestValidator } from "../validator/manifest.validator";

/**
 * Manifest Loader Configuration
 */
export interface ManifestLoaderConfig {
  /**
   * Directory to load manifest files from
   * Default: kernel/mcp/manifests
   */
  manifestsDir?: string;

  /**
   * Environment variable containing JSON array of manifests
   * Default: MCP_MANIFESTS
   */
  envVariable?: string;

  /**
   * Remote manifest registry URL
   * Default: undefined (not loaded)
   */
  registryUrl?: string;

  /**
   * Whether to validate manifests before returning
   * Default: true
   */
  validateManifests?: boolean;
}

/**
 * Manifest Loader - Loads MCP manifests from multiple sources
 */
export class ManifestLoader {
  private config: Required<ManifestLoaderConfig>;

  constructor(config: ManifestLoaderConfig = {}) {
    this.config = {
      manifestsDir: config.manifestsDir || join(process.cwd(), "kernel/mcp/manifests"),
      envVariable: config.envVariable || "MCP_MANIFESTS",
      registryUrl: config.registryUrl || "",
      validateManifests: config.validateManifests ?? true,
    };
  }

  /**
   * Load all manifests from all configured sources
   */
  async loadAll(): Promise<MCPManifest[]> {
    const manifests: MCPManifest[] = [];

    // 1. Load from filesystem
    const fileManifests = await this.loadFromFilesystem();
    manifests.push(...fileManifests);
    logger.info(`📂 Loaded ${fileManifests.length} manifests from filesystem`);

    // 2. Load from environment
    const envManifests = await this.loadFromEnvironment();
    manifests.push(...envManifests);
    logger.info(`🌍 Loaded ${envManifests.length} manifests from environment`);

    // 3. Load from remote registry (if configured)
    if (this.config.registryUrl) {
      const remoteManifests = await this.loadFromRemote();
      manifests.push(...remoteManifests);
      logger.info(`🌐 Loaded ${remoteManifests.length} manifests from remote`);
    }

    // 4. Validate manifests if enabled
    if (this.config.validateManifests) {
      const validManifests = manifests.filter((manifest) => {
        const validation = mcpManifestValidator.validate(manifest);
        if (!validation.valid) {
          logger.warn(`⚠️ Invalid manifest: ${manifest.name}`, {
            errors: validation.errors,
          });
          return false;
        }
        return true;
      });

      logger.info(
        `✅ Validated ${validManifests.length}/${manifests.length} manifests`
      );
      return validManifests;
    }

    return manifests;
  }

  /**
   * Load manifests from filesystem (*.json files in manifestsDir)
   */
  private async loadFromFilesystem(): Promise<MCPManifest[]> {
    const manifests: MCPManifest[] = [];

    try {
      const files = await readdir(this.config.manifestsDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json"));

      for (const file of jsonFiles) {
        try {
          const filePath = join(this.config.manifestsDir, file);
          const content = await readFile(filePath, "utf-8");
          const manifest = JSON.parse(content) as MCPManifest;
          manifests.push(manifest);
          logger.debug(`📄 Loaded manifest: ${file}`);
        } catch (error) {
          logger.warn(`⚠️ Failed to load manifest file: ${file}`, { error });
        }
      }
    } catch (error) {
      // Directory doesn't exist or not readable - this is OK
      logger.debug(
        `📂 Manifests directory not found: ${this.config.manifestsDir}`
      );
    }

    return manifests;
  }

  /**
   * Load manifests from environment variable
   * 
   * Expected format: MCP_MANIFESTS='[{...manifest1...}, {...manifest2...}]'
   */
  private async loadFromEnvironment(): Promise<MCPManifest[]> {
    const manifests: MCPManifest[] = [];

    try {
      const envValue = process.env[this.config.envVariable];
      if (!envValue) {
        return manifests;
      }

      const parsed = JSON.parse(envValue);

      if (Array.isArray(parsed)) {
        manifests.push(...parsed);
        logger.debug(`🌍 Loaded ${manifests.length} manifests from env`);
      } else {
        // Single manifest object
        manifests.push(parsed);
        logger.debug(`🌍 Loaded 1 manifest from env`);
      }
    } catch (error) {
      logger.warn(`⚠️ Failed to parse environment manifests`, { error });
    }

    return manifests;
  }

  /**
   * Load manifests from remote registry
   * 
   * TODO: Implement remote registry protocol
   * This will support fetching manifests from a remote MCP registry service
   */
  private async loadFromRemote(): Promise<MCPManifest[]> {
    const manifests: MCPManifest[] = [];

    try {
      if (!this.config.registryUrl) {
        return manifests;
      }

      logger.info(`🌐 Fetching manifests from: ${this.config.registryUrl}`);

      const response = await fetch(this.config.registryUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        manifests.push(...data);
      } else if (data.manifests && Array.isArray(data.manifests)) {
        manifests.push(...data.manifests);
      } else {
        manifests.push(data);
      }

      logger.info(`🌐 Loaded ${manifests.length} manifests from remote`);
    } catch (error) {
      logger.error(`❌ Failed to load manifests from remote registry`, {
        error,
        url: this.config.registryUrl,
      });
    }

    return manifests;
  }
}

/**
 * Export default manifest loader instance
 */
export const manifestLoader = new ManifestLoader();

