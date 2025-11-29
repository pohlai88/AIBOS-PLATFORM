/**
 * Local Storage Connector (SQLite)
 * 
 * Perfect for:
 * - Micro-SMEs (RM0/month)
 * - Development & testing
 * - On-premise deployments
 * - Full control, zero cloud costs
 * - USB NAS device in office
 * 
 * Features:
 * - Zero external dependencies
 * - File-based storage
 * - Portable (can copy database file)
 * - Perfect for "start small, scale later" approach
 * 
 * @module storage/connectors/local.connector
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type {
    StorageProvider,
    StorageConfig,
    QueryOptions,
    TableSchema,
    StorageContract,
} from '../types';

export class LocalConnector implements StorageProvider {
    name = 'local';
    private databases = new Map<string, any>();
    private storageBasePath = process.env.LOCAL_STORAGE_PATH || './storage';

    async initialize(config: StorageConfig): Promise<void> {
        // Import sqlite3 (dynamic to avoid bundling if not used)
        const sqlite3 = await import('sqlite3');
        const { open } = await import('sqlite');

        const dbPath = config.options?.dbPath as string || path.join(this.storageBasePath, 'local.db');

        // Ensure directory exists
        await fs.mkdir(path.dirname(dbPath), { recursive: true });

        // Open SQLite database
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Enable WAL mode for better concurrency
        await db.exec('PRAGMA journal_mode = WAL');
        await db.exec('PRAGMA foreign_keys = ON');

        this.databases.set(dbPath, db);

        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import('../../observability/logger');
        baseLogger.info({ dbPath }, "[LocalConnector] Initialized at: %s", dbPath);
    }

    async validateConfig(config: StorageConfig): Promise<void> {
        // No specific validation needed for local storage
    }

    // ─────────────────────────────────────────────────────────────
    // Object Storage (File System)
    // ─────────────────────────────────────────────────────────────

    async putObject(bucket: string, key: string, data: Buffer, config: StorageConfig): Promise<void> {
        const filePath = path.join(this.storageBasePath, bucket, key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, data);
    }

    async getObject(bucket: string, key: string, config: StorageConfig): Promise<Buffer> {
        const filePath = path.join(this.storageBasePath, bucket, key);
        return await fs.readFile(filePath);
    }

    async deleteObject(bucket: string, key: string, config: StorageConfig): Promise<void> {
        const filePath = path.join(this.storageBasePath, bucket, key);
        await fs.unlink(filePath);
    }

    async listObjects(bucket: string, prefix: string | undefined, config: StorageConfig): Promise<string[]> {
        const dirPath = path.join(this.storageBasePath, bucket, prefix || '');
        try {
            const files = await fs.readdir(dirPath, { recursive: true });
            return files.filter((f: any) => !f.isDirectory());
        } catch {
            return [];
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Database Operations (SQLite)
    // ─────────────────────────────────────────────────────────────

    async findMany(tableName: string, options: QueryOptions | undefined, config: StorageConfig): Promise<unknown[]> {
        const db = this.getDatabase(config);

        let sql = `SELECT ${options?.select?.join(',') || '*'} FROM ${tableName}`;
        const params: any[] = [];

        // Build WHERE clause
        if (options?.where) {
            const whereClauses = Object.entries(options.where).map(([key, value]) => {
                params.push(value);
                return `${key} = ?`;
            });
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        // Build ORDER BY clause
        if (options?.orderBy) {
            const orderClauses = Object.entries(options.orderBy).map(([key, direction]) => {
                return `${key} ${direction.toUpperCase()}`;
            });
            sql += ` ORDER BY ${orderClauses.join(', ')}`;
        }

        // Build LIMIT/OFFSET
        if (options?.limit) {
            sql += ` LIMIT ${options.limit}`;
        }
        if (options?.offset) {
            sql += ` OFFSET ${options.offset}`;
        }

        const rows = await db.all(sql, params);
        return rows || [];
    }

    async findOne(tableName: string, options: QueryOptions, config: StorageConfig): Promise<unknown | null> {
        const results = await this.findMany(tableName, { ...options, limit: 1 }, config);
        return results[0] || null;
    }

    async create(tableName: string, data: unknown, config: StorageConfig): Promise<unknown> {
        const db = this.getDatabase(config);

        if (typeof data !== 'object' || !data) {
            throw new Error('Data must be an object');
        }

        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');

        const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        const result = await db.run(sql, values);

        // Return inserted row
        return await this.findOne(tableName, { where: { id: result.lastID } }, config);
    }

    async update(tableName: string, where: unknown, data: unknown, config: StorageConfig): Promise<unknown> {
        const db = this.getDatabase(config);

        if (typeof data !== 'object' || !data) {
            throw new Error('Data must be an object');
        }

        const setClauses = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const setValues = Object.values(data);

        let sql = `UPDATE ${tableName} SET ${setClauses}`;
        const params: any[] = [...setValues];

        // Build WHERE clause
        if (where && typeof where === 'object') {
            const whereClauses = Object.entries(where).map(([key, value]) => {
                params.push(value);
                return `${key} = ?`;
            });
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        await db.run(sql, params);

        // Return updated row
        return await this.findOne(tableName, { where }, config);
    }

    async delete(tableName: string, where: unknown, config: StorageConfig): Promise<{ count: number }> {
        const db = this.getDatabase(config);

        let sql = `DELETE FROM ${tableName}`;
        const params: any[] = [];

        // Build WHERE clause
        if (where && typeof where === 'object') {
            const whereClauses = Object.entries(where).map(([key, value]) => {
                params.push(value);
                return `${key} = ?`;
            });
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        const result = await db.run(sql, params);
        return { count: result.changes || 0 };
    }

    async count(tableName: string, options: QueryOptions | undefined, config: StorageConfig): Promise<number> {
        const db = this.getDatabase(config);

        let sql = `SELECT COUNT(*) as count FROM ${tableName}`;
        const params: any[] = [];

        // Build WHERE clause
        if (options?.where) {
            const whereClauses = Object.entries(options.where).map(([key, value]) => {
                params.push(value);
                return `${key} = ?`;
            });
            sql += ` WHERE ${whereClauses.join(' AND ')}`;
        }

        const result = await db.get(sql, params);
        return result?.count || 0;
    }

    // ─────────────────────────────────────────────────────────────
    // Raw SQL & Transactions
    // ─────────────────────────────────────────────────────────────

    async query<T = unknown>(sql: string, params: unknown[] | undefined, config: StorageConfig): Promise<T[]> {
        const db = this.getDatabase(config);
        const rows = await db.all(sql, params || []);
        return rows || [];
    }

    async transaction<T>(callback: (tx: StorageContract) => Promise<T>, config: StorageConfig): Promise<T> {
        const db = this.getDatabase(config);

        await db.exec('BEGIN TRANSACTION');

        try {
            const result = await callback({} as StorageContract);
            await db.exec('COMMIT');
            return result;
        } catch (err) {
            await db.exec('ROLLBACK');
            throw err;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Schema Management
    // ─────────────────────────────────────────────────────────────

    async createTable(tableName: string, schema: TableSchema, config: StorageConfig): Promise<void> {
        const db = this.getDatabase(config);

        const columns = schema.columns.map(col => {
            const type = this.mapColumnType(col.type);
            const nullable = col.nullable ? '' : 'NOT NULL';
            const unique = col.unique ? 'UNIQUE' : '';
            return `${col.name} ${type} ${nullable} ${unique}`;
        }).join(', ');

        const primaryKey = schema.primaryKey ? `, PRIMARY KEY (${schema.primaryKey})` : '';
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns}${primaryKey})`;

        await db.exec(sql);

        // Create indexes
        if (schema.indexes) {
            for (const index of schema.indexes) {
                const indexSql = `CREATE ${index.unique ? 'UNIQUE' : ''} INDEX IF NOT EXISTS ${index.name} ON ${tableName} (${index.columns.join(', ')})`;
                await db.exec(indexSql);
            }
        }
    }

    async dropTable(tableName: string, config: StorageConfig): Promise<void> {
        const db = this.getDatabase(config);
        await db.exec(`DROP TABLE IF EXISTS ${tableName}`);
    }

    async listTables(config: StorageConfig): Promise<string[]> {
        const db = this.getDatabase(config);
        const rows = await db.all<{ name: string }[]>(
            `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
        );
        return rows.map(r => r.name);
    }

    async getTableSchema(tableName: string, config: StorageConfig): Promise<TableSchema> {
        const db = this.getDatabase(config);
        const rows = await db.all<any[]>(`PRAGMA table_info(${tableName})`);

        const columns = rows.map(r => ({
            name: r.name,
            type: this.reverseMapColumnType(r.type),
            nullable: r.notnull === 0,
            defaultValue: r.dflt_value,
        }));

        const primaryKey = rows.find(r => r.pk === 1)?.name;

        return { columns, primaryKey };
    }

    // ─────────────────────────────────────────────────────────────
    // Import/Export (CSV/Excel)
    // ─────────────────────────────────────────────────────────────

    async importCSV(tableName: string, csvData: string, config: StorageConfig): Promise<{ imported: number }> {
        const lines = csvData.split('\n').filter(l => l.trim());
        if (lines.length === 0) return { imported: 0 };

        const headers = lines[0].split(',').map(h => h.trim());
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: any = {};
            headers.forEach((h, idx) => {
                row[h] = values[idx];
            });

            await this.create(tableName, row, config);
            imported++;
        }

        return { imported };
    }

    async exportCSV(tableName: string, config: StorageConfig): Promise<string> {
        const rows = await this.findMany(tableName, undefined, config);
        if (rows.length === 0) return '';

        const headers = Object.keys(rows[0] as object);
        const csvLines = [headers.join(',')];

        for (const row of rows) {
            const values = headers.map(h => (row as any)[h]);
            csvLines.push(values.join(','));
        }

        return csvLines.join('\n');
    }

    async importExcel(tableName: string, excelBuffer: Buffer, config: StorageConfig): Promise<{ imported: number }> {
        // Would use library like 'xlsx' to parse Excel
        return { imported: 0 };
    }

    async exportExcel(tableName: string, config: StorageConfig): Promise<Buffer> {
        const csv = await this.exportCSV(tableName, config);
        return Buffer.from(csv);
    }

    // ─────────────────────────────────────────────────────────────
    // Health Check
    // ─────────────────────────────────────────────────────────────

    async healthCheck(config: StorageConfig): Promise<{ healthy: boolean; latencyMs: number }> {
        const startTime = Date.now();
        try {
            const db = this.getDatabase(config);
            await db.get('SELECT 1');
            return { healthy: true, latencyMs: Date.now() - startTime };
        } catch {
            return { healthy: false, latencyMs: Date.now() - startTime };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────

    private getDatabase(config: StorageConfig): any {
        const dbPath = config.options?.dbPath as string || path.join(this.storageBasePath, 'local.db');
        const db = this.databases.get(dbPath);
        if (!db) {
            throw new Error('Local database not initialized');
        }
        return db;
    }

    private mapColumnType(type: string): string {
        const mapping: Record<string, string> = {
            string: 'TEXT',
            number: 'REAL',
            boolean: 'INTEGER',
            date: 'TEXT',
            json: 'TEXT',
            binary: 'BLOB',
        };
        return mapping[type] || 'TEXT';
    }

    private reverseMapColumnType(sqliteType: string): 'string' | 'number' | 'boolean' | 'date' | 'json' | 'binary' {
        const mapping: Record<string, any> = {
            TEXT: 'string',
            REAL: 'number',
            INTEGER: 'number',
            BLOB: 'binary',
        };
        return mapping[sqliteType.toUpperCase()] || 'string';
    }
}

export const localConnector = new LocalConnector();

