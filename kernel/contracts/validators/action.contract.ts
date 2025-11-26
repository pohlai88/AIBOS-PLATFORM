import { ContractResult } from "../contract.types";

export function validateActionContract(actions: any): ContractResult {
  const errors: string[] = [];

  for (const [name, fn] of Object.entries(actions || {})) {
    if (typeof fn !== "function") {
      errors.push(`Action '${name}' must be a function`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: []
  };
}

