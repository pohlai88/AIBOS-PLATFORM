/**
 * Supabase Storage Connector
 * 
 * Perfect for SMEs:
 * - Free tier available (RM0/month for micro-SMEs)
 * - Serverless (no ops overhead)
 * - Built-in auth, storage, realtime
 * - Easy to scale
 * 
 * @module storage/connectors/supabase.connector
 */

import type {
    StorageProvider,
    StorageConfig,
    QueryOptions,
    TableSchema,
    StorageContract,
} from '../types';

export class SupabaseConnector implements StorageProvider {
    name = 'supabase';
    private clients = new Map<string, any>();

    async initialize(config: StorageConfig): Promise<void> {
        // Import Supabase client (dynamic to avoid bundling if not used)
        const { createClient } = await import('@supabase/supabase-js');

        if (!config.connectionString) {
            throw new Error('Supabase requires connectionString (project URL)');
        }

        // Extract API key from credentials
        const apiKey = config.credentials?.secretAccessKey || process.env.SUPABASE_KEY;
        if (!apiKey) {
            throw new Error('Supabase requires API key in credentials.secretAccessKey');
        }

        const client = createClient(config.connectionString, apiKey);
        this.clients.set(config.connectionString, client);

        console.info('[SupabaseConnector] Initialized');
    }

    async validateConfig(config: StorageConfig): Promise<void> {
        if (!config.connectionString?.includes('supabase.co')) {
            throw new Error('Invalid Supabase URL');
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Object Storage (Supabase Storage)
    // ─────────────────────────────────────────────────────────────

    async putObject(bucket: string, key: string, data: Buffer, config: StorageConfig): Promise<void> {
        const client = this.getClient(config);
        const { error } = await client.storage.from(bucket).upload(key, data, {
            upsert: true,
        });

        if (error) {
            throw new Error(`Supabase putObject failed: ${error.message}`);
        }
    }

    async getObject(bucket: string, key: string, config: StorageConfig): Promise<Buffer> {
        const client = this.getClient(config);
        const { data, error } = await client.storage.from(bucket).download(key);

        if (error) {
            throw new Error(`Supabase getObject failed: ${error.message}`);
        }

        return Buffer.from(await data.arrayBuffer());
    }

    async deleteObject(bucket: string, key: string, config: StorageConfig): Promise<void> {
        const client = this.getClient(config);
        const { error } = await client.storage.from(bucket).remove([key]);

        if (error) {
            throw new Error(`Supabase deleteObject failed: ${error.message}`);
        }
    }

    async listObjects(bucket: string, prefix: string | undefined, config: StorageConfig): Promise<string[]> {
        const client = this.getClient(config);
        const { data, error } = await client.storage.from(bucket).list(prefix);

        if (error) {
            throw new Error(`Supabase listObjects failed: ${error.message}`);
        }

        return data.map((item: any) => item.name);
    }

    // ─────────────────────────────────────────────────────────────
    // Database Operations (Supabase PostgreSQL)
    // ─────────────────────────────────────────────────────────────

    async findMany(tableName: string, options: QueryOptions | undefined, config: StorageConfig): Promise<unknown[]> {
        const client = this.getClient(config);
        let query = client.from(tableName).select(options?.select?.join(',') || '*');

        // Apply filters
        if (options?.where) {
            for (const [key, value] of Object.entries(options.where)) {
                query = query.eq(key, value);
            }
        }

        // Apply ordering
        if (options?.orderBy) {
            for (const [key, direction] of Object.entries(options.orderBy)) {
                query = query.order(key, { ascending: direction === 'asc' });
            }
        }

        // Apply pagination
        if (options?.limit) {
            query = query.limit(options.limit);
        }
        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Supabase findMany failed: ${error.message}`);
        }

        return data || [];
    }

    async findOne(tableName: string, options: QueryOptions, config: StorageConfig): Promise<unknown | null> {
        const results = await this.findMany(tableName, { ...options, limit: 1 }, config);
        return results[0] || null;
    }

    async create(tableName: string, data: unknown, config: StorageConfig): Promise<unknown> {
        const client = this.getClient(config);
        const { data: result, error } = await client.from(tableName).insert(data).select().single();

        if (error) {
            throw new Error(`Supabase create failed: ${error.message}`);
        }

        return result;
    }

    async update(tableName: string, where: unknown, data: unknown, config: StorageConfig): Promise<unknown> {
        const client = this.getClient(config);
        let query = client.from(tableName).update(data);

        // Apply where clause
        if (where && typeof where === 'object') {
            for (const [key, value] of Object.entries(where)) {
                query = query.eq(key, value);
            }
        }

        const { data: result, error } = await query.select().single();

        if (error) {
            throw new Error(`Supabase update failed: ${error.message}`);
        }

        return result;
    }

    async delete(tableName: string, where: unknown, config: StorageConfig): Promise<{ count: number }> {
        const client = this.getClient(config);
        let query = client.from(tableName).delete();

        // Apply where clause
        if (where && typeof where === 'object') {
            for (const [key, value] of Object.entries(where)) {
                query = query.eq(key, value);
            }
        }

        const { count, error } = await query;

        if (error) {
            throw new Error(`Supabase delete failed: ${error.message}`);
        }

        return { count: count || 0 };
    }

    async count(tableName: string, options: QueryOptions | undefined, config: StorageConfig): Promise<number> {
        const client = this.getClient(config);
        let query = client.from(tableName).select('*', { count: 'exact', head: true });

        // Apply filters
        if (options?.where) {
            for (const [key, value] of Object.entries(options.where)) {
                query = query.eq(key, value);
            }
        }

        const { count, error } = await query;

        if (error) {
            throw new Error(`Supabase count failed: ${error.message}`);
        }

        return count || 0;
    }

    // ─────────────────────────────────────────────────────────────
    // Raw SQL & Transactions
    // ─────────────────────────────────────────────────────────────

    async query<T = unknown>(sql: string, params: unknown[] | undefined, config: StorageConfig): Promise<T[]> {
        const client = this.getClient(config);
        const { data, error } = await client.rpc('execute_sql', { query: sql, params });

        if (error) {
            throw new Error(`Supabase query failed: ${error.message}`);
        }

        return data || [];
    }

    async transaction<T>(callback: (tx: StorageContract) => Promise<T>, config: StorageConfig): Promise<T> {
        // Supabase doesn't expose transaction API directly
        // Use application-level retry logic
        return callback({} as StorageContract);
    }

    // ─────────────────────────────────────────────────────────────
    // Schema Management
    // ─────────────────────────────────────────────────────────────

    async createTable(tableName: string, schema: TableSchema, config: StorageConfig): Promise<void> {
        const columns = schema.columns.map(col => {
            const type = this.mapColumnType(col.type);
            const nullable = col.nullable ? 'NULL' : 'NOT NULL';
            const unique = col.unique ? 'UNIQUE' : '';
            return `${col.name} ${type} ${nullable} ${unique}`;
        }).join(', ');

        const primaryKey = schema.primaryKey ? `, PRIMARY KEY (${schema.primaryKey})` : '';
        const sql = `CREATE TABLE ${tableName} (${columns}${primaryKey})`;

        await this.query(sql, undefined, config);
    }

    async dropTable(tableName: string, config: StorageConfig): Promise<void> {
        await this.query(`DROP TABLE IF EXISTS ${tableName}`, undefined, config);
    }

    async listTables(config: StorageConfig): Promise<string[]> {
        const result = await this.query<{ tablename: string }>(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
            undefined,
            config
        );
        return result.map(r => r.tablename);
    }

    async getTableSchema(tableName: string, config: StorageConfig): Promise<TableSchema> {
        // Mock implementation - would need to query PostgreSQL information_schema
        return { columns: [] };
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
        // For now, mock implementation
        return { imported: 0 };
    }

    async exportExcel(tableName: string, config: StorageConfig): Promise<Buffer> {
        // Would use library like 'xlsx' to generate Excel
        // For now, return CSV as buffer
        const csv = await this.exportCSV(tableName, config);
        return Buffer.from(csv);
    }

    // ─────────────────────────────────────────────────────────────
    // Health Check
    // ─────────────────────────────────────────────────────────────

    async healthCheck(config: StorageConfig): Promise<{ healthy: boolean; latencyMs: number }> {
        const startTime = Date.now();
        try {
            const client = this.getClient(config);
            await client.from('_health').select('*').limit(1);
            return { healthy: true, latencyMs: Date.now() - startTime };
        } catch {
            return { healthy: false, latencyMs: Date.now() - startTime };
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────

    private getClient(config: StorageConfig): any {
        const client = this.clients.get(config.connectionString!);
        if (!client) {
            throw new Error('Supabase client not initialized');
        }
        return client;
    }

    private mapColumnType(type: string): string {
        const mapping: Record<string, string> = {
            string: 'TEXT',
            number: 'NUMERIC',
            boolean: 'BOOLEAN',
            date: 'TIMESTAMP',
            json: 'JSONB',
            binary: 'BYTEA',
        };
        return mapping[type] || 'TEXT';
    }
}

export const supabaseConnector = new SupabaseConnector();

