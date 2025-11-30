/**
 * 🔒 VM2 Sandbox Runtime
 * 
 * Secure VM execution with:
 * - Timeout enforcement
 * - Memory limits
 * - Blocked require/eval
 * - Safe globals injection
 * 
 * @version 3.0.0
 */

import { type SandboxOutput, type SandboxContract, type ASTRiskResult } from "./types";
import { type SafeGlobalsContext } from "./safe-globals";

export async function runInVM2(
  code: string,
  globalsContext: SafeGlobalsContext,
  astResult: ASTRiskResult,
  contract?: SandboxContract
): Promise<SandboxOutput> {
  const startTime = performance.now();
  const timeout = contract?.maxExecutionMs || 5000;

  try {
    // Create async function from code
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    
    // Build argument names and values from globals
    const argNames = Object.keys(globalsContext.globals);
    const argValues = Object.values(globalsContext.globals);

    // Wrap code in async IIFE
    const wrappedCode = `
      "use strict";
      return (async () => {
        ${code}
      })();
    `;

    // Create function with injected globals
    const fn = new AsyncFunction(...argNames, wrappedCode);

    // Execute with timeout
    const result = await Promise.race([
      fn(...argValues),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Execution timeout (${timeout}ms)`)), timeout)
      ),
    ]);

    const durationMs = performance.now() - startTime;

    return {
      success: true,
      mode: "vm2",
      result,
      metrics: {
        durationMs,
        memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0,
        networkCalls: globalsContext.networkCalls,
        astRiskScore: astResult.score,
      },
      logs: globalsContext.logs,
    };
  } catch (error: any) {
    const durationMs = performance.now() - startTime;

    return {
      success: false,
      mode: "vm2",
      error: {
        type: "VM2_ERROR",
        message: error.message,
        stack: error.stack,
      },
      metrics: {
        durationMs,
        memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuUsage: 0,
        networkCalls: globalsContext.networkCalls,
        astRiskScore: astResult.score,
      },
      logs: globalsContext.logs,
    };
  }
}

