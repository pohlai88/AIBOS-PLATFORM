/**
 * Database - Production-ready PostgreSQL with Supabase
 * 
 * Features:
 * - pg.Pool for connection pooling
 * - Retry with exponential backoff
 * - Health checks
 * - Graceful shutdown
 * - IN_MEMORY mode for tests
 */

import { Pool, PoolConfig, QueryResult as PgQueryResult, QueryResultRow } from "pg";
import { KernelError } from "../errors/kernel-error";
import { getConfig, StorageMode } from "../boot/kernel.config";
import { baseLogger } from "../observability/logger";
import { dbQueryDurationSeconds } from "../observability/metrics";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export type HealthStatus = "healthy" | "degraded" | "down";

export interface HealthResult {
  status: HealthStatus;
  latencyMs: number;
  error?: string;
}

export interface DbClient {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
}

export interface Db {
  getClient(): DbClient;
  health(): Promise<HealthResult>;
  shutdown(): Promise<void>;
  isConnected(): boolean;
}

// ─────────────────────────────────────────────────────────────
// In-Memory Implementation (for tests)
// ─────────────────────────────────────────────────────────────

class InMemoryDb implements Db {
  private connected = false;
  private tables = new Map<string, any[]>();

  async connect(): Promise<void> {
    this.connected = true;
  }

  getClient(): DbClient {
    return {
      query: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
        // Simple mock - returns empty results
        return { rows: [] as T[], rowCount: 0 };
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
    this.tables.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// ─────────────────────────────────────────────────────────────
// Supabase/Postgres Implementation
// ─────────────────────────────────────────────────────────────

class SupabaseDb implements Db {
  private pool: Pool;
  private maxRetries: number;
  private baseDelayMs: number;

  constructor(connectionString: string, poolConfig: Partial<PoolConfig> = {}) {
    // Fix for Supabase pooler connections - add pgbouncer=true if using pooler and parameter is missing
    let fixedConnectionString = connectionString;
    if (connectionString.includes('pooler.supabase.com') && !connectionString.includes('pgbouncer=true')) {
      const separator = connectionString.includes('?') ? '&' : '?';
      fixedConnectionString = `${connectionString}${separator}pgbouncer=true`;
      baseLogger.info("[DB] Added pgbouncer=true parameter for Supabase pooler connection");
    }
    
    this.pool = new Pool({
      connectionString: fixedConnectionString,
      max: poolConfig.max || 10,
      idleTimeoutMillis: poolConfig.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: poolConfig.connectionTimeoutMillis || 5000,
    });
    this.maxRetries = 5;
    this.baseDelayMs = 100;

    // Handle pool errors
    this.pool.on("error", (err) => {
      baseLogger.error({ err }, "[DB] Unexpected error on idle client");
    });
  }

  getClient(): DbClient {
    return {
      query: async <T = any>(text: string, params?: any[]): Promise<QueryResult<T>> => {
        return this.queryWithRetry<T>(text, params);
      },
    };
  }

  private async queryWithRetry<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    let attempt = 0;
    let lastError: Error | null = null;
    const start = process.hrtime.bigint();

    while (attempt < this.maxRetries) {
      try {
        const result: PgQueryResult<T> = await this.pool.query<T>(text, params);

        // Record success metric
        const end = process.hrtime.bigint();
        const durationSec = Number(end - start) / 1e9;
        dbQueryDurationSeconds.observe({ operation: "query" }, durationSec);

        return {
          rows: result.rows,
          rowCount: result.rowCount || 0,
        };
      } catch (err: any) {
        lastError = err;
        
        // Check if this is a connection error and we have a fallback (check BEFORE incrementing attempt)
        // Error might be wrapped in KernelError, so check both err and err.cause
        const rootError = err.cause || err;
        const isConnectionError = rootError.code === "ENOTFOUND" || 
                                  rootError.code === "ECONNREFUSED" || 
                                  err.message?.includes("getaddrinfo") ||
                                  rootError.syscall === "getaddrinfo" ||
                                  rootError.message?.includes("getaddrinfo");
        const fallbackUrl = (this as any).__fallbackUrl;
        const fallbackConfig = (this as any).__fallbackConfig;
        
        // Debug logging
        if (attempt === 0) {
          baseLogger.debug({ 
            hasFallback: !!fallbackUrl, 
            isConnectionError, 
            errorCode: rootError.code, 
            syscall: rootError.syscall,
            errorMessage: err.message 
          }, "[DB] Connection error check");
        }
        
        // Try fallback on first attempt (attempt === 0) if connection error
        if (isConnectionError && fallbackUrl && fallbackConfig && attempt === 0 && !(this as any).__fallbackTried) {
          // Mark that we've tried fallback to avoid infinite loop
          (this as any).__fallbackTried = true;
          
          baseLogger.warn({ error: err.message, code: err.code, syscall: err.syscall }, "[DB] Primary connection failed, switching to fallback");
          try {
            // Create new pool with fallback URL
            const oldPool = this.pool;
            this.pool = new Pool({
              connectionString: fallbackUrl,
              max: fallbackConfig.max || 10,
              idleTimeoutMillis: fallbackConfig.idleTimeoutMillis || 30000,
              connectionTimeoutMillis: 5000,
            });
            
            // Close old pool asynchronously (don't wait)
            oldPool.end().catch((closeErr) => {
              baseLogger.warn({ closeErr }, "[DB] Error closing old pool");
            });
            
            baseLogger.info("[DB] Switched to fallback connection");
            
            // Retry query with fallback connection (don't increment attempt, just retry)
            continue; // Retry with new pool
          } catch (fallbackErr: any) {
            baseLogger.error({ fallbackError: fallbackErr.message }, "[DB] Fallback connection also failed");
            lastError = fallbackErr;
            attempt++; // Increment attempt after fallback fails
          }
        } else {
          attempt++;
        }

        // Don't retry on syntax errors or constraint violations
        if (this.isNonRetryableError(err)) {
          // Record error metric
          const end = process.hrtime.bigint();
          const durationSec = Number(end - start) / 1e9;
          dbQueryDurationSeconds.observe({ operation: "query_error" }, durationSec);

          throw new KernelError(
            `DB query failed: ${err.message}`,
            "DB_QUERY_ERROR",
            err
          );
        }

        if (attempt >= this.maxRetries) break;

        // Exponential backoff
        const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    // Record failure metric after all retries exhausted
    const end = process.hrtime.bigint();
    const durationSec = Number(end - start) / 1e9;
    dbQueryDurationSeconds.observe({ operation: "query_error" }, durationSec);

    throw new KernelError(
      `DB query failed after ${this.maxRetries} attempts`,
      "DB_QUERY_FAILED",
      lastError
    );
  }

  private isNonRetryableError(err: any): boolean {
    // PostgreSQL error codes that shouldn't be retried
    const nonRetryable = [
      "42601", // syntax_error
      "42P01", // undefined_table
      "23505", // unique_violation
      "23503", // foreign_key_violation
      "42703", // undefined_column
    ];
    return nonRetryable.includes(err.code);
  }

  async health(): Promise<HealthResult> {
    const start = Date.now();
    try {
      await this.pool.query("SELECT 1");
      const latencyMs = Date.now() - start;
      return {
        status: latencyMs < 100 ? "healthy" : "degraded",
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
    await this.pool.end();
  }

  isConnected(): boolean {
    return this.pool.totalCount > 0;
  }
}

// ─────────────────────────────────────────────────────────────
// Database Singleton
// ─────────────────────────────────────────────────────────────

let dbInstance: Db | null = null;

export class Database {
  private static instance: Db | null = null;

  /**
   * Initialize database based on storage mode
   * Supports fallback connection string if primary fails
   */
  static init(): void {
    if (this.instance) return;

    const config = getConfig();

    if (config.storageMode === "SUPABASE" && config.supabaseDbUrl) {
      // Create primary connection
      this.instance = new SupabaseDb(config.supabaseDbUrl, {
        max: config.dbPoolMax,
        idleTimeoutMillis: config.dbPoolIdleTimeout,
      });
      baseLogger.info("[DB] Supabase/Postgres mode (primary connection)");
      
      // Store fallback URL for automatic fallback on connection errors
      if (config.supabaseDbUrlFallback && config.supabaseDbUrlFallback !== config.supabaseDbUrl) {
        (this.instance as any).__fallbackUrl = config.supabaseDbUrlFallback;
        (this.instance as any).__fallbackConfig = {
          max: config.dbPoolMax,
          idleTimeoutMillis: config.dbPoolIdleTimeout,
        };
        baseLogger.info({ fallbackUrl: config.supabaseDbUrlFallback.substring(0, 50) + "..." }, "[DB] Fallback connection configured");
      } else {
        baseLogger.warn({ 
          hasFallback: !!config.supabaseDbUrlFallback,
          fallbackLength: config.supabaseDbUrlFallback?.length || 0,
          fallbackEqualsPrimary: config.supabaseDbUrlFallback === config.supabaseDbUrl,
          primaryLength: config.supabaseDbUrl?.length || 0,
          envVar: process.env.SUPABASE_DB_URL_FALLBACK ? 'SET (' + process.env.SUPABASE_DB_URL_FALLBACK.length + ' chars)' : 'NOT SET'
        }, "[DB] Fallback connection NOT configured");
      }
    } else {
      this.instance = new InMemoryDb();
      baseLogger.info("[DB] In-memory mode");
    }

    dbInstance = this.instance;
  }

  /**
   * Get database client for queries
   */
  static getClient(): DbClient {
    if (!this.instance) this.init();
    return this.instance!.getClient();
  }

  /**
   * Execute query (convenience method)
   */
  static async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.getClient().query<T>(text, params);
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
      dbInstance = null;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Legacy Exports (backward compatibility)
// ─────────────────────────────────────────────────────────────

export async function connectDatabase(): Promise<void> {
  Database.init();
  const health = await Database.health();
  if (health.status === "down") {
    throw new KernelError(`Database connection failed: ${health.error}`, "DB_CONNECT_FAILED");
  }
}

export function getDB(): typeof Database {
  return Database;
}
