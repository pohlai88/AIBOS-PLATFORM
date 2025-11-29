/**
 * ⚡ Cache Manager v1.0
 * 
 * Multi-tier caching:
 * - L1: In-memory hot cache
 * - L2: LRU cache with TTL
 * - Tenant-aware isolation
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface CacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  hits: number;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  entries: number;
  sizeBytes: number;
}

export interface CacheConfig {
  maxEntries: number;
  defaultTTLMs: number;
  maxSizeBytes: number;
}

// ═══════════════════════════════════════════════════════════
// LRU Cache Implementation
// ═══════════════════════════════════════════════════════════

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder: string[] = [];
  private totalSize = 0;
  private hits = 0;
  private misses = 0;

  constructor(private config: CacheConfig) {}

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return undefined;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      this.misses++;
      return undefined;
    }

    // Update access order (move to end)
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
    
    entry.hits++;
    this.hits++;
    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const size = this.estimateSize(value);
    const expiresAt = Date.now() + (ttlMs || this.config.defaultTTLMs);

    // Evict if necessary
    while (
      (this.cache.size >= this.config.maxEntries || 
       this.totalSize + size > this.config.maxSizeBytes) &&
      this.accessOrder.length > 0
    ) {
      this.evictOldest();
    }

    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }

    const entry: CacheEntry<T> = {
      value,
      createdAt: Date.now(),
      expiresAt,
      hits: 0,
      size,
    };

    this.cache.set(key, entry);
    this.accessOrder.push(key);
    this.totalSize += size;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.totalSize -= entry.size;
    return true;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.totalSize = 0;
  }

  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? this.hits / (this.hits + this.misses) : 0,
      entries: this.cache.size,
      sizeBytes: this.totalSize,
    };
  }

  private evictOldest(): void {
    const oldest = this.accessOrder.shift();
    if (oldest) {
      this.delete(oldest);
    }
  }

  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate
    } catch {
      return 1024; // Default 1KB for non-serializable
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Cache Manager
// ═══════════════════════════════════════════════════════════

export class CacheManager {
  private static globalCache = new LRUCache<any>({
    maxEntries: 10000,
    defaultTTLMs: 300000, // 5 minutes
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
  });

  private static tenantCaches = new Map<string, LRUCache<any>>();

  private static tenantConfig: CacheConfig = {
    maxEntries: 1000,
    defaultTTLMs: 300000,
    maxSizeBytes: 5 * 1024 * 1024, // 5MB per tenant
  };

  // ═══════════════════════════════════════════════════════
  // Global Cache
  // ═══════════════════════════════════════════════════════

  static get<T>(key: string): T | undefined {
    return this.globalCache.get(key);
  }

  static set<T>(key: string, value: T, ttlMs?: number): void {
    this.globalCache.set(key, value, ttlMs);
  }

  static delete(key: string): boolean {
    return this.globalCache.delete(key);
  }

  static has(key: string): boolean {
    return this.globalCache.has(key);
  }

  // ═══════════════════════════════════════════════════════
  // Tenant Cache
  // ═══════════════════════════════════════════════════════

  static getTenant<T>(tenantId: string, key: string): T | undefined {
    const cache = this.tenantCaches.get(tenantId);
    return cache?.get(key);
  }

  static setTenant<T>(tenantId: string, key: string, value: T, ttlMs?: number): void {
    let cache = this.tenantCaches.get(tenantId);
    if (!cache) {
      cache = new LRUCache<any>(this.tenantConfig);
      this.tenantCaches.set(tenantId, cache);
    }
    cache.set(key, value, ttlMs);
  }

  static deleteTenant(tenantId: string, key: string): boolean {
    const cache = this.tenantCaches.get(tenantId);
    return cache?.delete(key) || false;
  }

  static clearTenant(tenantId: string): void {
    this.tenantCaches.get(tenantId)?.clear();
  }

  // ═══════════════════════════════════════════════════════
  // Memoization Helper
  // ═══════════════════════════════════════════════════════

  static memoize<T extends (...args: any[]) => any>(
    fn: T,
    keyFn?: (...args: Parameters<T>) => string,
    ttlMs?: number
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyFn ? keyFn(...args) : JSON.stringify(args);
      const cached = this.get<ReturnType<T>>(key);
      if (cached !== undefined) return cached;

      const result = fn(...args);
      this.set(key, result, ttlMs);
      return result;
    }) as T;
  }

  // ═══════════════════════════════════════════════════════
  // Stats
  // ═══════════════════════════════════════════════════════

  static getStats(): { global: CacheStats; tenants: Record<string, CacheStats> } {
    const tenantStats: Record<string, CacheStats> = {};
    for (const [tenantId, cache] of this.tenantCaches) {
      tenantStats[tenantId] = cache.getStats();
    }

    return {
      global: this.globalCache.getStats(),
      tenants: tenantStats,
    };
  }

  static clear(): void {
    this.globalCache.clear();
    this.tenantCaches.clear();
  }
}

export const cacheManager = CacheManager;

