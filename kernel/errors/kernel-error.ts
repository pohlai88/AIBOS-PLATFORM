export class KernelError extends Error {
  public code: string;
  public cause?: unknown;
  public timestamp: number;

  constructor(message: string, code = "KERNEL_ERROR", cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
    this.timestamp = Date.now();
  }
}

