/**
 * MCP Telemetry Metrics
 * 
 * GRCD-KERNEL v4.0.0 NF-9: MCP validation latency <50ms
 * GRCD-KERNEL v4.0.0 Section 9.1: Observability requirements
 * 
 * Prometheus metrics for MCP governance operations
 */

import client from "prom-client";
import { metricsRegistry } from "../../observability/metrics";

// ─────────────────────────────────────────────────────────────
// MCP MANIFEST METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total MCP manifest registrations
 */
export const mcpManifestsRegistered = new client.Counter({
  name: "aibos_kernel_mcp_manifests_registered_total",
  help: "Total number of MCP manifests registered",
  labelNames: ["manifest_name", "status"] as const, // status: success|failed
  registers: [metricsRegistry],
});

/**
 * Active MCP manifests (gauge)
 */
export const mcpManifestsActive = new client.Gauge({
  name: "aibos_kernel_mcp_manifests_active",
  help: "Number of active MCP manifests",
  registers: [metricsRegistry],
});

/**
 * MCP manifest validation duration
 */
export const mcpManifestValidationDurationSeconds = new client.Histogram({
  name: "aibos_kernel_mcp_manifest_validation_duration_seconds",
  help: "MCP manifest validation duration in seconds",
  labelNames: ["manifest_name", "valid"] as const, // valid: true|false
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1], // Sub-50ms targets (NF-9)
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// MCP TOOL INVOCATION METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total MCP tool invocations
 */
export const mcpToolInvocationsTotal = new client.Counter({
  name: "aibos_kernel_mcp_tool_invocations_total",
  help: "Total number of MCP tool invocations",
  labelNames: ["server_name", "tool_name", "status"] as const, // status: success|failed|validation_error
  registers: [metricsRegistry],
});

/**
 * MCP tool execution duration
 */
export const mcpToolExecutionDurationSeconds = new client.Histogram({
  name: "aibos_kernel_mcp_tool_execution_duration_seconds",
  help: "MCP tool execution duration in seconds",
  labelNames: ["server_name", "tool_name", "status"] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

/**
 * MCP tool validation duration (GRCD NF-9: <50ms target)
 */
export const mcpToolValidationDurationSeconds = new client.Histogram({
  name: "aibos_kernel_mcp_tool_validation_duration_seconds",
  help: "MCP tool validation duration in seconds (target: <50ms)",
  labelNames: ["server_name", "tool_name", "valid"] as const,
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1], // Sub-50ms focus
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// MCP RESOURCE METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total MCP resource accesses
 */
export const mcpResourceAccessesTotal = new client.Counter({
  name: "aibos_kernel_mcp_resource_accesses_total",
  help: "Total number of MCP resource accesses",
  labelNames: ["server_name", "status"] as const, // status: success|failed
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// MCP SESSION METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total MCP sessions created
 */
export const mcpSessionsCreatedTotal = new client.Counter({
  name: "aibos_kernel_mcp_sessions_created_total",
  help: "Total number of MCP sessions created",
  labelNames: ["server_name"] as const,
  registers: [metricsRegistry],
});

/**
 * Active MCP sessions (gauge)
 */
export const mcpSessionsActive = new client.Gauge({
  name: "aibos_kernel_mcp_sessions_active",
  help: "Number of active MCP sessions",
  labelNames: ["server_name"] as const,
  registers: [metricsRegistry],
});

/**
 * MCP session duration
 */
export const mcpSessionDurationSeconds = new client.Histogram({
  name: "aibos_kernel_mcp_session_duration_seconds",
  help: "MCP session duration in seconds",
  labelNames: ["server_name"] as const,
  buckets: [1, 5, 10, 30, 60, 300, 600], // 1s to 10min
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// MCP ERROR METRICS
// ─────────────────────────────────────────────────────────────

/**
 * Total MCP errors
 */
export const mcpErrorsTotal = new client.Counter({
  name: "aibos_kernel_mcp_errors_total",
  help: "Total number of MCP errors",
  labelNames: ["server_name", "error_code", "operation"] as const, // operation: register|invoke|validate
  registers: [metricsRegistry],
});

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Record manifest registration
 */
export function recordManifestRegistration(
  manifestName: string,
  success: boolean
): void {
  mcpManifestsRegistered.inc({
    manifest_name: manifestName,
    status: success ? "success" : "failed",
  });

  if (success) {
    mcpManifestsActive.inc();
  }
}

/**
 * Record manifest validation duration
 */
export function recordManifestValidation(
  manifestName: string,
  valid: boolean,
  durationMs: number
): void {
  mcpManifestValidationDurationSeconds.observe(
    {
      manifest_name: manifestName,
      valid: valid.toString(),
    },
    durationMs / 1000
  );
}

/**
 * Record tool invocation
 */
export function recordToolInvocation(
  serverName: string,
  toolName: string,
  status: "success" | "failed" | "validation_error",
  durationMs: number
): void {
  mcpToolInvocationsTotal.inc({
    server_name: serverName,
    tool_name: toolName,
    status,
  });

  mcpToolExecutionDurationSeconds.observe(
    {
      server_name: serverName,
      tool_name: toolName,
      status,
    },
    durationMs / 1000
  );
}

/**
 * Record tool validation duration
 */
export function recordToolValidation(
  serverName: string,
  toolName: string,
  valid: boolean,
  durationMs: number
): void {
  mcpToolValidationDurationSeconds.observe(
    {
      server_name: serverName,
      tool_name: toolName,
      valid: valid.toString(),
    },
    durationMs / 1000
  );
}

/**
 * Record resource access
 */
export function recordResourceAccess(
  serverName: string,
  success: boolean
): void {
  mcpResourceAccessesTotal.inc({
    server_name: serverName,
    status: success ? "success" : "failed",
  });
}

/**
 * Record session created
 */
export function recordSessionCreated(serverName: string): void {
  mcpSessionsCreatedTotal.inc({ server_name: serverName });
  mcpSessionsActive.inc({ server_name: serverName });
}

/**
 * Record session closed
 */
export function recordSessionClosed(
  serverName: string,
  durationMs: number
): void {
  mcpSessionsActive.dec({ server_name: serverName });
  mcpSessionDurationSeconds.observe(
    { server_name: serverName },
    durationMs / 1000
  );
}

/**
 * Record MCP error
 */
export function recordMCPError(
  serverName: string,
  errorCode: string,
  operation: "register" | "invoke" | "validate"
): void {
  mcpErrorsTotal.inc({
    server_name: serverName,
    error_code: errorCode,
    operation,
  });
}

