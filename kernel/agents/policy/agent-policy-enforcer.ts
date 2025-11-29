/**
 * Agent Policy Enforcer
 * 
 * AI-BOS Kernel v6.0.0 Phase 5: Agent Governance
 * Enforces policies on AI agent actions
 */

import type { Agent } from "../types";
import type { OrchestraActionRequest } from "../../orchestras/types";
import type { PolicyContext, PolicyEffect } from "../../policy/types";
import { policyEngine } from "../../policy/engine/policy-engine";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("agent-policy-enforcer");

/**
 * Agent Policy Enforcer
 * Ensures AI agents operate within policy constraints
 */
export class AgentPolicyEnforcer {
  private static instance: AgentPolicyEnforcer;

  private constructor() {}

  public static getInstance(): AgentPolicyEnforcer {
    if (!AgentPolicyEnforcer.instance) {
      AgentPolicyEnforcer.instance = new AgentPolicyEnforcer();
    }
    return AgentPolicyEnforcer.instance;
  }

  /**
   * Enforce policies for agent-initiated orchestra action
   */
  public async enforce(agent: Agent, request: OrchestraActionRequest): Promise<void> {
    const agentId = agent.manifest.id;

    // Build policy context for agent action
    const policyContext: PolicyContext = {
      tenantId: request.context.tenantId || "default",
      userId: request.context.userId,
      roles: ["ai-agent"], // Special role for AI agents
      resource: {
        type: "agent_orchestra_action",
        id: `${agentId}.${request.domain}.${request.action}`,
        data: {
          agentId,
          agentName: agent.manifest.name,
          orchestraDomain: request.domain,
          orchestraAction: request.action,
          arguments: request.arguments,
          capabilities: agent.manifest.capabilities,
        },
      },
      action: request.action,
      metadata: {
        agentId,
        agentName: agent.manifest.name,
        domain: request.domain,
        executionMode: agent.manifest.executionMode,
        priority: agent.manifest.metadata?.priority,
      },
    };

    logger.debug({ agentId, context: policyContext }, "Evaluating policies for agent action");

    // Evaluate policies
    const decision = await policyEngine.enforce(policyContext);

    if (decision.finalEffect === "deny" as PolicyEffect) {
      logger.warn({ agentId, decision }, "Agent action DENIED by policy");
      throw new Error(`Agent action denied by policy: ${decision.reason}`);
    }

    logger.debug({ agentId, decision }, "Agent action ALLOWED by policy");
  }

  /**
   * Check if agent action would be allowed (dry-run, doesn't throw)
   */
  public async isAllowed(agent: Agent, request: OrchestraActionRequest): Promise<boolean> {
    try {
      await this.enforce(agent, request);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const agentPolicyEnforcer = AgentPolicyEnforcer.getInstance();

