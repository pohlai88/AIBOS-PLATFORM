/**
 * Secret Expiration Monitor
 * 
 * Monitors secret expiration and sends alerts
 */

import { baseLogger as logger } from "../../observability/logger";
import { eventBus } from "../../events/event-bus";
import type { SecretType } from "./types";

/**
 * Expiration Monitor Configuration
 */
export interface ExpirationMonitorConfig {
  /**
   * Check interval in milliseconds
   * Default: 1 hour
   */
  checkInterval?: number;

  /**
   * Alert thresholds (days before expiration)
   */
  alertThresholds?: {
    warning?: number; // Default: 7 days
    critical?: number; // Default: 3 days
  };
}

/**
 * Secret Expiration Info
 */
export interface SecretExpirationInfo {
  secretType: SecretType;
  expiresAt: Date;
  daysUntilExpiration: number;
  alertLevel: "none" | "warning" | "critical" | "expired";
}

/**
 * Secret Expiration Monitor
 */
export class ExpirationMonitor {
  private checkInterval?: NodeJS.Timeout;
  private config: Required<ExpirationMonitorConfig>;

  constructor(config: ExpirationMonitorConfig = {}) {
    this.config = {
      checkInterval: config.checkInterval || 60 * 60 * 1000, // 1 hour
      alertThresholds: {
        warning: config.alertThresholds?.warning || 7,
        critical: config.alertThresholds?.critical || 3,
      },
    };
  }

  /**
   * Start monitoring
   */
  public start(
    getExpirationInfo: (secretType: SecretType) => Promise<{
      expiresAt: Date;
    } | null>
  ): void {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    logger.info("[ExpirationMonitor] Starting secret expiration monitoring");

    this.checkInterval = setInterval(async () => {
      await this.checkExpirations(getExpirationInfo);
    }, this.config.checkInterval);

    // Initial check
    this.checkExpirations(getExpirationInfo).catch((error) => {
      logger.error(
        { error: error instanceof Error ? error.message : String(error) },
        "[ExpirationMonitor] Error in expiration check"
      );
    });
  }

  /**
   * Stop monitoring
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
      logger.info("[ExpirationMonitor] Stopped expiration monitoring");
    }
  }

  /**
   * Check expirations for all secret types
   */
  private async checkExpirations(
    getExpirationInfo: (secretType: SecretType) => Promise<{
      expiresAt: Date;
    } | null>
  ): Promise<void> {
    const secretTypes: SecretType[] = [
      "jwt",
      "apiKey",
      "dbPassword",
      "encryptionKey",
    ];

    for (const secretType of secretTypes) {
      try {
        const info = await getExpirationInfo(secretType);
        if (!info) continue;

        const expiration = this.calculateExpiration(info.expiresAt);
        if (expiration.alertLevel !== "none") {
          await this.sendAlert(secretType, expiration);
        }
      } catch (error) {
        logger.error(
          {
            secretType,
            error: error instanceof Error ? error.message : String(error),
          },
          "[ExpirationMonitor] Error checking expiration"
        );
      }
    }
  }

  /**
   * Calculate expiration status
   */
  private calculateExpiration(expiresAt: Date): {
    daysUntilExpiration: number;
    alertLevel: "none" | "warning" | "critical" | "expired";
  } {
    const now = Date.now();
    const expirationTime = expiresAt.getTime();
    const daysUntilExpiration = Math.floor(
      (expirationTime - now) / (1000 * 60 * 60 * 24)
    );

    let alertLevel: "none" | "warning" | "critical" | "expired" = "none";

    if (daysUntilExpiration < 0) {
      alertLevel = "expired";
    } else if (daysUntilExpiration <= this.config.alertThresholds.critical) {
      alertLevel = "critical";
    } else if (daysUntilExpiration <= this.config.alertThresholds.warning) {
      alertLevel = "warning";
    }

    return { daysUntilExpiration, alertLevel };
  }

  /**
   * Send expiration alert
   */
  private async sendAlert(
    secretType: SecretType,
    expiration: {
      daysUntilExpiration: number;
      alertLevel: "none" | "warning" | "critical" | "expired";
    }
  ): Promise<void> {
    const eventType =
      expiration.alertLevel === "expired"
        ? "security.secret.expired"
        : "security.secret.expiring";

    await eventBus.publishTyped(eventType, {
      type: eventType,
      tenantId: "system",
      payload: {
        secretType,
        daysUntilExpiration: expiration.daysUntilExpiration,
        alertLevel: expiration.alertLevel,
      },
    });

    const logLevel =
      expiration.alertLevel === "expired" || expiration.alertLevel === "critical"
        ? "error"
        : "warn";

    logger[logLevel](
      {
        secretType,
        daysUntilExpiration: expiration.daysUntilExpiration,
        alertLevel: expiration.alertLevel,
      },
      `[ExpirationMonitor] Secret ${expiration.alertLevel} alert`
    );
  }
}

