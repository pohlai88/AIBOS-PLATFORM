/**
 * Orchestra Telemetry Metrics
 * 
 * GRCD-KERNEL v4.0.0 NF-11: Orchestra coordination latency <200ms
 * Prometheus metrics for orchestra coordination and performance
 */

import client from "prom-client";
import { metricsRegistry } from "../../observability/metrics";
import type { OrchestrationDomain } from "../types";

// ─────────────────────────────────────────────────────────────
// ORCHESTRA MANIFEST METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total orchestra manifest registrations
 */
export const orchestraManifestsRegistered = new client.Counter({
  name: "aibos_kernel_orchestra_manifests_registered_total",
  help: "Total number of orchestra manifests registered",
  labelNames: ["domain", "status"] as const,
  registers: [metricsRegistry],
});

/**
 * Active orchestras (gauge)
 */
export const orchestrasActive = new client.Gauge({
  name: "aibos_kernel_orchestras_active",
  help: "Number of active orchestras",
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// ORCHESTRA ACTION METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total orchestra actions executed
 */
export const orchestraActionsTotal = new client.Counter({
  name: "aibos_kernel_orchestra_actions_total",
  help: "Total number of orchestra actions executed",
  labelNames: ["domain", "action", "status"] as const, // status: success|failed
  registers: [metricsRegistry],
});

/**
 * Orchestra action execution duration (GRCD NF-11: <200ms target)
 */
export const orchestraActionDurationSeconds = new client.Histogram({
  name: "aibos_kernel_orchestra_action_duration_seconds",
  help: "Orchestra action execution duration in seconds (target: <200ms)",
  labelNames: ["domain", "action", "status"] as const,
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5], // Focus on <200ms
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// COORDINATION METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total cross-orchestra coordinations
 */
export const orchestraCoordinationsTotal = new client.Counter({
  name: "aibos_kernel_orchestra_coordinations_total",
  help: "Total number of cross-orchestra coordinations",
  labelNames: ["initiating_domain", "status", "parallel"] as const,
  registers: [metricsRegistry],
});

/**
 * Active coordination sessions (gauge)
 */
export const orchestraCoordinationSessionsActive = new client.Gauge({
  name: "aibos_kernel_orchestra_coordination_sessions_active",
  help: "Number of active orchestra coordination sessions",
  registers: [metricsRegistry],
});

/**
 * Coordination duration
 */
export const orchestraCoordinationDurationSeconds = new client.Histogram({
  name: "aibos_kernel_orchestra_coordination_duration_seconds",
  help: "Orchestra coordination duration in seconds",
  labelNames: ["initiating_domain", "involved_count", "status"] as const,
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// AUTHORIZATION METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Cross-orchestra authorization checks
 */
export const orchestraCrossAuthChecksTotal = new client.Counter({
  name: "aibos_kernel_orchestra_cross_auth_checks_total",
  help: "Total number of cross-orchestra authorization checks",
  labelNames: ["source_domain", "target_domain", "result"] as const, // result: granted|denied
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// AGENT & TOOL METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Agents active in orchestras (gauge)
 */
export const orchestraAgentsActive = new client.Gauge({
  name: "aibos_kernel_orchestra_agents_active",
  help: "Number of active agents across all orchestras",
  labelNames: ["domain"] as const,
  registers: [metricsRegistry],
});

/**
 * Orchestra tools invoked
 */
export const orchestraToolsInvokedTotal = new client.Counter({
  name: "aibos_kernel_orchestra_tools_invoked_total",
  help: "Total number of orchestra tools invoked",
  labelNames: ["domain", "tool_name", "status"] as const,
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// ERROR METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Orchestra errors
 */
export const orchestraErrorsTotal = new client.Counter({
  name: "aibos_kernel_orchestra_errors_total",
  help: "Total number of orchestra errors",
  labelNames: ["domain", "error_code", "operation"] as const,
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Record manifest registration
 */
export function recordOrchestraRegistration(
  domain: OrchestrationDomain,
  success: boolean
): void {
  orchestraManifestsRegistered.inc({
    domain,
    status: success ? "success" : "failed",
  });

  if (success) {
    orchestrasActive.inc();
  }
}

/**
 * Record action execution
 */
export function recordOrchestraAction(
  domain: OrchestrationDomain,
  action: string,
  status: "success" | "failed",
  durationMs: number
): void {
  orchestraActionsTotal.inc({
    domain,
    action,
    status,
  });

  orchestraActionDurationSeconds.observe(
    {
      domain,
      action,
      status,
    },
    durationMs / 1000
  );
}

/**
 * Record coordination session
 */
export function recordCoordination(
  initiatingDomain: OrchestrationDomain,
  status: "success" | "failed",
  involvedCount: number,
  durationMs: number,
  parallel: boolean
): void {
  orchestraCoordinationsTotal.inc({
    initiating_domain: initiatingDomain,
    status,
    parallel: parallel.toString(),
  });

  orchestraCoordinationDurationSeconds.observe(
    {
      initiating_domain: initiatingDomain,
      involved_count: involvedCount.toString(),
      status,
    },
    durationMs / 1000
  );
}

/**
 * Record coordination session started
 */
export function recordCoordinationStarted(): void {
  orchestraCoordinationSessionsActive.inc();
}

/**
 * Record coordination session ended
 */
export function recordCoordinationEnded(): void {
  orchestraCoordinationSessionsActive.dec();
}

/**
 * Record cross-orchestra auth check
 */
export function recordCrossAuthCheck(
  sourceDomain: OrchestrationDomain,
  targetDomain: OrchestrationDomain,
  granted: boolean
): void {
  orchestraCrossAuthChecksTotal.inc({
    source_domain: sourceDomain,
    target_domain: targetDomain,
    result: granted ? "granted" : "denied",
  });
}

/**
 * Record orchestra error
 */
export function recordOrchestraError(
  domain: OrchestrationDomain,
  errorCode: string,
  operation: string
): void {
  orchestraErrorsTotal.inc({
    domain,
    error_code: errorCode,
    operation,
  });
}

/**
 * Update agent count for domain
 */
export function updateAgentCount(domain: OrchestrationDomain, count: number): void {
  orchestraAgentsActive.set({ domain }, count);
}

