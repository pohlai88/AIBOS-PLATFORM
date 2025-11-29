# BFF Patterns

> **Backend for Frontend (BFF) Architecture in AIBOS Platform**

---

## Overview

The AIBOS Platform implements a **BFF (Backend for Frontend)** pattern where **Next.js API Routes** serve as the lightweight integration layer between the frontend and the heavy-lifting Kernel backend.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser / Client                       │
│                    (Next.js Frontend)                        │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  BFF Layer (Next.js API Routes)              │
│            /app/api/generate-ui, /app/api/mcp/*              │
│                                                              │
│  Responsibilities:                                           │
│  • Authentication token forwarding                           │
│  • Request transformation (frontend → backend format)        │
│  • Response aggregation from multiple Kernel endpoints       │
│  • Frontend-specific caching                                 │
│  • Rate limiting per user session                            │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/REST (Internal)
                  │ + Auth Header (JWT)
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Kernel (Hono Backend on Port 5656)              │
│           /kernel/http/api/* (Tenant, Engine, Registry)      │
│                                                              │
│  Responsibilities:                                           │
│  • Heavy business logic                                      │
│  • Multi-tenant orchestration                                │
│  • Database persistence (PostgreSQL)                         │
│  • Distributed caching (Redis)                               │
│  • Engine execution & workflow management                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
          ┌──────────────┐      ┌──────────────┐
          │  PostgreSQL  │      │    Redis     │
          │  (Supabase)  │      │  (Upstash)   │
          └──────────────┘      └──────────────┘
```

---

## Why This Pattern?

### Traditional Monolith Problems

❌ **Frontend coupled to backend implementation details**  
❌ **UI changes require backend deployments**  
❌ **Over-fetching / under-fetching data**  
❌ **Single point of failure**

### BFF Pattern Benefits

✅ **Frontend Ownership:** Frontend team owns their API contracts  
✅ **Optimized Payloads:** BFF aggregates/transforms data exactly as UI needs  
✅ **Independent Deployments:** Frontend and Kernel deploy separately  
✅ **Technology Flexibility:** Different stacks for UI concerns vs business logic  
✅ **Security Boundary:** BFF sanitizes/validates before hitting Kernel

---

## BFF Responsibilities

### ✅ What the BFF Should Do

1. **Authentication Propagation**
   - Extract user session from Next.js (e.g., Supabase Auth)
   - Convert to JWT Bearer token for Kernel
   - Forward in `Authorization` header

2. **Request Transformation**
   - Convert frontend-friendly formats to Kernel schemas
   - Validate inputs using shared Zod schemas
   - Batch multiple UI requests into single Kernel calls

3. **Response Aggregation**
   - Combine data from multiple Kernel endpoints
   - Denormalize for UI consumption
   - Add frontend-specific metadata (e.g., `isLoading`, `hasMore`)

4. **Edge Caching**
   - Cache expensive Kernel responses at Edge (Next.js middleware)
   - Invalidate on mutations
   - Serve stale-while-revalidate for better UX

5. **Error Handling**
   - Translate Kernel errors to user-friendly messages
   - Log errors with trace IDs for debugging
   - Fallback gracefully (e.g., return cached data on timeout)

### ❌ What the BFF Should NOT Do

1. **Business Logic**  
   Don't implement tenant logic, pricing, permissions in BFF → belongs in Kernel

2. **Direct Database Access**  
   Never query PostgreSQL from Next.js → always go through Kernel

3. **Distributed Locks**  
   Don't implement mutex/locks in BFF → use Kernel's Redis-backed locks

4. **Heavy Computation**  
   Don't run ML models, parse large files → delegate to Kernel engines

---

## Implementation Examples

### Example 1: Simple Proxy (No Transformation)

```typescript
// apps/web/app/api/tenants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kernelClient } from "@/lib/kernel-client";
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Simple proxy - just forward with auth
    const tenants = await kernelClient.tenants.list({
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return NextResponse.json(tenants);
  } catch (error) {
    console.error("Failed to fetch tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}
```

### Example 2: Request Transformation

```typescript
// apps/web/app/api/generate-ui/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kernelClient } from "@/lib/kernel-client";
import { z } from "zod";

// Frontend schema (simple)
const GenerateUIRequestSchema = z.object({
  componentName: z.string(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = GenerateUIRequestSchema.parse(body);

  // Transform to Kernel schema (detailed)
  const kernelRequest = {
    engine: "ui-generator",
    tenant_id: "default",
    config: {
      component_name: parsed.componentName,
      description: parsed.description || "",
      framework: "react",
      typescript: true,
      design_system: "aibos",
    },
  };

  const result = await kernelClient.engines.execute(kernelRequest);

  // Transform response back to frontend format
  return NextResponse.json({
    code: result.output.code,
    metadata: {
      tokensUsed: result.metadata.tokens,
      duration: result.metadata.duration_ms,
    },
  });
}
```

### Example 3: Response Aggregation

```typescript
// apps/web/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kernelClient } from "@/lib/kernel-client";
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession();

  // Fetch multiple things in parallel
  const [tenants, recentEvents, stats] = await Promise.all([
    kernelClient.tenants.list({ userId: session.user.id }),
    kernelClient.audit.events({ limit: 10 }),
    kernelClient.analytics.stats(),
  ]);

  // Aggregate into single dashboard payload
  return NextResponse.json({
    tenants: tenants.data,
    recentActivity: recentEvents.data.map((e) => ({
      id: e.id,
      type: e.event_type,
      timestamp: e.created_at,
      description: formatEventDescription(e),
    })),
    stats: {
      totalTenants: stats.tenants_count,
      activeEngines: stats.engines_active,
      requestsToday: stats.requests_24h,
    },
  });
}
```

---

## Authentication Flow

```
┌──────────┐                  ┌──────────┐                  ┌──────────┐
│ Browser  │                  │   BFF    │                  │  Kernel  │
└─────┬────┘                  └─────┬────┘                  └─────┬────┘
      │                             │                             │
      │ 1. Request + Session Cookie │                             │
      ├────────────────────────────>│                             │
      │                             │                             │
      │                             │ 2. Extract JWT from session │
      │                             ├────────────────────────────>│
      │                             │                             │
      │                             │ 3. Validate JWT + Execute   │
      │                             │<────────────────────────────┤
      │                             │                             │
      │ 4. Return JSON              │                             │
      │<────────────────────────────┤                             │
      │                             │                             │
```

1. **Browser → BFF:** Session cookie (HTTP-only, secure)
2. **BFF → Kernel:** JWT in `Authorization: Bearer <token>` header
3. **Kernel:** Validates JWT, executes business logic
4. **BFF → Browser:** JSON response

---

## Shared Types & Contracts

### Problem

Without shared types, BFF and Kernel can drift apart:

```typescript
// ❌ BAD: Duplicated types
// apps/web/lib/types.ts
type Tenant = { id: string; name: string };

// kernel/types/tenant.ts
type Tenant = { tenant_id: string; display_name: string };

// Result: Runtime mismatch! 💥
```

### Solution: Shared Package

```typescript
// packages/types/src/tenant.ts
import { z } from "zod";

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type Tenant = z.infer<typeof TenantSchema>;

// Both BFF and Kernel import from @aibos/types ✅
```

---

## Error Handling

### Kernel Error Format

```json
{
  "error": "TENANT_NOT_FOUND",
  "message": "Tenant abc-123 does not exist",
  "code": "NOT_FOUND",
  "statusCode": 404,
  "traceId": "trace-xyz"
}
```

### BFF Transformation

```typescript
export async function handleKernelError(error: KernelError) {
  // Log for debugging (server-side)
  console.error("[BFF] Kernel error:", {
    code: error.code,
    traceId: error.traceId,
  });

  // Return user-friendly message (client-side)
  return NextResponse.json(
    {
      error: getFriendlyMessage(error.code),
      suggestion: getSuggestion(error.code),
      traceId: error.traceId, // For support tickets
    },
    { status: error.statusCode }
  );
}

function getFriendlyMessage(code: string): string {
  const messages: Record<string, string> = {
    TENANT_NOT_FOUND:
      "This workspace doesn't exist or you don't have access to it.",
    RATE_LIMIT_EXCEEDED:
      "Too many requests. Please wait a moment and try again.",
    UNAUTHORIZED: "Your session has expired. Please sign in again.",
  };
  return messages[code] || "Something went wrong. Please try again.";
}
```

---

## Performance Considerations

### 1. Response Caching

```typescript
// apps/web/app/api/tenants/route.ts
export const revalidate = 60; // Cache for 60 seconds (Next.js 15+)

export async function GET() {
  const tenants = await kernelClient.tenants.list();
  return NextResponse.json(tenants);
}
```

### 2. Parallel Requests

```typescript
// ❌ BAD: Sequential (slow)
const tenant = await kernelClient.tenants.get(id);
const engines = await kernelClient.engines.list(id);
const events = await kernelClient.audit.events(id);

// ✅ GOOD: Parallel (fast)
const [tenant, engines, events] = await Promise.all([
  kernelClient.tenants.get(id),
  kernelClient.engines.list(id),
  kernelClient.audit.events(id),
]);
```

### 3. Streaming Responses

```typescript
// For long-running operations
export async function POST(req: NextRequest) {
  const stream = await kernelClient.engines.executeStream({
    engine: "code-generator",
    config: { ... },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

---

## Testing BFF Endpoints

### Unit Tests (Mocked Kernel)

```typescript
// apps/web/app/api/tenants/route.test.ts
import { GET } from "./route";
import { kernelClient } from "@/lib/kernel-client";

jest.mock("@/lib/kernel-client");

test("GET /api/tenants returns list", async () => {
  (kernelClient.tenants.list as jest.Mock).mockResolvedValue({
    data: [{ id: "1", name: "Acme Corp" }],
  });

  const req = new NextRequest("http://localhost:3000/api/tenants");
  const res = await GET(req);
  const body = await res.json();

  expect(res.status).toBe(200);
  expect(body.data).toHaveLength(1);
});
```

### Integration Tests (Real Kernel)

```typescript
// apps/web/tests/integration/tenants.test.ts
import { startKernel, stopKernel } from "./helpers/kernel";

beforeAll(async () => {
  await startKernel(); // Start Kernel in test mode
});

afterAll(async () => {
  await stopKernel();
});

test("E2E: Create tenant via BFF", async () => {
  const res = await fetch("http://localhost:3000/api/tenants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test Tenant" }),
  });

  expect(res.status).toBe(201);
  const body = await res.json();
  expect(body.id).toBeDefined();
});
```

---

## Migration Checklist

If you're migrating from a monolith to this BFF pattern:

- [ ] Move business logic from Next.js API routes to Kernel
- [ ] Create `packages/types` for shared schemas
- [ ] Implement Kernel Client SDK (`packages/sdk`)
- [ ] Update frontend API routes to use SDK
- [ ] Add auth token forwarding
- [ ] Migrate database queries to Kernel
- [ ] Set up Redis for Kernel (distributed locks)
- [ ] Update tests to mock Kernel instead of DB
- [ ] Document all BFF endpoints (OpenAPI)
- [ ] Set up CI/CD for independent deployments

---

## Related Documentation

- [Kernel Configuration Guide](../../../kernel/README_CONFIGURATION.md)
- [Authentication Architecture](./auth-architecture.md)
- [Error Handling](./error-handling.md)
- [Rate Limiting](./rate-limiting.md)

---

**Status:** ✅ Complete  
**Last Updated:** 2025-11-27  
**Next Review:** Q1 2026
