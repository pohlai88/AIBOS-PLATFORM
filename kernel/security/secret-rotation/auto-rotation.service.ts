/**
 * Automatic Secret Rotation Service
 * 
 * GRCD-KERNEL v4.0.0 - Secret Rotation Automation Enhancement
 * Based on AWS Secrets Manager rotation patterns
 * 
 * Provides:
 * - Automatic rotation of API keys, tokens, certificates
 * - Zero-downtime secret rotation
 * - Secret expiration alerts
 * - Scheduled rotation based on policy
 */

import { schedule } from "node-cron";
import { SecretManager } from "./secret.manager";
import { baseLogger as logger } from "../../observability/logger";
import { eventBus } from "../../events/event-bus";
import { appendAuditEntry } from "../../audit/hash-chain.store";
import type { SecretType, RotationResult } from "./types";

/**
 * Rotation Schedule Configuration
 */
export interface RotationSchedule {
  /**
   * Secret type to rotate
   */
  secretType: SecretType;

  /**
   * Cron expression for rotation schedule
   * Examples:
   * - "0 0 * * *" - Daily at midnight
   * - "0 0 * * 0" - Weekly on Sunday
   * - "0 0 1 * *" - Monthly on 1st
   */
  cronExpression: string;

  /**
   * Rotation interval in days (alternative to cron)
   */
  intervalDays?: number;

  /**
   * Alert days before expiration
   * Default: 7 days
   */
  alertDaysBeforeExpiration?: number;

  /**
   * Enable automatic rotation
   * Default: true
   */
  enabled?: boolean;
}

/**
 * Secret Expiration Alert
 */
export interface ExpirationAlert {
  secretType: SecretType;
  expiresAt: Date;
  daysUntilExpiration: number;
  alertLevel: "warning" | "critical";
}

/**
 * Automatic Secret Rotation Service
 * 
 * Manages automatic rotation of secrets based on schedules
 */
export class AutoRotationService {
  private static instance: AutoRotationService;
  private secretManager: SecretManager;
  private schedules: Map<SecretType, RotationSchedule> = new Map();
  private cronJobs: Map<SecretType, ReturnType<typeof schedule>> = new Map();
  private expirationAlerts: Map<SecretType, ExpirationAlert> = new Map();
  private alertCheckInterval?: NodeJS.Timeout;
  private initialized = false;

  private constructor(secretManager: SecretManager) {
    this.secretManager = secretManager;
  }

  public static getInstance(secretManager: SecretManager): AutoRotationService {
    if (!AutoRotationService.instance) {
      AutoRotationService.instance = new AutoRotationService(secretManager);
    }
    return AutoRotationService.instance;
  }

  /**
   * Initialize automatic rotation service
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn("[AutoRotationService] Already initialized");
      return;
    }

    logger.info("[AutoRotationService] Initializing automatic secret rotation");

    // Load default schedules
    this.loadDefaultSchedules();

    // Start scheduled rotations
    this.startScheduledRotations();

    // Start expiration monitoring
    this.startExpirationMonitoring();

    this.initialized = true;
    logger.info(
      {
        schedules: this.schedules.size,
      },
      "[AutoRotationService] Initialized automatic rotation"
    );
  }

  /**
   * Register a rotation schedule
   */
  public registerSchedule(schedule: RotationSchedule): void {
    this.schedules.set(schedule.secretType, schedule);

    // Stop existing cron job if any
    const existingJob = this.cronJobs.get(schedule.secretType);
    if (existingJob) {
      existingJob.stop();
    }

    // Start new cron job if enabled
    if (schedule.enabled !== false) {
      this.startRotationJob(schedule);
    }

    logger.info(
      {
        secretType: schedule.secretType,
        cronExpression: schedule.cronExpression,
      },
      "[AutoRotationService] Registered rotation schedule"
    );
  }

  /**
   * Rotate a secret automatically (with zero-downtime)
   */
  public async rotateSecret(
    secretType: SecretType,
    tenantId: string = "system"
  ): Promise<RotationResult> {
    logger.info(
      { secretType, tenantId },
      "[AutoRotationService] Starting automatic rotation"
    );

    try {
      // Perform rotation (zero-downtime is handled by SecretManager)
      const result = await this.secretManager.rotateSecret(secretType, tenantId);

      if (result.success) {
        // Emit rotation event
        await eventBus.publishTyped("security.secret.auto.rotated", {
          type: "security.secret.auto.rotated",
          tenantId,
          payload: {
            secretType,
            rotatedAt: new Date().toISOString(),
            nextRotationAt: this.getNextRotationTime(secretType)?.toISOString(),
          },
        });

        // Audit rotation
        await appendAuditEntry({
          tenantId,
          actorId: "auto-rotation-service",
          actionId: "security.secret.auto.rotated",
          payload: {
            secretType,
            rotatedAt: new Date().toISOString(),
            method: "automatic",
          },
        });

        logger.info(
          { secretType, tenantId },
          "[AutoRotationService] Secret rotated successfully"
        );
      } else {
        logger.warn(
          {
            secretType,
            tenantId,
            error: result.error,
          },
          "[AutoRotationService] Secret rotation failed"
        );
      }

      return result;
    } catch (error) {
      logger.error(
        {
          secretType,
          tenantId,
          error: error instanceof Error ? error.message : String(error),
        },
        "[AutoRotationService] Error during rotation"
      );

      return {
        success: false,
        type: secretType,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check for expiring secrets and send alerts
   */
  public async checkExpirations(): Promise<ExpirationAlert[]> {
    const alerts: ExpirationAlert[] = [];

    for (const [secretType, schedule] of this.schedules.entries()) {
      try {
        const expirationInfo = await this.getExpirationInfo(secretType);
        if (!expirationInfo) continue;

        const daysUntilExpiration = Math.floor(
          (expirationInfo.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        const alertDays = schedule.alertDaysBeforeExpiration || 7;

        if (daysUntilExpiration <= alertDays && daysUntilExpiration >= 0) {
          const alert: ExpirationAlert = {
            secretType,
            expiresAt: expirationInfo.expiresAt,
            daysUntilExpiration,
            alertLevel: daysUntilExpiration <= 3 ? "critical" : "warning",
          };

          alerts.push(alert);
          this.expirationAlerts.set(secretType, alert);

          // Emit alert event
          await eventBus.publishTyped("security.secret.expiring", {
            type: "security.secret.expiring",
            tenantId: "system",
            payload: {
              secretType,
              expiresAt: expirationInfo.expiresAt.toISOString(),
              daysUntilExpiration,
              alertLevel: alert.alertLevel,
            },
          });

          logger.warn(
            {
              secretType,
              daysUntilExpiration,
              alertLevel: alert.alertLevel,
            },
            "[AutoRotationService] Secret expiration alert"
          );
        } else if (daysUntilExpiration < 0) {
          // Secret already expired - trigger immediate rotation
          logger.error(
            { secretType, daysOverdue: Math.abs(daysUntilExpiration) },
            "[AutoRotationService] Secret expired, triggering emergency rotation"
          );

          await this.rotateSecret(secretType, "system");
        }
      } catch (error) {
        logger.error(
          {
            secretType,
            error: error instanceof Error ? error.message : String(error),
          },
          "[AutoRotationService] Error checking expiration"
        );
      }
    }

    return alerts;
  }

  /**
   * Get all expiration alerts
   */
  public getExpirationAlerts(): ExpirationAlert[] {
    return Array.from(this.expirationAlerts.values());
  }

  /**
   * Get next rotation time for a secret type
   */
  public getNextRotationTime(secretType: SecretType): Date | null {
    const schedule = this.schedules.get(secretType);
    if (!schedule) return null;

    // For cron-based schedules, calculate next run time
    // This is simplified - in production, use a proper cron parser
    if (schedule.intervalDays) {
      return new Date(Date.now() + schedule.intervalDays * 24 * 60 * 60 * 1000);
    }

    // For cron expressions, would need to parse and calculate next run
    // For now, return null (would need cron-parser library)
    return null;
  }

  /**
   * Stop automatic rotation
   */
  public stop(): void {
    // Stop all cron jobs
    for (const job of this.cronJobs.values()) {
      job.stop();
    }
    this.cronJobs.clear();

    // Stop expiration monitoring
    if (this.alertCheckInterval) {
      clearInterval(this.alertCheckInterval);
      this.alertCheckInterval = undefined;
    }

    logger.info("[AutoRotationService] Stopped automatic rotation");
  }

  /**
   * Load default rotation schedules
   */
  private loadDefaultSchedules(): void {
    // JWT secrets - 30 days
    this.schedules.set("jwt", {
      secretType: "jwt",
      cronExpression: "0 0 1 * *", // Monthly on 1st
      intervalDays: 30,
      alertDaysBeforeExpiration: 7,
      enabled: true,
    });

    // API keys - 90 days
    this.schedules.set("api_key", {
      secretType: "api_key",
      cronExpression: "0 0 1 */3 *", // Quarterly
      intervalDays: 90,
      alertDaysBeforeExpiration: 14,
      enabled: true,
    });

    // Database passwords - 90 days
    this.schedules.set("db_password", {
      secretType: "db_password",
      cronExpression: "0 0 1 */3 *", // Quarterly
      intervalDays: 90,
      alertDaysBeforeExpiration: 14,
      enabled: true,
    });

    // Encryption keys - 180 days
    this.schedules.set("encryption_key", {
      secretType: "encryption_key",
      cronExpression: "0 0 1 */6 *", // Every 6 months
      intervalDays: 180,
      alertDaysBeforeExpiration: 30,
      enabled: true,
    });
  }

  /**
   * Start scheduled rotation jobs
   */
  private startScheduledRotations(): void {
    for (const schedule of this.schedules.values()) {
      if (schedule.enabled !== false) {
        this.startRotationJob(schedule);
      }
    }
  }

  /**
   * Start a rotation job for a schedule
   */
  private startRotationJob(schedule: RotationSchedule): void {
    // Use interval-based rotation if specified
    if (schedule.intervalDays) {
      const intervalMs = schedule.intervalDays * 24 * 60 * 60 * 1000;

      const job = setInterval(async () => {
        await this.rotateSecret(schedule.secretType, "system");
      }, intervalMs);

      // Store job reference (using cron job type for compatibility)
      this.cronJobs.set(schedule.secretType, job as any);
    } else {
      // Use cron expression
      const job = schedule(schedule.cronExpression, async () => {
        await this.rotateSecret(schedule.secretType, "system");
      });

      this.cronJobs.set(schedule.secretType, job);
    }

    logger.info(
      {
        secretType: schedule.secretType,
        schedule: schedule.cronExpression || `${schedule.intervalDays} days`,
      },
      "[AutoRotationService] Started rotation job"
    );
  }

  /**
   * Start expiration monitoring
   */
  private startExpirationMonitoring(): void {
    // Check expirations every hour
    this.alertCheckInterval = setInterval(async () => {
      await this.checkExpirations();
    }, 60 * 60 * 1000); // 1 hour

    // Initial check
    this.checkExpirations().catch((error) => {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "[AutoRotationService] Error in initial expiration check"
      );
    });
  }

  /**
   * Get expiration info for a secret type
   */
  private async getExpirationInfo(secretType: SecretType): Promise<{
    expiresAt: Date;
  } | null> {
    // This would query the secret manager for expiration info
    // For now, use schedule-based calculation
    const schedule = this.schedules.get(secretType);
    if (!schedule || !schedule.intervalDays) return null;

    // Calculate expiration based on last rotation + interval
    // In production, this would query the actual secret metadata
    const expiresAt = new Date(
      Date.now() + schedule.intervalDays * 24 * 60 * 60 * 1000
    );

    return { expiresAt };
  }
}

