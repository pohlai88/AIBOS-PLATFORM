/**
 * Distributed Policy Cache
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.2: Policy Caching Layer
 * Provides sub-10ms policy evaluation with distributed caching
 */

import type { PolicyContext, PolicyDecision } from "../../policy/types";
import type { PolicyCacheEntry, DistributedCacheConfig } from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("distributed-policy-cache");

/**
 * Distributed Policy Cache
 * 
 * Features:
 * - Sub-10ms cache lookups
 * - LRU eviction policy
 * - TTL-based expiration
 * - Redis backend support (future)
 */
export class DistributedPolicyCache {
  private static instance: DistributedPolicyCache;
  private cache: Map<string, PolicyCacheEntry> = new Map();
  private config: DistributedCacheConfig;
  private nodeId: string;

  // Stats
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    evictions: 0,
  };

  private constructor(config: DistributedCacheConfig, nodeId: string) {
    this.config = config;
    this.nodeId = nodeId;
    
    // Start periodic cleanup
    this.startCleanupInterval();
    
    logger.info({ config, nodeId }, "Distributed Policy Cache initialized");
  }

  public static getInstance(
    config?: DistributedCacheConfig,
    nodeId?: string
  ): DistributedPolicyCache {
    if (!DistributedPolicyCache.instance) {
      const defaultConfig: DistributedCacheConfig = {
        enabled: true,
        ttlSeconds: 300, // 5 minutes
        maxEntries: 10000,
        backend: "memory",
        evictionPolicy: "lru",
      };
      
      DistributedPolicyCache.instance = new DistributedPolicyCache(
        config || defaultConfig,
        nodeId || "node-1"
      );
    }
    return DistributedPolicyCache.instance;
  }

  /**
   * Get cached policy decision
   */
  public async get(context: PolicyContext): Promise<PolicyDecision | null> {
    if (!this.config.enabled) {
      return null;
    }

    const key = this.generateCacheKey(context);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      logger.debug({ key }, "Cache MISS");
      return null;
    }

    // Check if expired
    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      logger.debug({ key }, "Cache MISS (expired)");
      return null;
    }

    this.stats.hits++;
    logger.debug({ key, cacheHitRate: this.getCacheHitRate() }, "Cache HIT");
    return entry.decision;
  }

  /**
   * Set policy decision in cache
   */
  public async set(context: PolicyContext, decision: PolicyDecision): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Enforce max entries (LRU eviction)
    if (this.cache.size >= this.config.maxEntries) {
      this.evictOldest();
    }

    const key = this.generateCacheKey(context);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.config.ttlSeconds * 1000);

    const entry: PolicyCacheEntry = {
      context,
      decision,
      cachedAt: now,
      expiresAt,
      nodeId: this.nodeId,
      version: 1,
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    
    logger.debug({ key, expiresAt }, "Cache SET");
  }

  /**
   * Invalidate cache entry
   */
  public async invalidate(context: PolicyContext): Promise<void> {
    const key = this.generateCacheKey(context);
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      logger.debug({ key }, "Cache INVALIDATE");
    }
  }

  /**
   * Invalidate all cache entries
   */
  public async invalidateAll(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    logger.info({ entriesCleared: size }, "Cache INVALIDATE ALL");
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    hits: number;
    misses: number;
    sets: number;
    evictions: number;
    size: number;
    hitRate: number;
  } {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.getCacheHitRate(),
    };
  }

  /**
   * Get cache hit rate (0-1)
   */
  private getCacheHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Generate cache key from policy context
   */
  private generateCacheKey(context: PolicyContext): string {
    // Create deterministic key from context
    const parts = [
      context.tenantId,
      context.userId || "anonymous",
      context.resource.type,
      context.resource.id,
      context.action,
      JSON.stringify(context.roles || []),
    ];
    
    return parts.join("::");
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      const time = entry.cachedAt.getTime();
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      logger.debug({ key: oldestKey }, "Cache EVICT (LRU)");
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const now = new Date();
      let cleaned = 0;

      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        logger.debug({ cleaned }, "Cache cleanup completed");
      }
    }, 60000); // Every minute
  }
}

export const distributedPolicyCache = DistributedPolicyCache.getInstance();

