# 🧾 GRCD — UI Package Testing Infrastructure — v1.0.0

**Version:** 1.0.0  
**Status:** Active (MCP-Governed Template & Reference)  
**Last Updated:** 2025-01-27  
**Owner:** Frontend Team, QA Team, MCP Governance Team

> **Purpose of this GRCD**
>
> This GRCD (Governance, Risk, Compliance & Design) document is the **single source of truth** for the AI-BOS UI package testing infrastructure. It establishes comprehensive testing strategies, patterns, and governance to ensure **95% test coverage**, **automated regression detection**, and **production-ready quality assurance** through the Model Context Protocol (MCP).
>
> **Key Anti-Drift Mechanisms:**
>
> - Test coverage enforcement (95% minimum requirement)
> - Testing pattern standardization (Section 3)
> - Directory structure enforcement (Section 4)
> - Dependency compatibility matrix (Section 5)
> - MCP governance rules (Section 6)
> - CI/CD integration (Section 7)

---

## 1. Purpose & Identity

**Component Name:** `@aibos/ui` Testing Infrastructure

**Domain:** `Testing & Quality Assurance` (Test Framework with MCP Governance)

### 1.1 Purpose

**Purpose Statement:**

> The testing infrastructure is the **quality assurance brain** of the AI-BOS UI package, serving as the constitutional authority that ensures all components, design tokens, and themes are validated through automated testing. It enforces test coverage requirements (95% minimum), accessibility compliance (WCAG AA/AAA), component behavior validation, and regression prevention through the Model Context Protocol (MCP), ensuring zero drift from quality standards and organizational requirements.

**Philosophical Foundation:**

The testing infrastructure embodies the principle that **quality should be automated, not manual**. By establishing comprehensive testing with MCP governance, we create a system where:

1. **Tests are First-Class Citizens:** Every component must have tests before merging.
2. **Coverage is Enforced:** 95% minimum coverage requirement prevents gaps.
3. **Patterns are Standardized:** Consistent test patterns across all components.
4. **Regression is Prevented:** Automated tests catch breaking changes immediately.
5. **Accessibility is Validated:** Automated a11y testing ensures WCAG compliance.

### 1.2 Identity

- **Role:** `Quality Assurance Authority & MCP Test Governance Enforcer` – The testing infrastructure serves as the central test framework, coverage enforcer, and governance validator for all UI components, with MCP as the universal protocol for test validation.

- **Scope:**
  - All component tests (unit, integration, E2E).
  - Test utilities and helpers (render helpers, theme providers, mocks).
  - Coverage reporting and enforcement (95% minimum).
  - Accessibility testing (axe-core, jest-axe).
  - Visual regression testing (Chromatic/Percy).
  - CI/CD test integration.
  - MCP test validation and governance.

- **Boundaries:**
  - Does **NOT** execute business logic tests (app-level).
  - Does **NOT** manage application state tests.
  - Does **NOT** handle data fetching tests.
  - Does **NOT** test external APIs directly.
  - Does **NOT** bypass MCP validation for test patterns.

- **Non-Responsibility:**
  - `MUST NOT` test application business logic.
  - `MUST NOT` test external API integrations.
  - `MUST NOT` test data fetching logic.
  - `MUST NOT` bypass test coverage requirements.
  - `MUST NOT` skip accessibility testing.

### 1.3 Non-Negotiables (Constitutional Principles)

> These principles are **non-negotiable** and form the constitutional foundation of the testing infrastructure. They are testable and enforceable through automated checks.

**Constitutional Principles:**

- `MUST` achieve 95% test coverage (lines, functions, branches, statements).
- `MUST` write tests for all new components before merging.
- `MUST` run tests in CI/CD pipeline before deployment.
- `MUST` validate accessibility (WCAG 2.2 AA/AAA) in tests.
- `MUST` use standardized test patterns (Section 3).
- `MUST` enforce test coverage thresholds in CI.
- `MUST NOT` merge code with failing tests.
- `MUST NOT` merge code below coverage threshold.
- `MUST NOT` skip accessibility tests.
- `MUST NOT` use `any` types in test code (TypeScript strict mode).

**MCP Governance Principles:**

- `MUST` validate all test patterns against MCP rules.
- `MUST` enforce test coverage via MCP validation.
- `MUST` audit all test violations (missing tests, low coverage).
- `MUST` require MCP validation for all new test patterns.
- `MUST` support MCP test server integration.

---

## 2. Requirements

### 2.1 Functional Requirements

| ID   | Requirement                                                          | Priority (MUST/SHOULD/MAY) | Status (✅/⚠️/❌/⚪) | Notes                           |
| ---- | -------------------------------------------------------------------- | -------------------------- | -------------------- | ------------------------------- |
| F-1  | Testing infrastructure MUST use Vitest as test framework             | MUST                       | ❌                   | **NOT IMPLEMENTED**             |
| F-2  | Testing infrastructure MUST achieve 95% coverage minimum             | MUST                       | ❌                   | **NOT IMPLEMENTED: 0% current** |
| F-3  | Testing infrastructure MUST provide test utilities (render helpers)  | MUST                       | ❌                   | **NOT IMPLEMENTED**             |
| F-4  | Testing infrastructure MUST support React Testing Library            | MUST                       | ❌                   | **NOT IMPLEMENTED**             |
| F-5  | Testing infrastructure MUST support accessibility testing (axe-core) | MUST                       | ❌                   | **NOT IMPLEMENTED**             |
| F-6  | Testing infrastructure MUST support visual regression testing        | SHOULD                     | ❌                   | **NOT IMPLEMENTED**             |
| F-7  | Testing infrastructure MUST run tests in CI/CD pipeline              | MUST                       | ❌                   | **NOT IMPLEMENTED**             |
| F-8  | Testing infrastructure MUST enforce coverage thresholds in CI        | MUST                       | ❌                   | **NOT IMPLEMENTED**             |
| F-9  | Testing infrastructure MUST validate test patterns via MCP           | MUST                       | ⚪                   | MCP validation rules needed     |
| F-10 | Testing infrastructure SHOULD support E2E testing (Playwright)       | SHOULD                     | ❌                   | **NOT IMPLEMENTED**             |
| F-11 | Testing infrastructure SHOULD support snapshot testing               | SHOULD                     | ❌                   | **NOT IMPLEMENTED**             |
| F-12 | Testing infrastructure SHOULD provide theme provider mocks           | SHOULD                     | ❌                   | **NOT IMPLEMENTED**             |
| F-13 | Testing infrastructure MAY support visual regression (Chromatic)     | MAY                        | ❌                   | **NOT IMPLEMENTED**             |

> **Critical Gaps:**
>
> - F-1, F-2, F-3, F-4: No testing infrastructure exists (0% coverage)
> - F-5: No accessibility testing
> - F-7, F-8: No CI/CD integration

### 2.2 Non-Functional Requirements

| ID   | Requirement             | Target                                        | Measurement Source             | Status |
| ---- | ----------------------- | --------------------------------------------- | ------------------------------ | ------ |
| NF-1 | Test coverage           | ≥95% (lines, functions, branches, statements) | Coverage reports (v8 provider) | ❌     |
| NF-2 | Test execution time     | <5 minutes for full suite                     | Vitest timing metrics          | ⚪     |
| NF-3 | Test reliability        | >99% pass rate                                | CI/CD test results             | ⚪     |
| NF-4 | Accessibility score     | WCAG 2.2 AA/AAA compliant                     | axe-core, jest-axe             | ❌     |
| NF-5 | Type safety             | 100% TypeScript strict mode in tests          | TypeScript compiler            | ⚪     |
| NF-6 | Test pattern compliance | 100% tests follow standardized patterns       | MCP validation pipeline        | ❌     |
| NF-7 | CI/CD integration       | 100% tests run before merge                   | CI/CD pipeline status          | ❌     |
| NF-8 | Coverage enforcement    | 100% coverage threshold enforcement           | CI/CD coverage checks          | ❌     |

### 2.3 Compliance Requirements

| ID  | Requirement                                                      | Standard(s)                              | Evidence (what proves it)       | Status |
| --- | ---------------------------------------------------------------- | ---------------------------------------- | ------------------------------- | ------ |
| C-1 | Testing infrastructure MUST enforce 95% coverage requirement     | Project Requirement (Memory ID: 8326712) | Coverage reports, CI checks     | ❌     |
| C-2 | Testing infrastructure MUST validate WCAG 2.2 AA/AAA compliance  | WCAG 2.2, ISO 42001                      | axe-core test results           | ❌     |
| C-3 | Testing infrastructure MUST support automated regression testing | Quality Assurance                        | Test execution reports          | ❌     |
| C-4 | Testing infrastructure MUST support CI/CD integration            | DevOps Best Practices                    | CI/CD pipeline configuration    | ❌     |
| C-5 | Testing infrastructure MUST enforce test coverage in CI          | Quality Assurance                        | CI/CD coverage threshold checks | ❌     |
| C-6 | Testing infrastructure MUST support accessibility testing        | WCAG 2.2, ISO 42001                      | Accessibility test results      | ❌     |
| C-7 | Testing infrastructure MUST validate test patterns via MCP       | ISO 42001, AI Governance                 | MCP validation logs             | ⚪     |

---

## 3. Architecture & Design Patterns

### 3.1 Testing Architecture

**Pattern(s):** `Three-Tier Testing Strategy, Test Utilities Layer, MCP-Governed Test Patterns`

**Justification:**

- **Three-Tier Testing Strategy:** Unit tests (component behavior), Integration tests (component interactions), E2E tests (user workflows). Each tier serves a specific purpose and runs at different frequencies.
- **Test Utilities Layer:** Centralized test utilities (render helpers, theme providers, mocks) ensure consistency and reduce duplication across tests.
- **MCP-Governed Test Patterns:** MCP validation ensures all tests follow standardized patterns and meet coverage requirements.

**Testing Architecture Diagram:**

```text
┌─────────────────────────────────────────────────────────┐
│                 TEST EXECUTION LAYER                   │
├─────────────────────────────────────────────────────────┤
│  Unit Tests  │  Integration Tests  │  E2E Tests      │
│  (Vitest)    │  (Vitest + RTL)     │  (Playwright)    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 TEST UTILITIES LAYER                   │
├─────────────────────────────────────────────────────────┤
│  Render Helpers  │  Theme Providers  │  Mocks        │
│  Test Fixtures   │  Accessibility    │  Snapshot      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 MCP VALIDATION LAYER                   │
├─────────────────────────────────────────────────────────┤
│  Test Pattern Validator  │  Coverage Enforcer         │
│  Accessibility Validator │  MCP Test Server          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Test Organization Patterns

**Directory Structure:**

```text
packages/ui/
├── src/
│   └── components/
│       └── shared/
│           └── primitives/
│               ├── button.tsx
│               └── button.test.tsx          # Co-located tests
├── src/
│   └── __tests__/                          # Integration tests
│       └── components/
│           └── button.integration.test.tsx
├── tests/
│   ├── e2e/                                # E2E tests
│   │   └── button.e2e.test.ts
│   ├── utils/                              # Test utilities
│   │   ├── render-helpers.tsx
│   │   ├── theme-providers.tsx
│   │   └── mocks/
│   │       ├── theme.mock.ts
│   │       └── mcp.mock.ts
│   └── fixtures/                           # Test fixtures
│       └── components/
│           └── button.fixtures.ts
└── vitest.config.ts                        # Vitest configuration
```

**Test File Naming:**

- Unit tests: `*.test.tsx` or `*.test.ts` (co-located with components)
- Integration tests: `*.integration.test.tsx`
- E2E tests: `*.e2e.test.ts`
- Test utilities: `*.test-utils.tsx` or `*.test-helpers.ts`
- Test fixtures: `*.fixtures.ts`

### 3.3 Test Writing Patterns

#### 3.3.1 Component Test Pattern

```tsx
// ✅ CORRECT - Component test pattern
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./button";
import { renderWithTheme } from "../../../tests/utils/render-helpers";

expect.extend(toHaveNoViolations);

describe("Button", () => {
  it("should render button with text", () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  it("should be accessible", async () => {
    const { container } = renderWithTheme(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
    screen.getByRole("button").click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### 3.3.2 Theme Provider Test Pattern

```tsx
// ✅ CORRECT - Theme provider test pattern
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { Button } from "./button";

describe("Button with Theme", () => {
  it("should apply theme colors", () => {
    render(
      <ThemeProvider theme="dark">
        <Button>Click me</Button>
      </ThemeProvider>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-bg-elevated"); // Theme-controlled class
  });
});
```

#### 3.3.3 Accessibility Test Pattern

```tsx
// ✅ CORRECT - Accessibility test pattern
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./button";
import { renderWithTheme } from "../../../tests/utils/render-helpers";

expect.extend(toHaveNoViolations);

describe("Button Accessibility", () => {
  it("should meet WCAG AA standards", async () => {
    const { container } = renderWithTheme(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have proper ARIA attributes", () => {
    renderWithTheme(<Button aria-label="Submit form">Submit</Button>);
    const button = screen.getByRole("button", { name: /submit form/i });
    expect(button).toHaveAttribute("aria-label", "Submit form");
  });
});
```

#### 3.3.4 Snapshot Test Pattern

```tsx
// ✅ CORRECT - Snapshot test pattern
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "./button";
import { renderWithTheme } from "../../../tests/utils/render-helpers";

describe("Button Snapshots", () => {
  it("should match snapshot", () => {
    const { container } = renderWithTheme(<Button>Click me</Button>);
    expect(container).toMatchSnapshot();
  });
});
```

### 3.4 Test Utilities Patterns

#### 3.4.1 Render Helper Pattern

```tsx
// ✅ CORRECT - Render helper with theme provider
import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "../../providers/ThemeProvider";

export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
```

#### 3.4.2 Mock Theme Provider Pattern

```tsx
// ✅ CORRECT - Mock theme provider for testing
import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";

export function renderWithMockTheme(
  ui: ReactElement,
  theme: "light" | "dark" | "wcag-aa" | "wcag-aaa" = "light",
  options?: Omit<RenderOptions, "wrapper">
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <div data-theme={theme} className="theme-wrapper">
        {children}
      </div>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
```

---

## 4. Directory & File Layout (Anti-Drift for Vibe Coding)

### 4.1 Canonical Directory Tree

```text
packages/ui/
├── src/
│   └── components/
│       └── {layer}/
│           └── {component}/
│               ├── {component}.tsx
│               └── {component}.test.tsx        # Co-located unit tests
├── src/
│   └── __tests__/                              # Integration tests
│       └── components/
│           └── {component}.integration.test.tsx
├── tests/
│   ├── e2e/                                    # E2E tests
│   │   └── {component}.e2e.test.ts
│   ├── utils/                                  # Test utilities
│   │   ├── render-helpers.tsx
│   │   ├── theme-providers.tsx
│   │   ├── accessibility-helpers.ts
│   │   └── mocks/
│   │       ├── theme.mock.ts
│   │       ├── mcp.mock.ts
│   │       └── components.mock.ts
│   ├── fixtures/                               # Test fixtures
│   │   └── components/
│   │       └── {component}.fixtures.ts
│   └── setup.ts                                # Global test setup
├── vitest.config.ts                            # Vitest configuration
└── coverage/                                    # Coverage reports (generated)
    ├── index.html
    └── coverage-summary.json
```

### 4.2 Directory Norms & Enforcement

- **Requirement:** Tests MUST follow this directory layout.
- **Validator:** `dir-lint` tool at `scripts/dir-lint.ts` (to be implemented).
- **Conformance Test:** `T-DIR-1`: Invalid test directory structure MUST fail CI.

**AI Agent Rules:**

1. Check this GRCD section for canonical test location.
2. Create test files ONLY in allowed directories (see Section 4.1).
3. Co-locate unit tests with components (`*.test.tsx`).
4. Place integration tests in `src/__tests__/`.
5. Place E2E tests in `tests/e2e/`.
6. Use kebab-case naming conventions for test files.

### 4.3 File Naming Conventions

- **Test files:** `*.test.tsx` or `*.test.ts` (unit tests), `*.integration.test.tsx` (integration tests), `*.e2e.test.ts` (E2E tests).
- **Test utilities:** `*.test-utils.tsx` or `*.test-helpers.ts`.
- **Test fixtures:** `*.fixtures.ts`.
- **Test mocks:** `*.mock.ts` (in `tests/utils/mocks/`).

---

## 5. Dependencies & Compatibility Matrix

### 5.1 Dependency Policy

- **Lockfile Format:** `pnpm-lock.yaml`.
- **Source of Truth:** `/packages/ui/package.json`, `/pnpm-lock.yaml` (root level).
- **Update Policy:** Dependencies updated via PR with compatibility matrix verification. Breaking changes require GRCD update and compatibility matrix review.

### 5.2 Compatibility Matrix

| Library                       | Allowed Version Range | Tested With               | Status | Notes                       | Blocked Versions        |
| ----------------------------- | --------------------- | ------------------------- | ------ | --------------------------- | ----------------------- |
| `vitest`                      | `^2.x`                | React 18+, TypeScript 5.x | ⚪     | Test framework              | `^1.x` (deprecated)     |
| `@testing-library/react`      | `^16.x`               | React 18+                 | ⚪     | React component testing     | `^15.x` (React 17 only) |
| `@testing-library/jest-dom`   | `^6.x`                | Vitest 2.x                | ⚪     | DOM matchers                | `^5.x` (Jest only)      |
| `@testing-library/user-event` | `^14.x`               | React 18+                 | ⚪     | User interaction simulation | `^13.x` (deprecated)    |
| `jest-axe`                    | `^8.x`                | axe-core 4.x              | ⚪     | Accessibility testing       | `^7.x` (axe-core 3.x)   |
| `@playwright/test`            | `^1.x`                | Node 18+                  | ⚪     | E2E testing (optional)      | `^2.x` (not tested)     |
| `@vitest/ui`                  | `^2.x`                | Vitest 2.x                | ⚪     | Test UI (optional)          | `^1.x` (deprecated)     |
| `@vitest/coverage-v8`         | `^2.x`                | Vitest 2.x                | ⚪     | Coverage provider           | `^1.x` (deprecated)     |

### 5.3 Dependency Groups

**Core Testing:**

- `vitest` – Test framework.
- `@testing-library/react` – React component testing.
- `@testing-library/jest-dom` – DOM matchers.
- `@testing-library/user-event` – User interaction simulation.

**Accessibility Testing:**

- `jest-axe` – Accessibility testing.
- `axe-core` – Accessibility engine (peer dependency).

**E2E Testing (Optional):**

- `@playwright/test` – E2E testing framework.

**Coverage:**

- `@vitest/coverage-v8` – Coverage provider.

**Test UI (Optional):**

- `@vitest/ui` – Test UI for development.

---

## 6. Master Control Prompt (MCP) Profile

### 6.1 MCP Location

- **File:** `/packages/ui/mcp/ui-testing.mcp.json`
- **Hash Recorded In:** Audit log under `mcpHash` field
- **Version:** `1.0.0`
- **Last Updated:** `2025-01-27`

### 6.2 MCP Schema

```json
{
  "component": "ui-testing",
  "version": "1.0.0",
  "intent": "Generate test code following GRCD-TESTING.md specifications, ensuring 95% coverage, accessibility compliance, and standardized test patterns",
  "constraints": [
    "MUST follow GRCD structure from packages/ui/GRCD-TESTING.md",
    "MUST save test files only under allowed directories (see GRCD Section 4)",
    "MUST respect dependency matrix (see GRCD Section 5)",
    "MUST use TypeScript with strict mode",
    "MUST use kebab-case for test file names",
    "MUST NOT create test files in root directory",
    "MUST NOT introduce dependencies not in compatibility matrix",
    "MUST achieve 95% test coverage minimum",
    "MUST include accessibility tests (axe-core)",
    "MUST follow standardized test patterns (see GRCD Section 3.3)",
    "MUST use test utilities (render helpers, theme providers)",
    "MUST NOT use 'any' types in test code"
  ],
  "input_sources": [
    "GRCD docs (packages/ui/GRCD-TESTING.md)",
    "codebase (packages/ui/src/)",
    "existing test patterns in packages/ui/tests/",
    "ARCHITECTURE-ANALYSIS.md (testing gap analysis)"
  ],
  "output_targets": {
    "tests": "packages/ui/tests/",
    "test_utils": "packages/ui/tests/utils/",
    "fixtures": "packages/ui/tests/fixtures/",
    "coverage": "packages/ui/coverage/"
  },
  "style": {
    "normative_language": true,
    "anti_drift": true,
    "type_safety": "strict",
    "test_patterns": "standardized",
    "coverage_enforcement": true,
    "accessibility_testing": true
  },
  "validation": {
    "pre_commit": [
      "TypeScript type check",
      "Test execution (all tests must pass)",
      "Coverage threshold check (95% minimum)",
      "Accessibility test execution",
      "Test pattern validation"
    ]
  },
  "mcp_governance": {
    "test_pattern_validation": true,
    "coverage_enforcement": true,
    "accessibility_validation": true,
    "test_utility_usage": true
  }
}
```

### 6.3 MCP Usage Instructions

1. **Load MCP:** Read `/packages/ui/mcp/ui-testing.mcp.json` at session start.
2. **Validate MCP:** Check hash matches audit log (if available).
3. **Load GRCD:** Read `packages/ui/GRCD-TESTING.md` for canonical specifications.
4. **Check Directory:** Verify test file locations against GRCD Section 4.
5. **Check Dependencies:** Verify all dependencies against GRCD Section 5.
6. **Generate Tests:** Follow MCP constraints and GRCD requirements.
7. **Validate Output:** Run pre-commit checks from MCP validation section.

### 6.4 MCP Normative Requirements

- `T-MCP-1`: All test code generation sessions MUST start from a valid MCP seed (`/packages/ui/mcp/ui-testing.mcp.json`).
- `T-MCP-2`: MCP changes MUST be audited and hash-logged in audit system.
- `T-MCP-3`: MCP violation events MUST trigger alerts (e.g., test file created in wrong directory, coverage below threshold, missing accessibility tests).
- `T-MCP-4`: MCP MUST reference the current GRCD version for testing (**v1.0.0**).
- `T-MCP-5`: MCP MUST NOT be altered by autonomous AI agents – human intent is the supreme authority.
- `T-MCP-6`: All test patterns MUST validate against canonical test pattern schema.
- `T-MCP-7`: All test coverage MUST meet 95% minimum threshold.

---

## 7. Test Coverage Requirements

### 7.1 Coverage Thresholds

**Minimum Coverage Requirements:**

- **Lines:** 95%
- **Functions:** 95%
- **Branches:** 95%
- **Statements:** 95%

**Coverage Configuration:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
      exclude: [
        "node_modules/",
        "tests/",
        "**/*.test.tsx",
        "**/*.test.ts",
        "**/*.config.ts",
        "**/coverage/",
      ],
    },
  },
});
```

### 7.2 Coverage Enforcement

**CI/CD Integration:**

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: pnpm test:coverage

- name: Check coverage threshold
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 95" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 95% threshold"
      exit 1
    fi
```

---

## 8. Accessibility Testing Requirements

### 8.1 Accessibility Test Patterns

**Required Tests:**

- All components MUST have accessibility tests using `jest-axe`.
- All interactive components MUST have keyboard navigation tests.
- All form components MUST have ARIA label tests.
- All components MUST meet WCAG 2.2 AA standards (AAA preferred).

**Accessibility Test Example:**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { Button } from "./button";
import { renderWithTheme } from "../../../tests/utils/render-helpers";

expect.extend(toHaveNoViolations);

describe("Button Accessibility", () => {
  it("should meet WCAG AA standards", async () => {
    const { container } = renderWithTheme(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

---

## 9. CI/CD Integration

### 9.1 Test Execution in CI

**Required CI Steps:**

1. Install dependencies
2. Run type checking
3. Run linting
4. Run tests with coverage
5. Check coverage threshold (95% minimum)
6. Run accessibility tests
7. Generate coverage report

**Example CI Configuration:**

```yaml
# .github/workflows/test.yml
name: Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: pnpm install --frozen-lockfile
      - run: pnpm run type-check
      - run: pnpm run lint
      - run: pnpm run test:coverage
      - run: pnpm run test:a11y
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 10. Success Metrics

### 10.1 Testing Metrics

**Targets:**

- ✅ Test Coverage: 95% (lines, functions, branches, statements)
- ✅ Test Execution Time: <5 minutes
- ✅ Test Reliability: >99% pass rate
- ✅ Accessibility Score: WCAG 2.2 AA/AAA

**Current:** 0% → **Target:** 95%

---

## 11. Implementation Roadmap

### Phase 1: Infrastructure Setup (Week 1)

1. Install Vitest and dependencies
2. Configure `vitest.config.ts`
3. Create test utilities (render helpers, theme providers)
4. Set up test directory structure
5. Create MCP seed file (`ui-testing.mcp.json`)

### Phase 2: Component Testing (Weeks 2-3)

1. Write tests for primitives (Button, Input, etc.)
2. Write tests for compositions (Dialog, Popover, etc.)
3. Write tests for typography components
4. Achieve 50% coverage on critical components

### Phase 3: Coverage & Quality (Week 4)

1. Achieve 95% coverage target
2. Add accessibility tests for all components
3. Set up CI/CD integration
4. Generate coverage reports

---

## 12. Conclusion

### Current State Assessment

**Testing Infrastructure:** ⭐ (1/10) - **CRITICAL GAP**

**Key Takeaways:**

1. **🔴 Testing is Critical:** Zero coverage is production blocker
2. **✅ Architecture is Ready:** GRCD provides clear testing patterns
3. **🟡 Implementation Needed:** Infrastructure setup required (2-3 weeks)

### Next Steps

1. **Immediate:** Set up Vitest infrastructure (Week 1)
2. **Short-term:** Achieve 95% coverage (Weeks 2-4)
3. **Medium-term:** Add E2E and visual regression testing

---

**Report Status:** ✅ **GRCD DOCUMENTATION COMPLETE**  
**Recommendation:** **PROCEED WITH IMPLEMENTATION** - Testing infrastructure is critical for production readiness
