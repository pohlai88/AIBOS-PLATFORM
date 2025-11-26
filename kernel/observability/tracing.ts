/**
 * Tracing Helper
 * 
 * Minimal no-op-friendly tracing helper.
 * Later you can integrate @opentelemetry/api and real SDK;
 * for now it's safe to call without any external dependencies.
 */

export type Span = {
  end: () => void;
  setAttribute: (key: string, value: unknown) => void;
  setStatus: (status: "ok" | "error", message?: string) => void;
};

/**
 * Start a new span for tracing.
 * 
 * v1: No-op implementation - you can later plug real OTEL here.
 * 
 * @example
 * ```ts
 * const span = startSpan('action.execute', { actionId, tenantId });
 * try {
 *   // ... execute logic
 * } finally {
 *   span.end();
 * }
 * ```
 * 
 * Future OTEL integration:
 * ```ts
 * import { trace } from '@opentelemetry/api';
 * const tracer = trace.getTracer('aibos-kernel');
 * const span = tracer.startSpan(name, { attributes: attrs });
 * return {
 *   end: () => span.end(),
 *   setAttribute: (k, v) => span.setAttribute(k, v),
 *   setStatus: (s, m) => span.setStatus({ code: s === 'ok' ? 1 : 2, message: m }),
 * };
 * ```
 */
export function startSpan(name: string, attrs?: Record<string, unknown>): Span {
  // v1: just a no-op; you can later plug real OTEL here
  return {
    end: () => {
      // no-op
    },
    setAttribute: (_key: string, _value: unknown) => {
      // no-op
    },
    setStatus: (_status: "ok" | "error", _message?: string) => {
      // no-op
    },
  };
}

/**
 * Run a function within a span, auto-ending on completion.
 * 
 * @example
 * ```ts
 * const result = await withSpan('db.query', { table: 'users' }, async (span) => {
 *   const data = await db.query('SELECT * FROM users');
 *   span.setAttribute('rowCount', data.length);
 *   return data;
 * });
 * ```
 */
export async function withSpan<T>(
  name: string,
  attrs: Record<string, unknown>,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const span = startSpan(name, attrs);
  try {
    const result = await fn(span);
    span.setStatus("ok");
    return result;
  } catch (err) {
    span.setStatus("error", err instanceof Error ? err.message : String(err));
    throw err;
  } finally {
    span.end();
  }
}

