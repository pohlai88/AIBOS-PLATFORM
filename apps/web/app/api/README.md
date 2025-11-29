# Web API Routes (BFF Layer)

This directory contains Next.js API Routes that serve as the **Backend for Frontend (BFF)** layer.

## Architecture

```
Browser → Next.js API Routes (BFF) → Kernel (Backend)
```

The BFF layer:
- Handles authentication and session management
- Transforms requests/responses for frontend consumption
- Aggregates data from multiple Kernel endpoints
- Provides frontend-specific caching
- Translates errors to user-friendly messages

## Available Endpoints

### Tenants

- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create a new tenant
- `GET /api/tenants/[id]` - Get tenant by ID (TODO)
- `PATCH /api/tenants/[id]` - Update tenant (TODO)
- `DELETE /api/tenants/[id]` - Delete tenant (TODO)

### Health

- `GET /api/health` - Health check (BFF + Kernel)

### UI Generation (MCP)

- `POST /api/generate-ui` - Generate UI component (dev only)
- `POST /api/mcp/designer` - MCP designer endpoint

## Usage Examples

### Fetching Tenants (Frontend)

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const response = await fetch("/api/tenants");
  const tenants = await response.json();

  return (
    <div>
      {tenants.data.map((tenant) => (
        <div key={tenant.id}>{tenant.name}</div>
      ))}
    </div>
  );
}
```

### Creating a Tenant (Frontend)

```typescript
// components/CreateTenantForm.tsx
"use client";

async function createTenant(name: string) {
  const response = await fetch("/api/tenants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json();
}
```

## Using the Kernel Client SDK

All API routes should use the `@aibos/sdk` package to communicate with the Kernel:

```typescript
// app/api/tenants/route.ts
import { NextRequest, NextResponse } from "next/server";
import { kernelClient } from "@/lib/kernel-client";
import { KernelError } from "@aibos/sdk";

export async function GET(req: NextRequest) {
  try {
    const tenants = await kernelClient.tenants.list();
    return NextResponse.json(tenants);
  } catch (error) {
    if (error instanceof KernelError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    throw error;
  }
}
```

## Authentication

Use the `getServerSession` helper to check authentication:

```typescript
import { getServerSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use session.accessToken if needed
}
```

## Error Handling

Always handle `KernelError` specifically:

```typescript
import { KernelError } from "@aibos/sdk";

try {
  const result = await kernelClient.tenants.get(id);
  return NextResponse.json(result);
} catch (error) {
  if (error instanceof KernelError) {
    // Kernel-specific error (404, 400, etc.)
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        traceId: error.traceId, // For debugging
      },
      { status: error.statusCode }
    );
  }

  // Unexpected error
  console.error("[API] Unexpected error:", error);
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}
```

## Response Transformation

Transform Kernel responses to match frontend needs:

```typescript
export async function GET(req: NextRequest) {
  const [tenants, stats] = await Promise.all([
    kernelClient.tenants.list(),
    kernelClient.analytics.stats(),
  ]);

  // Aggregate and transform
  return NextResponse.json({
    tenants: tenants.data.map((t) => ({
      id: t.id,
      name: t.name,
      // Add frontend-specific fields
      isActive: t.status === "active",
      createdAtFormatted: formatDate(t.createdAt),
    })),
    totalTenants: stats.tenants_count,
  });
}
```

## Caching

Use Next.js caching strategies:

```typescript
// Static caching (revalidate every 60 seconds)
export const revalidate = 60;

export async function GET() {
  const tenants = await kernelClient.tenants.list();
  return NextResponse.json(tenants);
}

// Or dynamic caching
export async function GET(req: NextRequest) {
  const tenants = await kernelClient.tenants.list();
  
  return NextResponse.json(tenants, {
    headers: {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
    },
  });
}
```

## Environment Variables

Required environment variables:

```env
KERNEL_URL=http://localhost:5656
KERNEL_API_KEY=dev-api-key-12345
```

See `.env.example` for all available variables.

## Testing

### Unit Tests

Mock the Kernel client:

```typescript
// app/api/tenants/route.test.ts
import { GET } from "./route";
import { kernelClient } from "@/lib/kernel-client";

jest.mock("@/lib/kernel-client");

test("GET /api/tenants returns list", async () => {
  (kernelClient.tenants.list as jest.Mock).mockResolvedValue({
    data: [{ id: "1", name: "Acme Corp" }],
  });

  const req = new NextRequest("http://localhost:3000/api/tenants");
  const res = await GET(req);
  
  expect(res.status).toBe(200);
});
```

### Integration Tests

Test against a real Kernel instance:

```typescript
test("E2E: Create tenant", async () => {
  const res = await fetch("http://localhost:3000/api/tenants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test Tenant" }),
  });

  expect(res.status).toBe(201);
});
```

## Related Documentation

- [BFF Patterns](../../../docs/pages/02-architecture/backend/bff-patterns.md)
- [Kernel SDK Documentation](../../../packages/sdk/README.md)
- [Authentication Architecture](../../../docs/pages/02-architecture/backend/auth-architecture.md)

