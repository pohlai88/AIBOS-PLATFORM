/**
 * Action Schema Runtime
 * 
 * Translates serialized schema definitions into real Zod schemas at runtime
 */

import { z, ZodTypeAny } from "zod";
import { SerializedSchema } from "./schemas/action-contract.schema";

/**
 * Convert a SerializedSchema into a real Zod schema
 */
export function zodFromSerializedSchema(def: SerializedSchema): ZodTypeAny {
  const { type, definition } = def;

  switch (type) {
    case "string": {
      let schema = z.string();
      if (definition.min) schema = schema.min(definition.min);
      if (definition.max) schema = schema.max(definition.max);
      if (definition.email) schema = schema.email();
      if (definition.url) schema = schema.url();
      if (definition.uuid) schema = schema.uuid();
      if (definition.regex) schema = schema.regex(new RegExp(definition.regex));
      if (definition.optional) return schema.optional();
      return schema;
    }

    case "number": {
      let schema = z.number();
      if (definition.min !== undefined) schema = schema.min(definition.min);
      if (definition.max !== undefined) schema = schema.max(definition.max);
      if (definition.int) schema = schema.int();
      if (definition.positive) schema = schema.positive();
      if (definition.negative) schema = schema.negative();
      if (definition.optional) return schema.optional();
      return schema;
    }

    case "boolean": {
      const schema = z.boolean();
      if (definition.optional) return schema.optional();
      return schema;
    }

    case "array": {
      const itemSchema = definition.items
        ? zodFromSerializedSchema(definition.items as SerializedSchema)
        : z.unknown();
      let schema = z.array(itemSchema);
      if (definition.min) schema = schema.min(definition.min);
      if (definition.max) schema = schema.max(definition.max);
      if (definition.optional) return schema.optional();
      return schema;
    }

    case "object": {
      if (definition.shape && typeof definition.shape === "object") {
        const shape: Record<string, ZodTypeAny> = {};
        for (const [key, field] of Object.entries(definition.shape)) {
          shape[key] = zodFromSerializedSchema(field as SerializedSchema);
        }
        const schema = z.object(shape);
        if (definition.strict) {
          const strictSchema = schema.strict();
          if (definition.optional) return strictSchema.optional();
          return strictSchema;
        }
        if (definition.optional) return schema.optional();
        return schema;
      }
      return z.record(z.any());
    }

    case "enum": {
      if (Array.isArray(definition.values) && definition.values.length > 0) {
        const [first, ...rest] = definition.values as [string, ...string[]];
        const schema = z.enum([first, ...rest]);
        if (definition.optional) return schema.optional();
        return schema;
      }
      return z.string();
    }

    case "literal": {
      return z.literal(definition.value);
    }

    case "date": {
      const schema = z.date();
      if (definition.optional) return schema.optional();
      return schema;
    }

    case "null":
      return z.null();

    case "undefined":
      return z.undefined();

    case "any":
      return z.any();

    case "unknown":
      return z.unknown();

    case "union": {
      if (Array.isArray(definition.options) && definition.options.length >= 2) {
        const schemas = definition.options.map((opt: SerializedSchema) =>
          zodFromSerializedSchema(opt)
        );
        return z.union(schemas as [ZodTypeAny, ZodTypeAny, ...ZodTypeAny[]]);
      }
      return z.unknown();
    }

    case "optional": {
      if (definition.inner) {
        return zodFromSerializedSchema(definition.inner as SerializedSchema).optional();
      }
      return z.unknown().optional();
    }

    case "nullable": {
      if (definition.inner) {
        return zodFromSerializedSchema(definition.inner as SerializedSchema).nullable();
      }
      return z.unknown().nullable();
    }

    default:
      // Fallback: unknown JSON
      return z.unknown();
  }
}

/**
 * Validate input against an action contract's input schema
 */
export function validateActionInput(
  inputSchema: SerializedSchema,
  rawInput: unknown
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schema = zodFromSerializedSchema(inputSchema);
  const result = schema.safeParse(rawInput);
  return result;
}

/**
 * Validate output against an action contract's output schema
 */
export function validateActionOutput(
  outputSchema: SerializedSchema,
  rawOutput: unknown
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schema = zodFromSerializedSchema(outputSchema);
  const result = schema.safeParse(rawOutput);
  return result;
}

