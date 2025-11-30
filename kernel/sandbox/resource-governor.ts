/**
 * 🏛️ Resource Governor v3.1
 * 
 * Per-tenant resource throttling:
 * - Executions per minute
 * - CPU budget
 * - Memory budget
 * - Network call limits
 * - Concurrent execution limits
 * 
 * Prevents tenant-to-tenant attacks and resource exhaustion.
 * 
 * @version 3.1.0
 */

import { type TenantResourceQuota, type GovernorDecision } from "./types";

// ═══════════════════════════════════════════════════════════
// Tier Limits
// ═══════════════════════════════════════════════════════════

const TIER_LIMITS: Record<TenantResourceQuota["tier"], Omit<TenantResourceQuota, "tenantId" | "tier" | "currentMinuteExecutions" | "currentMinuteCpuMs" | "currentMinuteMemoryMB" | "currentMinuteNetworkCalls" | "windowStartMs">> = {
  free: {
    maxExecutionsPerMinute: 30,
    maxConcurrentExecutions: 2,
    cpuBudgetMsPerMinute: 10_000,
    memoryBudgetMBPerMinute: 100,
    networkCallsPerMinute: 50,
  },
  pro: {
    maxExecutionsPerMinute: 200,
    maxConcurrentExecutions: 10,
    cpuBudgetMsPerMinute: 60_000,
    memoryBudgetMBPerMinute: 500,
    networkCallsPerMinute: 500,
  },
  enterprise: {
    maxExecutionsPerMinute: 1000,
    maxConcurrentExecutions: 50,
    cpuBudgetMsPerMinute: 300_000,
    memoryBudgetMBPerMinute: 2000,
    networkCallsPerMinute: 5000,
  },
  kernel: {
    maxExecutionsPerMinute: Infinity,
    maxConcurrentExecutions: Infinity,
    cpuBudgetMsPerMinute: Infinity,
    memoryBudgetMBPerMinute: Infinity,
    networkCallsPerMinute: Infinity,
  },
};

// ═══════════════════════════════════════════════════════════
// Resource Governor
// ═══════════════════════════════════════════════════════════

export class ResourceGovernor {
  private quotas = new Map<string, TenantResourceQuota>();
  private concurrentExecutions = new Map<string, number>();
  private throttledUntil = new Map<string, number>();

  /**
   * Initialize quota for tenant
   */
  initTenant(tenantId: string, tier: TenantResourceQuota["tier"] = "free"): void {
    const limits = TIER_LIMITS[tier];
    this.quotas.set(tenantId, {
      tenantId,
      tier,
      ...limits,
      currentMinuteExecutions: 0,
      currentMinuteCpuMs: 0,
      currentMinuteMemoryMB: 0,
      currentMinuteNetworkCalls: 0,
      windowStartMs: Date.now(),
    });
    this.concurrentExecutions.set(tenantId, 0);
  }

  /**
   * Check if execution is allowed
   */
  checkExecution(tenantId: string): GovernorDecision {
    const quota = this.getOrCreateQuota(tenantId);
    this.maybeResetWindow(quota);

    // Check throttle
    const throttleUntil = this.throttledUntil.get(tenantId);
    if (throttleUntil && Date.now() < throttleUntil) {
      return {
        allowed: false,
        reason: `Tenant throttled until ${new Date(throttleUntil).toISOString()}`,
        throttleUntilMs: throttleUntil,
      };
    }

    // Check concurrent executions
    const concurrent = this.concurrentExecutions.get(tenantId) || 0;
    if (concurrent >= quota.maxConcurrentExecutions) {
      return {
        allowed: false,
        reason: `Max concurrent executions reached (${quota.maxConcurrentExecutions})`,
        remainingBudget: this.getRemainingBudget(quota),
      };
    }

    // Check executions per minute
    if (quota.currentMinuteExecutions >= quota.maxExecutionsPerMinute) {
      return {
        allowed: false,
        reason: `Execution limit reached (${quota.maxExecutionsPerMinute}/min)`,
        remainingBudget: this.getRemainingBudget(quota),
      };
    }

    // Check CPU budget
    if (quota.currentMinuteCpuMs >= quota.cpuBudgetMsPerMinute) {
      return {
        allowed: false,
        reason: `CPU budget exhausted (${quota.cpuBudgetMsPerMinute}ms/min)`,
        remainingBudget: this.getRemainingBudget(quota),
      };
    }

    // Check memory budget
    if (quota.currentMinuteMemoryMB >= quota.memoryBudgetMBPerMinute) {
      return {
        allowed: false,
        reason: `Memory budget exhausted (${quota.memoryBudgetMBPerMinute}MB/min)`,
        remainingBudget: this.getRemainingBudget(quota),
      };
    }

    return {
      allowed: true,
      remainingBudget: this.getRemainingBudget(quota),
    };
  }

  /**
   * Record execution start
   */
  startExecution(tenantId: string): void {
    const current = this.concurrentExecutions.get(tenantId) || 0;
    this.concurrentExecutions.set(tenantId, current + 1);

    const quota = this.getOrCreateQuota(tenantId);
    quota.currentMinuteExecutions++;
  }

  /**
   * Record execution end
   */
  endExecution(
    tenantId: string,
    metrics: { cpuMs: number; memoryMB: number; networkCalls: number }
  ): void {
    // Decrement concurrent
    const current = this.concurrentExecutions.get(tenantId) || 1;
    this.concurrentExecutions.set(tenantId, Math.max(0, current - 1));

    // Update usage
    const quota = this.getOrCreateQuota(tenantId);
    this.maybeResetWindow(quota);

    quota.currentMinuteCpuMs += metrics.cpuMs;
    quota.currentMinuteMemoryMB += metrics.memoryMB;
    quota.currentMinuteNetworkCalls += metrics.networkCalls;
  }

  /**
   * Throttle a tenant
   */
  throttle(tenantId: string, durationMs: number): void {
    this.throttledUntil.set(tenantId, Date.now() + durationMs);
  }

  /**
   * Get tenant stats
   */
  getStats(tenantId: string): TenantResourceQuota | undefined {
    return this.quotas.get(tenantId);
  }

  /**
   * Upgrade tenant tier
   */
  upgradeTier(tenantId: string, tier: TenantResourceQuota["tier"]): void {
    const quota = this.getOrCreateQuota(tenantId);
    const limits = TIER_LIMITS[tier];
    Object.assign(quota, { tier, ...limits });
  }

  // ─────────────────────────────────────────────────────────
  // Private
  // ─────────────────────────────────────────────────────────

  private getOrCreateQuota(tenantId: string): TenantResourceQuota {
    let quota = this.quotas.get(tenantId);
    if (!quota) {
      this.initTenant(tenantId, "free");
      quota = this.quotas.get(tenantId)!;
    }
    return quota;
  }

  private maybeResetWindow(quota: TenantResourceQuota): void {
    const now = Date.now();
    if (now - quota.windowStartMs >= 60_000) {
      quota.windowStartMs = now;
      quota.currentMinuteExecutions = 0;
      quota.currentMinuteCpuMs = 0;
      quota.currentMinuteMemoryMB = 0;
      quota.currentMinuteNetworkCalls = 0;
    }
  }

  private getRemainingBudget(quota: TenantResourceQuota) {
    return {
      executions: Math.max(0, quota.maxExecutionsPerMinute - quota.currentMinuteExecutions),
      cpuMs: Math.max(0, quota.cpuBudgetMsPerMinute - quota.currentMinuteCpuMs),
      memoryMB: Math.max(0, quota.memoryBudgetMBPerMinute - quota.currentMinuteMemoryMB),
      networkCalls: Math.max(0, quota.networkCallsPerMinute - quota.currentMinuteNetworkCalls),
    };
  }
}

export const resourceGovernor = new ResourceGovernor();

