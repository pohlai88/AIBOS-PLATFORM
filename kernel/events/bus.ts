import { log } from "../utils/logger";
import { KernelEvent, EventHandler } from "./events.types";
import { EventReplayGuard } from "./event-replay-guard";

const subscribers: Record<string, EventHandler[]> = {};

export const eventBus = {
  publish(event: KernelEvent) {
    // Create envelope for replay detection
    const envelope = {
      type: event.name,
      occurredAt: new Date(event.timestamp).toISOString(),
      tenantId: event.tenant,
      payload: event.payload
    };

    const eventId = EventReplayGuard.makeId(envelope);

    // Check for replay
    if (EventReplayGuard.isReplay(eventId)) {
      log.warn(`🔁 Replay detected, dropping event: ${event.name}`);
      return;
    }
    EventReplayGuard.markSeen(eventId);

    log.info(`📡 Event: ${event.name}`, event);
    
    // Call specific handlers
    const handlers = subscribers[event.name] || [];
    handlers.forEach(h => {
      try {
        h(event);
      } catch (err) {
        log.error(`Event handler error for ${event.name}:`, err);
      }
    });

    // Call wildcard handlers
    const wildcardHandlers = subscribers["*"] || [];
    wildcardHandlers.forEach(h => {
      try {
        h(event);
      } catch (err) {
        log.error(`Wildcard handler error for ${event.name}:`, err);
      }
    });
  },

  subscribe(eventName: string, handler: EventHandler) {
    if (!subscribers[eventName]) subscribers[eventName] = [];
    subscribers[eventName].push(handler);
  },

  unsubscribe(eventName: string, handler: EventHandler) {
    const handlers = subscribers[eventName];
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    }
  }
};

// Legacy exports for backward compatibility
export function publishEvent(name: string, data: any) {
  eventBus.publish({
    name,
    payload: data,
    timestamp: Date.now(),
    tenant: data.__tenant || "unknown",
    engine: data.__engine || "unknown",
    user: data.__user
  });
}

export function subscribe(eventName: string, handler: EventHandler) {
  eventBus.subscribe(eventName, handler);
}

export function unsubscribe(eventName: string, handler: EventHandler) {
  eventBus.unsubscribe(eventName, handler);
}
