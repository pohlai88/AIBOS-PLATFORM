/**
 * Memory-Enhanced Agent Wrapper
 * 
 * Wraps an agent with memory management capabilities
 */

import type { Agent, AgentActionRequest, AgentActionResult } from "../types";
import { agentMemoryManager } from "./agent-memory-manager";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Memory-Enhanced Agent
 * 
 * Wraps an agent to add persistent memory capabilities
 */
export class MemoryEnhancedAgent {
  private agent: Agent;
  private sessionId: string;

  constructor(agent: Agent, sessionId?: string) {
    this.agent = agent;
    this.sessionId = sessionId || `session-${Date.now()}`;
  }

  /**
   * Execute action with memory context
   */
  public async execute(request: AgentActionRequest): Promise<AgentActionResult> {
    const agentId = this.agent.manifest.id;
    const startTime = Date.now();

    try {
      // 1. Load memory context
      const memory = await agentMemoryManager.getMemory(
        agentId,
        this.sessionId,
        true
      );

      if (!memory) {
        throw new Error("Failed to load agent memory");
      }

      // 2. Enrich request with memory context
      const enrichedRequest: AgentActionRequest = {
        ...request,
        context: {
          ...request.context,
          memory: {
            context: memory.context,
            recentHistory: memory.history.slice(-10), // Last 10 actions
            policyContext: memory.policyContext,
          },
        },
      };

      // 3. Execute agent action
      const result = await this.agent.execute(enrichedRequest);

      // 4. Save action to history
      await agentMemoryManager.addActionToHistory(agentId, this.sessionId, {
        actionId: request.context.traceId || `action-${Date.now()}`,
        actionType: request.actionType,
        arguments: request.arguments,
        result,
        timestamp: new Date(),
        durationMs: Date.now() - startTime,
        success: result.success !== false,
      });

      // 5. Update context if result contains context updates
      if (result.contextUpdates) {
        await agentMemoryManager.updateContext(
          agentId,
          this.sessionId,
          result.contextUpdates
        );
      }

      return result;
    } catch (error) {
      logger.error(
        {
          agentId,
          sessionId: this.sessionId,
          error: error instanceof Error ? error.message : String(error),
        },
        "[MemoryEnhancedAgent] Error executing action"
      );

      throw error;
    }
  }

  /**
   * Get memory context
   */
  public async getContext(key: string): Promise<any> {
    return agentMemoryManager.getContext(
      this.agent.manifest.id,
      this.sessionId,
      key
    );
  }

  /**
   * Update context
   */
  public async updateContext(updates: Record<string, any>): Promise<void> {
    await agentMemoryManager.updateContext(
      this.agent.manifest.id,
      this.sessionId,
      updates
    );
  }

  /**
   * Get full memory
   */
  public async getMemory() {
    return agentMemoryManager.getMemory(
      this.agent.manifest.id,
      this.sessionId,
      false
    );
  }

  /**
   * Create snapshot
   */
  public async createSnapshot() {
    return agentMemoryManager.createSnapshot(
      this.agent.manifest.id,
      this.sessionId
    );
  }

  /**
   * Get underlying agent
   */
  public getAgent(): Agent {
    return this.agent;
  }

  /**
   * Get session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }
}

