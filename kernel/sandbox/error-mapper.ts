/**
 * 🎯 Sandbox Error Mapper v3.0
 * 
 * Semantic error classification:
 * - Contract violations
 * - Security risks
 * - Drift detection
 * - Provider mismatches
 * - Resource spikes
 * 
 * @version 3.0.0
 */

import { type SandboxError, type SandboxMetrics } from "./types";

// ═══════════════════════════════════════════════════════════
// Error Categories
// ═══════════════════════════════════════════════════════════

export const SANDBOX_ERROR_TYPES = [
  "CONTRACT_VIOLATION",
  "SECURITY_RISK",
  "SCHEMA_DRIFT",
  "PROVIDER_MISMATCH",
  "NETWORK_BLOCKED",
  "DOMAIN_FORBIDDEN",
  "CPU_SPIKE",
  "MEMORY_SPIKE",
  "EXECUTION_TIMEOUT",
  "SYNTAX_ERROR",
  "RUNTIME_ERROR",
  "UNAUTHORIZED_GLOBAL",
  "PROTOTYPE_POLLUTION",
  "CODE_INJECTION",
  "INFINITE_LOOP",
  "UNKNOWN_ERROR",
] as const;

export type SandboxErrorType = (typeof SANDBOX_ERROR_TYPES)[number];

export interface MappedError {
  type: SandboxErrorType;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  originalMessage: string;
  retryable: boolean;
  requiresAudit: boolean;
  suggestedAction?: string;
}

// ═══════════════════════════════════════════════════════════
// Error Patterns
// ═══════════════════════════════════════════════════════════

interface ErrorPattern {
  patterns: RegExp[];
  type: SandboxErrorType;
  severity: MappedError["severity"];
  retryable: boolean;
  requiresAudit: boolean;
  suggestedAction?: string;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  // Security
  {
    patterns: [/eval|Function\s*\(|prototype|__proto__/i],
    type: "CODE_INJECTION",
    severity: "critical",
    retryable: false,
    requiresAudit: true,
    suggestedAction: "Review code for security vulnerabilities",
  },
  {
    patterns: [/prototype.*pollution|setPrototypeOf/i],
    type: "PROTOTYPE_POLLUTION",
    severity: "critical",
    retryable: false,
    requiresAudit: true,
    suggestedAction: "Remove prototype manipulation",
  },
  {
    patterns: [/not\s+allowed|forbidden|unauthorized|permission/i],
    type: "SECURITY_RISK",
    severity: "high",
    retryable: false,
    requiresAudit: true,
    suggestedAction: "Check contract permissions",
  },
  {
    patterns: [/unauthorized.*global|global.*access/i],
    type: "UNAUTHORIZED_GLOBAL",
    severity: "high",
    retryable: false,
    requiresAudit: true,
    suggestedAction: "Remove access to restricted globals",
  },

  // Contract
  {
    patterns: [/contract|capability|limit.*exceeded/i],
    type: "CONTRACT_VIOLATION",
    severity: "medium",
    retryable: false,
    requiresAudit: false,
    suggestedAction: "Upgrade contract tier or reduce usage",
  },

  // Network
  {
    patterns: [/domain.*not.*allowed|domain.*forbidden/i],
    type: "DOMAIN_FORBIDDEN",
    severity: "medium",
    retryable: false,
    requiresAudit: false,
    suggestedAction: "Add domain to allowedDomains in contract",
  },
  {
    patterns: [/network.*disabled|fetch.*disabled|https.*only/i],
    type: "NETWORK_BLOCKED",
    severity: "low",
    retryable: false,
    requiresAudit: false,
    suggestedAction: "Enable network in contract or use allowed domains",
  },

  // Resource
  {
    patterns: [/timeout|timed?\s*out|deadline/i],
    type: "EXECUTION_TIMEOUT",
    severity: "medium",
    retryable: true,
    requiresAudit: false,
    suggestedAction: "Optimize code or increase timeout limit",
  },
  {
    patterns: [/memory|heap|out\s+of\s+memory/i],
    type: "MEMORY_SPIKE",
    severity: "high",
    retryable: false,
    requiresAudit: false,
    suggestedAction: "Reduce memory usage or increase limit",
  },
  {
    patterns: [/cpu|process.*limit/i],
    type: "CPU_SPIKE",
    severity: "high",
    retryable: false,
    requiresAudit: false,
    suggestedAction: "Optimize CPU-intensive operations",
  },
  {
    patterns: [/infinite.*loop|maximum.*call.*stack/i],
    type: "INFINITE_LOOP",
    severity: "high",
    retryable: false,
    requiresAudit: true,
    suggestedAction: "Add loop termination conditions",
  },

  // Drift
  {
    patterns: [/schema.*mismatch|schema.*drift|column.*not.*found/i],
    type: "SCHEMA_DRIFT",
    severity: "high",
    retryable: false,
    requiresAudit: true,
    suggestedAction: "Sync schema with provider",
  },
  {
    patterns: [/provider.*mismatch|incompatible.*provider/i],
    type: "PROVIDER_MISMATCH",
    severity: "medium",
    retryable: false,
    requiresAudit: false,
    suggestedAction: "Check provider compatibility",
  },

  // Syntax
  {
    patterns: [/syntax.*error|unexpected.*token|parse.*error/i],
    type: "SYNTAX_ERROR",
    severity: "low",
    retryable: false,
    requiresAudit: false,
    suggestedAction: "Fix syntax errors in code",
  },
];

// ═══════════════════════════════════════════════════════════
// Error Mapper
// ═══════════════════════════════════════════════════════════

export class SandboxErrorMapper {
  /**
   * Map raw error to semantic classification
   */
  static map(error: SandboxError, metrics?: SandboxMetrics): MappedError {
    const message = error.message?.toLowerCase() || "";

    // Check patterns
    for (const pattern of ERROR_PATTERNS) {
      if (pattern.patterns.some(p => p.test(message))) {
        return {
          type: pattern.type,
          severity: pattern.severity,
          message: this.formatMessage(pattern.type, error.message),
          originalMessage: error.message,
          retryable: pattern.retryable,
          requiresAudit: pattern.requiresAudit,
          suggestedAction: pattern.suggestedAction,
        };
      }
    }

    // Check metrics for resource issues
    if (metrics) {
      if (metrics.memoryUsedMB > 100) {
        return {
          type: "MEMORY_SPIKE",
          severity: "high",
          message: `Memory usage exceeded safe limit (${metrics.memoryUsedMB.toFixed(1)}MB)`,
          originalMessage: error.message,
          retryable: false,
          requiresAudit: false,
          suggestedAction: "Reduce memory usage",
        };
      }
      if (metrics.astRiskScore > 70) {
        return {
          type: "SECURITY_RISK",
          severity: "high",
          message: `High risk code detected (score: ${metrics.astRiskScore})`,
          originalMessage: error.message,
          retryable: false,
          requiresAudit: true,
          suggestedAction: "Review and sanitize code",
        };
      }
    }

    // Default
    return {
      type: "RUNTIME_ERROR",
      severity: "medium",
      message: error.message,
      originalMessage: error.message,
      retryable: false,
      requiresAudit: false,
    };
  }

  /**
   * Format user-friendly message
   */
  private static formatMessage(type: SandboxErrorType, original: string): string {
    const prefixes: Record<SandboxErrorType, string> = {
      CONTRACT_VIOLATION: "Contract violation",
      SECURITY_RISK: "Security risk detected",
      SCHEMA_DRIFT: "Schema drift detected",
      PROVIDER_MISMATCH: "Provider incompatibility",
      NETWORK_BLOCKED: "Network access blocked",
      DOMAIN_FORBIDDEN: "Domain not allowed",
      CPU_SPIKE: "CPU limit exceeded",
      MEMORY_SPIKE: "Memory limit exceeded",
      EXECUTION_TIMEOUT: "Execution timeout",
      SYNTAX_ERROR: "Syntax error",
      RUNTIME_ERROR: "Runtime error",
      UNAUTHORIZED_GLOBAL: "Unauthorized global access",
      PROTOTYPE_POLLUTION: "Prototype pollution attempt",
      CODE_INJECTION: "Code injection detected",
      INFINITE_LOOP: "Infinite loop detected",
      UNKNOWN_ERROR: "Unknown error",
    };

    return `${prefixes[type]}: ${original}`;
  }

  /**
   * Check if error requires immediate attention
   */
  static requiresImmediateAction(mapped: MappedError): boolean {
    return mapped.severity === "critical" || mapped.requiresAudit;
  }

  /**
   * Get error type from raw error
   */
  static getType(error: SandboxError): SandboxErrorType {
    return this.map(error).type;
  }
}

export const sandboxErrorMapper = SandboxErrorMapper;

