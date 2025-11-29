/**
 * Policy Bootstrap Step
 * 
 * GRCD-KERNEL v4.0.0 C-6: Initialize policy registry and load policies
 */

import { BootstrapStep } from "../bootstrap.types";
import { policyRegistry } from "../../policy/registry/policy-registry";
import { createTraceLogger } from "../../observability/logger";
import type { PolicyManifest } from "../../policy/types";
import { promises as fs } from "fs";
import path from "path";

const logger = createTraceLogger("bootstrap-policies");

/**
 * Bootstrap step to initialize and register policies
 */
export const initializePolicies: BootstrapStep = {
  name: "Initialize Policy Registry",
  priority: 130,
  async execute(): Promise<void> {
    logger.info("[Bootstrap] Starting initialization of Policy Registry...");

    const policyExamplesDir = path.join(process.cwd(), "kernel", "policy", "examples");

    try {
      // Ensure the directory exists
      await fs.mkdir(policyExamplesDir, { recursive: true });

      const files = await fs.readdir(policyExamplesDir);
      const loadedPolicies: PolicyManifest[] = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filePath = path.join(policyExamplesDir, file);
          try {
            const content = await fs.readFile(filePath, "utf-8");
            const policy: PolicyManifest = JSON.parse(content);
            const result = await policyRegistry.register(policy);
            
            if (result.success) {
              loadedPolicies.push(policy);
              logger.debug(`[Bootstrap] Registered policy: ${policy.name}`);
            } else {
              logger.error({file, error: result.error}, "[Bootstrap] Failed to register policy");
            }
          } catch (error) {
            logger.error({ file, error }, "[Bootstrap] Failed to load policy file");
          }
        }
      }

      if (loadedPolicies.length === 0) {
        logger.warn("[Bootstrap] No policies found in examples directory");
      } else {
        logger.info(`[Bootstrap] Successfully initialized ${loadedPolicies.length} policies`);
        
        // Log precedence distribution
        const counts = policyRegistry.getCountByPrecedence();
        logger.info({
          legal: counts[3] || 0,
          industry: counts[2] || 0,
          internal: counts[1] || 0,
        }, "[Bootstrap] Policy precedence distribution");
      }
    } catch (error) {
      logger.error({ error }, "[Bootstrap] Failed to initialize policies from filesystem");
      throw new Error(`Failed to initialize policies: ${error.message}`);
    }
  },
};

