/**
 * Apply Fixes Pipeline
 * Connects validation errors → fix suggestions → source code rewriting.
 */

import type { ValidationError } from "../types/ValidationError.js";
import { suggestFix, type FixSuggestion } from "./fixRules.js";
import { rewriteJSX, type FixEntry } from "./jsxRewrite.js";

export interface AppliedFix {
  error: ValidationError;
  fix: FixSuggestion;
  applied: boolean;
}

export interface ApplyFixesResult {
  fixedSource: string;
  applied: AppliedFix[];
  skipped: ValidationError[];
  stats: {
    total: number;
    fixed: number;
    skipped: number;
    byType: Record<string, number>;
  };
}

/**
 * Apply all available fixes to source code.
 */
export function applyFixesToSource(
  source: string,
  errors: ValidationError[]
): ApplyFixesResult {
  const applied: AppliedFix[] = [];
  const skipped: ValidationError[] = [];
  const byType: Record<string, number> = {};

  // Build fix map
  const fixEntries: FixEntry[] = [];

  for (const error of errors) {
    const fix = suggestFix(error);

    if (fix) {
      applied.push({ error, fix, applied: true });
      fixEntries.push({ nodeId: error.nodeId, fix });

      // Track by type
      byType[fix.fixType] = (byType[fix.fixType] || 0) + 1;
    } else {
      skipped.push(error);
    }
  }

  // Apply fixes to source
  const fixedSource = rewriteJSX(source, fixEntries);

  return {
    fixedSource,
    applied,
    skipped,
    stats: {
      total: errors.length,
      fixed: applied.length,
      skipped: skipped.length,
      byType,
    },
  };
}

/**
 * Get fix suggestions without applying them.
 * Useful for previewing fixes before applying.
 */
export function getFixSuggestions(
  errors: ValidationError[]
): { error: ValidationError; suggestion: FixSuggestion | null }[] {
  return errors.map((error) => ({
    error,
    suggestion: suggestFix(error),
  }));
}

/**
 * Apply fixes selectively based on filter.
 */
export function applySelectiveFixes(
  source: string,
  errors: ValidationError[],
  filter: {
    errorCodes?: string[];
    fixTypes?: string[];
    minConfidence?: "high" | "medium" | "low";
  }
): ApplyFixesResult {
  const { errorCodes, fixTypes, minConfidence } = filter;

  const confidenceOrder = { high: 3, medium: 2, low: 1 };
  const minConfidenceLevel = minConfidence ? confidenceOrder[minConfidence] : 0;

  const filteredErrors = errors.filter((error) => {
    // Filter by error code
    if (errorCodes && !errorCodes.includes(error.code)) {
      return false;
    }

    // Check if fix exists and passes filters
    const fix = suggestFix(error);
    if (!fix) return false;

    // Filter by fix type
    if (fixTypes && !fixTypes.includes(fix.fixType)) {
      return false;
    }

    // Filter by confidence
    if (confidenceOrder[fix.confidence] < minConfidenceLevel) {
      return false;
    }

    return true;
  });

  return applyFixesToSource(source, filteredErrors);
}

/**
 * Generate a diff preview of fixes.
 */
export function generateFixPreview(
  source: string,
  errors: ValidationError[]
): { original: string; fixed: string; changes: string[] } {
  const result = applyFixesToSource(source, errors);

  const changes = result.applied.map(
    ({ error, fix }) => `[${error.code}] ${fix.description}`
  );

  return {
    original: source,
    fixed: result.fixedSource,
    changes,
  };
}

