/**
 * Zod Middleware for Hono
 * 
 * HTTP request/response validation using Zod schemas
 */

import type { Context, Next } from "hono";
import { ZodSchema } from "zod";

// Store validated data in context variables
const VALID_BODY_KEY = "validatedBody";
const VALID_QUERY_KEY = "validatedQuery";
const VALID_PARAMS_KEY = "validatedParams";

/**
 * Validate JSON body against a Zod schema
 */
export function validateJsonBody<T extends ZodSchema<any>>(schema: T) {
  return async (c: Context, next: Next) => {
    const json = await c.req.json().catch(() => null);

    if (!json) {
      return c.json({ error: "Invalid JSON body" }, 400);
    }

    const result = schema.safeParse(json);
    if (!result.success) {
      return c.json(
        {
          error: "ValidationError",
          details: result.error.flatten(),
        },
        422
      );
    }

    // Store in context variables
    c.set(VALID_BODY_KEY, result.data);

    await next();
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends ZodSchema<any>>(schema: T) {
  return async (c: Context, next: Next) => {
    const query = c.req.query();

    const result = schema.safeParse(query);
    if (!result.success) {
      return c.json(
        {
          error: "ValidationError",
          details: result.error.flatten(),
        },
        422
      );
    }

    c.set(VALID_QUERY_KEY, result.data);

    await next();
  };
}

/**
 * Validate URL params against a Zod schema
 */
export function validateParams<T extends ZodSchema<any>>(schema: T) {
  return async (c: Context, next: Next) => {
    const params = c.req.param();

    const result = schema.safeParse(params);
    if (!result.success) {
      return c.json(
        {
          error: "ValidationError",
          details: result.error.flatten(),
        },
        422
      );
    }

    c.set(VALID_PARAMS_KEY, result.data);

    await next();
  };
}

/**
 * Get validated body from context (type-safe)
 */
export function getValidBody<T>(c: Context): T {
  return c.get(VALID_BODY_KEY) as T;
}

/**
 * Get validated query from context (type-safe)
 */
export function getValidQuery<T>(c: Context): T {
  return c.get(VALID_QUERY_KEY) as T;
}

/**
 * Get validated params from context (type-safe)
 */
export function getValidParams<T>(c: Context): T {
  return c.get(VALID_PARAMS_KEY) as T;
}
