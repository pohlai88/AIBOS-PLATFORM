/**
 * Policy Engine Tests
 * 
 * GRCD-KERNEL v4.0.0: Test policy evaluation and rule matching
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { policyEngine } from "../engine/policy-engine";
import { policyRegistry } from "../registry/policy-registry";
import { PolicyPrecedence, PolicyStatus, PolicyEnforcementMode } from "../types";
import type { PolicyManifest } from "../types";

describe("PolicyEngine", () => {
  beforeEach(() => {
    policyRegistry.clear();
  });

  describe("evaluate() - No Policies", () => {
    it("should allow when no policies apply (default allow)", async () => {
      const result = await policyEngine.evaluate({
        action: "test-action",
        context: {},
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toContain("No policies apply");
    });
  });

  describe("evaluate() - Policy Matching", () => {
    it("should deny when policy matches and effect is deny", async () => {
      const policy: PolicyManifest = {
        id: "test-deny",
        name: "Test Deny Policy",
        version: "1.0.0",
        description: "Test",
        precedence: PolicyPrecedence.LEGAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {
          actions: ["dangerous-action"],
        },
        rules: [
          {
            id: "rule-1",
            description: "Deny dangerous action",
            conditions: [
              {
                field: "action",
                operator: "eq",
                value: "dangerous-action",
              },
            ],
            effect: "deny",
          },
        ],
      };

      await policyRegistry.register(policy);

      const result = await policyEngine.evaluate({
        action: "dangerous-action",
        context: {},
      });

      expect(result.allowed).toBe(false);
      expect(result.winningPolicy?.effect).toBe("deny");
    });

    it("should allow when policy matches and effect is allow", async () => {
      const policy: PolicyManifest = {
        id: "test-allow",
        name: "Test Allow Policy",
        version: "1.0.0",
        description: "Test",
        precedence: PolicyPrecedence.LEGAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {
          actions: ["safe-action"],
        },
        rules: [
          {
            id: "rule-1",
            description: "Allow safe action",
            conditions: [
              {
                field: "action",
                operator: "eq",
                value: "safe-action",
              },
            ],
            effect: "allow",
          },
        ],
      };

      await policyRegistry.register(policy);

      const result = await policyEngine.evaluate({
        action: "safe-action",
        context: {},
      });

      expect(result.allowed).toBe(true);
      expect(result.winningPolicy?.effect).toBe("allow");
    });
  });

  describe("evaluate() - Condition Operators", () => {
    it("should evaluate 'eq' operator correctly", async () => {
      const policy: PolicyManifest = {
        id: "test-eq",
        name: "Test EQ",
        version: "1.0.0",
        description: "Test",
        precedence: PolicyPrecedence.INTERNAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {},
        rules: [
          {
            id: "rule-1",
            description: "Check equality",
            conditions: [
              {
                field: "context.environment",
                operator: "eq",
                value: "production",
              },
            ],
            effect: "deny",
          },
        ],
      };

      await policyRegistry.register(policy);

      const result = await policyEngine.evaluate({
        action: "test",
        context: {
          environment: "production",
        },
      });

      expect(result.allowed).toBe(false);
    });

    it("should evaluate 'in' operator correctly", async () => {
      const policy: PolicyManifest = {
        id: "test-in",
        name: "Test IN",
        version: "1.0.0",
        description: "Test",
        precedence: PolicyPrecedence.INTERNAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {},
        rules: [
          {
            id: "rule-1",
            description: "Check array membership",
            conditions: [
              {
                field: "action",
                operator: "in",
                value: ["delete", "drop", "truncate"],
              },
            ],
            effect: "deny",
          },
        ],
      };

      await policyRegistry.register(policy);

      const result = await policyEngine.evaluate({
        action: "delete",
        context: {},
      });

      expect(result.allowed).toBe(false);
    });
  });

  describe("isAllowed() - Convenience Method", () => {
    it("should return boolean for quick checks", async () => {
      const policy: PolicyManifest = {
        id: "quick-check",
        name: "Quick Check",
        version: "1.0.0",
        description: "Test",
        precedence: PolicyPrecedence.LEGAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {},
        rules: [
          {
            id: "rule-1",
            description: "Deny test action",
            conditions: [
              {
                field: "action",
                operator: "eq",
                value: "blocked-action",
              },
            ],
            effect: "deny",
          },
        ],
      };

      await policyRegistry.register(policy);

      const allowed = await policyEngine.isAllowed("blocked-action", {});
      const notBlocked = await policyEngine.isAllowed("other-action", {});

      expect(allowed).toBe(false);
      expect(notBlocked).toBe(true);
    });
  });
});

