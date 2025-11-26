/**
 * AutoFix Engine
 * AI-powered design fix suggestions and automatic code corrections.
 */

import type { ValidationError } from "../types/ValidationError.js";
import {
  applyFixesToSource,
  getFixSuggestions,
  applySelectiveFixes,
  generateFixPreview,
  type ApplyFixesResult,
} from "./applyFixes.js";

export interface AutoFixOptions {
  /** Only apply fixes for specific error codes */
  errorCodes?: string[];
  /** Only apply specific fix types */
  fixTypes?: ("tailwind" | "style" | "token" | "structural")[];
  /** Minimum confidence level for fixes */
  minConfidence?: "high" | "medium" | "low";
  /** Preview mode - don't modify source */
  preview?: boolean;
}

/**
 * Main AutoFix entry point.
 * Takes source code and validation errors, returns fixed code.
 */
export function autoFix(
  source: string,
  errors: ValidationError[],
  options: AutoFixOptions = {}
): ApplyFixesResult {
  const { errorCodes, fixTypes, minConfidence, preview } = options;

  // Preview mode - just generate suggestions
  if (preview) {
    const suggestions = getFixSuggestions(errors);
    return {
      fixedSource: source,
      applied: suggestions
        .filter((s) => s.suggestion !== null)
        .map((s) => ({
          error: s.error,
          fix: s.suggestion!,
          applied: false,
        })),
      skipped: suggestions.filter((s) => s.suggestion === null).map((s) => s.error),
      stats: {
        total: errors.length,
        fixed: 0,
        skipped: errors.length,
        byType: {},
      },
    };
  }

  // Selective fixes
  if (errorCodes || fixTypes || minConfidence) {
    return applySelectiveFixes(source, errors, {
      errorCodes,
      fixTypes,
      minConfidence,
    });
  }

  // Full auto-fix
  return applyFixesToSource(source, errors);
}

/**
 * Quick fix for a single error.
 */
export function quickFix(
  source: string,
  error: ValidationError
): ApplyFixesResult {
  return applyFixesToSource(source, [error]);
}

/**
 * Preview fixes without applying.
 */
export function previewFixes(
  source: string,
  errors: ValidationError[]
): { original: string; fixed: string; changes: string[] } {
  return generateFixPreview(source, errors);
}

// Re-export types and utilities
export { suggestFix, getAllFixRules, type FixSuggestion, type FixType } from "./fixRules.js";
export { applyFixesToSource, getFixSuggestions, type AppliedFix } from "./applyFixes.js";
export { rewriteJSX, rewriteClassName, rewriteStyle } from "./jsxRewrite.js";
export {
  smartReplaceInClassName,
  mergeInlineStyles,
  styleObjectToString,
  parseStyleString,
  isFixableClass,
} from "./smartReplace.js";

