/**
 * Profiling Repository
 *
 * GRCD v4.1.0 Compliant: Data profiling repository
 * Phase 3.1: Data Profiling Service
 */

import { getDB } from "../../storage/db";
import type {
  ProfilerStats,
  ProfilingJob,
  CreateProfilingJob,
  ProfilingSchedule,
  CreateProfilingSchedule,
} from "./types";
import {
  ZProfilerStats,
  ZProfilingJob,
  ZCreateProfilingJob,
  ZProfilingSchedule,
  ZCreateProfilingSchedule,
} from "./types";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "profiling-repository" });

export class ProfilingRepository {
  /**
   * Save profiling statistics.
   */
  async saveStats(stats: ProfilerStats): Promise<ProfilerStats> {
    const validated = ZProfilerStats.parse(stats);
    const db = getDB().getClient();

    try {
      const res = await db.query<ProfilerStats>(
        `
        INSERT INTO mdm_profiling_stats (
          tenant_id, field_id, field_urn, table_name, column_name,
          row_count, distinct_count, null_count, null_percentage,
          min_value, max_value, avg_value, median_value, std_dev,
          min_length, max_length, avg_length,
          min_date, max_date,
          top_values,
          data_type, profiled_at, profiled_by, profiling_duration_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING
          id,
          tenant_id AS "tenantId",
          field_id AS "fieldId",
          field_urn AS "fieldUrn",
          table_name AS "tableName",
          column_name AS "columnName",
          row_count AS "rowCount",
          distinct_count AS "distinctCount",
          null_count AS "nullCount",
          null_percentage AS "nullPercentage",
          min_value AS "minValue",
          max_value AS "maxValue",
          avg_value AS "avgValue",
          median_value AS "medianValue",
          std_dev AS "stdDev",
          min_length AS "minLength",
          max_length AS "maxLength",
          avg_length AS "avgLength",
          min_date AS "minDate",
          max_date AS "maxDate",
          top_values AS "topValues",
          data_type AS "dataType",
          profiled_at AS "profiledAt",
          profiled_by AS "profiledBy",
          profiling_duration_ms AS "profilingDurationMs",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          validated.tenantId,
          validated.fieldId,
          validated.fieldUrn,
          validated.tableName,
          validated.columnName,
          validated.rowCount,
          validated.distinctCount,
          validated.nullCount,
          validated.nullPercentage,
          validated.minValue,
          validated.maxValue,
          validated.avgValue,
          validated.medianValue,
          validated.stdDev,
          validated.minLength,
          validated.maxLength,
          validated.avgLength,
          validated.minDate,
          validated.maxDate,
          JSON.stringify(validated.topValues),
          validated.dataType,
          validated.profiledAt,
          validated.profiledBy,
          validated.profilingDurationMs,
        ],
      );

      return ZProfilerStats.parse({
        ...res.rows[0],
        profiledAt: new Date(res.rows[0].profiledAt),
        createdAt: new Date(res.rows[0].createdAt),
        updatedAt: new Date(res.rows[0].updatedAt),
      });
    } catch (error) {
      logger.error({ error, stats }, "Failed to save profiling stats");
      throw new KernelError("Failed to save profiling stats", "PROFILING_STATS_SAVE_FAILED", error);
    }
  }

  /**
   * Get latest profiling statistics for a field.
   */
  async getLatestStats(
    tenantId: string | null,
    fieldId: string
  ): Promise<ProfilerStats | null> {
    const db = getDB().getClient();

    const res = await db.query<ProfilerStats>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        table_name AS "tableName",
        column_name AS "columnName",
        row_count AS "rowCount",
        distinct_count AS "distinctCount",
        null_count AS "nullCount",
        null_percentage AS "nullPercentage",
        min_value AS "minValue",
        max_value AS "maxValue",
        avg_value AS "avgValue",
        median_value AS "medianValue",
        std_dev AS "stdDev",
        min_length AS "minLength",
        max_length AS "maxLength",
        avg_length AS "avgLength",
        min_date AS "minDate",
        max_date AS "maxDate",
        top_values AS "topValues",
        data_type AS "dataType",
        profiled_at AS "profiledAt",
        profiled_by AS "profiledBy",
        profiling_duration_ms AS "profilingDurationMs",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_profiling_stats
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND field_id = $2
      ORDER BY profiled_at DESC
      LIMIT 1
      `,
      [tenantId, fieldId],
    );

    if (res.rowCount === 0) return null;

    return ZProfilerStats.parse({
      ...res.rows[0],
      profiledAt: new Date(res.rows[0].profiledAt),
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Create a profiling job.
   */
  async createJob(input: CreateProfilingJob): Promise<ProfilingJob> {
    const validated = ZCreateProfilingJob.parse(input);
    const db = getDB().getClient();

    try {
      const res = await db.query<ProfilingJob>(
        `
        INSERT INTO mdm_profiling_jobs (
          tenant_id, field_id, field_urn, status, scheduled_at,
          started_at, completed_at, error, stats_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          tenant_id AS "tenantId",
          field_id AS "fieldId",
          field_urn AS "fieldUrn",
          status,
          scheduled_at AS "scheduledAt",
          started_at AS "startedAt",
          completed_at AS "completedAt",
          error,
          stats_id AS "statsId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          validated.tenantId,
          validated.fieldId,
          validated.fieldUrn,
          validated.status,
          validated.scheduledAt,
          validated.startedAt,
          validated.completedAt,
          validated.error,
          validated.stats?.id || null,
        ],
      );

      return ZProfilingJob.parse({
        ...res.rows[0],
        scheduledAt: new Date(res.rows[0].scheduledAt),
        startedAt: res.rows[0].startedAt ? new Date(res.rows[0].startedAt) : null,
        completedAt: res.rows[0].completedAt ? new Date(res.rows[0].completedAt) : null,
        createdAt: new Date(res.rows[0].createdAt),
        updatedAt: new Date(res.rows[0].updatedAt),
      });
    } catch (error) {
      logger.error({ error, input }, "Failed to create profiling job");
      throw new KernelError("Failed to create profiling job", "PROFILING_JOB_CREATE_FAILED", error);
    }
  }

  /**
   * Update profiling job status.
   */
  async updateJobStatus(
    jobId: string,
    status: "pending" | "running" | "completed" | "failed",
    updates?: {
      startedAt?: Date;
      completedAt?: Date;
      error?: string;
      statsId?: string;
    }
  ): Promise<ProfilingJob | null> {
    const db = getDB().getClient();

    const setClauses: string[] = ["status = $2"];
    const params: any[] = [jobId, status];

    if (updates?.startedAt) {
      setClauses.push(`started_at = $${params.length + 1}`);
      params.push(updates.startedAt);
    }

    if (updates?.completedAt) {
      setClauses.push(`completed_at = $${params.length + 1}`);
      params.push(updates.completedAt);
    }

    if (updates?.error !== undefined) {
      setClauses.push(`error = $${params.length + 1}`);
      params.push(updates.error);
    }

    if (updates?.statsId) {
      setClauses.push(`stats_id = $${params.length + 1}`);
      params.push(updates.statsId);
    }

    setClauses.push(`updated_at = NOW()`);

    const res = await db.query<ProfilingJob>(
      `
      UPDATE mdm_profiling_jobs
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        status,
        scheduled_at AS "scheduledAt",
        started_at AS "startedAt",
        completed_at AS "completedAt",
        error,
        stats_id AS "statsId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      params,
    );

    if (res.rowCount === 0) return null;

    return ZProfilingJob.parse({
      ...res.rows[0],
      scheduledAt: new Date(res.rows[0].scheduledAt),
      startedAt: res.rows[0].startedAt ? new Date(res.rows[0].startedAt) : null,
      completedAt: res.rows[0].completedAt ? new Date(res.rows[0].completedAt) : null,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Create or update profiling schedule.
   */
  async upsertSchedule(input: CreateProfilingSchedule): Promise<ProfilingSchedule> {
    const validated = ZCreateProfilingSchedule.parse(input);
    const db = getDB().getClient();

    try {
      const res = await db.query<ProfilingSchedule>(
        `
        INSERT INTO mdm_profiling_schedules (
          tenant_id, field_id, field_urn, governance_tier, frequency,
          cron_expression, is_active, last_run_at, next_run_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (tenant_id, field_id)
        DO UPDATE SET
          governance_tier = EXCLUDED.governance_tier,
          frequency = EXCLUDED.frequency,
          cron_expression = EXCLUDED.cron_expression,
          is_active = EXCLUDED.is_active,
          next_run_at = EXCLUDED.next_run_at,
          updated_at = NOW()
        RETURNING
          id,
          tenant_id AS "tenantId",
          field_id AS "fieldId",
          field_urn AS "fieldUrn",
          governance_tier AS "governanceTier",
          frequency,
          cron_expression AS "cronExpression",
          is_active AS "isActive",
          last_run_at AS "lastRunAt",
          next_run_at AS "nextRunAt",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          validated.tenantId,
          validated.fieldId,
          validated.fieldUrn,
          validated.governanceTier,
          validated.frequency,
          validated.cronExpression,
          validated.isActive,
          validated.lastRunAt,
          validated.nextRunAt,
        ],
      );

      return ZProfilingSchedule.parse({
        ...res.rows[0],
        lastRunAt: res.rows[0].lastRunAt ? new Date(res.rows[0].lastRunAt) : null,
        nextRunAt: new Date(res.rows[0].nextRunAt),
        createdAt: new Date(res.rows[0].createdAt),
        updatedAt: new Date(res.rows[0].updatedAt),
      });
    } catch (error) {
      logger.error({ error, input }, "Failed to upsert profiling schedule");
      throw new KernelError("Failed to upsert profiling schedule", "PROFILING_SCHEDULE_UPSERT_FAILED", error);
    }
  }

  /**
   * Get active profiling schedules due for execution.
   */
  async getSchedulesDueForExecution(now: Date): Promise<ProfilingSchedule[]> {
    const db = getDB().getClient();

    const res = await db.query<ProfilingSchedule>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        governance_tier AS "governanceTier",
        frequency,
        cron_expression AS "cronExpression",
        is_active AS "isActive",
        last_run_at AS "lastRunAt",
        next_run_at AS "nextRunAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_profiling_schedules
      WHERE is_active = TRUE AND next_run_at <= $1
      ORDER BY next_run_at ASC
      `,
      [now],
    );

    return res.rows.map((row) => ZProfilingSchedule.parse({
      ...row,
      lastRunAt: row.lastRunAt ? new Date(row.lastRunAt) : null,
      nextRunAt: new Date(row.nextRunAt),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  /**
   * Get profiling history for a field.
   */
  async getProfilingHistory(
    tenantId: string | null,
    fieldId: string,
    limit: number = 10
  ): Promise<ProfilerStats[]> {
    const db = getDB().getClient();

    const res = await db.query<ProfilerStats>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        table_name AS "tableName",
        column_name AS "columnName",
        row_count AS "rowCount",
        distinct_count AS "distinctCount",
        null_count AS "nullCount",
        null_percentage AS "nullPercentage",
        min_value AS "minValue",
        max_value AS "maxValue",
        avg_value AS "avgValue",
        median_value AS "medianValue",
        std_dev AS "stdDev",
        min_length AS "minLength",
        max_length AS "maxLength",
        avg_length AS "avgLength",
        min_date AS "minDate",
        max_date AS "maxDate",
        top_values AS "topValues",
        data_type AS "dataType",
        profiled_at AS "profiledAt",
        profiled_by AS "profiledBy",
        profiling_duration_ms AS "profilingDurationMs",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_profiling_stats
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND field_id = $2
      ORDER BY profiled_at DESC
      LIMIT $3
      `,
      [tenantId, fieldId, limit],
    );

    return res.rows.map((row) => ZProfilerStats.parse({
      ...row,
      profiledAt: new Date(row.profiledAt),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  /**
   * Update schedule after execution.
   */
  async updateScheduleAfterRun(
    scheduleId: string,
    lastRunAt: Date,
    nextRunAt: Date
  ): Promise<ProfilingSchedule | null> {
    const db = getDB().getClient();

    const res = await db.query<ProfilingSchedule>(
      `
      UPDATE mdm_profiling_schedules
      SET
        last_run_at = $2,
        next_run_at = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        governance_tier AS "governanceTier",
        frequency,
        cron_expression AS "cronExpression",
        is_active AS "isActive",
        last_run_at AS "lastRunAt",
        next_run_at AS "nextRunAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [scheduleId, lastRunAt, nextRunAt],
    );

    if (res.rowCount === 0) return null;

    return ZProfilingSchedule.parse({
      ...res.rows[0],
      lastRunAt: res.rows[0].lastRunAt ? new Date(res.rows[0].lastRunAt) : null,
      nextRunAt: new Date(res.rows[0].nextRunAt),
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }
}

export const profilingRepository = new ProfilingRepository();

