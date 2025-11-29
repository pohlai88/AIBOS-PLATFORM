/**
 * Policy Testing Framework
 * 
 * GRCD-KERNEL v4.0.0 - Policy Testing Enhancement
 * Based on OPA (Open Policy Agent) testing patterns
 * 
 * Provides unit testing, regression testing, and performance benchmarking for policies
 */

import type {
  PolicyManifest,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
} from "../types";
import { PolicyEngine } from "../engine/policy-engine";
import { policyRegistry } from "../registry/policy-registry";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Policy Test Definition
 * 
 * Reference: OPA test pattern
 * - name: Test case identifier
 * - policy: Policy to test (by name or manifest)
 * - input: Input context for policy evaluation
 * - expected: Expected result (boolean for allow/deny, or full result object)
 * - precedence?: Expected precedence level (legal/industry/internal)
 */
export interface PolicyTest {
  name: string;
  description?: string;
  policy: string | PolicyManifest; // Policy name or full manifest
  input: PolicyEvaluationRequest;
  expected: boolean | PolicyEvaluationResult;
  precedence?: "legal" | "industry" | "internal";
  skip?: boolean; // Skip this test
  only?: boolean; // Run only this test
}

/**
 * Policy Test Result
 */
export interface PolicyTestResult {
  test: PolicyTest;
  passed: boolean;
  actual?: PolicyEvaluationResult;
  error?: Error;
  durationMs: number;
  message?: string;
}

/**
 * Policy Test Suite
 */
export interface PolicyTestSuite {
  name: string;
  description?: string;
  tests: PolicyTest[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

/**
 * Policy Testing Framework
 * 
 * Provides:
 * - Unit testing for policies
 * - Regression testing
 * - Performance benchmarking
 * - Legal-first precedence validation
 */
export class PolicyTestFramework {
  private policyEngine: PolicyEngine;

  constructor() {
    this.policyEngine = PolicyEngine.getInstance();
  }

  /**
   * Run a single policy test
   */
  async runTest(test: PolicyTest): Promise<PolicyTestResult> {
    const startTime = Date.now();

    try {
      // Load policy if needed
      let policyManifest: PolicyManifest | null = null;
      
      if (typeof test.policy === "string") {
        // Policy name - load from registry
        const entry = policyRegistry.getByName(test.policy);
        if (!entry) {
          throw new Error(`Policy not found: ${test.policy}`);
        }
        policyManifest = entry.manifest;
      } else {
        // Full manifest provided
        policyManifest = test.policy;
      }

      // Evaluate policy
      const actual = await this.policyEngine.evaluate(test.input);

      // Validate result
      const passed = this.validateResult(test, actual);

      const durationMs = Date.now() - startTime;

      return {
        test,
        passed,
        actual,
        durationMs,
        message: passed
          ? "Test passed"
          : `Test failed: Expected ${JSON.stringify(test.expected)}, got ${JSON.stringify(actual)}`,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      return {
        test,
        passed: false,
        error: error instanceof Error ? error : new Error(String(error)),
        durationMs,
        message: `Test error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Run a test suite
   */
  async runSuite(suite: PolicyTestSuite): Promise<PolicyTestResult[]> {
    logger.info({ suite: suite.name }, "[PolicyTestFramework] Running test suite");

    // Setup if provided
    if (suite.setup) {
      await suite.setup();
    }

    try {
      // Filter tests (skip, only)
      let testsToRun = suite.tests;
      
      const onlyTests = testsToRun.filter((t) => t.only);
      if (onlyTests.length > 0) {
        testsToRun = onlyTests;
        logger.info({ count: onlyTests.length }, "[PolicyTestFramework] Running only tests");
      } else {
        testsToRun = testsToRun.filter((t) => !t.skip);
      }

      // Run tests
      const results: PolicyTestResult[] = [];
      for (const test of testsToRun) {
        const result = await this.runTest(test);
        results.push(result);
        
        if (result.passed) {
          logger.debug({ test: test.name }, "[PolicyTestFramework] Test passed");
        } else {
          logger.warn({ test: test.name, error: result.message }, "[PolicyTestFramework] Test failed");
        }
      }

      // Summary
      const passed = results.filter((r) => r.passed).length;
      const failed = results.filter((r) => !r.passed).length;
      const totalDuration = results.reduce((sum, r) => sum + r.durationMs, 0);

      logger.info(
        {
          suite: suite.name,
          passed,
          failed,
          total: results.length,
          durationMs: totalDuration,
        },
        "[PolicyTestFramework] Test suite completed"
      );

      return results;
    } finally {
      // Teardown if provided
      if (suite.teardown) {
        await suite.teardown();
      }
    }
  }

  /**
   * Run multiple test suites
   */
  async runSuites(suites: PolicyTestSuite[]): Promise<Map<string, PolicyTestResult[]>> {
    const results = new Map<string, PolicyTestResult[]>();

    for (const suite of suites) {
      const suiteResults = await this.runSuite(suite);
      results.set(suite.name, suiteResults);
    }

    return results;
  }

  /**
   * Benchmark policy evaluation performance
   */
  async benchmark(
    policy: string | PolicyManifest,
    input: PolicyEvaluationRequest,
    iterations: number = 100
  ): Promise<{
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  }> {
    const durations: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await this.policyEngine.evaluate(input);
      durations.push(Date.now() - startTime);
    }

    durations.sort((a, b) => a - b);

    return {
      min: durations[0],
      max: durations[durations.length - 1],
      avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      p50: durations[Math.floor(durations.length * 0.5)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };
  }

  /**
   * Validate test result against expected
   */
  private validateResult(
    test: PolicyTest,
    actual: PolicyEvaluationResult
  ): boolean {
    if (typeof test.expected === "boolean") {
      // Simple allow/deny check
      return actual.allowed === test.expected;
    }

    // Full result comparison
    const expected = test.expected as PolicyEvaluationResult;

    // Check allowed/denied
    if (actual.allowed !== expected.allowed) {
      return false;
    }

    // Check precedence if specified
    if (test.precedence && actual.metadata?.precedence) {
      if (actual.metadata.precedence !== test.precedence) {
        return false;
      }
    }

    // Check reason if specified
    if (expected.reason && actual.reason !== expected.reason) {
      return false;
    }

    return true;
  }
}

/**
 * Singleton instance
 */
export const policyTestFramework = new PolicyTestFramework();

