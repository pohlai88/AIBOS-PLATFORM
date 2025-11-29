/**
 * Distributed Policy Engine Types
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.2: Distributed Policy Evaluation
 * Enables horizontal scaling with caching and consensus
 */

import type { PolicyContext, PolicyDecision } from "../../policy/types";

/**
 * Policy Cache Entry
 */
export interface PolicyCacheEntry {
  context: PolicyContext;
  decision: PolicyDecision;
  cachedAt: Date;
  expiresAt: Date;
  nodeId: string;
  version: number;
}

/**
 * Policy Node Status
 */
export enum PolicyNodeStatus {
  LEADER = "leader",
  FOLLOWER = "follower",
  CANDIDATE = "candidate",
  OFFLINE = "offline",
}

/**
 * Policy Node Info
 */
export interface PolicyNode {
  id: string;
  status: PolicyNodeStatus;
  address: string;
  port: number;
  lastHeartbeat: Date;
  evaluationsPerSecond: number;
  cacheHitRate: number;
  metadata?: {
    region?: string;
    datacenter?: string;
  };
}

/**
 * Policy Replication Message
 */
export interface PolicyReplicationMessage {
  type: "policy_sync" | "policy_update" | "policy_delete";
  policyId: string;
  policy?: any;
  version: number;
  sourceNodeId: string;
  timestamp: Date;
}

/**
 * Distributed Cache Config
 */
export interface DistributedCacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxEntries: number;
  backend: "redis" | "memory";
  redisUrl?: string;
  evictionPolicy: "lru" | "lfu" | "ttl";
}

/**
 * Consensus Config
 */
export interface ConsensusConfig {
  enabled: boolean;
  protocol: "raft" | "none";
  electionTimeoutMs: number;
  heartbeatIntervalMs: number;
  quorumSize: number;
}

/**
 * Load Balancer Strategy
 */
export enum LoadBalancerStrategy {
  ROUND_ROBIN = "round_robin",
  LEAST_CONNECTIONS = "least_connections",
  WEIGHTED = "weighted",
  RANDOM = "random",
}

/**
 * Policy Evaluation Stats
 */
export interface PolicyEvaluationStats {
  totalEvaluations: number;
  cacheHits: number;
  cacheMisses: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorsPerSecond: number;
}

