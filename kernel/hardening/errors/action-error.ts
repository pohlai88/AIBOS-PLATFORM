import { KernelError } from "./kernel-error";

export class ActionError extends KernelError {
  constructor(message: string, cause?: unknown) {
    super(message, "ACTION_ERROR", cause);
  }
}

