/**
 * 🎯 Multi-Layer Threat Matrix v1.0
 * 
 * Comprehensive threat detection:
 * - Code injection
 * - Command injection
 * - Memory attacks
 * - Infinite loops
 * - Env leakage
 * - Privilege escalation
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ThreatPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: "low" | "medium" | "high" | "critical";
  category: "injection" | "loop" | "memory" | "env" | "privilege" | "network";
  description: string;
}

export interface ThreatAnalysis {
  safe: boolean;
  threats: Array<{
    pattern: ThreatPattern;
    matches: string[];
  }>;
  riskScore: number;
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════
// Threat Patterns
// ═══════════════════════════════════════════════════════════

const THREAT_PATTERNS: ThreatPattern[] = [
  // Injection threats
  {
    id: "INJ001",
    name: "eval_injection",
    pattern: /\beval\s*\(/gi,
    severity: "critical",
    category: "injection",
    description: "Direct eval() call detected",
  },
  {
    id: "INJ002",
    name: "function_constructor",
    pattern: /\bnew\s+Function\s*\(/gi,
    severity: "critical",
    category: "injection",
    description: "Function constructor detected",
  },
  {
    id: "INJ003",
    name: "child_process",
    pattern: /child_process|spawn|exec\s*\(/gi,
    severity: "critical",
    category: "injection",
    description: "Child process execution detected",
  },
  {
    id: "INJ004",
    name: "dynamic_require",
    pattern: /require\s*\(\s*[^'"]/gi,
    severity: "high",
    category: "injection",
    description: "Dynamic require with variable",
  },

  // Loop threats
  {
    id: "LOOP001",
    name: "infinite_while",
    pattern: /while\s*\(\s*true\s*\)/gi,
    severity: "high",
    category: "loop",
    description: "Infinite while loop",
  },
  {
    id: "LOOP002",
    name: "infinite_for",
    pattern: /for\s*\(\s*;\s*;\s*\)/gi,
    severity: "high",
    category: "loop",
    description: "Infinite for loop",
  },
  {
    id: "LOOP003",
    name: "recursive_call",
    pattern: /function\s+(\w+)[^}]+\1\s*\(/gi,
    severity: "medium",
    category: "loop",
    description: "Potential unbounded recursion",
  },

  // Memory threats
  {
    id: "MEM001",
    name: "large_array",
    pattern: /new\s+Array\s*\(\s*\d{7,}\s*\)/gi,
    severity: "critical",
    category: "memory",
    description: "Large array allocation",
  },
  {
    id: "MEM002",
    name: "string_repeat",
    pattern: /\.repeat\s*\(\s*\d{6,}\s*\)/gi,
    severity: "critical",
    category: "memory",
    description: "Large string repeat",
  },
  {
    id: "MEM003",
    name: "buffer_alloc",
    pattern: /Buffer\.(alloc|allocUnsafe)\s*\(\s*\d{7,}\s*\)/gi,
    severity: "critical",
    category: "memory",
    description: "Large buffer allocation",
  },

  // Environment threats
  {
    id: "ENV001",
    name: "env_access",
    pattern: /process\.env/gi,
    severity: "medium",
    category: "env",
    description: "Environment variable access",
  },
  {
    id: "ENV002",
    name: "dirname_access",
    pattern: /__dirname|__filename/gi,
    severity: "medium",
    category: "env",
    description: "Path disclosure",
  },
  {
    id: "ENV003",
    name: "process_access",
    pattern: /process\.(exit|kill|abort)/gi,
    severity: "critical",
    category: "env",
    description: "Process control access",
  },

  // Privilege threats
  {
    id: "PRIV001",
    name: "global_access",
    pattern: /globalThis\[|global\[|window\[/gi,
    severity: "high",
    category: "privilege",
    description: "Dynamic global access",
  },
  {
    id: "PRIV002",
    name: "prototype_pollution",
    pattern: /__proto__|constructor\.prototype|Object\.setPrototypeOf/gi,
    severity: "critical",
    category: "privilege",
    description: "Prototype pollution attempt",
  },
  {
    id: "PRIV003",
    name: "reflect_access",
    pattern: /Reflect\.(defineProperty|setPrototypeOf)/gi,
    severity: "high",
    category: "privilege",
    description: "Reflect API abuse",
  },

  // Network threats
  {
    id: "NET001",
    name: "raw_socket",
    pattern: /\bnet\.|dgram\./gi,
    severity: "high",
    category: "network",
    description: "Raw socket access",
  },
  {
    id: "NET002",
    name: "dns_lookup",
    pattern: /dns\.lookup|dns\.resolve/gi,
    severity: "medium",
    category: "network",
    description: "DNS lookup (potential exfiltration)",
  },
];

// ═══════════════════════════════════════════════════════════
// Threat Matrix
// ═══════════════════════════════════════════════════════════

export class ThreatMatrix {
  /**
   * Analyze code for threats
   */
  static analyze(code: string): ThreatAnalysis {
    const threats: ThreatAnalysis["threats"] = [];
    let riskScore = 0;

    for (const pattern of THREAT_PATTERNS) {
      const matches = code.match(pattern.pattern);
      if (matches && matches.length > 0) {
        threats.push({
          pattern,
          matches,
        });

        // Calculate risk score
        const severityScore = {
          low: 5,
          medium: 15,
          high: 30,
          critical: 50,
        }[pattern.severity];

        riskScore += severityScore * Math.min(matches.length, 3);
      }
    }

    riskScore = Math.min(100, riskScore);

    return {
      safe: threats.length === 0,
      threats,
      riskScore,
      recommendation: this.getRecommendation(riskScore, threats),
    };
  }

  /**
   * Quick check if code is safe
   */
  static isSafe(code: string): boolean {
    return this.analyze(code).safe;
  }

  /**
   * Get threats by category
   */
  static getThreatsBy(code: string, category: ThreatPattern["category"]): ThreatAnalysis["threats"] {
    const analysis = this.analyze(code);
    return analysis.threats.filter(t => t.pattern.category === category);
  }

  /**
   * Get all patterns
   */
  static getPatterns(): ThreatPattern[] {
    return [...THREAT_PATTERNS];
  }

  /**
   * Add custom pattern
   */
  static addPattern(pattern: ThreatPattern): void {
    THREAT_PATTERNS.push(pattern);
  }

  private static getRecommendation(riskScore: number, threats: ThreatAnalysis["threats"]): string {
    if (riskScore === 0) {
      return "Code appears safe. No threats detected.";
    }

    if (riskScore >= 80) {
      return "CRITICAL: Code contains severe threats. Do not execute.";
    }

    if (riskScore >= 50) {
      return "HIGH RISK: Code contains significant threats. Review and sanitize.";
    }

    if (riskScore >= 25) {
      return "MEDIUM RISK: Code contains potential threats. Proceed with caution.";
    }

    return "LOW RISK: Minor concerns detected. Review before execution.";
  }
}

export const threatMatrix = ThreatMatrix;

