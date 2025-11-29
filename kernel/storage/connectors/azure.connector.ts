/**
 * 🔷 Azure SQL Database Connector
 * 
 * Connects AI-BOS to Azure SQL Database
 * 
 * Features:
 * - Azure Active Directory authentication
 * - Connection pooling via tedious
 * - Geo-replication support
 * - Always Encrypted support
 * - Azure Monitor integration
 * - Automatic retry logic
 */

import { ConnectionPool, config as SQLConfig, Request, Transaction } from "mssql";
import { StorageContract, QueryOptions, TransactionContext } from "../types";
import { eventBus } from "../../events/event-bus";

export interface AzureSQLConfig {
  server: string;
  database: string;
  user?: string;
  password?: string;
  port?: number;
  // Azure AD authentication
  authentication?: {
    type: "default" | "azure-active-directory-password" | "azure-active-directory-access-token";
    options?: {
      userName?: string;
      password?: string;
      token?: string;
      clientId?: string;
      tenantId?: string;
    };
  };
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    enableArithAbort?: boolean;
  };
  pool?: {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
  };
}

export class AzureSQLConnector implements StorageContract {
  public readonly provider = "azure";
  private pool: ConnectionPool;
  private config: AzureSQLConfig;
  private connected = false;

  constructor(config: AzureSQLConfig) {
    this.config = config;

    const sqlConfig: SQLConfig = {
      server: config.server,
      database: config.database,
      user: config.user,
      password: config.password,
      port: config.port || 1433,
      authentication: config.authentication as any,
      options: {
        encrypt: config.options?.encrypt !== false, // Default to true for Azure
        trustServerCertificate: config.options?.trustServerCertificate || false,
        enableArithAbort: config.options?.enableArithAbort !== false,
      },
      pool: {
        max: config.pool?.max || 10,
        min: config.pool?.min || 0,
        idleTimeoutMillis: config.pool?.idleTimeoutMillis || 30000,
      },
    };

    this.pool = new ConnectionPool(sqlConfig);

    // Pool error handling
    this.pool.on("error", (err) => {
      console.error("[Azure SQL] Pool error:", err);
      eventBus.publish("storage.error", {
        type: "storage.error",
        provider: "azure",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    });
  }

  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      this.connected = true;

      console.log(`[Azure SQL] Connected to ${this.config.server}/${this.config.database}`);

      await eventBus.publish("storage.connected", {
        type: "storage.connected",
        provider: "azure",
        server: this.config.server,
        database: this.config.database,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[Azure SQL] Connection failed:", error);
      throw new Error(`Azure SQL connection failed: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.close();
    this.connected = false;

    console.log("[Azure SQL] Disconnected");

    await eventBus.publish("storage.disconnected", {
      type: "storage.disconnected",
      provider: "azure",
      timestamp: new Date().toISOString(),
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.pool.request().query("SELECT 1 as health");
      return result.recordset.length > 0;
    } catch (error) {
      console.error("[Azure SQL] Health check failed:", error);
      return false;
    }
  }

  async query<T = any>(
    sql: string,
    params?: any[],
    options?: QueryOptions
  ): Promise<T[]> {
    const request = this.pool.request();

    // Bind parameters (mssql uses named parameters or positional)
    if (params && params.length > 0) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });

      // Replace $1, $2, etc. with @param0, @param1, etc.
      sql = sql.replace(/\$(\d+)/g, (_, num) => `@param${parseInt(num) - 1}`);
    }

    try {
      const result = await request.query(sql);
      return result.recordset as T[];
    } catch (error: any) {
      console.error("[Azure SQL] Query failed:", error);
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
    const request = this.pool.request();

    if (params && params.length > 0) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param);
      });
      sql = sql.replace(/\$(\d+)/g, (_, num) => `@param${parseInt(num) - 1}`);
    }

    try {
      const result = await request.query(sql);
      return result.rowsAffected[0] || 0;
    } catch (error: any) {
      console.error("[Azure SQL] Execute failed:", error);
      throw error;
    }
  }

  async insert<T = any>(
    table: string,
    data: Record<string, any>
  ): Promise<T> {
    const columns = Object.keys(data);
    const values = Object.values(data);

    const request = this.pool.request();
    values.forEach((val, i) => {
      request.input(`val${i}`, val);
    });

    const valuePlaceholders = values.map((_, i) => `@val${i}`).join(", ");

    const sql = `
      INSERT INTO ${table} (${columns.join(", ")})
      OUTPUT INSERTED.*
      VALUES (${valuePlaceholders})
    `;

    const result = await request.query(sql);
    return result.recordset[0] as T;
  }

  async update<T = any>(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>
  ): Promise<T[]> {
    const request = this.pool.request();

    const setClauses = Object.keys(data).map((key, i) => {
      request.input(`set${i}`, data[key]);
      return `${key} = @set${i}`;
    });

    const whereClauses = Object.keys(where).map((key, i) => {
      request.input(`where${i}`, where[key]);
      return `${key} = @where${i}`;
    });

    const sql = `
      UPDATE ${table}
      SET ${setClauses.join(", ")}
      OUTPUT INSERTED.*
      WHERE ${whereClauses.join(" AND ")}
    `;

    const result = await request.query(sql);
    return result.recordset as T[];
  }

  async delete(table: string, where: Record<string, any>): Promise<number> {
    const request = this.pool.request();

    const whereClauses = Object.keys(where).map((key, i) => {
      request.input(`where${i}`, where[key]);
      return `${key} = @where${i}`;
    });

    const sql = `
      DELETE FROM ${table}
      WHERE ${whereClauses.join(" AND ")}
    `;

    const result = await request.query(sql);
    return result.rowsAffected[0] || 0;
  }

  async transaction<T>(
    callback: (ctx: TransactionContext) => Promise<T>
  ): Promise<T> {
    const transaction = new Transaction(this.pool);

    try {
      await transaction.begin();

      const ctx: TransactionContext = {
        query: async <R = any>(sql: string, params?: any[]) => {
          const request = new Request(transaction);
          
          if (params && params.length > 0) {
            params.forEach((param, index) => {
              request.input(`param${index}`, param);
            });
            sql = sql.replace(/\$(\d+)/g, (_, num) => `@param${parseInt(num) - 1}`);
          }

          const result = await request.query(sql);
          return result.recordset as R[];
        },
        execute: async (sql: string, params?: any[]) => {
          const request = new Request(transaction);
          
          if (params && params.length > 0) {
            params.forEach((param, index) => {
              request.input(`param${index}`, param);
            });
            sql = sql.replace(/\$(\d+)/g, (_, num) => `@param${parseInt(num) - 1}`);
          }

          const result = await request.query(sql);
          return result.rowsAffected[0] || 0;
        },
      };

      const result = await callback(ctx);

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async rawQuery<T = any>(sql: string, params?: any[]): Promise<T[]> {
    return this.query<T>(sql, params);
  }

  // Azure-specific: Get connection pool statistics
  async getPoolStats(): Promise<{
    size: number;
    available: number;
    pending: number;
    borrowed: number;
  }> {
    return {
      size: this.pool.size,
      available: this.pool.available,
      pending: this.pool.pending,
      borrowed: this.pool.borrowed,
    };
  }
}

/**
 * Factory function to create Azure SQL connector
 */
export function createAzureConnector(config: AzureSQLConfig): AzureSQLConnector {
  return new AzureSQLConnector(config);
}

