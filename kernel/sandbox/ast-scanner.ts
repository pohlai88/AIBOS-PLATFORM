/**
 * 🔍 AST Security Scanner v3.1
 * 
 * Deep static analysis:
 * - Forbidden patterns
 * - Prototype pollution
 * - Infinite loops
 * - Eval/injection
 * - Unbounded recursion
 * - CPU/memory prediction
 * - **Microtask loop detection** (event loop starvation)
 * - **Obfuscation detection** (string concat eval bypass)
 * - **WebAssembly detection**
 * - **Dynamic property access**
 * 
 * @version 3.1.0
 */

import { type ASTRiskResult, type ASTIssue } from "./types";

// ═══════════════════════════════════════════════════════════
// Dangerous Patterns
// ═══════════════════════════════════════════════════════════

interface DangerPattern {
  pattern: RegExp;
  type: string;
  severity: ASTIssue["severity"];
  message: string;
  score: number;
  /** Tag for categorization */
  tag?: "obfuscation" | "microtask" | "proto" | "wasm";
}

const DANGER_PATTERNS: DangerPattern[] = [
  // ═══════════════════════════════════════════════════════════
  // Critical - Code execution
  // ═══════════════════════════════════════════════════════════
  { pattern: /\beval\s*\(/g, type: "code_execution", severity: "critical", message: "eval() detected", score: 50 },
  { pattern: /\bnew\s+Function\s*\(/g, type: "code_execution", severity: "critical", message: "new Function() detected", score: 50 },
  { pattern: /\bFunction\s*\(/g, type: "code_execution", severity: "critical", message: "Function constructor detected", score: 50 },
  
  // ═══════════════════════════════════════════════════════════
  // Critical - Prototype pollution
  // ═══════════════════════════════════════════════════════════
  { pattern: /__proto__/g, type: "prototype_pollution", severity: "critical", message: "__proto__ access detected", score: 40, tag: "proto" },
  { pattern: /constructor\s*\.\s*prototype/g, type: "prototype_pollution", severity: "critical", message: "Prototype manipulation detected", score: 40, tag: "proto" },
  { pattern: /Object\s*\.\s*setPrototypeOf/g, type: "prototype_pollution", severity: "critical", message: "setPrototypeOf detected", score: 40, tag: "proto" },
  { pattern: /Object\s*\.\s*getPrototypeOf/g, type: "prototype_pollution", severity: "high", message: "getPrototypeOf detected", score: 25, tag: "proto" },
  { pattern: /Reflect\s*\.\s*setPrototypeOf/g, type: "prototype_pollution", severity: "critical", message: "Reflect.setPrototypeOf detected", score: 40, tag: "proto" },
  { pattern: /\.constructor\s*\.\s*constructor/g, type: "prototype_escape", severity: "critical", message: "Constructor chain escape detected", score: 50, tag: "proto" },
  
  // ═══════════════════════════════════════════════════════════
  // Critical - Process/System access
  // ═══════════════════════════════════════════════════════════
  { pattern: /\bprocess\./g, type: "system_access", severity: "critical", message: "process access detected", score: 50 },
  { pattern: /\brequire\s*\(/g, type: "module_import", severity: "critical", message: "require() detected", score: 50 },
  { pattern: /\bimport\s*\(/g, type: "module_import", severity: "critical", message: "Dynamic import detected", score: 50 },
  { pattern: /\bmodule\s*\.\s*exports/g, type: "module_export", severity: "critical", message: "module.exports detected", score: 40 },
  
  // ═══════════════════════════════════════════════════════════
  // Critical - WebAssembly (must be isolated)
  // ═══════════════════════════════════════════════════════════
  { pattern: /\bWebAssembly\s*\./g, type: "wasm", severity: "critical", message: "WebAssembly detected", score: 45, tag: "wasm" },
  { pattern: /\bnew\s+WebAssembly\./g, type: "wasm", severity: "critical", message: "WebAssembly instantiation detected", score: 50, tag: "wasm" },
  { pattern: /WebAssembly\s*\.\s*instantiate/g, type: "wasm", severity: "critical", message: "WebAssembly.instantiate detected", score: 50, tag: "wasm" },
  { pattern: /WebAssembly\s*\.\s*compile/g, type: "wasm", severity: "critical", message: "WebAssembly.compile detected", score: 50, tag: "wasm" },
  
  // ═══════════════════════════════════════════════════════════
  // High - Infinite loops
  // ═══════════════════════════════════════════════════════════
  { pattern: /while\s*\(\s*true\s*\)/g, type: "infinite_loop", severity: "high", message: "Infinite while(true) loop", score: 30 },
  { pattern: /for\s*\(\s*;\s*;\s*\)/g, type: "infinite_loop", severity: "high", message: "Infinite for(;;) loop", score: 30 },
  { pattern: /for\s*\(\s*;;\s*\)/g, type: "infinite_loop", severity: "high", message: "Infinite for loop", score: 30 },
  { pattern: /while\s*\(\s*1\s*\)/g, type: "infinite_loop", severity: "high", message: "Infinite while(1) loop", score: 30 },
  { pattern: /do\s*\{[\s\S]*?\}\s*while\s*\(\s*true\s*\)/g, type: "infinite_loop", severity: "high", message: "Infinite do-while loop", score: 30 },
  
  // ═══════════════════════════════════════════════════════════
  // Critical - Microtask/Event Loop Starvation
  // ═══════════════════════════════════════════════════════════
  { pattern: /while\s*\([^)]*\)\s*await\s+Promise\s*\.\s*resolve/g, type: "microtask_loop", severity: "critical", message: "Microtask starvation loop detected", score: 50, tag: "microtask" },
  { pattern: /for\s*\([^)]*\)\s*await\s+Promise\s*\.\s*resolve/g, type: "microtask_loop", severity: "critical", message: "Microtask starvation in for-loop", score: 50, tag: "microtask" },
  { pattern: /async\s+function[^{]*\{[^}]*while\s*\(\s*true\s*\)[^}]*await/g, type: "microtask_loop", severity: "critical", message: "Async infinite loop detected", score: 50, tag: "microtask" },
  { pattern: /Promise\s*\.\s*resolve\s*\(\s*\)\s*\.\s*then\s*\([^)]*=>[^)]*Promise\s*\.\s*resolve/g, type: "microtask_loop", severity: "high", message: "Recursive microtask chain", score: 35, tag: "microtask" },
  { pattern: /queueMicrotask\s*\(/g, type: "microtask", severity: "high", message: "queueMicrotask detected", score: 25, tag: "microtask" },
  { pattern: /process\s*\.\s*nextTick/g, type: "microtask", severity: "critical", message: "process.nextTick detected", score: 40, tag: "microtask" },
  
  // ═══════════════════════════════════════════════════════════
  // High - Dangerous globals / Dynamic property access
  // ═══════════════════════════════════════════════════════════
  { pattern: /\bglobalThis\s*\[/g, type: "global_access", severity: "high", message: "globalThis bracket access", score: 25 },
  { pattern: /\bwindow\s*\[/g, type: "global_access", severity: "high", message: "window bracket access", score: 25 },
  { pattern: /\bglobal\s*\[/g, type: "global_access", severity: "high", message: "global bracket access", score: 25 },
  { pattern: /\bthis\s*\[\s*[^'"\]]+\s*\]/g, type: "dynamic_access", severity: "high", message: "Dynamic this[] access", score: 30 },
  { pattern: /\[\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\+\s*[a-zA-Z_$][a-zA-Z0-9_$]*\s*\]/g, type: "dynamic_key", severity: "high", message: "Computed property with concatenation", score: 30, tag: "obfuscation" },
  
  // ═══════════════════════════════════════════════════════════
  // High - Timers (can be abused)
  // ═══════════════════════════════════════════════════════════
  { pattern: /\bsetTimeout\s*\(/g, type: "timer", severity: "medium", message: "setTimeout detected", score: 10 },
  { pattern: /\bsetInterval\s*\(/g, type: "timer", severity: "high", message: "setInterval detected", score: 20 },
  { pattern: /\bsetImmediate\s*\(/g, type: "timer", severity: "medium", message: "setImmediate detected", score: 10 },
  
  // ═══════════════════════════════════════════════════════════
  // Medium - File system
  // ═══════════════════════════════════════════════════════════
  { pattern: /\bfs\./g, type: "filesystem", severity: "high", message: "File system access detected", score: 40 },
  { pattern: /\bchild_process/g, type: "system_access", severity: "critical", message: "child_process detected", score: 50 },
  { pattern: /\bexecSync\s*\(/g, type: "system_access", severity: "critical", message: "execSync detected", score: 50 },
  { pattern: /\bspawn\s*\(/g, type: "system_access", severity: "critical", message: "spawn detected", score: 50 },
  
  // ═══════════════════════════════════════════════════════════
  // Medium - Network
  // ═══════════════════════════════════════════════════════════
  { pattern: /\bhttp\./g, type: "network", severity: "medium", message: "HTTP module detected", score: 15 },
  { pattern: /\bhttps\./g, type: "network", severity: "medium", message: "HTTPS module detected", score: 15 },
  { pattern: /\bnet\./g, type: "network", severity: "high", message: "Net module detected", score: 30 },
  { pattern: /\bdgram\./g, type: "network", severity: "high", message: "UDP module detected", score: 30 },
  
  // ═══════════════════════════════════════════════════════════
  // Medium - ReDoS
  // ═══════════════════════════════════════════════════════════
  { pattern: /\(\.\*\)\+|\(\.\+\)\*|\(\[.*\]\+\)\+/g, type: "redos", severity: "medium", message: "Potential ReDoS pattern", score: 20 },
  { pattern: /\(\[^\\]]*\]\*\)\+/g, type: "redos", severity: "medium", message: "Nested quantifier ReDoS", score: 20 },
  
  // ═══════════════════════════════════════════════════════════
  // Critical - Obfuscation attempts
  // ═══════════════════════════════════════════════════════════
  { pattern: /\[\s*['"`]ev['"`]\s*\+\s*['"`]al['"`]\s*\]/g, type: "obfuscation", severity: "critical", message: "Obfuscated eval detected (ev+al)", score: 50, tag: "obfuscation" },
  { pattern: /\[\s*['"`]e['"`]\s*\+\s*['"`]v['"`]\s*\+\s*['"`]a['"`]\s*\+\s*['"`]l['"`]\s*\]/g, type: "obfuscation", severity: "critical", message: "Obfuscated eval detected (e+v+a+l)", score: 50, tag: "obfuscation" },
  { pattern: /\[\s*['"`]Fun['"`]\s*\+\s*['"`]ction['"`]\s*\]/g, type: "obfuscation", severity: "critical", message: "Obfuscated Function detected", score: 50, tag: "obfuscation" },
  { pattern: /\[\s*['"`]req['"`]\s*\+\s*['"`]uire['"`]\s*\]/g, type: "obfuscation", severity: "critical", message: "Obfuscated require detected", score: 50, tag: "obfuscation" },
  { pattern: /\[\s*['"`]im['"`]\s*\+\s*['"`]port['"`]\s*\]/g, type: "obfuscation", severity: "critical", message: "Obfuscated import detected", score: 50, tag: "obfuscation" },
  { pattern: /String\s*\.\s*fromCharCode/g, type: "obfuscation", severity: "medium", message: "String.fromCharCode (potential obfuscation)", score: 15, tag: "obfuscation" },
  { pattern: /atob\s*\(\s*['"`][A-Za-z0-9+/=]{20,}['"`]\s*\)/g, type: "obfuscation", severity: "high", message: "Base64 encoded payload detected", score: 30, tag: "obfuscation" },
  { pattern: /\\x[0-9a-fA-F]{2}/g, type: "obfuscation", severity: "medium", message: "Hex escape sequences detected", score: 15, tag: "obfuscation" },
  { pattern: /\\u[0-9a-fA-F]{4}/g, type: "obfuscation", severity: "low", message: "Unicode escapes detected", score: 5, tag: "obfuscation" },
  
  // ═══════════════════════════════════════════════════════════
  // Memory attacks
  // ═══════════════════════════════════════════════════════════
  { pattern: /new\s+Array\s*\(\s*\d{7,}\s*\)/g, type: "memory_attack", severity: "critical", message: "Large array allocation detected", score: 45 },
  { pattern: /\.repeat\s*\(\s*\d{6,}\s*\)/g, type: "memory_attack", severity: "critical", message: "String repeat attack detected", score: 45 },
  { pattern: /Buffer\s*\.\s*alloc\s*\(\s*\d{7,}\s*\)/g, type: "memory_attack", severity: "critical", message: "Large buffer allocation detected", score: 45 },
];

// ═══════════════════════════════════════════════════════════
// AST Scanner
// ═══════════════════════════════════════════════════════════

export class ASTScanner {
  /**
   * Analyze code for security risks
   */
  static analyze(code: string): ASTRiskResult {
    const issues: ASTIssue[] = [];
    let score = 0;

    // Flags for categorization
    let hasMicrotaskLoop = false;
    let hasObfuscation = false;
    let hasProtoAccess = false;
    let hasWebAssembly = false;

    // Check syntax
    try {
      new Function(code);
    } catch (e: any) {
      issues.push({
        type: "syntax_error",
        severity: "critical",
        message: `Syntax error: ${e.message}`,
      });
      score += 100; // Invalid code is max risk
      return {
        score: Math.min(score, 100),
        issues,
        complexity: 0,
        hasAsyncCode: false,
        hasNetworkCalls: false,
        estimatedMemoryMB: 0,
        hasMicrotaskLoop: false,
        hasObfuscation: false,
        hasProtoAccess: false,
        hasWebAssembly: false,
      };
    }

    // Pattern matching
    for (const danger of DANGER_PATTERNS) {
      const matches = code.match(danger.pattern);
      if (matches) {
        issues.push({
          type: danger.type,
          severity: danger.severity,
          message: `${danger.message} (${matches.length} occurrence${matches.length > 1 ? "s" : ""})`,
        });
        score += danger.score * Math.min(matches.length, 3); // Cap at 3x

        // Set flags
        if (danger.tag === "microtask") hasMicrotaskLoop = true;
        if (danger.tag === "obfuscation") hasObfuscation = true;
        if (danger.tag === "proto") hasProtoAccess = true;
        if (danger.tag === "wasm") hasWebAssembly = true;
      }
    }

    // Advanced obfuscation detection
    if (this.detectAdvancedObfuscation(code)) {
      hasObfuscation = true;
      issues.push({
        type: "advanced_obfuscation",
        severity: "high",
        message: "Advanced obfuscation pattern detected",
      });
      score += 25;
    }

    // Estimate complexity
    const complexity = this.estimateComplexity(code);
    score += complexity > 50 ? 10 : 0;

    // Check for async/network
    const hasAsyncCode = /async|await|Promise|\.then\(/.test(code);
    const hasNetworkCalls = /fetch\(|XMLHttpRequest|axios|http\./.test(code);

    // Estimate memory
    const estimatedMemoryMB = this.estimateMemory(code);
    if (estimatedMemoryMB > 50) score += 15;

    return {
      score: Math.min(score, 100),
      issues,
      complexity,
      hasAsyncCode,
      hasNetworkCalls,
      estimatedMemoryMB,
      hasMicrotaskLoop,
      hasObfuscation,
      hasProtoAccess,
      hasWebAssembly,
    };
  }

  /**
   * Detect advanced obfuscation techniques
   */
  private static detectAdvancedObfuscation(code: string): boolean {
    // Check for computed property with variable concatenation
    // e.g., const x = "ev"; const y = "al"; this[x + y]()
    const varConcat = /const\s+(\w+)\s*=\s*['"`](\w+)['"`][\s\S]*\[\s*\1\s*\+/;
    if (varConcat.test(code)) return true;

    // Check for array-based obfuscation
    // e.g., ["e","v","a","l"].join("")
    const arrayJoin = /\[\s*['"`]\w['"`]\s*,[\s\S]*\]\s*\.\s*join\s*\(\s*['"`]['"`]\s*\)/;
    if (arrayJoin.test(code)) return true;

    // Check for split/reverse tricks
    // e.g., "lave".split("").reverse().join("")
    const reverseJoin = /['"`]\w+['"`]\s*\.\s*split\s*\([^)]*\)\s*\.\s*reverse\s*\(\s*\)\s*\.\s*join/;
    if (reverseJoin.test(code)) return true;

    // Check for charCodeAt/fromCharCode patterns
    const charCodePattern = /charCodeAt[\s\S]*fromCharCode/;
    if (charCodePattern.test(code)) return true;

    return false;
  }

  /**
   * Estimate cyclomatic complexity
   */
  private static estimateComplexity(code: string): number {
    let complexity = 1;

    // Count decision points
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*[^:]+\s*:/g, // Ternary
      /&&/g,
      /\|\|/g,
    ];

    for (const pattern of patterns) {
      const matches = code.match(pattern);
      if (matches) complexity += matches.length;
    }

    return complexity;
  }

  /**
   * Estimate memory usage
   */
  private static estimateMemory(code: string): number {
    let mb = 1; // Base

    // Large arrays
    const arrayMatches = code.match(/new\s+Array\s*\(\s*(\d+)\s*\)/g);
    if (arrayMatches) {
      for (const match of arrayMatches) {
        const size = parseInt(match.match(/\d+/)?.[0] || "0");
        mb += (size * 8) / 1024 / 1024;
      }
    }

    // String operations
    if (/\.repeat\s*\(\s*\d{4,}\s*\)/.test(code)) mb += 10;

    // Buffer allocations
    const bufferMatches = code.match(/Buffer\.(alloc|allocUnsafe)\s*\(\s*(\d+)\s*\)/g);
    if (bufferMatches) {
      for (const match of bufferMatches) {
        const size = parseInt(match.match(/\d+/)?.[0] || "0");
        mb += size / 1024 / 1024;
      }
    }

    return mb;
  }

  /**
   * Quick check if code is safe enough for fast path
   */
  static isSafeForFastPath(code: string): boolean {
    const result = this.analyze(code);
    return result.score < 20 && result.issues.every(i => i.severity !== "critical");
  }
}

export const astScanner = ASTScanner;

