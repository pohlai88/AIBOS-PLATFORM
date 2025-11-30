/**
 * @fileoverview WebSocket Adapter - Real-time bidirectional communication
 * @module @bff/adapters/websocket
 * @description WebSocket server with subscriptions, heartbeats, tenant isolation
 */

import type { BffManifestType } from '../bff.manifest';
import type { KernelExecutor } from '../gateway/mcp-gateway';

// ============================================================================
// Types
// ============================================================================

export interface WsContext {
  tenantId: string;
  userId: string;
  connectionId: string;
  roles: string[];
  permissions: string[];
  protocol: 'websocket';
}

/** Channels requiring specific permissions */
const PROTECTED_CHANNELS: Record<string, string[]> = {
  'system:*': ['subscribe:system'],
  'admin:*': ['subscribe:admin'],
  'engine:*': ['subscribe:engines'],
};

/** Blocked message patterns */
const BLOCKED_PAYLOAD_PATTERNS = [
  /__proto__|prototype|constructor/i,
  /eval|exec|spawn|fork/i,
  /<script|javascript:/i,
];

export interface WsMessage {
  type: 'subscribe' | 'unsubscribe' | 'message' | 'ping' | 'pong' | 'error';
  channel?: string;
  payload?: unknown;
  id?: string;
}

export interface WsConnectionMeta {
  roles?: string[];
  permissions?: string[];
  token?: string;
}

export interface WsConnection {
  id: string;
  tenantId: string;
  userId: string;
  roles: string[];
  permissions: string[];
  subscriptions: Set<string>;
  lastPing: number;
  createdAt: number;
}

export interface WsChannel {
  name: string;
  pattern: string; // e.g., "tenant:{tenantId}:events"
  handler: (ctx: WsContext, payload: unknown) => Promise<void>;
}

// ============================================================================
// WebSocket Adapter
// ============================================================================

/**
 * WebSocket Adapter
 * 
 * Features:
 * - Tenant-isolated connections
 * - Channel-based subscriptions
 * - Heartbeat/ping-pong
 * - Connection limits from manifest
 * - Message rate limiting
 * - Auto-reconnection support
 */
export class WebSocketAdapter {
  private connections = new Map<string, WsConnection>();
  private channels = new Map<string, WsChannel>();
  private messageHandlers = new Map<string, (ctx: WsContext, msg: WsMessage) => Promise<void>>();
  private ready = false;

  // Rate limiting state
  private messageCount = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly kernel: KernelExecutor,
    private readonly manifest: Readonly<BffManifestType>
  ) {
    this.registerCoreChannels();
    this.startHeartbeatCheck();
    this.ready = true;
  }

  // ===========================================================================
  // Channel Registration
  // ===========================================================================

  /**
   * Register core channels
   */
  private registerCoreChannels(): void {
    // Tenant events channel
    this.channels.set('tenant:events', {
      name: 'tenant:events',
      pattern: 'tenant:{tenantId}:events',
      handler: async (ctx, payload) => {
        await this.kernel.run({
          code: 'events.subscribe("tenant")',
          context: 'websocket',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: payload,
        });
      },
    });

    // Engine events channel
    this.channels.set('engine:events', {
      name: 'engine:events',
      pattern: 'engine:{engineName}:events',
      handler: async (ctx, payload) => {
        await this.kernel.run({
          code: 'events.subscribe("engine")',
          context: 'websocket',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: payload,
        });
      },
    });

    // Action results channel
    this.channels.set('action:results', {
      name: 'action:results',
      pattern: 'action:{actionId}:result',
      handler: async (ctx, payload) => {
        await this.kernel.run({
          code: 'events.subscribe("action")',
          context: 'websocket',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: payload,
        });
      },
    });
  }

  // ===========================================================================
  // Connection Management
  // ===========================================================================

  /**
   * Handle new WebSocket connection
   */
  async onConnect(
    connectionId: string,
    tenantId: string,
    userId: string,
    meta?: WsConnectionMeta
  ): Promise<{ success: boolean; error?: string }> {
    // Check connection limit
    const tenantConnections = this.getConnectionsByTenant(tenantId);
    const maxConnections = this.manifest.rateLimits.websocket.connections;

    if (tenantConnections.length >= maxConnections) {
      return {
        success: false,
        error: `Connection limit (${maxConnections}) exceeded for tenant`,
      };
    }

    // Create connection with auth metadata
    const connection: WsConnection = {
      id: connectionId,
      tenantId,
      userId,
      roles: meta?.roles || [],
      permissions: meta?.permissions || [],
      subscriptions: new Set(),
      lastPing: Date.now(),
      createdAt: Date.now(),
    };

    this.connections.set(connectionId, connection);

    return { success: true };
  }

  /**
   * Handle WebSocket disconnection
   */
  onDisconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      // Cleanup subscriptions
      connection.subscriptions.clear();
      this.connections.delete(connectionId);
      this.messageCount.delete(connectionId);
    }
  }

  /**
   * Handle incoming message
   */
  async onMessage(
    connectionId: string,
    message: WsMessage
  ): Promise<WsMessage | null> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return { type: 'error', payload: { code: 'NOT_CONNECTED', message: 'Connection not found' } };
    }

    // Rate limiting
    if (!this.checkMessageRate(connectionId)) {
      return { type: 'error', payload: { code: 'RATE_LIMITED', message: 'Message rate exceeded' } };
    }

    const ctx: WsContext = {
      tenantId: connection.tenantId,
      userId: connection.userId,
      connectionId,
      roles: connection.roles,
      permissions: connection.permissions,
      protocol: 'websocket',
    };

    // Validate payload for dangerous patterns and size
    if (message.payload) {
      const payloadValidation = this.validatePayload(message.payload);
      if (!payloadValidation.valid) {
        return { type: 'error', payload: { code: 'FORBIDDEN', message: payloadValidation.message } };
      }
    }

    switch (message.type) {
      case 'ping':
        connection.lastPing = Date.now();
        return { type: 'pong', id: message.id };

      case 'subscribe':
        return this.handleSubscribe(connection, ctx, message);

      case 'unsubscribe':
        return this.handleUnsubscribe(connection, message);

      case 'message':
        return this.handleMessage(ctx, message);

      default:
        return { type: 'error', payload: { code: 'UNKNOWN_TYPE', message: `Unknown message type: ${message.type}` } };
    }
  }

  // ===========================================================================
  // Subscription Handlers
  // ===========================================================================

  /**
   * Handle subscribe request
   */
  private async handleSubscribe(
    connection: WsConnection,
    ctx: WsContext,
    message: WsMessage
  ): Promise<WsMessage> {
    const channel = message.channel;
    if (!channel) {
      return { type: 'error', payload: { code: 'MISSING_CHANNEL', message: 'Channel is required' } };
    }

    // Validate channel exists
    const channelConfig = this.channels.get(channel);
    if (!channelConfig) {
      return { type: 'error', payload: { code: 'UNKNOWN_CHANNEL', message: `Unknown channel: ${channel}` } };
    }

    // Authorization check for protected channels
    const authCheck = this.checkChannelPermission(ctx, channel);
    if (!authCheck.allowed) {
      return { type: 'error', payload: { code: 'FORBIDDEN', message: authCheck.message } };
    }

    // Tenant isolation: prevent cross-tenant subscription
    if (channel.includes(':') && !channel.includes(ctx.tenantId) && !channel.startsWith('public:')) {
      return { type: 'error', payload: { code: 'TENANT_FORBIDDEN', message: 'Cannot subscribe to other tenant channels' } };
    }

    // Add subscription
    connection.subscriptions.add(channel);

    // Execute channel handler
    try {
      await channelConfig.handler(ctx, message.payload);
    } catch (error) {
      // Log but don't fail subscription
      console.error(`Channel handler error for ${channel}:`, error);
    }

    return {
      type: 'message',
      channel,
      payload: { subscribed: true },
      id: message.id,
    };
  }

  /**
   * Handle unsubscribe request
   */
  private handleUnsubscribe(connection: WsConnection, message: WsMessage): WsMessage {
    const channel = message.channel;
    if (!channel) {
      return { type: 'error', payload: { code: 'MISSING_CHANNEL', message: 'Channel is required' } };
    }

    connection.subscriptions.delete(channel);

    return {
      type: 'message',
      channel,
      payload: { unsubscribed: true },
      id: message.id,
    };
  }

  /**
   * Handle generic message
   */
  private async handleMessage(ctx: WsContext, message: WsMessage): Promise<WsMessage> {
    const handler = this.messageHandlers.get(message.channel || 'default');
    if (handler) {
      await handler(ctx, message);
    }

    return {
      type: 'message',
      payload: { received: true },
      id: message.id,
    };
  }

  // ===========================================================================
  // Broadcasting
  // ===========================================================================

  /**
   * Broadcast message to channel subscribers
   */
  broadcast(channel: string, payload: unknown, tenantId?: string): number {
    let count = 0;

    for (const connection of this.connections.values()) {
      // Filter by tenant if specified
      if (tenantId && connection.tenantId !== tenantId) continue;

      // Check subscription
      if (connection.subscriptions.has(channel)) {
        // In real impl, would send via WebSocket
        count++;
      }
    }

    return count;
  }

  /**
   * Send message to specific connection
   */
  send(connectionId: string, message: WsMessage): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    // In real impl, would send via WebSocket
    return true;
  }

  // ===========================================================================
  // Rate Limiting
  // ===========================================================================

  /**
   * Check message rate for connection
   */
  private checkMessageRate(connectionId: string): boolean {
    const now = Date.now();
    const maxPerSecond = this.manifest.rateLimits.websocket.messagesPerSecond;

    let bucket = this.messageCount.get(connectionId);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + 1000 };
      this.messageCount.set(connectionId, bucket);
    }

    bucket.count++;
    return bucket.count <= maxPerSecond;
  }

  // ===========================================================================
  // Heartbeat
  // ===========================================================================

  /**
   * Start heartbeat check interval
   */
  private startHeartbeatCheck(): void {
    const interval = this.manifest.protocols.websocket.heartbeatInterval || 30000;
    const timeout = interval * 2;

    setInterval(() => {
      const now = Date.now();
      for (const [id, connection] of this.connections) {
        if (now - connection.lastPing > timeout) {
          // Connection timed out
          this.onDisconnect(id);
        }
      }
    }, interval);
  }

  // ===========================================================================
  // Utilities
  // ===========================================================================

  /**
   * Get connections by tenant
   */
  getConnectionsByTenant(tenantId: string): WsConnection[] {
    return Array.from(this.connections.values()).filter(
      (c) => c.tenantId === tenantId
    );
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get channel list
   */
  getChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Add custom channel
   */
  addChannel(channel: WsChannel): void {
    this.channels.set(channel.name, channel);
  }

  /**
   * Add message handler
   */
  addMessageHandler(
    channel: string,
    handler: (ctx: WsContext, msg: WsMessage) => Promise<void>
  ): void {
    this.messageHandlers.set(channel, handler);
  }

  /**
   * Validate payload for dangerous patterns and size (JSON bomb protection)
   */
  private validatePayload(payload: unknown): { valid: boolean; message?: string } {
    if (!payload) return { valid: true };

    // JSON bomb protection: limit payload size
    const maxPayloadSize = 100000; // 100KB default
    let payloadStr: string;
    try {
      payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    } catch {
      return { valid: false, message: 'Payload cannot be serialized (circular reference?)' };
    }

    if (payloadStr.length > maxPayloadSize) {
      return { valid: false, message: `Payload too large (${payloadStr.length} > ${maxPayloadSize})` };
    }

    // Deep nesting protection
    const maxDepth = 20;
    let depth = 0;
    let maxFound = 0;
    for (const char of payloadStr) {
      if (char === '{' || char === '[') {
        depth++;
        maxFound = Math.max(maxFound, depth);
      } else if (char === '}' || char === ']') {
        depth--;
      }
    }
    if (maxFound > maxDepth) {
      return { valid: false, message: `Payload too deeply nested (${maxFound} > ${maxDepth})` };
    }

    // Pattern blocking
    for (const pattern of BLOCKED_PAYLOAD_PATTERNS) {
      if (pattern.test(payloadStr)) {
        return { valid: false, message: 'Payload contains forbidden pattern' };
      }
    }

    return { valid: true };
  }

  /**
   * Check channel permission
   */
  private checkChannelPermission(ctx: WsContext, channel: string): { allowed: boolean; message?: string } {
    for (const [pattern, requiredPerms] of Object.entries(PROTECTED_CHANNELS)) {
      const regex = new RegExp('^' + pattern.replace('*', '.*') + '$');
      if (regex.test(channel)) {
        const hasPermission = requiredPerms.every(perm => ctx.permissions.includes(perm));
        if (!hasPermission) {
          return { allowed: false, message: `Missing permission for channel ${channel}` };
        }
      }
    }
    return { allowed: true };
  }

  /**
   * Check if adapter is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      connections: this.connections.size,
      channels: this.channels.size,
      maxConnections: this.manifest.rateLimits.websocket.connections,
      maxMessagesPerSecond: this.manifest.rateLimits.websocket.messagesPerSecond,
    };
  }
}

/**
 * Factory function
 */
export function createWebSocketAdapter(
  kernel: KernelExecutor,
  manifest: Readonly<BffManifestType>
): WebSocketAdapter {
  return new WebSocketAdapter(kernel, manifest);
}

