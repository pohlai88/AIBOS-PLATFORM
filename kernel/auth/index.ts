/**
 * 🔐 AI-BOS Auth Module v2.0
 * 
 * Authentication & Authorization:
 * - JWT & API Key services
 * - Kernel Signature Authority (KSA)
 * - Identity Chain management
 * - Execution tokens
 * - MCP verification
 * - Provenance trail
 * 
 * @module @aibos/kernel/auth
 * @version 2.0.0
 */

// ═══════════════════════════════════════════════════════════
// Core Auth
// ═══════════════════════════════════════════════════════════

export * from "./types";
export { jwtService } from "./jwt.service";
export { apiKeyService } from "./api-key.service";

// ═══════════════════════════════════════════════════════════
// Hardening v4-D — MCP-Aware Kernel Authentication
// ═══════════════════════════════════════════════════════════

// Kernel Signature Authority
export { KernelSignatureAuthority, kernelSignatureAuthority } from "./kernel-signature-authority";
export type { KSAKeyPair, SignedPayload } from "./kernel-signature-authority";

// Manifest Fingerprint
export { ManifestFingerprint, manifestFingerprint } from "./manifest-fingerprint";
export type { FingerprintResult, ManifestValidation } from "./manifest-fingerprint";

// Identity Chain
export { IdentityChainManager, identityChainManager } from "./identity-chain";
export type { IdentityChain, ChainValidation } from "./identity-chain";

// Execution Token
export { ExecutionTokenManager, executionTokenManager } from "./execution-token";
export type { ExecutionTokenPayload, ExecutionToken, TokenValidation } from "./execution-token";

// MCP Verifier
export { MCPVerifier, mcpVerifier } from "./mcp-verifier";
export type { MCPVerificationRequest, MCPVerificationResult } from "./mcp-verifier";

// Provenance Trail
export { ProvenanceTrail, provenanceTrail } from "./provenance-trail";
export type { ProvenanceEntry, ProvenanceQuery } from "./provenance-trail";

