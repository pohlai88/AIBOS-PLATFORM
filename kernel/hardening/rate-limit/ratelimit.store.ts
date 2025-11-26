/**
 * Memory-efficient sliding window rate limit store.
 * Used by global, tenant and engine limiters.
 */
export class RateLimitStore {
  private buckets = new Map<string, number[]>();
  private windowMs: number;

  constructor(windowMs: number = 60_000) {
    this.windowMs = windowMs;
  }

  add(key: string) {
    const now = Date.now();
    if (!this.buckets.has(key)) this.buckets.set(key, []);
    const bucket = this.buckets.get(key)!;
    // remove expired
    const fresh = bucket.filter(t => now - t < this.windowMs);
    fresh.push(now);
    this.buckets.set(key, fresh);
    return fresh.length;
  }

  getCount(key: string) {
    const now = Date.now();
    const bucket = this.buckets.get(key) || [];
    return bucket.filter(t => now - t < this.windowMs).length;
  }
}

