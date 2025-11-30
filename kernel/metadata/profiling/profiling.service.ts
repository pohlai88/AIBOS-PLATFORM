/**
 * Profiling Service
 *
 * GRCD v4.1.0 Compliant: Data profiling for Tier 1/2 assets
 * Phase 3.1: Data Profiling Service
 *
 * Leverages patterns from apps/web/DATA_WAREHOUSE_PRD.md
 */

import { profilingRepository } from "./profiling.repository";
import { fieldDictionaryRepository } from "../catalog/field-dictionary.repository";
import type { ProfilerStats, ProfilingOptions } from "./types";
import { ZProfilerStats } from "./types";
import { getDB } from "../../storage/db";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "metadata:profiling-service" });

/**
 * Profiling Service
 *
 * Provides data profiling capabilities for metadata fields.
 */
export class ProfilingService {
  /**
   * Profile a field by running SQL queries to collect statistics.
   *
   * @param fieldId - Field dictionary ID
   * @param tableName - Table name (optional, will be inferred from field if not provided)
   * @param columnName - Column name (optional, will be inferred from field if not provided)
   * @param options - Profiling options
   * @returns Profiling statistics
   */
  async profileField(
    fieldId: string,
    tableName?: string,
    columnName?: string,
    options: ProfilingOptions = {}
  ): Promise<ProfilerStats> {
    const startTime = Date.now();

    try {
      // Get field metadata
      const field = await fieldDictionaryRepository.findById(fieldId);
      if (!field) {
        throw new KernelError(`Field not found: ${fieldId}`, "FIELD_NOT_FOUND");
      }

      // Use provided table/column or infer from field metadata
      const finalTableName = tableName || field.metadata?.tableName || field.canonicalKey.split("_")[0];
      const finalColumnName = columnName || field.metadata?.columnName || field.canonicalKey;

      if (!finalTableName || !finalColumnName) {
        throw new KernelError(
          `Cannot determine table/column for field ${fieldId}. Provide tableName and columnName.`,
          "PROFILING_CONFIG_ERROR"
        );
      }

      logger.info(
        { fieldId, tableName: finalTableName, columnName: finalColumnName },
        "Starting field profiling"
      );

      // Run profiling queries
      const stats = await this.runProfilingQueries(
        field.tenantId,
        fieldId,
        field.entityUrn || `urn:metadata:field:${field.canonicalKey}`,
        finalTableName,
        finalColumnName,
        field.dataType,
        options
      );

      // Save statistics
      const savedStats = await profilingRepository.saveStats(stats);

      const duration = Date.now() - startTime;
      logger.info(
        { fieldId, duration, rowCount: stats.rowCount },
        "Field profiling completed"
      );

      return savedStats;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({ error, fieldId, duration }, "Field profiling failed");
      throw new KernelError("Field profiling failed", "PROFILING_FAILED", error);
    }
  }

  /**
   * Run SQL queries to collect profiling statistics.
   */
  private async runProfilingQueries(
    tenantId: string | null,
    fieldId: string,
    fieldUrn: string,
    tableName: string,
    columnName: string,
    dataType: string,
    options: ProfilingOptions
  ): Promise<ProfilerStats> {
    const db = getDB().getClient();
    const startTime = Date.now();

    // Build sample clause if needed
    const sampleClause = options.sampleSize
      ? `TABLESAMPLE SYSTEM (${Math.min(100, Math.max(1, (options.sampleSize / 1000000) * 100))})`
      : "";

    // Basic statistics query
    const basicStatsQuery = `
      SELECT
        COUNT(*)::BIGINT as row_count,
        COUNT(DISTINCT ${columnName})::BIGINT as distinct_count,
        COUNT(*) FILTER (WHERE ${columnName} IS NULL)::BIGINT as null_count
      FROM ${tableName} ${sampleClause}
    `;

    const basicStats = await db.query(basicStatsQuery);
    const rowCount = Number(basicStats.rows[0].row_count);
    const distinctCount = Number(basicStats.rows[0].distinct_count);
    const nullCount = Number(basicStats.rows[0].null_count);
    const nullPercentage = rowCount > 0 ? (nullCount / rowCount) * 100 : 0;

    // Initialize stats object
    const stats: Partial<ProfilerStats> = {
      fieldId,
      fieldUrn,
      tenantId,
      tableName,
      columnName,
      rowCount,
      distinctCount,
      nullCount,
      nullPercentage,
      dataType,
      profiledAt: new Date(),
      profiledBy: null,
      profilingDurationMs: 0,
      topValues: [],
    };

    // Numeric statistics (for numeric types)
    if (["number", "integer", "decimal", "currency", "percentage"].includes(dataType)) {
      try {
        const numericQuery = `
          SELECT
            MIN(${columnName})::NUMERIC as min_value,
            MAX(${columnName})::NUMERIC as max_value,
            AVG(${columnName})::NUMERIC as avg_value,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${columnName})::NUMERIC as median_value,
            STDDEV(${columnName})::NUMERIC as std_dev
          FROM ${tableName} ${sampleClause}
          WHERE ${columnName} IS NOT NULL
        `;

        const numericStats = await db.query(numericQuery);
        if (numericStats.rows[0]) {
          stats.minValue = numericStats.rows[0].min_value ? Number(numericStats.rows[0].min_value) : null;
          stats.maxValue = numericStats.rows[0].max_value ? Number(numericStats.rows[0].max_value) : null;
          stats.avgValue = numericStats.rows[0].avg_value ? Number(numericStats.rows[0].avg_value) : null;
          stats.medianValue = numericStats.rows[0].median_value ? Number(numericStats.rows[0].median_value) : null;
          stats.stdDev = numericStats.rows[0].std_dev ? Number(numericStats.rows[0].std_dev) : null;
        }
      } catch (error) {
        logger.warn({ error, dataType }, "Failed to compute numeric statistics");
      }
    }

    // String statistics (for string types)
    if (dataType === "string") {
      try {
        const stringQuery = `
          SELECT
            MIN(LENGTH(${columnName}))::INTEGER as min_length,
            MAX(LENGTH(${columnName}))::INTEGER as max_length,
            AVG(LENGTH(${columnName}))::NUMERIC as avg_length
          FROM ${tableName} ${sampleClause}
          WHERE ${columnName} IS NOT NULL
        `;

        const stringStats = await db.query(stringQuery);
        if (stringStats.rows[0]) {
          stats.minLength = stringStats.rows[0].min_length ? Number(stringStats.rows[0].min_length) : null;
          stats.maxLength = stringStats.rows[0].max_length ? Number(stringStats.rows[0].max_length) : null;
          stats.avgLength = stringStats.rows[0].avg_length ? Number(stringStats.rows[0].avg_length) : null;
        }
      } catch (error) {
        logger.warn({ error, dataType }, "Failed to compute string statistics");
      }
    }

    // Date statistics (for date/datetime types)
    if (["date", "datetime"].includes(dataType)) {
      try {
        const dateQuery = `
          SELECT
            MIN(${columnName})::TIMESTAMPTZ as min_date,
            MAX(${columnName})::TIMESTAMPTZ as max_date
          FROM ${tableName} ${sampleClause}
          WHERE ${columnName} IS NOT NULL
        `;

        const dateStats = await db.query(dateQuery);
        if (dateStats.rows[0]) {
          stats.minDate = dateStats.rows[0].min_date ? new Date(dateStats.rows[0].min_date) : null;
          stats.maxDate = dateStats.rows[0].max_date ? new Date(dateStats.rows[0].max_date) : null;
        }
      } catch (error) {
        logger.warn({ error, dataType }, "Failed to compute date statistics");
      }
    }

    // Top values (if requested)
    if (options.includeTopValues !== false) {
      try {
        const topValuesLimit = options.topValuesLimit || 10;
        const topValuesQuery = `
          SELECT
            ${columnName} as value,
            COUNT(*)::BIGINT as count
          FROM ${tableName} ${sampleClause}
          WHERE ${columnName} IS NOT NULL
          GROUP BY ${columnName}
          ORDER BY count DESC
          LIMIT ${topValuesLimit}
        `;

        const topValuesResult = await db.query(topValuesQuery);
        stats.topValues = topValuesResult.rows.map((row) => ({
          value: row.value,
          count: Number(row.count),
          percentage: rowCount > 0 ? (Number(row.count) / rowCount) * 100 : 0,
        }));
      } catch (error) {
        logger.warn({ error }, "Failed to compute top values");
        stats.topValues = [];
      }
    }

    stats.profilingDurationMs = Date.now() - startTime;

    return ZProfilerStats.parse(stats);
  }

  /**
   * Get latest profiling statistics for a field.
   */
  async getLatestStats(
    tenantId: string | null,
    fieldId: string
  ): Promise<ProfilerStats | null> {
    return await profilingRepository.getLatestStats(tenantId, fieldId);
  }

  /**
   * Schedule profiling for Tier 1/2 assets.
   *
   * Tier 1: Weekly (≥ 1 run per 7 days)
   * Tier 2: Monthly (≥ 1 run per 30 days)
   */
  async scheduleProfiling(
    tenantId: string | null,
    fieldId: string,
    governanceTier: "tier_1" | "tier_2"
  ): Promise<void> {
    const field = await fieldDictionaryRepository.findById(fieldId);
    if (!field) {
      throw new KernelError(`Field not found: ${fieldId}`, "FIELD_NOT_FOUND");
    }

    // Determine frequency and cron expression based on tier
    const frequency = governanceTier === "tier_1" ? "weekly" : "monthly";
    const cronExpression = governanceTier === "tier_1"
      ? "0 2 * * 0"  // Every Sunday at 2 AM
      : "0 2 1 * *";  // First day of month at 2 AM

    // Calculate next run time
    const now = new Date();
    const nextRunAt = governanceTier === "tier_1"
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)  // 7 days
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);  // 30 days

    await profilingRepository.upsertSchedule({
      tenantId,
      fieldId,
      fieldUrn: field.entityUrn || `urn:metadata:field:${field.canonicalKey}`,
      governanceTier,
      frequency,
      cronExpression,
      isActive: true,
      lastRunAt: null,
      nextRunAt,
    });

    logger.info(
      { fieldId, governanceTier, frequency, nextRunAt },
      "Profiling scheduled"
    );
  }

  /**
   * Check if field has profiling (required for Tier 1/2).
   */
  async hasProfiling(
    tenantId: string | null,
    fieldId: string
  ): Promise<boolean> {
    const stats = await profilingRepository.getLatestStats(tenantId, fieldId);
    return stats !== null;
  }
}

export const profilingService = new ProfilingService();

