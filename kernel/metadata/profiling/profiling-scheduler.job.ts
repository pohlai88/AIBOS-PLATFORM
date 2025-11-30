/**
 * Profiling Scheduler Job
 *
 * GRCD v4.1.0 Compliant: Automated profiling for Tier 1/2 assets
 * Phase 3.1: Data Profiling Service
 *
 * Schedules and executes profiling jobs based on governance tier requirements.
 * Tier 1: Weekly (≥ 1 run per 7 days)
 * Tier 2: Monthly (≥ 1 run per 30 days)
 */

import { schedule } from "node-cron";
import { profilingRepository } from "./profiling.repository";
import { profilingService } from "./profiling.service";
import { fieldDictionaryRepository } from "../catalog/field-dictionary.repository";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "metadata:profiling-scheduler" });

/**
 * Profiling Scheduler Job
 *
 * Checks for schedules due for execution and runs profiling jobs.
 */
export class ProfilingSchedulerJob {
  private isRunning = false;
  private cronJob: ReturnType<typeof schedule> | null = null;

  /**
   * Start the profiling scheduler.
   *
   * Runs every hour to check for schedules due for execution.
   */
  start(): void {
    if (this.cronJob) {
      logger.warn("Profiling scheduler already started");
      return;
    }

    // Run every hour at minute 0 (e.g., 1:00, 2:00, 3:00)
    this.cronJob = schedule("0 * * * *", async () => {
      await this.execute();
    });

    logger.info("Profiling scheduler started (runs every hour)");
  }

  /**
   * Stop the profiling scheduler.
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
      logger.info("Profiling scheduler stopped");
    }
  }

  /**
   * Execute profiling jobs for schedules due for execution.
   */
  async execute(): Promise<void> {
    if (this.isRunning) {
      logger.warn("Profiling scheduler already running, skipping");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info("Starting profiling scheduler execution");

      // Get schedules due for execution
      const now = new Date();
      const schedules = await profilingRepository.getSchedulesDueForExecution(now);

      logger.info({ count: schedules.length }, "Found schedules due for execution");

      // Process each schedule
      for (const schedule of schedules) {
        try {
          await this.processSchedule(schedule);
        } catch (error) {
          logger.error(
            { error, scheduleId: schedule.id, fieldId: schedule.fieldId },
            "Failed to process profiling schedule"
          );
          // Continue with next schedule
        }
      }

      const duration = Date.now() - startTime;
      logger.info({ duration, processed: schedules.length }, "Profiling scheduler execution completed");
    } catch (error) {
      logger.error({ error }, "Profiling scheduler execution failed");
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process a single profiling schedule.
   */
  private async processSchedule(schedule: any): Promise<void> {
    const { id, tenantId, fieldId, fieldUrn, governanceTier, frequency } = schedule;

    logger.info(
      { scheduleId: id, fieldId, governanceTier, frequency },
      "Processing profiling schedule"
    );

    // Get field metadata
    const field = await fieldDictionaryRepository.findById(fieldId);
    if (!field) {
      logger.warn({ fieldId }, "Field not found, skipping schedule");
      return;
    }

    // Create profiling job
    const job = await profilingRepository.createJob({
      tenantId,
      fieldId,
      fieldUrn,
      status: "pending",
      scheduledAt: new Date(),
      startedAt: null,
      completedAt: null,
      error: null,
      stats: null,
    });

    // Update job status to running
    await profilingRepository.updateJobStatus(job.id, "running", {
      startedAt: new Date(),
    });

    try {
      // Run profiling
      // Note: We need tableName and columnName from field metadata or configuration
      // For now, we'll try to infer from field metadata or use field canonical key
      const tableName = (field as any).metadata?.tableName || field.canonicalKey.split("_")[0];
      const columnName = (field as any).metadata?.columnName || field.canonicalKey;

      if (!tableName || !columnName) {
        throw new KernelError(
          `Cannot determine table/column for field ${fieldId}. Field metadata missing.`,
          "PROFILING_CONFIG_ERROR"
        );
      }

      const stats = await profilingService.profileField(
        fieldId,
        tableName,
        columnName,
        {
          includeTopValues: true,
          topValuesLimit: 10,
        }
      );

      // Update job status to completed
      await profilingRepository.updateJobStatus(job.id, "completed", {
        completedAt: new Date(),
        statsId: stats.id,
      });

      // Calculate next run time based on frequency
      const nextRunAt = this.calculateNextRunTime(new Date(), frequency);

      // Update schedule
      await profilingRepository.updateScheduleAfterRun(
        id,
        new Date(),
        nextRunAt
      );

      logger.info(
        { scheduleId: id, fieldId, nextRunAt },
        "Profiling schedule processed successfully"
      );
    } catch (error) {
      // Update job status to failed
      await profilingRepository.updateJobStatus(job.id, "failed", {
        completedAt: new Date(),
        error: error instanceof Error ? error.message : String(error),
      });

      logger.error(
        { error, scheduleId: id, fieldId },
        "Profiling schedule processing failed"
      );
      throw error;
    }
  }

  /**
   * Calculate next run time based on frequency.
   */
  private calculateNextRunTime(now: Date, frequency: "daily" | "weekly" | "monthly"): Date {
    const nextRun = new Date(now);

    switch (frequency) {
      case "daily":
        nextRun.setDate(nextRun.getDate() + 1);
        break;
      case "weekly":
        nextRun.setDate(nextRun.getDate() + 7);
        break;
      case "monthly":
        nextRun.setMonth(nextRun.getMonth() + 1);
        break;
    }

    return nextRun;
  }

  /**
   * Manually trigger profiling for a field (for testing or on-demand profiling).
   */
  async triggerProfiling(
    tenantId: string | null,
    fieldId: string,
    tableName?: string,
    columnName?: string
  ): Promise<void> {
    logger.info({ tenantId, fieldId, tableName, columnName }, "Manually triggering profiling");

    try {
      await profilingService.profileField(fieldId, tableName, columnName, {
        includeTopValues: true,
        topValuesLimit: 10,
      });

      logger.info({ fieldId }, "Manual profiling completed");
    } catch (error) {
      logger.error({ error, fieldId }, "Manual profiling failed");
      throw error;
    }
  }
}

/**
 * Singleton instance
 */
export const profilingSchedulerJob = new ProfilingSchedulerJob();

/**
 * Initialize profiling scheduler on module load (if enabled).
 */
if (process.env.ENABLE_PROFILING_SCHEDULER === "true") {
  profilingSchedulerJob.start();
}

