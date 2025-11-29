/**
 * WebSocket Push Service
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.4: Real-Time Policy Push
 * Pushes policy updates to connected clients via WebSocket
 */

import type { WebSocketClientInfo, WebSocketMessage, PolicyChangeEvent } from "./types";
import { policyChangeStream } from "./policy-change-stream";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("websocket-push");

/**
 * WebSocket Push Service
 * Manages WebSocket connections and pushes policy updates
 */
export class WebSocketPushService {
  private static instance: WebSocketPushService;
  private clients: Map<string, WebSocketClientInfo> = new Map();
  private websockets: Map<string, any> = new Map(); // clientId → WebSocket

  private constructor() {
    // Subscribe to policy changes
    policyChangeStream.subscribe((event) => {
      this.broadcastPolicyUpdate(event);
    });

    // Start heartbeat monitoring
    this.startHeartbeatMonitoring();

    logger.info("WebSocket Push Service initialized");
  }

  public static getInstance(): WebSocketPushService {
    if (!WebSocketPushService.instance) {
      WebSocketPushService.instance = new WebSocketPushService();
    }
    return WebSocketPushService.instance;
  }

  /**
   * Register a WebSocket client
   */
  public registerClient(clientId: string, ws: any, subscriptions: string[] = ["*"]): void {
    const clientInfo: WebSocketClientInfo = {
      clientId,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      subscriptions,
    };

    this.clients.set(clientId, clientInfo);
    this.websockets.set(clientId, ws);

    logger.info({ clientId, subscriptions }, "WebSocket client registered");

    // Send welcome message
    this.sendMessage(clientId, {
      type: "ack",
      payload: { message: "Connected to AI-BOS Policy Update Stream" },
      timestamp: new Date(),
      messageId: `welcome-${clientId}`,
    });
  }

  /**
   * Unregister a WebSocket client
   */
  public unregisterClient(clientId: string): void {
    this.clients.delete(clientId);
    this.websockets.delete(clientId);
    logger.info({ clientId }, "WebSocket client unregistered");
  }

  /**
   * Broadcast policy update to all subscribed clients
   */
  private async broadcastPolicyUpdate(event: PolicyChangeEvent): Promise<void> {
    logger.info({ policyId: event.policyId, type: event.type }, "Broadcasting policy update");

    let broadcastCount = 0;

    for (const [clientId, clientInfo] of this.clients.entries()) {
      // Check if client is subscribed to this policy
      if (this.isSubscribed(clientInfo, event.policyId)) {
        this.sendPolicyUpdate(clientId, event);
        broadcastCount++;
      }
    }

    logger.info({ policyId: event.policyId, broadcastCount }, "Policy update broadcasted");
  }

  /**
   * Send policy update to specific client
   */
  private sendPolicyUpdate(clientId: string, event: PolicyChangeEvent): void {
    const message: WebSocketMessage = {
      type: "policy_update",
      payload: event,
      timestamp: new Date(),
      messageId: `update-${event.policyId}-${Date.now()}`,
    };

    this.sendMessage(clientId, message);
  }

  /**
   * Send message to client
   */
  private sendMessage(clientId: string, message: WebSocketMessage): void {
    const ws = this.websockets.get(clientId);
    if (!ws) {
      logger.warn({ clientId }, "WebSocket not found for client");
      return;
    }

    try {
      ws.send(JSON.stringify(message));
      logger.debug({ clientId, messageType: message.type }, "Message sent to client");
    } catch (error) {
      logger.error({ error, clientId }, "Failed to send message to client");
      this.unregisterClient(clientId);
    }
  }

  /**
   * Check if client is subscribed to policy
   */
  private isSubscribed(clientInfo: WebSocketClientInfo, policyId: string): boolean {
    return (
      clientInfo.subscriptions.includes("*") ||
      clientInfo.subscriptions.includes(policyId)
    );
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeatMonitoring(): void {
    setInterval(() => {
      const now = new Date();
      const timeout = 60000; // 1 minute

      for (const [clientId, clientInfo] of this.clients.entries()) {
        const timeSinceHeartbeat = now.getTime() - clientInfo.lastHeartbeat.getTime();
        
        if (timeSinceHeartbeat > timeout) {
          logger.warn({ clientId, timeSinceHeartbeat }, "Client heartbeat timeout, disconnecting");
          this.unregisterClient(clientId);
        } else {
          // Send heartbeat
          this.sendMessage(clientId, {
            type: "heartbeat",
            payload: {},
            timestamp: new Date(),
            messageId: `heartbeat-${clientId}-${Date.now()}`,
          });
        }
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Update client heartbeat
   */
  public updateHeartbeat(clientId: string): void {
    const clientInfo = this.clients.get(clientId);
    if (clientInfo) {
      clientInfo.lastHeartbeat = new Date();
    }
  }

  /**
   * Get connected client count
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get all connected clients
   */
  public getClients(): WebSocketClientInfo[] {
    return Array.from(this.clients.values());
  }
}

export const websocketPushService = WebSocketPushService.getInstance();

