/**
 * 📜 Security Rulebook v1.0
 * 
 * Governance-driven security rules:
 * - Allowlist/blocklist enforcement
 * - Context-aware rules
 * - Dynamic rule loading
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Rule {
  id: string;
  name: string;
  pattern: RegExp | string;
  action: "block" | "warn" | "audit";
  severity: "low" | "medium" | "high" | "critical";
  contexts?: string[]; // Applies only to these contexts
  description: string;
}

export interface RuleEvaluation {
  violates: boolean;
  rule: Rule | null;
  matchedText?: string;
}

// ═══════════════════════════════════════════════════════════
// Default Rules
// ═══════════════════════════════════════════════════════════

const DEFAULT_BLOCKLIST: Rule[] = [
  {
    id: "BLOCK001",
    name: "deleteDatabase",
    pattern: /deleteDatabase|dropDatabase|truncateTable/i,
    action: "block",
    severity: "critical",
    description: "Database deletion operations are forbidden",
  },
  {
    id: "BLOCK002",
    name: "overrideKernel",
    pattern: /overrideKernel|replaceKernel|patchKernel/i,
    action: "block",
    severity: "critical",
    description: "Kernel override attempts are forbidden",
  },
  {
    id: "BLOCK003",
    name: "alterSecurityPolicy",
    pattern: /alterSecurityPolicy|disableSecurity|bypassAuth/i,
    action: "block",
    severity: "critical",
    description: "Security policy modifications are forbidden",
  },
  {
    id: "BLOCK004",
    name: "spawnProcess",
    pattern: /spawn\s*\(|exec\s*\(|fork\s*\(/i,
    action: "block",
    severity: "high",
    description: "Process spawning is forbidden",
  },
  {
    id: "BLOCK005",
    name: "networkBind",
    pattern: /\.listen\s*\(|createServer\s*\(/i,
    action: "block",
    severity: "high",
    contexts: ["sandbox", "microapp"],
    description: "Network server creation is forbidden in sandbox",
  },
  {
    id: "BLOCK006",
    name: "fileSystemWrite",
    pattern: /writeFile|appendFile|mkdir|rmdir/i,
    action: "block",
    severity: "high",
    contexts: ["sandbox", "microapp"],
    description: "File system writes are forbidden in sandbox",
  },
  {
    id: "WARN001",
    name: "envAccess",
    pattern: /process\.env/i,
    action: "warn",
    severity: "medium",
    description: "Environment variable access detected",
  },
  {
    id: "WARN002",
    name: "dynamicImport",
    pattern: /import\s*\(/i,
    action: "warn",
    severity: "medium",
    description: "Dynamic import detected",
  },
];

const DEFAULT_ALLOWLIST = [
  "transform",
  "safeCompute",
  "render",
  "schema",
  "manifest",
  "validate",
  "parse",
  "format",
  "sanitize",
];

// ═══════════════════════════════════════════════════════════
// Rulebook
// ═══════════════════════════════════════════════════════════

export class Rulebook {
  private static rules: Rule[] = [...DEFAULT_BLOCKLIST];
  private static allowlist: string[] = [...DEFAULT_ALLOWLIST];

  /**
   * Evaluate code against rules
   */
  static evaluate(code: string, context?: string): RuleEvaluation {
    const lowered = code.toLowerCase();

    for (const rule of this.rules) {
      // Check context applicability
      if (rule.contexts && context && !rule.contexts.includes(context)) {
        continue;
      }

      // Check pattern match
      const pattern = typeof rule.pattern === "string"
        ? new RegExp(rule.pattern, "i")
        : rule.pattern;

      const match = code.match(pattern);
      if (match) {
        if (rule.action === "block") {
          return {
            violates: true,
            rule,
            matchedText: match[0],
          };
        }
        // For warn/audit, we could log but not block
        // For now, treat warn as block for risky contexts
        if (rule.action === "warn" && context && ["sandbox", "microapp"].includes(context)) {
          return {
            violates: true,
            rule,
            matchedText: match[0],
          };
        }
      }
    }

    return { violates: false, rule: null };
  }

  /**
   * Check if operation is in allowlist
   */
  static isAllowed(operation: string): boolean {
    return this.allowlist.some(allowed =>
      operation.toLowerCase().includes(allowed.toLowerCase())
    );
  }

  /**
   * Add custom rule
   */
  static addRule(rule: Rule): void {
    this.rules.push(rule);
  }

  /**
   * Remove rule by ID
   */
  static removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index >= 0) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Add to allowlist
   */
  static addToAllowlist(item: string): void {
    if (!this.allowlist.includes(item)) {
      this.allowlist.push(item);
    }
  }

  /**
   * Get all rules
   */
  static getRules(): Rule[] {
    return [...this.rules];
  }

  /**
   * Get allowlist
   */
  static getAllowlist(): string[] {
    return [...this.allowlist];
  }

  /**
   * Reset to defaults
   */
  static reset(): void {
    this.rules = [...DEFAULT_BLOCKLIST];
    this.allowlist = [...DEFAULT_ALLOWLIST];
  }
}

export const rulebook = Rulebook;

