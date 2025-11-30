/**
 * @fileoverview Hardened Rate Limit Middleware - Multi-tenant, Serverless-safe
 * @module @bff/middleware/rate-limit
 * @description Enterprise-grade rate limiting with pluggable store
 * 
 * Features:
 * - Pluggable store (memory, Redis, Supabase KV)
 * - Serverless-safe (no setInterval leaks)
 * - Tenant ID normalization
 * - Burst + request rate limiting
 * - WebSocket connection/message limits
 * - Per-route rate limit support
 * - Constitution-compliant
 */

import type { BffManifestType } from '../bff.manifest';
import { RedisRateLimitStore } from '../storage/redis-rate-limit-store';

// ============================================================================
// Types
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export interface RateLimitBucket {
  count: number;
  resetAt: number;
}

/**
 * Pluggable rate limit store interface
 * Implement this for Redis, Supabase KV, etc.
 */
export interface RateLimitStore {
  get(key: string): Promise<RateLimitBucket | null>;
  set(key: string, value: RateLimitBucket, ttlMs?: number): Promise<void>;
  increment(key: string, windowMs: number): Promise<RateLimitBucket>;
  delete(key: string): Promise<void>;
}

export interface RateLimitConfig {
  window: string;
  max: number;
}

// ============================================================================
// In-Memory Store (Development/Single Instance)
// ============================================================================

/**
 * In-memory rate limit store
 * Use only for development or single-instance deployments
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, RateLimitBucket>();
  private cleanupScheduled = false;

  async get(key: string): Promise<RateLimitBucket | null> {
    const bucket = this.buckets.get(key);
    if (!bucket) return null;

    // Check if expired
    if (bucket.resetAt < Date.now()) {
      this.buckets.delete(key);
      return null;
    }

    return bucket;
  }

  async set(key: string, value: RateLimitBucket, ttlMs?: number): Promise<void> {
    this.buckets.set(key, value);
    this.scheduleCleanup();
  }

  async increment(key: string, windowMs: number): Promise<RateLimitBucket> {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    // Reset expired bucket or create new
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + windowMs };
    }

    bucket.count++;
    this.buckets.set(key, bucket);
    this.scheduleCleanup();

    return bucket;
  }

  async delete(key: string): Promise<void> {
    this.buckets.delete(key);
  }

  /**
   * Lazy cleanup - only runs when needed, not on interval
   */
  private scheduleCleanup(): void {
    if (this.cleanupScheduled) return;
    if (this.buckets.size < 1000) return; // Only cleanup when needed

    this.cleanupScheduled = true;

    // Use queueMicrotask for serverless safety
    queueMicrotask(() => {
      const now = Date.now();
      for (const [key, bucket] of this.buckets) {
        if (bucket.resetAt < now) {
          this.buckets.delete(key);
        }
      }
      this.cleanupScheduled = false;
    });
  }

  /**
   * Get store stats (for monitoring)
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.buckets.size,
      keys: Array.from(this.buckets.keys()),
    };
  }

  /**
   * Clear all buckets (for testing)
   */
  clear(): void {
    this.buckets.clear();
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Parse window string to milliseconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 60000; // Default 1 minute

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60000;
  }
}

/**
 * Normalize tenant ID for consistent keying
 */
function normalizeTenantId(id: string | null | undefined): string {
  if (!id) return 'anonymous';
  return id.trim().toLowerCase();
}

/**
 * Build rate limit key
 */
function buildKey(
  tenantId: string,
  type: string,
  suffix?: string
): string {
  const base = `rl:${tenantId}:${type}`;
  return suffix ? `${base}:${suffix}` : base;
}

// ============================================================================
// Rate Limit Middleware
// ============================================================================

/**
 * Create rate limit middleware
 * 
 * Features:
 * - Pluggable store (default: in-memory)
 * - Tenant ID normalization
 * - Configurable window/max from manifest
 * - Serverless-safe (no interval timers)
 */
export function createRateLimitMiddleware(
  manifest: Readonly<BffManifestType>,
  options: {
    store?: RateLimitStore;
    redis?: any; // Kernel RedisStore instance
  } = {}
) {
  let store: RateLimitStore;
  if (options.store) {
    store = options.store;
  } else {
    const rateLimitStoreType = process.env.BFF_RATE_LIMIT_STORE || 'memory';
    if (rateLimitStoreType === 'redis' && options.redis) {
      store = new RedisRateLimitStore(options.redis);
    } else {
      store = new InMemoryRateLimitStore();
    }
  }
  const { rateLimits, enforcement } = manifest;

  return async function rateLimit(
    tenantIdRaw: string | null,
    type: 'requests' | 'burst' = 'requests'
  ): Promise<RateLimitResult> {
    // Skip if rate limiting disabled
    if (!enforcement.rateLimitRequired) {
      return { allowed: true, remaining: Infinity, resetAt: 0 };
    }

    const tenantId = normalizeTenantId(tenantIdRaw);
    const config = rateLimits[type];
    const windowMs = parseWindow(config.window);
    const key = buildKey(tenantId, type);

    // Increment and get bucket
    const bucket = await store.increment(key, windowMs);
    const now = Date.now();

    // Check if over limit
    if (bucket.count > config.max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
        retryAfter: Math.max(1, retryAfter),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.max - bucket.count),
      resetAt: bucket.resetAt,
    };
  };
}

// ============================================================================
// Per-Route Rate Limiter
// ============================================================================

export interface RouteRateLimitConfig {
  path: string;
  window: string;
  max: number;
}

/**
 * Create per-route rate limiter
 * 
 * Usage:
 * ```ts
 * const routeLimiter = createRouteRateLimiter(manifest, {
 *   routes: [
 *     { path: '/auth/login', window: '1m', max: 5 },
 *     { path: '/auth/refresh', window: '1m', max: 10 },
 *     { path: '/execute', window: '1m', max: 100 },
 *   ]
 * });
 * ```
 */
export function createRouteRateLimiter(
  manifest: Readonly<BffManifestType>,
  options: {
    store?: RateLimitStore;
    routes?: RouteRateLimitConfig[];
  } = {}
) {
  const store = options.store || new InMemoryRateLimitStore();
  const routes = options.routes || [];

  return async function routeRateLimit(
    tenantId: string | null,
    path: string
  ): Promise<RateLimitResult> {
    // Find matching route config
    const routeConfig = routes.find(
      (r) => path === r.path || path.startsWith(r.path + '/')
    );

    if (!routeConfig) {
      // No specific limit for this route
      return { allowed: true, remaining: Infinity, resetAt: 0 };
    }

    const normalized = normalizeTenantId(tenantId);
    const windowMs = parseWindow(routeConfig.window);
    const key = buildKey(normalized, 'route', routeConfig.path.replace(/\//g, '_'));

    const bucket = await store.increment(key, windowMs);
    const now = Date.now();

    if (bucket.count > routeConfig.max) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, routeConfig.max - bucket.count),
      resetAt: bucket.resetAt,
    };
  };
}

// ============================================================================
// WebSocket Rate Limiter
// ============================================================================

/**
 * Create WebSocket rate limiter
 * 
 * Features:
 * - Connection count limiting
 * - Message rate limiting
 * - Tenant isolation
 */
export function createWsRateLimiter(
  manifest: Readonly<BffManifestType>,
  options: {
    store?: RateLimitStore;
  } = {}
) {
  const store = options.store || new InMemoryRateLimitStore();
  const { rateLimits } = manifest;
  const wsConfig = rateLimits.websocket;

  return {
    /**
     * Check if tenant can open new connection
     */
    async canConnect(tenantId: string): Promise<boolean> {
      const key = buildKey(normalizeTenantId(tenantId), 'ws', 'conn');
      const bucket = await store.get(key);
      return (bucket?.count ?? 0) < wsConfig.connections;
    },

    /**
     * Record new connection
     */
    async onConnect(tenantId: string): Promise<void> {
      const key = buildKey(normalizeTenantId(tenantId), 'ws', 'conn');
      const bucket = (await store.get(key)) ?? { count: 0, resetAt: Infinity };
      bucket.count++;
      await store.set(key, bucket);
    },

    /**
     * Record connection close
     */
    async onDisconnect(tenantId: string): Promise<void> {
      const key = buildKey(normalizeTenantId(tenantId), 'ws', 'conn');
      const bucket = await store.get(key);
      if (bucket) {
        bucket.count = Math.max(0, bucket.count - 1);
        await store.set(key, bucket);
      }
    },

    /**
     * Check if tenant can send message (per-second limit)
     */
    async canSendMessage(tenantId: string): Promise<boolean> {
      const key = buildKey(normalizeTenantId(tenantId), 'ws', 'msg');
      const bucket = await store.increment(key, 1000); // 1 second window
      return bucket.count <= wsConfig.messagesPerSecond;
    },

    /**
     * Get connection count for tenant
     */
    async getConnectionCount(tenantId: string): Promise<number> {
      const key = buildKey(normalizeTenantId(tenantId), 'ws', 'conn');
      const bucket = await store.get(key);
      return bucket?.count ?? 0;
    },

    /**
     * Get limits config
     */
    getLimits() {
      return {
        maxConnections: wsConfig.connections,
        messagesPerSecond: wsConfig.messagesPerSecond,
      };
    },
  };
}

// ============================================================================
// IP-Based Rate Limiter (Global Protection)
// ============================================================================

/**
 * Create IP-based rate limiter for global DDOS protection
 */
export function createIpRateLimiter(
  options: {
    store?: RateLimitStore;
    window?: string;
    max?: number;
  } = {}
) {
  const store = options.store || new InMemoryRateLimitStore();
  const windowMs = parseWindow(options.window || '1m');
  const max = options.max || 1000;

  return async function ipRateLimit(ip: string): Promise<RateLimitResult> {
    // Normalize IP
    const normalizedIp = ip.trim().toLowerCase();
    const key = `rl:ip:${normalizedIp}`;

    const bucket = await store.increment(key, windowMs);
    const now = Date.now();

    if (bucket.count > max) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
        retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, max - bucket.count),
      resetAt: bucket.resetAt,
    };
  };
}

// ============================================================================
// Export Default Store
// ============================================================================

export const defaultStore = new InMemoryRateLimitStore();
