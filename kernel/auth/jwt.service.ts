/**
 * JWT Service
 * 
 * Verifies JWTs and converts to AuthContext
 */

import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { getConfig } from "../boot/kernel.config";
import type { AuthContext, AuthPrincipal } from "./types";

export class JwtService {
  private getSecretKey(): Uint8Array {
    const config = getConfig();
    return new TextEncoder().encode(config.authJwtSecret);
  }

  /**
   * Verify a JWT and return AuthContext
   */
  async verify(token: string): Promise<AuthContext | null> {
    const config = getConfig();

    try {
      const { payload } = await jwtVerify(token, this.getSecretKey(), {
        issuer: config.authJwtIssuer,
        audience: config.authJwtAudience,
      });

      return this.payloadToAuthContext(payload);
    } catch {
      return null;
    }
  }

  /**
   * Sign a JWT (for testing/internal use)
   */
  async sign(params: {
    subjectId: string;
    tenantId?: string | null;
    roles?: string[];
    scopes?: string[];
    expiresIn?: string;
  }): Promise<string> {
    const config = getConfig();

    const jwt = new SignJWT({
      tenantId: params.tenantId ?? null,
      roles: params.roles ?? [],
      scopes: params.scopes ?? [],
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(params.subjectId)
      .setIssuedAt()
      .setIssuer(config.authJwtIssuer)
      .setAudience(config.authJwtAudience);

    if (params.expiresIn) {
      jwt.setExpirationTime(params.expiresIn);
    }

    return jwt.sign(this.getSecretKey());
  }

  private payloadToAuthContext(payload: JWTPayload): AuthContext {
    const tenantId = (payload["tenantId"] as string | undefined) ?? null;
    const subjectId = (payload.sub as string | undefined) ?? null;
    const roles = ((payload["roles"] as string[] | undefined) ?? []).map(String);
    const scopes = ((payload["scopes"] as string[] | undefined) ?? []).map(String);

    const principal: AuthPrincipal | null = subjectId
      ? {
          type: subjectId.startsWith("service:")
            ? "service"
            : subjectId.startsWith("engine:")
              ? "engine"
              : "user",
          id: subjectId.split(":")[1] ?? subjectId,
          subject: subjectId,
        }
      : null;

    return {
      tenantId,
      principal,
      roles,
      scopes,
      tokenType: "jwt",
    };
  }
}

// Singleton instance
export const jwtService = new JwtService();

