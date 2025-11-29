/**
 * Policy Template Integration Tests
 * 
 * GRCD-KERNEL v4.0.0: Policy Template & Inheritance Tests
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { policyTemplateRegistry } from "../../policy/templates/template-registry";
import { inheritanceResolver } from "../../policy/templates/inheritance-resolver";
import { builtinTemplates } from "../../policy/templates/builtin-templates";
import type { PolicyInheritance } from "../../policy/templates/types";
import { PolicyEffect } from "../../policy/types";

describe("Policy Template Integration", () => {
  beforeAll(() => {
    // Register built-in templates
    builtinTemplates.forEach(template => {
      policyTemplateRegistry.registerTemplate(template);
    });
  });

  describe("Template Registry", () => {
    it("should have all 5 built-in templates registered", () => {
      const templates = policyTemplateRegistry.listTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(5);

      const templateIds = templates.map(t => t.id);
      expect(templateIds).toContain("template-gdpr-data-protection");
      expect(templateIds).toContain("template-soc2-access-control");
      expect(templateIds).toContain("template-rate-limiting");
      expect(templateIds).toContain("template-environment-access");
      expect(templateIds).toContain("template-cost-control");
    });

    it("should retrieve template by ID", () => {
      const template = policyTemplateRegistry.getTemplate("template-gdpr-data-protection");
      expect(template).not.toBeNull();
      expect(template?.name).toBe("GDPR Data Protection Template");
    });
  });

  describe("Policy Inheritance", () => {
    it("should resolve policy from template with overrides", () => {
      const inheritance: PolicyInheritance = {
        templateId: "template-gdpr-data-protection",
        overrides: {
          scope: {
            tenantId: "tenant-xyz",
          },
        },
      };

      const resolved = inheritanceResolver.resolveFromTemplate(
        "derived-gdpr-policy",
        "Tenant XYZ GDPR Policy",
        "1.0.0",
        inheritance
      );

      expect(resolved.id).toBe("derived-gdpr-policy");
      expect(resolved.name).toBe("Tenant XYZ GDPR Policy");
      expect(resolved.inheritedFrom).toBe("template-gdpr-data-protection");
      expect(resolved.scope.tenantId).toBe("tenant-xyz");
      expect(resolved.rules.length).toBeGreaterThan(0);
    });

    it("should resolve policy from template with extensions", () => {
      const inheritance: PolicyInheritance = {
        templateId: "template-rate-limiting",
        extensions: {
          additionalRules: [
            {
              condition: "context.metadata.requestCountPerMinute > 50",
              effect: PolicyEffect.ADVISE,
              details: "Custom threshold for this tenant",
            },
          ],
          metadata: {
            customField: "customValue",
          },
        },
      };

      const resolved = inheritanceResolver.resolveFromTemplate(
        "custom-rate-limit",
        "Custom Rate Limit Policy",
        "1.0.0",
        inheritance
      );

      expect(resolved.rules.length).toBeGreaterThan(2); // Base + extension
      expect(resolved.metadata?.customField).toBe("customValue");
      expect(resolved.extendedProperties).toContain("additionalRules");
    });

    it("should track template usage", () => {
      const templateId = "template-soc2-access-control";
      const initialStats = policyTemplateRegistry.getTemplateStats(templateId);
      const initialCount = initialStats?.usageCount || 0;

      // Derive a policy
      const inheritance: PolicyInheritance = {
        templateId,
      };

      inheritanceResolver.resolveFromTemplate(
        "derived-soc2",
        "Derived SOC2 Policy",
        "1.0.0",
        inheritance
      );

      const newStats = policyTemplateRegistry.getTemplateStats(templateId);
      expect(newStats?.usageCount).toBe(initialCount + 1);
      expect(newStats?.derivedPolicies).toContain("derived-soc2");
    });
  });

  describe("Template Validation", () => {
    it("should validate valid template", () => {
      const template = policyTemplateRegistry.getTemplate("template-gdpr-data-protection");
      expect(template).not.toBeNull();

      const validation = inheritanceResolver.validateTemplate(template!);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should reject invalid template", () => {
      const invalidTemplate: any = {
        // Missing required fields
        id: "",
        name: "",
      };

      const validation = inheritanceResolver.validateTemplate(invalidTemplate);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

