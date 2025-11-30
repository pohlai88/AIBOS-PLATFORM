/**
 * 📊 Telemetry Module v1.0
 * 
 * Complete observability stack:
 * - Metrics collection
 * - Distributed tracing
 * - Heatmap visualization
 * - Alerting
 * 
 * @version 1.0.0
 */

// Metrics
export { MetricsCollector, metricsCollector } from "./metrics-collector";
export type { Metric, MetricSummary, HistogramBucket } from "./metrics-collector";

// Tracing
export { TraceManager, traceManager } from "./trace-manager";
export type { Span, SpanContext, SpanEvent, Trace } from "./trace-manager";

// Heatmaps
export { HeatmapGenerator, heatmapGenerator } from "./heatmap-generator";
export type { Heatmap, HeatmapCell, ActivityRecord } from "./heatmap-generator";

// Alerting
export { AlertManager, alertManager } from "./alert-manager";
export type { Alert, AlertRule, AlertSeverity, AlertStatus } from "./alert-manager";

