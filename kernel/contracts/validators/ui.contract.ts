import { ContractResult } from "../contract.types";

export function validateUIContract(ui: any): ContractResult {
  if (!ui) return { ok: true, errors: [], warnings: [] };

  const errors: string[] = [];

  for (const [model, schema] of Object.entries<any>(ui)) {
    if (schema.form && !schema.form.fields) {
      errors.push(`${model}: form missing fields`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: []
  };
}

