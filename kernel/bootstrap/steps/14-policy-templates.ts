/**
 * Policy Templates Bootstrap
 * 
 * GRCD-KERNEL v4.0.0 Section 5.6: Initialize Policy Templates
 * Registers built-in policy templates during kernel startup
 */

import type { BootstrapStep } from "../bootstrap.types";
import { policyTemplateRegistry } from "../../policy/templates/template-registry";
import { builtinTemplates } from "../../policy/templates/builtin-templates";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("bootstrap-policy-templates");

export const initializePolicyTemplates: BootstrapStep = {
  name: "Initialize Policy Templates",
  priority: 135, // After policies (130)
  async execute(): Promise<void> {
    logger.info("[Bootstrap] Starting initialization of Policy Templates...");

    try {
      // Register all built-in templates
      for (const template of builtinTemplates) {
        policyTemplateRegistry.registerTemplate(template);
        logger.debug({ templateId: template.id, name: template.name }, "[Bootstrap] Registered policy template");
      }

      logger.info(
        { templateCount: builtinTemplates.length },
        `[Bootstrap] Successfully initialized ${builtinTemplates.length} policy templates`
      );
    } catch (error) {
      logger.error({ error }, "[Bootstrap] Failed to initialize Policy Templates");
      throw new Error(`Failed to initialize Policy Templates: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
};

