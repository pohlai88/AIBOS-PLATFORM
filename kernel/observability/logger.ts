/**
 * Core Logger
 * 
 * Pino-based structured logging with trace ID support
 */

import pino, { Logger as PinoLogger } from "pino";

type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace";

export interface Logger extends PinoLogger {
  // optional typed extensions later
}

const LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || "info";
const NODE_ENV = process.env.NODE_ENV || "development";
const SERVICE_NAME = process.env.KERNEL_SERVICE_NAME || "aibos-kernel";

// Base logger (no traceId yet)
export const baseLogger: Logger = pino({
  name: SERVICE_NAME,
  level: LOG_LEVEL,
  transport:
    NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

/**
 * Create a child logger with a traceId attached.
 * Use this per request / per action.
 */
export function createTraceLogger(traceId?: string | null): Logger {
  if (!traceId) return baseLogger;
  return baseLogger.child({ traceId });
}

/**
 * Create a child logger with custom context
 */
export function createContextLogger(context: Record<string, unknown>): Logger {
  return baseLogger.child(context);
}

