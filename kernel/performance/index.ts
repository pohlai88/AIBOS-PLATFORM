/**
 * ⚡ Performance Module v1.0
 * 
 * Complete performance optimization stack:
 * - Multi-tier caching
 * - Parallel execution pool
 * - Hot path optimization
 * - Resource throttling
 * 
 * @version 1.0.0
 */

// Cache
export { CacheManager, cacheManager } from "./cache-manager";
export type { CacheEntry, CacheStats, CacheConfig } from "./cache-manager";

// Execution Pool
export { ExecutionPool, executionPool } from "./execution-pool";
export type { Task, TaskResult, TaskPriority, PoolStats } from "./execution-pool";

// Hot Path Optimizer
export { HotPathOptimizer, hotPathOptimizer } from "./hot-path-optimizer";
export type { PathProfile, OptimizationSuggestion } from "./hot-path-optimizer";

// Resource Throttler
export { ResourceThrottler, resourceThrottler } from "./resource-throttler";
export type { ResourceState, ThrottleConfig } from "./resource-throttler";

