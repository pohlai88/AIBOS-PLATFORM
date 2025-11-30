/**
 * 🧬 Behavior Classifier v1.0
 * 
 * Multi-stage code behavior analysis:
 * - Static threat detection
 * - LLM intent analysis
 * - Pattern correlation
 * 
 * @version 1.0.0
 */

import { ThreatMatrix, type ThreatAnalysis } from "./threat-matrix";
import { LLMAdapter, type IntentAnalysis, type IntentClassification } from "./llm-adapter";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface BehaviorClassification {
  intent: IntentClassification;
  source: "static" | "llm" | "hybrid";
  confidence: number;
  reasons: string[];
  staticAnalysis?: ThreatAnalysis;
  llmAnalysis?: IntentAnalysis;
}

// ═══════════════════════════════════════════════════════════
// Behavior Classifier
// ═══════════════════════════════════════════════════════════

export class BehaviorClassifier {
  /**
   * Classify code behavior using multi-stage analysis
   */
  static async classify(code: string, context: string): Promise<BehaviorClassification> {
    // Stage 1: Static threat analysis
    const staticAnalysis = ThreatMatrix.analyze(code);

    // If static analysis finds critical threats, short-circuit
    if (staticAnalysis.riskScore >= 70) {
      return {
        intent: "malicious",
        source: "static",
        confidence: 0.95,
        reasons: staticAnalysis.threats.map(t => `${t.pattern.name}: ${t.pattern.description}`),
        staticAnalysis,
      };
    }

    // Stage 2: LLM behavioral intent analysis
    const llmAnalysis = await LLMAdapter.analyzeIntent(code, context);

    // Stage 3: Combine results
    return this.combineAnalysis(staticAnalysis, llmAnalysis);
  }

  /**
   * Quick static-only classification (no LLM)
   */
  static classifyStatic(code: string): BehaviorClassification {
    const staticAnalysis = ThreatMatrix.analyze(code);

    let intent: IntentClassification;
    if (staticAnalysis.riskScore >= 70) {
      intent = "malicious";
    } else if (staticAnalysis.riskScore >= 40) {
      intent = "risky";
    } else if (staticAnalysis.riskScore > 0) {
      intent = "unknown";
    } else {
      intent = "safe";
    }

    return {
      intent,
      source: "static",
      confidence: staticAnalysis.safe ? 0.9 : 0.8,
      reasons: staticAnalysis.threats.map(t => t.pattern.description),
      staticAnalysis,
    };
  }

  /**
   * Combine static and LLM analysis
   */
  private static combineAnalysis(
    staticAnalysis: ThreatAnalysis,
    llmAnalysis: IntentAnalysis
  ): BehaviorClassification {
    const reasons: string[] = [];

    // Add static reasons
    if (!staticAnalysis.safe) {
      reasons.push(...staticAnalysis.threats.map(t => `[Static] ${t.pattern.description}`));
    }

    // Add LLM reasons
    if (llmAnalysis.explanation) {
      reasons.push(`[LLM] ${llmAnalysis.explanation}`);
    }
    if (llmAnalysis.patterns.length > 0) {
      reasons.push(`[LLM Patterns] ${llmAnalysis.patterns.join(", ")}`);
    }

    // Determine final intent (worst of both)
    const intentPriority: Record<IntentClassification, number> = {
      malicious: 4,
      risky: 3,
      unknown: 2,
      safe: 1,
    };

    const staticIntent = this.riskScoreToIntent(staticAnalysis.riskScore);
    const llmIntent = llmAnalysis.intent;

    const finalIntent = intentPriority[staticIntent] >= intentPriority[llmIntent]
      ? staticIntent
      : llmIntent;

    // Calculate combined confidence
    const staticConfidence = staticAnalysis.safe ? 0.9 : 0.85;
    const combinedConfidence = (staticConfidence + llmAnalysis.confidence) / 2;

    return {
      intent: finalIntent,
      source: "hybrid",
      confidence: combinedConfidence,
      reasons,
      staticAnalysis,
      llmAnalysis,
    };
  }

  /**
   * Convert risk score to intent
   */
  private static riskScoreToIntent(score: number): IntentClassification {
    if (score >= 70) return "malicious";
    if (score >= 40) return "risky";
    if (score > 0) return "unknown";
    return "safe";
  }
}

export const behaviorClassifier = BehaviorClassifier;

