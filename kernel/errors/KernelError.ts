// kernel/errors/KernelError.ts

/**
 * Base error class for all kernel errors.
 * Provides structured error handling with error codes and metadata.
 */
export class KernelError extends Error {
  public readonly code: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    code: string,
    options?: {
      message?: string;
      metadata?: Record<string, unknown>;
      cause?: Error;
    },
  ) {
    const message = options?.message || `Kernel error: ${code}`;
    super(message, { cause: options?.cause });

    this.name = "KernelError";
    this.code = code;
    this.metadata = options?.metadata;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KernelError);
    }
  }
}

