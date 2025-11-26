/**
 * withTimeout - wraps any async operation with a timeout guarantee.
 *
 * If the operation does not complete within `ms`, a TimeoutError is thrown.
 */

import { KernelError } from "../errors/kernel-error";

export class TimeoutError extends KernelError {
  constructor(message: string) {
    super(message, "TIMEOUT_ERROR");
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = "operation"
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new TimeoutError(
          `${label} timed out after ${ms}ms`
        )
      );
    }, ms);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result as T;
  } catch (err) {
    clearTimeout(timeoutHandle!);
    throw err;
  }
}

