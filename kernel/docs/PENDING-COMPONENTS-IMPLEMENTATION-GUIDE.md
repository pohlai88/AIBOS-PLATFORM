# 🚧 Pending Components — Implementation Guide

> **Development blueprint** for completing the 6 pending kernel components with zero-drift guardrails.
> **Updated with industry-standard libraries** to avoid reinventing the wheel.

**Version**: 1.1.0  
**Status**: Implementation Ready  
**Last Updated**: 2025-11-27

---

## 📑 Table of Contents

1. [BFF Layer](#1-bff-layer)
2. [OpenAPI Generator](#2-openapi-generator) ⚡ Uses `@hono/zod-openapi`
3. [Developer SDK](#3-developer-sdk) ⚡ Auto-generated from OpenAPI
4. [WebSocket Support](#4-websocket-support) ⚡ Uses `ws` + reconnection
5. [CORS Middleware](#5-cors-middleware) ⚡ Uses Hono built-in
6. [Cluster Scaling](#6-cluster-scaling) — Deferred to Phase 2
7. [Definition of Done (DoD)](#7-definition-of-done-dod)

---

## 🎯 Implementation Strategy

| Component         | Build vs Buy | Library                    | Effort |
| ----------------- | ------------ | -------------------------- | ------ |
| BFF Layer         | Build        | Custom + API versioning    | 4h     |
| OpenAPI Generator | **Buy**      | `@hono/zod-openapi`        | 2h     |
| Developer SDK     | **Buy**      | `openapi-zod-client`       | 4h     |
| WebSocket         | Hybrid       | `ws` + custom reconnection | 6h     |
| CORS Middleware   | **Buy**      | `hono/cors`                | 30m    |
| Cluster Scaling   | Defer        | Phase 2                    | 0h     |

**Total Effort**: ~16h (down from 77h)

---

## 1. BFF Layer

**Priority**: High | **Effort**: 4h | **Layer**: Kernel Coordination

### 1.1 Purpose

Backend-For-Frontend adapter with **API versioning** and client-specific transforms.

### 1.2 Directory Structure

```
kernel/
└── bff/
    ├── index.ts                    # Public exports
    ├── bff.types.ts                # Type definitions
    ├── bff-router.ts               # Client-type routing
    ├── versioning/
    │   ├── index.ts
    │   ├── v1/                     # API v1
    │   └── v2/                     # API v2 (future)
    ├── transformers/
    │   ├── index.ts
    │   ├── web.transformer.ts
    │   ├── mobile.transformer.ts
    │   ├── cli.transformer.ts
    │   └── mcp.transformer.ts
    └── middleware/
        ├── index.ts
        ├── client-detection.ts
        └── version-negotiation.ts  # NEW: API version handling
```

### 1.3 Core Types

```typescript
// bff.types.ts
export type BffClientType = "web" | "mobile" | "cli" | "mcp";
export type ApiVersion = "v1" | "v2";

export interface BffContext {
  clientType: BffClientType;
  clientVersion: string;
  apiVersion: ApiVersion; // NEW
  tenantId: string;
  userId: string;
  locale: string;
  timezone: string;
}

export interface BffRequest<T = unknown> {
  context: BffContext;
  payload: T;
  metadata?: Record<string, unknown>;
}

export interface BffResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: BffError;
  meta: BffResponseMeta;
}

export interface BffError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  retryAfter?: number; // NEW: Rate limit hint
}

export interface BffResponseMeta {
  requestId: string;
  duration: number;
  timestamp: string;
  apiVersion: ApiVersion; // NEW
  deprecation?: string; // NEW: Deprecation warning
  pagination?: BffPagination;
  cacheControl?: string; // NEW: Cache hints
}

export interface BffPagination {
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  cursor?: string; // NEW: Cursor-based pagination
}
```

### 1.4 Version Negotiation Middleware

```typescript
// middleware/version-negotiation.ts
import { Context, Next } from "hono";
import { ApiVersion } from "../bff.types";

const SUPPORTED_VERSIONS: ApiVersion[] = ["v1", "v2"];
const DEFAULT_VERSION: ApiVersion = "v1";
const LATEST_VERSION: ApiVersion = "v1";

export function versionNegotiation() {
  return async (c: Context, next: Next) => {
    // Check header first, then path, then default
    const headerVersion = c.req.header("X-API-Version") as ApiVersion;
    const pathVersion = c.req.path.match(/^\/api\/(v\d+)/)?.[1] as ApiVersion;

    const requestedVersion = headerVersion || pathVersion || DEFAULT_VERSION;

    if (!SUPPORTED_VERSIONS.includes(requestedVersion)) {
      return c.json(
        {
          success: false,
          error: {
            code: "UNSUPPORTED_API_VERSION",
            message: `API version ${requestedVersion} is not supported`,
            details: { supported: SUPPORTED_VERSIONS },
            recoverable: true,
          },
        },
        400
      );
    }

    // Set version in context
    c.set("apiVersion", requestedVersion);

    // Add deprecation warning for old versions
    if (requestedVersion !== LATEST_VERSION) {
      c.header(
        "X-API-Deprecation",
        `Version ${requestedVersion} will be deprecated. Migrate to ${LATEST_VERSION}`
      );
    }

    c.header("X-API-Version", requestedVersion);
    return next();
  };
}
```

### 1.5 Dependencies

| Depends On   | Relied By     | Isolation |
| ------------ | ------------- | --------- |
| `http/`      | Apps, Engines | ✅ Full   |
| `telemetry/` | -             | ✅ Full   |
| `auth/`      | -             | ✅ Full   |

### 1.6 DoD Checklist

- [ ] All 4 transformers implemented (web, mobile, cli, mcp)
- [ ] API versioning (v1, v2) working
- [ ] Version negotiation middleware
- [ ] Client detection middleware
- [ ] Cursor-based pagination
- [ ] Cache-Control headers
- [ ] Deprecation warnings
- [ ] Unit tests: 90% coverage
- [ ] No upward layer imports

---

## 2. OpenAPI Generator

**Priority**: High | **Effort**: 2h | **Layer**: Resource & Integration

### ⚡ USE EXISTING LIBRARY

**Do NOT build from scratch.** Use [`@hono/zod-openapi`](https://github.com/honojs/middleware/tree/main/packages/zod-openapi) (production-ready, 1000+ stars).

### 2.1 Installation

```bash
pnpm install @hono/zod-openapi
```

### 2.2 Directory Structure

```
kernel/
└── openapi/
    ├── index.ts                    # Re-exports from @hono/zod-openapi
    ├── openapi.config.ts           # AI-BOS specific config
    ├── schemas/                    # Shared Zod schemas
    │   ├── index.ts
    │   ├── common.schema.ts
    │   ├── tenant.schema.ts
    │   └── action.schema.ts
    └── routes/                     # OpenAPI route definitions
        ├── index.ts
        ├── health.route.ts
        ├── engines.route.ts
        └── actions.route.ts
```

### 2.3 Implementation

```typescript
// openapi/index.ts
export { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
export * from "./openapi.config";
export * from "./schemas";

// openapi/openapi.config.ts
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

export function createOpenAPIApp() {
  const app = new OpenAPIHono();

  // OpenAPI documentation endpoint
  app.doc("/api/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "AI-BOS Kernel API",
      version: "1.0.0",
      description: "Self-healing, AI-governed Business Operating System",
    },
    servers: [
      { url: "http://localhost:3000", description: "Development" },
      { url: "https://api.aibos.io", description: "Production" },
    ],
    tags: [
      { name: "Health", description: "Health check endpoints" },
      { name: "Engines", description: "Engine management" },
      { name: "Actions", description: "Action execution" },
      { name: "Metadata", description: "Metadata operations" },
    ],
  });

  // Swagger UI
  app.get("/api/docs", swaggerUI({ url: "/api/openapi.json" }));

  return app;
}

// openapi/routes/health.route.ts
import { createRoute, z, OpenAPIHono } from "@hono/zod-openapi";

const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            status: z.enum(["healthy", "degraded", "unhealthy"]),
            version: z.string(),
            uptime: z.number(),
            checks: z.record(
              z.object({
                status: z.enum(["pass", "fail"]),
                duration: z.number(),
              })
            ),
          }),
        },
      },
      description: "Health check response",
    },
  },
});

export function registerHealthRoutes(app: OpenAPIHono) {
  app.openapi(healthRoute, async (c) => {
    return c.json({
      status: "healthy",
      version: "1.0.0",
      uptime: process.uptime(),
      checks: {
        database: { status: "pass", duration: 5 },
        redis: { status: "pass", duration: 2 },
      },
    });
  });
}
```

### 2.4 Dependencies

| Depends On          | Relied By     | Isolation |
| ------------------- | ------------- | --------- |
| `@hono/zod-openapi` | SDK Generator | ✅ Full   |
| `validation/`       | -             | ✅ Full   |

### 2.5 DoD Checklist

- [ ] `@hono/zod-openapi` installed
- [ ] All routes converted to OpenAPI format
- [ ] Swagger UI at `/api/docs`
- [ ] JSON spec at `/api/openapi.json`
- [ ] All schemas registered
- [ ] Security schemes defined
- [ ] No custom Zod→OpenAPI conversion code

---

## 3. Developer SDK

**Priority**: Medium | **Effort**: 4h | **Layer**: Resource & Integration

### ⚡ AUTO-GENERATE FROM OPENAPI

**Do NOT build manually.** Use [`openapi-zod-client`](https://github.com/astahmer/openapi-zod-client) (1,085 stars) to generate SDK from OpenAPI spec.

### 3.1 Installation

```bash
npm install -D openapi-zod-client
```

### 3.2 Generation Script

```typescript
// scripts/generate-sdk.ts
import { generateZodClientFromOpenAPI } from "openapi-zod-client";
import { readFileSync, writeFileSync } from "fs";

async function generateSdk() {
  const openApiSpec = JSON.parse(readFileSync("./dist/openapi.json", "utf-8"));

  const result = await generateZodClientFromOpenAPI({
    openApiDoc: openApiSpec,
    distPath: "./sdk/generated",
    templatePath: "./sdk/templates/client.hbs", // Optional custom template
    options: {
      withAlias: true,
      baseUrl: "https://api.aibos.io",
      withDescription: true,
    },
  });

  console.log("✅ SDK generated successfully");
}

generateSdk();
```

### 3.3 Directory Structure

```
kernel/
└── sdk/
    ├── index.ts                    # Public exports
    ├── generated/                  # Auto-generated (DO NOT EDIT)
    │   ├── client.ts               # Generated API client
    │   └── schemas.ts              # Generated Zod schemas
    ├── extensions/                 # Manual extensions
    │   ├── index.ts
    │   ├── kernel-client.ts        # Enhanced client wrapper
    │   └── retry-policy.ts         # Retry logic
    ├── builders/                   # Manual builders (keep)
    │   ├── engine.builder.ts
    │   └── action.builder.ts
    └── testing/
        ├── mock-kernel.ts
        └── test-helpers.ts
```

### 3.4 Enhanced Client Wrapper

```typescript
// sdk/extensions/kernel-client.ts
import { createApiClient } from "../generated/client";

export interface KernelClientConfig {
  baseUrl: string;
  apiKey?: string;
  token?: string;
  timeout?: number;
  retries?: number;
  onError?: (error: Error) => void;
}

export class KernelClient {
  private client: ReturnType<typeof createApiClient>;
  private config: KernelClientConfig;

  constructor(config: KernelClientConfig) {
    this.config = config;
    this.client = createApiClient(config.baseUrl, {
      axiosConfig: {
        timeout: config.timeout || 30000,
        headers: {
          ...(config.apiKey && { "X-API-Key": config.apiKey }),
          ...(config.token && { Authorization: `Bearer ${config.token}` }),
        },
      },
    });
  }

  // Proxy all generated methods
  get api() {
    return this.client;
  }

  // Convenience methods
  async healthCheck() {
    return this.client.getHealth();
  }

  async executeAction<TIn, TOut>(
    action: string,
    input: TIn,
    options?: { tenantId?: string }
  ): Promise<TOut> {
    return this.client.postActionsExecute({
      action,
      input,
      tenantId: options?.tenantId,
    }) as Promise<TOut>;
  }
}

// Usage:
// const kernel = new KernelClient({ baseUrl: 'https://api.aibos.io', apiKey: 'xxx' });
// const health = await kernel.healthCheck();
// const result = await kernel.executeAction('createInvoice', { amount: 100 });
```

### 3.5 Package.json Script

```json
{
  "scripts": {
    "sdk:generate": "ts-node scripts/generate-sdk.ts",
    "sdk:build": "npm run sdk:generate && tsc -p sdk/tsconfig.json",
    "sdk:publish": "npm run sdk:build && npm publish ./sdk/dist"
  }
}
```

### 3.6 Dependencies

| Depends On           | Relied By     | Isolation |
| -------------------- | ------------- | --------- |
| `openapi/` (spec)    | Engines, Apps | ✅ Full   |
| `openapi-zod-client` | -             | ✅ Full   |

### 3.7 DoD Checklist

- [ ] `openapi-zod-client` configured
- [ ] Generation script working
- [ ] Enhanced client wrapper
- [ ] Retry policy implemented
- [ ] TypeScript types exported
- [ ] Mock kernel for testing
- [ ] README with usage examples
- [ ] Published to npm (optional)

---

## 4. WebSocket Support

**Priority**: Medium | **Effort**: 6h | **Layer**: Kernel Coordination

### ⚡ USE `ws` WITH RECONNECTION

Use [`ws`](https://github.com/websockets/ws) (21k stars) with custom reconnection logic.

### 4.1 Installation

```bash
npm install ws
npm install -D @types/ws
```

### 4.2 Directory Structure

```
kernel/
└── websocket/
    ├── index.ts
    ├── ws.types.ts
    ├── ws-server.ts
    ├── ws-client.ts                # NEW: Client with reconnection
    ├── channels/
    │   ├── channel.manager.ts
    │   └── presence.manager.ts     # NEW: Who's online
    └── middleware/
        ├── ws-auth.middleware.ts
        └── ws-rate-limit.ts
```

### 4.3 Client with Reconnection (for SDK)

```typescript
// ws-client.ts
import WebSocket from "ws";
import { EventEmitter } from "events";

export interface WsClientConfig {
  url: string;
  token: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export class WsClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private messageQueue: string[] = [];
  private isConnected = false;

  constructor(private config: WsClientConfig) {
    super();
    this.config.reconnect = config.reconnect ?? true;
    this.config.reconnectInterval = config.reconnectInterval ?? 1000;
    this.config.maxReconnectAttempts = config.maxReconnectAttempts ?? 10;
  }

  connect(): void {
    this.ws = new WebSocket(this.config.url, {
      headers: { Authorization: `Bearer ${this.config.token}` },
    });

    this.ws.on("open", () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit("connected");
      this.flushMessageQueue();
    });

    this.ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.emit("message", message);
        this.emit(message.type, message.payload);
      } catch (e) {
        this.emit("error", new Error("Invalid message format"));
      }
    });

    this.ws.on("close", () => {
      this.isConnected = false;
      this.emit("disconnected");
      this.attemptReconnect();
    });

    this.ws.on("error", (error) => {
      this.emit("error", error);
    });
  }

  private attemptReconnect(): void {
    if (!this.config.reconnect) return;
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts!) {
      this.emit("max_reconnect_attempts");
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1);

    this.emit("reconnecting", { attempt: this.reconnectAttempts, delay });

    setTimeout(() => this.connect(), delay);
  }

  send(type: string, payload: unknown): void {
    const message = JSON.stringify({
      type,
      payload,
      messageId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      this.ws?.send(message);
    }
  }

  subscribe(channel: string): void {
    this.send("subscribe", { channel });
  }

  unsubscribe(channel: string): void {
    this.send("unsubscribe", { channel });
  }

  disconnect(): void {
    this.config.reconnect = false;
    this.ws?.close();
  }
}
```

### 4.4 Presence Manager

```typescript
// channels/presence.manager.ts
export interface PresenceUser {
  userId: string;
  tenantId: string;
  connectionId: string;
  status: "online" | "away" | "busy";
  lastSeen: number;
  metadata?: Record<string, unknown>;
}

export class PresenceManager {
  private presence: Map<string, PresenceUser> = new Map();

  join(user: PresenceUser): void {
    this.presence.set(user.connectionId, user);
  }

  leave(connectionId: string): PresenceUser | undefined {
    const user = this.presence.get(connectionId);
    this.presence.delete(connectionId);
    return user;
  }

  updateStatus(connectionId: string, status: PresenceUser["status"]): void {
    const user = this.presence.get(connectionId);
    if (user) {
      user.status = status;
      user.lastSeen = Date.now();
    }
  }

  getOnlineUsers(tenantId: string): PresenceUser[] {
    return Array.from(this.presence.values()).filter(
      (u) => u.tenantId === tenantId && u.status === "online"
    );
  }

  getPresence(userId: string): PresenceUser | undefined {
    return Array.from(this.presence.values()).find((u) => u.userId === userId);
  }
}
```

### 4.5 Dependencies

| Depends On | Relied By      | Isolation |
| ---------- | -------------- | --------- |
| `ws`       | Apps, BFF, SDK | ✅ Full   |
| `auth/`    | -              | ✅ Full   |
| `tenancy/` | -              | ✅ Full   |

### 4.6 DoD Checklist

- [ ] WebSocket server with `ws`
- [ ] Client with exponential backoff reconnection
- [ ] Message queuing during disconnect
- [ ] Presence system (who's online)
- [ ] Channel management
- [ ] Tenant isolation
- [ ] Authentication middleware
- [ ] Rate limiting
- [ ] Unit tests: 85% coverage

---

## 5. CORS Middleware

**Priority**: High | **Effort**: 30m | **Layer**: Kernel Coordination

### ⚡ USE HONO BUILT-IN

Hono has built-in CORS middleware. **Do NOT build custom.**

### 5.1 Installation

Already included with Hono.

### 5.2 Implementation

```typescript
// http/middleware/cors.middleware.ts
import { cors } from "hono/cors";

export function createCorsMiddleware(env: string) {
  const origins = {
    development: ["http://localhost:3000", "http://localhost:5173"],
    staging: ["https://*.staging.aibos.io"],
    production: ["https://*.aibos.io", "https://app.aibos.io"],
  };

  return cors({
    origin: origins[env] || origins.development,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-ID",
      "X-Tenant-ID",
      "X-API-Key",
      "X-API-Version",
    ],
    exposeHeaders: ["X-Request-ID", "X-RateLimit-Remaining", "X-API-Version"],
    credentials: true,
    maxAge: 86400,
  });
}

// Usage in http/router.ts:
// import { createCorsMiddleware } from './middleware/cors.middleware';
// app.use('*', createCorsMiddleware(process.env.NODE_ENV || 'development'));
```

### 5.3 DoD Checklist

- [ ] Using `hono/cors` (not custom)
- [ ] Environment-based origins
- [ ] All required headers allowed
- [ ] Credentials enabled
- [ ] Preflight caching (maxAge)
- [ ] Security review passed

---

## 6. Cluster Scaling

**Priority**: Low | **Effort**: 40h | **Status**: DEFERRED TO PHASE 2

### 6.1 Rationale for Deferral

- Not required for MVP
- Complex to implement correctly
- Requires infrastructure (Consul/etcd/K8s)
- Can use external load balancer initially
- Will implement when scaling beyond single node

### 6.2 Phase 2 Plan

When needed:

1. Use Redis for session/state sharing
2. Use Kubernetes for orchestration
3. Implement leader election with Redis Redlock
4. Add consistent hashing for tenant routing

### 6.3 Interim Solution

```typescript
// Use Redis for cross-instance state
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

// Shared state
await redis.set("kernel:state", JSON.stringify(state));

// Pub/Sub for events
redis.publish("kernel:events", JSON.stringify(event));
```

---

## 7. Definition of Done (DoD)

### 7.1 Universal DoD Checklist

Every pending component **MUST** pass all items before merge:

#### Code Quality

- [ ] TypeScript strict mode passes
- [ ] No `any` types (except justified exceptions)
- [ ] ESLint passes with zero warnings
- [ ] Prettier formatting applied

#### Architecture

- [ ] Uses existing libraries where available
- [ ] Resides in exactly one layer
- [ ] No upward layer imports
- [ ] No circular dependencies
- [ ] Index file exports all public APIs

#### Testing

- [ ] Unit tests: minimum 80% coverage
- [ ] Integration tests: minimum 3 scenarios
- [ ] Edge cases documented and tested

#### Observability

- [ ] Telemetry hooks integrated
- [ ] Structured logging implemented

#### Security

- [ ] No secrets in code
- [ ] Input validation on all public APIs
- [ ] Tenant isolation enforced

#### Documentation

- [ ] JSDoc on all public functions
- [ ] README with usage examples

### 7.2 Updated Component Summary

| Component         | Library Used         | Effort | Status  |
| ----------------- | -------------------- | ------ | ------- |
| BFF Layer         | Custom + versioning  | 4h     | Ready   |
| OpenAPI Generator | `@hono/zod-openapi`  | 2h     | Ready   |
| Developer SDK     | `openapi-zod-client` | 4h     | Ready   |
| WebSocket         | `ws` + reconnection  | 6h     | Ready   |
| CORS Middleware   | `hono/cors`          | 30m    | Ready   |
| Cluster Scaling   | Deferred             | 0h     | Phase 2 |

**Total: ~16.5h to complete kernel**

### 7.3 Merge Gate

```
┌─────────────────────────────────────────────────────────────┐
│                     MERGE GATE                              │
├─────────────────────────────────────────────────────────────┤
│  1. All DoD items checked                                   │
│  2. Using recommended libraries (no reinventing)            │
│  3. DriftShield semantic diff: GREEN                        │
│  4. CI/CD pipeline: PASSED                                  │
│  5. Code review: 1+ approvals                               │
│  6. No breaking changes (or migration provided)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 NPM Dependencies to Add

```bash
# Required
npm install @hono/zod-openapi @hono/swagger-ui ws

# Dev dependencies
npm install -D openapi-zod-client @types/ws
```

---

## 🚀 Implementation Order

1. **CORS** (30m) — Immediate, unblocks frontend
2. **OpenAPI** (2h) — Foundation for SDK
3. **SDK** (4h) — Auto-generate from OpenAPI
4. **BFF** (4h) — API versioning
5. **WebSocket** (6h) — Real-time features

After these 5 components (~16h), kernel is **complete** and ready for UI.

---

## 📄 License

Proprietary — AI-BOS Platform

---

_Implementation Guide v1.1 — Updated with industry-standard libraries_
