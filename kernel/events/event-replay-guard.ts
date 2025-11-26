/**
 * EventReplayGuard - Prevents duplicate event processing
 * 
 * Hardening v2: Ensures idempotency and prevents replay attacks
 */

import crypto from "node:crypto";

export interface KernelEventEnvelope {
  id: string;               // uuid or hash
  type: string;
  occurredAt: string;       // ISO string
  tenantId?: string;
  payload: unknown;
}

export class EventReplayGuard {
  private static seen = new Set<string>();
  private static timestamps = new Map<string, number>();
  private static REPLAY_WINDOW_MS = 60_000; // 1 minute window

  static makeId(event: Omit<KernelEventEnvelope, "id">): string {
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(event))
      .digest("hex");
    return hash;
  }

  static markSeen(id: string): void {
    this.seen.add(id);
    this.timestamps.set(id, Date.now());
  }

  static isReplay(id: string): boolean {
    this.cleanup();
    return this.seen.has(id);
  }

  /**
   * Check and mark in one atomic operation
   * Returns true if event should be processed (not a duplicate)
   */
  static tryProcess(id: string): boolean {
    if (this.isReplay(id)) {
      return false;
    }
    this.markSeen(id);
    return true;
  }

  /**
   * Cleanup expired entries
   */
  static cleanup(): void {
    const now = Date.now();
    for (const [id, timestamp] of this.timestamps.entries()) {
      if (now - timestamp > this.REPLAY_WINDOW_MS) {
        this.seen.delete(id);
        this.timestamps.delete(id);
      }
    }
  }

  static clear(): void {
    this.seen.clear();
    this.timestamps.clear();
  }
}
