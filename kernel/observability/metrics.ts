/**
 * Prometheus Metrics Module
 * 
 * Single source of truth for all kernel metrics
 */

import client from "prom-client";

const collectDefaultMetrics = client.collectDefaultMetrics;

// One global registry per process
export const metricsRegistry = new client.Registry();

// Default Node.js / process metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({
  register: metricsRegistry,
  prefix: "aibos_kernel_",
});

// ─────────────────────────────────────────────────────────────
// HTTP METRICS
// ─────────────────────────────────────────────────────────────

export const httpRequestsTotal = new client.Counter({
  name: "aibos_kernel_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"] as const,
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: "aibos_kernel_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

// ─────────────────────────────────────────────────────────────
// ACTION METRICS
// ─────────────────────────────────────────────────────────────

export const actionsExecutedTotal = new client.Counter({
  name: "aibos_kernel_actions_executed_total",
  help: "Total number of actions executed",
  labelNames: ["actionId", "effect", "tenantId"] as const, // effect: allow|deny|error
});

export const actionDurationSeconds = new client.Histogram({
  name: "aibos_kernel_action_duration_seconds",
  help: "Action execution duration in seconds",
  labelNames: ["actionId", "tenantId"] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

// ─────────────────────────────────────────────────────────────
// POLICY METRICS
// ─────────────────────────────────────────────────────────────

export const policyDecisionsTotal = new client.Counter({
  name: "aibos_kernel_policy_decisions_total",
  help: "Total number of policy decisions",
  labelNames: ["resourceType", "effect", "reason", "tenantId"] as const, // effect: allow|deny
});

// ─────────────────────────────────────────────────────────────
// AUTH METRICS
// ─────────────────────────────────────────────────────────────

export const authFailuresTotal = new client.Counter({
  name: "aibos_kernel_auth_failures_total",
  help: "Total number of auth failures",
  labelNames: ["reason"] as const, // invalid_api_key, invalid_jwt, missing_credentials
});

// ─────────────────────────────────────────────────────────────
// DB / REDIS METRICS
// ─────────────────────────────────────────────────────────────

export const dbQueryDurationSeconds = new client.Histogram({
  name: "aibos_kernel_db_query_duration_seconds",
  help: "DB query duration in seconds",
  labelNames: ["operation"] as const,
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.25, 0.5, 1, 2],
});

export const redisOperationsTotal = new client.Counter({
  name: "aibos_kernel_redis_operations_total",
  help: "Total number of Redis operations",
  labelNames: ["command"] as const,
});

// ─────────────────────────────────────────────────────────────
// Register all metrics in the registry
// ─────────────────────────────────────────────────────────────

metricsRegistry.registerMetric(httpRequestsTotal);
metricsRegistry.registerMetric(httpRequestDurationSeconds);
metricsRegistry.registerMetric(actionsExecutedTotal);
metricsRegistry.registerMetric(actionDurationSeconds);
metricsRegistry.registerMetric(policyDecisionsTotal);
metricsRegistry.registerMetric(authFailuresTotal);
metricsRegistry.registerMetric(dbQueryDurationSeconds);
metricsRegistry.registerMetric(redisOperationsTotal);

