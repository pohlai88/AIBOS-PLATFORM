/**
 * MCP Manifest Validator Tests
 * 
 * Tests for GRCD-KERNEL F-2: Validate manifests before hydration
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { mcpManifestValidator } from "../validator/manifest.validator";
import type { MCPManifest } from "../types";

describe("MCPManifestValidator", () => {
  describe("validate()", () => {
    it("should validate a correct manifest", () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
        description: "Test server",
        tools: [
          {
            name: "test_tool",
            description: "Test tool",
            inputSchema: { type: "object" },
          },
        ],
      };

      const result = mcpManifestValidator.validate(manifest);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject manifest with invalid version", () => {
      const manifest = {
        name: "test-server",
        version: "invalid",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      const result = mcpManifestValidator.validate(manifest);

      expect(result.valid).toBe(false);
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it("should reject manifest with missing name", () => {
      const manifest = {
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      const result = mcpManifestValidator.validate(manifest);

      expect(result.valid).toBe(false);
    });

    it("should detect duplicate tool names", () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
        tools: [
          {
            name: "duplicate_tool",
            description: "First tool",
            inputSchema: {},
          },
          {
            name: "duplicate_tool",
            description: "Second tool",
            inputSchema: {},
          },
        ],
      };

      const result = mcpManifestValidator.validate(manifest);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "DUPLICATE_TOOL_NAME",
        })
      );
    });

    it("should warn on protocol version mismatch", () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2024-01-01",
      };

      const result = mcpManifestValidator.validate(manifest);

      expect(result.warnings?.length).toBeGreaterThan(0);
      expect(result.warnings?.[0]).toMatchObject({
        code: "PROTOCOL_VERSION_MISMATCH",
      });
    });

    it("should detect duplicate resource URIs", () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
        resources: [
          {
            uri: "test://resource/1",
            name: "Resource 1",
            description: "First resource",
          },
          {
            uri: "test://resource/1",
            name: "Resource 2",
            description: "Duplicate URI",
          },
        ],
      };

      const result = mcpManifestValidator.validate(manifest);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: "DUPLICATE_RESOURCE_URI",
        })
      );
    });
  });

  describe("isValid()", () => {
    it("should return true for valid manifest", () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      expect(mcpManifestValidator.isValid(manifest)).toBe(true);
    });

    it("should return false for invalid manifest", () => {
      const manifest = {
        name: "test-server",
        // missing version
        protocol: "mcp",
      };

      expect(mcpManifestValidator.isValid(manifest)).toBe(false);
    });
  });
});

