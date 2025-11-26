import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a config object against its JSON schema.
 * Returns validation result with any errors found.
 */
export function validateSchema(
  schemaPath: string,
  config: Record<string, unknown>
): SchemaValidationResult {
  const errors: string[] = [];

  try {
    const schemaContent = readFileSync(
      join(__dirname, "..", "schemas", schemaPath),
      "utf-8"
    );
    const schema = JSON.parse(schemaContent);

    // Basic validation - check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in config)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Type validation for properties
    if (schema.properties) {
      for (const [key, value] of Object.entries(config)) {
        const propSchema = schema.properties[key];
        if (propSchema) {
          const typeError = validateType(key, value, propSchema as Record<string, unknown>);
          if (typeError) errors.push(typeError);
        }
      }
    }
  } catch (err) {
    errors.push(`Schema validation error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateType(
  key: string,
  value: unknown,
  schema: Record<string, unknown>
): string | null {
  const expectedType = schema.type as string;

  if (expectedType === "number" && typeof value !== "number") {
    return `${key}: expected number, got ${typeof value}`;
  }

  if (expectedType === "string" && typeof value !== "string") {
    return `${key}: expected string, got ${typeof value}`;
  }

  if (expectedType === "array" && !Array.isArray(value)) {
    return `${key}: expected array, got ${typeof value}`;
  }

  if (expectedType === "object" && (typeof value !== "object" || value === null)) {
    return `${key}: expected object, got ${typeof value}`;
  }

  // Range validation for numbers
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < (schema.minimum as number)) {
      return `${key}: ${value} is below minimum ${schema.minimum}`;
    }
    if (schema.maximum !== undefined && value > (schema.maximum as number)) {
      return `${key}: ${value} exceeds maximum ${schema.maximum}`;
    }
  }

  // Array minItems validation
  if (Array.isArray(value) && schema.minItems !== undefined) {
    if (value.length < (schema.minItems as number)) {
      return `${key}: array has ${value.length} items, minimum is ${schema.minItems}`;
    }
  }

  return null;
}

/**
 * Validate all rule configs for a theme against their schemas.
 * Throws if any validation fails.
 */
export function validateThemeSchemas(theme: string): void {
  const configs = [
    { schema: "typography.schema.json", config: `${theme}/rules.typography.json` },
    { schema: "spacing.schema.json", config: `${theme}/rules.spacing.json` },
    { schema: "layout.schema.json", config: `${theme}/rules.layout.json` },
    { schema: "geometry.schema.json", config: `${theme}/rules.geometry.json` },
    { schema: "visual.schema.json", config: `${theme}/rules.visual.json` },
  ];

  for (const { schema, config } of configs) {
    try {
      const configPath = join(__dirname, config);
      const configContent = JSON.parse(readFileSync(configPath, "utf-8"));
      const result = validateSchema(schema, configContent);

      if (!result.valid) {
        throw new Error(
          `Schema validation failed for ${config}:\n${result.errors.join("\n")}`
        );
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("Schema validation failed")) {
        throw err;
      }
      // Config file might not exist, which is okay - will fall back to default
    }
  }
}

