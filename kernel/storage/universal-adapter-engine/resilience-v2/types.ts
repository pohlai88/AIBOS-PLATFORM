/**
 * 🛡️ Resilience Layer v2.0 — Types
 * 
 * Kernel-grade type definitions for:
 * - Multi-tenant circuit breakers
 * - Provider health scoring
 * - DLQ with lineage
 * - Semantic error classification
 * 
 * @version 2.0.0
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Circuit Breaker Types
// ═══════════════════════════════════════════════════════════

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitKey {
  provider: string;
  region?: string;
  engine?: string;
  tenantId: string;
  resource?: string;
}

export interface CircuitBreakerState {
  key: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure?: string;
  lastSuccess?: string;
  openedAt?: string;
  halfOpenAt?: string;
  cooldownEndsAt?: string;
  version: number; // Optimistic locking
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  openDurationMs: number;
  halfOpenMaxAttempts: number;
  slidingWindowMs: number;
}

// ═══════════════════════════════════════════════════════════
// Error Classification Types
// ═══════════════════════════════════════════════════════════

export const ERROR_CATEGORIES = [
  "network",
  "timeout",
  "auth",
  "permission",
  "validation",
  "not_found",
  "conflict",
  "rate_limit",
  "throttling",
  "server",
  "data_integrity",
  "offline_sync",
  "governance",
  "encryption",
  "schema_mismatch",
  "unknown",
] as const;

export type ErrorCategory = (typeof ERROR_CATEGORIES)[number];

export interface NormalizedError {
  code: string;
  message: string;
  category: ErrorCategory;
  retryable: boolean;
  retryAfterMs?: number;
  provider?: string;
  tenantId?: string;
  engine?: string;
  operation?: string;
  resource?: string;
  originalError?: any;
  fingerprint: string; // For deduplication
  severity: "low" | "medium" | "high" | "critical";
}

// ═══════════════════════════════════════════════════════════
// Provider Health Types
// ═══════════════════════════════════════════════════════════

export interface HealthMetrics {
  successRate: number;      // 0-1
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;        // 0-1
  retryRate: number;        // 0-1
  schemaViolationRate: number;
  lastUpdated: string;
}

export interface ProviderHealthScore {
  provider: string;
  region?: string;
  tenantId: string;
  score: number;            // 0-100
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  metrics: HealthMetrics;
  anomalies: string[];
  recommendedAction?: "none" | "throttle" | "fallback" | "block";
}

// ═══════════════════════════════════════════════════════════
// Retry Types
// ═══════════════════════════════════════════════════════════

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableCategories: ErrorCategory[];
}

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  totalDelayMs: number;
  errors: NormalizedError[];
  startedAt: string;
}

// ═══════════════════════════════════════════════════════════
// Dead Letter Queue Types
// ═══════════════════════════════════════════════════════════

export interface DLQEntry {
  id: string;
  tenantId: string;
  provider: string;
  engine?: string;
  operation: string;
  resource?: string;
  payload: any;
  payloadChecksum: string;
  error: NormalizedError;
  retryContext: RetryContext;
  createdAt: string;
  expiresAt?: string;
  status: "pending" | "retrying" | "resolved" | "expired" | "discarded";
  resolvedAt?: string;
  resolvedBy?: string;
}

// ═══════════════════════════════════════════════════════════
// Telemetry Types
// ═══════════════════════════════════════════════════════════

export interface ResilienceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operation: string;
  provider: string;
  tenantId: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  status: "success" | "failure" | "timeout";
  error?: NormalizedError;
  retryCount: number;
  circuitState: CircuitState;
  metadata: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════
// Storage Interface (Hybrid)
// ═══════════════════════════════════════════════════════════

export interface ResilienceStateStore {
  // Fast state (Redis/Memory)
  getCircuitState(key: string): Promise<CircuitBreakerState | null>;
  setCircuitState(state: CircuitBreakerState): Promise<void>;
  getHealthScore(provider: string, tenantId: string): Promise<ProviderHealthScore | null>;
  setHealthScore(score: ProviderHealthScore): Promise<void>;
  incrementRetryBudget(tenantId: string, delta: number): Promise<number>;
  getRetryBudget(tenantId: string): Promise<number>;

  // Durable state (Postgres)
  enqueueDLQ(entry: DLQEntry): Promise<void>;
  dequeueDLQ(id: string): Promise<DLQEntry | null>;
  listDLQ(tenantId: string, limit?: number): Promise<DLQEntry[]>;
  updateDLQStatus(id: string, status: DLQEntry["status"]): Promise<void>;
  logAnomaly(anomaly: AnomalyLog): Promise<void>;
  getAnomalies(tenantId: string, since?: string): Promise<AnomalyLog[]>;
}

export interface AnomalyLog {
  id: string;
  tenantId: string;
  provider: string;
  type: "drift" | "spike" | "degradation" | "schema_mismatch" | "auth_failure";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  metadata: Record<string, any>;
  detectedAt: string;
  resolvedAt?: string;
}

// ═══════════════════════════════════════════════════════════
// Execution Types
// ═══════════════════════════════════════════════════════════

export interface ExecutionOptions {
  tenantId: string;
  provider: string;
  region?: string;
  engine?: string;
  operation: string;
  resource?: string;
  timeout?: number;
  retryConfig?: Partial<RetryConfig>;
  fallbackProviders?: string[];
  skipCircuitBreaker?: boolean;
}

export interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: NormalizedError;
  metrics: {
    attempts: number;
    totalDurationMs: number;
    providerUsed: string;
    circuitState: CircuitState;
    fromFallback: boolean;
  };
}

