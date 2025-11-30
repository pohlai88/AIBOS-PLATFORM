// core/container.ts
import { Pool } from "pg";
import { createClient } from "redis";
import { eventBus } from "../events/event-bus";
import type {
  ActionContext,
  DatabaseProxy,
  CacheProxy,
  MetadataProxy,
} from "../types/engine.types";

/**
 * Kernel DI Container
 * 
 * Manages lifecycle of core infrastructure components:
 * - PostgreSQL connection pool
 * - Redis cache client
 * - ActionContext builder
 * 
 * Designed to be multi-tenant safe, horizontally scalable, and MCP-compatible.
 */
export class KernelContainer {
  private dbPool: Pool | null = null;
  private redisClient: ReturnType<typeof createClient> | null = null;

  // -------------------------
  // DATABASE LAYER
  // -------------------------
  async getDatabase(): Promise<DatabaseProxy> {
    if (!this.dbPool) {
      this.dbPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }

    return {
      // Query: return all rows
      query: async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
        const result = await this.dbPool!.query(sql, params);
        return result.rows as T[];
      },

      // One: return single row or null
      one: async <T = unknown>(sql: string, params?: unknown[]): Promise<T | null> => {
        const result = await this.dbPool!.query(sql, params);
        return (result.rows[0] as T) ?? null;
      },

      // Many: alias for query (returns all rows)
      many: async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
        const result = await this.dbPool!.query(sql, params);
        return result.rows as T[];
      },

      // None: execute without returning rows (INSERT/UPDATE/DELETE)
      none: async (sql: string, params?: unknown[]): Promise<number> => {
        const result = await this.dbPool!.query(sql, params);
        return result.rowCount ?? 0;
      },
    };
  }

  // -------------------------
  // CACHE LAYER (Redis)
  // -------------------------
  async getCache(): Promise<CacheProxy> {
    if (!this.redisClient) {
      this.redisClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });
      await this.redisClient.connect();
    }

    return {
      get: async <T = unknown>(key: string): Promise<T | null> => {
        const raw = await this.redisClient!.get(key);
        return raw ? JSON.parse(raw) : null;
      },

      set: async (key: string, value: unknown, ttl?: number): Promise<void> => {
        const serialized = JSON.stringify(value);
        if (ttl) {
          await this.redisClient!.setEx(key, ttl, serialized);
        } else {
          await this.redisClient!.set(key, serialized);
        }
      },

      del: async (key: string): Promise<void> => {
        await this.redisClient!.del(key);
      },

      exists: async (key: string): Promise<boolean> => {
        const result = await this.redisClient!.exists(key);
        return result === 1;
      },
    };
  }

  // -------------------------
  // METADATA LAYER (Stub)
  // -------------------------
  private getMetadata(): MetadataProxy {
    return {
      getEntity: async (name: string) => {
        // TODO: Implement metadata registry integration
        console.debug(`[Metadata] getEntity: ${name}`);
        return null;
      },

      getSchema: async (entityName: string) => {
        // TODO: Implement schema registry integration
        console.debug(`[Metadata] getSchema: ${entityName}`);
        return null;
      },

      getContract: async (actionId: string) => {
        // TODO: Implement contract registry integration
        console.debug(`[Metadata] getContract: ${actionId}`);
        return null;
      },
    };
  }

  // -------------------------
  // ACTION CONTEXT BUILDER
  // -------------------------
  async buildActionContext<TInput>(
    input: TInput,
    tenant: string | null,
    user: unknown,
    options?: {
      requestId?: string;
      correlationId?: string;
      engineConfig?: unknown;
    }
  ): Promise<ActionContext<TInput>> {
    const db = await this.getDatabase();
    const cache = await this.getCache();
    const metadata = this.getMetadata();

    return {
      input,
      tenant,
      user,
      db,
      cache,
      metadata,

      // Emit function (directly on context, not wrapped in eventBus)
      emit: (event: string, payload: unknown) => {
        eventBus.publish(event, payload);
      },

      // Log function (directly on context, not wrapped in object)
      log: (...args: unknown[]) => {
        console.info("[ENGINE]", ...args);
      },

      // Engine-specific configuration
      engineConfig: options?.engineConfig || {},

      // Request tracing
      requestId: options?.requestId,
      correlationId: options?.correlationId,
    };
  }

  // -------------------------
  // CLEAN SHUTDOWN
  // -------------------------
  async shutdown(): Promise<void> {
    console.info("[Container] Shutting down...");

    if (this.dbPool) {
      await this.dbPool.end();
      console.info("[Container] Database pool closed");
    }

    if (this.redisClient) {
      await this.redisClient.quit();
      console.info("[Container] Redis client closed");
    }

    console.info("[Container] Shutdown complete");
  }
}

export const kernelContainer = new KernelContainer();

