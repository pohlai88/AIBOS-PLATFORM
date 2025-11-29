/**
 * Policy Telemetry Metrics
 * 
 * GRCD-KERNEL v4.0.0: Policy performance and usage metrics
 * Prometheus metrics for policy governance
 */

import client from "prom-client";
import { metricsRegistry } from "../../observability/metrics";
import type { PolicyPrecedence } from "../types";

// ─────────────────────────────────────────────────────────────
// POLICY REGISTRY METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total policy registrations
 */
export const policyRegistrationsTotal = new client.Counter({
  name: "aibos_kernel_policy_registrations_total",
  help: "Total number of policy registrations",
  labelNames: ["precedence", "status"] as const,
  registers: [metricsRegistry],
});

/**
 * Active policies by precedence
 */
export const activePoliciesGauge = new client.Gauge({
  name: "aibos_kernel_policies_active",
  help: "Number of active policies by precedence level",
  labelNames: ["precedence"] as const,
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// POLICY EVALUATION METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total policy evaluations
 */
export const policyEvaluationsTotal = new client.Counter({
  name: "aibos_kernel_policy_evaluations_total",
  help: "Total number of policy evaluations",
  labelNames: ["result", "orchestra", "precedence"] as const, // result: allowed|denied
  registers: [metricsRegistry],
});

/**
 * Policy evaluation duration
 */
export const policyEvaluationDurationSeconds = new client.Histogram({
  name: "aibos_kernel_policy_evaluation_duration_seconds",
  help: "Policy evaluation duration in seconds",
  labelNames: ["result", "precedence"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25], // Focus on sub-100ms
  registers: [metricsRegistry],
});

/**
 * Policies checked per evaluation
 */
export const policiesCheckedHistogram = new client.Histogram({
  name: "aibos_kernel_policies_checked_per_evaluation",
  help: "Number of policies checked per evaluation",
  buckets: [0, 1, 2, 3, 5, 10, 20],
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// POLICY CONFLICT METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Policy conflicts resolved
 */
export const policyConflictsTotal = new client.Counter({
  name: "aibos_kernel_policy_conflicts_total",
  help: "Total number of policy conflicts resolved",
  labelNames: ["winning_precedence"] as const,
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// POLICY VIOLATION METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Policy violations (denied requests)
 */
export const policyViolationsTotal = new client.Counter({
  name: "aibos_kernel_policy_violations_total",
  help: "Total number of policy violations (denied requests)",
  labelNames: ["orchestra", "action", "precedence"] as const,
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Record policy registration
 */
export function recordPolicyRegistration(
  precedence: PolicyPrecedence,
  success: boolean
): void {
  policyRegistrationsTotal.inc({
    precedence: getPrecedenceName(precedence),
    status: success ? "success" : "failed",
  });

  if (success) {
    activePoliciesGauge.inc({ precedence: getPrecedenceName(precedence) });
  }
}

/**
 * Record policy evaluation
 */
export function recordPolicyEvaluation(
  allowed: boolean,
  durationMs: number,
  precedence: PolicyPrecedence,
  orchestra?: string,
  policiesChecked?: number
): void {
  const result = allowed ? "allowed" : "denied";

  policyEvaluationsTotal.inc({
    result,
    orchestra: orchestra || "unknown",
    precedence: getPrecedenceName(precedence),
  });

  policyEvaluationDurationSeconds.observe(
    {
      result,
      precedence: getPrecedenceName(precedence),
    },
    durationMs / 1000
  );

  if (policiesChecked !== undefined) {
    policiesCheckedHistogram.observe(policiesChecked);
  }

  if (!allowed) {
    policyViolationsTotal.inc({
      orchestra: orchestra || "unknown",
      action: "unknown",
      precedence: getPrecedenceName(precedence),
    });
  }
}

/**
 * Record policy conflict
 */
export function recordPolicyConflict(winningPrecedence: PolicyPrecedence): void {
  policyConflictsTotal.inc({
    winning_precedence: getPrecedenceName(winningPrecedence),
  });
}

/**
 * Update active policy count
 */
export function updateActivePolicyCount(
  precedence: PolicyPrecedence,
  count: number
): void {
  activePoliciesGauge.set({ precedence: getPrecedenceName(precedence) }, count);
}

/**
 * Get human-readable precedence name
 */
function getPrecedenceName(precedence: PolicyPrecedence): string {
  switch (precedence) {
    case 1:
      return "internal";
    case 2:
      return "industry";
    case 3:
      return "legal";
    default:
      return "unknown";
  }
}

