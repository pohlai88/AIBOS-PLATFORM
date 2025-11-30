/**
 * Storage Types — BYOS™ Type Definitions
 * 
 * @module storage/types
 */

// ─────────────────────────────────────────────────────────────
// Provider Types
// ─────────────────────────────────────────────────────────────

export type ProviderName = 
    | 'supabase'
    | 'neon'
    | 'aws-s3'
    | 'aws-rds'
    | 'azure-blob'
    | 'azure-sql'
    | 'gcp-storage'
    | 'gcp-sql'
    | 'local'
    | 'on-prem';

export type ComplianceStandard = 'GDPR' | 'SOC2' | 'HIPAA' | 'PCI-DSS' | 'PDPA';

// ─────────────────────────────────────────────────────────────
// Storage Configuration
// ─────────────────────────────────────────────────────────────

export interface StorageConfig {
    provider: ProviderName;
    region?: string;
    connectionString?: string;
    credentials?: {
        accessKeyId?: string;
        secretAccessKey?: string;
        accountName?: string;
        accountKey?: string;
        projectId?: string;
    };
    encryption?: {
        enabled: boolean;
        keyRotationDays?: number;
        algorithm?: 'AES-256' | 'AES-128';
    };
    residency?: {
        region: string;
        compliance: ComplianceStandard[];
    };
    options?: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────
// Storage Contract (Universal API)
// ─────────────────────────────────────────────────────────────

export interface StorageContract {
    // Object Storage
    putObject(bucket: string, key: string, data: Buffer): Promise<void>;
    getObject(bucket: string, key: string): Promise<Buffer>;
    deleteObject(bucket: string, key: string): Promise<void>;
    listObjects(bucket: string, prefix?: string): Promise<string[]>;

    // Database Storage
    table(tableName: string): TableOperations;
    query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
    transaction<T>(callback: (tx: StorageContract) => Promise<T>): Promise<T>;

    // Schema Management
    createTable(tableName: string, schema: TableSchema): Promise<void>;
    dropTable(tableName: string): Promise<void>;

    // Import/Export (SME-friendly)
    importCSV(tableName: string, csvData: string): Promise<{ imported: number }>;
    exportCSV(tableName: string): Promise<string>;
    importExcel(tableName: string, excelBuffer: Buffer): Promise<{ imported: number }>;
    exportExcel(tableName: string): Promise<Buffer>;

    // Health
    healthCheck(): Promise<{ healthy: boolean; latencyMs: number }>;
    getProviderInfo(): { provider: string; region?: string; encryption: boolean };
}

export interface TableOperations {
    findMany(options?: QueryOptions): Promise<unknown[]>;
    findOne(options: QueryOptions): Promise<unknown | null>;
    create(data: unknown): Promise<unknown>;
    update(where: unknown, data: unknown): Promise<unknown>;
    delete(where: unknown): Promise<{ count: number }>;
    count(options?: QueryOptions): Promise<number>;
}

// ─────────────────────────────────────────────────────────────
// Query Options
// ─────────────────────────────────────────────────────────────

export interface QueryOptions {
    where?: Record<string, unknown>;
    select?: string[];
    orderBy?: Record<string, 'asc' | 'desc'>;
    limit?: number;
    offset?: number;
}

// ─────────────────────────────────────────────────────────────
// Table Schema
// ─────────────────────────────────────────────────────────────

export interface TableSchema {
    columns: ColumnDefinition[];
    primaryKey?: string;
    indexes?: IndexDefinition[];
}

export interface ColumnDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'binary';
    nullable?: boolean;
    defaultValue?: unknown;
    unique?: boolean;
}

export interface IndexDefinition {
    name: string;
    columns: string[];
    unique?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Migration Configuration
// ─────────────────────────────────────────────────────────────

export interface MigrationConfig {
    batchSize?: number;
    continueOnError?: boolean;
    onProgress?: (progress: MigrationProgress) => void;
    tables?: string[]; // Specific tables to migrate (empty = all)
}

export interface MigrationProgress {
    table: string;
    rows: number;
    progress: number; // 0-100
}

// ─────────────────────────────────────────────────────────────
// Storage Provider Interface
// ─────────────────────────────────────────────────────────────

export interface StorageProvider {
    name: string;
    
    // Initialization
    initialize(config: StorageConfig): Promise<void>;
    validateConfig?(config: StorageConfig): Promise<void>;

    // Object Storage
    putObject(bucket: string, key: string, data: Buffer, config: StorageConfig): Promise<void>;
    getObject(bucket: string, key: string, config: StorageConfig): Promise<Buffer>;
    deleteObject(bucket: string, key: string, config: StorageConfig): Promise<void>;
    listObjects(bucket: string, prefix: string | undefined, config: StorageConfig): Promise<string[]>;

    // Database Operations
    findMany(tableName: string, options: QueryOptions | undefined, config: StorageConfig): Promise<unknown[]>;
    findOne(tableName: string, options: QueryOptions, config: StorageConfig): Promise<unknown | null>;
    create(tableName: string, data: unknown, config: StorageConfig): Promise<unknown>;
    update(tableName: string, where: unknown, data: unknown, config: StorageConfig): Promise<unknown>;
    delete(tableName: string, where: unknown, config: StorageConfig): Promise<{ count: number }>;
    count(tableName: string, options: QueryOptions | undefined, config: StorageConfig): Promise<number>;

    // Raw SQL
    query<T = unknown>(sql: string, params: unknown[] | undefined, config: StorageConfig): Promise<T[]>;
    transaction<T>(callback: (tx: StorageContract) => Promise<T>, config: StorageConfig): Promise<T>;

    // Schema Management
    createTable(tableName: string, schema: TableSchema, config: StorageConfig): Promise<void>;
    dropTable(tableName: string, config: StorageConfig): Promise<void>;
    listTables(config: StorageConfig): Promise<string[]>;
    getTableSchema(tableName: string, config: StorageConfig): Promise<TableSchema>;

    // Import/Export
    importCSV(tableName: string, csvData: string, config: StorageConfig): Promise<{ imported: number }>;
    exportCSV(tableName: string, config: StorageConfig): Promise<string>;
    importExcel(tableName: string, excelBuffer: Buffer, config: StorageConfig): Promise<{ imported: number }>;
    exportExcel(tableName: string, config: StorageConfig): Promise<Buffer>;

    // Health
    healthCheck(config: StorageConfig): Promise<{ healthy: boolean; latencyMs: number }>;
}

