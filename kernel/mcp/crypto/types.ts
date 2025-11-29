/**
 * MCP Cryptographic Types
 * 
 * GRCD Compliance: F-11 (MCP Manifest Signatures)
 * Standard: ISO 42001, AI Governance
 * 
 * Provides cryptographic signing and verification for MCP manifests
 * to ensure integrity, authenticity, and non-repudiation.
 */

export interface ManifestSignature {
  /** Base64-encoded cryptographic signature */
  signature: string;
  
  /** Signature algorithm (default: RS256) */
  algorithm: string;
  
  /** Public key identifier for signature verification */
  publicKeyId: string;
  
  /** Unix timestamp (milliseconds) when signature was created */
  timestamp: number;
  
  /** Hash of the manifest content (SHA-256) */
  manifestHash: string;
  
  /** Signature metadata */
  metadata: {
    /** Signer identity (email, service account, etc.) */
    signedBy: string;
    
    /** Signing environment (production, staging, dev) */
    environment: string;
    
    /** Optional: Signature purpose */
    purpose?: string;
  };
}

export interface KeyPair {
  /** PEM-encoded public key */
  publicKey: string;
  
  /** PEM-encoded private key (NEVER log or expose this!) */
  privateKey: string;
  
  /** Key identifier */
  keyId: string;
  
  /** Key algorithm (RS256, ES256, etc.) */
  algorithm: string;
  
  /** Key creation timestamp */
  createdAt: number;
  
  /** Key expiration timestamp (optional) */
  expiresAt?: number;
}

export interface PublicKeyRecord {
  /** Unique key identifier */
  keyId: string;
  
  /** PEM-encoded public key */
  publicKey: string;
  
  /** Key algorithm */
  algorithm: string;
  
  /** Key owner/issuer */
  owner: string;
  
  /** Key status */
  status: "active" | "rotated" | "revoked";
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Expiration timestamp (optional) */
  expiresAt?: number;
  
  /** Rotation/revocation timestamp */
  inactivatedAt?: number;
}

export interface SignatureVerificationResult {
  /** Whether signature is valid */
  valid: boolean;
  
  /** Public key ID used for verification */
  publicKeyId: string;
  
  /** Signer identity */
  signedBy: string;
  
  /** Signature timestamp */
  signedAt: number;
  
  /** Verification timestamp */
  verifiedAt: number;
  
  /** Verification errors (if any) */
  errors: string[];
  
  /** Warnings (e.g., key about to expire) */
  warnings: string[];
}

export interface KeyRotationPolicy {
  /** Maximum key age (milliseconds) before rotation required */
  maxKeyAge: number;
  
  /** Warning threshold before expiration (milliseconds) */
  warningThreshold: number;
  
  /** Auto-rotate keys? */
  autoRotate: boolean;
  
  /** Grace period for old key after rotation (milliseconds) */
  gracePeriod: number;
}

export const DEFAULT_KEY_ROTATION_POLICY: KeyRotationPolicy = {
  maxKeyAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  warningThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days
  autoRotate: false, // Manual rotation for security
  gracePeriod: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Supported signature algorithms
 */
export enum SignatureAlgorithm {
  /** RSA with SHA-256 (recommended) */
  RS256 = "RS256",
  
  /** ECDSA with SHA-256 */
  ES256 = "ES256",
  
  /** HMAC with SHA-256 (symmetric, use for testing only) */
  HS256 = "HS256",
}

/**
 * Key storage backends
 */
export enum KeyStorageBackend {
  /** In-memory (for testing only) */
  MEMORY = "memory",
  
  /** File system */
  FILESYSTEM = "filesystem",
  
  /** Environment variables */
  ENVIRONMENT = "environment",
  
  /** External KMS (AWS KMS, Azure Key Vault, etc.) */
  KMS = "kms",
}

