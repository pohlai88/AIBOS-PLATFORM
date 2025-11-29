/**
 * Real-Time Policy Updates Types
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.4: Real-Time Policy Updates
 * Enables zero-downtime policy propagation via WebSocket
 */

import type { PolicyManifest } from "../../policy/types";

/**
 * Policy Change Event
 */
export interface PolicyChangeEvent {
  type: "created" | "updated" | "deleted" | "enabled" | "disabled";
  policyId: string;
  policy?: PolicyManifest;
  previousVersion?: string;
  newVersion?: string;
  timestamp: Date;
  sourceNodeId: string;
  metadata?: {
    reason?: string;
    userId?: string;
  };
}

/**
 * Policy Change Stream
 */
export interface PolicyChangeStream {
  subscribe(callback: (event: PolicyChangeEvent) => void): void;
  unsubscribe(callback: (event: PolicyChangeEvent) => void): void;
  publish(event: PolicyChangeEvent): Promise<void>;
}

/**
 * WebSocket Message
 */
export interface WebSocketMessage {
  type: "policy_update" | "heartbeat" | "ack";
  payload: any;
  timestamp: Date;
  messageId: string;
}

/**
 * WebSocket Client Info
 */
export interface WebSocketClientInfo {
  clientId: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  subscriptions: string[]; // Policy IDs or wildcards
  metadata?: {
    nodeId?: string;
    tenantId?: string;
  };
}

/**
 * Update Rollout Strategy
 */
export enum RolloutStrategy {
  IMMEDIATE = "immediate",      // Push to all immediately
  CANARY = "canary",            // Gradual rollout (10% → 50% → 100%)
  SCHEDULED = "scheduled",       // Schedule for specific time
  MANUAL = "manual",            // Manual approval required
}

/**
 * Policy Update Rollout
 */
export interface PolicyUpdateRollout {
  policyId: string;
  strategy: RolloutStrategy;
  targetNodes?: string[];      // Specific nodes (for canary)
  scheduledAt?: Date;          // For scheduled strategy
  progress: {
    total: number;
    updated: number;
    failed: number;
  };
  status: "pending" | "in_progress" | "completed" | "failed" | "rolled_back";
}

