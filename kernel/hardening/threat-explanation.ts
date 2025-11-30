/**
 * 💬 Threat Explanation v1.0
 * 
 * Human-readable threat explanations:
 * - Firewall blocks
 * - Intent analysis
 * - Risk assessments
 * 
 * @version 1.0.0
 */

import { type IntentInspection } from "./intent-guardian";
import { type FirewallResult } from "./ai-firewall-v2";
import { type RiskScore } from "./risk-scoring-engine";

// ═══════════════════════════════════════════════════════════
// Threat Explanation
// ═══════════════════════════════════════════════════════════

export class ThreatExplanation {
  /**
   * Explain firewall block
   */
  static explainBlock(result: FirewallResult): string {
    const { inspection, context, timestamp } = result;

    return `
⚠️  AI Firewall 2.0 — Threat Detected
════════════════════════════════════════

📍 Context: ${context}
⏰ Time: ${new Date(timestamp).toISOString()}
🚨 Level: ${inspection.level.toUpperCase()}

📋 Reason:
${inspection.reason}

${inspection.details.ruleEvaluation?.rule ? `
📜 Rule Violated:
   ID: ${inspection.details.ruleEvaluation.rule.id}
   Name: ${inspection.details.ruleEvaluation.rule.name}
   Severity: ${inspection.details.ruleEvaluation.rule.severity}
   Description: ${inspection.details.ruleEvaluation.rule.description}
` : ""}

${inspection.details.behaviorClassification ? `
🧬 Behavior Analysis:
   Source: ${inspection.details.behaviorClassification.source}
   Confidence: ${(inspection.details.behaviorClassification.confidence * 100).toFixed(0)}%
   Reasons: ${inspection.details.behaviorClassification.reasons.join("\n            ")}
` : ""}

🛡️ Action: Execution BLOCKED
    `.trim();
  }

  /**
   * Explain intent inspection
   */
  static explainIntent(inspection: IntentInspection): string {
    const statusIcon = inspection.allowed ? "✅" : "❌";
    const statusText = inspection.allowed ? "ALLOWED" : "BLOCKED";

    return `
${statusIcon} Intent Analysis Result: ${statusText}
════════════════════════════════════════

🎯 Intent Level: ${inspection.level.toUpperCase()}
📋 Reason: ${inspection.reason}

${inspection.details.behaviorClassification ? `
🧬 Behavior Classification:
   Method: ${inspection.details.behaviorClassification.source}
   Confidence: ${(inspection.details.behaviorClassification.confidence * 100).toFixed(0)}%
   
   Findings:
   ${inspection.details.behaviorClassification.reasons.map(r => `• ${r}`).join("\n   ")}
` : ""}
    `.trim();
  }

  /**
   * Explain risk score
   */
  static explainRisk(risk: RiskScore): string {
    const levelEmoji = {
      LOW: "🟢",
      MEDIUM: "🟡",
      HIGH: "🟠",
      CRITICAL: "🔴",
    }[risk.level];

    return `
${levelEmoji} Kernel Risk Assessment
════════════════════════════════════════

📊 Risk Level: ${risk.level}
📈 Score: ${risk.score}/100
⏰ Assessed: ${new Date(risk.timestamp).toISOString()}

📋 Contributing Factors:
${risk.factors.map(f => `
   • ${f.name}
     Weight: ${(f.weight * 100).toFixed(0)}%
     Score: ${f.score}/100
     Details: ${f.details}
`).join("")}

💡 Recommendation:
${risk.recommendation}
    `.trim();
  }

  /**
   * Generate summary for multiple threats
   */
  static summarize(blocks: FirewallResult[]): string {
    if (blocks.length === 0) {
      return "✅ No threats detected in the analyzed period.";
    }

    const byLevel = {
      malicious: blocks.filter(b => b.inspection.level === "malicious").length,
      risky: blocks.filter(b => b.inspection.level === "risky").length,
      unknown: blocks.filter(b => b.inspection.level === "unknown").length,
    };

    const byContext: Record<string, number> = {};
    blocks.forEach(b => {
      byContext[b.context] = (byContext[b.context] || 0) + 1;
    });

    return `
🛡️ Threat Summary Report
════════════════════════════════════════

📊 Total Blocks: ${blocks.length}

🚨 By Severity:
   • Malicious: ${byLevel.malicious}
   • Risky: ${byLevel.risky}
   • Unknown: ${byLevel.unknown}

📍 By Context:
${Object.entries(byContext).map(([ctx, count]) => `   • ${ctx}: ${count}`).join("\n")}

⏰ Time Range: ${new Date(Math.min(...blocks.map(b => b.timestamp))).toISOString()} 
            to ${new Date(Math.max(...blocks.map(b => b.timestamp))).toISOString()}
    `.trim();
  }
}

export const threatExplanation = ThreatExplanation;

