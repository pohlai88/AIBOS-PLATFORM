export function validateMetadata(schema: any) {
  const errors: string[] = [];

  if (!schema.model) errors.push("Missing 'model'");
  if (!schema.fields) errors.push("Missing 'fields'");

  if (schema.fields) {
    for (const [fieldName, field] of Object.entries<any>(schema.fields)) {
      if (!field.type) {
        errors.push(`Field '${fieldName}' missing 'type'`);
      }

      // Validate enum
      if (field.type === "enum" && !field.values) {
        errors.push(`Field '${fieldName}' missing 'values' for enum type`);
      }

      // Validate references
      if (field.type === "reference" && !field.ref) {
        errors.push(`Field '${fieldName}' missing 'ref' for reference type`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}
