/**
 * Kernel SDK Errors
 */

export class KernelError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public traceId?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "KernelError";
    Object.setPrototypeOf(this, KernelError.prototype);
  }

  static fromResponse(response: any): KernelError {
    return new KernelError(
      response.message || "Unknown error",
      response.code || response.error || "UNKNOWN_ERROR",
      response.statusCode || 500,
      response.traceId,
      response.details
    );
  }
}

export class NetworkError extends KernelError {
  constructor(message: string, cause?: Error) {
    super(message, "NETWORK_ERROR", 0);
    this.name = "NetworkError";
    this.cause = cause;
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class TimeoutError extends KernelError {
  constructor(message: string = "Request timeout") {
    super(message, "TIMEOUT", 408);
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

export class ValidationError extends KernelError {
  constructor(message: string, details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, undefined, details);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

