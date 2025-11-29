/**
 * Dual-Reader Proxy — Compare Reads Across Old + New Schema
 * 
 * During migration grace period, this proxy:
 * - Executes queries against both old and new tables
 * - Compares results for drift
 * - Reports discrepancies to AI Guardian
 * - Validates schema compatibility
 * 
 * @module metadata/adaptive-migration/dual-reader.proxy
 */

import { eventBus } from '../../events/event-bus';
import { appendAuditEntry } from '../../audit/hash-chain.store';
import { baseLogger } from '../../observability/logger';
import type { DualReadResult } from './types';

export class DualReaderProxy {
    private enabled = false;
    private shadowTables = new Map<string, string>(); // table → shadow_table

    /**
     * Enable dual-read mode for a table
     */
    enableDualRead(tableName: string, shadowTableName: string): void {
        this.shadowTables.set(tableName, shadowTableName);
        this.enabled = true;
        baseLogger.info({ tableName, shadowTableName }, "[DualReaderProxy] Enabled dual-read for: %s → %s", tableName, shadowTableName);
    }

    /**
     * Disable dual-read mode for a table
     */
    disableDualRead(tableName: string): void {
        this.shadowTables.delete(tableName);
        baseLogger.info({ tableName }, "[DualReaderProxy] Disabled dual-read for: %s", tableName);
    }

    /**
     * Execute query with dual-read comparison
     */
    async readWithDualSchema<T = unknown>(
        db: any,
        query: string,
        params: unknown[] = [],
        tenantId = 'system'
    ): Promise<DualReadResult<T>> {
        // Extract table name from query (simple pattern matching)
        const tableMatch = query.match(/FROM\s+(\w+)/i);
        if (!tableMatch) {
            throw new Error('Could not extract table name from query');
        }

        const tableName = tableMatch[1];
        const shadowTableName = this.shadowTables.get(tableName);

        if (!this.enabled || !shadowTableName) {
            // Dual-read not enabled, just run normal query
            const rows = await db.query(query, params);
            return {
                oldRows: rows,
                newRows: rows,
                driftDetected: false,
            };
        }

        // Run queries in parallel
        const oldQuery = query;
        const newQuery = query.replace(
            new RegExp(`\\b${tableName}\\b`, 'g'),
            shadowTableName
        );

        const [oldResult, newResult] = await Promise.all([
            db.query(oldQuery, params).catch((err: Error) => ({
                error: true,
                message: err.message,
                rows: [],
            })),
            db.query(newQuery, params).catch((err: Error) => ({
                error: true,
                message: err.message,
                rows: [],
            })),
        ]);

        const oldRows = (oldResult as any).error ? [] : oldResult;
        const newRows = (newResult as any).error ? [] : newResult;

        // Compare results
        const driftDetected = this.detectDrift(oldRows, newRows);
        const differences = driftDetected ? this.findDifferences(oldRows, newRows) : undefined;

        // Log drift if detected
        if (driftDetected) {
            baseLogger.warn(
                { tableName, oldRowCount: oldRows.length, newRowCount: newRows.length, differences },
                "[DualReaderProxy] DRIFT DETECTED in %s (Old: %d, New: %d)",
                tableName,
                oldRows.length,
                newRows.length
            );

            // Emit event
            await eventBus.publishTyped('metadata.migration.drift_detected', {
                type: 'metadata.migration.drift_detected',
                tenantId,
                payload: {
                    tableName,
                    shadowTableName,
                    oldRowsCount: oldRows.length,
                    newRowsCount: newRows.length,
                    differences,
                },
            });

            // Audit
            await appendAuditEntry({
                tenantId,
                actorId: 'dual-reader-proxy',
                actionId: 'metadata.migration.drift_detected',
                payload: {
                    tableName,
                    shadowTableName,
                    differences,
                },
            });
        }

        return {
            oldRows,
            newRows,
            driftDetected,
            differences,
        };
    }

    /**
     * Get dual-read statistics
     */
    getStatistics(tableName: string): {
        enabled: boolean;
        shadowTable: string | null;
    } {
        return {
            enabled: this.shadowTables.has(tableName),
            shadowTable: this.shadowTables.get(tableName) || null,
        };
    }

    // ─────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────

    private detectDrift(oldRows: unknown[], newRows: unknown[]): boolean {
        if (oldRows.length !== newRows.length) {
            return true;
        }

        // Deep comparison
        const oldJson = JSON.stringify(oldRows);
        const newJson = JSON.stringify(newRows);

        return oldJson !== newJson;
    }

    private findDifferences(oldRows: unknown[], newRows: unknown[]): string[] {
        const differences: string[] = [];

        if (oldRows.length !== newRows.length) {
            differences.push(`Row count mismatch: ${oldRows.length} vs ${newRows.length}`);
        }

        // Compare first few rows for column differences
        const sampleSize = Math.min(3, oldRows.length, newRows.length);
        for (let i = 0; i < sampleSize; i++) {
            const oldRow = oldRows[i] as any;
            const newRow = newRows[i] as any;

            if (!oldRow || !newRow) continue;

            const oldKeys = Object.keys(oldRow);
            const newKeys = Object.keys(newRow);

            // Check for missing/extra columns
            for (const key of oldKeys) {
                if (!newKeys.includes(key)) {
                    differences.push(`Column missing in new schema: ${key}`);
                }
            }

            for (const key of newKeys) {
                if (!oldKeys.includes(key)) {
                    differences.push(`New column in new schema: ${key}`);
                }
            }

            // Check for value differences
            for (const key of oldKeys) {
                if (newKeys.includes(key) && oldRow[key] !== newRow[key]) {
                    differences.push(`Value mismatch in row ${i}, column ${key}: ${oldRow[key]} → ${newRow[key]}`);
                }
            }
        }

        return differences;
    }
}

// ─────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────

export const dualReaderProxy = new DualReaderProxy();

