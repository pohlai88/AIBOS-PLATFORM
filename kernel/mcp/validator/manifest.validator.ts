/**
 * MCP Manifest Validator
 * 
 * GRCD-KERNEL v4.0.0 F-2: Validate manifests before hydration
 * GRCD-KERNEL v4.0.0 F-11: Enforce MCP manifest signatures
 * Runtime validation of MCP manifests with detailed error reporting and signature verification
 */

import type { MCPManifest, MCPValidationResult, MCPValidationError } from "../types";
import { validateMCPManifest } from "../schemas/mcp-manifest.schema";
import { MCP_PROTOCOL_VERSION } from "../types";
import { manifestSigner, keyManager, signatureAudit, type ManifestSignature } from "../crypto";

export class MCPManifestValidator {
  private requireSignatures: boolean;

  constructor(requireSignatures: boolean = true) {
    this.requireSignatures = requireSignatures;
  }

  /**
   * Validate MCP manifest with detailed errors and optional signature verification
   * 
   * @param manifest - Manifest to validate (may include embedded signature)
   * @param tenantId - Tenant ID for audit logging
   * @returns Validation result with errors/warnings
   */
  public async validate(manifest: unknown, tenantId: string = "system"): Promise<MCPValidationResult> {
    const result: MCPValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // 1. Schema validation
    const schemaValidation = validateMCPManifest(manifest);
    if (!schemaValidation.success) {
      result.valid = false;
      result.errors = schemaValidation.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      }));
      return result; // Early return on schema errors
    }

    const validatedManifest = schemaValidation.data;

    // 2. Protocol version check
    if (validatedManifest.protocolVersion !== MCP_PROTOCOL_VERSION) {
      result.warnings?.push({
        path: "protocolVersion",
        message: `Protocol version ${validatedManifest.protocolVersion} may not be compatible with ${MCP_PROTOCOL_VERSION}`,
        code: "PROTOCOL_VERSION_MISMATCH",
      });
    }

    // 3. Tool name uniqueness
    if (validatedManifest.tools) {
      const toolNames = new Set<string>();
      validatedManifest.tools.forEach((tool, index) => {
        if (toolNames.has(tool.name)) {
          result.valid = false;
          result.errors?.push({
            path: `tools[${index}].name`,
            message: `Duplicate tool name: ${tool.name}`,
            code: "DUPLICATE_TOOL_NAME",
          });
        }
        toolNames.add(tool.name);
      });
    }

    // 4. Resource URI uniqueness
    if (validatedManifest.resources) {
      const resourceUris = new Set<string>();
      validatedManifest.resources.forEach((resource, index) => {
        if (resourceUris.has(resource.uri)) {
          result.valid = false;
          result.errors?.push({
            path: `resources[${index}].uri`,
            message: `Duplicate resource URI: ${resource.uri}`,
            code: "DUPLICATE_RESOURCE_URI",
          });
        }
        resourceUris.add(resource.uri);
      });
    }

    // 5. Prompt name uniqueness
    if (validatedManifest.prompts) {
      const promptNames = new Set<string>();
      validatedManifest.prompts.forEach((prompt, index) => {
        if (promptNames.has(prompt.name)) {
          result.valid = false;
          result.errors?.push({
            path: `prompts[${index}].name`,
            message: `Duplicate prompt name: ${prompt.name}`,
            code: "DUPLICATE_PROMPT_NAME",
          });
        }
        promptNames.add(prompt.name);
      });
    }

    // 6. Signature validation (F-11: MCP Manifest Signatures)
    const manifestWithSignature = manifest as any;
    if (manifestWithSignature.signature) {
      // Manifest has a signature - verify it
      try {
        const signature: ManifestSignature = manifestWithSignature.signature;
        const publicKey = await keyManager.loadPublicKey(signature.publicKeyId);
        
        const verificationResult = await manifestSigner.verifyManifest(
          validatedManifest,
          signature,
          publicKey
        );

        if (verificationResult.valid) {
          signatureAudit.logSignatureVerified(
            validatedManifest.id,
            validatedManifest.name,
            verificationResult,
            tenantId
          );
          
          // Add warnings from signature verification
          if (verificationResult.warnings.length > 0) {
            verificationResult.warnings.forEach((warning) => {
              result.warnings?.push({
                path: "signature",
                message: warning,
                code: "SIGNATURE_WARNING",
              });
            });
          }
        } else {
          // Signature verification failed
          signatureAudit.logSignatureVerificationFailed(
            validatedManifest.id,
            validatedManifest.name,
            verificationResult,
            tenantId
          );
          
          result.valid = false;
          verificationResult.errors.forEach((error) => {
            result.errors?.push({
              path: "signature",
              message: error,
              code: "SIGNATURE_INVALID",
            });
          });
        }
      } catch (error) {
        // Signature validation error
        result.valid = false;
        result.errors?.push({
          path: "signature",
          message: `Signature validation error: ${error instanceof Error ? error.message : String(error)}`,
          code: "SIGNATURE_ERROR",
        });
      }
    } else if (this.requireSignatures) {
      // No signature and signatures are required
      signatureAudit.logUnsignedManifest(
        validatedManifest.id,
        validatedManifest.name,
        tenantId
      );
      
      result.valid = false;
      result.errors?.push({
        path: "signature",
        message: "MCP manifest must be cryptographically signed (ISO 42001 requirement)",
        code: "SIGNATURE_REQUIRED",
      });
    } else {
      // No signature but signatures are optional - just log a warning
      signatureAudit.logUnsignedManifest(
        validatedManifest.id,
        validatedManifest.name,
        tenantId
      );
      
      result.warnings?.push({
        path: "signature",
        message: "MCP manifest is not signed. Consider adding a cryptographic signature for enhanced security.",
        code: "SIGNATURE_MISSING",
      });
    }

    return result;
  }

  /**
   * Quick validation (boolean only)
   */
  public async isValid(manifest: unknown, tenantId: string = "system"): Promise<boolean> {
    const result = await this.validate(manifest, tenantId);
    return result.valid;
  }
}

/**
 * Export singleton instance
 */
export const mcpManifestValidator = new MCPManifestValidator();

