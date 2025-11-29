import { KernelError } from "./kernel-error";

export class MetadataError extends KernelError {
  constructor(message: string, cause?: unknown) {
    super(message, "METADATA_ERROR", cause);
  }
}

