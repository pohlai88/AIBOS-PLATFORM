/**
 * 🔥 Heatmap Generator v1.0
 * 
 * Visual activity heatmaps:
 * - Tenant activity
 * - Zone load
 * - Error distribution
 * - Latency patterns
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface HeatmapCell {
  x: string; // Time bucket or category
  y: string; // Tenant, zone, or metric
  value: number;
  intensity: number; // 0-1 normalized
}

export interface Heatmap {
  name: string;
  cells: HeatmapCell[];
  xAxis: string[];
  yAxis: string[];
  minValue: number;
  maxValue: number;
  generatedAt: number;
}

export interface ActivityRecord {
  tenantId: string;
  zoneId?: string;
  context: string;
  timestamp: number;
  durationMs: number;
  success: boolean;
  errorType?: string;
}

// ═══════════════════════════════════════════════════════════
// Heatmap Generator
// ═══════════════════════════════════════════════════════════

export class HeatmapGenerator {
  private static activities: ActivityRecord[] = [];
  private static readonly MAX_ACTIVITIES = 10000;

  /**
   * Record activity
   */
  static recordActivity(record: ActivityRecord): void {
    this.activities.push(record);
    if (this.activities.length > this.MAX_ACTIVITIES) {
      this.activities = this.activities.slice(-this.MAX_ACTIVITIES);
    }
  }

  /**
   * Generate tenant activity heatmap (by hour)
   */
  static generateTenantActivityHeatmap(hours: number = 24): Heatmap {
    const now = Date.now();
    const cutoff = now - hours * 3600000;
    const filtered = this.activities.filter(a => a.timestamp >= cutoff);

    // Group by tenant and hour
    const buckets = new Map<string, number>();
    const tenants = new Set<string>();
    const hourLabels: string[] = [];

    for (let h = 0; h < hours; h++) {
      hourLabels.push(`${h}h ago`);
    }

    for (const activity of filtered) {
      tenants.add(activity.tenantId);
      const hourAgo = Math.floor((now - activity.timestamp) / 3600000);
      if (hourAgo < hours) {
        const key = `${activity.tenantId}|${hourAgo}`;
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    }

    return this.buildHeatmap(
      "Tenant Activity",
      Array.from(tenants),
      hourLabels,
      buckets
    );
  }

  /**
   * Generate error heatmap by tenant and error type
   */
  static generateErrorHeatmap(): Heatmap {
    const errors = this.activities.filter(a => !a.success && a.errorType);
    
    const buckets = new Map<string, number>();
    const tenants = new Set<string>();
    const errorTypes = new Set<string>();

    for (const activity of errors) {
      tenants.add(activity.tenantId);
      errorTypes.add(activity.errorType!);
      const key = `${activity.tenantId}|${activity.errorType}`;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }

    return this.buildHeatmap(
      "Error Distribution",
      Array.from(tenants),
      Array.from(errorTypes),
      buckets
    );
  }

  /**
   * Generate latency heatmap by tenant and context
   */
  static generateLatencyHeatmap(): Heatmap {
    const buckets = new Map<string, number[]>();
    const tenants = new Set<string>();
    const contexts = new Set<string>();

    for (const activity of this.activities) {
      tenants.add(activity.tenantId);
      contexts.add(activity.context);
      const key = `${activity.tenantId}|${activity.context}`;
      
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(activity.durationMs);
    }

    // Convert to averages
    const avgBuckets = new Map<string, number>();
    for (const [key, values] of buckets) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      avgBuckets.set(key, avg);
    }

    return this.buildHeatmap(
      "Latency (avg ms)",
      Array.from(tenants),
      Array.from(contexts),
      avgBuckets
    );
  }

  /**
   * Generate zone load heatmap
   */
  static generateZoneLoadHeatmap(hours: number = 24): Heatmap {
    const now = Date.now();
    const cutoff = now - hours * 3600000;
    const filtered = this.activities.filter(a => a.timestamp >= cutoff && a.zoneId);

    const buckets = new Map<string, number>();
    const zones = new Set<string>();
    const hourLabels: string[] = [];

    for (let h = 0; h < hours; h++) {
      hourLabels.push(`${h}h ago`);
    }

    for (const activity of filtered) {
      if (activity.zoneId) {
        zones.add(activity.zoneId);
        const hourAgo = Math.floor((now - activity.timestamp) / 3600000);
        if (hourAgo < hours) {
          const key = `${activity.zoneId}|${hourAgo}`;
          buckets.set(key, (buckets.get(key) || 0) + 1);
        }
      }
    }

    return this.buildHeatmap(
      "Zone Load",
      Array.from(zones),
      hourLabels,
      buckets
    );
  }

  /**
   * Get activity summary
   */
  static getSummary(): {
    totalActivities: number;
    uniqueTenants: number;
    successRate: number;
    avgLatencyMs: number;
  } {
    const tenants = new Set(this.activities.map(a => a.tenantId));
    const successes = this.activities.filter(a => a.success).length;
    const totalLatency = this.activities.reduce((sum, a) => sum + a.durationMs, 0);

    return {
      totalActivities: this.activities.length,
      uniqueTenants: tenants.size,
      successRate: this.activities.length > 0 ? successes / this.activities.length : 1,
      avgLatencyMs: this.activities.length > 0 ? totalLatency / this.activities.length : 0,
    };
  }

  /**
   * Clear activities
   */
  static clear(): void {
    this.activities = [];
  }

  /**
   * Build heatmap from buckets
   */
  private static buildHeatmap(
    name: string,
    yAxis: string[],
    xAxis: string[],
    buckets: Map<string, number>
  ): Heatmap {
    const cells: HeatmapCell[] = [];
    let minValue = Infinity;
    let maxValue = -Infinity;

    // Find min/max
    for (const value of buckets.values()) {
      minValue = Math.min(minValue, value);
      maxValue = Math.max(maxValue, value);
    }

    if (minValue === Infinity) minValue = 0;
    if (maxValue === -Infinity) maxValue = 0;

    const range = maxValue - minValue || 1;

    // Build cells
    for (const y of yAxis) {
      for (const x of xAxis) {
        const key = `${y}|${x}`;
        const value = buckets.get(key) || 0;
        cells.push({
          x,
          y,
          value,
          intensity: (value - minValue) / range,
        });
      }
    }

    return {
      name,
      cells,
      xAxis,
      yAxis,
      minValue,
      maxValue,
      generatedAt: Date.now(),
    };
  }
}

export const heatmapGenerator = HeatmapGenerator;

