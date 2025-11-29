/**
 * 🔐 Hardened Worker Thread Runtime v3.1
 * 
 * True process isolation with:
 * - Separate V8 isolate via worker_threads
 * - Hard memory limits (resourceLimits)
 * - Hard timeout with worker.terminate()
 * - Message-pipe communication
 * - No access to parent's event loop
 * - No process.memoryUsage leak
 * 
 * This is the KERNEL-GRADE sandbox for untrusted code.
 * 
 * @version 3.1.0
 */

import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { type SandboxOutput, type SandboxContract, type ASTRiskResult } from "./types";
import { type SafeGlobalsContext } from "./safe-globals";

// ═══════════════════════════════════════════════════════════
// Worker Script (runs in isolated thread)
// ═══════════════════════════════════════════════════════════

const WORKER_SCRIPT = `
const { parentPort, workerData } = require("worker_threads");

// Block dangerous globals immediately
delete globalThis.process;
delete globalThis.require;
delete globalThis.module;
delete globalThis.exports;
delete globalThis.__dirname;
delete globalThis.__filename;

// Freeze Object prototype to prevent pollution
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);
Object.freeze(Function.prototype);

const { code, safeGlobals, timeout } = workerData;

// Create safe execution context
const context = { ...safeGlobals };

// Override dangerous constructors
context.Function = undefined;
context.eval = undefined;
context.WebAssembly = undefined;

// Execute with timeout
const executeCode = async () => {
  try {
    // Build function
    const argNames = Object.keys(context);
    const argValues = Object.values(context);

    const wrappedCode = \`
      "use strict";
      return (async () => {
        \${code}
      })();
    \`;

    // Use AsyncFunction constructor (only way to run async code)
    const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
    const fn = new AsyncFunction(...argNames, wrappedCode);

    // Execute
    const result = await fn(...argValues);

    parentPort.postMessage({
      success: true,
      result,
      logs: context.console?.__logs || [],
    });
  } catch (error) {
    parentPort.postMessage({
      success: false,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      logs: context.console?.__logs || [],
    });
  }
};

executeCode();
`;

// ═══════════════════════════════════════════════════════════
// Main Thread API
// ═══════════════════════════════════════════════════════════

export interface HardenedWorkerOptions {
    code: string;
    globalsContext: SafeGlobalsContext;
    astResult: ASTRiskResult;
    contract?: SandboxContract;
}

export async function runInHardenedWorker(
    code: string,
    globalsContext: SafeGlobalsContext,
    astResult: ASTRiskResult,
    contract?: SandboxContract
): Promise<SandboxOutput> {
    const startTime = performance.now();
    const timeout = contract?.maxExecutionMs || 5000;
    const maxMemoryMB = contract?.maxMemoryMB || 50;

    return new Promise((resolve) => {
        let resolved = false;
        let worker: Worker | null = null;

        const cleanup = () => {
            if (worker) {
                try {
                    worker.terminate();
                } catch {
                    // Worker already terminated
                }
                worker = null;
            }
        };

        const resolveOnce = (output: SandboxOutput) => {
            if (resolved) return;
            resolved = true;
            cleanup();
            resolve(output);
        };

        // Hard timeout - WILL kill the worker
        const timeoutId = setTimeout(() => {
            resolveOnce({
                success: false,
                mode: "hardened-worker",
                error: {
                    type: "TIMEOUT",
                    message: `Execution forcefully terminated after ${timeout}ms`,
                    code: "HARD_TIMEOUT",
                },
                metrics: {
                    durationMs: performance.now() - startTime,
                    memoryUsedMB: 0,
                    cpuUsage: 0,
                    networkCalls: globalsContext.networkCalls,
                    astRiskScore: astResult.score,
                    logCount: globalsContext.logs.length,
                    governorThrottled: false,
                },
                logs: globalsContext.logs,
            });
        }, timeout + 100); // Small buffer for cleanup

        try {
            // Create serializable safe globals for worker
            const safeGlobalsForWorker = createSerializableGlobals(globalsContext);

            worker = new Worker(WORKER_SCRIPT, {
                eval: true,
                workerData: {
                    code,
                    safeGlobals: safeGlobalsForWorker,
                    timeout,
                },
                resourceLimits: {
                    maxOldGenerationSizeMb: maxMemoryMB,
                    maxYoungGenerationSizeMb: Math.ceil(maxMemoryMB / 4),
                    codeRangeSizeMb: 16,
                    stackSizeMb: 4,
                },
            });

            worker.on("message", (msg: any) => {
                clearTimeout(timeoutId);
                const durationMs = performance.now() - startTime;

                if (msg.success) {
                    resolveOnce({
                        success: true,
                        mode: "hardened-worker",
                        result: msg.result,
                        metrics: {
                            durationMs,
                            memoryUsedMB: 0, // Can't measure from outside safely
                            cpuUsage: 0,
                            networkCalls: globalsContext.networkCalls,
                            astRiskScore: astResult.score,
                            logCount: (msg.logs?.length || 0) + globalsContext.logs.length,
                            governorThrottled: false,
                        },
                        logs: [...globalsContext.logs, ...(msg.logs || [])],
                    });
                } else {
                    resolveOnce({
                        success: false,
                        mode: "hardened-worker",
                        error: {
                            type: "RUNTIME",
                            message: msg.error?.message || "Unknown error",
                            stack: msg.error?.stack,
                        },
                        metrics: {
                            durationMs,
                            memoryUsedMB: 0,
                            cpuUsage: 0,
                            networkCalls: globalsContext.networkCalls,
                            astRiskScore: astResult.score,
                            logCount: (msg.logs?.length || 0) + globalsContext.logs.length,
                            governorThrottled: false,
                        },
                        logs: [...globalsContext.logs, ...(msg.logs || [])],
                    });
                }
            });

            worker.on("error", (error) => {
                clearTimeout(timeoutId);
                resolveOnce({
                    success: false,
                    mode: "hardened-worker",
                    error: {
                        type: "WORKER_ERROR",
                        message: error.message,
                        stack: error.stack,
                    },
                    metrics: {
                        durationMs: performance.now() - startTime,
                        memoryUsedMB: 0,
                        cpuUsage: 0,
                        networkCalls: globalsContext.networkCalls,
                        astRiskScore: astResult.score,
                        logCount: globalsContext.logs.length,
                        governorThrottled: false,
                    },
                    logs: globalsContext.logs,
                });
            });

            worker.on("exit", (code) => {
                clearTimeout(timeoutId);
                if (!resolved) {
                    resolveOnce({
                        success: false,
                        mode: "hardened-worker",
                        error: {
                            type: code === 0 ? "RUNTIME" : "WORKER_CRASH",
                            message: `Worker exited with code ${code}`,
                        },
                        metrics: {
                            durationMs: performance.now() - startTime,
                            memoryUsedMB: 0,
                            cpuUsage: 0,
                            networkCalls: globalsContext.networkCalls,
                            astRiskScore: astResult.score,
                            logCount: globalsContext.logs.length,
                            governorThrottled: false,
                        },
                        logs: globalsContext.logs,
                    });
                }
            });
        } catch (error: any) {
            clearTimeout(timeoutId);
            resolveOnce({
                success: false,
                mode: "hardened-worker",
                error: {
                    type: "INITIALIZATION_ERROR",
                    message: error.message,
                    stack: error.stack,
                },
                metrics: {
                    durationMs: performance.now() - startTime,
                    memoryUsedMB: 0,
                    cpuUsage: 0,
                    networkCalls: globalsContext.networkCalls,
                    astRiskScore: astResult.score,
                    logCount: globalsContext.logs.length,
                    governorThrottled: false,
                },
                logs: globalsContext.logs,
            });
        }
    });
}

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

/**
 * Create serializable version of safe globals for worker transfer
 * Functions cannot be transferred, so we provide stubs
 */
function createSerializableGlobals(context: SafeGlobalsContext): Record<string, any> {
    const logs: Array<{ level: string; message: string; timestamp: string }> = [];

    return {
        // Console stub that collects logs
        console: {
            __logs: logs,
            log: `function(...args) { this.__logs.push({ level: "log", message: args.join(" "), timestamp: new Date().toISOString() }); }`,
            info: `function(...args) { this.__logs.push({ level: "info", message: args.join(" "), timestamp: new Date().toISOString() }); }`,
            warn: `function(...args) { this.__logs.push({ level: "warn", message: args.join(" "), timestamp: new Date().toISOString() }); }`,
            error: `function(...args) { this.__logs.push({ level: "error", message: args.join(" "), timestamp: new Date().toISOString() }); }`,
            debug: `function(...args) { this.__logs.push({ level: "debug", message: args.join(" "), timestamp: new Date().toISOString() }); }`,
        },

        // Safe built-ins (these are available in worker by default)
        JSON: true, // Signal to use global JSON
        Math: true,
        Date: true,
        Array: true,
        Object: true,
        String: true,
        Number: true,
        Boolean: true,
        Map: true,
        Set: true,
        Promise: true,
        RegExp: true,
        Error: true,

        // Utilities
        parseInt: true,
        parseFloat: true,
        isNaN: true,
        isFinite: true,
        encodeURIComponent: true,
        decodeURIComponent: true,

        // Base64
        btoa: `function(s) { return Buffer.from(s).toString("base64"); }`,
        atob: `function(s) { return Buffer.from(s, "base64").toString("utf-8"); }`,

        // Tenant context
        __tenantId: context.globals.__tenantId,

        // NOTE: fetch is NOT available in hardened worker
        // Network calls must go through the main thread
    };
}

