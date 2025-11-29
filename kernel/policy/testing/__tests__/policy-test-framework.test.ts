/**
 * Policy Testing Framework Tests
 * 
 * Tests for the policy testing framework itself
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { PolicyTestFramework } from "../policy-test-framework";
import type { PolicyTest, PolicyTestSuite } from "../policy-test-framework";

describe("PolicyTestFramework", () => {
  let framework: PolicyTestFramework;

  beforeEach(() => {
    framework = new PolicyTestFramework();
  });

  describe("runTest", () => {
    it("should run a simple policy test", async () => {
      const test: PolicyTest = {
        name: "Simple allow test",
        policy: "test-policy",
        input: {
          action: "read",
          orchestra: "test",
          tenantId: "test-tenant",
          userId: "test-user",
        },
        expected: true,
      };

      // Note: This will fail if policy doesn't exist, but tests the framework
      const result = await framework.runTest(test);
      
      expect(result.test).toBe(test);
      expect(result.durationMs).toBeGreaterThan(0);
    });

    it("should handle test errors gracefully", async () => {
      const test: PolicyTest = {
        name: "Non-existent policy test",
        policy: "non-existent-policy",
        input: {
          action: "read",
          orchestra: "test",
          tenantId: "test-tenant",
          userId: "test-user",
        },
        expected: true,
      };

      const result = await framework.runTest(test);
      
      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("runSuite", () => {
    it("should run a test suite", async () => {
      const suite: PolicyTestSuite = {
        name: "Test Suite",
        tests: [
          {
            name: "Test 1",
            policy: "test-policy",
            input: {
              action: "read",
              orchestra: "test",
              tenantId: "test-tenant",
              userId: "test-user",
            },
            expected: true,
          },
        ],
      };

      const results = await framework.runSuite(suite);
      
      expect(results.length).toBe(1);
    });

    it("should skip tests marked with skip", async () => {
      const suite: PolicyTestSuite = {
        name: "Test Suite with Skip",
        tests: [
          {
            name: "Test 1",
            policy: "test-policy",
            input: {
              action: "read",
              orchestra: "test",
              tenantId: "test-tenant",
              userId: "test-user",
            },
            expected: true,
          },
          {
            name: "Test 2 (Skipped)",
            policy: "test-policy",
            input: {
              action: "read",
              orchestra: "test",
              tenantId: "test-tenant",
              userId: "test-user",
            },
            expected: true,
            skip: true,
          },
        ],
      };

      const results = await framework.runSuite(suite);
      
      expect(results.length).toBe(1);
      expect(results[0].test.name).toBe("Test 1");
    });
  });

  describe("benchmark", () => {
    it("should benchmark policy evaluation", async () => {
      const benchmark = await framework.benchmark(
        "test-policy",
        {
          action: "read",
          orchestra: "test",
          tenantId: "test-tenant",
          userId: "test-user",
        },
        10 // Small number for test
      );

      expect(benchmark.min).toBeGreaterThanOrEqual(0);
      expect(benchmark.max).toBeGreaterThanOrEqual(benchmark.min);
      expect(benchmark.avg).toBeGreaterThanOrEqual(benchmark.min);
      expect(benchmark.p50).toBeGreaterThanOrEqual(benchmark.min);
      expect(benchmark.p95).toBeGreaterThanOrEqual(benchmark.p50);
      expect(benchmark.p99).toBeGreaterThanOrEqual(benchmark.p95);
    });
  });
});

