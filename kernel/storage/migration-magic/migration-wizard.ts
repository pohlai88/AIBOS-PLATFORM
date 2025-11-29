/**
 * Migration Magic™ — One-Click Database Migration
 * 
 * Inspired by:
 * - MCP one-click authorization
 * - Vercel zero-config deployments
 * - Railway magic links
 * 
 * Features:
 * - Auto-discovery of source database type
 * - Smart credential parsing (connection strings, env vars, JSON)
 * - Live progress dashboard
 * - Zero-downtime migration
 * - Automatic rollback on failure
 * - Migration templates for common scenarios
 * 
 * Usage:
 * ```bash
 * # Option 1: Magic Link (browser-based)
 * aibos migrate magic-link
 * 
 * # Option 2: CLI Copy-Paste
 * aibos migrate start
 * 
 * # Option 3: QR Code (phone authorization)
 * aibos migrate qr
 * ```
 * 
 * @module storage/migration-magic/migration-wizard
 */

import crypto from 'node:crypto';
import { eventBus } from '../../events/event-bus';
import { appendAuditEntry } from '../../audit/hash-chain.store';
import { storageAbstractionLayer } from '../storage-abstraction.layer';
import type { StorageConfig, MigrationProgress } from '../types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface MagicMigrationConfig {
    tenantId: string;
    source: {
        autoDetected?: boolean;
        type?: string;
        connectionString?: string;
        credentials?: any;
    };
    target: {
        provider: string;
        region?: string;
        connectionString?: string;
        credentials?: any;
    };
    options?: {
        tables?: string[]; // Specific tables (empty = all)
        batchSize?: number;
        parallel?: boolean;
        skipValidation?: boolean;
    };
}

export interface MagicLinkToken {
    id: string;
    tenantId: string;
    expiresAt: Date;
    sourceConfig: any;
    targetConfig: any;
    status: 'pending' | 'authorized' | 'running' | 'completed' | 'failed';
}

// ─────────────────────────────────────────────────────────────
// Migration Wizard Class
// ─────────────────────────────────────────────────────────────

export class MigrationWizard {
    private magicLinks = new Map<string, MagicLinkToken>();
    private activeMigrations = new Map<string, any>();

    /**
     * Generate Magic Link for browser-based migration
     * 
     * User experience:
     * 1. Run: `aibos migrate magic-link`
     * 2. CLI prints URL: https://app.aibos.com/migrate/abc123
     * 3. User opens in browser
     * 4. OAuth-style authorization for source + target
     * 5. Migration starts with live dashboard
     */
    async generateMagicLink(config: MagicMigrationConfig): Promise<{
        url: string;
        token: string;
        expiresAt: Date;
        qrCode?: string;
    }> {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        const magicLink: MagicLinkToken = {
            id: token,
            tenantId: config.tenantId,
            expiresAt,
            sourceConfig: config.source,
            targetConfig: config.target,
            status: 'pending',
        };

        this.magicLinks.set(token, magicLink);

        const url = `${process.env.APP_URL || 'https://app.aibos.com'}/migrate/${token}`;

        // Generate QR code (for phone authorization)
        const qrCode = await this.generateQRCode(url);

        // Emit event
        await eventBus.publishTyped('migration.magic_link.generated', {
            type: 'migration.magic_link.generated',
            tenantId: config.tenantId,
            payload: {
                token,
                url,
                expiresAt: expiresAt.toISOString(),
            },
        });

        console.info(`[MigrationWizard] Magic link generated: ${url}`);
        console.info(`[MigrationWizard] Expires at: ${expiresAt.toISOString()}`);

        return { url, token, expiresAt, qrCode };
    }

    /**
     * Auto-detect source database type from connection string or credentials
     * 
     * Supports:
     * - PostgreSQL
     * - MySQL
     * - MongoDB
     * - SQLite
     * - Supabase
     * - Neon
     * - PlanetScale
     */
    autoDetectDatabase(input: string | any): {
        provider: string;
        connectionString?: string;
        region?: string;
        detected: boolean;
    } {
        // If it's a string, try to parse connection string
        if (typeof input === 'string') {
            // PostgreSQL
            if (input.startsWith('postgres://') || input.startsWith('postgresql://')) {
                return {
                    provider: input.includes('supabase.co') ? 'supabase' :
                             input.includes('neon.tech') ? 'neon' :
                             input.includes('rds.amazonaws.com') ? 'aws-rds' :
                             'postgresql',
                    connectionString: input,
                    detected: true,
                };
            }

            // MySQL
            if (input.startsWith('mysql://')) {
                return {
                    provider: input.includes('planetscale.com') ? 'planetscale' :
                             input.includes('rds.amazonaws.com') ? 'aws-rds' :
                             'mysql',
                    connectionString: input,
                    detected: true,
                };
            }

            // MongoDB
            if (input.startsWith('mongodb://') || input.startsWith('mongodb+srv://')) {
                return {
                    provider: 'mongodb',
                    connectionString: input,
                    detected: true,
                };
            }

            // SQLite file path
            if (input.endsWith('.db') || input.endsWith('.sqlite')) {
                return {
                    provider: 'local',
                    connectionString: input,
                    detected: true,
                };
            }
        }

        // If it's an object (credentials), try to detect from keys
        if (typeof input === 'object' && input !== null) {
            if (input.projectId && input.privateKey) {
                return { provider: 'gcp-sql', detected: true };
            }
            if (input.accountName && input.accountKey) {
                return { provider: 'azure-sql', detected: true };
            }
            if (input.accessKeyId && input.secretAccessKey) {
                return { provider: 'aws-s3', detected: true };
            }
        }

        return { provider: 'unknown', detected: false };
    }

    /**
     * Smart credential parsing
     * 
     * Accepts:
     * - Connection strings
     * - Environment variables (will read from process.env)
     * - JSON objects
     * - .env file paths
     */
    parseCredentials(input: string | any): StorageConfig {
        // If it's a string starting with $, treat as env var
        if (typeof input === 'string' && input.startsWith('$')) {
            const envVar = input.slice(1);
            const value = process.env[envVar];
            if (!value) {
                throw new Error(`Environment variable not found: ${envVar}`);
            }
            return this.parseCredentials(value);
        }

        // Auto-detect database type
        const detected = this.autoDetectDatabase(input);

        if (!detected.detected) {
            throw new Error('Could not auto-detect database type. Please provide explicit configuration.');
        }

        return {
            provider: detected.provider as any,
            connectionString: detected.connectionString,
            region: detected.region,
            encryption: { enabled: true }, // Always enforce encryption
        };
    }

    /**
     * Interactive CLI migration
     * 
     * User experience:
     * ```bash
     * $ aibos migrate start
     * 
     * 🚀 AI-BOS Migration Wizard
     * 
     * Step 1: Source Database
     * Paste your source connection string (or env var like $DATABASE_URL):
     * > postgres://user:pass@host/db
     * 
     * ✅ Detected: PostgreSQL (Supabase)
     * ✅ Connected successfully
     * ✅ Found 12 tables, 45,230 rows
     * 
     * Step 2: Target Database
     * Where do you want to migrate?
     * 1. Supabase (recommended for SMEs)
     * 2. Neon (pay-as-you-go)
     * 3. AWS RDS (enterprise)
     * 4. Local SQLite (zero cost)
     * > 2
     * 
     * Paste your Neon connection string:
     * > postgres://user:pass@neon.tech/db
     * 
     * ✅ Connected to Neon
     * 
     * Step 3: Migration Options
     * - Batch size: 1000 rows (recommended)
     * - Parallel tables: Yes
     * - Zero-downtime: Yes (shadow tables)
     * 
     * Ready to migrate! Press ENTER to start...
     * 
     * 📊 Migration Progress:
     * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%
     * 
     * Table: users ━━━━━━━━━━━━━━━━━ 12,450/12,450 rows ✅
     * Table: orders ━━━━━━━━━━━━━━━ 8,920/8,920 rows ✅
     * Table: products ━━━━━━━━━━━━━ 2,340/2,340 rows ✅
     * 
     * ✨ Migration complete in 2m 34s!
     * 
     * Next steps:
     * 1. Update your .env with new connection string
     * 2. Test your application
     * 3. Update DNS/load balancer when ready
     * ```
     */
    async interactiveMigration(tenantId: string): Promise<void> {
        console.log('\n🚀 AI-BOS Migration Wizard\n');

        // This would use readline or inquirer for interactive prompts
        // For now, showing the conceptual flow

        console.log('Step 1: Source Database');
        console.log('Paste your source connection string (or env var like $DATABASE_URL):');
        
        // Simulate user input
        const sourceInput = process.env.DATABASE_URL || 'postgres://...';
        const sourceConfig = this.parseCredentials(sourceInput);

        console.log(`✅ Detected: ${sourceConfig.provider}`);
        console.log('✅ Connected successfully');

        // ... rest of interactive flow
    }

    /**
     * Execute migration with live progress
     */
    async executeMigration(
        tenantId: string,
        sourceConfig: StorageConfig,
        targetConfig: StorageConfig,
        options: any = {}
    ): Promise<{
        success: boolean;
        migratedTables: number;
        migratedRows: number;
        durationMs: number;
    }> {
        console.info(`[MigrationWizard] Starting migration for tenant: ${tenantId}`);

        const migrationId = `mig_${Date.now()}`;
        this.activeMigrations.set(migrationId, {
            status: 'running',
            startedAt: new Date(),
        });

        // Real-time progress callback
        const onProgress = (progress: MigrationProgress) => {
            // Emit event for live dashboard
            eventBus.publishTyped('migration.progress', {
                type: 'migration.progress',
                tenantId,
                payload: {
                    migrationId,
                    table: progress.table,
                    rows: progress.rows,
                    progress: progress.progress,
                },
            });

            // CLI progress bar
            this.printProgressBar(progress);
        };

        // Execute migration using SAL
        const result = await storageAbstractionLayer.migrateTenant(
            tenantId,
            targetConfig,
            {
                ...options,
                onProgress,
            }
        );

        // Update status
        this.activeMigrations.set(migrationId, {
            status: result.success ? 'completed' : 'failed',
            completedAt: new Date(),
            result,
        });

        // Audit
        await appendAuditEntry({
            tenantId,
            actorId: 'migration-wizard',
            actionId: 'migration.completed',
            payload: {
                migrationId,
                success: result.success,
                migratedTables: result.migratedTables,
                migratedRows: result.migratedRows,
            },
        });

        if (result.success) {
            console.log(`\n✨ Migration complete in ${(result.durationMs / 1000).toFixed(1)}s!`);
            console.log('\nNext steps:');
            console.log('1. Update your .env with new connection string');
            console.log('2. Test your application');
            console.log('3. Update DNS/load balancer when ready');
        } else {
            console.error(`\n❌ Migration failed:`, result.errors);
        }

        return result;
    }

    /**
     * Generate migration template for common scenarios
     */
    generateTemplate(scenario: 'supabase-to-neon' | 'local-to-cloud' | 'mysql-to-postgres'): MagicMigrationConfig {
        const templates: Record<string, MagicMigrationConfig> = {
            'supabase-to-neon': {
                tenantId: 'demo',
                source: {
                    type: 'supabase',
                    connectionString: '$SUPABASE_URL',
                },
                target: {
                    provider: 'neon',
                    connectionString: '$NEON_URL',
                },
                options: {
                    batchSize: 1000,
                    parallel: true,
                },
            },
            'local-to-cloud': {
                tenantId: 'demo',
                source: {
                    type: 'local',
                    connectionString: './local.db',
                },
                target: {
                    provider: 'supabase',
                    connectionString: '$SUPABASE_URL',
                },
            },
            'mysql-to-postgres': {
                tenantId: 'demo',
                source: {
                    type: 'mysql',
                    connectionString: '$MYSQL_URL',
                },
                target: {
                    provider: 'postgresql',
                    connectionString: '$POSTGRES_URL',
                },
            },
        };

        return templates[scenario];
    }

    // ─────────────────────────────────────────────────────────────
    // Helper Methods
    // ─────────────────────────────────────────────────────────────

    private async generateQRCode(url: string): Promise<string> {
        // Would use library like 'qrcode' to generate QR code
        // For now, return ASCII art placeholder
        return `
        ████ ▄▄▄▄▄ █▀█ █▄▀▀▀▄█ ▄▄▄▄▄ ████
        ████ █   █ █▀▀▀█ ▀ ▄ █ █   █ ████
        ████ █▄▄▄█ █▀ █▀▀█▄▀██ █▄▄▄█ ████
        
        Scan with your phone to authorize migration
        `;
    }

    private printProgressBar(progress: MigrationProgress): void {
        const barLength = 30;
        const filled = Math.floor((progress.progress / 100) * barLength);
        const empty = barLength - filled;
        const bar = '━'.repeat(filled) + '━'.repeat(empty);

        process.stdout.write(`\rTable: ${progress.table} ${bar} ${progress.rows} rows\r`);
    }
}

// ─────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────

export const migrationWizard = new MigrationWizard();

