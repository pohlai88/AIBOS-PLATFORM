/**
 * ⚡ Zone Executor v1.0
 * 
 * Zone-aware code execution:
 * - Isolated execution context
 * - Resource enforcement
 * - Cross-zone protection
 * 
 * @version 1.0.0
 */

import { ZoneManager, type Zone } from "./zone-manager";
import { ZoneRateLimiter } from "./zone-rate-limiter";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ZoneExecutionRequest {
  tenantId: string;
  code: string;
  context: string;
  engineId?: string;
  mcpId?: string;
  timeout?: number;
}

export interface ZoneExecutionResult {
  success: boolean;
  zoneId: string;
  result?: any;
  error?: string;
  metrics: {
    durationMs: number;
    memoryUsedMB: number;
  };
}

// ═══════════════════════════════════════════════════════════
// Zone Executor
// ═══════════════════════════════════════════════════════════

export class ZoneExecutor {
  /**
   * Execute code within a tenant's isolation zone
   */
  static async execute(request: ZoneExecutionRequest): Promise<ZoneExecutionResult> {
    const startTime = Date.now();

    // 1. Get or create zone for tenant
    const zone = ZoneManager.ensureZone(request.tenantId);

    // 2. Check zone status
    if (zone.status !== "active") {
      return {
        success: false,
        zoneId: zone.id,
        error: `Zone is ${zone.status}`,
        metrics: { durationMs: 0, memoryUsedMB: 0 },
      };
    }

    // 3. Check rate limits
    const rateCheck = ZoneRateLimiter.checkRequest(zone.id);
    if (!rateCheck.allowed) {
      ZoneRateLimiter.recordBlocked(zone.id, rateCheck.reason || "Rate limit");
      return {
        success: false,
        zoneId: zone.id,
        error: rateCheck.reason,
        metrics: { durationMs: 0, memoryUsedMB: 0 },
      };
    }

    // 4. Check engine/MCP permissions
    if (request.engineId && !ZoneManager.isEngineAllowed(zone.id, request.engineId)) {
      return {
        success: false,
        zoneId: zone.id,
        error: `Engine ${request.engineId} not allowed in this zone`,
        metrics: { durationMs: 0, memoryUsedMB: 0 },
      };
    }

    if (request.mcpId && !ZoneManager.isMcpAllowed(zone.id, request.mcpId)) {
      return {
        success: false,
        zoneId: zone.id,
        error: `MCP ${request.mcpId} not allowed in this zone`,
        metrics: { durationMs: 0, memoryUsedMB: 0 },
      };
    }

    // 5. Record execution start
    ZoneRateLimiter.recordRequest(zone.id);
    ZoneRateLimiter.recordExecutionStart(zone.id);

    try {
      // 6. Execute with timeout
      const timeout = request.timeout || 5000;
      const result = await this.executeWithTimeout(request.code, timeout, zone);

      const durationMs = Date.now() - startTime;

      // 7. Emit success event
      eventBus.publish({
        type: "zone.execution.success",
        zoneId: zone.id,
        tenantId: request.tenantId,
        context: request.context,
        durationMs,
        timestamp: new Date().toISOString(),
      } as any);

      return {
        success: true,
        zoneId: zone.id,
        result,
        metrics: {
          durationMs,
          memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
        },
      };
    } catch (error: any) {
      const durationMs = Date.now() - startTime;

      // Emit failure event
      eventBus.publish({
        type: "zone.execution.failed",
        zoneId: zone.id,
        tenantId: request.tenantId,
        context: request.context,
        error: error.message,
        durationMs,
        timestamp: new Date().toISOString(),
      } as any);

      return {
        success: false,
        zoneId: zone.id,
        error: error.message,
        metrics: {
          durationMs,
          memoryUsedMB: process.memoryUsage().heapUsed / 1024 / 1024,
        },
      };
    } finally {
      // 8. Record execution end
      ZoneRateLimiter.recordExecutionEnd(zone.id);
    }
  }

  /**
   * Execute with timeout protection
   */
  private static async executeWithTimeout(
    code: string,
    timeoutMs: number,
    zone: Zone
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Execution timeout (${timeoutMs}ms) in zone ${zone.id}`));
      }, timeoutMs);

      try {
        // Create isolated context
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
        
        // Build safe globals for this zone
        const safeGlobals = this.buildZoneSafeGlobals(zone);
        
        const fn = new AsyncFunction(
          ...Object.keys(safeGlobals),
          `"use strict"; ${code}`
        );

        fn(...Object.values(safeGlobals))
          .then((result: any) => {
            clearTimeout(timer);
            resolve(result);
          })
          .catch((err: any) => {
            clearTimeout(timer);
            reject(err);
          });
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  /**
   * Build zone-specific safe globals
   */
  private static buildZoneSafeGlobals(zone: Zone): Record<string, any> {
    return {
      console: {
        log: (...args: any[]) => console.log(`[Zone:${zone.id}]`, ...args),
        warn: (...args: any[]) => console.warn(`[Zone:${zone.id}]`, ...args),
        error: (...args: any[]) => console.error(`[Zone:${zone.id}]`, ...args),
      },
      fetch: async (url: string, options?: RequestInit) => {
        const networkCheck = ZoneRateLimiter.checkNetworkCall(zone.id);
        if (!networkCheck.allowed) {
          throw new Error(networkCheck.reason);
        }
        ZoneRateLimiter.recordNetworkCall(zone.id);
        return fetch(url, options);
      },
      JSON,
      Math,
      Date,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Promise,
      setTimeout: undefined,
      setInterval: undefined,
      process: undefined,
      require: undefined,
      eval: undefined,
      Function: undefined,
    };
  }

  /**
   * Check if execution is allowed for tenant
   */
  static canExecute(tenantId: string): { allowed: boolean; reason?: string } {
    const zone = ZoneManager.getZoneForTenant(tenantId);
    if (!zone) {
      return { allowed: true }; // Will create zone on execute
    }

    if (zone.status !== "active") {
      return { allowed: false, reason: `Zone is ${zone.status}` };
    }

    const rateCheck = ZoneRateLimiter.checkRequest(zone.id);
    return { allowed: rateCheck.allowed, reason: rateCheck.reason };
  }
}

export const zoneExecutor = ZoneExecutor;

