/**
 * 🧠 AI-BOS Sandbox Runtime v3.1
 * 
 * Unified runtime controlling:
 * - VM2 sandbox
 * - Worker thread isolation
 * - **Hardened worker (real process isolation)**
 * - WASM compute engine
 * - Isolated mode (max security)
 * - AST risk scoring
 * - Contract-aware capability enforcement
 * - **Per-tenant resource governor**
 * - **Manifest enforcement**
 * - **Health tracking for Resilience Engine**
 * - Kernel telemetry
 * 
 * @version 3.1.0
 */

import { eventBus } from "../events/event-bus";
import { ASTScanner } from "./ast-scanner";
import { buildSafeGlobals } from "./safe-globals";
import { ModeSelector } from "./mode-selector";
import { ContractEnforcer } from "./contract-enforcer";
import { resourceGovernor } from "./resource-governor";
import { sandboxHealthTracker } from "./sandbox-health-tracker";
import { runInVM2 } from "./runtime-vm2";
import { runInWorker } from "./runtime-worker";
import { runInHardenedWorker } from "./runtime-hardened-worker";
import { runInIsolated } from "./runtime-isolated";
import { runInWasm } from "./runtime-wasm";
import {
  type SandboxExecutionOptions,
  type SandboxOutput,
  type SandboxMode,
} from "./types";

// ═══════════════════════════════════════════════════════════
// Main Runtime
// ═══════════════════════════════════════════════════════════

export class SandboxRuntime {
  /**
   * Execute code in sandbox
   */
  static async execute(options: SandboxExecutionOptions): Promise<SandboxOutput> {
    const startTime = performance.now();

    // 0. Check resource governor
    const governorDecision = resourceGovernor.checkExecution(options.tenantId);
    if (!governorDecision.allowed) {
      return this.rejectExecution(
        options,
        { score: 0, issues: [], complexity: 0, hasAsyncCode: false, hasNetworkCalls: false, estimatedMemoryMB: 0, hasMicrotaskLoop: false, hasObfuscation: false, hasProtoAccess: false, hasWebAssembly: false },
        `Resource limit: ${governorDecision.reason}`,
        true // governorThrottled
      );
    }

    // Record execution start
    resourceGovernor.startExecution(options.tenantId);

    try {
      // 1. AST Analysis → Risk Score (unless skipped)
      const astResult = options.skipASTAnalysis
        ? { score: 0, issues: [], complexity: 0, hasAsyncCode: false, hasNetworkCalls: false, estimatedMemoryMB: 0, hasMicrotaskLoop: false, hasObfuscation: false, hasProtoAccess: false, hasWebAssembly: false }
        : ASTScanner.analyze(options.code);

      // 2. Check if code is too risky
      if (astResult.score >= 90) {
        const output = this.rejectExecution(options, astResult, "Code risk score too high");
        sandboxHealthTracker.record(options.tenantId, output, options.adapterId);
        return output;
      }

      // 2.5. Validate AST against contract
      if (options.contract) {
        const astValidation = ContractEnforcer.validateAST(astResult, options.contract);
        if (!astValidation.valid) {
          const output = this.rejectExecution(options, astResult, `Contract violation: ${astValidation.violations.join(", ")}`);
          sandboxHealthTracker.record(options.tenantId, output, options.adapterId);
          return output;
        }
      }

      // 3. Select execution mode
      const modeSelection = ModeSelector.select({
        astResult,
        code: options.code,
        contract: options.contract,
      });

      // 3.5. Force hardened-worker for high-risk code
      let effectiveMode = modeSelection.mode;
      if (astResult.score >= 50 || astResult.hasMicrotaskLoop || astResult.hasObfuscation) {
        effectiveMode = "hardened-worker";
      }

      // 4. Build safe globals
      const globalsContext = buildSafeGlobals(options.tenantId, options.contract);

      // Merge user context
      if (options.context) {
        Object.assign(globalsContext.globals, options.context);
      }

      // 5. Execute in selected runtime
      let output: SandboxOutput;

      switch (effectiveMode) {
        case "vm2":
          output = await runInVM2(options.code, globalsContext, astResult, options.contract);
          break;
        case "worker":
          output = await runInWorker(options.code, globalsContext, astResult, options.contract);
          break;
        case "hardened-worker":
          output = await runInHardenedWorker(options.code, globalsContext, astResult, options.contract);
          break;
        case "isolated":
          output = await runInIsolated(options.code, globalsContext, astResult);
          break;
        case "wasm":
          output = await runInWasm(options.code, globalsContext, astResult);
          break;
        default:
          output = await runInHardenedWorker(options.code, globalsContext, astResult, options.contract);
      }

      // 6. Update metrics
      output.metrics.durationMs = performance.now() - startTime;
      output.metrics.astRiskScore = astResult.score;
      output.metrics.logCount = globalsContext.logs.length;
      output.metrics.governorThrottled = false;

      // 7. Record to health tracker
      sandboxHealthTracker.record(options.tenantId, output, options.adapterId);

      // 8. Emit telemetry
      await this.emitTelemetry(options, output, effectiveMode, modeSelection.reason);

      return output;
    } finally {
      // Record execution end
      const durationMs = performance.now() - startTime;
      resourceGovernor.endExecution(options.tenantId, {
        cpuMs: durationMs,
        memoryMB: 0, // Measured inside runtime
        networkCalls: 0, // Measured inside runtime
      });
    }
  }

  /**
   * Quick check if code is safe
   */
  static analyzeRisk(code: string) {
    return ASTScanner.analyze(code);
  }

  /**
   * Check if code can use fast path
   */
  static canUseFastPath(code: string): boolean {
    return ASTScanner.isSafeForFastPath(code);
  }

  /**
   * Reject execution for high-risk code
   */
  private static rejectExecution(
    options: SandboxExecutionOptions,
    astResult: ReturnType<typeof ASTScanner.analyze>,
    reason: string,
    governorThrottled = false
  ): SandboxOutput {
    return {
      success: false,
      mode: "isolated",
      error: {
        type: governorThrottled ? "THROTTLED" : "REJECTED",
        message: reason,
        code: governorThrottled ? "GOVERNOR_THROTTLED" : "HIGH_RISK_CODE",
      },
      metrics: {
        durationMs: 0,
        memoryUsedMB: 0,
        cpuUsage: 0,
        networkCalls: 0,
        astRiskScore: astResult.score,
        logCount: 0,
        governorThrottled,
      },
      logs: [
        {
          level: "error",
          message: `Execution rejected: ${reason}. Issues: ${astResult.issues.map(i => i.message).join(", ")}`,
          timestamp: new Date().toISOString(),
        },
      ],
    };
  }

  /**
   * Get tenant health stats
   */
  static getHealthStats(tenantId: string) {
    return sandboxHealthTracker.getStats(tenantId);
  }

  /**
   * Check if tenant is healthy
   */
  static isTenantHealthy(tenantId: string): boolean {
    return sandboxHealthTracker.isHealthy(tenantId);
  }

  /**
   * Get resource governor stats
   */
  static getGovernorStats(tenantId: string) {
    return resourceGovernor.getStats(tenantId);
  }

  /**
   * Initialize tenant with tier
   */
  static initTenant(tenantId: string, tier: "free" | "pro" | "enterprise" | "kernel") {
    resourceGovernor.initTenant(tenantId, tier);
  }

  /**
   * Emit telemetry event
   */
  private static async emitTelemetry(
    options: SandboxExecutionOptions,
    output: SandboxOutput,
    mode: SandboxMode,
    modeReason: string
  ): Promise<void> {
    await eventBus.publish({
      type: "sandbox.executed",
      tenantId: options.tenantId,
      adapterId: options.adapterId,
      engineId: options.engineId,
      mode,
      modeReason,
      success: output.success,
      riskScore: output.metrics.astRiskScore,
      durationMs: output.metrics.durationMs,
      networkCalls: output.metrics.networkCalls,
      errorType: output.error?.type,
      timestamp: new Date().toISOString(),
    } as any);
  }
}

export const sandboxRuntime = SandboxRuntime;

