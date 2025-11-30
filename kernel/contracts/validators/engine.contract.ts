import { ContractResult } from "../contract.types";

export function validateEngineContract(engine: any): ContractResult {
  const errors: string[] = [];

  if (!engine.manifest?.name) errors.push("Engine missing name");
  if (!engine.manifest?.version) errors.push("Engine missing version");
  if (!engine.metadata) errors.push("Engine missing metadata");

  return {
    ok: errors.length === 0,
    errors,
    warnings: []
  };
}

