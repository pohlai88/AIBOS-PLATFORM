/**
 * Auth Middleware
 * 
 * Handles API key and JWT authentication
 */

import type { Context, Next } from "hono";
import { getConfig } from "../../boot/kernel.config";
import { apiKeyService } from "../../auth/api-key.service";
import { jwtService } from "../../auth/jwt.service";
import type { AuthContext } from "../../auth/types";
import { createTraceLogger } from "../../observability/logger";
import { authFailuresTotal } from "../../observability/metrics";

const AUTH_KEY_CTX = "authCtx";

/**
 * Auth middleware - validates API key or JWT
 */
export async function authMiddleware(c: Context, next: Next) {
  const traceId = c.get("traceId") as string | undefined;
  const logger = createTraceLogger(traceId);
  const config = getConfig();

  if (!config.authEnable) {
    // Anonymous mode (for local dev or tests)
    const anonCtx: AuthContext = {
      tenantId: null,
      principal: null,
      roles: [],
      scopes: [],
      tokenType: "anonymous",
    };
    c.set(AUTH_KEY_CTX, anonCtx);
    return next();
  }

  const apiKey = c.req.header("x-api-key") ?? null;
  const authHeader = c.req.header("authorization") ?? null;

  let authCtx: AuthContext | null = null;

  // 1) API key first (usually for machine-to-machine calls)
  if (apiKey) {
    authCtx = await apiKeyService.resolveApiKey(apiKey);
    if (!authCtx) {
      logger.warn("[Auth] Invalid API key");
      authFailuresTotal.inc({ reason: "invalid_api_key" });
      return c.json({ error: "Unauthorized", reason: "invalid_api_key" }, 401);
    }
  }

  // 2) If no API key, try JWT Bearer
  if (!authCtx && authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    authCtx = await jwtService.verify(token);
    if (!authCtx) {
      logger.warn("[Auth] Invalid JWT token");
      authFailuresTotal.inc({ reason: "invalid_jwt" });
      return c.json({ error: "Unauthorized", reason: "invalid_jwt" }, 401);
    }
  }

  // 3) If still no auth, block (for now)
  if (!authCtx) {
    logger.warn("[Auth] Missing credentials");
    authFailuresTotal.inc({ reason: "missing_credentials" });
    return c.json({ error: "Unauthorized", reason: "missing_credentials" }, 401);
  }

  // Attach to context
  c.set(AUTH_KEY_CTX, authCtx);

  logger.debug(
    {
      tokenType: authCtx.tokenType,
      tenantId: authCtx.tenantId,
      subject: authCtx.principal?.subject,
      roles: authCtx.roles,
      scopes: authCtx.scopes,
    },
    "[Auth] Authenticated principal"
  );

  await next();
}

/**
 * Optional auth middleware - allows anonymous access
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const traceId = c.get("traceId") as string | undefined;
  const logger = createTraceLogger(traceId);
  const config = getConfig();

  if (!config.authEnable) {
    const anonCtx: AuthContext = {
      tenantId: null,
      principal: null,
      roles: [],
      scopes: [],
      tokenType: "anonymous",
    };
    c.set(AUTH_KEY_CTX, anonCtx);
    return next();
  }

  const apiKey = c.req.header("x-api-key") ?? null;
  const authHeader = c.req.header("authorization") ?? null;

  let authCtx: AuthContext | null = null;

  // Try API key
  if (apiKey) {
    authCtx = await apiKeyService.resolveApiKey(apiKey);
  }

  // Try JWT
  if (!authCtx && authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    authCtx = await jwtService.verify(token);
  }

  // If no auth, use anonymous
  if (!authCtx) {
    authCtx = {
      tenantId: null,
      principal: null,
      roles: [],
      scopes: [],
      tokenType: "anonymous",
    };
  }

  c.set(AUTH_KEY_CTX, authCtx);

  if (authCtx.principal) {
    logger.debug(
      { tokenType: authCtx.tokenType, subject: authCtx.principal.subject },
      "[Auth] Authenticated principal"
    );
  }

  await next();
}

/**
 * Get AuthContext from Hono context
 */
export function getAuthContext(c: Context): AuthContext {
  const ctx = c.get(AUTH_KEY_CTX) as AuthContext | undefined;
  if (!ctx) {
    return {
      tenantId: null,
      principal: null,
      roles: [],
      scopes: [],
      tokenType: "anonymous",
    };
  }
  return ctx;
}

