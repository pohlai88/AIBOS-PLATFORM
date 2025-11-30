// ai/guardians/explain.guardian.ts
/**
 * Explainability Guardian — AI Decision Explainability Engine
 * 
 * Provides:
 * - Human-readable explanations for AI decisions
 * - Rationale for guardian verdicts
 * - Alternative approaches
 * - Audit trail for compliance
 * - Reversibility of AI actions
 * 
 * Ensures all AI decisions are explainable and transparent
 */

import type { GuardianDecision, GovernanceContext } from "../governance.engine";

export const explainGuardian = {
  /**
   * Generate explanation for AI governance decision
   * 
   * @param action - Action ID
   * @param payload - Action payload
   * @param decisions - Guardian decisions
   * @returns Explanation
   */
  async explain(
    action: string,
    payload: unknown,
    decisions: GuardianDecision[]
  ): Promise<{
    summary: string;
    rationale: string;
    alternatives?: string[];
    reversible: boolean;
    auditTrail: {
      action: string;
      timestamp: Date;
      guardiansSummary: string;
    };
  }> {
    const timestamp = new Date();

    // Count decisions by status
    const statusCounts = {
      ALLOW: decisions.filter((d) => d.status === "ALLOW").length,
      DENY: decisions.filter((d) => d.status === "DENY").length,
      WARN: decisions.filter((d) => d.status === "WARN").length,
      ERROR: decisions.filter((d) => d.status === "ERROR").length,
    };

    // Generate summary
    let summary = "";

    if (statusCounts.DENY > 0) {
      const deniedBy = decisions
        .filter((d) => d.status === "DENY")
        .map((d) => d.guardian)
        .join(", ");

      summary = `Action '${action}' was DENIED by ${statusCounts.DENY} guardian(s): ${deniedBy}.`;
    } else if (statusCounts.WARN > 0) {
      const warnings = decisions
        .filter((d) => d.status === "WARN")
        .map((d) => d.guardian)
        .join(", ");

      summary = `Action '${action}' was APPROVED with ${statusCounts.WARN} warning(s) from: ${warnings}.`;
    } else if (statusCounts.ERROR > 0) {
      summary = `Action '${action}' completed with ${statusCounts.ERROR} guardian error(s). Review recommended.`;
    } else {
      summary = `Action '${action}' was APPROVED by all ${decisions.length} guardian(s).`;
    }

    // Generate rationale
    const rationale = this.generateRationale(action, decisions, statusCounts);

    // Generate alternatives (if denied)
    const alternatives =
      statusCounts.DENY > 0
        ? this.generateAlternatives(action, decisions)
        : undefined;

    // Determine reversibility
    const reversible = this.isReversible(action, payload);

    // Create audit trail summary
    const guardiansSummary = decisions
      .map((d) => `${d.guardian}: ${d.status}${d.reason ? ` (${d.reason})` : ""}`)
      .join("; ");

    return {
      summary,
      rationale,
      alternatives,
      reversible,
      auditTrail: {
        action,
        timestamp,
        guardiansSummary,
      },
    };
  },

  /**
   * Generate detailed rationale
   */
  private generateRationale(
    action: string,
    decisions: GuardianDecision[],
    statusCounts: { ALLOW: number; DENY: number; WARN: number; ERROR: number }
  ): string {
    const parts: string[] = [];

    parts.push(`The AI governance engine evaluated action '${action}' through ${decisions.length} guardian checks.`);

    // Schema Guardian
    const schemaDecision = decisions.find((d) => d.guardian === "schema");
    if (schemaDecision) {
      if (schemaDecision.status === "DENY") {
        parts.push(
          `Schema Guardian blocked the action to prevent database integrity violations: ${schemaDecision.reason}`
        );
      } else if (schemaDecision.status === "WARN") {
        parts.push(
          `Schema Guardian raised a warning: ${schemaDecision.reason}`
        );
      }
    }

    // Performance Guardian
    const perfDecision = decisions.find((d) => d.guardian === "performance");
    if (perfDecision) {
      if (perfDecision.status === "DENY") {
        parts.push(
          `Performance Guardian blocked the action to prevent performance degradation: ${perfDecision.reason}`
        );
      } else if (perfDecision.status === "WARN") {
        parts.push(
          `Performance Guardian flagged potential performance issues: ${perfDecision.reason}`
        );
      }
    }

    // Compliance Guardian
    const complianceDecision = decisions.find((d) => d.guardian === "compliance");
    if (complianceDecision) {
      if (complianceDecision.status === "DENY") {
        parts.push(
          `Compliance Guardian blocked the action to ensure regulatory compliance: ${complianceDecision.reason}`
        );
      } else if (complianceDecision.status === "WARN") {
        parts.push(
          `Compliance Guardian noted regulatory considerations: ${complianceDecision.reason}`
        );
      }
    }

    // Drift Guardian
    const driftDecision = decisions.find((d) => d.guardian === "drift");
    if (driftDecision) {
      if (driftDecision.status === "DENY") {
        parts.push(
          `Drift Guardian blocked the action to maintain kernel patterns: ${driftDecision.reason}`
        );
      } else if (driftDecision.status === "WARN") {
        parts.push(
          `Drift Guardian detected deviation from kernel patterns: ${driftDecision.reason}`
        );
      }
    }

    // Overall decision
    if (statusCounts.DENY > 0) {
      parts.push(
        `Due to ${statusCounts.DENY} denial(s), the action was blocked to protect system integrity.`
      );
    } else if (statusCounts.WARN > 0) {
      parts.push(
        `The action was approved but requires attention to ${statusCounts.WARN} warning(s).`
      );
    } else {
      parts.push(
        `All guardians validated the action successfully. Safe to proceed.`
      );
    }

    return parts.join(" ");
  },

  /**
   * Generate alternative approaches (if denied)
   */
  private generateAlternatives(
    action: string,
    decisions: GuardianDecision[]
  ): string[] {
    const alternatives: string[] = [];

    // Schema-related alternatives
    const schemaDecision = decisions.find((d) => d.guardian === "schema");
    if (schemaDecision?.status === "DENY") {
      if (schemaDecision.reason?.includes("required field")) {
        alternatives.push(
          "Make the field optional or provide a default value before deletion"
        );
        alternatives.push(
          "Use adaptive migration engine for zero-downtime schema changes"
        );
      }
      if (schemaDecision.reason?.includes("foreign key")) {
        alternatives.push(
          "Remove foreign key constraint first, then delete the field"
        );
      }
    }

    // Performance-related alternatives
    const perfDecision = decisions.find((d) => d.guardian === "performance");
    if (perfDecision?.status === "DENY") {
      if (perfDecision.reason?.includes("SELECT *")) {
        alternatives.push(
          "Specify explicit field names instead of SELECT *"
        );
      }
      if (perfDecision.reason?.includes("full table scan")) {
        alternatives.push(
          "Add WHERE clause with indexed field to avoid full table scan"
        );
        alternatives.push(
          "Create appropriate index on the queried field"
        );
      }
    }

    // Compliance-related alternatives
    const complianceDecision = decisions.find((d) => d.guardian === "compliance");
    if (complianceDecision?.status === "DENY") {
      if (complianceDecision.reason?.includes("PII")) {
        alternatives.push(
          "Obtain explicit user consent before accessing PII data"
        );
        alternatives.push(
          "Use anonymized or pseudonymized data instead"
        );
      }
      if (complianceDecision.reason?.includes("cross-tenant")) {
        alternatives.push(
          "Request data through proper tenant-scoped API"
        );
      }
    }

    // Drift-related alternatives
    const driftDecision = decisions.find((d) => d.guardian === "drift");
    if (driftDecision?.status === "DENY") {
      if (driftDecision.reason?.includes("ctx.db")) {
        alternatives.push(
          "Use ctx.db proxy instead of direct database connection"
        );
      }
      if (driftDecision.reason?.includes("input schema")) {
        alternatives.push(
          "Define input schema using Zod (e.g., z.object({...}))"
        );
      }
      if (driftDecision.reason?.includes("output schema")) {
        alternatives.push(
          "Define output schema using Zod"
        );
      }
    }

    // Generic alternatives if none specific
    if (alternatives.length === 0) {
      alternatives.push(
        "Review guardian feedback and adjust the action accordingly"
      );
      alternatives.push(
        "Consult with system administrator for approval override if necessary"
      );
    }

    return alternatives;
  },

  /**
   * Determine if action is reversible
   */
  private isReversible(action: string, payload: unknown): boolean {
    // Destructive actions are generally not reversible
    const destructiveActions = [
      "delete",
      "drop",
      "truncate",
      "remove",
      "purge",
    ];

    const isDestructive = destructiveActions.some((verb) =>
      action.toLowerCase().includes(verb)
    );

    if (isDestructive) {
      // Check if backup exists
      const hasBackup = !!(payload as any)?.backup || !!(payload as any)?.snapshotId;
      return hasBackup;
    }

    // Most other actions are reversible
    return true;
  },

  /**
   * Generate governance report
   * 
   * @param decisions - Guardian decisions
   * @returns Governance report
   */
  generateReport(decisions: GuardianDecision[]): {
    totalGuardians: number;
    approved: number;
    denied: number;
    warnings: number;
    errors: number;
    overallStatus: "APPROVED" | "DENIED" | "WARNING";
    recommendations: string[];
  } {
    const statusCounts = {
      ALLOW: decisions.filter((d) => d.status === "ALLOW").length,
      DENY: decisions.filter((d) => d.status === "DENY").length,
      WARN: decisions.filter((d) => d.status === "WARN").length,
      ERROR: decisions.filter((d) => d.status === "ERROR").length,
    };

    const overallStatus: "APPROVED" | "DENIED" | "WARNING" =
      statusCounts.DENY > 0
        ? "DENIED"
        : statusCounts.WARN > 0 || statusCounts.ERROR > 0
        ? "WARNING"
        : "APPROVED";

    const recommendations: string[] = [];

    // Generate recommendations based on warnings
    decisions
      .filter((d) => d.status === "WARN")
      .forEach((d) => {
        recommendations.push(
          `${d.guardian}: ${d.reason || "Review recommended"}`
        );
      });

    return {
      totalGuardians: decisions.length,
      approved: statusCounts.ALLOW,
      denied: statusCounts.DENY,
      warnings: statusCounts.WARN,
      errors: statusCounts.ERROR,
      overallStatus,
      recommendations,
    };
  },
};

