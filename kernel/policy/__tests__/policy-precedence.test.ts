/**
 * Policy Precedence Resolver Tests
 * 
 * GRCD-KERNEL v4.0.0 C-6: Test precedence resolution (Legal > Industry > Internal)
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { policyPrecedenceResolver } from "../engine/precedence-resolver";
import { PolicyPrecedence } from "../types";
import type { PolicyManifest } from "../types";

describe("PolicyPrecedenceResolver", () => {
  const createPolicy = (
    id: string,
    precedence: PolicyPrecedence,
    name: string
  ): PolicyManifest => ({
    id,
    name,
    version: "1.0.0",
    description: "Test policy",
    precedence,
    status: "active",
    enforcementMode: "enforce",
    scope: {},
    rules: [],
  });

  describe("resolve() - C-6 Precedence", () => {
    it("should select Legal over Industry", () => {
      const policies = [
        {
          policy: createPolicy("policy-1", PolicyPrecedence.INDUSTRY, "Industry Policy"),
          effect: "deny" as const,
        },
        {
          policy: createPolicy("policy-2", PolicyPrecedence.LEGAL, "Legal Policy"),
          effect: "allow" as const,
        },
      ];

      const result = policyPrecedenceResolver.resolve(policies);

      expect(result.winningPolicy.policyId).toBe("policy-2");
      expect(result.winningPolicy.precedence).toBe(PolicyPrecedence.LEGAL);
      expect(result.winningPolicy.effect).toBe("allow");
    });

    it("should select Legal over Internal", () => {
      const policies = [
        {
          policy: createPolicy("policy-1", PolicyPrecedence.INTERNAL, "Internal Policy"),
          effect: "allow" as const,
        },
        {
          policy: createPolicy("policy-2", PolicyPrecedence.LEGAL, "Legal Policy"),
          effect: "deny" as const,
        },
      ];

      const result = policyPrecedenceResolver.resolve(policies);

      expect(result.winningPolicy.policyId).toBe("policy-2");
      expect(result.winningPolicy.precedence).toBe(PolicyPrecedence.LEGAL);
    });

    it("should select Industry over Internal", () => {
      const policies = [
        {
          policy: createPolicy("policy-1", PolicyPrecedence.INTERNAL, "Internal Policy"),
          effect: "deny" as const,
        },
        {
          policy: createPolicy("policy-2", PolicyPrecedence.INDUSTRY, "Industry Policy"),
          effect: "allow" as const,
        },
      ];

      const result = policyPrecedenceResolver.resolve(policies);

      expect(result.winningPolicy.policyId).toBe("policy-2");
      expect(result.winningPolicy.precedence).toBe(PolicyPrecedence.INDUSTRY);
    });
  });

  describe("resolve() - Conflict Resolution", () => {
    it("should resolve conflict with deny > allow at same precedence", () => {
      const policies = [
        {
          policy: createPolicy("policy-1", PolicyPrecedence.LEGAL, "Legal Allow"),
          effect: "allow" as const,
        },
        {
          policy: createPolicy("policy-2", PolicyPrecedence.LEGAL, "Legal Deny"),
          effect: "deny" as const,
        },
      ];

      const result = policyPrecedenceResolver.resolve(policies);

      expect(result.winningPolicy.effect).toBe("deny");
      expect(result.conflict).toBeDefined();
      expect(result.conflict?.policies).toHaveLength(2);
    });

    it("should detect and report conflicts", () => {
      const policies = [
        {
          policy: createPolicy("policy-1", PolicyPrecedence.INDUSTRY, "Industry Allow"),
          effect: "allow" as const,
        },
        {
          policy: createPolicy("policy-2", PolicyPrecedence.INDUSTRY, "Industry Deny"),
          effect: "deny" as const,
        },
      ];

      const result = policyPrecedenceResolver.resolve(policies);

      expect(result.conflict).toBeDefined();
      expect(result.conflict?.resolution.reason).toContain("deny");
    });
  });

  describe("Single Policy", () => {
    it("should handle single policy without conflict", () => {
      const policies = [
        {
          policy: createPolicy("policy-1", PolicyPrecedence.LEGAL, "Single Policy"),
          effect: "allow" as const,
        },
      ];

      const result = policyPrecedenceResolver.resolve(policies);

      expect(result.winningPolicy.policyId).toBe("policy-1");
      expect(result.conflict).toBeUndefined();
    });
  });

  describe("Utility Methods", () => {
    it("should compare precedence levels correctly", () => {
      expect(
        policyPrecedenceResolver.compare(PolicyPrecedence.LEGAL, PolicyPrecedence.INDUSTRY)
      ).toBe(1);
      expect(
        policyPrecedenceResolver.compare(PolicyPrecedence.INTERNAL, PolicyPrecedence.LEGAL)
      ).toBe(-1);
      expect(
        policyPrecedenceResolver.compare(PolicyPrecedence.INDUSTRY, PolicyPrecedence.INDUSTRY)
      ).toBe(0);
    });

    it("should identify higher precedence", () => {
      expect(policyPrecedenceResolver.isHigher(PolicyPrecedence.LEGAL, PolicyPrecedence.INTERNAL)).toBe(true);
      expect(policyPrecedenceResolver.isHigher(PolicyPrecedence.INTERNAL, PolicyPrecedence.LEGAL)).toBe(false);
    });
  });
});

