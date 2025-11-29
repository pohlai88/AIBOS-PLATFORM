/**
 * ⏱️ Zone Rate Limiter v1.0
 * 
 * Per-zone resource throttling:
 * - Request rate limiting
 * - Concurrent execution limits
 * - Network call budgets
 * - Automatic cooldown
 * 
 * @version 1.0.0
 */

import { ZoneManager, type Zone } from "./zone-manager";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface RateLimitCheck {
  allowed: boolean;
  reason?: string;
  retryAfterMs?: number;
  currentUsage: {
    requests: number;
    executions: number;
    networkCalls: number;
  };
  limits: {
    maxRequests: number;
    maxExecutions: number;
    maxNetworkCalls: number;
  };
}

// ═══════════════════════════════════════════════════════════
// Zone Rate Limiter
// ═══════════════════════════════════════════════════════════

export class ZoneRateLimiter {
  private static cooldowns = new Map<string, number>();

  /**
   * Check if zone can accept a new request
   */
  static checkRequest(zoneId: string): RateLimitCheck {
    const zone = ZoneManager.getZone(zoneId);
    if (!zone) {
      return {
        allowed: false,
        reason: "Zone not found",
        currentUsage: { requests: 0, executions: 0, networkCalls: 0 },
        limits: { maxRequests: 0, maxExecutions: 0, maxNetworkCalls: 0 },
      };
    }

    // Check zone status
    if (zone.status !== "active") {
      return {
        allowed: false,
        reason: `Zone is ${zone.status}`,
        currentUsage: this.getCurrentUsage(zone),
        limits: this.getLimits(zone),
      };
    }

    // Check cooldown
    const cooldownUntil = this.cooldowns.get(zoneId);
    if (cooldownUntil && Date.now() < cooldownUntil) {
      return {
        allowed: false,
        reason: "Zone is in cooldown period",
        retryAfterMs: cooldownUntil - Date.now(),
        currentUsage: this.getCurrentUsage(zone),
        limits: this.getLimits(zone),
      };
    }

    // Reset metrics if minute has passed
    this.maybeResetMetrics(zone);

    // Check request rate
    if (zone.metrics.requestsThisMinute >= zone.config.maxRequestsPerMinute) {
      this.triggerCooldown(zoneId, 5000);
      return {
        allowed: false,
        reason: `Request rate limit exceeded (${zone.config.maxRequestsPerMinute}/min)`,
        retryAfterMs: 5000,
        currentUsage: this.getCurrentUsage(zone),
        limits: this.getLimits(zone),
      };
    }

    // Check concurrent executions
    if (zone.metrics.currentExecutions >= zone.config.maxConcurrentExecutions) {
      return {
        allowed: false,
        reason: `Concurrent execution limit reached (${zone.config.maxConcurrentExecutions})`,
        currentUsage: this.getCurrentUsage(zone),
        limits: this.getLimits(zone),
      };
    }

    return {
      allowed: true,
      currentUsage: this.getCurrentUsage(zone),
      limits: this.getLimits(zone),
    };
  }

  /**
   * Check if zone can make a network call
   */
  static checkNetworkCall(zoneId: string): RateLimitCheck {
    const zone = ZoneManager.getZone(zoneId);
    if (!zone) {
      return {
        allowed: false,
        reason: "Zone not found",
        currentUsage: { requests: 0, executions: 0, networkCalls: 0 },
        limits: { maxRequests: 0, maxExecutions: 0, maxNetworkCalls: 0 },
      };
    }

    this.maybeResetMetrics(zone);

    if (zone.metrics.networkCallsThisMinute >= zone.config.maxNetworkCallsPerMinute) {
      return {
        allowed: false,
        reason: `Network call limit exceeded (${zone.config.maxNetworkCallsPerMinute}/min)`,
        currentUsage: this.getCurrentUsage(zone),
        limits: this.getLimits(zone),
      };
    }

    return {
      allowed: true,
      currentUsage: this.getCurrentUsage(zone),
      limits: this.getLimits(zone),
    };
  }

  /**
   * Record a request
   */
  static recordRequest(zoneId: string): void {
    const zone = ZoneManager.getZone(zoneId);
    if (!zone) return;

    zone.metrics.requestsThisMinute++;
    zone.lastActivityAt = Date.now();
  }

  /**
   * Record execution start
   */
  static recordExecutionStart(zoneId: string): void {
    const zone = ZoneManager.getZone(zoneId);
    if (!zone) return;

    zone.metrics.currentExecutions++;
    zone.metrics.totalExecutions++;
    zone.lastActivityAt = Date.now();
  }

  /**
   * Record execution end
   */
  static recordExecutionEnd(zoneId: string): void {
    const zone = ZoneManager.getZone(zoneId);
    if (!zone) return;

    zone.metrics.currentExecutions = Math.max(0, zone.metrics.currentExecutions - 1);
  }

  /**
   * Record network call
   */
  static recordNetworkCall(zoneId: string): void {
    const zone = ZoneManager.getZone(zoneId);
    if (!zone) return;

    zone.metrics.networkCallsThisMinute++;
  }

  /**
   * Record blocked attempt
   */
  static recordBlocked(zoneId: string, reason: string): void {
    const zone = ZoneManager.getZone(zoneId);
    if (!zone) return;

    zone.metrics.blockedAttempts++;

    eventBus.publish({
      type: "zone.request.blocked",
      zoneId,
      tenantId: zone.tenantId,
      reason,
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Trigger cooldown for a zone
   */
  static triggerCooldown(zoneId: string, durationMs: number): void {
    this.cooldowns.set(zoneId, Date.now() + durationMs);

    const zone = ZoneManager.getZone(zoneId);
    if (zone) {
      eventBus.publish({
        type: "zone.cooldown.triggered",
        zoneId,
        tenantId: zone.tenantId,
        durationMs,
        timestamp: new Date().toISOString(),
      } as any);
    }
  }

  /**
   * Clear cooldown for a zone
   */
  static clearCooldown(zoneId: string): void {
    this.cooldowns.delete(zoneId);
  }

  /**
   * Get zone metrics
   */
  static getMetrics(zoneId: string): Zone["metrics"] | undefined {
    return ZoneManager.getZone(zoneId)?.metrics;
  }

  private static maybeResetMetrics(zone: Zone): void {
    const now = Date.now();
    if (now - zone.metrics.lastResetAt >= 60000) {
      zone.metrics.requestsThisMinute = 0;
      zone.metrics.networkCallsThisMinute = 0;
      zone.metrics.lastResetAt = now;
    }
  }

  private static getCurrentUsage(zone: Zone) {
    return {
      requests: zone.metrics.requestsThisMinute,
      executions: zone.metrics.currentExecutions,
      networkCalls: zone.metrics.networkCallsThisMinute,
    };
  }

  private static getLimits(zone: Zone) {
    return {
      maxRequests: zone.config.maxRequestsPerMinute,
      maxExecutions: zone.config.maxConcurrentExecutions,
      maxNetworkCalls: zone.config.maxNetworkCallsPerMinute,
    };
  }
}

export const zoneRateLimiter = ZoneRateLimiter;

