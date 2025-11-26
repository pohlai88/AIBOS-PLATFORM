/**
 * Event Bus Interface
 * 
 * Abstraction layer for event publishing (in-memory, NATS, etc.)
 * Trace-aware logging for observability
 */

import { createTraceLogger } from "../observability/logger";

export type KernelEventPayload = {
  type: string;
  tenantId: string | null;
  timestamp: string;
  traceId?: string | null;
  actionId?: string;
  payload?: Record<string, unknown>;
};

export interface EventBusInterface {
  publish(event: KernelEventPayload): Promise<void>;
}

let busInstance: EventBusInterface | null = null;

/**
 * In-memory event bus (default)
 */
class InMemoryEventBus implements EventBusInterface {
  private listeners: ((event: KernelEventPayload) => void)[] = [];

  async publish(event: KernelEventPayload): Promise<void> {
    const logger = createTraceLogger(event.traceId ?? undefined);
    logger.info({ event }, "[EventBus] publish");

    // Notify listeners
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        logger.error({ err }, "[EventBus] listener error");
      }
    }
  }

  subscribe(listener: (event: KernelEventPayload) => void): void {
    this.listeners.push(listener);
  }

  unsubscribe(listener: (event: KernelEventPayload) => void): void {
    const idx = this.listeners.indexOf(listener);
    if (idx > -1) this.listeners.splice(idx, 1);
  }
}

/**
 * Get the event bus instance
 */
export function getEventBus(): EventBusInterface {
  if (!busInstance) {
    busInstance = new InMemoryEventBus();
  }
  return busInstance;
}

/**
 * Set a custom event bus (e.g., NATS adapter)
 */
export function setEventBus(bus: EventBusInterface): void {
  busInstance = bus;
}
