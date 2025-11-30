/**
 * 🧠 Sandbox Runtime v3.1 — Types
 * 
 * Kernel Resilience Engine–certified types with:
 * - Per-tenant resource governor
 * - CPU/memory budgets
 * - Network call limits
 * - Log rate limiting
 * - Manifest enforcement
 * 
 * @version 3.1.0
 */

export type SandboxMode = "vm2" | "worker" | "wasm" | "isolated" | "hardened-worker";

export interface SandboxExecutionOptions {
  tenantId: string;
  adapterId?: string;
  engineId?: string;
  code: string;
  context?: Record<string, any>;
  contract?: SandboxContract;
  timeout?: number;
  memoryLimitMB?: number;
  /** Skip AST analysis (only for pre-verified code) */
  skipASTAnalysis?: boolean;
}

export interface SandboxContract {
  // Network
  allowedDomains?: string[];
  allowNetwork?: boolean;
  maxNetworkCalls?: number;
  maxResponseSizeKB?: number;
  maxRequestSizeKB?: number;

  // Modules
  allowedModules?: string[];
  allowFileSystem?: boolean;

  // CPU/Memory
  maxExecutionMs?: number;
  maxMemoryMB?: number;
  cpuBudgetMs?: number;

  // Logging
  maxLogEntries?: number;
  maxLogSizeKB?: number;

  // Security
  capabilities?: string[];
  forbidDynamicKeys?: boolean;
  forbidProtoAccess?: boolean;
  forbidWebAssembly?: boolean;

  // Globals whitelist
  allowedGlobals?: string[];
}

/** Per-tenant resource quotas */
export interface TenantResourceQuota {
  tenantId: string;
  tier: "free" | "pro" | "enterprise" | "kernel";

  // Rate limits
  maxExecutionsPerMinute: number;
  maxConcurrentExecutions: number;

  // Budgets
  cpuBudgetMsPerMinute: number;
  memoryBudgetMBPerMinute: number;
  networkCallsPerMinute: number;

  // Current usage (tracked)
  currentMinuteExecutions: number;
  currentMinuteCpuMs: number;
  currentMinuteMemoryMB: number;
  currentMinuteNetworkCalls: number;
  windowStartMs: number;
}

/** Resource governor decision */
export interface GovernorDecision {
  allowed: boolean;
  reason?: string;
  remainingBudget?: {
    executions: number;
    cpuMs: number;
    memoryMB: number;
    networkCalls: number;
  };
  throttleUntilMs?: number;
}

export interface SandboxOutput {
  success: boolean;
  mode: SandboxMode;
  result?: any;
  error?: SandboxError;
  metrics: SandboxMetrics;
  logs: SandboxLog[];
}

export interface SandboxError {
  type: string;
  message: string;
  stack?: string;
  code?: string;
}

export interface SandboxMetrics {
  durationMs: number;
  memoryUsedMB: number;
  cpuUsage: number;
  networkCalls: number;
  astRiskScore: number;
  logCount: number;
  governorThrottled: boolean;
}

export interface SandboxLog {
  level: "log" | "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
}

export interface ASTRiskResult {
  score: number;
  issues: ASTIssue[];
  complexity: number;
  hasAsyncCode: boolean;
  hasNetworkCalls: boolean;
  estimatedMemoryMB: number;
  hasMicrotaskLoop: boolean;
  hasObfuscation: boolean;
  hasProtoAccess: boolean;
  hasWebAssembly: boolean;
}

export interface ASTIssue {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  line?: number;
  column?: number;
}

/** Sandbox health tracking for resilience engine */
export interface SandboxHealthEntry {
  tenantId: string;
  adapterId?: string;
  timestamp: number;
  success: boolean;
  mode: SandboxMode;
  durationMs: number;
  memoryUsedMB: number;
  riskScore: number;
  errorType?: string;
}

export interface SandboxHealthStats {
  tenantId: string;
  totalExecutions: number;
  successRate: number;
  avgDurationMs: number;
  avgMemoryMB: number;
  avgRiskScore: number;
  failuresByType: Record<string, number>;
  anomalyScore: number;
}

