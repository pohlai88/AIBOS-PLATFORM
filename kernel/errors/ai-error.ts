import { KernelError } from "./kernel-error";

export class AIError extends KernelError {
  constructor(message: string, cause?: unknown) {
    super(message, "AI_ERROR", cause);
  }
}

