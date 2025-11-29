/**
 * 🔍 Trace Manager v1.0
 * 
 * Distributed tracing for request flows:
 * - Span creation and management
 * - Context propagation
 * - OpenTelemetry compatible
 * 
 * @version 1.0.0
 */

import crypto from "crypto";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export interface Span {
  context: SpanContext;
  name: string;
  kind: "internal" | "server" | "client" | "producer" | "consumer";
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: "ok" | "error" | "unset";
  attributes: Record<string, string | number | boolean>;
  events: SpanEvent[];
}

export interface SpanEvent {
  name: string;
  timestamp: number;
  attributes?: Record<string, string | number | boolean>;
}

export interface Trace {
  traceId: string;
  spans: Span[];
  startTime: number;
  endTime?: number;
  rootSpan?: Span;
}

// ═══════════════════════════════════════════════════════════
// Trace Manager
// ═══════════════════════════════════════════════════════════

export class TraceManager {
  private static traces = new Map<string, Trace>();
  private static activeSpans = new Map<string, Span>();
  private static readonly MAX_TRACES = 1000;
  private static readonly MAX_SPANS_PER_TRACE = 100;

  /**
   * Start a new trace
   */
  static startTrace(name: string, attributes?: Record<string, string | number | boolean>): Span {
    const traceId = this.generateId();
    const spanId = this.generateId();

    const span: Span = {
      context: { traceId, spanId },
      name,
      kind: "server",
      startTime: Date.now(),
      status: "unset",
      attributes: { ...attributes },
      events: [],
    };

    const trace: Trace = {
      traceId,
      spans: [span],
      startTime: span.startTime,
      rootSpan: span,
    };

    this.traces.set(traceId, trace);
    this.activeSpans.set(spanId, span);

    // Cleanup old traces
    if (this.traces.size > this.MAX_TRACES) {
      const oldest = Array.from(this.traces.keys())[0];
      this.traces.delete(oldest);
    }

    return span;
  }

  /**
   * Start a child span
   */
  static startSpan(
    name: string,
    parentContext: SpanContext,
    kind: Span["kind"] = "internal",
    attributes?: Record<string, string | number | boolean>
  ): Span {
    const spanId = this.generateId();

    const span: Span = {
      context: {
        traceId: parentContext.traceId,
        spanId,
        parentSpanId: parentContext.spanId,
      },
      name,
      kind,
      startTime: Date.now(),
      status: "unset",
      attributes: { ...attributes },
      events: [],
    };

    const trace = this.traces.get(parentContext.traceId);
    if (trace && trace.spans.length < this.MAX_SPANS_PER_TRACE) {
      trace.spans.push(span);
    }

    this.activeSpans.set(spanId, span);
    return span;
  }

  /**
   * End a span
   */
  static endSpan(span: Span, status: Span["status"] = "ok"): void {
    span.endTime = Date.now();
    span.durationMs = span.endTime - span.startTime;
    span.status = status;
    this.activeSpans.delete(span.context.spanId);

    // Update trace end time
    const trace = this.traces.get(span.context.traceId);
    if (trace) {
      trace.endTime = Math.max(trace.endTime || 0, span.endTime);
    }
  }

  /**
   * Add event to span
   */
  static addEvent(
    span: Span,
    name: string,
    attributes?: Record<string, string | number | boolean>
  ): void {
    span.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }

  /**
   * Set span attribute
   */
  static setAttribute(span: Span, key: string, value: string | number | boolean): void {
    span.attributes[key] = value;
  }

  /**
   * Set span error
   */
  static setError(span: Span, error: Error): void {
    span.status = "error";
    span.attributes["error.type"] = error.name;
    span.attributes["error.message"] = error.message;
    this.addEvent(span, "exception", {
      "exception.type": error.name,
      "exception.message": error.message,
    });
  }

  /**
   * Get trace by ID
   */
  static getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get recent traces
   */
  static getRecentTraces(limit: number = 100): Trace[] {
    return Array.from(this.traces.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * Get traces by tenant
   */
  static getTracesByTenant(tenantId: string, limit: number = 50): Trace[] {
    return Array.from(this.traces.values())
      .filter(t => t.rootSpan?.attributes["tenant.id"] === tenantId)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * Get slow traces
   */
  static getSlowTraces(thresholdMs: number, limit: number = 50): Trace[] {
    return Array.from(this.traces.values())
      .filter(t => t.rootSpan?.durationMs && t.rootSpan.durationMs > thresholdMs)
      .sort((a, b) => (b.rootSpan?.durationMs || 0) - (a.rootSpan?.durationMs || 0))
      .slice(0, limit);
  }

  /**
   * Get error traces
   */
  static getErrorTraces(limit: number = 50): Trace[] {
    return Array.from(this.traces.values())
      .filter(t => t.spans.some(s => s.status === "error"))
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  /**
   * Export trace in OpenTelemetry format
   */
  static exportOTLP(trace: Trace): any {
    return {
      resourceSpans: [{
        resource: {
          attributes: [
            { key: "service.name", value: { stringValue: "aibos-kernel" } },
          ],
        },
        scopeSpans: [{
          scope: { name: "aibos-kernel" },
          spans: trace.spans.map(span => ({
            traceId: span.context.traceId,
            spanId: span.context.spanId,
            parentSpanId: span.context.parentSpanId,
            name: span.name,
            kind: this.spanKindToOTLP(span.kind),
            startTimeUnixNano: span.startTime * 1000000,
            endTimeUnixNano: (span.endTime || Date.now()) * 1000000,
            attributes: Object.entries(span.attributes).map(([k, v]) => ({
              key: k,
              value: typeof v === "string" ? { stringValue: v } : { intValue: v },
            })),
            status: { code: span.status === "error" ? 2 : 1 },
          })),
        }],
      }],
    };
  }

  /**
   * Clear all traces
   */
  static clear(): void {
    this.traces.clear();
    this.activeSpans.clear();
  }

  private static generateId(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  private static spanKindToOTLP(kind: Span["kind"]): number {
    const map = { internal: 1, server: 2, client: 3, producer: 4, consumer: 5 };
    return map[kind] || 1;
  }
}

export const traceManager = TraceManager;

