/**
 * RedisStore - Production-ready Redis with ioredis
 * 
 * Features:
 * - ioredis for robust Redis connection
 * - Distributed locks (SET NX PX)
 * - Rate limiting (INCR + EXPIRE)
 * - Health checks
 * - Graceful shutdown
 * - IN_MEMORY mode for tests
 */

import IORedis, { RedisOptions } from "ioredis";
import { KernelError } from "../hardening/errors/kernel-error";
import { getConfig } from "../boot/kernel.config";
import { baseLogger } from "../observability/logger";
import { redisOperationsTotal } from "../observability/metrics";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type HealthStatus = "healthy" | "degraded" | "down";

export interface HealthResult {
  status: HealthStatus;
  latencyMs: number;
  error?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  acquireLock(key: string, ttlMs: number): Promise<boolean>;
  releaseLock(key: string): Promise<void>;
  rateLimit(bucket: string, windowMs: number, max: number): Promise<RateLimitResult>;
}

export interface Redis {
  client: RedisClient;
  health(): Promise<HealthResult>;
  shutdown(): Promise<void>;
  isConnected(): boolean;
}

// ─────────────────────────────────────────────────────────────
// In-Memory Implementation (for tests)
// ─────────────────────────────────────────────────────────────

class InMemoryRedis implements Redis {
  private connected = false;
  private store = new Map<string, { value: string; expiresAt?: number }>();
  private counters = new Map<string, { count: number; expiresAt: number }>();

  async connect(): Promise<void> {
    this.connected = true;
  }

  get client(): RedisClient {
    return {
      get: async (key: string): Promise<string | null> => {
        this.cleanup();
        const entry = this.store.get(key);
        if (!entry) return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
          this.store.delete(key);
          return null;
        }
        return entry.value;
      },

      set: async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
        this.store.set(key, { value, expiresAt });
      },

      del: async (key: string): Promise<void> => {
        this.store.delete(key);
      },

      acquireLock: async (key: string, ttlMs: number): Promise<boolean> => {
        const lockKey = `lock:${key}`;
        const existing = this.store.get(lockKey);
        if (existing && (!existing.expiresAt || Date.now() < existing.expiresAt)) {
          return false;
        }
        this.store.set(lockKey, { value: "1", expiresAt: Date.now() + ttlMs });
        return true;
      },

      releaseLock: async (key: string): Promise<void> => {
        this.store.delete(`lock:${key}`);
      },

      rateLimit: async (bucket: string, windowMs: number, max: number): Promise<RateLimitResult> => {
        const key = `kernel:ratelimit:${bucket}`;
        const now = Date.now();
        let counter = this.counters.get(key);

        if (!counter || now > counter.expiresAt) {
          counter = { count: 0, expiresAt: now + windowMs };
          this.counters.set(key, counter);
        }

        counter.count++;
        const allowed = counter.count <= max;
        const remaining = Math.max(0, max - counter.count);
        const resetMs = counter.expiresAt - now;

        return { allowed, remaining, resetMs };
      },
    };
  }

  async health(): Promise<HealthResult> {
    return {
      status: this.connected ? "healthy" : "down",
      latencyMs: 0,
    };
  }

  async shutdown(): Promise<void> {
    this.connected = false;
    this.store.clear();
    this.counters.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// ioredis Implementation
// ─────────────────────────────────────────────────────────────

class IoRedisImpl implements Redis {
  private redis: IORedis;
  private _connected = false;

  constructor(url: string, options: Partial<RedisOptions> = {}) {
    const config = getConfig();

    this.redis = new IORedis(url, {
      maxRetriesPerRequest: config.redisMaxRetries,
      retryStrategy: (times) => {
        if (times > config.redisMaxRetries) return null;
        return Math.min(times * config.redisRetryDelayMs, 3000);
      },
      enableReadyCheck: true,
      lazyConnect: false,
      ...options,
    });

    this.redis.on("error", (err) => {
      baseLogger.error({ err }, "[Redis] error");
      this._connected = false;
    });

    this.redis.on("connect", () => {
      baseLogger.info("[Redis] connected");
      this._connected = true;
    });

    this.redis.on("reconnecting", () => {
      baseLogger.warn("[Redis] reconnecting...");
    });

    this.redis.on("close", () => {
      baseLogger.info("[Redis] connection closed");
      this._connected = false;
    });
  }

  get client(): RedisClient {
    return {
      get: async (key: string): Promise<string | null> => {
        redisOperationsTotal.inc({ command: "get" });
        return this.redis.get(key);
      },

      set: async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
        redisOperationsTotal.inc({ command: "set" });
        if (ttlSeconds) {
          await this.redis.setex(key, ttlSeconds, value);
        } else {
          await this.redis.set(key, value);
        }
      },

      del: async (key: string): Promise<void> => {
        redisOperationsTotal.inc({ command: "del" });
        await this.redis.del(key);
      },

      acquireLock: async (key: string, ttlMs: number): Promise<boolean> => {
        redisOperationsTotal.inc({ command: "lock" });
        const lockKey = `lock:${key}`;
        // SET key value NX PX ttl
        const result = await this.redis.set(lockKey, "1", "PX", ttlMs, "NX");
        return result === "OK";
      },

      releaseLock: async (key: string): Promise<void> => {
        redisOperationsTotal.inc({ command: "unlock" });
        await this.redis.del(`lock:${key}`);
      },

      rateLimit: async (bucket: string, windowMs: number, max: number): Promise<RateLimitResult> => {
        redisOperationsTotal.inc({ command: "rateLimit" });
        const key = `kernel:ratelimit:${bucket}`;
        const windowSeconds = Math.ceil(windowMs / 1000);

        // INCR + EXPIRE pattern
        const count = await this.redis.incr(key);
        if (count === 1) {
          await this.redis.expire(key, windowSeconds);
        }

        const ttl = await this.redis.pttl(key);
        const allowed = count <= max;
        const remaining = Math.max(0, max - count);
        const resetMs = ttl > 0 ? ttl : windowMs;

        return { allowed, remaining, resetMs };
      },
    };
  }

  async health(): Promise<HealthResult> {
    const start = Date.now();
    try {
      const pong = await Promise.race([
        this.redis.ping(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 2000)
        ),
      ]);

      if (pong !== "PONG") throw new Error("Invalid PING response");

      const latencyMs = Date.now() - start;
      return {
        status: latencyMs < 50 ? "healthy" : "degraded",
        latencyMs,
      };
    } catch (err: any) {
      return {
        status: "down",
        latencyMs: Date.now() - start,
        error: err.message,
      };
    }
  }

  async shutdown(): Promise<void> {
    await this.redis.quit();
  }

  isConnected(): boolean {
    return this._connected && this.redis.status === "ready";
  }
}

// ─────────────────────────────────────────────────────────────
// RedisStore Singleton
// ─────────────────────────────────────────────────────────────

let redisInstance: Redis | null = null;

export class RedisStore {
  private static instance: Redis | null = null;

  /**
   * Initialize Redis based on storage mode
   */
  static init(): void {
    if (this.instance) return;

    const config = getConfig();

    if (config.storageMode === "SUPABASE" && config.redisUrl) {
      this.instance = new IoRedisImpl(config.redisUrl, {
        tls: config.redisTls ? {} : undefined,
      });
      baseLogger.info("[Redis] ioredis mode");
    } else {
      const inMemory = new InMemoryRedis();
      inMemory.connect();
      this.instance = inMemory;
      baseLogger.info("[Redis] In-memory mode");
    }

    redisInstance = this.instance;
  }

  /**
   * Get Redis client
   */
  static getClient(): RedisClient {
    if (!this.instance) this.init();
    return this.instance!.client;
  }

  /**
   * Get value
   */
  static async get(key: string): Promise<string | null> {
    return this.getClient().get(key);
  }

  /**
   * Set value with optional TTL
   */
  static async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    return this.getClient().set(key, value, ttlSeconds);
  }

  /**
   * Delete key
   */
  static async del(key: string): Promise<void> {
    return this.getClient().del(key);
  }

  /**
   * Acquire distributed lock
   */
  static async lock(key: string, ttlMs = 5000): Promise<boolean> {
    return this.getClient().acquireLock(key, ttlMs);
  }

  /**
   * Release distributed lock
   */
  static async unlock(key: string): Promise<void> {
    return this.getClient().releaseLock(key);
  }

  /**
   * Execute with lock (auto-release)
   */
  static async withLock<T>(key: string, fn: () => Promise<T>, ttlMs = 5000): Promise<T> {
    const acquired = await this.lock(key, ttlMs);
    if (!acquired) {
      throw new KernelError(`Failed to acquire lock: ${key}`, "LOCK_FAILED");
    }

    try {
      return await fn();
    } finally {
      await this.unlock(key);
    }
  }

  /**
   * Rate limit check
   */
  static async rateLimit(bucket: string, windowMs: number, max: number): Promise<RateLimitResult> {
    return this.getClient().rateLimit(bucket, windowMs, max);
  }

  /**
   * Health check
   */
  static async health(): Promise<HealthResult> {
    if (!this.instance) this.init();
    return this.instance!.health();
  }

  /**
   * Check connection status
   */
  static isConnected(): boolean {
    return this.instance?.isConnected() ?? false;
  }

  /**
   * Graceful shutdown
   */
  static async shutdown(): Promise<void> {
    if (this.instance) {
      await this.instance.shutdown();
      this.instance = null;
      redisInstance = null;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Legacy Exports (backward compatibility)
// ─────────────────────────────────────────────────────────────

export async function connectCache(): Promise<void> {
  RedisStore.init();
  const health = await RedisStore.health();
  if (health.status === "down") {
    baseLogger.warn({ error: health.error }, "[Redis] connection degraded");
  }
}

export function getCache(): typeof RedisStore {
  return RedisStore;
}
