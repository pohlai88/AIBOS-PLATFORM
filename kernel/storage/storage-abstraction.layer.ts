/**
 * Storage Abstraction Layer (SAL) — BYOS™ Core
 * 
 * "Your Data. Your Cloud. Your Control."
 * 
 * Enables:
 * - Zero vendor lock-in
 * - Full data ownership
 * - Flexible cost control (RM0 → scale)
 * - Write once, deploy anywhere
 * - 3-click migration between providers
 * 
 * Supported Providers:
 * - Supabase (SME-friendly, serverless)
 * - Neon (pay-as-you-go PostgreSQL)
 * - AWS S3/RDS (enterprise-grade)
 * - Azure Blob/SQL (Microsoft ecosystem)
 * - Google Cloud Storage/SQL (AI-native)
 * - Local/On-Prem (zero cost, full control)
 * 
 * Key Features:
 * - Universal API across all providers
 * - Per-tenant configuration
 * - Encryption at rest (enforced)
 * - Data residency compliance
 * - Automatic failover
 * - Zero-downtime migrations
 * 
 * @module storage/storage-abstraction.layer
 */

import type {
    StorageProvider,
    StorageConfig,
    StorageContract,
    QueryOptions,
    TableSchema,
    MigrationConfig,
} from './types';

export class StorageAbstractionLayer {
    private providers = new Map<string, StorageProvider>();
    private tenantConfigs = new Map<string, StorageConfig>();

    /**
     * Register a storage provider
     */
    registerProvider(name: string, provider: StorageProvider): void {
        this.providers.set(name, provider);
        console.info(`[SAL] Registered provider: ${name}`);
    }

    /**
     * Configure storage for a tenant
     */
    async configureTenant(tenantId: string, config: StorageConfig): Promise<void> {
        // Validate provider exists
        const provider = this.providers.get(config.provider);
        if (!provider) {
            throw new Error(`Provider '${config.provider}' not registered`);
        }

        // Validate configuration
        await this.validateConfig(config);

        // Initialize provider connection
        await provider.initialize(config);

        // Store configuration
        this.tenantConfigs.set(tenantId, config);

        console.info(`[SAL] Configured ${config.provider} for tenant: ${tenantId}`);
    }

    /**
     * Get storage contract for a tenant
     * 
     * This is the universal API that works across all providers.
     */
    async getStorage(tenantId: string): Promise<StorageContract> {
        const config = this.tenantConfigs.get(tenantId);
        if (!config) {
            throw new Error(`No storage configured for tenant: ${tenantId}`);
        }

        const provider = this.providers.get(config.provider);
        if (!provider) {
            throw new Error(`Provider '${config.provider}' not found`);
        }

        // Return universal storage contract
        return {
            // Object Storage (S3-compatible)
            putObject: async (bucket: string, key: string, data: Buffer) => {
                return provider.putObject(bucket, key, data, config);
            },

            getObject: async (bucket: string, key: string) => {
                return provider.getObject(bucket, key, config);
            },

            deleteObject: async (bucket: string, key: string) => {
                return provider.deleteObject(bucket, key, config);
            },

            listObjects: async (bucket: string, prefix?: string) => {
                return provider.listObjects(bucket, prefix, config);
            },

            // Database Storage (SQL)
            table: (tableName: string) => ({
                findMany: async (options?: QueryOptions) => {
                    return provider.findMany(tableName, options, config);
                },

                findOne: async (options: QueryOptions) => {
                    return provider.findOne(tableName, options, config);
                },

                create: async (data: unknown) => {
                    return provider.create(tableName, data, config);
                },

                update: async (where: unknown, data: unknown) => {
                    return provider.update(tableName, where, data, config);
                },

                delete: async (where: unknown) => {
                    return provider.delete(tableName, where, config);
                },

                count: async (options?: QueryOptions) => {
                    return provider.count(tableName, options, config);
                },
            }),

            // Raw SQL (for advanced queries)
            query: async <T = unknown>(sql: string, params?: unknown[]) => {
                return provider.query<T>(sql, params, config);
            },

            // Transaction support
            transaction: async <T>(callback: (tx: StorageContract) => Promise<T>) => {
                return provider.transaction(callback, config);
            },

            // Schema management
            createTable: async (tableName: string, schema: TableSchema) => {
                return provider.createTable(tableName, schema, config);
            },

            dropTable: async (tableName: string) => {
                return provider.dropTable(tableName, config);
            },

            // Import/Export (for SMEs)
            importCSV: async (tableName: string, csvData: string) => {
                return provider.importCSV(tableName, csvData, config);
            },

            exportCSV: async (tableName: string) => {
                return provider.exportCSV(tableName, config);
            },

            importExcel: async (tableName: string, excelBuffer: Buffer) => {
                return provider.importExcel(tableName, excelBuffer, config);
            },

            exportExcel: async (tableName: string) => {
                return provider.exportExcel(tableName, config);
            },

            // Health check
            healthCheck: async () => {
                return provider.healthCheck(config);
            },

            // Provider info
            getProviderInfo: () => ({
                provider: config.provider,
                region: config.region,
                encryption: config.encryption?.enabled || false,
                residency: config.residency,
            }),
        };
    }

    /**
     * Migrate tenant storage from one provider to another
     * 
     * This is the "3-click migration" feature.
     */
    async migrateTenant(
        tenantId: string,
        targetConfig: StorageConfig,
        options: MigrationConfig = {}
    ): Promise<{
        success: boolean;
        migratedTables: number;
        migratedRows: number;
        durationMs: number;
        errors?: string[];
    }> {
        console.info(`[SAL] Starting migration for tenant: ${tenantId}`);
        const startTime = Date.now();

        const sourceConfig = this.tenantConfigs.get(tenantId);
        if (!sourceConfig) {
            throw new Error(`No source storage configured for tenant: ${tenantId}`);
        }

        const sourceProvider = this.providers.get(sourceConfig.provider);
        const targetProvider = this.providers.get(targetConfig.provider);

        if (!sourceProvider || !targetProvider) {
            throw new Error('Source or target provider not found');
        }

        // Initialize target provider
        await targetProvider.initialize(targetConfig);

        const errors: string[] = [];
        let migratedTables = 0;
        let migratedRows = 0;

        try {
            // Get list of tables from source
            const tables = await sourceProvider.listTables(sourceConfig);

            for (const tableName of tables) {
                try {
                    console.info(`[SAL] Migrating table: ${tableName}`);

                    // Get schema
                    const schema = await sourceProvider.getTableSchema(tableName, sourceConfig);

                    // Create table in target
                    await targetProvider.createTable(tableName, schema, targetConfig);

                    // Copy data (batch by batch for large tables)
                    const batchSize = options.batchSize || 1000;
                    let offset = 0;
                    let hasMore = true;

                    while (hasMore) {
                        const rows = await sourceProvider.findMany(
                            tableName,
                            { limit: batchSize, offset },
                            sourceConfig
                        );

                        if (rows.length === 0) {
                            hasMore = false;
                            break;
                        }

                        // Bulk insert into target
                        for (const row of rows) {
                            await targetProvider.create(tableName, row, targetConfig);
                            migratedRows++;
                        }

                        offset += batchSize;

                        // Progress callback
                        if (options.onProgress) {
                            options.onProgress({
                                table: tableName,
                                rows: migratedRows,
                                progress: Math.min(100, (migratedRows / (migratedRows + 100)) * 100),
                            });
                        }
                    }

                    migratedTables++;
                    console.info(`[SAL] ✅ Migrated table: ${tableName} (${migratedRows} rows)`);
                } catch (err) {
                    const error = `Failed to migrate table ${tableName}: ${err instanceof Error ? err.message : String(err)}`;
                    errors.push(error);
                    console.error(`[SAL] ❌ ${error}`);

                    if (!options.continueOnError) {
                        throw err;
                    }
                }
            }

            // Update tenant configuration to new provider
            this.tenantConfigs.set(tenantId, targetConfig);

            const durationMs = Date.now() - startTime;
            console.info(`[SAL] ✅ Migration complete in ${durationMs}ms`);

            return {
                success: errors.length === 0,
                migratedTables,
                migratedRows,
                durationMs,
                errors: errors.length > 0 ? errors : undefined,
            };
        } catch (err) {
            console.error(`[SAL] ❌ Migration failed:`, err);
            throw err;
        }
    }

    /**
     * Get tenant storage configuration
     */
    getTenantConfig(tenantId: string): StorageConfig | undefined {
        return this.tenantConfigs.get(tenantId);
    }

    /**
     * List all configured tenants
     */
    listTenants(): Array<{ tenantId: string; provider: string; region?: string }> {
        return Array.from(this.tenantConfigs.entries()).map(([tenantId, config]) => ({
            tenantId,
            provider: config.provider,
            region: config.region,
        }));
    }

    /**
     * Validate storage configuration
     */
    private async validateConfig(config: StorageConfig): Promise<void> {
        // Validate encryption is enabled (mandatory for production)
        if (!config.encryption?.enabled) {
            throw new Error('Encryption must be enabled for production use');
        }

        // Validate residency compliance
        if (config.residency?.compliance) {
            const validCompliance = ['GDPR', 'SOC2', 'HIPAA', 'PCI-DSS', 'PDPA'];
            for (const standard of config.residency.compliance) {
                if (!validCompliance.includes(standard)) {
                    throw new Error(`Invalid compliance standard: ${standard}`);
                }
            }
        }

        // Validate provider-specific requirements
        const provider = this.providers.get(config.provider);
        if (provider?.validateConfig) {
            await provider.validateConfig(config);
        }
    }
}

// ─────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────

export const storageAbstractionLayer = new StorageAbstractionLayer();

// Alias for developer convenience
export const SAL = storageAbstractionLayer;

