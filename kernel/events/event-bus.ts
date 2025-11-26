/**
 * Event Bus Interface
 * 
 * Abstraction layer for event publishing (in-memory, NATS, etc.)
 * Trace-aware logging for observability
 */

import { createTraceLogger } from "../observability/logger";

export type KernelEventPayload = {
  type?: string;
  name?: string;
  tenantId?: string | null;
  tenant?: string | null;
  timestamp?: string | number;
  traceId?: string | null;
  actionId?: string;
  engine?: string;
  payload?: Record<string, unknown>;
};

export interface EventBusInterface {
  publish(event: KernelEventPayload): Promise<void>;
  subscribe(typeOrListener: string | EventListener, listener?: EventListener): void;
  unsubscribe(typeOrListener: string | EventListener, listener?: EventListener): void;
}

type EventListener = (event: KernelEventPayload) => void;

let busInstance: InMemoryEventBus | null = null;

/**
 * In-memory event bus (default)
 */
class InMemoryEventBus implements EventBusInterface {
  private globalListeners: EventListener[] = [];
  private typedListeners: Map<string, EventListener[]> = new Map();

  async publish(event: KernelEventPayload): Promise<void> {
    const logger = createTraceLogger(typeof event.traceId === 'string' ? event.traceId : undefined);
    logger.debug({ event }, "[EventBus] publish");

    // Normalize event for backward compatibility
    const normalizedEvent: KernelEventPayload = {
      ...event,
      name: event.name ?? event.type,
      tenant: event.tenant ?? event.tenantId,
      timestamp: event.timestamp ?? Date.now(),
    };

    // Notify global listeners (subscribed with "*")
    for (const listener of this.globalListeners) {
      try {
        listener(normalizedEvent);
      } catch (err) {
        logger.error({ err }, "[EventBus] listener error");
      }
    }

    // Notify typed listeners
    const typeListeners = this.typedListeners.get(event.type) ?? [];
    for (const listener of typeListeners) {
      try {
        listener(normalizedEvent);
      } catch (err) {
        logger.error({ err }, "[EventBus] listener error");
      }
    }
  }

  subscribe(typeOrListener: string | EventListener, listener?: EventListener): void {
    if (typeof typeOrListener === 'function') {
      // Single argument: global listener
      this.globalListeners.push(typeOrListener);
    } else if (typeOrListener === '*' && listener) {
      // "*" pattern: global listener
      this.globalListeners.push(listener);
    } else if (listener) {
      // Typed listener
      const existing = this.typedListeners.get(typeOrListener) ?? [];
      existing.push(listener);
      this.typedListeners.set(typeOrListener, existing);
    }
  }

  unsubscribe(typeOrListener: string | EventListener, listener?: EventListener): void {
    if (typeof typeOrListener === 'function') {
      const idx = this.globalListeners.indexOf(typeOrListener);
      if (idx > -1) this.globalListeners.splice(idx, 1);
    } else if (typeOrListener === '*' && listener) {
      const idx = this.globalListeners.indexOf(listener);
      if (idx > -1) this.globalListeners.splice(idx, 1);
    } else if (listener) {
      const existing = this.typedListeners.get(typeOrListener) ?? [];
      const idx = existing.indexOf(listener);
      if (idx > -1) existing.splice(idx, 1);
    }
  }
}

/**
 * Get the event bus instance
 */
export function getEventBus(): InMemoryEventBus {
  if (!busInstance) {
    busInstance = new InMemoryEventBus();
  }
  return busInstance as InMemoryEventBus;
}

/**
 * Set a custom event bus (e.g., NATS adapter)
 */
export function setEventBus(bus: InMemoryEventBus): void {
  busInstance = bus;
}

// ─────────────────────────────────────────────────────────────
// Compatibility exports (for existing code using bus.ts patterns)
// ─────────────────────────────────────────────────────────────

export const eventBus = getEventBus();

export async function publishEvent(event: KernelEventPayload): Promise<void> {
  return eventBus.publish(event);
}

export function subscribe(listener: (event: KernelEventPayload) => void): void {
  eventBus.subscribe(listener);
}

export function unsubscribe(listener: (event: KernelEventPayload) => void): void {
  eventBus.unsubscribe(listener);
}
