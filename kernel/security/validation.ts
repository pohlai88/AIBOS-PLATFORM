import { metadataRegistry } from "../registry/metadata.registry";

export function validateInput(engine: string, action: string, input: any) {
  // In v1, only simple validation
  // Later → full metadata matching
  if (typeof input !== "object") {
    throw new Error(`Invalid input for ${engine}.${action}`);
  }
}

export function validateOutput(engine: string, action: string, result: any) {
  // TODO: metadata-driven output validation
}

