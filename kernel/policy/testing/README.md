# Policy Testing Framework

**Status:** ✅ **IMPLEMENTED**  
**Priority:** 🚀 **High** - Quick win, high value  
**Reference:** OPA (Open Policy Agent) testing patterns

---

## Overview

The Policy Testing Framework provides unit testing, regression testing, and performance benchmarking for policies. Based on OPA's proven testing patterns, adapted for our constitutional governance model with legal-first precedence.

---

## Features

- ✅ **Unit Testing** - Test individual policies with various inputs
- ✅ **Regression Testing** - Ensure policy changes don't break existing rules
- ✅ **Performance Benchmarking** - Measure policy evaluation performance
- ✅ **Legal-First Precedence Validation** - Verify precedence hierarchy
- ✅ **Test Suites** - Organize tests into suites with setup/teardown

---

## Usage

### Basic Test

```typescript
import { policyTestFramework } from "./policy-test-framework";

const test: PolicyTest = {
  name: "Legal precedence test",
  policy: "legal_first_policy",
  input: {
    action: "financial_transaction",
    orchestra: "finance",
    tenantId: "tenant-1",
    userId: "user-1",
    resource: { amount: 10000 },
  },
  expected: {
    allowed: true,
    precedence: "legal",
  },
  precedence: "legal",
};

const result = await policyTestFramework.runTest(test);
console.log(result.passed ? "✅ Test passed" : "❌ Test failed");
```

### Test Suite

```typescript
const suite: PolicyTestSuite = {
  name: "Financial Compliance Tests",
  description: "Tests for MFRS/IFRS compliance policies",
  setup: async () => {
    // Setup test data
  },
  teardown: async () => {
    // Cleanup
  },
  tests: [
    {
      name: "High-value transaction requires approval",
      policy: "financial_approval_policy",
      input: {
        action: "financial_transaction",
        orchestra: "finance",
        tenantId: "tenant-1",
        userId: "user-1",
        resource: { amount: 50000 },
      },
      expected: false, // Should require approval
    },
    // ... more tests
  ],
};

const results = await policyTestFramework.runSuite(suite);
```

### Performance Benchmarking

```typescript
const benchmark = await policyTestFramework.benchmark(
  "legal_first_policy",
  {
    action: "financial_transaction",
    orchestra: "finance",
    tenantId: "tenant-1",
    userId: "user-1",
  },
  1000 // iterations
);

console.log(`Average: ${benchmark.avg}ms`);
console.log(`P95: ${benchmark.p95}ms`);
console.log(`P99: ${benchmark.p99}ms`);
```

---

## Test Structure

### PolicyTest Interface

```typescript
interface PolicyTest {
  name: string; // Test identifier
  description?: string; // Optional description
  policy: string | PolicyManifest; // Policy name or manifest
  input: PolicyEvaluationRequest; // Input context
  expected: boolean | PolicyEvaluationResult; // Expected result
  precedence?: "legal" | "industry" | "internal"; // Expected precedence
  skip?: boolean; // Skip this test
  only?: boolean; // Run only this test
}
```

---

## Integration with CI/CD

### Example: Jest Integration

```typescript
// policy-tests.test.ts
import { policyTestFramework } from "./policy-test-framework";
import { loadTestSuites } from "./test-suites";

describe("Policy Tests", () => {
  const suites = loadTestSuites();

  for (const suite of suites) {
    describe(suite.name, () => {
      it("should pass all tests", async () => {
        const results = await policyTestFramework.runSuite(suite);
        const failed = results.filter((r) => !r.passed);

        if (failed.length > 0) {
          const messages = failed.map((r) => r.message).join("\n");
          throw new Error(`Tests failed:\n${messages}`);
        }
      });
    });
  }
});
```

---

## Best Practices

1. **Test Legal Precedence** - Always test that legal policies override industry/internal
2. **Test Edge Cases** - Test boundary conditions and error cases
3. **Performance Tests** - Benchmark critical policies regularly
4. **Regression Tests** - Add tests when fixing policy bugs
5. **Documentation** - Document test cases and expected behavior

---

## References

- **OPA Testing:** https://www.openpolicyagent.org/docs/latest/policy-testing/
- **Market Strategy:** See `MARKET-STRATEGY-REPORT.md` for prioritization
- **Feature Gap Analysis:** See `FEATURE-GAP-ANALYSIS.md` for context

---

**Last Updated:** November 29, 2025  
**Status:** ✅ Implemented - Ready for use
