/**
 * Kernel Configuration
 * 
 * Centralized config with storage mode toggle
 */

import * as path from "path";

export type StorageMode = "IN_MEMORY" | "SUPABASE";

export interface KernelConfig {
  // Core
  rootDir: string;
  engineDir: string;
  port: number;

  // Storage Mode
  storageMode: StorageMode;

  // Postgres (Supabase)
  supabaseDbUrl: string | undefined;
  dbPoolMax: number;
  dbPoolIdleTimeout: number;

  // Redis
  redisUrl: string | undefined;
  redisTls: boolean;
  redisMaxRetries: number;
  redisRetryDelayMs: number;

  // Timeouts
  dbQueryTimeoutMs: number;
  redisCommandTimeoutMs: number;

  // Auth
  authEnable: boolean;
  authJwtIssuer: string;
  authJwtAudience: string;
  authJwtSecret: string;
  authApiKeyHashSecret: string;
}

let cachedConfig: KernelConfig | null = null;

export function loadConfig(): KernelConfig {
  if (cachedConfig) return cachedConfig;

  cachedConfig = {
    // Core
    rootDir: process.cwd(),
    engineDir: path.join(process.cwd(), "engines"),
    port: Number(process.env.KERNEL_PORT || 5656),

    // Storage Mode
    storageMode: (process.env.KERNEL_STORAGE_MODE as StorageMode) || "IN_MEMORY",

    // Postgres (Supabase)
    supabaseDbUrl: process.env.SUPABASE_DB_URL || process.env.DATABASE_URL,
    dbPoolMax: Number(process.env.DB_POOL_MAX || 10),
    dbPoolIdleTimeout: Number(process.env.DB_POOL_IDLE_TIMEOUT || 30000),

    // Redis
    redisUrl: process.env.REDIS_URL,
    redisTls: process.env.REDIS_TLS === "true",
    redisMaxRetries: Number(process.env.REDIS_MAX_RETRIES || 5),
    redisRetryDelayMs: Number(process.env.REDIS_RETRY_DELAY_MS || 500),

    // Timeouts
    dbQueryTimeoutMs: Number(process.env.DB_QUERY_TIMEOUT_MS || 5000),
    redisCommandTimeoutMs: Number(process.env.REDIS_COMMAND_TIMEOUT_MS || 2000),

    // Auth
    authEnable: process.env.AUTH_ENABLE !== "false",
    authJwtIssuer: process.env.AUTH_JWT_ISSUER || "aibos-kernel",
    authJwtAudience: process.env.AUTH_JWT_AUDIENCE || "aibos-clients",
    authJwtSecret: process.env.AUTH_JWT_SECRET || "dev-secret",
    authApiKeyHashSecret: process.env.AUTH_API_KEY_HASH_SECRET || "dev-api-key-secret",
  };

  return cachedConfig;
}

export function getConfig(): KernelConfig {
  return cachedConfig || loadConfig();
}

export function isProductionStorage(): boolean {
  return getConfig().storageMode === "SUPABASE";
}
