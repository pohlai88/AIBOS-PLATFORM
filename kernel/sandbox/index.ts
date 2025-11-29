/**
 * 🧠 AI-BOS Sandbox Runtime v3.1
 * 
 * Kernel-grade code execution sandbox with:
 * - Multi-mode execution (VM2, Worker, Hardened-Worker, WASM, Isolated)
 * - AST security scanning (obfuscation, microtask loops, proto access)
 * - Safe globals injection (rate-limited, size-limited)
 * - Contract-aware capabilities
 * - **Per-tenant resource governor**
 * - **Manifest-based permission model**
 * - **Health tracking for Resilience Engine**
 * - Tenant isolation
 * - Telemetry integration
 * 
 * @module @aibos/kernel/sandbox
 * @version 3.1.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type {
  SandboxMode,
  SandboxExecutionOptions,
  SandboxContract,
  SandboxOutput,
  SandboxError,
  SandboxMetrics,
  SandboxLog,
  ASTRiskResult,
  ASTIssue,
  TenantResourceQuota,
  GovernorDecision,
  SandboxHealthEntry,
  SandboxHealthStats,
} from "./types";

// ═══════════════════════════════════════════════════════════
// Main Runtime
// ═══════════════════════════════════════════════════════════

export { SandboxRuntime, sandboxRuntime } from "./sandbox-runtime";

// ═══════════════════════════════════════════════════════════
// Components
// ═══════════════════════════════════════════════════════════

export { ASTScanner, astScanner } from "./ast-scanner";
export { ModeSelector, modeSelector } from "./mode-selector";
export { buildSafeGlobals, type SafeGlobalsContext } from "./safe-globals";

// ═══════════════════════════════════════════════════════════
// Runtimes
// ═══════════════════════════════════════════════════════════

export { runInVM2 } from "./runtime-vm2";
export { runInWorker } from "./runtime-worker";
export { runInHardenedWorker } from "./runtime-hardened-worker";
export { runInIsolated } from "./runtime-isolated";
export { runInWasm } from "./runtime-wasm";

// ═══════════════════════════════════════════════════════════
// Contract Enforcer
// ═══════════════════════════════════════════════════════════

export { ContractEnforcer, contractEnforcer, DEFAULT_CONTRACT, type AdapterManifest } from "./contract-enforcer";

// ═══════════════════════════════════════════════════════════
// Resource Governor
// ═══════════════════════════════════════════════════════════

export { ResourceGovernor, resourceGovernor } from "./resource-governor";

// ═══════════════════════════════════════════════════════════
// Health Tracker
// ═══════════════════════════════════════════════════════════

export { SandboxHealthTracker, sandboxHealthTracker } from "./sandbox-health-tracker";

// ═══════════════════════════════════════════════════════════
// Error Mapper
// ═══════════════════════════════════════════════════════════

export {
  SandboxErrorMapper,
  sandboxErrorMapper,
  SANDBOX_ERROR_TYPES,
  type SandboxErrorType,
  type MappedError,
} from "./error-mapper";

// ═══════════════════════════════════════════════════════════
// Telemetry
// ═══════════════════════════════════════════════════════════

export {
  SandboxTelemetry,
  sandboxTelemetry,
  telemetryStore,
  type TelemetryEntry,
  type TelemetryStats,
} from "./telemetry";

// ═══════════════════════════════════════════════════════════
// MCP Engine Bridge
// ═══════════════════════════════════════════════════════════

export {
  MCPBridge,
  mcpBridge,
  mcpEngineRegistry,
  type MCPEngine,
  type MCPAction,
  type MCPExecutionOptions,
  type MCPExecutionResult,
} from "./mcp-bridge";

// ═══════════════════════════════════════════════════════════
// Quick Usage
// ═══════════════════════════════════════════════════════════

/**
 * Example: Using Sandbox Runtime v3.0
 * 
 * ```typescript
 * import { sandboxRuntime } from '@aibos/kernel/sandbox';
 * 
 * // Execute user code safely
 * const result = await sandboxRuntime.execute({
 *   tenantId: 'tenant-123',
 *   adapterId: 'custom-adapter',
 *   code: `
 *     const data = await fetch('https://api.example.com/data');
 *     return data.json();
 *   `,
 *   contract: {
 *     allowedDomains: ['api.example.com'],
 *     maxExecutionMs: 5000,
 *     allowNetwork: true,
 *   },
 * });
 * 
 * if (result.success) {
 *   console.log('Result:', result.result);
 *   console.log('Mode used:', result.mode);
 *   console.log('Risk score:', result.metrics.astRiskScore);
 * } else {
 *   console.log('Error:', result.error);
 * }
 * 
 * // Check risk before execution
 * const risk = sandboxRuntime.analyzeRisk(userCode);
 * if (risk.score > 50) {
 *   console.log('High risk code:', risk.issues);
 * }
 * ```
 */

