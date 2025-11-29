/**
 * 🔍 MCP Verifier v1.0
 * 
 * Comprehensive MCP request verification:
 * - Manifest fingerprint validation
 * - Identity chain verification
 * - Execution token validation
 * - Tenant binding enforcement
 * 
 * @version 1.0.0
 */

import { ManifestFingerprint } from "./manifest-fingerprint";
import { IdentityChainManager, type IdentityChain } from "./identity-chain";
import { ExecutionTokenManager, type ExecutionToken } from "./execution-token";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface MCPVerificationRequest {
  manifest: any;
  expectedFingerprint: string;
  chain: IdentityChain;
  token: ExecutionToken;
  expectedTenant: string;
  requiredScopes?: string[];
}

export interface MCPVerificationResult {
  verified: boolean;
  checks: {
    manifestFingerprint: boolean;
    identityChain: boolean;
    tenantBinding: boolean;
    executionToken: boolean;
    scopes: boolean;
  };
  errors: string[];
}

// ═══════════════════════════════════════════════════════════
// MCP Verifier
// ═══════════════════════════════════════════════════════════

export class MCPVerifier {
  /**
   * Full verification of MCP request
   */
  static verify(request: MCPVerificationRequest): MCPVerificationResult {
    const errors: string[] = [];
    const checks = {
      manifestFingerprint: false,
      identityChain: false,
      tenantBinding: false,
      executionToken: false,
      scopes: false,
    };

    // 1. Manifest fingerprint validation
    const fingerprintValid = ManifestFingerprint.validate(
      request.manifest,
      request.expectedFingerprint
    );
    checks.manifestFingerprint = fingerprintValid.valid;
    if (!fingerprintValid.valid) {
      errors.push(
        `Manifest fingerprint mismatch: expected ${request.expectedFingerprint}, got ${fingerprintValid.actualHash}`
      );
    }

    // 2. Identity chain validation
    const chainValidation = IdentityChainManager.validate(request.chain);
    checks.identityChain = chainValidation.valid;
    if (!chainValidation.valid) {
      errors.push(...chainValidation.errors.map(e => `Identity chain: ${e}`));
    }

    // 3. Tenant binding verification
    checks.tenantBinding = request.chain.tenantId === request.expectedTenant;
    if (!checks.tenantBinding) {
      errors.push(
        `Tenant mismatch: expected ${request.expectedTenant}, got ${request.chain.tenantId}`
      );
    }

    // 4. Execution token validation
    const tokenValidation = ExecutionTokenManager.validate(request.token);
    checks.executionToken = tokenValidation.valid;
    if (!tokenValidation.valid) {
      errors.push(...tokenValidation.errors.map(e => `Execution token: ${e}`));
    }

    // 5. Scope verification
    const requiredScopes = request.requiredScopes || ["execute"];
    checks.scopes = requiredScopes.every(scope =>
      ExecutionTokenManager.hasScope(request.token, scope)
    );
    if (!checks.scopes) {
      errors.push(`Missing required scopes: ${requiredScopes.join(", ")}`);
    }

    const verified = Object.values(checks).every(v => v);

    // Emit event
    eventBus.publish({
      type: verified ? "mcp.verification.success" : "mcp.verification.failed",
      tenantId: request.chain.tenantId,
      mcpId: request.chain.mcpId,
      checks,
      errors,
      timestamp: new Date().toISOString(),
    } as any);

    return { verified, checks, errors };
  }

  /**
   * Verify and throw on failure
   */
  static verifyOrThrow(request: MCPVerificationRequest): void {
    const result = this.verify(request);
    if (!result.verified) {
      throw new Error(`MCP verification failed: ${result.errors.join("; ")}`);
    }
  }

  /**
   * Quick manifest-only verification
   */
  static verifyManifest(manifest: any, expectedFingerprint: string): boolean {
    return ManifestFingerprint.validate(manifest, expectedFingerprint).valid;
  }

  /**
   * Quick token-only verification
   */
  static verifyToken(token: ExecutionToken): boolean {
    return ExecutionTokenManager.validate(token).valid;
  }
}

export const mcpVerifier = MCPVerifier;

