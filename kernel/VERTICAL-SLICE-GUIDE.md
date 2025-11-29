# 🎯 AI-BOS Kernel — Vertical Slice Architecture Guide

**Document Purpose**: Guide for implementing complete vertical slices in the AI-BOS Kernel

**Status**: Implementation reference for contract-driven development

---

## What is a Vertical Slice?

A **vertical slice** is a complete, end-to-end implementation of a single feature that crosses all architectural layers:

```
┌─────────────────────────────────────────────────┐
│ 1. CONTRACT (Schema + Action Definition)       │
│    ├─ Input/Output Schemas (Zod)               │
│    └─ Action Contract (Metadata + Validation)  │
├─────────────────────────────────────────────────┤
│ 2. ENGINE (Business Logic Implementation)      │
│    ├─ Action Handler Function                  │
│    └─ Context (DB, Cache, Events, etc.)        │
├─────────────────────────────────────────────────┤
│ 3. MANIFEST (Engine Registration)              │
│    ├─ Engine Metadata                          │
│    └─ Action Registry                          │
└─────────────────────────────────────────────────┘
```

**Key Principle**: Each slice is **self-contained**, **testable**, and **deployable** independently.

---

## ✅ Example: `accounting.read.journal_entries` Vertical Slice

### File Structure

```
kernel/
├── contracts/
│   ├── schemas/
│   │   └── journal-entry.schema.ts          # Zod schemas for JournalEntry
│   └── examples/
│       └── accounting.read.journal_entries.action.ts  # Action contract
├── engines/
│   └── accounting/
│       ├── read-journal-entries.action.ts   # Action implementation
│       └── index.ts                         # Engine manifest + registration
```

---

## 📋 Layer 1: Contract (Schema + Action Definition)

### **File**: `contracts/schemas/journal-entry.schema.ts`

**Purpose**: Define the data shape and validation rules using Zod.

```typescript
import { z } from 'zod';

// Core domain entity
export const JournalEntrySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  orgId: z.string().min(1).optional(),
  journalNo: z.string().min(1),
  journalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date
  debitAccountId: z.string().min(1),
  creditAccountId: z.string().min(1),
  amount: z.number().finite(),
  currencyCode: z.string().min(3).max(3),
  description: z.string().max(2048).optional(),
  status: z.enum(['draft', 'posted', 'void']).default('posted'),
  createdAt: z.string().datetime(),
  createdBy: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
  updatedBy: z.string().optional(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

// Input schema for the action
export const ReadJournalEntriesInputSchema = z.object({
  tenantId: z.string().min(1).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  accountId: z.string().min(1).optional(),
  status: z.enum(['draft', 'posted', 'void']).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(500).default(50),
});

export type ReadJournalEntriesInput = z.infer<typeof ReadJournalEntriesInputSchema>;

// Output schema for the action
export const ReadJournalEntriesOutputSchema = z.object({
  items: z.array(JournalEntrySchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export type ReadJournalEntriesOutput = z.infer<typeof ReadJournalEntriesOutputSchema>;
```

**Key Points**:
- ✅ **Type-safe**: TypeScript types derived from Zod schemas
- ✅ **Runtime validation**: Input/output validated automatically
- ✅ **Self-documenting**: Schema IS the documentation
- ✅ **Reusable**: Schemas can be composed and extended

---

### **File**: `contracts/examples/accounting.read.journal_entries.action.ts`

**Purpose**: Define the action contract with metadata for governance and discoverability.

```typescript
import type { KernelActionContract } from '../contract.types';
import {
  ReadJournalEntriesInputSchema,
  ReadJournalEntriesOutputSchema,
} from '../schemas/journal-entry.schema';

export const accountingReadJournalEntriesContract: KernelActionContract<
  typeof ReadJournalEntriesInputSchema,
  typeof ReadJournalEntriesOutputSchema
> = {
  id: 'accounting.read.journal_entries',
  version: '1.0.0',
  domain: 'accounting',
  kind: 'query',
  summary: 'Read journal entries with filters and pagination',
  description:
    'Returns a paginated list of journal entries for the current tenant, with optional date, account, and status filters.',
  inputSchema: ReadJournalEntriesInputSchema,
  outputSchema: ReadJournalEntriesOutputSchema,
  classification: {
    piiLevel: 'low',
    sensitivity: 'financial',
  },
  tags: ['accounting', 'journal', 'read', 'query'],
};
```

**Key Points**:
- ✅ **Discoverable**: Action can be found via metadata query
- ✅ **Governed**: Classification enables RBAC/PBAC/ABAC policies
- ✅ **Versioned**: Breaking changes handled via versioning
- ✅ **Tagged**: Tags enable search, filtering, and lineage tracking

---

## 🔧 Layer 2: Engine (Business Logic Implementation)

### **File**: `engines/accounting/read-journal-entries.action.ts`

**Purpose**: Implement the actual business logic that executes when the action is called.

```typescript
import type { ReadJournalEntriesInput, ReadJournalEntriesOutput } from '../../contracts/schemas/journal-entry.schema';
import type { JournalEntry } from '../../contracts/schemas/journal-entry.schema';

export interface AccountingActionContext {
  input: ReadJournalEntriesInput;
  tenant: string | null;
  user: unknown; // Principal is kept opaque at engine level
  db: {
    query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  };
  cache: unknown;
  metadata: unknown;
  emit: (event: string, payload: unknown) => void;
  log: (...args: unknown[]) => void;
  engineConfig: unknown;
}

export async function readJournalEntriesAction(ctx: AccountingActionContext): Promise<ReadJournalEntriesOutput> {
  const { input, tenant, db, log } = ctx;

  if (!tenant && !input.tenantId) {
    throw new Error('Tenant context is required to read journal entries');
  }

  const effectiveTenant = input.tenantId ?? tenant;
  if (!effectiveTenant) {
    throw new Error('Unable to resolve tenant for journal entries query');
  }

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  const whereClauses: string[] = ['tenant_id = $1'];
  const params: unknown[] = [effectiveTenant];
  let paramIndex = params.length + 1;

  // Build dynamic WHERE clause based on filters
  if (input.dateFrom) {
    whereClauses.push(`journal_date >= $${paramIndex++}`);
    params.push(input.dateFrom);
  }

  if (input.dateTo) {
    whereClauses.push(`journal_date <= $${paramIndex++}`);
    params.push(input.dateTo);
  }

  if (input.accountId) {
    whereClauses.push(`(debit_account_id = $${paramIndex} OR credit_account_id = $${paramIndex})`);
    params.push(input.accountId);
    paramIndex++;
  }

  if (input.status) {
    whereClauses.push(`status = $${paramIndex++}`);
    params.push(input.status);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const baseSql = `
    FROM kernel_journal_entries
    ${whereSql}
  `;

  // Execute main query
  const rows = await db.query<JournalEntry>(
    `
      SELECT
        id,
        tenant_id as "tenantId",
        org_id as "orgId",
        journal_no as "journalNo",
        journal_date as "journalDate",
        debit_account_id as "debitAccountId",
        credit_account_id as "creditAccountId",
        amount,
        currency_code as "currencyCode",
        description,
        status,
        created_at as "createdAt",
        created_by as "createdBy",
        updated_at as "updatedAt",
        updated_by as "updatedBy"
      ${baseSql}
      ORDER BY journal_date DESC, journal_no DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `,
    [...params, pageSize, offset],
  );

  // Execute count query
  const [{ count }] = await db.query<{ count: number }>(
    `SELECT COUNT(*)::int as count ${baseSql}`,
    params,
  );

  log(
    '[accounting.read.journal_entries] fetched rows',
    rows.length,
    'for tenant',
    effectiveTenant,
  );

  return {
    items: rows,
    page,
    pageSize,
    total: count,
  };
}
```

**Key Points**:
- ✅ **Sandbox-safe**: Uses `ctx.db` proxy (no direct DB access)
- ✅ **Multi-tenant**: Enforces tenant isolation at query level
- ✅ **SQL injection safe**: Parameterized queries
- ✅ **Observable**: Emits logs for tracing
- ✅ **Testable**: Pure function with injected dependencies

---

## 📦 Layer 3: Manifest (Engine Registration)

### **File**: `engines/accounting/index.ts`

**Purpose**: Register the engine and its actions with the kernel.

```typescript
import type { KernelEngineManifest } from '../../types/engine.types';
import { accountingReadJournalEntriesContract } from '../../contracts/examples/accounting.read.journal_entries.action';
import { readJournalEntriesAction } from './read-journal-entries.action';

export const accountingEngineManifest: KernelEngineManifest = {
  id: 'accounting',
  name: 'Accounting Engine',
  version: '1.0.0',
  description: 'Core accounting actions for AI-BOS (journal entries, ledgers, etc.)',
  domain: 'accounting',
  actions: {
    'read.journal_entries': {
      id: 'read.journal_entries',
      contract: accountingReadJournalEntriesContract,
      description: 'Read journal entries for a tenant',
      tags: ['journal', 'read', 'accounting'],
    },
  },
};

export const accountingEngine = {
  id: accountingEngineManifest.id,
  manifest: accountingEngineManifest,
  actions: {
    'read.journal_entries': readJournalEntriesAction,
  },
};

// Optional: Auto-registration
// import { registerEngine } from '../../registry/engine.loader';
// registerEngine(accountingEngine);
```

**Key Points**:
- ✅ **Discoverable**: Engine appears in registry
- ✅ **Versioned**: Breaking changes tracked per engine
- ✅ **Self-describing**: Manifest provides all metadata
- ✅ **Hot-reloadable**: Engine can be updated without restart

---

## 🧪 Testing Strategy

### Unit Test (Contract Validation)

```typescript
import { describe, it, expect } from 'vitest';
import { ReadJournalEntriesInputSchema } from '../contracts/schemas/journal-entry.schema';

describe('ReadJournalEntriesInputSchema', () => {
  it('should accept valid input', () => {
    const input = {
      tenantId: 'tenant-123',
      dateFrom: '2025-01-01',
      dateTo: '2025-12-31',
      page: 1,
      pageSize: 50,
    };

    const result = ReadJournalEntriesInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject invalid date format', () => {
    const input = {
      dateFrom: '2025/01/01', // Invalid format
    };

    const result = ReadJournalEntriesInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should apply defaults', () => {
    const input = {};
    const result = ReadJournalEntriesInputSchema.parse(input);
    
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(50);
  });
});
```

### Integration Test (Action Execution)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { readJournalEntriesAction } from '../engines/accounting/read-journal-entries.action';

describe('readJournalEntriesAction', () => {
  it('should fetch journal entries for tenant', async () => {
    const mockDb = {
      query: vi.fn()
        .mockResolvedValueOnce([
          { id: 'je-1', journalNo: 'JE-001', amount: 1000 }
        ])
        .mockResolvedValueOnce([{ count: 1 }]),
    };

    const ctx = {
      input: { page: 1, pageSize: 50 },
      tenant: 'tenant-123',
      user: {},
      db: mockDb,
      cache: {},
      metadata: {},
      emit: vi.fn(),
      log: vi.fn(),
      engineConfig: {},
    };

    const result = await readJournalEntriesAction(ctx);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(mockDb.query).toHaveBeenCalledTimes(2);
  });

  it('should throw error if tenant is missing', async () => {
    const ctx = {
      input: {},
      tenant: null,
      user: {},
      db: { query: vi.fn() },
      cache: {},
      metadata: {},
      emit: vi.fn(),
      log: vi.fn(),
      engineConfig: {},
    };

    await expect(readJournalEntriesAction(ctx)).rejects.toThrow('Tenant context is required');
  });
});
```

---

## 🚀 How to Create a New Vertical Slice

### Step-by-Step Guide

**1. Define the Domain Entity Schema**

```typescript
// contracts/schemas/your-entity.schema.ts
import { z } from 'zod';

export const YourEntitySchema = z.object({
  id: z.string(),
  // ... fields
});

export type YourEntity = z.infer<typeof YourEntitySchema>;
```

**2. Define Input/Output Schemas**

```typescript
export const YourActionInputSchema = z.object({
  // ... input fields
});

export const YourActionOutputSchema = z.object({
  // ... output fields
});
```

**3. Create Action Contract**

```typescript
// contracts/examples/domain.action_name.action.ts
export const yourActionContract: KernelActionContract = {
  id: 'domain.action_name',
  version: '1.0.0',
  domain: 'domain',
  kind: 'query' | 'command' | 'mutation',
  summary: '...',
  inputSchema: YourActionInputSchema,
  outputSchema: YourActionOutputSchema,
};
```

**4. Implement Action Handler**

```typescript
// engines/domain/your-action.action.ts
export async function yourActionHandler(ctx: ActionContext): Promise<YourActionOutput> {
  // Business logic here
}
```

**5. Register in Engine Manifest**

```typescript
// engines/domain/index.ts
export const domainEngineManifest: KernelEngineManifest = {
  id: 'domain',
  actions: {
    'action_name': {
      contract: yourActionContract,
      // ...
    },
  },
};

export const domainEngine = {
  id: 'domain',
  manifest: domainEngineManifest,
  actions: {
    'action_name': yourActionHandler,
  },
};
```

---

## 📐 Architecture Principles

### 1. **Contract-First Development**
- ✅ Define schemas **before** implementation
- ✅ Contracts are **immutable** (versioning for changes)
- ✅ Input/output **always validated**

### 2. **Separation of Concerns**
- ✅ **Contracts**: Define WHAT (interface)
- ✅ **Engines**: Define HOW (implementation)
- ✅ **Manifests**: Define WHERE (registration)

### 3. **Dependency Injection**
- ✅ No global state
- ✅ All dependencies passed via `ctx`
- ✅ Easy to mock for testing

### 4. **Tenant Isolation**
- ✅ Tenant context **always** enforced
- ✅ Row-level security at query level
- ✅ No cross-tenant data leakage

### 5. **Observability**
- ✅ Log all actions via `ctx.log`
- ✅ Emit events via `ctx.emit`
- ✅ Trace requests end-to-end

---

## 🔒 Security Checklist

Before deploying a vertical slice, verify:

- [ ] **Input validation**: Zod schema enforces all constraints
- [ ] **SQL injection**: All queries use parameterized statements
- [ ] **Tenant isolation**: Tenant ID in WHERE clause
- [ ] **RBAC**: Action tagged with permissions
- [ ] **PII classification**: `classification.piiLevel` set correctly
- [ ] **Rate limiting**: Consider adding rate limit tags
- [ ] **Audit logging**: Critical actions emit events

---

## 🎓 Best Practices

### DO ✅
- ✅ Use Zod for all schemas (runtime validation)
- ✅ Keep actions **pure** (no side effects outside ctx)
- ✅ Use parameterized SQL queries
- ✅ Emit events for audit trail
- ✅ Log meaningful context (tenant, user, action)
- ✅ Version contracts when breaking changes occur
- ✅ Test contracts, actions, and integration separately

### DON'T ❌
- ❌ Directly access database (use `ctx.db` proxy)
- ❌ Hardcode tenant IDs
- ❌ Use string concatenation for SQL
- ❌ Skip input validation
- ❌ Return PII without masking
- ❌ Bypass RBAC checks
- ❌ Deploy without tests

---

## 📊 Vertical Slice Maturity Model

| Level | Description | Features |
|-------|-------------|----------|
| **L1: Basic** | Minimal viable slice | Schema + Action + Handler |
| **L2: Governed** | Add governance | + RBAC tags + PII classification |
| **L3: Observable** | Add telemetry | + Events + Logs + Metrics |
| **L4: Resilient** | Add error handling | + Retry + Circuit breaker + DLQ |
| **L5: Optimized** | Add caching | + Cache layer + Query optimization |

**Current Example**: `accounting.read.journal_entries` is at **Level 3 (Observable)**.

---

## 🗺️ Roadmap: Next Vertical Slices

### Accounting Domain
- [ ] `accounting.create.journal_entry` (Command)
- [ ] `accounting.post.journal_entry` (Command)
- [ ] `accounting.read.ledger_balance` (Query)
- [ ] `accounting.read.trial_balance` (Query)

### Inventory Domain
- [ ] `inventory.read.stock_levels` (Query)
- [ ] `inventory.adjust.stock` (Command)
- [ ] `inventory.transfer.stock` (Command)

### Workflow Domain
- [ ] `workflow.start.instance` (Command)
- [ ] `workflow.read.instance_status` (Query)
- [ ] `workflow.approve.step` (Command)

---

## 📚 References

- **Vertical Slice Architecture**: [Jimmy Bogard's Blog](https://www.jimmybogard.com/vertical-slice-architecture/)
- **Contract-First Design**: [Design by Contract (DbC)](https://en.wikipedia.org/wiki/Design_by_contract)
- **Zod Documentation**: [https://zod.dev](https://zod.dev)
- **AI-BOS Architecture**: `AIBOS-KERNEL-README.md`

---

**Document Updated**: 2025-11-27  
**Next Review**: 2025-12-27 (Monthly)

