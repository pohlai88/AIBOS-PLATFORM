/**
 * 🏥 Sandbox Health Tracker v3.1
 * 
 * Persistent sandbox health tracking for Resilience Engine integration:
 * - tenant_sandbox_failures
 * - adapter_failure_ratio
 * - memory spikes
 * - network anomaly
 * - Predictive anomaly detection
 * 
 * @version 3.1.0
 */

import { type SandboxHealthEntry, type SandboxHealthStats, type SandboxOutput, type SandboxMode } from "./types";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════

const MAX_ENTRIES_PER_TENANT = 1000;
const ANOMALY_WINDOW_MS = 60_000; // 1 minute
const FAILURE_RATE_THRESHOLD = 0.5; // 50% failure rate triggers anomaly
const MEMORY_SPIKE_THRESHOLD_MB = 100;
const DURATION_SPIKE_MULTIPLIER = 3; // 3x average is a spike

// ═══════════════════════════════════════════════════════════
// Health Tracker
// ═══════════════════════════════════════════════════════════

export class SandboxHealthTracker {
  private entries = new Map<string, SandboxHealthEntry[]>();
  private statsCache = new Map<string, { stats: SandboxHealthStats; timestamp: number }>();
  private readonly CACHE_TTL_MS = 5000;

  /**
   * Record execution result
   */
  record(
    tenantId: string,
    output: SandboxOutput,
    adapterId?: string
  ): void {
    const entry: SandboxHealthEntry = {
      tenantId,
      adapterId,
      timestamp: Date.now(),
      success: output.success,
      mode: output.mode,
      durationMs: output.metrics.durationMs,
      memoryUsedMB: output.metrics.memoryUsedMB,
      riskScore: output.metrics.astRiskScore,
      errorType: output.error?.type,
    };

    // Get or create tenant entries
    let tenantEntries = this.entries.get(tenantId);
    if (!tenantEntries) {
      tenantEntries = [];
      this.entries.set(tenantId, tenantEntries);
    }

    // Add entry
    tenantEntries.push(entry);

    // Trim old entries
    if (tenantEntries.length > MAX_ENTRIES_PER_TENANT) {
      tenantEntries.splice(0, tenantEntries.length - MAX_ENTRIES_PER_TENANT);
    }

    // Invalidate cache
    this.statsCache.delete(tenantId);

    // Check for anomalies
    this.checkAnomalies(tenantId, entry);
  }

  /**
   * Get health stats for tenant
   */
  getStats(tenantId: string): SandboxHealthStats {
    // Check cache
    const cached = this.statsCache.get(tenantId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.stats;
    }

    const entries = this.entries.get(tenantId) || [];
    
    if (entries.length === 0) {
      return {
        tenantId,
        totalExecutions: 0,
        successRate: 1,
        avgDurationMs: 0,
        avgMemoryMB: 0,
        avgRiskScore: 0,
        failuresByType: {},
        anomalyScore: 0,
      };
    }

    // Calculate stats
    const successes = entries.filter(e => e.success).length;
    const totalDuration = entries.reduce((sum, e) => sum + e.durationMs, 0);
    const totalMemory = entries.reduce((sum, e) => sum + e.memoryUsedMB, 0);
    const totalRisk = entries.reduce((sum, e) => sum + e.riskScore, 0);

    // Count failures by type
    const failuresByType: Record<string, number> = {};
    for (const entry of entries) {
      if (!entry.success && entry.errorType) {
        failuresByType[entry.errorType] = (failuresByType[entry.errorType] || 0) + 1;
      }
    }

    // Calculate anomaly score
    const anomalyScore = this.calculateAnomalyScore(entries);

    const stats: SandboxHealthStats = {
      tenantId,
      totalExecutions: entries.length,
      successRate: successes / entries.length,
      avgDurationMs: totalDuration / entries.length,
      avgMemoryMB: totalMemory / entries.length,
      avgRiskScore: totalRisk / entries.length,
      failuresByType,
      anomalyScore,
    };

    // Cache
    this.statsCache.set(tenantId, { stats, timestamp: Date.now() });

    return stats;
  }

  /**
   * Get recent entries for tenant
   */
  getRecentEntries(tenantId: string, limit = 100): SandboxHealthEntry[] {
    const entries = this.entries.get(tenantId) || [];
    return entries.slice(-limit);
  }

  /**
   * Get adapter-specific failure ratio
   */
  getAdapterFailureRatio(tenantId: string, adapterId: string): number {
    const entries = this.entries.get(tenantId) || [];
    const adapterEntries = entries.filter(e => e.adapterId === adapterId);
    
    if (adapterEntries.length === 0) return 0;
    
    const failures = adapterEntries.filter(e => !e.success).length;
    return failures / adapterEntries.length;
  }

  /**
   * Check if tenant is healthy
   */
  isHealthy(tenantId: string): boolean {
    const stats = this.getStats(tenantId);
    return stats.successRate >= 0.8 && stats.anomalyScore < 50;
  }

  /**
   * Get all unhealthy tenants
   */
  getUnhealthyTenants(): string[] {
    const unhealthy: string[] = [];
    for (const tenantId of this.entries.keys()) {
      if (!this.isHealthy(tenantId)) {
        unhealthy.push(tenantId);
      }
    }
    return unhealthy;
  }

  /**
   * Export stats for persistence (Redis/Supabase)
   */
  exportForPersistence(): Array<{ tenantId: string; stats: SandboxHealthStats }> {
    const result: Array<{ tenantId: string; stats: SandboxHealthStats }> = [];
    for (const tenantId of this.entries.keys()) {
      result.push({
        tenantId,
        stats: this.getStats(tenantId),
      });
    }
    return result;
  }

  /**
   * Clear old entries (call periodically)
   */
  cleanup(maxAgeMs = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAgeMs;
    for (const [tenantId, entries] of this.entries) {
      const filtered = entries.filter(e => e.timestamp > cutoff);
      if (filtered.length === 0) {
        this.entries.delete(tenantId);
        this.statsCache.delete(tenantId);
      } else {
        this.entries.set(tenantId, filtered);
        this.statsCache.delete(tenantId);
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────────────────────

  private calculateAnomalyScore(entries: SandboxHealthEntry[]): number {
    if (entries.length < 5) return 0;

    let score = 0;
    const recentWindow = Date.now() - ANOMALY_WINDOW_MS;
    const recentEntries = entries.filter(e => e.timestamp > recentWindow);

    if (recentEntries.length === 0) return 0;

    // Factor 1: Recent failure rate
    const recentFailures = recentEntries.filter(e => !e.success).length;
    const recentFailureRate = recentFailures / recentEntries.length;
    if (recentFailureRate > FAILURE_RATE_THRESHOLD) {
      score += 30 * (recentFailureRate / FAILURE_RATE_THRESHOLD);
    }

    // Factor 2: Memory spikes
    const avgMemory = entries.reduce((sum, e) => sum + e.memoryUsedMB, 0) / entries.length;
    const recentAvgMemory = recentEntries.reduce((sum, e) => sum + e.memoryUsedMB, 0) / recentEntries.length;
    if (recentAvgMemory > avgMemory * 2 || recentAvgMemory > MEMORY_SPIKE_THRESHOLD_MB) {
      score += 20;
    }

    // Factor 3: Duration spikes
    const avgDuration = entries.reduce((sum, e) => sum + e.durationMs, 0) / entries.length;
    const recentAvgDuration = recentEntries.reduce((sum, e) => sum + e.durationMs, 0) / recentEntries.length;
    if (recentAvgDuration > avgDuration * DURATION_SPIKE_MULTIPLIER) {
      score += 20;
    }

    // Factor 4: High risk scores
    const avgRisk = entries.reduce((sum, e) => sum + e.riskScore, 0) / entries.length;
    const recentAvgRisk = recentEntries.reduce((sum, e) => sum + e.riskScore, 0) / recentEntries.length;
    if (recentAvgRisk > avgRisk * 1.5 || recentAvgRisk > 50) {
      score += 15;
    }

    // Factor 5: Repeated same error type
    const errorCounts: Record<string, number> = {};
    for (const entry of recentEntries) {
      if (entry.errorType) {
        errorCounts[entry.errorType] = (errorCounts[entry.errorType] || 0) + 1;
      }
    }
    const maxErrorCount = Math.max(0, ...Object.values(errorCounts));
    if (maxErrorCount > 5) {
      score += 15;
    }

    return Math.min(100, score);
  }

  private async checkAnomalies(tenantId: string, entry: SandboxHealthEntry): Promise<void> {
    const stats = this.getStats(tenantId);

    // Emit anomaly event if score is high
    if (stats.anomalyScore > 50) {
      await eventBus.publish({
        type: "sandbox.anomaly",
        tenantId,
        adapterId: entry.adapterId,
        anomalyScore: stats.anomalyScore,
        successRate: stats.successRate,
        avgDurationMs: stats.avgDurationMs,
        avgMemoryMB: stats.avgMemoryMB,
        timestamp: new Date().toISOString(),
      } as any);
    }

    // Emit failure event
    if (!entry.success) {
      await eventBus.publish({
        type: "sandbox.failure",
        tenantId,
        adapterId: entry.adapterId,
        errorType: entry.errorType,
        durationMs: entry.durationMs,
        riskScore: entry.riskScore,
        timestamp: new Date().toISOString(),
      } as any);
    }
  }
}

export const sandboxHealthTracker = new SandboxHealthTracker();

