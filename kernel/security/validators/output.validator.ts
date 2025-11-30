export function validateActionOutput(schema: any, output: any) {
  if (!schema) return;

  if (typeof output !== schema.type) {
    throw new Error(
      `Invalid output type. Expected ${schema.type}, got ${typeof output}`
    );
  }
}

