# Metadata Studio MCP Tests

**Status:** 🟢 **TEST INFRASTRUCTURE READY**  
**Purpose:** Comprehensive testing for Metadata Studio MCP integration

---

## 📁 Test Structure

```
metadata/mcp/__tests__/
├── unit/                          # Unit tests
│   ├── vitest-validation.test.ts # AI-BOS Constitution Section 9.1
│   └── metadata-tools.test.ts    # Tool unit tests
├── integration/                   # Integration tests
│   └── metadata-tools.integration.test.ts
├── e2e/                          # End-to-end tests
│   └── metadata-workflow.e2e.test.ts
└── helpers/                      # Test utilities
    ├── setup.ts                  # Global test setup
    ├── test-db.ts                # Database utilities
    ├── test-mcp-client.ts        # MCP client helpers
    ├── test-fixtures.ts          # Test data fixtures
    └── e2e-helpers.ts            # E2E test helpers
```

---

## 🚀 Running Tests

### All Tests

```bash
pnpm test
```

### Unit Tests Only

```bash
pnpm test:unit
```

### Integration Tests Only

```bash
pnpm test:integration
```

### E2E Tests Only

```bash
pnpm test:e2e
```

### Watch Mode

```bash
pnpm test:watch
```

### Coverage

```bash
pnpm test:coverage
```

---

## 🧪 Test Types

### 1. Unit Tests

**Location:** `unit/`

**Purpose:** Test individual components in isolation

**Examples:**

- Tool schema validation
- Input/output validation
- Error handling
- Permission checks

**Status:** ⏳ Placeholder tests created, ready for implementation

---

### 2. Integration Tests

**Location:** `integration/`

**Purpose:** Test components with real database

**Examples:**

- Tool execution with database
- Error scenarios
- Rate limiting
- Tenant isolation

**Status:** ⏳ Placeholder tests created, ready for implementation

---

### 3. E2E Tests

**Location:** `e2e/`

**Purpose:** Test complete workflows end-to-end

**Examples:**

- Complete metadata lifecycle
- Search and discovery
- Lineage tracking
- KPI creation and validation

**Status:** ⏳ Placeholder tests created, ready for implementation

---

## 🛠️ Test Helpers

### Test Database (`test-db.ts`)

**Functions:**

- `setupTestDB()` - Set up test database
- `teardownTestDB()` - Clean up test database
- `withTestTransaction()` - Run test in transaction (auto-rollback)
- `seedTestData()` - Seed test data

**Usage:**

```typescript
import { withTestTransaction, seedTestData } from "../helpers/test-db";

await withTestTransaction(async (client) => {
  await seedTestData(tenantId);
  // Test code here
  // Transaction auto-rolls back
});
```

---

### Test MCP Client (`test-mcp-client.ts`)

**Functions:**

- `createTestMCPClient()` - Create STDIO MCP client
- `createTestMCPSSEClient()` - Create SSE MCP client
- `callMCPTool()` - Call MCP tool
- `closeMCPClient()` - Close MCP client

**Usage:**

```typescript
import {
  createTestMCPClient,
  callMCPTool,
  closeMCPClient,
} from "../helpers/test-mcp-client";

const client = await createTestMCPClient();
const result = await callMCPTool(client, "metadata_search", {
  query: "revenue",
});
await closeMCPClient(client);
```

**Status:** ⏳ Ready for use when MCP server is implemented

---

### Test Fixtures (`test-fixtures.ts`)

**Functions:**

- `createTestTenantId()` - Generate test tenant ID
- `createTestBusinessTerm()` - Create test business term
- `createTestDataContract()` - Create test data contract
- `createTestFieldDictionary()` - Create test field dictionary
- `createTestKPI()` - Create test KPI
- `createTestStandardPack()` - Create test standard pack
- `createTestSearchQuery()` - Create test search query

**Usage:**

```typescript
import { createTestBusinessTerm } from "../helpers/test-fixtures";

const term = createTestBusinessTerm({
  canonicalKey: "custom_key",
  governanceTier: "tier_1",
});
```

---

### E2E Helpers (`e2e-helpers.ts`)

**Functions:**

- `startMCPServer()` - Start MCP server for E2E tests
- `stopMCPServer()` - Stop MCP server
- `getE2EMCPClient()` - Get or create E2E MCP client
- `cleanupE2ETests()` - Cleanup E2E test resources

**Usage:**

```typescript
import {
  startMCPServer,
  getE2EMCPClient,
  cleanupE2ETests,
} from "../helpers/e2e-helpers";

beforeAll(async () => {
  await startMCPServer();
  client = await getE2EMCPClient();
});

afterAll(async () => {
  await cleanupE2ETests();
});
```

**Status:** ⏳ Ready for use when MCP server is implemented

---

## 📋 Test Checklist

### Pre-Implementation ✅

- [x] Set up test framework (Vitest)
- [x] Install MCP SDK (already installed)
- [x] Create test database setup
- [x] Create test helpers and fixtures
- [x] Create test directory structure

### Unit Tests ⏳

- [ ] Tool schema validation
- [ ] Input/output validation
- [ ] Error handling
- [ ] Permission checks
- [ ] Determinism tests

### Integration Tests ⏳

- [ ] Tool execution with real database
- [ ] Error scenarios
- [ ] Rate limiting
- [ ] Tenant isolation
- [ ] Cross-tool interactions

### E2E Tests ⏳

- [ ] Complete metadata lifecycle
- [ ] Search and discovery
- [ ] Lineage tracking
- [ ] KPI creation and validation
- [ ] Impact analysis
- [ ] Performance testing

### CI/CD ⏳

- [ ] GitHub Actions workflow
- [ ] Test coverage reporting
- [ ] Automated test execution
- [ ] Pre-publish validation

---

## 🔧 Configuration

### Vitest Config (`vitest.config.ts`)

**Features:**

- Node environment
- TypeScript support
- Coverage reporting (v8)
- Test timeout: 30s
- Setup file: `metadata/mcp/__tests__/helpers/setup.ts`

---

## 📝 Writing Tests

### Example: Unit Test

```typescript
import { describe, it, expect } from "vitest";

describe("Metadata MCP Tools", () => {
  describe("metadata_search", () => {
    it("should validate input schema", () => {
      // Test implementation
    });
  });
});
```

### Example: Integration Test

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  createTestMCPClient,
  closeMCPClient,
} from "../helpers/test-mcp-client";
import { seedTestData } from "../helpers/test-db";

describe("Metadata MCP Tools Integration", () => {
  let client: Client;

  beforeAll(async () => {
    await seedTestData();
    client = await createTestMCPClient();
  });

  afterAll(async () => {
    await closeMCPClient(client);
  });

  it("should execute metadata_search end-to-end", async () => {
    // Test implementation
  });
});
```

---

## ✅ Success Criteria

**Testing is considered complete when:**

- ✅ All unit tests pass (100% coverage for critical paths)
- ✅ All integration tests pass
- ✅ All E2E tests pass
- ✅ CI/CD pipeline validates all tests
- ✅ Performance benchmarks meet requirements
- ✅ Cross-platform compatibility verified

---

## 📚 References

1. **MCP Testing Strategy:** `MCP-TESTING-STRATEGY.md`
2. **AI-BOS MCP Engineering Constitution:** Section 9
3. **Vitest Documentation:** https://vitest.dev
4. **MCP SDK Documentation:** https://modelcontextprotocol.io

---

**Last Updated:** November 30, 2025  
**Status:** ✅ Test infrastructure ready, awaiting MCP server implementation
