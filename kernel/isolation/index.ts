/**
 * 🏢 AI-BOS Isolation Module v1.0
 * 
 * Multi-tenant isolation zones:
 * - Zone lifecycle management
 * - Per-zone rate limiting
 * - Zone-aware execution
 * - Cross-zone protection
 * 
 * @module @aibos/kernel/isolation
 * @version 1.0.0
 */

// Zone Manager
export { ZoneManager, zoneManager } from "./zone-manager";
export type { ZoneConfig, Zone, ZoneMetrics } from "./zone-manager";

// Zone Rate Limiter
export { ZoneRateLimiter, zoneRateLimiter } from "./zone-rate-limiter";
export type { RateLimitCheck } from "./zone-rate-limiter";

// Zone Executor
export { ZoneExecutor, zoneExecutor } from "./zone-executor";
export type { ZoneExecutionRequest, ZoneExecutionResult } from "./zone-executor";

// Zone Guard
export { ZoneGuard, zoneGuard } from "./zone-guard";
export type { CrossZoneCheck, ZoneAccessRequest } from "./zone-guard";

