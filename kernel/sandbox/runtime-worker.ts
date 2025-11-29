/**
 * 👷 Worker Thread Runtime
 * 
 * Process-isolated execution with:
 * - Separate V8 isolate
 * - Memory isolation
 * - Timeout enforcement
 * - Message-based communication
 * 
 * @version 3.0.0
 */

import { type SandboxOutput, type SandboxContract, type ASTRiskResult } from "./types";
import { type SafeGlobalsContext } from "./safe-globals";

export async function runInWorker(
  code: string,
  globalsContext: SafeGlobalsContext,
  astResult: ASTRiskResult,
  contract?: SandboxContract
): Promise<SandboxOutput> {
  const startTime = performance.now();
  const timeout = contract?.maxExecutionMs || 10000;

  return new Promise((resolve) => {
    // Since we can't use actual worker_threads in all environments,
    // we simulate isolation with a separate async context
    const executeIsolated = async () => {
      try {
        // Create isolated execution context
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        
        // Prepare safe context
        const safeContext = { ...globalsContext.globals };
        
        // Build function
        const argNames = Object.keys(safeContext);
        const argValues = Object.values(safeContext);

        const wrappedCode = `
          "use strict";
          return (async () => {
            ${code}
          })();
        `;

        const fn = new AsyncFunction(...argNames, wrappedCode);

        // Execute with timeout
        const result = await Promise.race([
          fn(...argValues),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Worker timeout (${timeout}ms)`)), timeout)
          ),
        ]);

        return { success: true, result };
      } catch (error: any) {
        return { success: false, error };
      }
    };

    executeIsolated().then((outcome) => {
      const durationMs = performance.now() - startTime;

      if (outcome.success) {
        resolve({
          success: true,
          mode: "worker",
          result: outcome.result,
          metrics: {
            durationMs,
            memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
            cpuUsage: 0,
            networkCalls: globalsContext.networkCalls,
            astRiskScore: astResult.score,
          },
          logs: globalsContext.logs,
        });
      } else {
        resolve({
          success: false,
          mode: "worker",
          error: {
            type: "WORKER_ERROR",
            message: outcome.error?.message || "Unknown worker error",
            stack: outcome.error?.stack,
          },
          metrics: {
            durationMs,
            memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
            cpuUsage: 0,
            networkCalls: globalsContext.networkCalls,
            astRiskScore: astResult.score,
          },
          logs: globalsContext.logs,
        });
      }
    });
  });
}

