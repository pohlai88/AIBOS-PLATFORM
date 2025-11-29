// tests/utils/event-tracker.ts

/**
 * Event tracker for testing
 * 
 * Captures all events emitted during tests for assertion
 */
export class EventTracker {
  private events: Array<{ event: string; payload: unknown; timestamp: Date }> =
    [];

  /**
   * Track an event
   */
  track(event: string, payload: unknown): void {
    this.events.push({
      event,
      payload,
      timestamp: new Date(),
    });
  }

  /**
   * Get all tracked events
   */
  getEvents(): Array<{ event: string; payload: unknown; timestamp: Date }> {
    return [...this.events];
  }

  /**
   * Get events by name
   */
  getEventsByName(name: string): Array<{ payload: unknown; timestamp: Date }> {
    return this.events
      .filter((e) => e.event === name)
      .map(({ payload, timestamp }) => ({ payload, timestamp }));
  }

  /**
   * Check if an event was emitted
   */
  hasEvent(name: string): boolean {
    return this.events.some((e) => e.event === name);
  }

  /**
   * Reset all tracked events
   */
  reset(): void {
    this.events = [];
  }

  /**
   * Get event count
   */
  count(): number {
    return this.events.length;
  }
}

/**
 * Global event tracker instance
 */
export const globalEventTracker = new EventTracker();

/**
 * Reset global event tracker
 */
export function resetEvents(): void {
  globalEventTracker.reset();
}

