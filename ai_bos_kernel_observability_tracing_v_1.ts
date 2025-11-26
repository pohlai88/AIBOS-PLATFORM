// AI-BOS Kernel – Observability Tracing v1
// This document contains reference implementations for:
// 1) observability/tracing.ts
// 2) observability/index.ts (export wiring)
//
// Copy each section into its respective file in the `kernel/observability` directory.
// Adjust import paths if your folder structure differs slightly.

// ────────────────────────────────────────────────────────────────────────────────
// 1) observability/tracing.ts
// ────────────────────────────────────────────────────────────────────────────────

import {
  context as otelContext,
  trace,
  Span,
  SpanKind,
  SpanStatusCode,
  type Context as OtelContext,
} from '@opentelemetry/api';

import { createTraceLogger } from './logger';

const logger = createTraceLogger('observability:tracing');

export type SpanCategory = 'http' | 'action' | 'db' | 'cache' | 'policy' | 'kernel';

export interface SpanAttributes {
  [key: string]: string | number | boolean;
}

export interface SpanOptions {
  category?: SpanCategory;
  kind?: SpanKind;
  attributes?: SpanAttributes;
  /**
   * Optional parent context (for manual parenting).
   * If omitted, the current OTEL context will be used.
   */
  parentContext?: OtelContext;
}

/**
 * Returns the shared tracer instance for the kernel. The actual OTEL SDK /
 * exporter configuration must be done at process bootstrap (e.g. in a
 * separate `tracing-bootstrap.ts` file or via an auto-instrumentation entry).
 */
export function getKernelTracer() {
  return trace.getTracer('aibos-kernel');
}

/**
 * Generic helper to execute a function within a span and automatically
 * capture errors/exceptions.
 */
export async function withSpan<T>(
  name: string,
  options: SpanOptions,
  fn: (span: Span) => Promise<T> | T,
): Promise<T> {
  const tracer = getKernelTracer();

  const parentCtx = options.parentContext ?? otelContext.active();

  const span = tracer.startSpan(
    name,
    {
      kind: options.kind ?? SpanKind.INTERNAL,
      attributes: {
        'aibos.span.category': options.category ?? 'kernel',
        ...options.attributes,
      },
    },
    parentCtx,
  );

  try {
    const result = await otelContext.with(trace.setSpan(parentCtx, span), () => fn(span));
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (err) {
    const error = err as Error;

    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message ?? 'Unknown error',
    });

    span.recordException(error);

    logger.error(
      {
        err,
        spanName: name,
        category: options.category ?? 'kernel',
      },
      'span.execution_failed',
    );

    throw err;
  } finally {
    span.end();
  }
}

/**
 * Convenience wrapper for HTTP server spans (e.g. Hono handlers). Use this in
 * your router to wrap request handling logic.
 */
export async function withHttpSpan<T>(
  routeName: string,
  attributes: SpanAttributes,
  fn: (span: Span) => Promise<T> | T,
): Promise<T> {
  return withSpan(`http:${routeName}`, { category: 'http', kind: SpanKind.SERVER, attributes }, fn);
}

/**
 * Wraps an action execution (kernel action dispatcher) in a span.
 */
export async function withActionSpan<T>(
  actionId: string,
  attributes: SpanAttributes,
  fn: (span: Span) => Promise<T> | T,
): Promise<T> {
  return withSpan(
    `action:${actionId}`,
    {
      category: 'action',
      kind: SpanKind.INTERNAL,
      attributes: {
        'aibos.action.id': actionId,
        ...attributes,
      },
    },
    fn,
  );
}

/**
 * Wraps a DB operation in a span. Intended for use in the storage layer.
 */
export async function withDbSpan<T>(
  operation: string,
  attributes: SpanAttributes,
  fn: (span: Span) => Promise<T> | T,
): Promise<T> {
  return withSpan(
    `db:${operation}`,
    {
      category: 'db',
      kind: SpanKind.CLIENT,
      attributes,
    },
    fn,
  );
}

/**
 * Wraps a cache/Redis operation in a span.
 */
export async function withCacheSpan<T>(
  operation: string,
  attributes: SpanAttributes,
  fn: (span: Span) => Promise<T> | T,
): Promise<T> {
  return withSpan(
    `cache:${operation}`,
    {
      category: 'cache',
      kind: SpanKind.CLIENT,
      attributes,
    },
    fn,
  );
}

/**
 * Expose a simple helper to attach a trace id (if present) to structured
 * logs and downstream systems. This reads the currently active span and
 * pulls its trace id.
 */
export function getCurrentTraceId(): string | null {
  const span = trace.getSpan(otelContext.active());
  if (!span) return null;
  const spanContext = span.spanContext();
  return spanContext?.traceId ?? null;
}

/**
 * Helper to create attributes from a Hono/HTTP request (or similar). Keeps
 * this module decoupled from a specific HTTP framework type.
 */
export function buildHttpSpanAttributes(input: {
  method: string;
  path: string;
  route?: string;
  statusCode?: number;
  tenantId?: string | null;
}): SpanAttributes {
  const attrs: SpanAttributes = {
    'http.method': input.method,
    'http.target': input.path,
  };

  if (input.route) attrs['http.route'] = input.route;
  if (typeof input.statusCode === 'number') attrs['http.status_code'] = input.statusCode;
  if (input.tenantId) attrs['aibos.tenant.id'] = input.tenantId;

  return attrs;
}

// ────────────────────────────────────────────────────────────────────────────────
// 2) observability/index.ts
// ────────────────────────────────────────────────────────────────────────────────

export * from './logger';
export * from './metrics';
export * from './tracing';
