# Storage Subsystem Implementation

## Overview

The kernel storage subsystem has been implemented with **Supabase** and **Redis** as non-negotiable dependencies. This provides a production-grade storage layer for the kernel.

## Files Created

### Core Storage

1. **`kernel/storage/supabase.ts`**
   - Supabase client initialization
   - Retry wrapper with exponential backoff
   - Health check function
   - Error handling with KernelError

2. **`kernel/storage/redis.ts`**
   - Redis client initialization (ioredis)
   - Distributed lock primitives (`acquireLock`, `releaseLock`)
   - Health check function
   - Error handling with KernelError

### Error Handling

3. **`kernel/errors/KernelError.ts`**
   - Base error class for all kernel errors
   - Structured error codes and metadata
   - Proper stack trace preservation

### Bootstrap

4. **`kernel/bootstrap/index.ts`**
   - `bootKernel()` function that initializes storage first
   - Returns kernel instance with storage clients
   - Ready for extension with MCP registries, engines, etc.

### API

5. **`kernel/api/routes/health.ts`**
   - Health check endpoint handler
   - Checks Supabase and Redis health
   - Returns 200 OK or 503 Service Unavailable

6. **`kernel/api/server.ts`**
   - Example Hono server setup
   - Wires health endpoint
   - Ready for additional routes

### Configuration

7. **`kernel/package.json`**
   - Kernel package configuration
   - Dependencies: `@supabase/supabase-js`, `ioredis`
   - TypeScript and build scripts

8. **`kernel/tsconfig.json`**
   - TypeScript configuration
   - Strict mode enabled
   - Path aliases configured

9. **`kernel/index.ts`**
   - Main entry point
   - Exports all public APIs

10. **`kernel/README.md`**
    - Documentation for the kernel
    - Usage examples
    - Environment variable requirements

## Environment Variables Required

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
REDIS_URL=redis://user:pass@host:6379/0
```

> **Important**: Use **service_role key** only in the kernel/backend. Never expose it in `apps/web`.

## Usage

### Bootstrap Kernel

```typescript
import { bootKernel } from '@aibos/kernel';

const kernel = await bootKernel();

// Access storage clients
const supabase = kernel.storage.supabase;
const redis = kernel.storage.redis;
```

### Use Supabase with Retry

```typescript
import { withSupabaseRetry } from '@aibos/kernel';

const result = await withSupabaseRetry(async (client) => {
  return await client
    .from('kernel_audit_logs')
    .insert({ ... });
});
```

### Use Redis Locks

```typescript
import { acquireLock, releaseLock } from '@aibos/kernel';

const lockKey = 'engine:accounting:lock';
if (await acquireLock(lockKey, 5000)) {
  try {
    // Critical section
  } finally {
    await releaseLock(lockKey);
  }
}
```

### Health Check

```typescript
import { healthHandler } from '@aibos/kernel/api/routes/health';

// In your Hono app
app.get('/kernel/health', healthHandler);
```

## Next Steps

1. **Create Supabase Tables**
   - `kernel_health_ping` (for health checks)
   - `kernel_audit_logs` (for audit logging)
   - `kernel_engines` (for engine metadata)
   - `kernel_mcp_servers` (for MCP server registry)

2. **Refactor Existing Code**
   - Update `LockManager` to use `acquireLock`/`releaseLock`
   - Update `RateLimiter` to use Redis
   - Update audit logger to use Supabase

3. **Extend Bootstrap**
   - Add MCP registry loading
   - Add engine registry loading
   - Add metadata registry loading
   - Add event bus initialization
   - Add tenant context initialization

## Architecture Alignment

This implementation follows the GRCD kernel architecture:

- ✅ Storage layer at `kernel/storage/`
- ✅ Bootstrap at `kernel/bootstrap/`
- ✅ API routes at `kernel/api/routes/`
- ✅ Error handling at `kernel/errors/`
- ✅ No ORM (direct Supabase client)
- ✅ No business logic (just infrastructure)
- ✅ Thin, focused implementation

## Dependencies

- `@supabase/supabase-js` - Supabase client
- `ioredis` - Redis client

Both are now **actually used** in the codebase, not just listed in package.json.

