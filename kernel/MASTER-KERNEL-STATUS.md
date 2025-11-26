# AI-BOS Kernel Wiki

> **Version**: 1.0.0  
> **Status**: Hardening v1 Complete | Hardening v2 In Progress  
> **Last Updated**: November 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Directory Architecture](#directory-architecture)
3. [Subsystem Analysis](#subsystem-analysis)
4. [Boot Sequence](#boot-sequence)
5. [Hardening Status](#hardening-status)
6. [Dependencies](#dependencies)
7. [Gap Analysis](#gap-analysis)
8. [Room for Improvement](#room-for-improvement)
9. [Roadmap](#roadmap)

---

## Overview

The AI-BOS Kernel is the core runtime engine that powers the AI-BOS platform. It provides:

- **Engine Loading & Registry** — Modular plugin system with manifest validation
- **Multi-Tenant Isolation** — Tenant-scoped data, cache, and permissions
- **Action Sandbox** — Secure execution environment with hard blocks
- **Contract Engine** — Governance validation for metadata, actions, UI schemas
- **Event Bus** — Async pub/sub with replay protection
- **AI Governance** — Lynx AI integration for autonomous auditing
- **API Layer** — Hono-based HTTP interface with health endpoints
- **Hardening Suite** — Rate limiting, circuit breakers, audit logging

---

## Directory Architecture

```
kernel/
├── ai/                          # AI/LLM Integration (Lynx)
│   ├── governance.hooks.ts      # AI-powered governance checks
│   ├── inspectors/              # Domain-specific AI inspectors
│   │   ├── action.inspector.ts
│   │   ├── contract.inspector.ts
│   │   ├── event.inspector.ts
│   │   ├── metadata.inspector.ts
│   │   └── ui.inspector.ts
│   ├── lynx.adapter.ts          # LLM adapter interface
│   ├── lynx.client.ts           # Multi-provider LLM client (Ollama → OpenAI)
│   └── reasoning/               # (Reserved for future reasoning modules)
│
├── api/                         # HTTP API Layer
│   ├── index.ts                 # Server bootstrap (Hono + @hono/node-server)
│   ├── router.ts                # Route aggregator
│   └── routes/
│       ├── action.routes.ts     # POST /action/:engine/:action
│       ├── audit.ts             # GET /auditz
│       ├── diag.ts              # GET /diagz (deep diagnostics)
│       ├── engines.routes.ts    # GET /engines
│       ├── health.routes.ts     # Legacy health
│       ├── health.ts            # GET /healthz (K8s liveness)
│       ├── metadata.routes.ts   # GET /metadata
│       ├── ready.ts             # GET /readyz (K8s readiness)
│       ├── tenant.routes.ts     # Tenant management
│       └── ui.routes.ts         # GET /ui/:model
│
├── audit/                       # Audit Logging System
│   ├── audit.logger.ts          # Core logging function
│   ├── audit.store.ts           # In-memory buffer (FIFO, max 5000)
│   ├── audit.types.ts           # AuditEvent, AuditCategory types
│   ├── emit.ts                  # Helper emitters (kernel, engine, tenant)
│   ├── index.ts                 # Exports
│   └── security.events.ts       # Security-specific event helpers
│
├── boot/                        # Boot Configuration
│   ├── environment.ts           # Environment detection
│   ├── index.ts                 # Exports
│   └── kernel.config.ts         # Config loader
│
├── bootstrap/                   # Kernel Bootstrap Sequence
│   ├── index.ts                 # Main bootstrapKernel() function
│   └── steps/                   # 13-step ordered boot pipeline
│       ├── 00-config.ts         # Load configuration
│       ├── 01-logger.ts         # Initialize logger
│       ├── 02-eventbus.ts       # Start event bus
│       ├── 03-engines.ts        # Load engines (with lock + timeout)
│       ├── 04-contracts.ts      # Validate contracts
│       ├── 05-metadata.ts       # Register metadata (with lock)
│       ├── 06-ui.ts             # Register UI schemas (with lock)
│       ├── 07-tenants.ts        # Initialize tenant manager
│       ├── 08-storage.ts        # Connect DB + Redis
│       ├── 09-ai.ts             # Warm up Lynx AI
│       ├── 10-selftest.ts       # Run self-diagnostics
│       ├── 11-api.ts            # Start HTTP server
│       └── 12-ready.ts          # Freeze registries, emit ready
│
├── contracts/                   # Contract Engine (Governance)
│   ├── contract.engine.ts       # Main validation orchestrator
│   ├── contract.types.ts        # ContractResult, ContractViolation
│   ├── index.ts                 # Exports
│   └── validators/
│       ├── action.contract.ts   # Action schema validation
│       ├── engine.contract.ts   # Engine manifest validation
│       ├── model.contract.ts    # Metadata model validation
│       └── ui.contract.ts       # UI schema validation
│
├── events/                      # Event Bus System
│   ├── bus.ts                   # Pub/sub with safeAwait + timeout
│   ├── event.types.ts           # Event type definitions
│   ├── events.types.ts          # KernelEvent interface
│   ├── EventReplayGuard.ts      # SHA-256 deduplication
│   ├── handlers/
│   │   ├── ai.handler.ts        # AI event processing
│   │   ├── audit.handler.ts     # Audit event processing
│   │   └── workflow.handler.ts  # Workflow triggers
│   └── index.ts                 # Exports
│
├── hardening/                   # Hardening v1 Suite
│   ├── diagnostics/
│   │   ├── collect.ts           # Diagnostic data collector
│   │   ├── index.ts             # Exports
│   │   ├── state.ts             # kernelState (boot metrics)
│   │   └── timers.ts            # Duration measurement
│   ├── errors/                  # Error Hierarchy
│   │   ├── ActionError.ts
│   │   ├── AIError.ts
│   │   ├── ContractError.ts
│   │   ├── KernelError.ts       # Base error class
│   │   ├── MetadataError.ts
│   │   ├── RegistryError.ts
│   │   └── TenantError.ts
│   ├── guards/
│   │   ├── freeze.ts            # Object.freeze utility
│   │   ├── index.ts             # Exports
│   │   ├── safeAwait.ts         # [err, result] wrapper
│   │   └── withTimeout.ts       # Timeout guard
│   ├── locks/
│   │   ├── engineLoaderLock.ts  # Engine loading mutex
│   │   ├── index.ts             # Exports
│   │   ├── mutex.ts             # Generic async mutex
│   │   ├── registryLock.ts      # Registry write mutex
│   │   └── tenantLock.ts        # Tenant operation mutex
│   └── rate-limit/
│       ├── circuit-breaker.ts   # Engine error threshold + cooldown
│       ├── engine.limiter.ts    # 300 actions/min per engine
│       ├── global.limiter.ts    # 200 req/sec cluster-wide
│       ├── index.ts             # Exports
│       ├── ratelimit.store.ts   # Sliding window store
│       └── tenant.limiter.ts    # 1000 req/min per tenant
│
├── registry/                    # Core Registries
│   ├── _init.ts                 # Registry initialization
│   ├── action.registry.ts       # Action definitions
│   ├── actions.loader.ts        # Action file loader
│   ├── engine.loader.ts         # Engine discovery + loading
│   ├── engine.registry.ts       # Engine storage (with freeze)
│   ├── EngineDependencyGraph.ts # Dependency tracking + cycle detection
│   ├── index.ts                 # Exports
│   ├── metadata.loader.ts       # Metadata file loader
│   ├── metadata.registry.ts     # Metadata storage (with freeze)
│   ├── ui.loader.ts             # UI schema file loader
│   └── ui.registry.ts           # UI schema storage (with freeze)
│
├── security/                    # Security Layer
│   ├── cache.proxy.ts           # Tenant-scoped cache proxy
│   ├── db.proxy.ts              # Tenant-scoped DB proxy
│   ├── guards/
│   │   ├── blocked.globals.ts   # Forbidden global APIs list
│   │   └── hard-blocks.ts       # Code scanning for dangerous patterns
│   ├── index.ts                 # Exports
│   ├── ManifestSigner.ts        # RSA-SHA256 manifest signing
│   ├── permissions.ts           # Permission definitions
│   ├── policies/
│   │   └── default.policy.ts    # Default policy rules
│   ├── PolicyEngine.ts          # Declarative policy evaluation
│   ├── rbac.ts                  # Role-based access control
│   ├── sandbox.ts               # Action execution orchestrator
│   ├── sandbox.v2.ts            # Enhanced sandbox (L2 isolation)
│   ├── SignatureRotation.ts     # Key rotation management
│   ├── SignatureVerifier.ts     # RSA-SHA256 signature verification
│   ├── TrustStore.ts            # Trusted public keys registry
│   ├── validation.ts            # Input validation utilities
│   └── validators/
│       ├── input.validator.ts   # Action input validation
│       └── output.validator.ts  # Action output validation
│
├── storage/                     # Storage Layer
│   ├── db.ts                    # Database abstraction (connection pool, retry)
│   ├── index.ts                 # Exports
│   ├── redis.ts                 # Redis abstraction (distributed locks)
│   └── schema/
│       └── migrations/
│           └── init.sql         # Initial DB schema
│
├── tenancy/                     # Multi-Tenancy
│   ├── index.ts                 # Exports
│   ├── tenant.db.ts             # Tenant-specific DB operations
│   ├── tenant.manager.ts        # Tenant CRUD + engine activation
│   ├── tenant.types.ts          # Tenant interface
│   └── TenantIsolationVerifier.ts # Cross-tenant leak detection
│
├── testing/                     # Internal Testing Harnesses
│   ├── ChaosHarness.ts          # Random engine restart simulation
│   ├── FuzzHarness.ts           # Random payload generation
│   └── index.ts                 # Exports
│
├── types/                       # Type Definitions
│   ├── action.types.ts
│   ├── engine.types.ts
│   ├── index.ts
│   ├── kernel.types.ts
│   ├── metadata.types.ts
│   └── ui.types.ts
│
├── ui/                          # UI Schema System
│   ├── ui.defaults.ts           # Default UI configurations
│   ├── ui.generator.ts          # UI schema generator from metadata
│   ├── ui.registry.ts           # UI schema storage
│   └── ui.types.ts              # UI type definitions
│
├── utils/                       # Utilities
│   ├── errors.ts                # Error utilities
│   ├── file.helpers.ts          # File system helpers
│   ├── index.ts                 # Exports
│   ├── logger.ts                # Logging utility
│   └── result.ts                # Result type utilities
│
├── validation/                  # Validation Layer
│   ├── contract.validator.ts    # Contract validation
│   ├── index.ts                 # Exports
│   ├── manifest.validator.ts    # Manifest validation
│   └── metadata.validator.ts    # Metadata validation
│
├── index.ts                     # Main entry point
├── package.json                 # Package configuration
├── tsconfig.json                # TypeScript configuration
├── kernel-harderningV2.md       # Hardening v2 roadmap
└── WIKI.md                      # This file
```

---

## Subsystem Analysis

### 1. **Engine System** ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `engine.loader.ts` | ✅ | Discovers engines from `engines/` directory |
| `engine.registry.ts` | ✅ | Stores loaded engines with freeze support |
| `EngineDependencyGraph.ts` | ✅ | Tracks dependencies, detects cycles |
| Manifest validation | ✅ | Via contract engine |

### 2. **Metadata System** ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `metadata.registry.ts` | ✅ | Model storage with freeze |
| `metadata.loader.ts` | ✅ | File-based metadata loading |
| Contract validation | ✅ | Schema validation via contracts |

### 3. **Security System** ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `sandbox.v2.ts` | ✅ | L2 isolation with hard blocks |
| `SignatureVerifier.ts` | ✅ | RSA-SHA256 verification |
| `TrustStore.ts` | ✅ | Public key management |
| `PolicyEngine.ts` | ✅ | Declarative policy rules |
| Rate limiting | ✅ | 3-layer (global/tenant/engine) |
| Circuit breaker | ✅ | Error threshold + cooldown |

### 4. **Event System** ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `bus.ts` | ✅ | Pub/sub with timeout guards |
| `EventReplayGuard.ts` | ✅ | SHA-256 deduplication |
| Handlers | ✅ | AI, audit, workflow handlers |

### 5. **Storage System** ⚠️ Partial

| Component | Status | Description |
|-----------|--------|-------------|
| `db.ts` | ⚠️ | Abstraction only (no real driver) |
| `redis.ts` | ⚠️ | In-memory mock (no real driver) |
| Connection pooling | ✅ | Implemented in abstraction |
| Retry logic | ✅ | Exponential backoff |
| Distributed locks | ✅ | Via Redis abstraction |

### 6. **API System** ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| Hono router | ✅ | All routes registered |
| Health endpoints | ✅ | /healthz, /readyz, /diagz |
| Audit endpoint | ✅ | /auditz |
| Action execution | ✅ | POST /action/:engine/:action |

### 7. **AI System** ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `lynx.client.ts` | ✅ | Multi-provider (Ollama → OpenAI) |
| Governance hooks | ✅ | AI-powered auditing |
| Inspectors | ✅ | 5 domain inspectors |

### 8. **Audit System** ✅ Complete

| Component | Status | Description |
|-----------|--------|-------------|
| `audit.logger.ts` | ✅ | UUID + timestamp logging |
| `audit.store.ts` | ✅ | FIFO buffer (5000 max) |
| Security events | ✅ | Sandbox violations, rate limits |

---

## Boot Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                    KERNEL BOOT SEQUENCE                      │
├─────────────────────────────────────────────────────────────┤
│  Step 00: Load Configuration                                │
│  Step 01: Initialize Logger                                 │
│  Step 02: Start Event Bus                                   │
│  Step 03: Load Engines (with lock + 3s timeout)             │
│  Step 04: Validate Contracts                                │
│  Step 05: Register Metadata (with lock)                     │
│  Step 06: Register UI Schemas (with lock)                   │
│  Step 07: Initialize Tenant Manager                         │
│  Step 08: Connect Storage (DB + Redis)                      │
│  Step 09: Warm Up Lynx AI (with 4s timeout)                 │
│  Step 10: Run Self-Test Diagnostics                         │
│  Step 11: Start API Server                                  │
│  Step 12: Freeze Registries → Emit kernel.ready             │
└─────────────────────────────────────────────────────────────┘
```

---

## Hardening Status

### Hardening v1 ✅ Complete

| Feature | Status | Implementation |
|---------|--------|----------------|
| Error Hierarchy | ✅ | `KernelError` + 6 subclasses |
| `safeAwait` Guard | ✅ | `[err, result]` pattern |
| `withTimeout` Guard | ✅ | Configurable timeouts |
| Mutex Locks | ✅ | Registry, engine, tenant locks |
| Registry Immutability | ✅ | `freeze()` after boot |
| Sandbox L2 | ✅ | Hard blocks, I/O validation |
| Health Endpoints | ✅ | K8s compatible |
| Rate Limiting | ✅ | 3-layer sliding window |
| Circuit Breaker | ✅ | Error threshold + cooldown |
| Audit Logging | ✅ | 4-category system |

### Hardening v2 🔄 In Progress

| Feature | Status | File |
|---------|--------|------|
| Event Replay Guard | ✅ | `EventReplayGuard.ts` |
| Engine Dependency Graph | ✅ | `EngineDependencyGraph.ts` |
| Tenant Isolation Verifier | ✅ | `TenantIsolationVerifier.ts` |
| Trust Store | ✅ | `TrustStore.ts` |
| Signature Rotation | ✅ | `SignatureRotation.ts` |
| Policy Engine | ✅ | `PolicyEngine.ts` |
| Chaos Harness | ✅ | `ChaosHarness.ts` |
| Fuzz Harness | ✅ | `FuzzHarness.ts` |
| Signature Verifier | ✅ | `SignatureVerifier.ts` |
| Manifest Signer | ✅ | `ManifestSigner.ts` |

---

## Dependencies

### Current Dependencies

```json
{
  "dependencies": {
    "@hono/node-server": "^1.13.7",
    "hono": "^4.7.9",
    "ioredis": "^5.6.1",
    "@supabase/supabase-js": "^2.49.8"
  },
  "devDependencies": {
    "@aibos/config-eslint": "0.1.0",
    "@types/node": "^22.19.1",
    "eslint": "^9.39.1",
    "tsx": "^4.19.2",
    "typescript": "^5.9.3"
  }
}
```

### Dependency Analysis

| Package | Status | Used | Notes |
|---------|--------|------|-------|
| `hono` | ✅ Required | Yes | API framework |
| `@hono/node-server` | ✅ Required | Yes | HTTP server |
| `ioredis` | ⚠️ Listed | No | Not imported (using mock) |
| `@supabase/supabase-js` | ⚠️ Listed | No | Not imported (using mock) |

### Node.js Built-ins Used

- `node:crypto` — Hashing, signatures, UUID
- `node:fs` — File operations
- `node:path` — Path utilities

### Missing Dependencies (for production)

| Package | Purpose | Recommendation |
|---------|---------|----------------|
| `pg` | PostgreSQL driver | Required for real DB |
| `ioredis` | Redis driver | Already listed, need to import |
| `zod` | Schema validation | Upgrade from basic validation |

### Suggested Dependencies

| Package | Purpose | Priority |
|---------|---------|----------|
| `zod` | Runtime schema validation | High |
| `pino` | Structured logging | Medium |
| `nanoid` | Faster ID generation | Low |
| `dotenv` | Environment loading | Low |

---

## Gap Analysis

### Critical Gaps 🔴

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No real DB driver** | Cannot persist data | Integrate `pg` or use Supabase client |
| **No real Redis driver** | No distributed cache | Import and use `ioredis` |
| **No persistent audit** | Audit lost on restart | Add file/DB persistence |

### High Priority Gaps 🟠

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **Basic input validation** | Weak type safety | Upgrade to Zod schemas |
| **No request tracing** | Hard to debug | Add correlation IDs |
| **No metrics export** | No observability | Add Prometheus metrics |
| **No graceful shutdown** | Data loss risk | Implement SIGTERM handler |

### Medium Priority Gaps 🟡

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **Console-based logging** | Not production-ready | Use structured logger (pino) |
| **No API authentication** | Security risk | Add JWT/API key auth |
| **No OpenAPI spec** | Poor documentation | Generate from routes |
| **No integration tests** | Quality risk | Add test suite |

### Low Priority Gaps 🟢

| Gap | Impact | Recommendation |
|-----|--------|----------------|
| **No CLI** | Dev experience | Add kernel CLI tool |
| **No hot reload** | Dev experience | Already using tsx watch |
| **No plugin marketplace** | Ecosystem | Future feature |

---

## Room for Improvement

### Architecture

1. **Separate concerns further** — Split `sandbox.ts` into orchestrator + executor
2. **Add middleware pattern** — For API routes (auth, logging, tracing)
3. **Implement CQRS** — Separate read/write paths for scalability

### Performance

1. **Connection pooling** — Implement real pool with `pg`
2. **Caching layer** — Add response caching for metadata/UI
3. **Lazy loading** — Load engines on-demand vs. all at boot

### Security

1. **API authentication** — JWT or API key validation
2. **Request signing** — Verify request integrity
3. **Secrets management** — Integrate with Vault or similar

### Observability

1. **Structured logging** — Replace console with pino
2. **Distributed tracing** — Add OpenTelemetry
3. **Metrics endpoint** — Prometheus /metrics

### Developer Experience

1. **CLI tool** — `kernel start`, `kernel validate`, `kernel test`
2. **OpenAPI generation** — Auto-generate from Hono routes
3. **Dev dashboard** — Web UI for kernel inspection

---

## Roadmap

### Phase 1: Production Storage (Next)

- [ ] Integrate `pg` for PostgreSQL
- [ ] Activate `ioredis` for Redis
- [ ] Add connection health monitoring
- [ ] Implement graceful shutdown

### Phase 2: Observability

- [ ] Replace console with pino
- [ ] Add correlation IDs
- [ ] Implement /metrics endpoint
- [ ] Add OpenTelemetry tracing

### Phase 3: Security Hardening

- [ ] Add API authentication (JWT)
- [ ] Implement request signing
- [ ] Add secrets management
- [ ] Security audit

### Phase 4: Developer Experience

- [ ] Build kernel CLI
- [ ] Generate OpenAPI spec
- [ ] Add integration test suite
- [ ] Create dev dashboard

---

## Quick Reference

### Start Kernel

```bash
cd kernel
pnpm dev
```

### Type Check

```bash
pnpm typecheck
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/healthz` | GET | Liveness probe |
| `/readyz` | GET | Readiness probe |
| `/diagz` | GET | Deep diagnostics |
| `/auditz` | GET | Audit log |
| `/engines` | GET | List engines |
| `/metadata` | GET | List metadata |
| `/ui/:model` | GET | Get UI schema |
| `/action/:engine/:action` | POST | Execute action |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `REDIS_URL` | - | Redis connection string |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API URL |
| `OPENAI_API_KEY` | - | OpenAI API key (fallback) |
| `LYNX_MODEL` | `deepseek-r1:7b` | Local LLM model |
| `PORT` | `3001` | API server port |

---

*This wiki is maintained as part of the AI-BOS Kernel documentation.*

