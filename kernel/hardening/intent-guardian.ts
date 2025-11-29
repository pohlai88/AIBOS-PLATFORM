/**
 * 🧩 Intent Guardian v1.0
 * 
 * Merges static + behavioral + ruleset analysis:
 * - Rulebook enforcement
 * - Behavior classification
 * - Intent determination
 * 
 * @version 1.0.0
 */

import { BehaviorClassifier, type BehaviorClassification } from "./behavior-classifier";
import { Rulebook, type RuleEvaluation } from "./rulebook";
import { type IntentClassification } from "./llm-adapter";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface IntentInspection {
  allowed: boolean;
  level: IntentClassification;
  reason: string;
  details: {
    ruleEvaluation?: RuleEvaluation;
    behaviorClassification?: BehaviorClassification;
  };
}

// ═══════════════════════════════════════════════════════════
// Intent Guardian
// ═══════════════════════════════════════════════════════════

export class IntentGuardian {
  /**
   * Full inspection with LLM analysis
   */
  static async inspect(code: string, context: string): Promise<IntentInspection> {
    // Stage 1: Rulebook enforcement (fast)
    const ruleCheck = Rulebook.evaluate(code, context);
    if (ruleCheck.violates && ruleCheck.rule) {
      return {
        allowed: false,
        level: "malicious",
        reason: `Rule violation: ${ruleCheck.rule.description} (matched: "${ruleCheck.matchedText}")`,
        details: { ruleEvaluation: ruleCheck },
      };
    }

    // Stage 2: Behavioral + LLM intent analysis
    const behavior = await BehaviorClassifier.classify(code, context);

    if (behavior.intent === "malicious") {
      return {
        allowed: false,
        level: "malicious",
        reason: behavior.reasons.join("; "),
        details: { ruleEvaluation: ruleCheck, behaviorClassification: behavior },
      };
    }

    if (behavior.intent === "risky") {
      return {
        allowed: false,
        level: "risky",
        reason: behavior.reasons.join("; "),
        details: { ruleEvaluation: ruleCheck, behaviorClassification: behavior },
      };
    }

    if (behavior.intent === "unknown" && behavior.confidence < 0.6) {
      return {
        allowed: false,
        level: "unknown",
        reason: `Low confidence analysis (${(behavior.confidence * 100).toFixed(0)}%): ${behavior.reasons.join("; ")}`,
        details: { ruleEvaluation: ruleCheck, behaviorClassification: behavior },
      };
    }

    return {
      allowed: true,
      level: "safe",
      reason: "Intent verified as safe",
      details: { ruleEvaluation: ruleCheck, behaviorClassification: behavior },
    };
  }

  /**
   * Quick inspection (static only, no LLM)
   */
  static inspectSync(code: string, context: string): IntentInspection {
    // Stage 1: Rulebook enforcement
    const ruleCheck = Rulebook.evaluate(code, context);
    if (ruleCheck.violates && ruleCheck.rule) {
      return {
        allowed: false,
        level: "malicious",
        reason: `Rule violation: ${ruleCheck.rule.description}`,
        details: { ruleEvaluation: ruleCheck },
      };
    }

    // Stage 2: Static-only behavior analysis
    const behavior = BehaviorClassifier.classifyStatic(code);

    if (behavior.intent === "malicious" || behavior.intent === "risky") {
      return {
        allowed: false,
        level: behavior.intent,
        reason: behavior.reasons.join("; "),
        details: { ruleEvaluation: ruleCheck, behaviorClassification: behavior },
      };
    }

    return {
      allowed: true,
      level: behavior.intent,
      reason: "Static analysis passed",
      details: { ruleEvaluation: ruleCheck, behaviorClassification: behavior },
    };
  }
}

export const intentGuardian = IntentGuardian;

