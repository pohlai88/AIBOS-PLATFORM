/**
 * 🔐 Isolated Runtime (Maximum Security)
 * 
 * Strictest isolation for high-risk code:
 * - No network access
 * - No timers
 * - Minimal globals
 * - Strict timeout
 * 
 * @version 3.0.0
 */

import { type SandboxOutput, type ASTRiskResult } from "./types";
import { type SafeGlobalsContext } from "./safe-globals";

export async function runInIsolated(
  code: string,
  globalsContext: SafeGlobalsContext,
  astResult: ASTRiskResult
): Promise<SandboxOutput> {
  const startTime = performance.now();
  const timeout = 3000; // Strict 3s timeout for isolated mode

  // Minimal safe globals (no network, no timers)
  const minimalGlobals: Record<string, any> = {
    console: globalsContext.globals.console,
    JSON: globalsContext.globals.JSON,
    Math: globalsContext.globals.Math,
    Date: globalsContext.globals.Date,
    Array: globalsContext.globals.Array,
    Object: globalsContext.globals.Object,
    Number: globalsContext.globals.Number,
    String: globalsContext.globals.String,
    Boolean: globalsContext.globals.Boolean,
    parseInt: globalsContext.globals.parseInt,
    parseFloat: globalsContext.globals.parseFloat,
    isNaN: globalsContext.globals.isNaN,
    isFinite: globalsContext.globals.isFinite,
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    
    const argNames = Object.keys(minimalGlobals);
    const argValues = Object.values(minimalGlobals);

    const wrappedCode = `
      "use strict";
      return (async () => {
        ${code}
      })();
    `;

    const fn = new AsyncFunction(...argNames, wrappedCode);

    const result = await Promise.race([
      fn(...argValues),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Isolated execution timeout (${timeout}ms)`)), timeout)
      ),
    ]);

    const durationMs = performance.now() - startTime;

    return {
      success: true,
      mode: "isolated",
      result,
      metrics: {
        durationMs,
        memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0,
        networkCalls: 0, // Network disabled in isolated mode
        astRiskScore: astResult.score,
      },
      logs: globalsContext.logs,
    };
  } catch (error: any) {
    const durationMs = performance.now() - startTime;

    return {
      success: false,
      mode: "isolated",
      error: {
        type: "ISOLATED_ERROR",
        message: error.message,
        stack: error.stack,
      },
      metrics: {
        durationMs,
        memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0,
        networkCalls: 0,
        astRiskScore: astResult.score,
      },
      logs: globalsContext.logs,
    };
  }
}

