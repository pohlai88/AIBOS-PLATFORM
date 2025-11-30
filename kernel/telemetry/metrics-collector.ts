/**
 * 📊 Metrics Collector v1.0
 * 
 * Centralized metrics collection:
 * - Request metrics
 * - Execution metrics
 * - Resource metrics
 * - Zone metrics
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface Metric {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
  type: "counter" | "gauge" | "histogram";
}

export interface HistogramBucket {
  le: number; // less than or equal
  count: number;
}

export interface MetricSummary {
  name: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

// ═══════════════════════════════════════════════════════════
// Metrics Collector
// ═══════════════════════════════════════════════════════════

export class MetricsCollector {
  private static counters = new Map<string, number>();
  private static gauges = new Map<string, number>();
  private static histograms = new Map<string, number[]>();
  private static labels = new Map<string, Record<string, string>>();
  private static readonly MAX_HISTOGRAM_SIZE = 1000;

  // ═══════════════════════════════════════════════════════
  // Counter Operations
  // ═══════════════════════════════════════════════════════

  /**
   * Increment a counter
   */
  static incCounter(name: string, labels?: Record<string, string>, value: number = 1): void {
    const key = this.buildKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    if (labels) this.labels.set(key, labels);
  }

  /**
   * Get counter value
   */
  static getCounter(name: string, labels?: Record<string, string>): number {
    return this.counters.get(this.buildKey(name, labels)) || 0;
  }

  // ═══════════════════════════════════════════════════════
  // Gauge Operations
  // ═══════════════════════════════════════════════════════

  /**
   * Set a gauge value
   */
  static setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.gauges.set(key, value);
    if (labels) this.labels.set(key, labels);
  }

  /**
   * Get gauge value
   */
  static getGauge(name: string, labels?: Record<string, string>): number {
    return this.gauges.get(this.buildKey(name, labels)) || 0;
  }

  /**
   * Increment gauge
   */
  static incGauge(name: string, labels?: Record<string, string>, value: number = 1): void {
    const key = this.buildKey(name, labels);
    const current = this.gauges.get(key) || 0;
    this.gauges.set(key, current + value);
  }

  /**
   * Decrement gauge
   */
  static decGauge(name: string, labels?: Record<string, string>, value: number = 1): void {
    const key = this.buildKey(name, labels);
    const current = this.gauges.get(key) || 0;
    this.gauges.set(key, Math.max(0, current - value));
  }

  // ═══════════════════════════════════════════════════════
  // Histogram Operations
  // ═══════════════════════════════════════════════════════

  /**
   * Observe a histogram value
   */
  static observe(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    let values = this.histograms.get(key);
    
    if (!values) {
      values = [];
      this.histograms.set(key, values);
    }
    
    values.push(value);
    
    // Trim if too large
    if (values.length > this.MAX_HISTOGRAM_SIZE) {
      this.histograms.set(key, values.slice(-this.MAX_HISTOGRAM_SIZE));
    }
    
    if (labels) this.labels.set(key, labels);
  }

  /**
   * Get histogram summary
   */
  static getHistogramSummary(name: string, labels?: Record<string, string>): MetricSummary | null {
    const key = this.buildKey(name, labels);
    const values = this.histograms.get(key);
    
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      name,
      count: values.length,
      sum,
      avg: sum / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
    };
  }

  // ═══════════════════════════════════════════════════════
  // Convenience Methods
  // ═══════════════════════════════════════════════════════

  /**
   * Record request
   */
  static recordRequest(tenantId: string, endpoint: string, method: string): void {
    this.incCounter("http_requests_total", { tenant: tenantId, endpoint, method });
    this.incGauge("http_requests_active", { tenant: tenantId });
  }

  /**
   * Record request completion
   */
  static recordRequestComplete(
    tenantId: string,
    endpoint: string,
    method: string,
    durationMs: number,
    statusCode: number
  ): void {
    this.decGauge("http_requests_active", { tenant: tenantId });
    this.observe("http_request_duration_ms", durationMs, { tenant: tenantId, endpoint, method });
    this.incCounter("http_responses_total", { tenant: tenantId, status: String(statusCode) });
  }

  /**
   * Record execution
   */
  static recordExecution(tenantId: string, context: string, durationMs: number, success: boolean): void {
    this.incCounter("executions_total", { tenant: tenantId, context, success: String(success) });
    this.observe("execution_duration_ms", durationMs, { tenant: tenantId, context });
  }

  /**
   * Record error
   */
  static recordError(tenantId: string, errorType: string, context: string): void {
    this.incCounter("errors_total", { tenant: tenantId, type: errorType, context });
  }

  // ═══════════════════════════════════════════════════════
  // Export & Reset
  // ═══════════════════════════════════════════════════════

  /**
   * Export all metrics
   */
  static export(): { counters: Record<string, number>; gauges: Record<string, number>; histograms: Record<string, MetricSummary> } {
    const histogramSummaries: Record<string, MetricSummary> = {};
    
    for (const [key] of this.histograms) {
      const summary = this.getHistogramSummary(key);
      if (summary) histogramSummaries[key] = summary;
    }

    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: histogramSummaries,
    };
  }

  /**
   * Export in Prometheus format
   */
  static exportPrometheus(): string {
    const lines: string[] = [];

    // Counters
    for (const [key, value] of this.counters) {
      lines.push(`${key} ${value}`);
    }

    // Gauges
    for (const [key, value] of this.gauges) {
      lines.push(`${key} ${value}`);
    }

    // Histograms (summary)
    for (const [key] of this.histograms) {
      const summary = this.getHistogramSummary(key);
      if (summary) {
        lines.push(`${key}_count ${summary.count}`);
        lines.push(`${key}_sum ${summary.sum}`);
        lines.push(`${key}_avg ${summary.avg}`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Reset all metrics
   */
  static reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.labels.clear();
  }

  // ═══════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════

  private static buildKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
    return `${name}{${labelStr}}`;
  }

  private static percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
}

export const metricsCollector = MetricsCollector;

