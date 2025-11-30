/**
 * 📖 Explainability Engine v1.0
 * 
 * Natural language explanations for:
 * - Audit events
 * - Drift detections
 * - Fraud alerts
 * - Compliance violations
 * - Fix recommendations
 * 
 * @version 1.0.0
 */

import type { AnomalyResult, AnomalyIndicator, FraudReport } from "./autonomous-guardian";
import type { DriftAlert, DriftFix } from "../drift/predictive-shield";
import type { CascadeReport } from "../drift/cascade-predictor";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Explanation {
  summary: string;
  details: string[];
  technicalContext?: string;
  businessImpact?: string;
  recommendations: string[];
  confidence: number;
  generatedAt: number;
}

export interface ComplianceExplanation extends Explanation {
  regulation: string;
  requirement: string;
  status: "compliant" | "violation" | "warning";
  evidence: string[];
  remediationSteps: string[];
}

// ═══════════════════════════════════════════════════════════
// Explainability Engine
// ═══════════════════════════════════════════════════════════

export class ExplainabilityEngine {

  // ─────────────────────────────────────────────────────────
  // Anomaly Explanations
  // ─────────────────────────────────────────────────────────

  /**
   * Explain anomaly detection result
   */
  explainAnomaly(anomaly: AnomalyResult): Explanation {
    const details: string[] = [];
    const recommendations: string[] = [];

    // Build details from indicators
    for (const indicator of anomaly.indicators) {
      details.push(this.explainIndicator(indicator));
    }

    // Generate recommendations based on type
    switch (anomaly.type) {
      case "fraud":
        recommendations.push("Investigate the user's recent activity");
        recommendations.push("Review related transactions for patterns");
        recommendations.push("Consider temporary access restriction");
        break;
      case "policy_violation":
        recommendations.push("Review the violated policy");
        recommendations.push("Check if exception is warranted");
        recommendations.push("Update policy if too restrictive");
        break;
      case "unusual_pattern":
        recommendations.push("Monitor for recurrence");
        recommendations.push("Establish baseline if this is new normal");
        break;
      case "error":
        recommendations.push("Check system logs for root cause");
        recommendations.push("Verify data integrity");
        break;
    }

    return {
      summary: this.generateAnomalySummary(anomaly),
      details,
      technicalContext: `Anomaly score: ${(anomaly.score * 100).toFixed(1)}%. Type: ${anomaly.type}. Recommendation: ${anomaly.recommendation}.`,
      businessImpact: this.assessBusinessImpact(anomaly),
      recommendations,
      confidence: anomaly.score,
      generatedAt: Date.now(),
    };
  }

  private explainIndicator(indicator: AnomalyIndicator): string {
    const severityText = {
      low: "Minor concern",
      medium: "Moderate concern",
      high: "Significant concern",
      critical: "Critical issue",
    }[indicator.severity];

    return `${severityText}: ${indicator.description}`;
  }

  private generateAnomalySummary(anomaly: AnomalyResult): string {
    const typeText = {
      fraud: "Potential fraudulent activity",
      policy_violation: "Policy violation",
      unusual_pattern: "Unusual activity pattern",
      error: "System error",
    }[anomaly.type];

    const actionText = {
      block: "Immediate action required",
      review: "Manual review recommended",
      monitor: "Continue monitoring",
      allow: "No action needed",
    }[anomaly.recommendation];

    return `${typeText} detected with ${(anomaly.score * 100).toFixed(0)}% confidence. ${actionText}.`;
  }

  private assessBusinessImpact(anomaly: AnomalyResult): string {
    if (anomaly.type === "fraud") {
      return "Potential financial loss or data breach. Immediate investigation recommended.";
    }
    if (anomaly.type === "policy_violation") {
      return "Compliance risk. May affect audit status or regulatory standing.";
    }
    if (anomaly.score > 0.8) {
      return "High-severity issue that may impact operations.";
    }
    return "Low to moderate business impact.";
  }

  // ─────────────────────────────────────────────────────────
  // Fraud Report Explanations
  // ─────────────────────────────────────────────────────────

  /**
   * Explain fraud report
   */
  explainFraudReport(report: FraudReport): Explanation {
    const details: string[] = [];

    // Timeline analysis
    const suspiciousActions = report.timeline.filter(t => t.suspicious);
    if (suspiciousActions.length > 0) {
      details.push(`${suspiciousActions.length} suspicious actions identified in timeline`);
    }

    // Indicator details
    for (const indicator of report.indicators) {
      details.push(this.explainIndicator(indicator));
    }

    // Pattern analysis
    if (report.riskScore > 70) {
      details.push("Multiple high-risk patterns detected across user activity");
    }

    return {
      summary: report.suspicious
        ? `User ${report.userId} shows suspicious activity patterns (${report.riskScore}% risk score)`
        : `User ${report.userId} activity appears normal`,
      details,
      technicalContext: `Risk score: ${report.riskScore}%. Confidence: ${(report.confidence * 100).toFixed(1)}%. Indicators: ${report.indicators.length}.`,
      businessImpact: report.suspicious
        ? "Potential insider threat or compromised account. Review access privileges."
        : "No immediate business impact.",
      recommendations: [report.recommendation],
      confidence: report.confidence,
      generatedAt: Date.now(),
    };
  }

  // ─────────────────────────────────────────────────────────
  // Drift Explanations
  // ─────────────────────────────────────────────────────────

  /**
   * Explain drift alert
   */
  explainDrift(alert: DriftAlert): Explanation {
    const details: string[] = [];
    const recommendations: string[] = [];

    // Describe the drift
    details.push(`Drift detected in: ${alert.entity}`);
    details.push(`Type: ${this.humanizeDriftType(alert.type)}`);
    details.push(`Severity: ${alert.severity}`);

    // Cascade impact
    if (alert.cascade) {
      details.push(`${alert.cascade.totalAffected} dependent entities affected`);
      
      if (alert.cascade.criticalImpacts.length > 0) {
        details.push(`${alert.cascade.criticalImpacts.length} critical impacts identified`);
      }

      if (alert.cascade.estimatedImpact.revenue) {
        details.push(`Estimated revenue impact: ${alert.cascade.estimatedImpact.revenue}`);
      }
    }

    // Recommendations
    if (alert.suggestedFix) {
      recommendations.push(`Suggested fix: ${alert.suggestedFix.description}`);
      recommendations.push(`Confidence: ${(alert.suggestedFix.confidence * 100).toFixed(0)}%`);
    }

    if (alert.autoFixed) {
      recommendations.push("✅ Auto-fix has been applied");
    } else if (alert.severity === "critical") {
      recommendations.push("Immediate review required before deployment");
    }

    return {
      summary: alert.description,
      details,
      technicalContext: `Entity: ${alert.entity}. Type: ${alert.type}. Detected: ${new Date(alert.detectedAt).toISOString()}.`,
      businessImpact: this.assessDriftBusinessImpact(alert),
      recommendations,
      confidence: alert.suggestedFix?.confidence || 0.7,
      generatedAt: Date.now(),
    };
  }

  private humanizeDriftType(type: DriftAlert["type"]): string {
    const types: Record<string, string> = {
      schema_drift: "Schema structure change",
      permission_drift: "Permission or access control change",
      workflow_drift: "Workflow or process change",
      config_drift: "Configuration change",
    };
    return types[type] || type;
  }

  private assessDriftBusinessImpact(alert: DriftAlert): string {
    if (alert.cascade?.criticalImpacts.length) {
      const workflows = alert.cascade.criticalImpacts.filter(i => i.type === "workflow").length;
      if (workflows > 0) {
        return `${workflows} business workflow(s) may break. Potential operational disruption.`;
      }
    }

    if (alert.severity === "critical") {
      return "Critical change that may affect production systems.";
    }

    if (alert.severity === "warning") {
      return "Change requires review but unlikely to cause immediate issues.";
    }

    return "Low business impact. Change is informational.";
  }

  // ─────────────────────────────────────────────────────────
  // Fix Explanations
  // ─────────────────────────────────────────────────────────

  /**
   * Explain suggested fix
   */
  explainFix(fix: DriftFix): Explanation {
    const details: string[] = [];

    details.push(`Fix type: ${this.humanizeFixType(fix.type)}`);
    details.push(`Changes: ${fix.changes.length} modifications`);
    
    for (const change of fix.changes) {
      details.push(`  • ${change.action} at ${change.path}`);
    }

    details.push(`Estimated impact: ${fix.estimatedImpact}`);

    return {
      summary: fix.description,
      details,
      technicalContext: `Fix ID: ${fix.id}. Type: ${fix.type}. Confidence: ${(fix.confidence * 100).toFixed(0)}%.`,
      businessImpact: fix.requiresApproval
        ? "This fix requires manual approval due to its complexity or risk level."
        : "This fix can be safely auto-applied.",
      recommendations: fix.requiresApproval
        ? ["Review the proposed changes", "Test in staging environment", "Approve when ready"]
        : ["Fix has been or will be auto-applied", "Monitor for any issues"],
      confidence: fix.confidence,
      generatedAt: Date.now(),
    };
  }

  private humanizeFixType(type: DriftFix["type"]): string {
    const types: Record<string, string> = {
      add_default: "Add default value to handle null cases",
      backfill: "Backfill missing data",
      update_workflow: "Update workflow to handle changes",
      add_validation: "Add data validation",
      rollback: "Rollback to previous state",
    };
    return types[type] || type;
  }

  // ─────────────────────────────────────────────────────────
  // Compliance Explanations
  // ─────────────────────────────────────────────────────────

  /**
   * Explain compliance status
   */
  explainCompliance(
    regulation: string,
    requirement: string,
    status: "compliant" | "violation" | "warning",
    evidence: any[]
  ): ComplianceExplanation {
    const details: string[] = [];
    const remediationSteps: string[] = [];

    // Status-specific details
    if (status === "compliant") {
      details.push(`✅ System meets ${regulation} requirements`);
      details.push(`Requirement: ${requirement}`);
    } else if (status === "violation") {
      details.push(`❌ Violation of ${regulation} detected`);
      details.push(`Requirement: ${requirement}`);
      remediationSteps.push("Identify the root cause of the violation");
      remediationSteps.push("Implement corrective measures");
      remediationSteps.push("Document the remediation");
      remediationSteps.push("Re-verify compliance");
    } else {
      details.push(`⚠️ Potential ${regulation} compliance issue`);
      details.push(`Requirement: ${requirement}`);
      remediationSteps.push("Review the flagged items");
      remediationSteps.push("Determine if action is needed");
    }

    // Evidence
    const evidenceStrings = evidence.map(e => 
      typeof e === "string" ? e : JSON.stringify(e)
    );

    return {
      summary: `${regulation} compliance: ${status.toUpperCase()}`,
      details,
      technicalContext: `Regulation: ${regulation}. Requirement: ${requirement}. Evidence items: ${evidence.length}.`,
      businessImpact: status === "violation"
        ? "Compliance violation may result in regulatory penalties or audit findings."
        : status === "warning"
        ? "Potential compliance risk that should be addressed proactively."
        : "System is compliant. No action required.",
      recommendations: remediationSteps.length > 0 ? remediationSteps : ["Maintain current compliance posture"],
      confidence: status === "compliant" ? 0.95 : 0.85,
      generatedAt: Date.now(),
      regulation,
      requirement,
      status,
      evidence: evidenceStrings,
      remediationSteps,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Cascade Explanations
  // ─────────────────────────────────────────────────────────

  /**
   * Explain cascade report
   */
  explainCascade(cascade: CascadeReport): Explanation {
    const details: string[] = [];

    details.push(`Source: ${cascade.sourceChange.entity}`);
    details.push(`Change: ${cascade.sourceChange.description}`);
    details.push(`Total affected: ${cascade.totalAffected} entities`);

    if (cascade.criticalImpacts.length > 0) {
      details.push(`Critical impacts: ${cascade.criticalImpacts.length}`);
      for (const impact of cascade.criticalImpacts.slice(0, 3)) {
        details.push(`  • ${impact.entity}: ${impact.reason}`);
      }
    }

    if (cascade.warnings.length > 0) {
      details.push(`Warnings: ${cascade.warnings.length}`);
    }

    return {
      summary: `Change to ${cascade.sourceChange.entity} affects ${cascade.totalAffected} dependent entities`,
      details,
      technicalContext: `Risk score: ${cascade.riskScore}. Recommendation: ${cascade.recommendation}.`,
      businessImpact: cascade.estimatedImpact.revenue
        ? `Potential revenue impact: ${cascade.estimatedImpact.revenue}. ${cascade.estimatedImpact.workflows} workflows affected.`
        : `${cascade.estimatedImpact.users} users may be affected.`,
      recommendations: cascade.recommendation === "block"
        ? ["Do not proceed without review", "Address critical impacts first", "Consider phased rollout"]
        : cascade.recommendation === "review"
        ? ["Review affected entities", "Test changes thoroughly", "Notify affected teams"]
        : ["Safe to proceed", "Monitor for issues"],
      confidence: 0.9,
      generatedAt: Date.now(),
    };
  }

  // ─────────────────────────────────────────────────────────
  // Utility
  // ─────────────────────────────────────────────────────────

  /**
   * Format explanation as markdown
   */
  toMarkdown(explanation: Explanation): string {
    let md = `## ${explanation.summary}\n\n`;

    if (explanation.details.length > 0) {
      md += `### Details\n`;
      for (const detail of explanation.details) {
        md += `- ${detail}\n`;
      }
      md += "\n";
    }

    if (explanation.businessImpact) {
      md += `### Business Impact\n${explanation.businessImpact}\n\n`;
    }

    if (explanation.recommendations.length > 0) {
      md += `### Recommendations\n`;
      for (const rec of explanation.recommendations) {
        md += `- ${rec}\n`;
      }
      md += "\n";
    }

    if (explanation.technicalContext) {
      md += `### Technical Context\n\`${explanation.technicalContext}\`\n\n`;
    }

    md += `*Generated at ${new Date(explanation.generatedAt).toISOString()} with ${(explanation.confidence * 100).toFixed(0)}% confidence*`;

    return md;
  }

  /**
   * Format explanation as plain text
   */
  toPlainText(explanation: Explanation): string {
    let text = `${explanation.summary}\n\n`;

    if (explanation.details.length > 0) {
      text += `Details:\n`;
      for (const detail of explanation.details) {
        text += `  - ${detail}\n`;
      }
      text += "\n";
    }

    if (explanation.businessImpact) {
      text += `Business Impact: ${explanation.businessImpact}\n\n`;
    }

    if (explanation.recommendations.length > 0) {
      text += `Recommendations:\n`;
      for (const rec of explanation.recommendations) {
        text += `  - ${rec}\n`;
      }
    }

    return text;
  }
}

export const explainabilityEngine = new ExplainabilityEngine();

