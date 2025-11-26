/**
 * Auth Types
 * 
 * Core authentication and authorization types
 */

export type PrincipalType = "user" | "service" | "engine";

export type TokenType = "api-key" | "jwt" | "anonymous";

export interface AuthPrincipal {
  type: PrincipalType;
  id: string;        // raw ID, e.g. "123" or "github:abc"
  subject: string;   // canonical, e.g. "user:123"
}

export interface AuthContext {
  tenantId: string | null;
  principal: AuthPrincipal | null;
  roles: string[];
  scopes: string[];
  tokenType: TokenType;
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

