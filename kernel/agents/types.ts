/**
 * AI Agent Types & Interfaces
 * 
 * AI-BOS Kernel v6.0.0 Phase 5: AI Agent Integration
 * Defines autonomous AI agents that work within the governance framework
 */

import type { OrchestrationDomain } from "../orchestras/types";
import type { PolicyContext } from "../policy/types";

/**
 * Agent Capability Types
 */
export enum AgentCapability {
  DATA_ANALYSIS = "data_analysis",
  OPTIMIZATION = "optimization",
  MONITORING = "monitoring",
  COMPLIANCE = "compliance",
  SECURITY = "security",
  COST_MANAGEMENT = "cost_management",
  PERFORMANCE_TUNING = "performance_tuning",
  AUTOMATION = "automation",
}

/**
 * Agent Status
 */
export enum AgentStatus {
  INITIALIZING = "initializing",
  RUNNING = "running",
  PAUSED = "paused",
  STOPPED = "stopped",
  ERROR = "error",
  UPGRADING = "upgrading",
}

/**
 * Agent Execution Mode
 */
export enum AgentExecutionMode {
  AUTONOMOUS = "autonomous",      // Agent decides when to act
  SCHEDULED = "scheduled",        // Agent runs on schedule
  TRIGGERED = "triggered",        // Agent runs on events
  MANUAL = "manual",             // Agent runs on demand
}

/**
 * Agent Manifest
 */
export interface AgentManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: AgentCapability[];
  orchestraDomains: OrchestrationDomain[];  // Which orchestras can this agent use?
  executionMode: AgentExecutionMode;
  config: AgentConfig;
  metadata?: {
    author?: string;
    tags?: string[];
    priority?: "low" | "medium" | "high" | "critical";
    costPerHour?: number;
  };
}

/**
 * Agent Configuration
 */
export interface AgentConfig {
  maxConcurrentActions: number;
  timeoutMs: number;
  retryAttempts: number;
  resourceLimits: {
    maxMemoryMb: number;
    maxCpuPercent: number;
  };
  schedule?: {
    cron?: string;              // Cron expression for scheduled mode
    intervalMs?: number;         // Interval for periodic execution
  };
  triggers?: {
    events?: string[];          // Event names to trigger on
    conditions?: string[];      // Conditions to evaluate
  };
}

/**
 * Agent Action Request
 */
export interface AgentActionRequest {
  agentId: string;
  actionType: string;
  arguments: Record<string, any>;
  context: AgentExecutionContext;
}

/**
 * Agent Action Result
 */
export interface AgentActionResult {
  success: boolean;
  agentId: string;
  actionType: string;
  data?: any;
  orchestraActionsTriggered?: number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    executionTimeMs: number;
    resourcesUsed?: {
      memoryMb: number;
      cpuPercent: number;
    };
    orchestrasInvolved?: OrchestrationDomain[];
  };
}

/**
 * Agent Execution Context
 */
export interface AgentExecutionContext {
  tenantId: string;
  userId?: string;
  sessionId?: string;
  traceId?: string;
  trigger?: {
    type: "schedule" | "event" | "manual";
    source?: string;
    timestamp: Date;
  };
  memory?: {
    context: Record<string, any>;
    recentHistory?: Array<{
      actionId: string;
      actionType: string;
      timestamp: Date;
      success: boolean;
    }>;
    policyContext?: Array<{
      policyId: string;
      decision: "allow" | "deny";
      timestamp: Date;
    }>;
  };
}

/**
 * Agent Health Status
 */
export interface AgentHealth {
  agentId: string;
  status: AgentStatus;
  uptime: number;              // Milliseconds
  lastHeartbeat: Date;
  resourceUsage: {
    memoryMb: number;
    cpuPercent: number;
  };
  actionsExecuted: {
    total: number;
    successful: number;
    failed: number;
    lastHour: number;
  };
  errors?: {
    recent: Array<{
      timestamp: Date;
      error: string;
    }>;
  };
}

/**
 * Agent Lifecycle Events
 */
export const AGENT_EVENTS = {
  AGENT_REGISTERED: "kernel.agent.registered",
  AGENT_STARTED: "kernel.agent.started",
  AGENT_STOPPED: "kernel.agent.stopped",
  AGENT_PAUSED: "kernel.agent.paused",
  AGENT_RESUMED: "kernel.agent.resumed",
  AGENT_ERROR: "kernel.agent.error",
  AGENT_ACTION_STARTED: "kernel.agent.action.started",
  AGENT_ACTION_COMPLETED: "kernel.agent.action.completed",
  AGENT_ACTION_FAILED: "kernel.agent.action.failed",
  AGENT_HEARTBEAT: "kernel.agent.heartbeat",
  AGENT_UPGRADED: "kernel.agent.upgraded",
} as const;

/**
 * Agent Communication Message
 */
export interface AgentMessage {
  from: string;                // Sender agent ID
  to: string;                  // Recipient agent ID
  type: "request" | "response" | "notification";
  payload: any;
  timestamp: Date;
  correlationId?: string;      // For request-response correlation
}

/**
 * Agent Interface - All agents must implement this
 */
export interface Agent {
  manifest: AgentManifest;
  
  /**
   * Initialize the agent
   */
  initialize(): Promise<void>;
  
  /**
   * Execute an action
   */
  execute(request: AgentActionRequest): Promise<AgentActionResult>;
  
  /**
   * Get current health status
   */
  getHealth(): Promise<AgentHealth>;
  
  /**
   * Pause the agent (stop accepting new actions)
   */
  pause(): Promise<void>;
  
  /**
   * Resume the agent
   */
  resume(): Promise<void>;
  
  /**
   * Stop the agent (cleanup resources)
   */
  stop(): Promise<void>;
  
  /**
   * Handle incoming messages from other agents
   */
  handleMessage?(message: AgentMessage): Promise<void>;
}

/**
 * Agent Registry Entry
 */
export interface AgentRegistryEntry {
  agent: Agent;
  manifest: AgentManifest;
  status: AgentStatus;
  registeredAt: Date;
  startedAt?: Date;
  health?: AgentHealth;
}

