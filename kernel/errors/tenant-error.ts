import { KernelError } from "./kernel-error";

export class TenantError extends KernelError {
  constructor(message: string, cause?: unknown) {
    super(message, "TENANT_ERROR", cause);
  }
}

