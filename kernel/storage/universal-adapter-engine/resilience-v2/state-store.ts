/**
 * 💾 Hybrid State Store v2.0
 * 
 * Implements ResilienceStateStore with:
 * - In-memory fast state (circuit breakers, health scores)
 * - Durable state simulation (DLQ, anomalies)
 * - Ready for Redis/Postgres integration
 * 
 * @version 2.0.0
 */

import crypto from "crypto";
import { eventBus } from "../../../events/event-bus";
import {
  type ResilienceStateStore,
  type CircuitBreakerState,
  type ProviderHealthScore,
  type DLQEntry,
  type AnomalyLog,
} from "./types";

// ═══════════════════════════════════════════════════════════
// In-Memory Implementation (Production: Replace with Redis)
// ═══════════════════════════════════════════════════════════

class MemoryStateStore implements ResilienceStateStore {
  // Fast state (would be Redis in production)
  private circuitStates: Map<string, CircuitBreakerState> = new Map();
  private healthScores: Map<string, ProviderHealthScore> = new Map();
  private retryBudgets: Map<string, number> = new Map();

  // Durable state (would be Postgres in production)
  private dlqEntries: Map<string, DLQEntry> = new Map();
  private anomalyLogs: AnomalyLog[] = [];

  // Default retry budget per tenant per minute
  private readonly DEFAULT_RETRY_BUDGET = 100;

  // ─────────────────────────────────────────────────────────
  // Circuit Breaker State
  // ─────────────────────────────────────────────────────────

  async getCircuitState(key: string): Promise<CircuitBreakerState | null> {
    return this.circuitStates.get(key) || null;
  }

  async setCircuitState(state: CircuitBreakerState): Promise<void> {
    this.circuitStates.set(state.key, state);

    // Emit state change event
    await eventBus.publish({
      type: "resilience.circuit.state_changed",
      key: state.key,
      state: state.state,
      failures: state.failures,
      timestamp: new Date().toISOString(),
    } as any);
  }

  // ─────────────────────────────────────────────────────────
  // Health Scores
  // ─────────────────────────────────────────────────────────

  async getHealthScore(provider: string, tenantId: string): Promise<ProviderHealthScore | null> {
    const key = `${provider}:${tenantId}`;
    return this.healthScores.get(key) || null;
  }

  async setHealthScore(score: ProviderHealthScore): Promise<void> {
    const key = `${score.provider}:${score.tenantId}`;
    this.healthScores.set(key, score);

    // Emit if degraded or unhealthy
    if (score.status !== "healthy") {
      await eventBus.publish({
        type: "resilience.provider.health_changed",
        provider: score.provider,
        tenantId: score.tenantId,
        status: score.status,
        score: score.score,
        recommendedAction: score.recommendedAction,
        timestamp: new Date().toISOString(),
      } as any);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Retry Budgets
  // ─────────────────────────────────────────────────────────

  async getRetryBudget(tenantId: string): Promise<number> {
    return this.retryBudgets.get(tenantId) ?? this.DEFAULT_RETRY_BUDGET;
  }

  async incrementRetryBudget(tenantId: string, delta: number): Promise<number> {
    const current = await this.getRetryBudget(tenantId);
    const newValue = Math.max(0, current + delta);
    this.retryBudgets.set(tenantId, newValue);
    return newValue;
  }

  // Reset budgets periodically (call from scheduler)
  async resetRetryBudgets(): Promise<void> {
    this.retryBudgets.clear();
  }

  // ─────────────────────────────────────────────────────────
  // Dead Letter Queue
  // ─────────────────────────────────────────────────────────

  async enqueueDLQ(entry: DLQEntry): Promise<void> {
    this.dlqEntries.set(entry.id, entry);

    await eventBus.publish({
      type: "resilience.dlq.enqueued",
      id: entry.id,
      tenantId: entry.tenantId,
      provider: entry.provider,
      operation: entry.operation,
      errorCode: entry.error.code,
      timestamp: new Date().toISOString(),
    } as any);
  }

  async dequeueDLQ(id: string): Promise<DLQEntry | null> {
    const entry = this.dlqEntries.get(id);
    if (entry) {
      this.dlqEntries.delete(id);
    }
    return entry || null;
  }

  async listDLQ(tenantId: string, limit = 100): Promise<DLQEntry[]> {
    const entries: DLQEntry[] = [];
    for (const entry of this.dlqEntries.values()) {
      if (entry.tenantId === tenantId && entry.status === "pending") {
        entries.push(entry);
        if (entries.length >= limit) break;
      }
    }
    return entries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateDLQStatus(id: string, status: DLQEntry["status"]): Promise<void> {
    const entry = this.dlqEntries.get(id);
    if (entry) {
      entry.status = status;
      if (status === "resolved") {
        entry.resolvedAt = new Date().toISOString();
      }
      this.dlqEntries.set(id, entry);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Anomaly Logging
  // ─────────────────────────────────────────────────────────

  async logAnomaly(anomaly: AnomalyLog): Promise<void> {
    this.anomalyLogs.push(anomaly);

    // Keep only last 10000 entries
    if (this.anomalyLogs.length > 10000) {
      this.anomalyLogs = this.anomalyLogs.slice(-10000);
    }

    await eventBus.publish({
      type: "resilience.anomaly.detected",
      id: anomaly.id,
      tenantId: anomaly.tenantId,
      provider: anomaly.provider,
      anomalyType: anomaly.type,
      severity: anomaly.severity,
      message: anomaly.message,
      timestamp: anomaly.detectedAt,
    } as any);
  }

  async getAnomalies(tenantId: string, since?: string): Promise<AnomalyLog[]> {
    const sinceTime = since ? new Date(since).getTime() : 0;
    return this.anomalyLogs.filter(a => 
      a.tenantId === tenantId && 
      new Date(a.detectedAt).getTime() >= sinceTime
    );
  }

  // ─────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────

  async getStats(): Promise<{
    circuitBreakers: number;
    healthScores: number;
    dlqPending: number;
    anomalies: number;
  }> {
    let dlqPending = 0;
    for (const entry of this.dlqEntries.values()) {
      if (entry.status === "pending") dlqPending++;
    }

    return {
      circuitBreakers: this.circuitStates.size,
      healthScores: this.healthScores.size,
      dlqPending,
      anomalies: this.anomalyLogs.length,
    };
  }

  async clear(): Promise<void> {
    this.circuitStates.clear();
    this.healthScores.clear();
    this.retryBudgets.clear();
    this.dlqEntries.clear();
    this.anomalyLogs = [];
  }
}

// ═══════════════════════════════════════════════════════════
// Export Singleton
// ═══════════════════════════════════════════════════════════

export const stateStore: ResilienceStateStore = new MemoryStateStore();

// Helper to generate DLQ entry ID
export function generateDLQId(): string {
  return `dlq_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

// Helper to generate anomaly ID
export function generateAnomalyId(): string {
  return `anomaly_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

// Helper to compute payload checksum
export function computeChecksum(payload: any): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 16);
}

