/**
 * AI Agents Bootstrap
 * 
 * AI-BOS Kernel v6.0.0 Phase 5: Initialize AI Agents
 * Registers example AI agents during kernel startup
 */

import type { BootstrapStep } from "../bootstrap.types";
import { agentRegistry } from "../../agents/registry/agent-registry";
import { dataAgent } from "../../agents/examples/data-agent";
import { complianceAgent } from "../../agents/examples/compliance-agent";
import { costAgent } from "../../agents/examples/cost-agent";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("bootstrap-ai-agents");

export const initializeAiAgents: BootstrapStep = {
  name: "Initialize AI Agents",
  priority: 140, // After policy templates (135)
  async execute(): Promise<void> {
    logger.info("[Bootstrap] Starting initialization of AI Agents...");

    const agents = [dataAgent, complianceAgent, costAgent];

    try {
      // Register all example agents
      for (const agent of agents) {
        await agentRegistry.register(agent);
        logger.info(
          { agentId: agent.manifest.id, name: agent.manifest.name },
          "[Bootstrap] Registered AI agent"
        );
      }

      logger.info(
        { agentCount: agents.length },
        `[Bootstrap] Successfully initialized ${agents.length} AI agents`
      );
    } catch (error) {
      logger.error({ error }, "[Bootstrap] Failed to initialize AI Agents");
      throw new Error(`Failed to initialize AI Agents: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
};

