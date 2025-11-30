/**
 * @fileoverview Sanitizer Middleware - Input Sanitization & Output Validation
 * @module @bff/middleware/sanitizer
 * @description Enforces manifest.security.sanitizeInputs & validateOutputs
 */

import type { BffManifestType } from '../bff.manifest';

// ============================================================================
// Types
// ============================================================================

export interface SanitizeResult {
  valid: boolean;
  sanitized?: unknown;
  errors?: string[];
  flags?: string[]; // AI Firewall integration signals
}

export interface ValidateResult {
  valid: boolean;
  errors?: string[];
  flags?: string[]; // AI Firewall integration signals
}

export interface SanitizerConfig {
  /** Maximum string length */
  maxStringLength: number;
  /** Maximum array length */
  maxArrayLength: number;
  /** Maximum object depth */
  maxDepth: number;
  /** Strip HTML tags */
  stripHtml: boolean;
  /** Trim whitespace */
  trimStrings: boolean;
  /** Remove null bytes */
  removeNullBytes: boolean;
  /** Forbidden patterns (regex) */
  forbiddenPatterns: RegExp[];
  /** Allow HTML in output (CMS/template engines) */
  allowHtmlOutput: boolean;
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_CONFIG: SanitizerConfig = {
  maxStringLength: 100000,
  maxArrayLength: 1000,
  maxDepth: 20,
  stripHtml: true,
  trimStrings: true,
  allowHtmlOutput: false,
  removeNullBytes: true,
  forbiddenPatterns: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /data:\s*text\/html/gi, // Data URLs
  ],
};

// ============================================================================
// Sanitizer Middleware
// ============================================================================

/**
 * Create sanitizer middleware
 * 
 * Features:
 * - Input sanitization (XSS prevention)
 * - Depth limiting (DoS prevention)
 * - Length limiting
 * - Pattern blocking
 * - Output validation
 */
export function createSanitizerMiddleware(
  manifest: Readonly<BffManifestType>,
  options: {
    config?: Partial<SanitizerConfig>;
  } = {}
) {
  const config: SanitizerConfig = {
    ...DEFAULT_CONFIG,
    maxStringLength: manifest.payloadLimits.maxStringLength,
    maxArrayLength: manifest.payloadLimits.maxArrayLength,
    maxDepth: manifest.payloadLimits.maxDepth,
    allowHtmlOutput: (manifest.security as Record<string, unknown>).allowHtmlOutput === true,
    ...options.config,
  };

  return {
    /**
     * Sanitize input data (with circular reference protection)
     */
    sanitizeInput(input: unknown): SanitizeResult {
      if (!manifest.security.sanitizeInputs) {
        return { valid: true, sanitized: input };
      }

      const errors: string[] = [];
      const flags: string[] = [];
      const seen = new WeakSet<object>();

      try {
        const sanitized = sanitizeValueSafe(input, config, 0, errors, flags, seen);
        return {
          valid: errors.length === 0,
          sanitized,
          errors: errors.length > 0 ? errors : undefined,
          flags: flags.length > 0 ? flags : undefined,
        };
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Sanitization failed'],
        };
      }
    },

    /**
     * Validate output data (with circular reference protection)
     */
    validateOutput(output: unknown): ValidateResult {
      if (!manifest.security.validateOutputs) {
        return { valid: true };
      }

      const errors: string[] = [];
      const flags: string[] = [];
      const seen = new WeakSet<object>();

      try {
        validateValueSafe(output, config, 0, errors, flags, seen);
        return {
          valid: errors.length === 0,
          errors: errors.length > 0 ? errors : undefined,
          flags: flags.length > 0 ? flags : undefined,
        };
      } catch (error) {
        return {
          valid: false,
          errors: [error instanceof Error ? error.message : 'Validation failed'],
        };
      }
    },

    /**
     * Get config
     */
    getConfig(): SanitizerConfig {
      return { ...config };
    },
  };
}

// ============================================================================
// Sanitization Logic (Safe - with circular reference protection)
// ============================================================================

/**
 * Recursively sanitize a value (circular-safe, schema-stable)
 */
function sanitizeValueSafe(
  value: unknown,
  config: SanitizerConfig,
  depth: number,
  errors: string[],
  flags: string[],
  seen: WeakSet<object>
): unknown {
  // Depth check
  if (depth > config.maxDepth) {
    errors.push(`Maximum depth (${config.maxDepth}) exceeded`);
    flags.push('depth_exceeded');
    return undefined;
  }

  // Null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // String
  if (typeof value === 'string') {
    return sanitizeStringSafe(value, config, errors, flags);
  }

  // Number/boolean
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length > config.maxArrayLength) {
      errors.push(`Array length (${value.length}) exceeds maximum (${config.maxArrayLength})`);
      flags.push('array_truncated');
    }
    const truncated = value.slice(0, config.maxArrayLength);
    return truncated.map((v) => sanitizeValueSafe(v, config, depth + 1, errors, flags, seen));
  }

  // Object - with circular reference protection
  if (typeof value === 'object') {
    if (seen.has(value as object)) {
      errors.push('Circular reference detected');
      flags.push('circular_ref');
      return {};
    }
    seen.add(value as object);

    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      // Keep keys stable (don't sanitize) to preserve schema integrity
      sanitized[key] = sanitizeValueSafe(val, config, depth + 1, errors, flags, seen);
    }
    return sanitized;
  }

  // Unknown type
  return value;
}

/**
 * Sanitize a string value (with flags for AI Firewall)
 */
function sanitizeStringSafe(
  value: string,
  config: SanitizerConfig,
  errors: string[],
  flags: string[]
): string {
  let result = value;

  // Length check
  if (result.length > config.maxStringLength) {
    errors.push(`String length (${result.length}) exceeds maximum (${config.maxStringLength})`);
    flags.push('string_truncated');
    result = result.slice(0, config.maxStringLength);
  }

  // Remove null bytes
  if (config.removeNullBytes) {
    const before = result;
    result = result.replace(/\0/g, '');
    if (before !== result) flags.push('null_bytes_removed');
  }

  // Strip HTML (safer regex)
  if (config.stripHtml) {
    const before = result;
    result = result.replace(/<\/?[^>]+>/g, '');
    if (before !== result) flags.push('html_stripped');
  }

  // Check forbidden patterns
  for (const pattern of config.forbiddenPatterns) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;
    if (pattern.test(result)) {
      errors.push(`Forbidden pattern detected`);
      flags.push('xss_detected');
      pattern.lastIndex = 0;
      result = result.replace(pattern, '');
    }
  }

  // Trim whitespace
  if (config.trimStrings) {
    result = result.trim();
  }

  return result;

}

// Legacy function (kept for standalone use)
function sanitizeValue(
  value: unknown,
  config: SanitizerConfig,
  depth: number,
  errors: string[]
): unknown {
  const flags: string[] = [];
  const seen = new WeakSet<object>();
  return sanitizeValueSafe(value, config, depth, errors, flags, seen);
}

// ============================================================================
// Validation Logic (Safe - with circular reference protection)
// ============================================================================

/**
 * Recursively validate a value (circular-safe, HTML-aware)
 */
function validateValueSafe(
  value: unknown,
  config: SanitizerConfig,
  depth: number,
  errors: string[],
  flags: string[],
  seen: WeakSet<object>
): void {
  // Depth check
  if (depth > config.maxDepth) {
    errors.push(`Output depth exceeds maximum (${config.maxDepth})`);
    flags.push('output_depth_exceeded');
    return;
  }

  // Null/undefined - OK
  if (value === null || value === undefined) {
    return;
  }

  // String
  if (typeof value === 'string') {
    if (value.length > config.maxStringLength) {
      errors.push(`Output string length exceeds maximum`);
      flags.push('output_too_long');
    }
    // Check for potential XSS in output (skip if HTML output allowed)
    if (!config.allowHtmlOutput) {
      for (const pattern of config.forbiddenPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(value)) {
          errors.push(`Output contains potentially dangerous content`);
          flags.push('bad_output');
        }
      }
    }
    return;
  }

  // Number/boolean - OK
  if (typeof value === 'number' || typeof value === 'boolean') {
    return;
  }

  // Array
  if (Array.isArray(value)) {
    if (value.length > config.maxArrayLength) {
      errors.push(`Output array length exceeds maximum`);
      flags.push('output_array_too_long');
    }
    for (const item of value) {
      validateValueSafe(item, config, depth + 1, errors, flags, seen);
    }
    return;
  }

  // Object - with circular reference protection
  if (typeof value === 'object') {
    if (seen.has(value as object)) {
      return; // Already validated
    }
    seen.add(value as object);

    for (const val of Object.values(value)) {
      validateValueSafe(val, config, depth + 1, errors, flags, seen);
    }
    return;
  }
}

// Legacy function (kept for standalone use)
function validateValue(
  value: unknown,
  config: SanitizerConfig,
  depth: number,
  errors: string[]
): void {
  const flags: string[] = [];
  const seen = new WeakSet<object>();
  validateValueSafe(value, config, depth, errors, flags, seen);
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Quick sanitize function (standalone)
 */
export function sanitize(value: unknown, config?: Partial<SanitizerConfig>): unknown {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];
  return sanitizeValue(value, fullConfig, 0, errors);
}

/**
 * Check if string is safe
 */
export function isSafeString(value: string): boolean {
  for (const pattern of DEFAULT_CONFIG.forbiddenPatterns) {
    if (pattern.test(value)) return false;
  }
  return true;
}

