/**
 * 🔗 Unified Execution Pipeline v1.0
 * 
 * Single source of truth for ALL execution:
 * - Identity verification (v4-D)
 * - Zone enforcement (v4-C)
 * - AI Firewall (v4-A)
 * - Watchdog metrics (v4-B)
 * - DriftShield (v3)
 * - Provenance logging
 * 
 * @version 1.0.0
 */

import { MCPVerifier, type MCPVerificationRequest } from "../auth/mcp-verifier";
import { IdentityChainManager, type IdentityChain } from "../auth/identity-chain";
import { ExecutionTokenManager, type ExecutionToken } from "../auth/execution-token";
import { ProvenanceTrail } from "../auth/provenance-trail";
import { ZoneManager } from "../isolation/zone-manager";
import { ZoneRateLimiter } from "../isolation/zone-rate-limiter";
import { ZoneExecutor } from "../isolation/zone-executor";
import { AIFirewallV2 } from "./ai-firewall-v2";
import { HealthBaselineModel } from "../watchdog/health-baseline";
import { WatchdogDaemon } from "../watchdog/watchdog-daemon";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface PipelineRequest {
  code: string;
  context: string;
  tenantId: string;
  userId: string;
  mcpId?: string;
  engineId?: string;
  manifest?: any;
  manifestFingerprint?: string;
  timeout?: number;
  skipFirewall?: boolean; // For trusted internal calls only
}

export interface PipelineResult {
  success: boolean;
  result?: any;
  error?: string;
  metrics: {
    totalDurationMs: number;
    verificationMs: number;
    executionMs: number;
  };
  audit: {
    chainId: string;
    zoneId: string;
    provenanceId?: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Unified Execution Pipeline
// ═══════════════════════════════════════════════════════════

export class UnifiedExecutionPipeline {
  private static executionCount = 0;

  /**
   * Run code through the full hardening pipeline
   */
  static async run(request: PipelineRequest): Promise<PipelineResult> {
    const startTime = performance.now();
    let verificationEndTime = startTime;
    this.executionCount++;

    // Record request start for watchdog
    HealthBaselineModel.recordRequestStart();

    // Create identity chain
    const chain = IdentityChainManager.create({
      userId: request.userId,
      tenantId: request.tenantId,
      mcpId: request.mcpId || "direct",
      engineId: request.engineId || "sandbox",
      manifestFingerprint: request.manifestFingerprint || "none",
    });

    // Get or create zone
    const zone = ZoneManager.ensureZone(request.tenantId);

    try {
      // ═══════════════════════════════════════════════════════
      // STAGE 1: Identity & Zone Verification
      // ═══════════════════════════════════════════════════════

      // Check zone status
      if (zone.status !== "active") {
        throw new Error(`Zone is ${zone.status} for tenant ${request.tenantId}`);
      }

      // Check rate limits
      const rateCheck = ZoneRateLimiter.checkRequest(zone.id);
      if (!rateCheck.allowed) {
        throw new Error(rateCheck.reason || "Rate limit exceeded");
      }

      // Full MCP verification if manifest provided
      if (request.manifest && request.manifestFingerprint) {
        const token = ExecutionTokenManager.issue(chain, ["execute"]);
        
        MCPVerifier.verifyOrThrow({
          manifest: request.manifest,
          expectedFingerprint: request.manifestFingerprint,
          chain,
          token,
          expectedTenant: request.tenantId,
          requiredScopes: ["execute"],
        });
      }

      verificationEndTime = performance.now();

      // ═══════════════════════════════════════════════════════
      // STAGE 2: AI Firewall Check
      // ═══════════════════════════════════════════════════════

      if (!request.skipFirewall) {
        await AIFirewallV2.enforce(request.code, request.context);
      }

      // ═══════════════════════════════════════════════════════
      // STAGE 3: Zone-Isolated Execution
      // ═══════════════════════════════════════════════════════

      ZoneRateLimiter.recordRequest(zone.id);
      ZoneRateLimiter.recordExecutionStart(zone.id);

      const executionStart = performance.now();

      const execResult = await ZoneExecutor.execute({
        tenantId: request.tenantId,
        code: request.code,
        context: request.context,
        engineId: request.engineId,
        mcpId: request.mcpId,
        timeout: request.timeout,
      });

      const executionEnd = performance.now();

      // ═══════════════════════════════════════════════════════
      // STAGE 4: Record Success & Metrics
      // ═══════════════════════════════════════════════════════

      const totalDuration = performance.now() - startTime;

      // Record for watchdog
      HealthBaselineModel.recordRequestEnd(totalDuration, !execResult.success);

      // Record provenance
      const provenance = ProvenanceTrail.record(
        chain,
        "pipeline.execute",
        execResult.success ? "success" : "failure",
        execResult.error
      );

      // Emit success event
      eventBus.publish({
        type: "pipeline.execution.complete",
        tenantId: request.tenantId,
        context: request.context,
        success: execResult.success,
        durationMs: totalDuration,
        timestamp: new Date().toISOString(),
      } as any);

      return {
        success: execResult.success,
        result: execResult.result,
        error: execResult.error,
        metrics: {
          totalDurationMs: totalDuration,
          verificationMs: verificationEndTime - startTime,
          executionMs: executionEnd - executionStart,
        },
        audit: {
          chainId: chain.chainId,
          zoneId: zone.id,
          provenanceId: provenance.id,
        },
      };

    } catch (error: any) {
      const totalDuration = performance.now() - startTime;

      // Record failure
      HealthBaselineModel.recordRequestEnd(totalDuration, true);

      // Record provenance
      const provenance = ProvenanceTrail.record(
        chain,
        "pipeline.execute",
        "blocked",
        error.message
      );

      // Emit failure event
      eventBus.publish({
        type: "pipeline.execution.blocked",
        tenantId: request.tenantId,
        context: request.context,
        error: error.message,
        timestamp: new Date().toISOString(),
      } as any);

      return {
        success: false,
        error: error.message,
        metrics: {
          totalDurationMs: totalDuration,
          verificationMs: verificationEndTime - startTime,
          executionMs: 0,
        },
        audit: {
          chainId: chain.chainId,
          zoneId: zone.id,
          provenanceId: provenance.id,
        },
      };

    } finally {
      ZoneRateLimiter.recordExecutionEnd(zone.id);
    }
  }

  /**
   * Quick execution for trusted internal calls
   */
  static async runTrusted(
    code: string,
    tenantId: string,
    context: string = "internal"
  ): Promise<PipelineResult> {
    return this.run({
      code,
      context,
      tenantId,
      userId: "system",
      skipFirewall: true,
    });
  }

  /**
   * Get execution statistics
   */
  static getStats(): { totalExecutions: number; watchdogStatus: any } {
    return {
      totalExecutions: this.executionCount,
      watchdogStatus: WatchdogDaemon.getStatus(),
    };
  }
}

export const unifiedExecutionPipeline = UnifiedExecutionPipeline;

