# 🚀 AI-BOS Kernel — Integration Guide

**Document Purpose**: Step-by-step guide to integrate and test the kernel actions

**Status**: Implementation guide for vertical slices

---

## ✅ Prerequisites Completed

The following files have been created:

1. ✅ `contracts/contract.types.ts` — Type definitions for `KernelActionContract`
2. ✅ `types/engine.types.ts` — Type definitions for engines, actions, and context
3. ✅ `registry/engine.loader.ts` — Engine registry for discovery and routing
4. ✅ `dispatcher/action.dispatcher.ts` — Action dispatcher (validates + executes)
5. ✅ `routes/actions.route.ts` — HTTP routes (Hono-based)
6. ✅ `contracts/schemas/journal-entry.schema.ts` — Journal entry schemas
7. ✅ `contracts/examples/accounting.read.journal_entries.action.ts` — Action contract
8. ✅ `engines/accounting/read-journal-entries.action.ts` — Action implementation
9. ✅ `engines/accounting/index.ts` — Accounting engine manifest + auto-registration

---

## 🔧 Step 1: Verify File Structure

Your project structure should now look like this:

```
kernel/
├── contracts/
│   ├── contract.types.ts                     # KernelActionContract interface
│   ├── schemas/
│   │   └── journal-entry.schema.ts           # JournalEntry schemas
│   └── examples/
│       └── accounting.read.journal_entries.action.ts
├── types/
│   └── engine.types.ts                       # KernelEngine, ActionContext, etc.
├── registry/
│   └── engine.loader.ts                      # Engine registry
├── dispatcher/
│   └── action.dispatcher.ts                  # Action dispatcher
├── routes/
│   └── actions.route.ts                      # HTTP routes (Hono)
├── engines/
│   └── accounting/
│       ├── read-journal-entries.action.ts    # Action handler
│       └── index.ts                          # Engine manifest + registration
```

---

## 🔧 Step 2: Update Database Table Schema

The action expects a table named `kernel_journal_entries`. Create it with this schema:

```sql
CREATE TABLE kernel_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  org_id VARCHAR(255),
  journal_no VARCHAR(50) NOT NULL,
  journal_date DATE NOT NULL,
  debit_account_id VARCHAR(255) NOT NULL,
  credit_account_id VARCHAR(255) NOT NULL,
  amount NUMERIC(19, 4) NOT NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'USD',
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'posted'
    CHECK (status IN ('draft', 'posted', 'void')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255),
  updated_at TIMESTAMPTZ,
  updated_by VARCHAR(255),
  
  -- Indexes
  CONSTRAINT idx_tenant_journal_no UNIQUE (tenant_id, journal_no)
);

-- Indexes for query performance
CREATE INDEX idx_journal_entries_tenant ON kernel_journal_entries (tenant_id);
CREATE INDEX idx_journal_entries_date ON kernel_journal_entries (journal_date DESC);
CREATE INDEX idx_journal_entries_accounts ON kernel_journal_entries (debit_account_id, credit_account_id);
CREATE INDEX idx_journal_entries_status ON kernel_journal_entries (status);

-- Row-level security (optional, for multi-tenancy)
ALTER TABLE kernel_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON kernel_journal_entries
  USING (tenant_id = current_setting('app.current_tenant', TRUE));
```

---

## 🔧 Step 3: Wire Database Proxy

Replace the placeholder database proxy in `routes/actions.route.ts` with your actual database connection.

**Option A: Using `pg` (node-postgres)**

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const dbProxy = {
  query: async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
    const result = await pool.query(sql, params);
    return result.rows as T[];
  },
  one: async <T = unknown>(sql: string, params?: unknown[]): Promise<T | null> => {
    const results = await dbProxy.query<T>(sql, params);
    return results[0] || null;
  },
  many: async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
    return dbProxy.query<T>(sql, params);
  },
  none: async (sql: string, params?: unknown[]): Promise<number> => {
    const result = await pool.query(sql, params);
    return result.rowCount || 0;
  },
};
```

**Option B: Using Drizzle ORM**

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

const db = drizzle(pool);

const dbProxy = {
  query: async <T = unknown>(sqlQuery: string, params?: unknown[]): Promise<T[]> => {
    const result = await db.execute(sql.raw(sqlQuery, ...(params || [])));
    return result.rows as T[];
  },
  // ... (same as above)
};
```

---

## 🔧 Step 4: Register Engine in Main App

Create an entry point that loads all engines:

```typescript
// kernel/index.ts
import './engines/accounting'; // This auto-registers the accounting engine
// Import other engines here as you create them

import { Hono } from 'hono';
import { actionsRouter } from './routes/actions.route';

const app = new Hono();

// Mount actions router
app.route('/actions', actionsRouter);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
```

Start your server:

```typescript
// server.ts
import app from './kernel/index';

const port = process.env.PORT || 3000;

console.log(`🚀 AI-BOS Kernel starting on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
```

---

## 🔧 Step 5: Test the Action

### 5.1 Insert Test Data

```sql
INSERT INTO kernel_journal_entries (
  tenant_id, org_id, journal_no, journal_date,
  debit_account_id, credit_account_id, amount, currency_code,
  description, status
) VALUES
  ('tenant-123', 'org-1', 'JE-2025-001', '2025-11-27',
   'acc-1000', 'acc-4000', 1500.00, 'USD',
   'Sales revenue', 'posted'),
  ('tenant-123', 'org-1', 'JE-2025-002', '2025-11-28',
   'acc-2000', 'acc-5000', 2500.00, 'USD',
   'Expense payment', 'posted'),
  ('tenant-456', 'org-2', 'JE-2025-001', '2025-11-27',
   'acc-1000', 'acc-3000', 500.00, 'USD',
   'Asset purchase', 'draft');
```

### 5.2 Test with cURL

```bash
# List all actions
curl http://localhost:3000/actions

# Get action contract
curl http://localhost:3000/actions/accounting/read.journal_entries/contract

# Execute action (basic query)
curl -X POST http://localhost:3000/actions/accounting/read.journal_entries \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-123" \
  -d '{
    "page": 1,
    "pageSize": 50
  }'

# Execute action (with filters)
curl -X POST http://localhost:3000/actions/accounting/read.journal_entries \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-123" \
  -d '{
    "dateFrom": "2025-11-01",
    "dateTo": "2025-11-30",
    "status": "posted",
    "page": 1,
    "pageSize": 10
  }'

# Execute action (filter by account)
curl -X POST http://localhost:3000/actions/accounting/read.journal_entries \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: tenant-123" \
  -d '{
    "accountId": "acc-1000",
    "page": 1,
    "pageSize": 50
  }'
```

### 5.3 Expected Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "tenantId": "tenant-123",
        "orgId": "org-1",
        "journalNo": "JE-2025-002",
        "journalDate": "2025-11-28",
        "debitAccountId": "acc-2000",
        "creditAccountId": "acc-5000",
        "amount": 2500.00,
        "currencyCode": "USD",
        "description": "Expense payment",
        "status": "posted",
        "createdAt": "2025-11-28T10:00:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "tenantId": "tenant-123",
        "orgId": "org-1",
        "journalNo": "JE-2025-001",
        "journalDate": "2025-11-27",
        "debitAccountId": "acc-1000",
        "creditAccountId": "acc-4000",
        "amount": 1500.00,
        "currencyCode": "USD",
        "description": "Sales revenue",
        "status": "posted",
        "createdAt": "2025-11-27T10:00:00Z"
      }
    ],
    "page": 1,
    "pageSize": 50,
    "total": 2
  },
  "meta": {
    "actionId": "accounting.read.journal_entries",
    "duration": 45,
    "timestamp": "2025-11-28T15:30:00Z",
    "requestId": "req_1732812600_abc123"
  }
}
```

---

## 🔧 Step 6: Add Policy Enforcement (Optional)

To add RBAC/PBAC, create a policy middleware:

```typescript
// middleware/policy.middleware.ts
import type { Context, Next } from 'hono';

export async function policyMiddleware(c: Context, next: Next) {
  const actionId = `${c.req.param('domain')}.${c.req.param('action')}`;
  const user = c.get('user');
  
  // Get required permissions from contract
  const { engineRegistry } = require('../registry/engine.loader');
  const parts = actionId.split('.');
  const engine = engineRegistry.get(parts[0]);
  const actionMeta = engine?.manifest.actions[parts.slice(1).join('.')];
  const requiredPermissions = actionMeta?.contract.permissions || [];
  
  // Check if user has permissions
  const userPermissions = user?.permissions || [];
  const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
  
  if (!hasPermission) {
    return c.json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        details: {
          required: requiredPermissions,
          provided: userPermissions,
        },
      },
    }, 403);
  }
  
  await next();
}
```

Then apply it to the actions route:

```typescript
// routes/actions.route.ts
import { policyMiddleware } from '../middleware/policy.middleware';

actionsRouter.post('/:domain/:action', policyMiddleware, async (c) => {
  // ... existing handler
});
```

---

## 🔧 Step 7: Add Audit Logging

```typescript
// middleware/audit.middleware.ts
import type { Context, Next } from 'hono';

export async function auditMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const actionId = `${c.req.param('domain')}.${c.req.param('action')}`;
  const tenant = c.get('tenant');
  const user = c.get('user');
  
  console.log('[Audit] Action started', {
    actionId,
    tenant,
    user: user?.id,
    timestamp: new Date().toISOString(),
  });
  
  await next();
  
  const duration = Date.now() - startTime;
  const status = c.res.status;
  
  console.log('[Audit] Action completed', {
    actionId,
    tenant,
    user: user?.id,
    duration,
    status,
    timestamp: new Date().toISOString(),
  });
  
  // TODO: Store audit log in database
}
```

---

## 🔧 Step 8: Add Metrics

```typescript
// middleware/metrics.middleware.ts
import type { Context, Next } from 'hono';

const metrics = {
  actionCalls: new Map<string, number>(),
  actionDuration: new Map<string, number[]>(),
};

export async function metricsMiddleware(c: Context, next: Next) {
  const startTime = Date.now();
  const actionId = `${c.req.param('domain')}.${c.req.param('action')}`;
  
  await next();
  
  const duration = Date.now() - startTime;
  
  // Increment call count
  metrics.actionCalls.set(actionId, (metrics.actionCalls.get(actionId) || 0) + 1);
  
  // Store duration
  if (!metrics.actionDuration.has(actionId)) {
    metrics.actionDuration.set(actionId, []);
  }
  metrics.actionDuration.get(actionId)!.push(duration);
}

// Metrics endpoint
app.get('/metrics', (c) => {
  const stats = Array.from(metrics.actionCalls.entries()).map(([actionId, calls]) => {
    const durations = metrics.actionDuration.get(actionId) || [];
    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;
    
    return {
      actionId,
      calls,
      avgDuration: Math.round(avgDuration),
      p50: calculatePercentile(durations, 50),
      p95: calculatePercentile(durations, 95),
      p99: calculatePercentile(durations, 99),
    };
  });
  
  return c.json({ metrics: stats });
});

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Math.round(sorted[index]);
}
```

---

## ✅ Checklist: End-to-End Integration

- [ ] **Database**: `kernel_journal_entries` table created
- [ ] **Engine**: `engines/accounting/index.ts` auto-registers
- [ ] **Routes**: `routes/actions.route.ts` mounted at `/actions`
- [ ] **Database Proxy**: Connected to actual PostgreSQL
- [ ] **Tenant Context**: Middleware sets `c.set('tenant', ...)`
- [ ] **User Context**: Middleware sets `c.set('user', ...)`
- [ ] **Test Data**: Sample journal entries inserted
- [ ] **HTTP Test**: cURL test successful
- [ ] **Policy**: RBAC middleware (optional)
- [ ] **Audit**: Audit logging middleware (optional)
- [ ] **Metrics**: Metrics collection (optional)

---

## 🎯 Next Steps

1. **Create More Actions**:
   - `accounting.create.journal_entry` (Command)
   - `accounting.post.journal_entry` (Command)
   - `inventory.read.stock_levels` (Query)

2. **Add Testing**:
   - Unit tests for schemas
   - Integration tests for actions
   - E2E tests for HTTP routes

3. **Add OpenAPI Documentation**:
   - Generate OpenAPI spec from contracts
   - Serve Swagger UI at `/docs`

4. **Add Caching**:
   - Redis cache for query results
   - Cache invalidation on commands

5. **Add Rate Limiting**:
   - Per-tenant rate limits
   - Per-action rate limits

---

**Document Updated**: 2025-11-27  
**Next Review**: 2025-12-04 (Weekly)

