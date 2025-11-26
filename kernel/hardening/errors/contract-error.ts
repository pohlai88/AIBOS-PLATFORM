import { KernelError } from "./kernel-error";

export class ContractError extends KernelError {
  constructor(message: string, cause?: unknown) {
    super(message, "CONTRACT_ERROR", cause);
  }
}

