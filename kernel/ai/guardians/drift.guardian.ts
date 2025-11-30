// ai/guardians/drift.guardian.ts
/**
 * Drift Guardian — Anti-Drift Enforcement Guardian
 * 
 * Prevents AI-generated code from drifting from Kernel patterns:
 * - Must use ctx.db (no direct DB access)
 * - Must have input/output contracts
 * - Must have tenant isolation
 * - Must use Zod schemas
 * - Must follow action handler signature
 * 
 * Enforces the 7 Anti-Drift Governance Pillars
 */

import type { GuardianDecision, GovernanceContext } from "../governance.engine";

/**
 * Required patterns for AI-generated code
 */
const REQUIRED_PATTERNS = {
  CTX_DB: /ctx\.db/,
  INPUT_SCHEMA: /input.*schema|inputschema/i,
  OUTPUT_SCHEMA: /output.*schema|outputschema/i,
  TENANT_ID: /tenant.*id|tenantid/i,
  ZOD_IMPORT: /import.*zod|from.*zod/i,
  ACTION_HANDLER: /async.*\(ctx.*\)|async function.*\(ctx\)/i,
} as const;

/**
 * Forbidden patterns (anti-patterns)
 */
const FORBIDDEN_PATTERNS = {
  DIRECT_DB: /new.*Pool|createPool|pg\.Pool|mysql\.createConnection/i,
  CONSOLE_LOG: /console\.log|console\.error|console\.warn/i,
  HARDCODED_SQL: /['"](select|insert|update|delete).*(from|into|set|where)/i,
  ANY_TYPE: /:\s*any(?!\w)/g,
  MISSING_ERROR_HANDLING: /await.*(?!try|catch)/,
} as const;

export const driftGuardian = {
  /**
   * Inspect AI-generated code for drift
   * 
   * @param action - Action ID
   * @param payload - Payload containing generated code
   * @param context - Governance context
   * @returns Guardian decision
   */
  async inspect(
    action: string,
    payload: unknown,
    context?: GovernanceContext
  ): Promise<GuardianDecision> {
    // Only inspect code generation actions
    if (!action.startsWith("code.") && !(payload as any)?.generatedCode) {
      return {
        guardian: "drift",
        status: "ALLOW",
        reason: "No code generation detected",
        timestamp: new Date(),
      };
    }

    const code = (payload as any)?.generatedCode as string;

    if (!code || typeof code !== "string") {
      return {
        guardian: "drift",
        status: "ALLOW",
        reason: "No generated code found in payload",
        timestamp: new Date(),
      };
    }

    const issues: string[] = [];

    // --- Check 1: Must use ctx.db (Pillar 7: Proxy-Only DB Access) ---
    if (!REQUIRED_PATTERNS.CTX_DB.test(code)) {
      return {
        guardian: "drift",
        status: "DENY",
        reason: "Generated code must use ctx.db for database access. Direct DB access is forbidden (Pillar 7).",
        details: { pattern: "CTX_DB", code: code.substring(0, 200) },
        timestamp: new Date(),
      };
    }

    // --- Check 2: Direct DB access forbidden ---
    if (FORBIDDEN_PATTERNS.DIRECT_DB.test(code)) {
      return {
        guardian: "drift",
        status: "DENY",
        reason: "Direct database connection detected (new Pool, createConnection, etc.). Must use ctx.db proxy.",
        details: { pattern: "DIRECT_DB", code: code.substring(0, 200) },
        timestamp: new Date(),
      };
    }

    // --- Check 3: Must have input schema (Pillar 2: Contract Versioning) ---
    if (!REQUIRED_PATTERNS.INPUT_SCHEMA.test(code)) {
      issues.push("Missing input schema definition (Pillar 2: Contract Versioning)");
    }

    // --- Check 4: Must have output schema (Pillar 2: Contract Versioning) ---
    if (!REQUIRED_PATTERNS.OUTPUT_SCHEMA.test(code)) {
      issues.push("Missing output schema definition (Pillar 2: Contract Versioning)");
    }

    // --- Check 5: Must have tenant isolation ---
    if (!REQUIRED_PATTERNS.TENANT_ID.test(code)) {
      issues.push("Missing tenant isolation (ctx.tenant or tenantId)");
    }

    // --- Check 6: Must use Zod (Pillar 1: Metadata-First) ---
    if (!REQUIRED_PATTERNS.ZOD_IMPORT.test(code)) {
      issues.push("Missing Zod import (Pillar 1: Metadata-First requires Zod schemas)");
    }

    // --- Check 7: Must follow action handler signature ---
    if (!REQUIRED_PATTERNS.ACTION_HANDLER.test(code)) {
      issues.push("Missing async action handler signature: async (ctx) => {...}");
    }

    // --- Check 8: No console.log (use logger) ---
    if (FORBIDDEN_PATTERNS.CONSOLE_LOG.test(code)) {
      issues.push("console.log detected — use ctx.log or logger instead");
    }

    // --- Check 9: No hardcoded SQL ---
    if (FORBIDDEN_PATTERNS.HARDCODED_SQL.test(code)) {
      issues.push("Hardcoded SQL detected — use parameterized queries via ctx.db.query()");
    }

    // --- Check 10: No 'any' types ---
    const anyTypeMatches = code.match(FORBIDDEN_PATTERNS.ANY_TYPE);
    if (anyTypeMatches && anyTypeMatches.length > 3) {
      issues.push(`Excessive use of 'any' type (${anyTypeMatches.length} occurrences) — use proper TypeScript types`);
    }

    // --- Check 11: Contract structure ---
    const hasContractDeclaration = /export const.*Contract/.test(code);
    if (!hasContractDeclaration) {
      issues.push("Missing contract declaration (must export a KernelActionContract)");
    }

    // --- Check 12: Action registration ---
    const hasActionRegistration = /defineAction|registerAction/.test(code);
    if (!hasActionRegistration) {
      issues.push("Missing action registration (use defineAction from SDK)");
    }

    // --- Check 13: Error handling ---
    const hasTryCatch = /try\s*{[\s\S]*catch/.test(code);
    const hasAwait = /await\s+/.test(code);
    if (hasAwait && !hasTryCatch) {
      issues.push("Missing error handling (async code should have try/catch)");
    }

    // --- Determine status ---
    if (issues.length === 0) {
      return {
        guardian: "drift",
        status: "ALLOW",
        reason: "Generated code adheres to all kernel patterns",
        timestamp: new Date(),
      };
    }

    if (issues.length <= 3) {
      return {
        guardian: "drift",
        status: "WARN",
        reason: `${issues.length} drift issue(s) detected`,
        details: { issues, code: code.substring(0, 300) },
        timestamp: new Date(),
      };
    }

    return {
      guardian: "drift",
      status: "DENY",
      reason: `${issues.length} critical drift violations detected: ${issues.slice(0, 3).join("; ")}...`,
      details: { issues, code: code.substring(0, 300) },
      timestamp: new Date(),
    };
  },

  /**
   * Validate code against specific pillar
   * 
   * @param code - Generated code
   * @param pillar - Pillar number (1-7)
   * @returns Validation result
   */
  validatePillar(code: string, pillar: number): {
    valid: boolean;
    reason?: string;
  } {
    switch (pillar) {
      case 1: // Metadata-First
        return {
          valid: REQUIRED_PATTERNS.ZOD_IMPORT.test(code),
          reason: "Must use Zod schemas for metadata-first design",
        };

      case 2: // Contract Versioning
        return {
          valid:
            REQUIRED_PATTERNS.INPUT_SCHEMA.test(code) &&
            REQUIRED_PATTERNS.OUTPUT_SCHEMA.test(code),
          reason: "Must define input and output schemas",
        };

      case 3: // RBAC/ABAC/PBAC
        // Check for permissions or policy checks
        return {
          valid: /permission|policy|rbac|abac/i.test(code),
          reason: "Must include permission or policy checks",
        };

      case 7: // Proxy-Only DB Access
        return {
          valid:
            REQUIRED_PATTERNS.CTX_DB.test(code) &&
            !FORBIDDEN_PATTERNS.DIRECT_DB.test(code),
          reason: "Must use ctx.db proxy for all database access",
        };

      default:
        return { valid: true };
    }
  },

  /**
   * Calculate drift score (0-100)
   * 
   * @param code - Generated code
   * @returns Drift score (0 = perfect, 100 = maximum drift)
   */
  calculateDriftScore(code: string): number {
    let score = 0;

    // Missing required patterns (+20 each)
    if (!REQUIRED_PATTERNS.CTX_DB.test(code)) score += 20;
    if (!REQUIRED_PATTERNS.INPUT_SCHEMA.test(code)) score += 20;
    if (!REQUIRED_PATTERNS.OUTPUT_SCHEMA.test(code)) score += 20;
    if (!REQUIRED_PATTERNS.TENANT_ID.test(code)) score += 15;
    if (!REQUIRED_PATTERNS.ZOD_IMPORT.test(code)) score += 15;

    // Forbidden patterns (+10 each)
    if (FORBIDDEN_PATTERNS.DIRECT_DB.test(code)) score += 10;
    if (FORBIDDEN_PATTERNS.CONSOLE_LOG.test(code)) score += 5;
    if (FORBIDDEN_PATTERNS.HARDCODED_SQL.test(code)) score += 10;

    return Math.min(score, 100);
  },
};

