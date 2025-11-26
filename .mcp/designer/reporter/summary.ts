import type { ValidationError } from "../types/ValidationError.js";

export interface ReportSummary {
  total: number;
  bySeverity: Record<string, number>;
  byCode: Record<string, number>;
  byNodeType: Record<string, number>;
  byCategory: Record<string, number>;
  passRate: number;
  criticalCount: number;
}

/**
 * Build a comprehensive summary from validation errors.
 */
export function buildSummary(
  errors: ValidationError[],
  totalNodes = 0
): ReportSummary {
  const summary: ReportSummary = {
    total: errors.length,
    bySeverity: {},
    byCode: {},
    byNodeType: {},
    byCategory: {},
    passRate: totalNodes > 0 ? Math.round(((totalNodes - errors.length) / totalNodes) * 100) : 100,
    criticalCount: 0,
  };

  for (const e of errors) {
    // By severity
    summary.bySeverity[e.severity] = (summary.bySeverity[e.severity] || 0) + 1;

    // By error code
    summary.byCode[e.code] = (summary.byCode[e.code] || 0) + 1;

    // By node type
    summary.byNodeType[e.nodeType] = (summary.byNodeType[e.nodeType] || 0) + 1;

    // By category (extract from code prefix)
    const category = getCategoryFromCode(e.code);
    summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;

    // Count critical errors
    if (e.severity === "error") {
      summary.criticalCount++;
    }
  }

  return summary;
}

/**
 * Extract category name from error code prefix.
 */
function getCategoryFromCode(code: string): string {
  const prefix = code.split("-")[0];

  const categoryMap: Record<string, string> = {
    TYP: "Typography",
    SPC: "Spacing",
    LAY: "Layout",
    GEO: "Geometry",
    VIS: "Visual",
  };

  return categoryMap[prefix] || "Other";
}

/**
 * Get severity badge color for HTML/CSS.
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "error":
      return "#dc2626";
    case "warning":
      return "#d97706";
    case "info":
      return "#2563eb";
    default:
      return "#6b7280";
  }
}

/**
 * Get severity background color for HTML/CSS.
 */
export function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case "error":
      return "#fef2f2";
    case "warning":
      return "#fffbeb";
    case "info":
      return "#eff6ff";
    default:
      return "#f9fafb";
  }
}

