/**
 * Auth Types
 *
 * Core authentication and authorization types
 */

export type PrincipalType = "user" | "service" | "engine";

export type TokenType = "api-key" | "jwt" | "anonymous";

export type AuthMethod = "api_key" | "jwt" | "internal" | "anonymous";

export interface AuthPrincipal {
  type: PrincipalType;
  id: string; // raw ID, e.g. "123" or "github:abc"
  subject: string; // canonical, e.g. "user:123"
}

/**
 * Principal - unified identity for RBAC/ABAC
 *
 * This is the shape used by the security/policy layer.
 */
export interface Principal {
  id: string; // user or service id
  tenantId: string | null; // multi-tenant isolation
  displayName?: string; // human label or email (for diag only)
  roles: string[]; // coarse-grained RBAC
  scopes: string[]; // fine-grained perms: "perm:data.read_financial"
  authMethod: AuthMethod; // how was this principal authenticated?
  attributes?: Record<string, string | number | boolean>; // ABAC / region / dept
}

export interface AuthContext {
  tenantId: string | null;
  principal: AuthPrincipal | null;
  roles: string[];
  scopes: string[];
  tokenType: TokenType;
}

/**
 * Convert AuthContext to Principal for policy evaluation
 */
export function toPrincipal(ctx: AuthContext): Principal {
  return {
    id: ctx.principal?.id ?? "anonymous",
    tenantId: ctx.tenantId,
    roles: ctx.roles,
    scopes: ctx.scopes,
    authMethod: ctx.tokenType === "api-key" ? "api_key" : ctx.tokenType === "jwt" ? "jwt" : "anonymous",
  };
}

/**
 * Create an anonymous auth context
 */
export function createAnonymousContext(tenantId?: string | null): AuthContext {
  return {
    tenantId: tenantId ?? null,
    principal: null,
    roles: [],
    scopes: [],
    tokenType: "anonymous",
  };
}

/**
 * Create an auth context from principal
 */
export function createAuthContext(
  principal: AuthPrincipal,
  tenantId: string | null,
  roles: string[],
  scopes: string[],
  tokenType: TokenType
): AuthContext {
  return {
    tenantId,
    principal,
    roles,
    scopes,
    tokenType,
  };
}

