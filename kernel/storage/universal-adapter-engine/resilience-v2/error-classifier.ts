/**
 * 🎯 Semantic Error Classifier v2.0
 * 
 * Kernel-grade error classification with:
 * - Extended categories (governance, encryption, offline_sync)
 * - Fingerprinting for deduplication
 * - Severity scoring
 * - Tenant/engine context
 * 
 * @version 2.0.0
 */

import crypto from "crypto";
import { type ErrorCategory, type NormalizedError, ERROR_CATEGORIES } from "./types";

// ═══════════════════════════════════════════════════════════
// Error Patterns (Extended)
// ═══════════════════════════════════════════════════════════

interface ErrorPattern {
  pattern: RegExp;
  category: ErrorCategory;
  retryable: boolean;
  severity: NormalizedError["severity"];
  retryAfterMs?: number;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // Network errors
  { pattern: /ECONNREFUSED|ENOTFOUND|EHOSTUNREACH/i, category: "network", retryable: true, severity: "medium" },
  { pattern: /ECONNRESET|EPIPE|socket hang up/i, category: "network", retryable: true, severity: "medium" },
  { pattern: /network|connection|dns/i, category: "network", retryable: true, severity: "medium" },
  
  // Timeout errors
  { pattern: /timeout|ETIMEDOUT|ESOCKETTIMEDOUT/i, category: "timeout", retryable: true, severity: "medium" },
  { pattern: /deadline exceeded|request timed out/i, category: "timeout", retryable: true, severity: "medium" },
  
  // Auth errors
  { pattern: /401|unauthorized|unauthenticated/i, category: "auth", retryable: false, severity: "high" },
  { pattern: /invalid.*token|expired.*token|jwt/i, category: "auth", retryable: false, severity: "high" },
  { pattern: /invalid.*key|api.?key/i, category: "auth", retryable: false, severity: "high" },
  
  // Permission errors
  { pattern: /403|forbidden|access denied/i, category: "permission", retryable: false, severity: "high" },
  { pattern: /insufficient.*permission|not allowed/i, category: "permission", retryable: false, severity: "high" },
  
  // Validation errors
  { pattern: /400|bad request|invalid.*input/i, category: "validation", retryable: false, severity: "low" },
  { pattern: /validation|invalid.*format|malformed/i, category: "validation", retryable: false, severity: "low" },
  
  // Not found errors
  { pattern: /404|not found|does not exist/i, category: "not_found", retryable: false, severity: "low" },
  { pattern: /resource.*missing|no.*record/i, category: "not_found", retryable: false, severity: "low" },
  
  // Conflict errors
  { pattern: /409|conflict|already exists/i, category: "conflict", retryable: false, severity: "medium" },
  { pattern: /duplicate|unique.*constraint/i, category: "conflict", retryable: false, severity: "medium" },
  { pattern: /optimistic.*lock|version.*mismatch/i, category: "conflict", retryable: true, severity: "medium" },
  
  // Rate limiting
  { pattern: /429|rate.?limit|too many requests/i, category: "rate_limit", retryable: true, severity: "medium", retryAfterMs: 60000 },
  { pattern: /quota.*exceeded|limit.*exceeded/i, category: "rate_limit", retryable: true, severity: "medium", retryAfterMs: 60000 },
  
  // Throttling (soft limits)
  { pattern: /throttl|slow.*down|backoff/i, category: "throttling", retryable: true, severity: "low", retryAfterMs: 5000 },
  
  // Server errors
  { pattern: /500|internal.*server|server.*error/i, category: "server", retryable: true, severity: "high" },
  { pattern: /502|bad.*gateway/i, category: "server", retryable: true, severity: "high" },
  { pattern: /503|service.*unavailable/i, category: "server", retryable: true, severity: "high" },
  { pattern: /504|gateway.*timeout/i, category: "server", retryable: true, severity: "high" },
  
  // Data integrity (NEW)
  { pattern: /checksum|hash.*mismatch|integrity/i, category: "data_integrity", retryable: false, severity: "critical" },
  { pattern: /corrupt|truncat|incomplete.*data/i, category: "data_integrity", retryable: false, severity: "critical" },
  { pattern: /stale.*data|outdated|version.*conflict/i, category: "data_integrity", retryable: true, severity: "high" },
  
  // Offline sync (NEW)
  { pattern: /offline|sync.*fail|pending.*sync/i, category: "offline_sync", retryable: true, severity: "medium" },
  { pattern: /merge.*conflict|sync.*conflict/i, category: "offline_sync", retryable: false, severity: "high" },
  { pattern: /batch.*corrupt|partial.*sync/i, category: "offline_sync", retryable: true, severity: "high" },
  
  // Governance (NEW)
  { pattern: /contract.*violation|manifest.*invalid/i, category: "governance", retryable: false, severity: "critical" },
  { pattern: /policy.*violation|compliance.*fail/i, category: "governance", retryable: false, severity: "critical" },
  { pattern: /drift.*detect|schema.*drift/i, category: "governance", retryable: false, severity: "high" },
  
  // Encryption (NEW)
  { pattern: /decrypt|encrypt|crypto|cipher/i, category: "encryption", retryable: false, severity: "critical" },
  { pattern: /key.*invalid|key.*expired|kms/i, category: "encryption", retryable: false, severity: "critical" },
  
  // Schema mismatch (NEW)
  { pattern: /schema.*mismatch|column.*not.*found/i, category: "schema_mismatch", retryable: false, severity: "high" },
  { pattern: /type.*mismatch|invalid.*type/i, category: "schema_mismatch", retryable: false, severity: "high" },
  { pattern: /migration.*required|schema.*version/i, category: "schema_mismatch", retryable: false, severity: "high" },
];

// ═══════════════════════════════════════════════════════════
// Error Classifier
// ═══════════════════════════════════════════════════════════

export class ErrorClassifier {
  /**
   * Classify error with full context
   */
  static classify(
    error: any,
    context?: {
      provider?: string;
      tenantId?: string;
      engine?: string;
      operation?: string;
      resource?: string;
    }
  ): NormalizedError {
    const message = this.extractMessage(error);
    const code = this.extractCode(error);
    const match = this.matchPattern(message, code);

    const normalized: NormalizedError = {
      code: code || match?.category.toUpperCase() || "UNKNOWN_ERROR",
      message,
      category: match?.category || "unknown",
      retryable: match?.retryable ?? false,
      retryAfterMs: match?.retryAfterMs,
      severity: match?.severity || "medium",
      provider: context?.provider,
      tenantId: context?.tenantId,
      engine: context?.engine,
      operation: context?.operation,
      resource: context?.resource,
      originalError: error,
      fingerprint: this.generateFingerprint(code, message, context),
    };

    return normalized;
  }

  /**
   * Extract error message
   */
  private static extractMessage(error: any): string {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.body?.message) return error.body.message;
    return String(error);
  }

  /**
   * Extract error code
   */
  private static extractCode(error: any): string | undefined {
    if (error?.code) return String(error.code);
    if (error?.status) return String(error.status);
    if (error?.statusCode) return String(error.statusCode);
    if (error?.error?.code) return String(error.error.code);
    return undefined;
  }

  /**
   * Match error against patterns
   */
  private static matchPattern(message: string, code?: string): ErrorPattern | undefined {
    const searchText = `${code || ""} ${message}`.toLowerCase();

    for (const pattern of ERROR_PATTERNS) {
      if (pattern.pattern.test(searchText)) {
        return pattern;
      }
    }

    return undefined;
  }

  /**
   * Generate fingerprint for deduplication
   */
  private static generateFingerprint(
    code: string | undefined,
    message: string,
    context?: Record<string, any>
  ): string {
    // Normalize message (remove dynamic parts)
    const normalizedMessage = message
      .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "<UUID>")
      .replace(/\b\d{10,}\b/g, "<ID>")
      .replace(/\b\d+\b/g, "<NUM>")
      .replace(/"[^"]+"/g, "<STR>");

    const data = JSON.stringify({
      code,
      message: normalizedMessage,
      provider: context?.provider,
      operation: context?.operation,
    });

    return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16);
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: NormalizedError): boolean {
    return error.retryable;
  }

  /**
   * Get retry delay for error
   */
  static getRetryDelay(error: NormalizedError, attempt: number, config: { baseDelayMs: number; maxDelayMs: number; backoffMultiplier: number }): number {
    if (error.retryAfterMs) {
      return error.retryAfterMs;
    }

    const delay = Math.min(
      config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
      config.maxDelayMs
    );

    // Add jitter (±20%)
    const jitter = delay * 0.2 * (Math.random() * 2 - 1);
    return Math.round(delay + jitter);
  }

  /**
   * Check if error indicates provider degradation
   */
  static indicatesDegradation(error: NormalizedError): boolean {
    return ["server", "timeout", "rate_limit", "throttling"].includes(error.category);
  }

  /**
   * Check if error is critical (requires immediate attention)
   */
  static isCritical(error: NormalizedError): boolean {
    return error.severity === "critical" || 
           ["governance", "encryption", "data_integrity"].includes(error.category);
  }
}

export const errorClassifier = ErrorClassifier;

