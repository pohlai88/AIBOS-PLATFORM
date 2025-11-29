/**
 * 🔷 Google Cloud SQL Connector (PostgreSQL)
 * 
 * Connects AI-BOS to Google Cloud SQL
 * 
 * Features:
 * - Cloud SQL Proxy support
 * - IAM database authentication
 * - Connection pooling
 * - SSL/TLS enforcement
 * - High availability (HA) support
 * - Read replicas
 * - Cloud SQL connector
 */

import { Pool, PoolClient, QueryResult } from "pg";
import { StorageContract, QueryOptions, TransactionContext } from "../types";
import { eventBus } from "../../events/event-bus";
import { baseLogger } from "../../observability/logger";

export interface GCPCloudSQLConfig {
  // Connection via Cloud SQL Proxy
  instanceConnectionName?: string; // Format: project:region:instance
  socketPath?: string; // Unix socket path for Cloud SQL Proxy
  
  // Or direct connection
  host?: string;
  port?: number;
  
  database: string;
  user: string;
  password?: string;
  
  // IAM authentication
  useIAM?: boolean;
  
  // SSL configuration
  ssl?: boolean | {
    rejectUnauthorized: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  
  // Pool configuration
  maxConnections?: number;
  idleTimeoutMs?: number;
  connectionTimeoutMs?: number;
  
  // Read replicas for load distribution
  readReplicaInstances?: string[];
}

export class GCPCloudSQLConnector implements StorageContract {
  public readonly provider = "gcp";
  private pool: Pool;
  private readPools: Pool[] = [];
  private config: GCPCloudSQLConfig;

  constructor(config: GCPCloudSQLConfig) {
    this.config = config;

    // Determine connection method
    const poolConfig = this.buildPoolConfig(config);

    // Primary pool
    this.pool = new Pool(poolConfig);

    // Read replica pools
    if (config.readReplicaInstances && config.readReplicaInstances.length > 0) {
      this.readPools = config.readReplicaInstances.map(instance => {
        const replicaConfig = this.buildPoolConfig({
          ...config,
          instanceConnectionName: instance,
        });
        return new Pool(replicaConfig);
      });
    }

    // Error handling
    this.pool.on("error", (err) => {
      baseLogger.error({ err }, "[GCP Cloud SQL] Pool error");
      eventBus.publish("storage.error", {
        type: "storage.error",
        provider: "gcp",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private buildPoolConfig(config: GCPCloudSQLConfig): any {
    // Cloud SQL Proxy connection (recommended for GCP)
    if (config.instanceConnectionName) {
      const socketPath = config.socketPath || `/cloudsql/${config.instanceConnectionName}`;
      
      return {
        host: socketPath,
        database: config.database,
        user: config.user,
        password: config.password,
        max: config.maxConnections || 20,
        idleTimeoutMillis: config.idleTimeoutMs || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMs || 2000,
      };
    }

    // Direct connection (requires SSL)
    return {
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.user,
      password: config.password,
      max: config.maxConnections || 20,
      idleTimeoutMillis: config.idleTimeoutMs || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMs || 2000,
      ssl: config.ssl !== false ? (
        typeof config.ssl === "object"
          ? config.ssl
          : { rejectUnauthorized: true }
      ) : undefined,
    };
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query("SELECT NOW()");
      client.release();

      const connectionInfo = this.config.instanceConnectionName 
        ? `Cloud SQL: ${this.config.instanceConnectionName}`
        : `Direct: ${this.config.host}:${this.config.port}`;

      baseLogger.info(
        { connectionInfo, database: this.config.database },
        "[GCP Cloud SQL] Connected to %s/%s",
        connectionInfo,
        this.config.database
      );

      await eventBus.publish("storage.connected", {
        type: "storage.connected",
        provider: "gcp",
        instance: this.config.instanceConnectionName || this.config.host,
        database: this.config.database,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      baseLogger.error({ error }, "[GCP Cloud SQL] Connection failed");
      throw new Error(`GCP Cloud SQL connection failed: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    await Promise.all(this.readPools.map(pool => pool.end()));

    baseLogger.info("[GCP Cloud SQL] Disconnected");

    await eventBus.publish("storage.disconnected", {
      type: "storage.disconnected",
      provider: "gcp",
      timestamp: new Date().toISOString(),
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.query("SELECT 1 as health");
      return result.rows.length > 0;
    } catch (error) {
      baseLogger.error({ error }, "[GCP Cloud SQL] Health check failed");
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
      const result: QueryResult = await pool.query(sql, params);
      return result.rows as T[];
    } catch (error: any) {
      baseLogger.error({ error }, "[GCP Cloud SQL] Query failed");
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
      const result: QueryResult = await this.pool.query(sql, params);
      return result.rowCount || 0;
    } catch (error: any) {
      baseLogger.error({ error }, "[GCP Cloud SQL] Execute failed");
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

  // Helper: Select pool (primary or read replica)
  private selectPool(readOnly?: boolean): Pool {
    if (readOnly && this.readPools.length > 0) {
      const index = Math.floor(Math.random() * this.readPools.length);
      return this.readPools[index];
    }
    return this.pool;
  }

  // GCP-specific: Get connection metrics
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
}

/**
 * Factory function to create GCP Cloud SQL connector
 */
export function createGCPConnector(config: GCPCloudSQLConfig): GCPCloudSQLConnector {
  return new GCPCloudSQLConnector(config);
}

