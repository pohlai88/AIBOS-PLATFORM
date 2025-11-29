import { KernelError } from "./kernel-error";

export class RegistryError extends KernelError {
  constructor(message: string, cause?: unknown) {
    super(message, "REGISTRY_ERROR", cause);
  }
}

