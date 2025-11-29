/**
 * MCP Session Manager
 * 
 * GRCD-KERNEL v4.0.0 F-5: Support engine lifecycle via MCP
 * Manages MCP server connections and session lifecycle
 */

import type { MCPSession, MCPManifest } from "../types";
import { mcpRegistry } from "../registry/mcp-registry";
import { mcpAuditLogger } from "../audit/mcp-audit";
import { mcpEventEmitter } from "../events/mcp-events";
import { recordSessionCreated, recordSessionClosed } from "../telemetry/mcp-metrics";
import { randomUUID } from "crypto";

/**
 * Session State
 */
type SessionState = "initializing" | "active" | "closing" | "closed" | "error";

/**
 * Enhanced MCP Session with state tracking
 */
interface ManagedSession extends MCPSession {
  state: SessionState;
  lastAccessedAt: Date;
  accessCount: number;
  errorCount: number;
}

/**
 * Session Configuration
 */
export interface SessionConfig {
  /**
   * Maximum idle time before session is automatically closed (ms)
   * Default: 5 minutes
   */
  maxIdleTime?: number;

  /**
   * Maximum session lifetime (ms)
   * Default: 1 hour
   */
  maxLifetime?: number;

  /**
   * Enable automatic session cleanup
   * Default: true
   */
  autoCleanup?: boolean;
}

/**
 * MCP Session Manager - Manages MCP server sessions
 */
export class MCPSessionManager {
  private static instance: MCPSessionManager;
  private sessions: Map<string, ManagedSession> = new Map();
  private cleanupInterval?: NodeJS.Timeout;
  private config: Required<SessionConfig>;

  private constructor(config: SessionConfig = {}) {
    this.config = {
      maxIdleTime: config.maxIdleTime || 5 * 60 * 1000, // 5 minutes
      maxLifetime: config.maxLifetime || 60 * 60 * 1000, // 1 hour
      autoCleanup: config.autoCleanup ?? true,
    };

    if (this.config.autoCleanup) {
      this.startCleanup();
    }
  }

  public static getInstance(config?: SessionConfig): MCPSessionManager {
    if (!MCPSessionManager.instance) {
      MCPSessionManager.instance = new MCPSessionManager(config);
    }
    return MCPSessionManager.instance;
  }

  /**
   * Create new MCP session
   * 
   * @param serverName - MCP server name
   * @param context - Session context (tenant, user, trace)
   * @returns Created session
   */
  public async createSession(
    serverName: string,
    context?: {
      tenantId?: string;
      userId?: string;
      traceId?: string;
    }
  ): Promise<ManagedSession | null> {
    try {
      // 1. Verify server exists
      const entry = mcpRegistry.getByName(serverName);
      if (!entry || entry.status !== "active") {
        return null;
      }

      // 2. Create session
      const sessionId = randomUUID();
      const now = new Date();

      const session: ManagedSession = {
        sessionId,
        manifest: entry.manifest,
        createdAt: now,
        lastAccessedAt: now,
        state: "initializing",
        accessCount: 0,
        errorCount: 0,
        metadata: {
          tenantId: context?.tenantId,
          userId: context?.userId,
        },
      };

      // 3. Store session
      this.sessions.set(sessionId, session);

      // 4. Initialize connection (placeholder)
      // TODO: Implement actual MCP server connection
      await this.initializeConnection(serverName, sessionId);

      // 5. Update state
      session.state = "active";

      // 6. Audit session creation
      await mcpAuditLogger.auditSession(
        "mcp.session.created",
        sessionId,
        serverName,
        context
      );

      // 7. Emit event
      await mcpEventEmitter.emitSessionCreated(sessionId, serverName, context);

      // 8. Record metrics
      recordSessionCreated(serverName);

      return session;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): ManagedSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Update access time
    session.lastAccessedAt = new Date();
    session.accessCount++;

    return session;
  }

  /**
   * Close session
   * 
   * @param sessionId - Session ID to close
   * @param reason - Optional close reason
   */
  public async closeSession(
    sessionId: string,
    reason?: string
  ): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    try {
      // 1. Update state
      session.state = "closing";

      // 2. Close connection (placeholder)
      // TODO: Implement actual MCP server disconnection
      await this.closeConnection(sessionId);

      // 3. Calculate session duration
      const durationMs =
        new Date().getTime() - session.createdAt.getTime();

      // 4. Audit session closure
      await mcpAuditLogger.auditSession(
        "mcp.session.closed",
        sessionId,
        session.manifest.name,
        {
          tenantId: session.metadata.tenantId,
          userId: session.metadata.userId,
        }
      );

      // 5. Emit event
      await mcpEventEmitter.emitSessionClosed(
        sessionId,
        session.manifest.name,
        {
          tenantId: session.metadata.tenantId,
          userId: session.metadata.userId,
        }
      );

      // 6. Record metrics
      recordSessionClosed(session.manifest.name, durationMs);

      // 7. Remove session
      session.state = "closed";
      this.sessions.delete(sessionId);

      return true;
    } catch (error) {
      session.state = "error";
      session.errorCount++;
      return false;
    }
  }

  /**
   * List active sessions
   */
  public listActiveSessions(): ManagedSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.state === "active"
    );
  }

  /**
   * List sessions for a server
   */
  public listSessionsForServer(serverName: string): ManagedSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.manifest.name === serverName
    );
  }

  /**
   * Start automatic cleanup of idle/expired sessions
   */
  private startCleanup(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupSessions();
    }, 60 * 1000);
  }

  /**
   * Cleanup idle and expired sessions
   */
  private async cleanupSessions(): Promise<void> {
    const now = Date.now();

    for (const [sessionId, session] of this.sessions.entries()) {
      const idleTime = now - session.lastAccessedAt.getTime();
      const lifetime = now - session.createdAt.getTime();

      // Close if idle too long
      if (idleTime > this.config.maxIdleTime) {
        await this.closeSession(sessionId, "Idle timeout");
        continue;
      }

      // Close if lifetime exceeded
      if (lifetime > this.config.maxLifetime) {
        await this.closeSession(sessionId, "Lifetime exceeded");
        continue;
      }

      // Close if in error state
      if (session.state === "error" && session.errorCount > 3) {
        await this.closeSession(sessionId, "Too many errors");
      }
    }
  }

  /**
   * Stop cleanup timer
   */
  public stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  /**
   * Close all sessions
   */
  public async closeAllSessions(): Promise<void> {
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(
      sessionIds.map((id) => this.closeSession(id, "Shutdown"))
    );
  }

  /**
   * Initialize MCP server connection (placeholder)
   * 
   * TODO: Implement actual MCP server connection
   */
  private async initializeConnection(
    serverName: string,
    sessionId: string
  ): Promise<void> {
    // Placeholder - will use @modelcontextprotocol/sdk
    // to establish actual connection
  }

  /**
   * Close MCP server connection (placeholder)
   * 
   * TODO: Implement actual MCP server disconnection
   */
  private async closeConnection(sessionId: string): Promise<void> {
    // Placeholder - will use @modelcontextprotocol/sdk
    // to close actual connection
  }
}

/**
 * Export singleton instance
 */
export const mcpSessionManager = MCPSessionManager.getInstance();

