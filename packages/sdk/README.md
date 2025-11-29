# @aibos/sdk

TypeScript SDK for the AIBOS Kernel API.

## Installation

```bash
pnpm add @aibos/sdk
```

## Usage

### Basic Setup

```typescript
import { KernelClient } from "@aibos/sdk";

const kernel = new KernelClient({
  baseUrl: process.env.KERNEL_URL || "http://localhost:5656",
  apiKey: process.env.KERNEL_API_KEY,
});
```

### With JWT Authentication

```typescript
const kernel = new KernelClient({
  baseUrl: "http://localhost:5656",
  getToken: async () => {
    const session = await getServerSession();
    return session.accessToken;
  },
});
```

## API Reference

### Tenants

```typescript
// List all tenants
const tenants = await kernel.tenants.list();

// Get a specific tenant
const tenant = await kernel.tenants.get("tenant-id");

// Create a tenant
const newTenant = await kernel.tenants.create({
  name: "Acme Corp",
  config: { theme: "dark" },
});

// Update a tenant
const updated = await kernel.tenants.update("tenant-id", {
  name: "New Name",
});

// Delete a tenant
await kernel.tenants.delete("tenant-id");
```

### Engines

```typescript
// List all engines
const engines = await kernel.engines.list();

// Execute an engine
const result = await kernel.engines.execute({
  engineId: "ui-generator",
  tenantId: "default",
  config: {
    componentName: "Button",
    description: "A primary button component",
  },
});

// Stream engine execution
const stream = await kernel.engines.executeStream({
  engineId: "code-generator",
  config: { prompt: "Generate a login form" },
});

for await (const chunk of stream) {
  console.log(chunk);
}
```

### Audit Events

```typescript
// List recent events
const events = await kernel.audit.events({
  limit: 10,
  tenantId: "tenant-id",
});

// Get event by ID
const event = await kernel.audit.getEvent("event-id");
```

## Error Handling

```typescript
import { KernelError } from "@aibos/sdk";

try {
  await kernel.tenants.get("invalid-id");
} catch (error) {
  if (error instanceof KernelError) {
    console.error("Kernel error:", {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      traceId: error.traceId,
    });
  }
}
```

## TypeScript Support

All methods are fully typed with TypeScript for autocomplete and type safety:

```typescript
const tenant = await kernel.tenants.get("id");
// tenant is typed as Tenant

const result = await kernel.engines.execute({
  engineId: "ui-generator",
  config: {
    // Config is validated at compile time
    componentName: "Button",
  },
});
// result is typed as EngineExecutionResult
```

## License

MIT

