/**
 * 🎫 Execution Token v1.0
 * 
 * Kernel-signed execution certificates:
 * - Bound to identity chain
 * - Time-limited validity
 * - Scope restrictions
 * 
 * @version 1.0.0
 */

import { KernelSignatureAuthority, type SignedPayload } from "./kernel-signature-authority";
import { type IdentityChain } from "./identity-chain";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ExecutionTokenPayload {
  chainId: string;
  tenantId: string;
  mcpId: string;
  engineId: string;
  manifestFingerprint: string;
  scopes: string[];
  issuedAt: number;
  expiresAt: number;
  nonce: string;
}

export interface ExecutionToken {
  token: SignedPayload;
  payload: ExecutionTokenPayload;
}

export interface TokenValidation {
  valid: boolean;
  expired: boolean;
  signatureValid: boolean;
  errors: string[];
}

// ═══════════════════════════════════════════════════════════
// Execution Token Manager
// ═══════════════════════════════════════════════════════════

export class ExecutionTokenManager {
  private static readonly DEFAULT_TTL_MS = 300000; // 5 minutes
  private static usedNonces = new Set<string>();

  /**
   * Issue a new execution token
   */
  static issue(
    chain: IdentityChain,
    scopes: string[] = ["execute"],
    ttlMs: number = this.DEFAULT_TTL_MS
  ): ExecutionToken {
    const now = Date.now();
    const nonce = crypto.randomUUID();

    const payload: ExecutionTokenPayload = {
      chainId: chain.chainId,
      tenantId: chain.tenantId,
      mcpId: chain.mcpId,
      engineId: chain.engineId,
      manifestFingerprint: chain.manifestFingerprint,
      scopes,
      issuedAt: now,
      expiresAt: now + ttlMs,
      nonce,
    };

    const token = KernelSignatureAuthority.sign(JSON.stringify(payload));

    return { token, payload };
  }

  /**
   * Validate an execution token
   */
  static validate(executionToken: ExecutionToken): TokenValidation {
    const errors: string[] = [];
    const now = Date.now();

    // Check expiration
    const expired = executionToken.payload.expiresAt < now;
    if (expired) {
      errors.push("Token has expired");
    }

    // Check nonce (replay protection)
    if (this.usedNonces.has(executionToken.payload.nonce)) {
      errors.push("Token nonce already used (replay attack detected)");
    }

    // Verify signature
    const signatureValid = KernelSignatureAuthority.verify(executionToken.token);
    if (!signatureValid) {
      errors.push("Invalid token signature");
    }

    // Verify payload matches signed content
    const payloadString = JSON.stringify(executionToken.payload);
    if (payloadString !== executionToken.token.payload) {
      errors.push("Token payload mismatch");
    }

    // Mark nonce as used if valid
    if (errors.length === 0) {
      this.usedNonces.add(executionToken.payload.nonce);
    }

    return {
      valid: errors.length === 0,
      expired,
      signatureValid,
      errors,
    };
  }

  /**
   * Check if token has specific scope
   */
  static hasScope(token: ExecutionToken, scope: string): boolean {
    return token.payload.scopes.includes(scope) || token.payload.scopes.includes("*");
  }

  /**
   * Verify token matches expected identity
   */
  static verifyIdentity(
    token: ExecutionToken,
    expectedTenantId: string,
    expectedMcpId?: string
  ): boolean {
    if (token.payload.tenantId !== expectedTenantId) {
      return false;
    }
    if (expectedMcpId && token.payload.mcpId !== expectedMcpId) {
      return false;
    }
    return true;
  }

  /**
   * Clean up old nonces
   */
  static cleanupNonces(maxSize: number = 10000): void {
    if (this.usedNonces.size > maxSize) {
      // Keep only the most recent half
      const arr = Array.from(this.usedNonces);
      this.usedNonces = new Set(arr.slice(arr.length / 2));
    }
  }

  /**
   * Revoke a token by nonce
   */
  static revoke(nonce: string): void {
    this.usedNonces.add(nonce);
  }
}

export const executionTokenManager = ExecutionTokenManager;

