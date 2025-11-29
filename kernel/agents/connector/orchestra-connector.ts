/**
 * Agent-Orchestra Connector
 * 
 * AI-BOS Kernel v6.0.0 Phase 5: Agent-Orchestra Integration
 * Enables AI agents to consume orchestra actions within governance
 */

import type { Agent, AgentExecutionContext } from "../types";
import type { OrchestraActionRequest, OrchestraActionResult, OrchestrationDomain } from "../../orchestras/types";
import { orchestraConductor } from "../../orchestras/coordinator/conductor";
import { agentPolicyEnforcer } from "../policy/agent-policy-enforcer";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("agent-orchestra-connector");

/**
 * Agent-Orchestra Connector
 * Facilitates agent access to orchestra actions with policy enforcement
 */
export class AgentOrchestraConnector {
  private static instance: AgentOrchestraConnector;

  private constructor() {}

  public static getInstance(): AgentOrchestraConnector {
    if (!AgentOrchestraConnector.instance) {
      AgentOrchestraConnector.instance = new AgentOrchestraConnector();
    }
    return AgentOrchestraConnector.instance;
  }

  /**
   * Execute orchestra action on behalf of an agent
   * Applies policy enforcement before execution
   * 
   * Enhanced with memory management - automatically loads and updates agent memory
   */
  public async executeOrchestraAction(
    agent: Agent,
    domain: OrchestrationDomain,
    action: string,
    arguments: Record<string, any>,
    context: AgentExecutionContext
  ): Promise<OrchestraActionResult> {
    const agentId = agent.manifest.id;

    logger.info({ agentId, domain, action }, "Agent requesting orchestra action");

    // 1. Verify agent is allowed to use this orchestra domain
    if (!agent.manifest.orchestraDomains.includes(domain)) {
      logger.warn({ agentId, domain }, "Agent not authorized for this orchestra domain");
      return {
        success: false,
        domain,
        action,
        error: {
          code: "AGENT_UNAUTHORIZED_DOMAIN",
          message: `Agent '${agentId}' is not authorized to use orchestra domain '${domain}'`,
        },
        metadata: {
          executionTimeMs: 0,
        },
      };
    }

    // 2. Load agent memory context (if available)
    const { agentMemoryManager } = await import("../memory");
    const sessionId = context.sessionId || `session-${Date.now()}`;
    const memory = await agentMemoryManager.getMemory(agentId, sessionId, false);
    
    // Enrich context with memory if available
    const enrichedContext = { ...context };
    if (memory) {
      enrichedContext.memory = {
        context: memory.context,
        recentHistory: memory.history.slice(-10), // Last 10 actions
        policyContext: memory.policyContext,
      };
    }

    // 2.5. Build orchestra request
    const request: OrchestraActionRequest = {
      domain,
      action,
      arguments,
      context: {
        tenantId: enrichedContext.tenantId,
        userId: enrichedContext.userId,
        sessionId: enrichedContext.sessionId || sessionId,
        traceId: enrichedContext.traceId,
        orchestrationId: `agent-${agentId}-${Date.now()}`,
        metadata: {
          agentId,
          agentName: agent.manifest.name,
          trigger: enrichedContext.trigger,
          memory: enrichedContext.memory,
        },
      },
    };

    // 3. Enforce policies for agent actions
    try {
      await agentPolicyEnforcer.enforce(agent, request);
    } catch (error) {
      logger.warn({ agentId, domain, action, error }, "Agent action denied by policy");
      return {
        success: false,
        domain,
        action,
        error: {
          code: "AGENT_POLICY_DENIED",
          message: error instanceof Error ? error.message : "Policy denied agent action",
        },
        metadata: {
          executionTimeMs: 0,
        },
      };
    }

    // 4. Execute orchestra action
    const actionStartTime = Date.now();
    logger.debug({ agentId, domain, action }, "Executing orchestra action for agent");
    const result = await orchestraConductor.coordinateAction(request);
    const actionDurationMs = Date.now() - actionStartTime;

    // 5. Save action to agent memory history
    if (result.success) {
      try {
        await agentMemoryManager.addActionToHistory(agentId, sessionId, {
          actionId: request.context.orchestrationId || `action-${Date.now()}`,
          actionType: `${domain}.${action}`,
          arguments,
          result: {
            success: result.success,
            agentId,
            actionType: `${domain}.${action}`,
            data: result.data,
            metadata: {
              executionTimeMs: actionDurationMs,
            },
          },
          timestamp: new Date(),
          durationMs: actionDurationMs,
          success: result.success,
        });

        // Update context if result contains context updates
        if (result.contextUpdates) {
          await agentMemoryManager.updateContext(agentId, sessionId, result.contextUpdates);
        }
      } catch (memoryError) {
        // Log but don't fail the request if memory update fails
        logger.warn(
          { agentId, sessionId, error: memoryError },
          "[AgentOrchestraConnector] Failed to update agent memory"
        );
      }
    }

    logger.info({ agentId, domain, action, success: result.success }, "Agent orchestra action completed");

    return result;
  }

  /**
   * Check if agent can access a specific orchestra domain
   */
  public canAccessDomain(agent: Agent, domain: OrchestrationDomain): boolean {
    return agent.manifest.orchestraDomains.includes(domain);
  }

  /**
   * Get all orchestra domains accessible by an agent
   */
  public getAccessibleDomains(agent: Agent): OrchestrationDomain[] {
    return agent.manifest.orchestraDomains;
  }
}

export const agentOrchestraConnector = AgentOrchestraConnector.getInstance();

