// ai/governance.engine.ts
/**
 * AI Governance Engine — The Supreme Court of AI-BOS Kernel
 * 
 * Orchestrates all AI guardian decisions to ensure:
 * - DB schema integrity (Schema Guardian)
 * - Query performance (Performance Guardian)
 * - Regulatory compliance (Compliance Guardian)
 * - Contract adherence (Drift Guardian)
 * - Explainability (Explain Guardian)
 * 
 * Integrates with:
 * - Event Bus (typed events)
 * - Audit Chain (cryptographic trail)
 * - Metadata Registry
 * - Engine Registry
 * 
 * Exceeds: Azure AI Guardrails, AWS Bedrock, Google Vertex, LangChain
 */

import { eventBus } from "../events/event-bus";
import { appendAuditEntry } from "../audit/hash-chain.store";
import { baseLogger } from "../observability/logger";
import { schemaGuardian } from "./guardians/schema.guardian";
import { performanceGuardian } from "./guardians/performance.guardian";
import { complianceGuardian } from "./guardians/compliance.guardian";
import { driftGuardian } from "./guardians/drift.guardian";
import { explainGuardian } from "./guardians/explain.guardian";

/**
 * Guardian decision result
 */
export interface GuardianDecision {
  guardian: string;
  status: "ALLOW" | "DENY" | "WARN" | "ERROR";
  reason?: string;
  details?: unknown;
  timestamp: Date;
}

/**
 * Governance review context
 */
export interface GovernanceContext {
  tenantId?: string | null;
  actorId?: string;
  requestId?: string;
  correlationId?: string;
}

/**
 * Governance review result
 */
export interface GovernanceResult {
  status: "APPROVED" | "DENIED" | "WARNING";
  decisions: GuardianDecision[];
  explanation: {
    summary: string;
    rationale: string;
    alternatives?: string[];
  };
  timestamp: Date;
}

/**
 * AI Governance Engine
 * 
 * Central orchestrator for all AI governance decisions
 */
export class AiGovernanceEngine {
  /**
   * Review an AI action through all guardians
   * 
   * @param action - Action ID (e.g., "schema.update", "query.execute")
   * @param payload - Action payload
   * @param context - Governance context (tenant, actor, etc.)
   * @returns Governance result
   */
  async review(
    action: string,
    payload: unknown,
    context?: GovernanceContext
  ): Promise<GovernanceResult> {
    const startTime = Date.now();
    const decisions: GuardianDecision[] = [];

    // --- Schema Guardian ---
    try {
      const decision = await schemaGuardian.inspect(action, payload, context);
      decisions.push({ ...decision, timestamp: new Date() });
    } catch (error) {
      decisions.push({
        guardian: "schema",
        status: "ERROR",
        reason: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });
    }

    // --- Performance Guardian ---
    try {
      const decision = await performanceGuardian.inspect(action, payload, context);
      decisions.push({ ...decision, timestamp: new Date() });
    } catch (error) {
      decisions.push({
        guardian: "performance",
        status: "ERROR",
        reason: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });
    }

    // --- Compliance Guardian ---
    try {
      const decision = await complianceGuardian.inspect(action, payload, context);
      decisions.push({ ...decision, timestamp: new Date() });
    } catch (error) {
      decisions.push({
        guardian: "compliance",
        status: "ERROR",
        reason: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });
    }

    // --- Drift Guardian ---
    try {
      const decision = await driftGuardian.inspect(action, payload, context);
      decisions.push({ ...decision, timestamp: new Date() });
    } catch (error) {
      decisions.push({
        guardian: "drift",
        status: "ERROR",
        reason: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      });
    }

    // --- Explainability Guardian (always runs last) ---
    const explanation = await explainGuardian.explain(action, payload, decisions);

    const duration = Date.now() - startTime;

    // --- Emit governance event ---
    try {
      await eventBus.publishTyped("ai.guardian.decision", {
        type: "ai.guardian.decision",
        tenantId: context?.tenantId,
        actorId: context?.actorId,
        traceId: context?.requestId,
        correlationId: context?.correlationId,
        payload: {
          action,
          decisions,
          explanation,
          duration,
        },
      });
    } catch (error) {
      baseLogger.error({ error }, "[GovernanceEngine] Failed to emit event");
    }

    // --- Audit decision ---
    try {
      await appendAuditEntry({
        tenantId: context?.tenantId || "system",
        actorId: context?.actorId || "ai-governance-engine",
        actionId: "ai.guardian.decision",
        payload: {
          action,
          decisions: decisions.map((d) => ({
            guardian: d.guardian,
            status: d.status,
            reason: d.reason,
          })),
          explanation: explanation.summary,
        },
      });
    } catch (error) {
      baseLogger.error({ error }, "[GovernanceEngine] Failed to audit decision");
    }

    // --- Enforce mandatory guardian rules ---
    const denials = decisions.filter((d) => d.status === "DENY");
    if (denials.length > 0) {
      const deniedBy = denials.map((d) => d.guardian).join(", ");
      const reasons = denials.map((d) => d.reason).join("; ");

      throw new GovernanceDenialError(
        `AI governance denied by: ${deniedBy}. Reasons: ${reasons}`,
        denials
      );
    }

    // --- Determine overall status ---
    const hasWarnings = decisions.some((d) => d.status === "WARN");
    const hasErrors = decisions.some((d) => d.status === "ERROR");

    const status: GovernanceResult["status"] = hasErrors
      ? "WARNING"
      : hasWarnings
        ? "WARNING"
        : "APPROVED";

    return {
      status,
      decisions,
      explanation,
      timestamp: new Date(),
    };
  }

  /**
   * Review multiple actions in batch
   * 
   * @param actions - Array of actions to review
   * @param context - Governance context
   * @returns Array of governance results
   */
  async reviewBatch(
    actions: Array<{ action: string; payload: unknown }>,
    context?: GovernanceContext
  ): Promise<GovernanceResult[]> {
    const results: GovernanceResult[] = [];

    for (const { action, payload } of actions) {
      try {
        const result = await this.review(action, payload, context);
        results.push(result);
      } catch (error) {
        if (error instanceof GovernanceDenialError) {
          // Don't throw, just collect the error
          results.push({
            status: "DENIED",
            decisions: error.decisions,
            explanation: {
              summary: error.message,
              rationale: "Batch review: action denied",
            },
            timestamp: new Date(),
          });
        } else {
          throw error;
        }
      }
    }

    return results;
  }

  /**
   * Get guardian statistics
   * 
   * @returns Guardian stats
   */
  getStats(): {
    guardians: string[];
    totalGuardians: number;
  } {
    return {
      guardians: ["schema", "performance", "compliance", "drift", "explain"],
      totalGuardians: 5,
    };
  }
}

/**
 * Custom error for governance denials
 */
export class GovernanceDenialError extends Error {
  constructor(
    message: string,
    public decisions: GuardianDecision[]
  ) {
    super(message);
    this.name = "GovernanceDenialError";
  }
}

/**
 * Singleton instance
 */
export const aiGovernance = new AiGovernanceEngine();

