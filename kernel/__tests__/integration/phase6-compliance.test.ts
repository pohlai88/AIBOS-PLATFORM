/**
 * Phase 6 Compliance Integration Tests
 * 
 * GRCD Compliance: Final Validation
 * Tests all Phase 6 features for 100% GRCD compliance
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { manifestSigner, keyManager } from "../../mcp/crypto";
import { hitlApprovalEngine, riskClassifier } from "../../governance/hitl";
import { iso42001Validator } from "../../mcp/compliance";
import { mfrsIfrsValidator } from "../../finance/compliance";
import { resourceDiscovery } from "../../mcp/discovery/resource-discovery";
import { promptTemplateRegistry } from "../../mcp/prompts/template-registry";
import { availabilityTracker } from "../../observability/sla/availability-tracker";
import { bootTracker } from "../../observability/performance/boot-tracker";
import { memoryTracker } from "../../observability/performance/memory-tracker";
import type { MCPManifest } from "../../mcp/types";
import { RiskLevel } from "../../governance/hitl/types";

describe("Phase 6 - GRCD Compliance Integration Tests", () => {
  describe("F-11: MCP Manifest Signatures", () => {
    it("should sign and verify manifest", async () => {
      const keyPair = await keyManager.generateKeyPair("test-key");
      const manifest: MCPManifest = {
        id: "test-manifest",
        name: "Test Server",
        version: "1.0.0",
        protocolVersion: "2024-11-05",
        description: "Test",
      };

      const signature = await manifestSigner.signManifest(
        manifest,
        keyPair.privateKey,
        keyPair.keyId,
        "test@example.com"
      );

      expect(signature).toBeDefined();
      expect(signature.signature).toBeTruthy();

      const publicKey = await keyManager.loadPublicKey(keyPair.keyId);
      const result = await manifestSigner.verifyManifest(manifest, signature, publicKey);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("C-8: HITL Approval Engine", () => {
    it("should classify risk and require approval for high-risk actions", async () => {
      const riskLevel = riskClassifier.classifyAction("data.delete.all", {
        tenantId: "test",
      });

      expect(riskLevel).toBe(RiskLevel.CRITICAL);
      expect(riskClassifier.requiresApproval(riskLevel)).toBe(true);

      const requestId = await hitlApprovalEngine.requestApproval({
        actionType: "data.delete.all",
        requester: "test-user",
        tenantId: "test",
        description: "Delete all data",
      });

      expect(requestId).toBeTruthy();
      expect(requestId).not.toContain("auto-approved");
    });

    it("should auto-approve low-risk actions", async () => {
      const riskLevel = riskClassifier.classifyAction("config.read", {
        tenantId: "test",
      });

      expect(riskLevel).toBe(RiskLevel.LOW);
      expect(riskClassifier.requiresApproval(riskLevel)).toBe(false);

      const requestId = await hitlApprovalEngine.requestApproval({
        actionType: "config.read",
        requester: "test-user",
        tenantId: "test",
        description: "Read config",
      });

      expect(requestId).toContain("auto-approved");
    });
  });

  describe("C-7: ISO 42001 Compliance", () => {
    it("should validate manifest against ISO 42001", () => {
      const manifest: MCPManifest = {
        id: "test-ai",
        name: "AI System",
        version: "1.0.0",
        protocolVersion: "2024-11-05",
        description: "AI system for testing ISO 42001 compliance",
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
        },
      };

      const result = iso42001Validator.validateManifest(manifest);

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      expect(result.checks).toBeDefined();
    });
  });

  describe("C-9: MFRS/IFRS Financial Standards", () => {
    it("should validate journal entry (double-entry)", () => {
      const entry = {
        id: "je-001",
        date: "2025-11-29",
        description: "Test entry",
        debits: [
          {
            accountNumber: "1000",
            debit: 1000,
            description: "Cash",
          },
        ],
        credits: [
          {
            accountNumber: "4000",
            credit: 1000,
            description: "Revenue",
          },
        ],
        reference: "REF-001",
        status: "draft" as const,
      };

      const result = mfrsIfrsValidator.validateJournalEntry(entry);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject unbalanced journal entry", () => {
      const entry = {
        id: "je-002",
        date: "2025-11-29",
        description: "Unbalanced entry",
        debits: [
          {
            accountNumber: "1000",
            debit: 1000,
            description: "Cash",
          },
        ],
        credits: [
          {
            accountNumber: "4000",
            credit: 500, // Mismatch!
            description: "Revenue",
          },
        ],
        reference: "REF-002",
        status: "draft" as const,
      };

      const result = mfrsIfrsValidator.validateJournalEntry(entry);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain("not balanced");
    });
  });

  describe("F-12: MCP Resource Discovery", () => {
    it("should list resources for a server", async () => {
      const resources = await resourceDiscovery.listResources("test-server");
      expect(Array.isArray(resources)).toBe(true);
    });

    it("should search resources", async () => {
      const results = await resourceDiscovery.searchResources("test");
      expect(Array.isArray(results)).toBe(true);
    });

    it("should get resource types", async () => {
      const types = await resourceDiscovery.getResourceTypes();
      expect(Array.isArray(types)).toBe(true);
    });
  });

  describe("F-13: MCP Prompt Templates", () => {
    it("should register and retrieve template", () => {
      const template = promptTemplateRegistry.getTemplate("builtin-code-review");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Code Review Prompt");
    });

    it("should render template with variables", () => {
      const rendered = promptTemplateRegistry.renderTemplate("builtin-code-review", {
        language: "TypeScript",
        code: "const x = 1;",
      });

      expect(rendered.content).toContain("TypeScript");
      expect(rendered.content).toContain("const x = 1;");
      expect(rendered.content).not.toContain("{{");
    });

    it("should validate template variables", () => {
      const result = promptTemplateRegistry.validateVariables("builtin-code-review", {
        language: "TypeScript",
        code: "const x = 1;",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("NF-2: Availability Tracking", () => {
    it("should track uptime and calculate availability", () => {
      const now = Date.now();
      const period = {
        start: now - 24 * 60 * 60 * 1000, // 24 hours ago
        end: now,
      };

      availabilityTracker.recordUptime(now - 1000);
      const availability = availabilityTracker.calculateAvailability(period);

      expect(availability).toBeGreaterThanOrEqual(0);
      expect(availability).toBeLessThanOrEqual(100);
    });

    it("should generate SLA report", () => {
      const now = Date.now();
      const period = {
        start: now - 24 * 60 * 60 * 1000,
        end: now,
      };

      const report = availabilityTracker.getSLAReport(period);

      expect(report.availability).toBeGreaterThanOrEqual(0);
      expect(report.availability).toBeLessThanOrEqual(100);
      expect(report.slaTarget).toBe(99.9);
      expect(report.compliant).toBeDefined();
    });
  });

  describe("NF-3: Boot Time Tracking", () => {
    it("should track boot time", () => {
      bootTracker.startBootTimer();
      bootTracker.recordBootStage("init", 100);
      bootTracker.recordBootStage("load", 200);
      const totalTime = bootTracker.endBootTimer();

      expect(totalTime).toBeGreaterThan(0);
      expect(totalTime).toBeLessThan(10000); // Should be < 10s

      const report = bootTracker.getBootReport();
      expect(report.totalBootTime).toBe(totalTime);
      expect(report.compliant).toBe(totalTime < 5000); // < 5s SLA
    });
  });

  describe("NF-4: Memory Tracking", () => {
    it("should track memory usage", () => {
      memoryTracker.recordMemoryUsage();
      const current = memoryTracker.getCurrentMemory();
      const baseline = memoryTracker.getBaselineMemory();

      expect(current).toBeGreaterThan(0);
      expect(baseline).toBeGreaterThan(0);
    });

    it("should detect memory leaks", () => {
      memoryTracker.recordMemoryUsage();
      const leakReport = memoryTracker.detectMemoryLeaks();

      expect(leakReport).toBeDefined();
      expect(leakReport.detected).toBeDefined();
      expect(leakReport.growthRate).toBeDefined();
    });

    it("should verify memory SLA", () => {
      const compliant = memoryTracker.verifyMemorySLA();
      expect(typeof compliant).toBe("boolean");
    });
  });
});

