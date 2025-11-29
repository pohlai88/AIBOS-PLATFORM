// jobs/dlq-monitor.job.ts
/**
 * Dead Letter Queue (DLQ) Monitor Job
 * 
 * Monitors and processes failed events from the Event Bus DLQ.
 * 
 * Features:
 * - Periodic DLQ inspection
 * - Automatic retry with backoff
 * - Alert on persistent failures
 * - DLQ metrics collection
 */

import { schedule } from "node-cron";
import { eventBus } from "../events/event-bus";
import { baseLogger } from "../observability/logger";

/**
 * DLQ Monitor Configuration
 */
export interface DLQMonitorConfig {
  /** Enable automatic retries */
  autoRetry: boolean;

  /** Max retries before alerting */
  maxRetries: number;

  /** Monitoring interval (cron expression) */
  schedule: string;

  /** Alert threshold (number of failed events) */
  alertThreshold: number;
}

const DEFAULT_CONFIG: DLQMonitorConfig = {
  autoRetry: true,
  maxRetries: 3,
  schedule: "*/5 * * * *", // Every 5 minutes
  alertThreshold: 10,
};

/**
 * Run DLQ monitoring cycle
 * 
 * @returns Monitoring result
 */
export async function monitorDLQ(config: Partial<DLQMonitorConfig> = {}): Promise<{
  dlqSize: number;
  retried: number;
  succeeded: number;
  failed: number;
  alerted: boolean;
}> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Get current DLQ entries
  const deadLetters = eventBus.getDeadLetters();

  baseLogger.info({ dlqSize: deadLetters.length }, "[DLQ Monitor] Checking DLQ (%d entries)...", deadLetters.length);

  if (deadLetters.length === 0) {
    return {
      dlqSize: 0,
      retried: 0,
      succeeded: 0,
      failed: 0,
      alerted: false,
    };
  }

  // Log DLQ entries
  for (const entry of deadLetters) {
    baseLogger.warn(
      {
        event: entry.event,
        payload: entry.payload,
        error: entry.error.message,
        retries: entry.retries,
        failedAt: entry.failedAt,
      },
      "[DLQ] Failed event: %s",
      entry.event
    );
  }

  // Attempt retry if enabled
  let succeeded = 0;
  let failed = 0;

  if (cfg.autoRetry) {
    const result = await eventBus.retryDeadLetters(cfg.maxRetries);
    succeeded = result.succeeded;
    failed = result.failed;

    baseLogger.info(
      { succeeded, failed },
      "[DLQ Monitor] Retry results: %d succeeded, %d failed",
      succeeded,
      failed
    );
  }

  // Alert if threshold exceeded
  const alerted = deadLetters.length >= cfg.alertThreshold;

  if (alerted) {
    await sendDLQAlert({
      dlqSize: deadLetters.length,
      threshold: cfg.alertThreshold,
      entries: deadLetters.slice(0, 5), // First 5 entries for context
    });
  }

  // Emit monitoring metrics
  await eventBus.publishTyped("kernel.info", {
    type: "kernel.info",
    payload: {
      component: "DLQ Monitor",
      dlqSize: deadLetters.length,
      retried: succeeded + failed,
      succeeded,
      failed,
    },
  });

  return {
    dlqSize: deadLetters.length,
    retried: succeeded + failed,
    succeeded,
    failed,
    alerted,
  };
}

/**
 * Send DLQ alert
 * 
 * @param alert - Alert details
 */
async function sendDLQAlert(alert: {
  dlqSize: number;
  threshold: number;
  entries: Array<unknown>;
}): Promise<void> {
  baseLogger.error(
    { size: alert.dlqSize, threshold: alert.threshold },
    "[DLQ Monitor] 🚨 ALERT: DLQ threshold exceeded!"
  );

  // TODO: Integrate with alerting system
  // - PagerDuty
  // - Slack
  // - Email
  // - SMS

  // Emit alert event
  await eventBus.publishTyped("kernel.error", {
    type: "kernel.error",
    payload: {
      component: "DLQ Monitor",
      severity: "CRITICAL",
      message: `DLQ threshold exceeded: ${alert.dlqSize} failed events`,
      dlqSize: alert.dlqSize,
      threshold: alert.threshold,
      sampleEntries: alert.entries,
    },
  });
}

/**
 * Start DLQ monitoring job
 * 
 * @param config - Monitor configuration
 */
export function startDLQMonitor(config: Partial<DLQMonitorConfig> = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  baseLogger.info({ schedule: cfg.schedule }, "[DLQ Monitor] Starting DLQ monitor (schedule: %s)...", cfg.schedule);

  // Schedule monitoring job
  schedule(cfg.schedule, async () => {
    try {
      await monitorDLQ(cfg);
    } catch (error) {
      baseLogger.error({ error }, "[DLQ Monitor] Monitoring job failed");
    }
  });

  baseLogger.info("[DLQ Monitor] ✅ DLQ monitor started");
}

/**
 * Get DLQ statistics
 * 
 * @returns DLQ stats
 */
export function getDLQStats(): {
  totalEntries: number;
  byEvent: Record<string, number>;
  byError: Record<string, number>;
  oldestEntry: Date | null;
  newestEntry: Date | null;
} {
  const deadLetters = eventBus.getDeadLetters();

  if (deadLetters.length === 0) {
    return {
      totalEntries: 0,
      byEvent: {},
      byError: {},
      oldestEntry: null,
      newestEntry: null,
    };
  }

  const byEvent: Record<string, number> = {};
  const byError: Record<string, number> = {};

  for (const entry of deadLetters) {
    // Count by event type
    byEvent[entry.event] = (byEvent[entry.event] || 0) + 1;

    // Count by error message
    const errorKey = entry.error.message;
    byError[errorKey] = (byError[errorKey] || 0) + 1;
  }

  const dates = deadLetters.map((e) => e.failedAt);
  const oldestEntry = new Date(Math.min(...dates.map((d) => d.getTime())));
  const newestEntry = new Date(Math.max(...dates.map((d) => d.getTime())));

  return {
    totalEntries: deadLetters.length,
    byEvent,
    byError,
    oldestEntry,
    newestEntry,
  };
}

