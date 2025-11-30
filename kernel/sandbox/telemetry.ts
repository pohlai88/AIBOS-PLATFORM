/**
 * 📊 Sandbox Telemetry v3.0
 * 
 * Real-time observability:
 * - Execution metrics
 * - Risk score tracking
 * - Performance analytics
 * - Error aggregation
 * 
 * @version 3.0.0
 */

import { eventBus } from "../events/event-bus";
import { type SandboxOutput, type SandboxMode } from "./types";
import { type MappedError } from "./error-mapper";

// ═══════════════════════════════════════════════════════════
// Telemetry Types
// ═══════════════════════════════════════════════════════════

export interface TelemetryEntry {
  id: string;
  tenantId: string;
  adapterId?: string;
  engineId?: string;
  mode: SandboxMode;
  success: boolean;
  durationMs: number;
  memoryUsedMB: number;
  cpuUsage: number;
  networkCalls: number;
  astRiskScore: number;
  errorType?: string;
  timestamp: string;
}

export interface TelemetryStats {
  totalExecutions: number;
  successRate: number;
  avgDurationMs: number;
  avgRiskScore: number;
  avgMemoryMB: number;
  totalNetworkCalls: number;
  modeDistribution: Record<SandboxMode, number>;
  errorDistribution: Record<string, number>;
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════
// In-Memory Store (Production: Use Redis)
// ═══════════════════════════════════════════════════════════

class TelemetryStore {
  private entries: Map<string, TelemetryEntry[]> = new Map();
  private stats: Map<string, TelemetryStats> = new Map();
  private readonly MAX_ENTRIES = 1000;

  /**
   * Record execution
   */
  async record(
    tenantId: string,
    output: SandboxOutput,
    options: { adapterId?: string; engineId?: string }
  ): Promise<void> {
    const entry: TelemetryEntry = {
      id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      tenantId,
      adapterId: options.adapterId,
      engineId: options.engineId,
      mode: output.mode,
      success: output.success,
      durationMs: output.metrics.durationMs,
      memoryUsedMB: output.metrics.memoryUsedMB,
      cpuUsage: output.metrics.cpuUsage,
      networkCalls: output.metrics.networkCalls,
      astRiskScore: output.metrics.astRiskScore,
      errorType: output.error?.type,
      timestamp: new Date().toISOString(),
    };

    // Store entry
    const tenantEntries = this.entries.get(tenantId) || [];
    tenantEntries.unshift(entry);
    if (tenantEntries.length > this.MAX_ENTRIES) {
      tenantEntries.pop();
    }
    this.entries.set(tenantId, tenantEntries);

    // Update stats
    this.updateStats(tenantId, entry);

    // Emit event
    await eventBus.publish({
      type: "sandbox.telemetry.recorded",
      tenantId,
      entryId: entry.id,
      success: entry.success,
      mode: entry.mode,
      riskScore: entry.astRiskScore,
      timestamp: entry.timestamp,
    } as any);
  }

  /**
   * Get recent entries
   */
  getRecent(tenantId: string, limit = 50): TelemetryEntry[] {
    const entries = this.entries.get(tenantId) || [];
    return entries.slice(0, limit);
  }

  /**
   * Get stats
   */
  getStats(tenantId: string): TelemetryStats | null {
    return this.stats.get(tenantId) || null;
  }

  /**
   * Get global stats (all tenants)
   */
  getGlobalStats(): TelemetryStats {
    const allStats = Array.from(this.stats.values());
    if (allStats.length === 0) {
      return this.createEmptyStats();
    }

    return {
      totalExecutions: allStats.reduce((sum, s) => sum + s.totalExecutions, 0),
      successRate: allStats.reduce((sum, s) => sum + s.successRate, 0) / allStats.length,
      avgDurationMs: allStats.reduce((sum, s) => sum + s.avgDurationMs, 0) / allStats.length,
      avgRiskScore: allStats.reduce((sum, s) => sum + s.avgRiskScore, 0) / allStats.length,
      avgMemoryMB: allStats.reduce((sum, s) => sum + s.avgMemoryMB, 0) / allStats.length,
      totalNetworkCalls: allStats.reduce((sum, s) => sum + s.totalNetworkCalls, 0),
      modeDistribution: this.mergeModeDistributions(allStats),
      errorDistribution: this.mergeErrorDistributions(allStats),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Update stats for tenant
   */
  private updateStats(tenantId: string, entry: TelemetryEntry): void {
    const current = this.stats.get(tenantId) || this.createEmptyStats();
    const entries = this.entries.get(tenantId) || [];

    const successes = entries.filter(e => e.success).length;

    current.totalExecutions = entries.length;
    current.successRate = entries.length > 0 ? successes / entries.length : 0;
    current.avgDurationMs = entries.reduce((sum, e) => sum + e.durationMs, 0) / entries.length;
    current.avgRiskScore = entries.reduce((sum, e) => sum + e.astRiskScore, 0) / entries.length;
    current.avgMemoryMB = entries.reduce((sum, e) => sum + e.memoryUsedMB, 0) / entries.length;
    current.totalNetworkCalls = entries.reduce((sum, e) => sum + e.networkCalls, 0);

    // Mode distribution
    current.modeDistribution = { vm2: 0, worker: 0, wasm: 0, isolated: 0 };
    for (const e of entries) {
      current.modeDistribution[e.mode]++;
    }

    // Error distribution
    current.errorDistribution = {};
    for (const e of entries) {
      if (e.errorType) {
        current.errorDistribution[e.errorType] = (current.errorDistribution[e.errorType] || 0) + 1;
      }
    }

    current.lastUpdated = new Date().toISOString();
    this.stats.set(tenantId, current);
  }

  private createEmptyStats(): TelemetryStats {
    return {
      totalExecutions: 0,
      successRate: 0,
      avgDurationMs: 0,
      avgRiskScore: 0,
      avgMemoryMB: 0,
      totalNetworkCalls: 0,
      modeDistribution: { vm2: 0, worker: 0, wasm: 0, isolated: 0 },
      errorDistribution: {},
      lastUpdated: new Date().toISOString(),
    };
  }

  private mergeModeDistributions(stats: TelemetryStats[]): Record<SandboxMode, number> {
    const merged: Record<SandboxMode, number> = { vm2: 0, worker: 0, wasm: 0, isolated: 0 };
    for (const s of stats) {
      for (const [mode, count] of Object.entries(s.modeDistribution)) {
        merged[mode as SandboxMode] += count;
      }
    }
    return merged;
  }

  private mergeErrorDistributions(stats: TelemetryStats[]): Record<string, number> {
    const merged: Record<string, number> = {};
    for (const s of stats) {
      for (const [error, count] of Object.entries(s.errorDistribution)) {
        merged[error] = (merged[error] || 0) + count;
      }
    }
    return merged;
  }

  /**
   * Clear tenant data
   */
  clear(tenantId: string): void {
    this.entries.delete(tenantId);
    this.stats.delete(tenantId);
  }
}

export const telemetryStore = new TelemetryStore();

// ═══════════════════════════════════════════════════════════
// Telemetry API
// ═══════════════════════════════════════════════════════════

export class SandboxTelemetry {
  /**
   * Record sandbox execution
   */
  static async record(
    tenantId: string,
    output: SandboxOutput,
    options: { adapterId?: string; engineId?: string } = {}
  ): Promise<void> {
    await telemetryStore.record(tenantId, output, options);
  }

  /**
   * Get recent executions
   */
  static getRecent(tenantId: string, limit?: number): TelemetryEntry[] {
    return telemetryStore.getRecent(tenantId, limit);
  }

  /**
   * Get tenant stats
   */
  static getStats(tenantId: string): TelemetryStats | null {
    return telemetryStore.getStats(tenantId);
  }

  /**
   * Get global stats
   */
  static getGlobalStats(): TelemetryStats {
    return telemetryStore.getGlobalStats();
  }

  /**
   * Check if tenant is experiencing issues
   */
  static hasIssues(tenantId: string): { hasIssues: boolean; issues: string[] } {
    const stats = telemetryStore.getStats(tenantId);
    if (!stats) return { hasIssues: false, issues: [] };

    const issues: string[] = [];

    if (stats.successRate < 0.8) {
      issues.push(`Low success rate: ${(stats.successRate * 100).toFixed(1)}%`);
    }
    if (stats.avgRiskScore > 50) {
      issues.push(`High average risk score: ${stats.avgRiskScore.toFixed(1)}`);
    }
    if (stats.avgDurationMs > 5000) {
      issues.push(`High average duration: ${stats.avgDurationMs.toFixed(0)}ms`);
    }

    return { hasIssues: issues.length > 0, issues };
  }
}

export const sandboxTelemetry = SandboxTelemetry;

