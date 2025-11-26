import type { ValidationError } from "../types/ValidationError.js";

export interface CISummary {
  errors: number;
  warnings: number;
  info: number;
  breaksBuild: boolean;
  byCategory: Record<string, number>;
  affectedFiles: string[];
}

export function summarizeCI(
  errors: ValidationError[],
  failOn: string[] = ["error"]
): CISummary {
  let errorCount = 0;
  let warnCount = 0;
  let infoCount = 0;
  const byCategory: Record<string, number> = {};
  const affectedFiles = new Set<string>();

  for (const e of errors) {
    if (e.severity === "error") errorCount++;
    if (e.severity === "warning") warnCount++;
    if (e.severity === "info") infoCount++;

    const category = e.code.split("-")[0];
    byCategory[category] = (byCategory[category] || 0) + 1;

    if (e.nodeId) affectedFiles.add(e.nodeId.split(":")[0]);
  }

  const breaksBuild = failOn.some((sev) => {
    if (sev === "error") return errorCount > 0;
    if (sev === "warning") return warnCount > 0;
    return false;
  });

  return {
    errors: errorCount,
    warnings: warnCount,
    info: infoCount,
    breaksBuild,
    byCategory,
    affectedFiles: Array.from(affectedFiles),
  };
}

export function formatCISummary(summary: CISummary): string {
  const lines = [
    "## 🎨 AI-BOS Designer Validation Results",
    "",
    `| Metric | Count |`,
    `|--------|-------|`,
    `| ❌ Errors | ${summary.errors} |`,
    `| ⚠️ Warnings | ${summary.warnings} |`,
    `| ℹ️ Info | ${summary.info} |`,
    "",
    summary.breaksBuild
      ? "**❌ Build FAILED** - Design violations detected"
      : "**✅ Build PASSED** - No blocking issues",
  ];

  if (Object.keys(summary.byCategory).length > 0) {
    lines.push("", "### By Category", "");
    for (const [cat, count] of Object.entries(summary.byCategory)) {
      lines.push(`- **${cat}**: ${count}`);
    }
  }

  return lines.join("\n");
}

