export function validateActionInput(schema: any, input: any) {
  if (!schema) return;

  // basic structural validation
  for (const key of Object.keys(schema)) {
    if (schema[key].required && input[key] === undefined) {
      throw new Error(`Missing required input field: ${key}`);
    }
  }

  // TODO: Upgrade to Zod / Typebox on Hardening v2
}

