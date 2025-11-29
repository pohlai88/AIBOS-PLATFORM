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

    // 2. Build orchestra request
    const request: OrchestraActionRequest = {
      domain,
      action,
      arguments,
      context: {
        tenantId: context.tenantId,
        userId: context.userId,
        sessionId: context.sessionId,
        traceId: context.traceId,
        orchestrationId: `agent-${agentId}-${Date.now()}`,
        metadata: {
          agentId,
          agentName: agent.manifest.name,
          trigger: context.trigger,
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
    logger.debug({ agentId, domain, action }, "Executing orchestra action for agent");
    const result = await orchestraConductor.coordinateAction(request);

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

