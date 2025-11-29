/**
 * Orchestra Types
 * 
 * GRCD-KERNEL v4.0.0 Section 6.3: AI-Orchestra Coordination
 * Type definitions for the AI-Orchestra ecosystem
 */

/**
 * Orchestra Domains - 8 specialized domains per AI-Orchestra whitepaper
 */
export enum OrchestrationDomain {
  DATABASE = "db",
  UX_UI = "ux-ui",
  BFF_API = "bff-api",
  BACKEND_INFRA = "backend-infra",
  COMPLIANCE = "compliance",
  OBSERVABILITY = "observability",
  FINANCE = "finance",
  DEVEX = "devex",
}

/**
 * Orchestra Agent Definition
 */
export interface OrchestraAgent {
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  mcpTools?: string[]; // MCP tool names this agent can use
}

/**
 * Orchestra Tool Definition
 */
export interface OrchestraTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>; // JSON Schema
  outputSchema?: Record<string, any>;
  requiredPermissions?: string[];
}

/**
 * Orchestra Policy
 */
export interface OrchestraPolicy {
  id: string;
  domain: OrchestrationDomain;
  rule: string;
  precedence: "legal" | "industry" | "internal";
  enforced: boolean;
}

/**
 * Orchestra Manifest - Complete orchestra definition
 */
export interface OrchestraManifest {
  name: string;
  version: string;
  domain: OrchestrationDomain;
  description: string;
  
  /**
   * Agents in this orchestra
   */
  agents: OrchestraAgent[];
  
  /**
   * Tools available to this orchestra
   */
  tools: OrchestraTool[];
  
  /**
   * Policies enforced by this orchestra
   */
  policies: OrchestraPolicy[];
  
  /**
   * Dependencies on other orchestras
   */
  dependencies?: OrchestrationDomain[];
  
  /**
   * MCP servers this orchestra requires
   */
  mcpServers?: string[];
  
  /**
   * Metadata
   */
  metadata?: {
    author?: string;
    tags?: string[];
    priority?: "low" | "medium" | "high" | "critical";
  };
}

/**
 * Orchestra Action Request
 */
export interface OrchestraActionRequest {
  domain: OrchestrationDomain;
  action: string;
  arguments: Record<string, any>;
  context: OrchestraExecutionContext;
}

/**
 * Orchestra Execution Context
 */
export interface OrchestraExecutionContext {
  tenantId?: string;
  userId?: string;
  traceId?: string;
  sessionId?: string;
  
  /**
   * Cross-orchestra context (for coordinated actions)
   */
  orchestrationId?: string;
  parentDomain?: OrchestrationDomain;
  
  /**
   * Authorization context
   */
  permissions?: string[];
  roles?: string[];
}

/**
 * Orchestra Action Result
 */
export interface OrchestraActionResult {
  success: boolean;
  domain: OrchestrationDomain;
  action: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    executionTimeMs: number;
    agentsInvolved?: string[];
    toolsUsed?: string[];
    orchestrationsTriggered?: OrchestrationDomain[];
  };
}

/**
 * Orchestra Registry Entry
 */
export interface OrchestraRegistryEntry {
  manifestHash: string;
  manifest: OrchestraManifest;
  registeredAt: Date;
  status: "active" | "disabled" | "error";
  errorMessage?: string;
}

/**
 * Cross-Orchestra Authorization Request
 */
export interface CrossOrchestraAuthRequest {
  sourceDomain: OrchestrationDomain;
  targetDomain: OrchestrationDomain;
  action: string;
  context: OrchestraExecutionContext;
}

/**
 * Cross-Orchestra Authorization Result
 */
export interface CrossOrchestraAuthResult {
  allowed: boolean;
  reason?: string;
  requiredPermissions?: string[];
}

/**
 * Orchestra Coordination Session
 */
export interface OrchestraCoordinationSession {
  orchestrationId: string;
  initiatingDomain: OrchestrationDomain;
  involvedDomains: OrchestrationDomain[];
  startedAt: Date;
  status: "active" | "completed" | "failed" | "aborted";
  context: OrchestraExecutionContext;
}

/**
 * Orchestra Event Types
 */
export const ORCHESTRA_EVENTS = {
  MANIFEST_REGISTERED: "kernel.orchestra.manifest.registered",
  ACTION_STARTED: "kernel.orchestra.action.started",
  ACTION_COMPLETED: "kernel.orchestra.action.completed",
  ACTION_FAILED: "kernel.orchestra.action.failed",
  CROSS_ORCHESTRA_AUTH: "kernel.orchestra.cross_auth.checked",
  COORDINATION_STARTED: "kernel.orchestra.coordination.started",
  COORDINATION_COMPLETED: "kernel.orchestra.coordination.completed",
} as const;

/**
 * Orchestra Metrics
 */
export interface OrchestraMetrics {
  domain: OrchestrationDomain;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  averageExecutionTimeMs: number;
  crossOrchestraCallsCount: number;
}

