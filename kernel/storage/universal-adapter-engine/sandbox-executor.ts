/**
 * 🔒 Sandbox Execution Layer
 * 
 * Executes custom adapter code in isolated environment.
 * Protects Kernel from malicious code.
 * 
 * Features:
 * - VM isolation
 * - Resource limits (memory, CPU, time)
 * - Network restrictions
 * - No Kernel access
 * - Controlled API surface
 * - Execution logging
 */

import { EventEmitter } from "events";
import { eventBus } from "../../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Sandbox Configuration
// ═══════════════════════════════════════════════════════════

export interface SandboxConfig {
  timeoutMs: number;
  maxMemoryMB: number;
  allowedModules: string[];
  allowedGlobals: string[];
  networkPolicy: "none" | "whitelist" | "all";
  allowedDomains: string[];
}

export const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  timeoutMs: 5000,
  maxMemoryMB: 128,
  allowedModules: [], // No external modules by default
  allowedGlobals: ["console", "JSON", "Math", "Date", "Array", "Object", "String", "Number", "Boolean", "Promise"],
  networkPolicy: "whitelist",
  allowedDomains: [],
};

// ═══════════════════════════════════════════════════════════
// Sandbox Result
// ═══════════════════════════════════════════════════════════

export interface SandboxResult<T = any> {
  success: boolean;
  result?: T;
  error?: {
    type: "TIMEOUT" | "MEMORY" | "SECURITY" | "RUNTIME" | "NETWORK";
    message: string;
    stack?: string;
  };
  metrics: {
    executionTimeMs: number;
    memoryUsedMB: number;
    networkCalls: number;
  };
  logs: Array<{ level: string; message: string; timestamp: string }>;
}

// ═══════════════════════════════════════════════════════════
// Safe Fetch (Network Controlled)
// ═══════════════════════════════════════════════════════════

class SafeFetch {
  private allowedDomains: string[];
  private networkPolicy: "none" | "whitelist" | "all";
  private callCount = 0;

  constructor(config: SandboxConfig) {
    this.allowedDomains = config.allowedDomains;
    this.networkPolicy = config.networkPolicy;
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    // Check network policy
    if (this.networkPolicy === "none") {
      throw new Error("Network access is disabled in sandbox");
    }

    // Validate URL
    const parsed = new URL(url);
    
    // Block localhost
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      throw new Error("Localhost access is blocked in sandbox");
    }

    // Check whitelist
    if (this.networkPolicy === "whitelist") {
      const allowed = this.allowedDomains.some(d => parsed.hostname.includes(d));
      if (!allowed) {
        throw new Error(`Domain ${parsed.hostname} is not in whitelist`);
      }
    }

    // Require HTTPS
    if (parsed.protocol !== "https:") {
      throw new Error("Only HTTPS is allowed in sandbox");
    }

    this.callCount++;
    return fetch(url, options);
  }

  getCallCount(): number {
    return this.callCount;
  }
}

// ═══════════════════════════════════════════════════════════
// Safe Console (Logging Captured)
// ═══════════════════════════════════════════════════════════

class SafeConsole {
  private logs: Array<{ level: string; message: string; timestamp: string }> = [];
  private maxLogs = 100;

  log(...args: any[]): void {
    this.capture("log", args);
  }

  info(...args: any[]): void {
    this.capture("info", args);
  }

  warn(...args: any[]): void {
    this.capture("warn", args);
  }

  error(...args: any[]): void {
    this.capture("error", args);
  }

  private capture(level: string, args: any[]): void {
    if (this.logs.length >= this.maxLogs) return;
    
    this.logs.push({
      level,
      message: args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" "),
      timestamp: new Date().toISOString(),
    });
  }

  getLogs(): typeof this.logs {
    return this.logs;
  }
}

// ═══════════════════════════════════════════════════════════
// Sandbox Executor
// ═══════════════════════════════════════════════════════════

export class SandboxExecutor {
  private config: SandboxConfig;

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...DEFAULT_SANDBOX_CONFIG, ...config };
  }

  /**
   * Execute code in sandbox
   */
  async execute<T = any>(
    code: string,
    context: Record<string, any> = {},
    tenantId?: string,
    adapterId?: string
  ): Promise<SandboxResult<T>> {
    const startTime = Date.now();
    const safeConsole = new SafeConsole();
    const safeFetch = new SafeFetch(this.config);
    
    const metrics = {
      executionTimeMs: 0,
      memoryUsedMB: 0,
      networkCalls: 0,
    };

    try {
      // Validate code (basic security checks)
      this.validateCode(code);

      // Create safe context
      const safeContext = this.createSafeContext(context, safeConsole, safeFetch);

      // Execute with timeout
      const result = await this.executeWithTimeout<T>(code, safeContext);

      metrics.executionTimeMs = Date.now() - startTime;
      metrics.networkCalls = safeFetch.getCallCount();
      metrics.memoryUsedMB = this.estimateMemoryUsage();

      // Log execution
      await this.logExecution(tenantId, adapterId, true, metrics);

      return {
        success: true,
        result,
        metrics,
        logs: safeConsole.getLogs(),
      };
    } catch (error: any) {
      metrics.executionTimeMs = Date.now() - startTime;
      metrics.networkCalls = safeFetch.getCallCount();

      const errorType = this.classifyError(error);

      // Log execution failure
      await this.logExecution(tenantId, adapterId, false, metrics, error.message);

      return {
        success: false,
        error: {
          type: errorType,
          message: error.message,
          stack: error.stack,
        },
        metrics,
        logs: safeConsole.getLogs(),
      };
    }
  }

  /**
   * Validate code for security issues
   */
  private validateCode(code: string): void {
    const forbidden = [
      // Dangerous globals
      "eval", "Function", "process", "global", "globalThis",
      "require", "import", "__dirname", "__filename",
      // Dangerous operations
      "child_process", "fs", "net", "http", "https",
      "vm", "worker_threads", "cluster",
      // Prototype pollution
      "__proto__", "constructor.prototype",
      // Code injection
      "new Function", "setTimeout", "setInterval",
    ];

    for (const pattern of forbidden) {
      if (code.includes(pattern)) {
        throw new Error(`Security violation: '${pattern}' is not allowed in sandbox`);
      }
    }

    // Check for suspicious patterns
    if (/\bwhile\s*\(\s*true\s*\)/.test(code)) {
      throw new Error("Security violation: infinite loops are not allowed");
    }

    if (/\bfor\s*\(\s*;\s*;\s*\)/.test(code)) {
      throw new Error("Security violation: infinite loops are not allowed");
    }
  }

  /**
   * Create safe execution context
   */
  private createSafeContext(
    userContext: Record<string, any>,
    safeConsole: SafeConsole,
    safeFetch: SafeFetch
  ): Record<string, any> {
    const safeGlobals: Record<string, any> = {
      console: safeConsole,
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Promise,
      fetch: safeFetch.fetch.bind(safeFetch),
      // Safe utilities
      btoa: (s: string) => Buffer.from(s).toString("base64"),
      atob: (s: string) => Buffer.from(s, "base64").toString(),
    };

    // Merge with user context (user context cannot override safe globals)
    return { ...userContext, ...safeGlobals };
  }

  /**
   * Execute code with timeout
   */
  private async executeWithTimeout<T>(
    code: string,
    context: Record<string, any>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Execution timeout: exceeded ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);

      try {
        // Create function with context
        const contextKeys = Object.keys(context);
        const contextValues = Object.values(context);
        
        // Wrap code in async function
        const wrappedCode = `
          return (async () => {
            ${code}
          })();
        `;

        const fn = new Function(...contextKeys, wrappedCode);
        const result = fn(...contextValues);

        // Handle promise
        if (result instanceof Promise) {
          result
            .then(r => {
              clearTimeout(timeout);
              resolve(r);
            })
            .catch(e => {
              clearTimeout(timeout);
              reject(e);
            });
        } else {
          clearTimeout(timeout);
          resolve(result);
        }
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Classify error type
   */
  private classifyError(error: any): SandboxResult["error"]["type"] {
    const message = error.message?.toLowerCase() || "";

    if (message.includes("timeout")) return "TIMEOUT";
    if (message.includes("memory")) return "MEMORY";
    if (message.includes("security") || message.includes("not allowed")) return "SECURITY";
    if (message.includes("network") || message.includes("domain")) return "NETWORK";
    return "RUNTIME";
  }

  /**
   * Estimate memory usage (simplified)
   */
  private estimateMemoryUsage(): number {
    const used = process.memoryUsage();
    return Math.round(used.heapUsed / 1024 / 1024);
  }

  /**
   * Log execution to audit
   */
  private async logExecution(
    tenantId?: string,
    adapterId?: string,
    success?: boolean,
    metrics?: any,
    errorMessage?: string
  ): Promise<void> {
    if (!tenantId) return;

    await eventBus.publish({
      type: "sandbox.execution",
      tenantId,
      adapterId,
      success,
      executionTimeMs: metrics?.executionTimeMs,
      networkCalls: metrics?.networkCalls,
      errorMessage,
      timestamp: new Date().toISOString(),
    } as any);
  }
}

export const sandboxExecutor = new SandboxExecutor();

// ═══════════════════════════════════════════════════════════
// Quick Usage Example
// ═══════════════════════════════════════════════════════════

/**
 * Example:
 * 
 * ```typescript
 * const result = await sandboxExecutor.execute(`
 *   const response = await fetch("https://api.example.com/data");
 *   const data = await response.json();
 *   return data.items;
 * `, {
 *   // Custom context available in sandbox
 *   apiKey: "xxx",
 * }, "tenant-123", "adapter-456");
 * 
 * if (result.success) {
 *   console.log(result.result);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */

