/**
 * Agent Memory Manager
 * 
 * GRCD-KERNEL v4.0.0 - Agent Memory Management Enhancement
 * Based on LangChain memory patterns
 * 
 * Provides:
 * - Persistent memory for AI agents across sessions
 * - Context retention for long-running orchestrations
 * - Agent state snapshots and recovery
 * - Memory TTL and cleanup
 */

import { baseLogger as logger } from "../../observability/logger";
import { eventBus } from "../../events/event-bus";
import { appendAuditEntry } from "../../audit/hash-chain.store";
import type { Agent, AgentActionRequest, AgentActionResult, AgentExecutionContext } from "../types";

/**
 * Agent Action History Entry
 */
export interface AgentActionHistory {
  actionId: string;
  actionType: string;
  arguments: Record<string, any>;
  result: AgentActionResult;
  timestamp: Date;
  durationMs: number;
  success: boolean;
}

/**
 * Agent Memory
 * 
 * Persistent memory for an agent across sessions
 */
export interface AgentMemory {
  /**
   * Agent ID
   */
  agentId: string;

  /**
   * Session ID (for multi-session agents)
   */
  sessionId: string;

  /**
   * Context data (key-value store)
   */
  context: Record<string, any>;

  /**
   * Action history (for learning and recovery)
   */
  history: AgentActionHistory[];

  /**
   * Policy evaluation context (for constitutional governance)
   */
  policyContext?: Array<{
    policyId: string;
    decision: "allow" | "deny";
    timestamp: Date;
  }>;

  /**
   * Audit trail (for compliance)
   */
  auditTrail?: Array<{
    action: string;
    timestamp: Date;
    details: Record<string, any>;
  }>;

  /**
   * Metadata
   */
  metadata: {
    createdAt: Date;
    lastAccessed: Date;
    lastUpdated: Date;
    accessCount: number;
    ttl?: number; // Time to live in seconds
    expiresAt?: Date;
  };
}

/**
 * Memory Storage Interface
 */
export interface MemoryStorage {
  /**
   * Save agent memory
   */
  save(memory: AgentMemory): Promise<void>;

  /**
   * Load agent memory
   */
  load(agentId: string, sessionId: string): Promise<AgentMemory | null>;

  /**
   * Delete agent memory
   */
  delete(agentId: string, sessionId: string): Promise<void>;

  /**
   * List all memories for an agent
   */
  listSessions(agentId: string): Promise<string[]>;

  /**
   * Cleanup expired memories
   */
  cleanupExpired(): Promise<number>;
}

/**
 * In-Memory Storage (Default Implementation)
 * 
 * In production, this should be replaced with persistent storage (Redis, Database)
 */
class InMemoryStorage implements MemoryStorage {
  private storage: Map<string, AgentMemory> = new Map();

  private getKey(agentId: string, sessionId: string): string {
    return `${agentId}:${sessionId}`;
  }

  async save(memory: AgentMemory): Promise<void> {
    const key = this.getKey(memory.agentId, memory.sessionId);
    this.storage.set(key, memory);
  }

  async load(agentId: string, sessionId: string): Promise<AgentMemory | null> {
    const key = this.getKey(agentId, sessionId);
    return this.storage.get(key) || null;
  }

  async delete(agentId: string, sessionId: string): Promise<void> {
    const key = this.getKey(agentId, sessionId);
    this.storage.delete(key);
  }

  async listSessions(agentId: string): Promise<string[]> {
    const sessions: string[] = [];
    for (const key of this.storage.keys()) {
      if (key.startsWith(`${agentId}:`)) {
        const sessionId = key.split(":")[1];
        sessions.push(sessionId);
      }
    }
    return sessions;
  }

  async cleanupExpired(): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, memory] of this.storage.entries()) {
      if (memory.metadata.expiresAt && memory.metadata.expiresAt.getTime() < now) {
        this.storage.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Agent Memory Manager
 * 
 * Manages persistent memory for AI agents
 */
export class AgentMemoryManager {
  private static instance: AgentMemoryManager;
  private storage: MemoryStorage;
  private cleanupInterval?: NodeJS.Timeout;

  private constructor(storage?: MemoryStorage) {
    this.storage = storage || new InMemoryStorage();
    this.startCleanup();
  }

  public static getInstance(storage?: MemoryStorage): AgentMemoryManager {
    if (!AgentMemoryManager.instance) {
      AgentMemoryManager.instance = new AgentMemoryManager(storage);
    }
    return AgentMemoryManager.instance;
  }

  /**
   * Get or create agent memory
   */
  public async getMemory(
    agentId: string,
    sessionId: string,
    createIfNotExists: boolean = true
  ): Promise<AgentMemory | null> {
    let memory = await this.storage.load(agentId, sessionId);

    if (!memory && createIfNotExists) {
      memory = this.createMemory(agentId, sessionId);
      await this.storage.save(memory);
    } else if (memory) {
      // Update access metadata
      memory.metadata.lastAccessed = new Date();
      memory.metadata.accessCount++;
      await this.storage.save(memory);
    }

    return memory;
  }

  /**
   * Save agent memory
   */
  public async saveMemory(memory: AgentMemory): Promise<void> {
    memory.metadata.lastUpdated = new Date();
    await this.storage.save(memory);

    // Emit memory updated event
    await eventBus.publishTyped("agent.memory.updated", {
      type: "agent.memory.updated",
      tenantId: "system",
      payload: {
        agentId: memory.agentId,
        sessionId: memory.sessionId,
        contextKeys: Object.keys(memory.context),
        historyCount: memory.history.length,
      },
    });
  }

  /**
   * Add action to history
   */
  public async addActionToHistory(
    agentId: string,
    sessionId: string,
    action: AgentActionHistory
  ): Promise<void> {
    const memory = await this.getMemory(agentId, sessionId, true);
    if (!memory) return;

    // Add to history (keep last 100 actions)
    memory.history.push(action);
    if (memory.history.length > 100) {
      memory.history.shift(); // Remove oldest
    }

    await this.saveMemory(memory);
  }

  /**
   * Update context
   */
  public async updateContext(
    agentId: string,
    sessionId: string,
    updates: Record<string, any>
  ): Promise<void> {
    const memory = await this.getMemory(agentId, sessionId, true);
    if (!memory) return;

    // Merge updates
    memory.context = { ...memory.context, ...updates };

    await this.saveMemory(memory);
  }

  /**
   * Get context value
   */
  public async getContext(
    agentId: string,
    sessionId: string,
    key: string
  ): Promise<any> {
    const memory = await this.getMemory(agentId, sessionId, false);
    return memory?.context[key] || null;
  }

  /**
   * Create memory snapshot
   */
  public async createSnapshot(
    agentId: string,
    sessionId: string
  ): Promise<AgentMemory | null> {
    const memory = await this.getMemory(agentId, sessionId, false);
    if (!memory) return null;

    // Create deep copy
    const snapshot: AgentMemory = {
      ...memory,
      context: { ...memory.context },
      history: [...memory.history],
      policyContext: memory.policyContext ? [...memory.policyContext] : undefined,
      auditTrail: memory.auditTrail ? [...memory.auditTrail] : undefined,
      metadata: {
        ...memory.metadata,
      },
    };

    return snapshot;
  }

  /**
   * Restore from snapshot
   */
  public async restoreFromSnapshot(
    agentId: string,
    sessionId: string,
    snapshot: AgentMemory
  ): Promise<void> {
    // Update session ID if different
    const memory: AgentMemory = {
      ...snapshot,
      agentId,
      sessionId,
      metadata: {
        ...snapshot.metadata,
        lastAccessed: new Date(),
        lastUpdated: new Date(),
      },
    };

    await this.saveMemory(memory);

    logger.info(
      { agentId, sessionId },
      "[AgentMemoryManager] Memory restored from snapshot"
    );
  }

  /**
   * List all sessions for an agent
   */
  public async listSessions(agentId: string): Promise<string[]> {
    return this.storage.listSessions(agentId);
  }

  /**
   * Delete memory
   */
  public async deleteMemory(agentId: string, sessionId: string): Promise<void> {
    await this.storage.delete(agentId, sessionId);

    // Audit deletion
    await appendAuditEntry({
      tenantId: "system",
      actorId: "agent-memory-manager",
      actionId: "agent.memory.deleted",
      payload: {
        agentId,
        sessionId,
        deletedAt: new Date().toISOString(),
      },
    });

    logger.info(
      { agentId, sessionId },
      "[AgentMemoryManager] Memory deleted"
    );
  }

  /**
   * Create new memory
   */
  private createMemory(agentId: string, sessionId: string): AgentMemory {
    const now = new Date();
    return {
      agentId,
      sessionId,
      context: {},
      history: [],
      metadata: {
        createdAt: now,
        lastAccessed: now,
        lastUpdated: now,
        accessCount: 0,
      },
    };
  }

  /**
   * Start cleanup task
   */
  private startCleanup(): void {
    // Cleanup expired memories every hour
    this.cleanupInterval = setInterval(async () => {
      try {
        const cleaned = await this.storage.cleanupExpired();
        if (cleaned > 0) {
          logger.info(
            { cleaned },
            "[AgentMemoryManager] Cleaned up expired memories"
          );
        }
      } catch (error) {
        logger.error(
          { error: error instanceof Error ? error.message : String(error) },
          "[AgentMemoryManager] Error during cleanup"
        );
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Stop cleanup task
   */
  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }
}

/**
 * Singleton instance
 */
export const agentMemoryManager = AgentMemoryManager.getInstance();

