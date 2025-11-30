/**
 * 🔗 MCP Engine Bridge v3.0
 * 
 * Connects MCP engines to Sandbox Runtime:
 * - Auto-sandbox all engine actions
 * - Contract inheritance
 * - Tenant isolation
 * - Telemetry forwarding
 * 
 * @version 3.0.0
 */

import { SandboxRuntime } from "./sandbox-runtime";
import { ContractEnforcer } from "./contract-enforcer";
import { SandboxTelemetry } from "./telemetry";
import { SandboxErrorMapper } from "./error-mapper";
import { eventBus } from "../events/event-bus";
import { type SandboxOutput, type SandboxContract } from "./types";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface MCPEngine {
  id: string;
  name: string;
  version: string;
  actions: Record<string, MCPAction>;
  defaultContract?: SandboxContract;
}

export interface MCPAction {
  name: string;
  code: string;
  contract?: SandboxContract;
  inputSchema?: any;
  outputSchema?: any;
}

export interface MCPExecutionOptions {
  tenantId: string;
  engineId: string;
  actionName: string;
  input?: Record<string, any>;
  contractOverride?: Partial<SandboxContract>;
}

export interface MCPExecutionResult {
  success: boolean;
  output?: any;
  error?: {
    type: string;
    message: string;
    suggestedAction?: string;
  };
  metrics: {
    durationMs: number;
    riskScore: number;
    mode: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Engine Registry
// ═══════════════════════════════════════════════════════════

class MCPEngineRegistry {
  private engines: Map<string, MCPEngine> = new Map();

  /**
   * Register an MCP engine
   */
  register(engine: MCPEngine): void {
    this.engines.set(engine.id, engine);
  }

  /**
   * Get engine by ID
   */
  get(engineId: string): MCPEngine | undefined {
    return this.engines.get(engineId);
  }

  /**
   * List all engines
   */
  list(): MCPEngine[] {
    return Array.from(this.engines.values());
  }

  /**
   * Unregister engine
   */
  unregister(engineId: string): void {
    this.engines.delete(engineId);
  }
}

export const mcpEngineRegistry = new MCPEngineRegistry();

// ═══════════════════════════════════════════════════════════
// MCP Bridge
// ═══════════════════════════════════════════════════════════

export class MCPBridge {
  /**
   * Execute MCP action in sandbox
   */
  static async execute(options: MCPExecutionOptions): Promise<MCPExecutionResult> {
    const startTime = performance.now();

    // Get engine
    const engine = mcpEngineRegistry.get(options.engineId);
    if (!engine) {
      return {
        success: false,
        error: {
          type: "ENGINE_NOT_FOUND",
          message: `Engine '${options.engineId}' not found`,
        },
        metrics: { durationMs: 0, riskScore: 0, mode: "none" },
      };
    }

    // Get action
    const action = engine.actions[options.actionName];
    if (!action) {
      return {
        success: false,
        error: {
          type: "ACTION_NOT_FOUND",
          message: `Action '${options.actionName}' not found in engine '${options.engineId}'`,
        },
        metrics: { durationMs: 0, riskScore: 0, mode: "none" },
      };
    }

    // Merge contracts: default → action → override
    const contract = ContractEnforcer.mergeContract({
      ...engine.defaultContract,
      ...action.contract,
      ...options.contractOverride,
    });

    // Execute in sandbox
    const sandboxResult = await SandboxRuntime.execute({
      tenantId: options.tenantId,
      adapterId: options.actionName,
      engineId: options.engineId,
      code: action.code,
      context: options.input,
      contract,
    });

    // Record telemetry
    await SandboxTelemetry.record(options.tenantId, sandboxResult, {
      adapterId: options.actionName,
      engineId: options.engineId,
    });

    // Map result
    const result = this.mapResult(sandboxResult, startTime);

    // Emit event
    await eventBus.publish({
      type: "mcp.action.executed",
      tenantId: options.tenantId,
      engineId: options.engineId,
      actionName: options.actionName,
      success: result.success,
      durationMs: result.metrics.durationMs,
      timestamp: new Date().toISOString(),
    } as any);

    return result;
  }

  /**
   * Execute action with automatic retry
   */
  static async executeWithRetry(
    options: MCPExecutionOptions,
    maxRetries = 3
  ): Promise<MCPExecutionResult> {
    let lastResult: MCPExecutionResult | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.execute(options);
      lastResult = result;

      if (result.success) {
        return result;
      }

      // Check if retryable
      if (result.error) {
        const mapped = SandboxErrorMapper.map({
          type: result.error.type,
          message: result.error.message,
        });

        if (!mapped.retryable) {
          return result;
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 100));
      }
    }

    return lastResult!;
  }

  /**
   * Batch execute multiple actions
   */
  static async executeBatch(
    options: MCPExecutionOptions[]
  ): Promise<MCPExecutionResult[]> {
    return Promise.all(options.map(opt => this.execute(opt)));
  }

  /**
   * Map sandbox result to MCP result
   */
  private static mapResult(
    sandboxResult: SandboxOutput,
    startTime: number
  ): MCPExecutionResult {
    if (sandboxResult.success) {
      return {
        success: true,
        output: sandboxResult.result,
        metrics: {
          durationMs: performance.now() - startTime,
          riskScore: sandboxResult.metrics.astRiskScore,
          mode: sandboxResult.mode,
        },
      };
    }

    const mappedError = sandboxResult.error
      ? SandboxErrorMapper.map(sandboxResult.error, sandboxResult.metrics)
      : null;

    return {
      success: false,
      error: mappedError
        ? {
            type: mappedError.type,
            message: mappedError.message,
            suggestedAction: mappedError.suggestedAction,
          }
        : {
            type: "UNKNOWN_ERROR",
            message: "Unknown error occurred",
          },
      metrics: {
        durationMs: performance.now() - startTime,
        riskScore: sandboxResult.metrics.astRiskScore,
        mode: sandboxResult.mode,
      },
    };
  }

  /**
   * Validate action code before registration
   */
  static validateAction(action: MCPAction): { valid: boolean; issues: string[] } {
    const riskResult = SandboxRuntime.analyzeRisk(action.code);
    const issues: string[] = [];

    if (riskResult.score >= 70) {
      issues.push(`High risk score: ${riskResult.score}`);
    }

    for (const issue of riskResult.issues) {
      if (issue.severity === "critical") {
        issues.push(`Critical: ${issue.message}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

export const mcpBridge = MCPBridge;

