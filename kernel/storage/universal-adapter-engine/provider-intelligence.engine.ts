/**
 * ⚡ Provider Intelligence Engine™
 * 
 * AI reasoning layer for:
 * - Provider selection
 * - Trade-off analysis
 * - Risk prediction
 * - Fallback strategy generation
 * - Explainability (XAI)
 * 
 * Works above:
 *  - CapabilityMatrix v2.1
 *  - CSF Normalizer
 *  - AIGuardrails
 * 
 * @version 1.0.0
 */

import { eventBus } from "../../events/event-bus";
import {
  PROVIDER_CAPABILITIES,
  PROVIDER_IDS,
  type ProviderId,
  type CapabilityMatrix,
  type UseCase,
  type Certification,
  type DataResidencyRegion,
} from "./capability-matrix";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ProviderDecision {
  best: ProviderId;
  ranking: Array<{ provider: ProviderId; score: number; reasons: string[] }>;
  risks: string[];
  fallback: ProviderId[];
  explanation: string;
  raw: Record<string, any>;
}

export interface ProviderDecisionRequirements {
  workload: "transactional" | "analytics" | "realtime" | "batch" | "ml" | "document";
  concurrency?: number;
  minLatency?: "low" | "ultra-low";
  residency?: DataResidencyRegion[];
  requiredCerts?: Certification[];
  costPriority?: "low" | "balanced" | "performance";
  stability?: "production" | "beta" | "experimental";
  dataShape?: "tabular" | "document" | "vector";
  features?: Partial<CapabilityMatrix>;
}

// ═══════════════════════════════════════════════════════════
// Workload Weight Maps
// ═══════════════════════════════════════════════════════════

const workloadWeights: Record<ProviderDecisionRequirements["workload"], Record<string, number>> = {
  transactional: {
    transactionLevel: 8,
    latencyProfile: 5,
    throughputProfile: 3,
    supportsRLS: 6,
    supportsAuditLog: 5,
    supportsSoftDeletes: 4,
  },
  analytics: {
    throughputProfile: 8,
    fullTextLevel: 6,
    supportsCDC: 6,
    supportsDeltaSync: 5,
    supportsStreaming: 4,
  },
  realtime: {
    supportsRealtime: 8,
    latencyProfile: 8,
    supportsChangefeed: 6,
    supportsWebhooks: 4,
  },
  batch: {
    supportsBatch: 7,
    maxBatchSize: 5,
    throughputProfile: 5,
    supportsDLQ: 4,
  },
  ml: {
    fullTextLevel: 5,
    supportedTypes: 6,
    throughputProfile: 4,
    supportsStreaming: 3,
  },
  document: {
    supportedTypes: 8,
    schemaModel: 6,
    maxRecordSize: 4,
  },
};

// ═══════════════════════════════════════════════════════════
// Provider Intelligence Engine
// ═══════════════════════════════════════════════════════════

export class ProviderIntelligenceEngine {
  /**
   * 🧠 MAIN DECISION FUNCTION
   */
  static decide(req: ProviderDecisionRequirements): ProviderDecision {
    const ranking = PROVIDER_IDS
      .filter(p => p !== "custom")
      .map(provider => {
        const caps = PROVIDER_CAPABILITIES[provider];
        const scoreObj = this.scoreProvider(provider, caps, req);
        return {
          provider,
          score: scoreObj.score,
          reasons: scoreObj.reasons,
          raw: scoreObj.raw,
        };
      })
      .sort((a, b) => b.score - a.score);

    const best = ranking[0].provider;
    const fallback = ranking.slice(1, 3).map(r => r.provider);
    const risks = this.inferRisks(PROVIDER_CAPABILITIES[best], req);
    const explanation = this.generateExplanation(best, ranking[0].reasons, risks);

    this.logDecision(best, ranking, req, risks);

    return {
      best,
      ranking,
      risks,
      fallback,
      explanation,
      raw: { ranking, requirements: req },
    };
  }

  /**
   * Quick provider recommendation for a use case
   */
  static recommendForUseCase(useCase: UseCase): ProviderId {
    const providers = PROVIDER_IDS.filter(p => {
      if (p === "custom") return false;
      return PROVIDER_CAPABILITIES[p].idealFor.includes(useCase);
    });

    if (providers.length === 0) return "supabase"; // Default

    // Return the one with best cost-performance ratio
    return providers.sort((a, b) => {
      const costOrder = ["ultra-low", "low", "medium", "high", "enterprise"];
      const costA = costOrder.indexOf(PROVIDER_CAPABILITIES[a].costProfile);
      const costB = costOrder.indexOf(PROVIDER_CAPABILITIES[b].costProfile);
      return costA - costB;
    })[0];
  }

  // ═══════════════════════════════════════════════════════════
  // Scoring Engine
  // ═══════════════════════════════════════════════════════════

  private static scoreProvider(
    id: ProviderId,
    caps: CapabilityMatrix,
    req: ProviderDecisionRequirements
  ): { score: number; reasons: string[]; raw: Record<string, any> } {
    const reasons: string[] = [];
    let score = 0;
    const raw: Record<string, any> = {};

    // Workload-specific scoring
    const weights = workloadWeights[req.workload];
    for (const [key, weight] of Object.entries(weights)) {
      const capValue = caps[key as keyof CapabilityMatrix];
      raw[key] = capValue;
      if (capValue === undefined) continue;

      const matched = this.evaluateCapabilityMatch(key, capValue, req);
      if (matched) {
        score += weight;
        reasons.push(`✔ ${key} matches workload`);
      }
    }

    // Residency scoring
    if (req.residency) {
      const matchesResidency = req.residency.every(r =>
        caps.dataResidency.includes(r)
      );
      if (matchesResidency) {
        score += 10;
        reasons.push("✔ Meets data residency");
      } else {
        score -= 5;
        reasons.push("⚠ Missing residency regions");
      }
    }

    // Certification scoring
    if (req.requiredCerts) {
      const overlap = req.requiredCerts.filter(c =>
        caps.certifications.includes(c)
      );
      score += overlap.length * 4;
      if (overlap.length < req.requiredCerts.length) {
        reasons.push("⚠ Missing certifications");
      } else {
        reasons.push("✔ All certifications met");
      }
    }

    // Latency
    if (req.minLatency) {
      const ok = this.compareLatency(caps.latencyProfile, req.minLatency);
      if (ok) {
        score += 5;
        reasons.push("✔ Latency requirement met");
      }
    }

    // Cost priorities
    if (req.costPriority) {
      const costRank = this.rankCost(caps.costProfile);
      if (req.costPriority === "low") {
        score += 5 - costRank;
        if (costRank <= 1) reasons.push("✔ Low cost provider");
      } else if (req.costPriority === "performance") {
        score += costRank;
        if (costRank >= 3) reasons.push("✔ High-performance tier");
      }
    }

    // Stability
    if (req.stability && caps.stabilityTier !== req.stability) {
      if (req.stability === "production" && caps.stabilityTier !== "production") {
        score -= 10;
        reasons.push("⚠ Not production-grade");
      }
    }

    return { score, reasons, raw };
  }

  private static evaluateCapabilityMatch(
    key: string,
    value: any,
    req: ProviderDecisionRequirements
  ): boolean {
    switch (key) {
      case "supportedTypes":
        if (!req.dataShape) return true;
        if (req.dataShape === "vector") return (value as string[]).includes("vector");
        if (req.dataShape === "document") return (value as string[]).includes("json");
        return true;
      case "transactionLevel":
        return value !== "none";
      case "fullTextLevel":
        return value !== "none";
      case "latencyProfile":
        return value === "low" || value === "ultra-low";
      case "throughputProfile":
        return value === "high" || value === "ultra-high";
      default:
        return Boolean(value);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // Risk Analysis (XAI)
  // ═══════════════════════════════════════════════════════════

  private static inferRisks(caps: CapabilityMatrix, req: ProviderDecisionRequirements): string[] {
    const risks: string[] = [];

    if (caps.stabilityTier !== "production") {
      risks.push("⚠ Provider not production-grade");
    }

    if (req.workload === "realtime" && !caps.supportsRealtime) {
      risks.push("⚠ Realtime workload but provider lacks realtime support");
    }

    if (caps.driftSensitivity === "high") {
      risks.push("⚠ High drift sensitivity — kernel auto-monitor recommended");
    }

    if (req.requiredCerts && req.requiredCerts.some(c => !caps.certifications.includes(c))) {
      risks.push("⚠ Missing compliance certifications");
    }

    if (caps.costProfile === "enterprise" && req.costPriority === "low") {
      risks.push("⚠ High cost provider selected under low-cost preference");
    }

    if (!caps.supportsPointInTimeRecovery) {
      risks.push("⚠ No point-in-time recovery — backup strategy required");
    }

    return risks;
  }

  // ═══════════════════════════════════════════════════════════
  // Explainability Layer
  // ═══════════════════════════════════════════════════════════

  private static generateExplanation(
    best: ProviderId,
    reasons: string[],
    risks: string[]
  ): string {
    return `
🧠 Provider Intelligence Decision
→ Selected Provider: **${best}**

Why:
${reasons.map(r => `• ${r}`).join("\n")}

Risks:
${risks.length === 0 ? "• None" : risks.map(r => `• ${r}`).join("\n")}
    `.trim();
  }

  // ═══════════════════════════════════════════════════════════
  // Logging
  // ═══════════════════════════════════════════════════════════

  private static async logDecision(
    provider: ProviderId,
    ranking: any,
    req: ProviderDecisionRequirements,
    risks: string[]
  ): Promise<void> {
    await eventBus.publish({
      type: "provider.intelligence.decision",
      provider,
      ranking: ranking.slice(0, 3), // Top 3 only
      requirements: req,
      risks,
      timestamp: new Date().toISOString(),
    } as any);
  }

  // ═══════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════

  private static compareLatency(actual: string, required: string): boolean {
    const order = ["high", "medium", "low", "ultra-low"];
    return order.indexOf(actual) >= order.indexOf(required);
  }

  private static rankCost(cost: CapabilityMatrix["costProfile"]): number {
    const order: CapabilityMatrix["costProfile"][] = ["ultra-low", "low", "medium", "high", "enterprise"];
    return order.indexOf(cost);
  }
}

export const providerIntelligence = ProviderIntelligenceEngine;

