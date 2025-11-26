import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { validateTypography } from "./validateTypography.js";
import { validateSpacing } from "./validateSpacing.js";
import { validateLayout } from "./validateLayout.js";
import { validateGeometry } from "./validateGeometry.js";
import { validateVisual } from "./validateVisual.js";

/**
 * Run all validation engines on a list of design nodes.
 * Returns combined validation errors from all engines.
 */
export function validateAll(nodes: DesignNode[]): ValidationError[] {
  return [
    ...validateTypography(nodes),
    ...validateSpacing(nodes),
    ...validateLayout(nodes),
    ...validateGeometry(nodes),
    ...validateVisual(nodes),
  ];
}

/**
 * Run all validation engines and return a summary report.
 */
export function validateAllWithSummary(nodes: DesignNode[]): {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  errors: ValidationError[];
} {
  const errors = validateAll(nodes);

  return {
    valid: errors.filter((e) => e.severity === "error").length === 0,
    errorCount: errors.filter((e) => e.severity === "error").length,
    warningCount: errors.filter((e) => e.severity === "warning").length,
    infoCount: errors.filter((e) => e.severity === "info").length,
    errors,
  };
}

