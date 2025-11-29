/**
 * 📜 Sandbox Contract Enforcer v3.1
 * 
 * Enforces metadata-driven contracts:
 * - Capability restrictions
 * - Resource limits
 * - Domain allowlists
 * - Global permissions
 * - **Manifest validation**
 * - **CPU/memory budgets**
 * - **Network call limits**
 * - **WebAssembly blocking**
 * 
 * @version 3.1.0
 */

import { type SandboxContract, type SandboxExecutionOptions, type ASTRiskResult } from "./types";

// ═══════════════════════════════════════════════════════════
// Default Contract
// ═══════════════════════════════════════════════════════════

export const DEFAULT_CONTRACT: SandboxContract = {
  // Network
  maxExecutionMs: 5000,
  allowNetwork: true,
  allowedDomains: [],
  maxNetworkCalls: 20,
  maxResponseSizeKB: 1024,
  maxRequestSizeKB: 256,

  // Resources
  maxMemoryMB: 50,
  cpuBudgetMs: 5000,

  // Logging
  maxLogEntries: 100,
  maxLogSizeKB: 64,

  // Security
  allowFileSystem: false,
  forbidDynamicKeys: true,
  forbidProtoAccess: true,
  forbidWebAssembly: true,

  // Capabilities
  capabilities: ["fetch", "console", "json", "math", "base64"],
  allowedGlobals: ["console", "JSON", "Math", "Date", "Array", "Object", "String", "Number", "Boolean", "Promise", "Map", "Set", "Error"],
};

// ═══════════════════════════════════════════════════════════
// Manifest Schema (YAML-compatible)
// ═══════════════════════════════════════════════════════════

export interface AdapterManifest {
  name: string;
  version: string;
  author?: string;
  description?: string;

  capabilities: {
    network: boolean;
    filesystem: boolean;
    cpu_limit_ms: number;
    memory_limit_mb: number;
    globals: string[];
  };

  allowedDomains?: string[];
  maxNetworkCalls?: number;
}

// ═══════════════════════════════════════════════════════════
// Contract Enforcer
// ═══════════════════════════════════════════════════════════

export class ContractEnforcer {
  /**
   * Merge user contract with defaults
   */
  static mergeContract(userContract?: Partial<SandboxContract>): SandboxContract {
    return {
      ...DEFAULT_CONTRACT,
      ...userContract,
    };
  }

  /**
   * Apply contract restrictions to globals context
   */
  static applyToGlobals(
    globals: Record<string, any>,
    contract: SandboxContract
  ): Record<string, any> {
    const restricted = { ...globals };

    // Remove network if disabled
    if (!contract.allowNetwork) {
      delete restricted.fetch;
      delete restricted.XMLHttpRequest;
    }

    // Remove timers if not in capabilities
    if (!contract.capabilities?.includes("timers")) {
      delete restricted.setTimeout;
      delete restricted.setInterval;
      delete restricted.setImmediate;
    }

    // Apply capability filter
    if (contract.capabilities?.length) {
      const capabilityMap: Record<string, string[]> = {
        fetch: ["fetch"],
        console: ["console"],
        json: ["JSON"],
        math: ["Math"],
        date: ["Date"],
        timers: ["setTimeout", "setInterval"],
        crypto: ["crypto"],
        base64: ["btoa", "atob"],
      };

      const allowedGlobals = new Set<string>();
      for (const cap of contract.capabilities) {
        const globals = capabilityMap[cap] || [];
        globals.forEach(g => allowedGlobals.add(g));
      }

      // Always allow basic types
      ["Array", "Object", "Number", "String", "Boolean", "Error", "Promise", "Map", "Set"]
        .forEach(g => allowedGlobals.add(g));

      // Filter globals
      for (const key of Object.keys(restricted)) {
        if (!allowedGlobals.has(key) && !key.startsWith("__")) {
          delete restricted[key];
        }
      }
    }

    return restricted;
  }

  /**
   * Validate execution options against contract
   */
  static validate(
    options: SandboxExecutionOptions,
    contract: SandboxContract
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check code size (rough memory estimate)
    const estimatedMemoryMB = options.code.length / 1024 / 1024 * 10;
    if (contract.maxMemoryMB && estimatedMemoryMB > contract.maxMemoryMB) {
      violations.push(`Code size exceeds memory limit (${contract.maxMemoryMB}MB)`);
    }

    // Check for forbidden patterns if network disabled
    if (!contract.allowNetwork && /fetch\s*\(|XMLHttpRequest|axios/i.test(options.code)) {
      violations.push("Network access is disabled but code contains network calls");
    }

    // Check for file system access
    if (!contract.allowFileSystem && /\bfs\.|readFile|writeFile|__dirname|__filename/i.test(options.code)) {
      violations.push("File system access is disabled but code contains fs operations");
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }

  /**
   * Create tenant-specific contract
   */
  static createTenantContract(
    tenantId: string,
    tier: "free" | "pro" | "enterprise"
  ): SandboxContract {
    const tierLimits = {
      free: {
        maxExecutionMs: 3000,
        maxMemoryMB: 20,
        cpuBudgetMs: 3000,
        maxNetworkCalls: 10,
        maxLogEntries: 50,
        allowNetwork: true,
      },
      pro: {
        maxExecutionMs: 10000,
        maxMemoryMB: 100,
        cpuBudgetMs: 10000,
        maxNetworkCalls: 50,
        maxLogEntries: 200,
        allowNetwork: true,
      },
      enterprise: {
        maxExecutionMs: 30000,
        maxMemoryMB: 500,
        cpuBudgetMs: 30000,
        maxNetworkCalls: 200,
        maxLogEntries: 1000,
        allowNetwork: true,
      },
    };

    return {
      ...DEFAULT_CONTRACT,
      ...tierLimits[tier],
    };
  }

  /**
   * Create contract from adapter manifest
   */
  static fromManifest(manifest: AdapterManifest): SandboxContract {
    return {
      ...DEFAULT_CONTRACT,
      allowNetwork: manifest.capabilities.network,
      allowFileSystem: manifest.capabilities.filesystem,
      maxExecutionMs: manifest.capabilities.cpu_limit_ms,
      cpuBudgetMs: manifest.capabilities.cpu_limit_ms,
      maxMemoryMB: manifest.capabilities.memory_limit_mb,
      allowedGlobals: manifest.capabilities.globals,
      allowedDomains: manifest.allowedDomains || [],
      maxNetworkCalls: manifest.maxNetworkCalls || DEFAULT_CONTRACT.maxNetworkCalls,
    };
  }

  /**
   * Validate manifest against security policy
   */
  static validateManifest(manifest: AdapterManifest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate limits
    if (manifest.capabilities.cpu_limit_ms > 60000) {
      errors.push("CPU limit cannot exceed 60 seconds");
    }
    if (manifest.capabilities.memory_limit_mb > 1024) {
      errors.push("Memory limit cannot exceed 1GB");
    }

    // Validate globals
    const FORBIDDEN_GLOBALS = ["eval", "Function", "process", "require", "import", "globalThis", "window", "global"];
    for (const g of manifest.capabilities.globals) {
      if (FORBIDDEN_GLOBALS.includes(g)) {
        errors.push(`Forbidden global: ${g}`);
      }
    }

    // Validate domains
    if (manifest.allowedDomains) {
      for (const domain of manifest.allowedDomains) {
        if (domain.includes("localhost") || domain.includes("127.0.0.1")) {
          errors.push(`Forbidden domain: ${domain}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate AST result against contract
   */
  static validateAST(
    astResult: ASTRiskResult,
    contract: SandboxContract
  ): { valid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Check WebAssembly
    if (contract.forbidWebAssembly && astResult.hasWebAssembly) {
      violations.push("WebAssembly is forbidden by contract");
    }

    // Check prototype access
    if (contract.forbidProtoAccess && astResult.hasProtoAccess) {
      violations.push("Prototype access is forbidden by contract");
    }

    // Check obfuscation
    if (astResult.hasObfuscation) {
      violations.push("Code obfuscation detected");
    }

    // Check microtask loops
    if (astResult.hasMicrotaskLoop) {
      violations.push("Microtask starvation pattern detected");
    }

    // Check memory estimate
    if (contract.maxMemoryMB && astResult.estimatedMemoryMB > contract.maxMemoryMB) {
      violations.push(`Estimated memory (${astResult.estimatedMemoryMB}MB) exceeds limit (${contract.maxMemoryMB}MB)`);
    }

    return {
      valid: violations.length === 0,
      violations,
    };
  }
}

export const contractEnforcer = ContractEnforcer;

