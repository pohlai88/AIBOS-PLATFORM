/**
 * 🔷 Neon Serverless PostgreSQL Connector
 * 
 * Connects AI-BOS to Neon Serverless Postgres
 * 
 * Features:
 * - Serverless PostgreSQL (auto-scaling)
 * - Branch-based development (database branching)
 * - Connection pooling via @neondatabase/serverless
 * - WebSocket support for edge runtimes
 * - Autoscaling compute
 * - Point-in-time recovery
 * - Read replicas
 */

import { neon, neonConfig, Pool } from "@neondatabase/serverless";
import { StorageContract, QueryOptions, TransactionContext } from "../types";
import { eventBus } from "../../events/event-bus";

export interface NeonConfig {
  connectionString: string;
  
  // Neon-specific options
  branch?: string; // Development branch name
  useWebSockets?: boolean; // For edge runtimes (Cloudflare Workers, etc.)
  
  // Pooling
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
  
  // Read replicas
  readReplicaConnectionStrings?: string[];
}

export class NeonConnector implements StorageContract {
  public readonly provider = "neon";
  private pool: Pool;
  private readPools: Pool[] = [];
  private config: NeonConfig;
  private sql: ReturnType<typeof neon>; // For serverless queries

  constructor(config: NeonConfig) {
    this.config = config;

    // Configure WebSocket support if needed
    if (config.useWebSockets) {
      neonConfig.webSocketConstructor = WebSocket;
    }

    // Create main connection pool
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections || 20,
      idleTimeoutMillis: config.idleTimeoutMs || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMs || 2000,
    });

    // Create serverless SQL query function (for single queries)
    this.sql = neon(config.connectionString);

    // Create read replica pools
    if (config.readReplicaConnectionStrings && config.readReplicaConnectionStrings.length > 0) {
      this.readPools = config.readReplicaConnectionStrings.map(connStr => 
        new Pool({
          connectionString: connStr,
          max: Math.ceil((config.maxConnections || 20) / 2),
          idleTimeoutMillis: config.idleTimeoutMs || 30000,
        })
      );
    }

    // Error handling
    this.pool.on("error", (err) => {
      console.error("[Neon] Pool error:", err);
      eventBus.publish("storage.error", {
        type: "storage.error",
        provider: "neon",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      console.log("[Neon] Connected to Neon Serverless PostgreSQL");
      if (this.config.branch) {
        console.log(`[Neon] Using branch: ${this.config.branch}`);
      }

      await eventBus.publish("storage.connected", {
        type: "storage.connected",
        provider: "neon",
        branch: this.config.branch,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Neon] Connection failed:", error);
      throw new Error(`Neon connection failed: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    await Promise.all(this.readPools.map(pool => pool.end()));

    console.log("[Neon] Disconnected");

    await eventBus.publish("storage.disconnected", {
      type: "storage.disconnected",
      provider: "neon",
      timestamp: new Date().toISOString(),
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query("SELECT 1 as health");
      return result.rows.length > 0;
    } catch (error) {
      console.error("[Neon] Health check failed:", error);
      return false;
    }
  }

  async query<T = any>(
    sql: string,
    params?: any[],
    options?: QueryOptions
  ): Promise<T[]> {
    const pool = this.selectPool(options?.readOnly);

    try {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    } catch (error: any) {
      console.error("[Neon] Query failed:", error);
      throw error;
    }
  }

  async queryOne<T = any>(
    sql: string,
    params?: any[],
    options?: QueryOptions
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params, options);
    return rows[0] || null;
  }

  async execute(sql: string, params?: any[]): Promise<number> {
    try {
      const result = await this.pool.query(sql, params);
      return result.rowCount || 0;
    } catch (error: any) {
      console.error("[Neon] Execute failed:", error);
      throw error;
    }
  }

  async insert<T = any>(
    table: string,
    data: Record<string, any>
  ): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

    const sql = `
      INSERT INTO ${table} (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.pool.query(sql, values);
    return result.rows[0] as T;
  }

  async update<T = any>(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>
  ): Promise<T[]> {
    const setClauses = Object.keys(data).map((key, i) => `${key} = $${i + 1}`);
    const whereKeys = Object.keys(where);
    const whereClauses = whereKeys.map(
      (key, i) => `${key} = $${i + 1 + Object.keys(data).length}`
    );

    const sql = `
      UPDATE ${table}
      SET ${setClauses.join(", ")}
      WHERE ${whereClauses.join(" AND ")}
      RETURNING *
    `;

    const params = [...Object.values(data), ...Object.values(where)];
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }

  async delete(table: string, where: Record<string, any>): Promise<number> {
    const whereKeys = Object.keys(where);
    const whereClauses = whereKeys.map((key, i) => `${key} = $${i + 1}`);

    const sql = `
      DELETE FROM ${table}
      WHERE ${whereClauses.join(" AND ")}
    `;

    const result = await this.pool.query(sql, Object.values(where));
    return result.rowCount || 0;
  }

  async transaction<T>(
    callback: (ctx: TransactionContext) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const ctx: TransactionContext = {
        query: async <R = any>(sql: string, params?: any[]) => {
          const result = await client.query(sql, params);
          return result.rows as R[];
        },
        execute: async (sql: string, params?: any[]) => {
          const result = await client.query(sql, params);
          return result.rowCount || 0;
        },
      };

      const result = await callback(ctx);

      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async rawQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(sql, params);
    return result.rows as T[];
  }

  // Helper: Select pool
  private selectPool(readOnly?: boolean): Pool {
    if (readOnly && this.readPools.length > 0) {
      const index = Math.floor(Math.random() * this.readPools.length);
      return this.readPools[index];
    }
    return this.pool;
  }

  // Neon-specific: Serverless single query (no pooling, faster for edge)
  async serverlessQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const result = await this.sql(sql, params || []);
      return result as T[];
    } catch (error: any) {
      console.error("[Neon] Serverless query failed:", error);
      throw error;
    }
  }

  // Neon-specific: Get connection metrics
  async getMetrics(): Promise<{
    totalConnections: number;
    idleConnections: number;
    waitingClients: number;
  }> {
    return {
      totalConnections: this.pool.totalCount,
      idleConnections: this.pool.idleCount,
      waitingClients: this.pool.waitingCount,
    };
  }

  // Neon-specific: Create database branch (for dev/staging)
  async createBranch(branchName: string, parentBranch?: string): Promise<void> {
    // This would require Neon API integration
    console.log(`[Neon] Branch creation: ${branchName} (requires Neon API)`);
    throw new Error("Branch creation requires Neon Management API integration");
  }
}

/**
 * Factory function to create Neon connector
 */
export function createNeonConnector(config: NeonConfig): NeonConnector {
  return new NeonConnector(config);
}

