/**
 * MCP Manifest Signer
 * 
 * GRCD Compliance: F-11 (MCP Manifest Signatures)
 * Standard: ISO 42001, AI Governance
 * 
 * Provides cryptographic signing and verification for MCP manifests.
 */

import crypto from "crypto";
import { MCPManifest } from "../types";
import {
  ManifestSignature,
  SignatureVerificationResult,
  SignatureAlgorithm,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("mcp-manifest-signer");

export class ManifestSigner {
  /**
   * Generate a cryptographic hash of an MCP manifest
   * 
   * @param manifest - The MCP manifest to hash
   * @returns SHA-256 hash (hex-encoded)
   */
  getManifestHash(manifest: MCPManifest): string {
    // Create canonical JSON representation (sorted keys, no whitespace)
    const canonicalJson = JSON.stringify(manifest, Object.keys(manifest).sort());
    
    // Generate SHA-256 hash
    const hash = crypto.createHash("sha256").update(canonicalJson).digest("hex");
    
    logger.debug(`Generated manifest hash`, { 
      manifestId: manifest.id,
      manifestName: manifest.name,
      hash 
    });
    
    return hash;
  }

  /**
   * Sign an MCP manifest with a private key
   * 
   * @param manifest - The MCP manifest to sign
   * @param privateKey - PEM-encoded RSA private key
   * @param publicKeyId - Public key identifier for verification
   * @param signedBy - Signer identity (email, service account, etc.)
   * @param environment - Signing environment (production, staging, dev)
   * @returns Manifest signature
   */
  async signManifest(
    manifest: MCPManifest,
    privateKey: string,
    publicKeyId: string,
    signedBy: string,
    environment: string = "production"
  ): Promise<ManifestSignature> {
    const startTime = Date.now();
    
    try {
      // Generate manifest hash
      const manifestHash = this.getManifestHash(manifest);
      
      // Sign the hash with RSA-SHA256
      const sign = crypto.createSign("RSA-SHA256");
      sign.update(manifestHash);
      sign.end();
      
      const signature = sign.sign(privateKey, "base64");
      
      const manifestSignature: ManifestSignature = {
        signature,
        algorithm: SignatureAlgorithm.RS256,
        publicKeyId,
        timestamp: Date.now(),
        manifestHash,
        metadata: {
          signedBy,
          environment,
        },
      };
      
      const duration = Date.now() - startTime;
      logger.info(`Signed MCP manifest`, {
        manifestId: manifest.id,
        manifestName: manifest.name,
        publicKeyId,
        signedBy,
        environment,
        durationMs: duration,
      });
      
      return manifestSignature;
    } catch (error) {
      logger.error(`Failed to sign manifest`, {
        manifestId: manifest.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Manifest signing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Verify a manifest signature
   * 
   * @param manifest - The MCP manifest to verify
   * @param signature - The manifest signature
   * @param publicKey - PEM-encoded RSA public key
   * @returns Verification result
   */
  async verifyManifest(
    manifest: MCPManifest,
    signature: ManifestSignature,
    publicKey: string
  ): Promise<SignatureVerificationResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // 1. Check algorithm
      if (signature.algorithm !== SignatureAlgorithm.RS256) {
        errors.push(`Unsupported algorithm: ${signature.algorithm}. Only RS256 is supported.`);
      }
      
      // 2. Check manifest hash matches
      const currentHash = this.getManifestHash(manifest);
      if (currentHash !== signature.manifestHash) {
        errors.push(`Manifest hash mismatch. Expected: ${signature.manifestHash}, got: ${currentHash}`);
      }
      
      // 3. Check signature age (warn if >90 days old)
      const signatureAge = Date.now() - signature.timestamp;
      const MAX_SIGNATURE_AGE = 90 * 24 * 60 * 60 * 1000; // 90 days
      if (signatureAge > MAX_SIGNATURE_AGE) {
        warnings.push(`Signature is ${Math.floor(signatureAge / (24 * 60 * 60 * 1000))} days old. Consider re-signing.`);
      }
      
      // 4. Verify cryptographic signature
      let signatureValid = false;
      if (errors.length === 0) {
        const verify = crypto.createVerify("RSA-SHA256");
        verify.update(signature.manifestHash);
        verify.end();
        
        signatureValid = verify.verify(publicKey, signature.signature, "base64");
        
        if (!signatureValid) {
          errors.push("Cryptographic signature verification failed. Signature is invalid or tampered.");
        }
      }
      
      const result: SignatureVerificationResult = {
        valid: errors.length === 0 && signatureValid,
        publicKeyId: signature.publicKeyId,
        signedBy: signature.metadata.signedBy,
        signedAt: signature.timestamp,
        verifiedAt: Date.now(),
        errors,
        warnings,
      };
      
      const duration = Date.now() - startTime;
      
      if (result.valid) {
        logger.info(`Manifest signature verified successfully`, {
          manifestId: manifest.id,
          manifestName: manifest.name,
          publicKeyId: signature.publicKeyId,
          signedBy: signature.metadata.signedBy,
          durationMs: duration,
          warnings: warnings.length > 0 ? warnings : undefined,
        });
      } else {
        logger.warn(`Manifest signature verification failed`, {
          manifestId: manifest.id,
          manifestName: manifest.name,
          publicKeyId: signature.publicKeyId,
          errors,
          durationMs: duration,
        });
      }
      
      return result;
    } catch (error) {
      logger.error(`Signature verification error`, {
        manifestId: manifest.id,
        error: error instanceof Error ? error.message : String(error),
      });
      
      return {
        valid: false,
        publicKeyId: signature.publicKeyId,
        signedBy: signature.metadata.signedBy,
        signedAt: signature.timestamp,
        verifiedAt: Date.now(),
        errors: [
          `Signature verification error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        warnings: [],
      };
    }
  }

  /**
   * Sign manifest and attach signature to manifest object
   * 
   * @param manifest - The MCP manifest to sign
   * @param privateKey - PEM-encoded RSA private key
   * @param publicKeyId - Public key identifier
   * @param signedBy - Signer identity
   * @returns Manifest with embedded signature
   */
  async signAndAttach(
    manifest: MCPManifest,
    privateKey: string,
    publicKeyId: string,
    signedBy: string
  ): Promise<MCPManifest & { signature: ManifestSignature }> {
    const signature = await this.signManifest(manifest, privateKey, publicKeyId, signedBy);
    
    return {
      ...manifest,
      signature,
    };
  }

  /**
   * Verify manifest with embedded signature
   * 
   * @param manifestWithSignature - Manifest with embedded signature
   * @param publicKey - PEM-encoded RSA public key
   * @returns Verification result
   */
  async verifyEmbedded(
    manifestWithSignature: MCPManifest & { signature: ManifestSignature },
    publicKey: string
  ): Promise<SignatureVerificationResult> {
    // Extract signature and manifest
    const { signature, ...manifest } = manifestWithSignature;
    
    // Verify
    return this.verifyManifest(manifest, signature, publicKey);
  }
}

// Singleton instance
export const manifestSigner = new ManifestSigner();

