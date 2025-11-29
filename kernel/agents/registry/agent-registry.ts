/**
 * AI Agent Registry
 * 
 * AI-BOS Kernel v6.0.0 Phase 5: Agent Management
 * Central registry for discovering, registering, and managing AI agents
 */

import type { Agent, AgentManifest, AgentRegistryEntry, AgentStatus } from "../types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("agent-registry");

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<string, AgentRegistryEntry> = new Map();

  private constructor() {}

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  /**
   * Register a new agent
   */
  public async register(agent: Agent): Promise<void> {
    const agentId = agent.manifest.id;

    if (this.agents.has(agentId)) {
      throw new Error(`Agent with ID '${agentId}' is already registered`);
    }

    logger.info({ agentId, name: agent.manifest.name }, "Registering agent");

    const entry: AgentRegistryEntry = {
      agent,
      manifest: agent.manifest,
      status: "initializing" as AgentStatus,
      registeredAt: new Date(),
    };

    this.agents.set(agentId, entry);

    // Initialize the agent
    try {
      await agent.initialize();
      entry.status = "running" as AgentStatus;
      entry.startedAt = new Date();
      
      logger.info({ agentId, name: agent.manifest.name }, "Agent registered and initialized");
    } catch (error) {
      entry.status = "error" as AgentStatus;
      logger.error({ error, agentId }, "Failed to initialize agent");
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  public getAgent(agentId: string): Agent | null {
    const entry = this.agents.get(agentId);
    return entry ? entry.agent : null;
  }

  /**
   * Get agent entry (includes status and metadata)
   */
  public getAgentEntry(agentId: string): AgentRegistryEntry | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * List all registered agents
   */
  public listAgents(): AgentManifest[] {
    return Array.from(this.agents.values()).map(entry => entry.manifest);
  }

  /**
   * List agents by capability
   */
  public findAgentsByCapability(capability: string): AgentManifest[] {
    return Array.from(this.agents.values())
      .filter(entry => entry.manifest.capabilities.includes(capability as any))
      .map(entry => entry.manifest);
  }

  /**
   * List agents by orchestra domain
   */
  public findAgentsByDomain(domain: string): AgentManifest[] {
    return Array.from(this.agents.values())
      .filter(entry => entry.manifest.orchestraDomains.includes(domain as any))
      .map(entry => entry.manifest);
  }

  /**
   * Update agent status
   */
  public updateStatus(agentId: string, status: AgentStatus): void {
    const entry = this.agents.get(agentId);
    if (entry) {
      entry.status = status;
      logger.debug({ agentId, status }, "Agent status updated");
    }
  }

  /**
   * Pause an agent
   */
  public async pauseAgent(agentId: string): Promise<void> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    logger.info({ agentId }, "Pausing agent");
    await entry.agent.pause();
    entry.status = "paused" as AgentStatus;
  }

  /**
   * Resume an agent
   */
  public async resumeAgent(agentId: string): Promise<void> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    logger.info({ agentId }, "Resuming agent");
    await entry.agent.resume();
    entry.status = "running" as AgentStatus;
  }

  /**
   * Stop an agent
   */
  public async stopAgent(agentId: string): Promise<void> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      throw new Error(`Agent '${agentId}' not found`);
    }

    logger.info({ agentId }, "Stopping agent");
    await entry.agent.stop();
    entry.status = "stopped" as AgentStatus;
  }

  /**
   * Unregister an agent (removes from registry)
   */
  public async unregister(agentId: string): Promise<void> {
    const entry = this.agents.get(agentId);
    if (!entry) {
      return;
    }

    // Stop the agent first
    if (entry.status === "running" || entry.status === "paused") {
      await this.stopAgent(agentId);
    }

    this.agents.delete(agentId);
    logger.info({ agentId }, "Agent unregistered");
  }

  /**
   * Get health status for all agents
   */
  public async getHealthStatuses(): Promise<Map<string, any>> {
    const statuses = new Map();

    for (const [agentId, entry] of this.agents.entries()) {
      try {
        const health = await entry.agent.getHealth();
        statuses.set(agentId, health);
      } catch (error) {
        statuses.set(agentId, {
          agentId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return statuses;
  }

  /**
   * Get agent count
   */
  public getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Get agents by status
   */
  public getAgentsByStatus(status: AgentStatus): AgentManifest[] {
    return Array.from(this.agents.values())
      .filter(entry => entry.status === status)
      .map(entry => entry.manifest);
  }
}

export const agentRegistry = AgentRegistry.getInstance();

