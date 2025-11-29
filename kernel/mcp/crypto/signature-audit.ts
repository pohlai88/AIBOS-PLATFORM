/**
 * MCP Signature Audit Logger
 * 
 * GRCD Compliance: F-11 (MCP Manifest Signatures), F-10 (Audit MCP interactions)
 * Standard: ISO 42001, SOC2, ISO 27001
 * 
 * Audits all cryptographic signature operations for MCP manifests.
 */

import { baseAudit } from "../../audit/audit";
import { AuditCategory, AuditSeverity } from "../../audit/types";
import { ManifestSignature, SignatureVerificationResult } from "./types";

export class SignatureAuditLogger {
  /**
   * Log manifest signature generation
   */
  logSignatureCreated(
    manifestId: string,
    manifestName: string,
    signature: ManifestSignature,
    tenantId: string = "system"
  ): void {
    baseAudit.log({
      action: "mcp.signature.created",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.INFO,
      actor: signature.metadata.signedBy,
      tenantId,
      resource: `mcp:manifest:${manifestId}`,
      details: {
        manifestId,
        manifestName,
        publicKeyId: signature.publicKeyId,
        algorithm: signature.algorithm,
        environment: signature.metadata.signedBy,
        manifestHash: signature.manifestHash,
        timestamp: signature.timestamp,
      },
      metadata: {
        operation: "manifest_signing",
        signedBy: signature.metadata.signedBy,
      },
    });
  }

  /**
   * Log successful signature verification
   */
  logSignatureVerified(
    manifestId: string,
    manifestName: string,
    verificationResult: SignatureVerificationResult,
    tenantId: string = "system"
  ): void {
    baseAudit.log({
      action: "mcp.signature.verified",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.INFO,
      actor: "system",
      tenantId,
      resource: `mcp:manifest:${manifestId}`,
      details: {
        manifestId,
        manifestName,
        publicKeyId: verificationResult.publicKeyId,
        signedBy: verificationResult.signedBy,
        signedAt: verificationResult.signedAt,
        verifiedAt: verificationResult.verifiedAt,
        valid: verificationResult.valid,
        warnings: verificationResult.warnings,
      },
      metadata: {
        operation: "signature_verification",
        outcome: "success",
      },
    });
  }

  /**
   * Log failed signature verification
   */
  logSignatureVerificationFailed(
    manifestId: string,
    manifestName: string,
    verificationResult: SignatureVerificationResult,
    tenantId: string = "system"
  ): void {
    baseAudit.log({
      action: "mcp.signature.verification_failed",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.WARNING,
      actor: "system",
      tenantId,
      resource: `mcp:manifest:${manifestId}`,
      details: {
        manifestId,
        manifestName,
        publicKeyId: verificationResult.publicKeyId,
        signedBy: verificationResult.signedBy,
        errors: verificationResult.errors,
        warnings: verificationResult.warnings,
      },
      metadata: {
        operation: "signature_verification",
        outcome: "failure",
      },
    });
  }

  /**
   * Log unsigned manifest detection
   */
  logUnsignedManifest(
    manifestId: string,
    manifestName: string,
    tenantId: string = "system"
  ): void {
    baseAudit.log({
      action: "mcp.signature.unsigned_manifest",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.WARNING,
      actor: "system",
      tenantId,
      resource: `mcp:manifest:${manifestId}`,
      details: {
        manifestId,
        manifestName,
        reason: "Manifest has no cryptographic signature",
      },
      metadata: {
        operation: "signature_validation",
        outcome: "unsigned",
      },
    });
  }

  /**
   * Log key generation
   */
  logKeyGenerated(
    keyId: string,
    algorithm: string,
    owner: string = "system"
  ): void {
    baseAudit.log({
      action: "mcp.key.generated",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.INFO,
      actor: owner,
      tenantId: "system",
      resource: `mcp:key:${keyId}`,
      details: {
        keyId,
        algorithm,
        createdAt: Date.now(),
      },
      metadata: {
        operation: "key_generation",
      },
    });
  }

  /**
   * Log key rotation
   */
  logKeyRotated(oldKeyId: string, newKeyId: string, owner: string = "system"): void {
    baseAudit.log({
      action: "mcp.key.rotated",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.INFO,
      actor: owner,
      tenantId: "system",
      resource: `mcp:key:${newKeyId}`,
      details: {
        oldKeyId,
        newKeyId,
        rotatedAt: Date.now(),
      },
      metadata: {
        operation: "key_rotation",
      },
    });
  }

  /**
   * Log key revocation
   */
  logKeyRevoked(keyId: string, reason: string, owner: string = "system"): void {
    baseAudit.log({
      action: "mcp.key.revoked",
      category: AuditCategory.SECURITY,
      severity: AuditSeverity.WARNING,
      actor: owner,
      tenantId: "system",
      resource: `mcp:key:${keyId}`,
      details: {
        keyId,
        reason,
        revokedAt: Date.now(),
      },
      metadata: {
        operation: "key_revocation",
      },
    });
  }
}

// Singleton instance
export const signatureAudit = new SignatureAuditLogger();

