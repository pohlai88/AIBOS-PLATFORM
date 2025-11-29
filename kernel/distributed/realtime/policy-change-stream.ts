/**
 * Policy Change Stream
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.4: Event-Driven Policy Updates
 * Pub/Sub stream for policy change events
 */

import type { PolicyChangeEvent, PolicyChangeStream } from "./types";
import { createTraceLogger } from "../../observability/logger";
import { eventBus } from "../../events/event-bus";

const logger = createTraceLogger("policy-change-stream");

/**
 * Policy Change Stream
 * Event-driven stream for policy changes
 */
export class PolicyChangeStreamImpl implements PolicyChangeStream {
  private static instance: PolicyChangeStreamImpl;
  private subscribers: Set<(event: PolicyChangeEvent) => void> = new Set();

  private constructor() {
    logger.info("Policy Change Stream initialized");
  }

  public static getInstance(): PolicyChangeStreamImpl {
    if (!PolicyChangeStreamImpl.instance) {
      PolicyChangeStreamImpl.instance = new PolicyChangeStreamImpl();
    }
    return PolicyChangeStreamImpl.instance;
  }

  /**
   * Subscribe to policy changes
   */
  public subscribe(callback: (event: PolicyChangeEvent) => void): void {
    this.subscribers.add(callback);
    logger.debug({ subscriberCount: this.subscribers.size }, "Subscriber added");
  }

  /**
   * Unsubscribe from policy changes
   */
  public unsubscribe(callback: (event: PolicyChangeEvent) => void): void {
    this.subscribers.delete(callback);
    logger.debug({ subscriberCount: this.subscribers.size }, "Subscriber removed");
  }

  /**
   * Publish policy change event
   */
  public async publish(event: PolicyChangeEvent): Promise<void> {
    logger.info(
      { type: event.type, policyId: event.policyId, subscriberCount: this.subscribers.size },
      "Publishing policy change event"
    );

    // Publish to kernel event bus
    await eventBus.publish({
      name: `kernel.policy.${event.type}`,
      tenantId: null,
      payload: event,
    });

    // Notify all subscribers
    for (const callback of this.subscribers) {
      try {
        callback(event);
      } catch (error) {
        logger.error({ error, policyId: event.policyId }, "Subscriber callback failed");
      }
    }
  }

  /**
   * Get subscriber count
   */
  public getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

export const policyChangeStream = PolicyChangeStreamImpl.getInstance();

