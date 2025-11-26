import { ContractResult } from "../contract.types";

export function validateModelContract(metadata: any): ContractResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [modelName, model] of Object.entries<any>(metadata || {})) {
    if (!model.fields) {
      errors.push(`${modelName}: missing fields`);
      continue;
    }

    for (const [field, def] of Object.entries<any>(model.fields || {})) {
      if (!def.type) {
        errors.push(`${modelName}.${field}: missing type`);
      }

      if (def.type === "enum" && !def.values) {
        errors.push(`${modelName}.${field}: enum missing values`);
      }

      if (def.type === "reference" && !def.ref) {
        errors.push(`${modelName}.${field}: reference missing ref`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

