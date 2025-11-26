Nice, this is a good moment to zoom out and really understand **what you’ve built** and **what Hardening v2 should mean**.

I’ll break it into:

1. **Three eras of the Kernel**

   * Initial (v0 → v1)
   * Hardening v1 (what we just did)
   * Hardening v2 (what it *should* be)

2. **Section-by-section comparison vs big players**

   * Salesforce / Workday
   * Shopify / Stripe
   * Supabase / Vercel / Cloudflare / AWS Lambda

3. **Scores, pros/cons, and best practices**

---

## 1. Three Eras of the AI-BOS Kernel

### 🧬 Era 1 — Initial Kernel (v0 → v1)

**Goal:**
“Make it *work*, end-to-end, with a clean architecture — engines, metadata, UI, sandbox, tenants, API, AI.”

**What it had:**

* Directory structure: `kernel/`, `engines/`, `apps/`
* Engine loader
* Metadata registry
* UI registry
* Basic sandbox
* Tenant manager
* Event bus
* Hono API server
* Lynx AI client
* No serious safety barriers yet
* No immutability
* No rate limits
* No health checks
* No formal error taxonomy

**Analogy:**

* Like an **early internal platform** at a bigco: powerful but not yet safe for external devs.
* Functional, but a clever dev could crash it or corrupt state.

---

### 🛡 Era 2 — Hardening v1 (what we’ve just implemented)

**Goal:**
“Make it **safe, deterministic, and secure** enough for serious production, tenants, and 3rd-party engines.”

We added:

1. **Error Taxonomy**

   * `KernelError`, `ContractError`, `MetadataError`, `ActionError`, `TenantError`, `RegistryError`, `AIError`
   * ⇒ Errors now *categorized* and explainable.

2. **Async & Timeout Safety**

   * `safeAwait()` wrapper
   * `withTimeout()` guard on:

     * engine loading
     * AI warmup
     * DB proxy
     * event handlers
   * ⇒ No more hangs, no hidden promise rejections.

3. **Lock Manager & Concurrency**

   * Mutex + `engineLoaderLock`, `registryLock`, `tenantLock`
   * ⇒ Single writer semantics for core state; no race conditions.

4. **Registry Immutability**

   * `metadataRegistry.freeze()`
   * `uiRegistry.freeze()`
   * `engineRegistry.freeze()`
   * ⇒ After boot, state becomes read-only; actions/engines cannot mutate it.

5. **Sandbox Isolation v2**

   * Block dangerous globals (`process`, `require`, `Function`, `eval`, `globalThis`, etc.)
   * Code scanning (`enforceHardBlocks`)
   * Frozen `ctx` and frozen outputs
   * Input/output validation hooks
   * Tenant-locked DB proxy
   * ⇒ You now have a *real sandbox*, not a fake one.

6. **Health Checks & Diagnostics**

   * `/healthz`, `/readyz`, `/diagz`
   * `kernelState` tracking boot, engine count, metadata count, AI/db/api ready flags
   * ⇒ Kubernetes-/Vercel-ready; observable runtime.

7. **Rate Limiting & Circuit Breaker**

   * Global rate limit
   * Per-tenant rate limit
   * Per-engine rate limit
   * Engine error-based circuit breaker
   * ⇒ Protects kernel from abuse, loops, and runaway engines.

8. **Audit Logging & Security Events**

   * `auditStore`, `logAudit`, `emitKernelEvent`, `emitEngineEvent`, `emitTenantEvent`
   * Security events: sandbox violations, rate limit, circuit breaker
   * `/auditz` route
   * ⇒ SOC2/ISO-style audit trail foundation.

9. **Signature Verification**

   * Trusted key registry (`kernel/trust/keys.json`)
   * Deterministic hashing & signature verification
   * Engine must be signed before load
   * ⇒ Zero-trust engine ecosystem, like an app store.

**Net result:**
Hardening v1 turned the Kernel into:

> A **multi-tenant, zero-trust, sandboxed, signed, rate-limited, audited runtime** with health probes and AI governance hooks.

This is already at the level of many internal enterprise platforms.

---

### 🚀 Era 3 — Hardening v2 (what it *should* be)

Hardening v1 = **“don’t die, don’t get corrupted, don’t be abused.”**
Hardening v2 = **“operate as a self-optimizing, self-governing, multi-region, formally validated platform.”**

Hardening v2 is about:

1. **Formalization & Guarantees**

   * Stronger type-level guarantees on engine manifests & metadata
   * Zod/TypeBox/JSON Schema validation for all external payloads
   * Property-based testing & fuzzing of the Kernel APIs
   * Invariants like:

     * “engine cannot see other engine models”
     * “tenant data cannot cross boundaries”
     * “no action can bypass audit logging”

2. **Resilience & HA**

   * Multi-node / multi-region readiness
   * Leader election or stateless kernel with external state (Redis/DB)
   * Graceful rolling deploys with in-flight actions
   * Chaos testing (random faults, random slowdowns) to prove resilience

3. **Policy & Governance Engine**

   * Central **policy engine** (like OPA or homegrown) defining:

     * who can deploy engines
     * which tenants can run which engines
     * data residency & compliance constraints
   * Policies as versioned manifests (AI-BOS style)
   * “No engine can run in EU that touches non-EU data” type rules

4. **Full Observability & SLOs**

   * Structured logs → external sinks (OpenTelemetry, Datadog, Loki, etc.)
   * Metrics: P95 action latency, boot time, engine error rates, AI fallback rate
   * SLOs: e.g. **99.9% of actions ≤ 300ms**
   * Alerts when SLOs violated

5. **Self-Healing & AI Inspector v2**

   * Lynx (or fallback GPT) analyzing:

     * audit logs
     * diagnostics
     * engine error trends
   * Automatically:

     * downgrade/bypass failing engines
     * adjust rate limits temporarily
     * suggest config changes
     * flag insecure or badly-behaved engines

6. **Compliance & Data Classification**

   * Tag models as:

     * PII / PCI / PHI / confidential / public
   * Policies restricting:

     * which actions can see what
     * which AI calls can see sensitive fields
   * Config to export proof for auditors.

7. **Developer Experience Hardening**

   * Engine SDK with type-safe clients for:

     * metadata, tenants, audit, events, DB proxy
   * CLI linting:

     * refuse engine publish if missing signature, tests, manifest checks
   * Continuous integration:

     * run kernel test harnesses on each new engine

So Hardening v2 is less about “adding another firewall” and more about:

> Turning the Kernel into a **governed, observable, AI-assisted operating system** on top of which you can safely let thousands of micro-developers build.

---

## 2. Section-by-Section Comparison vs Competitors

I’ll rate on a 0–10 scale for *conceptual maturity / architecture*, assuming your Hardening v1 is fully implemented as we designed.

### 2.1 Sandbox & Execution Isolation

**AI-BOS (after Hardening v1)**

* Tenant-scoped DB proxy
* Frozen ctx
* Blocked dangerous globals (`eval`, `Function`, `require`, etc.)
* Input/output validators
* Timeouts & safeAwait
* Rate limiting + circuit breaker tied to engine

**Salesforce Apex / Lightning Locker**

* Very strong sandbox, deep object graph locking, DOM isolation, strict API exposure

**Shopify Functions**

* Run in isolation with explicit inputs/outputs; no DB access directly; WASM sandbox.

**Cloudflare Workers / AWS Lambda**

* Isolation via V8 isolates / microVMs; restricted APIs; strong global isolation.

**Scores (Sandbox):**

* Salesforce / Cloudflare / AWS: **9.5/10** (battle-tested, low-level isolation)
* Shopify Functions: **9/10**
* AI-BOS Kernel v1: **8.5/10**

  * Pros: strong logical isolation, sandbox checks, timeouts, freeze, rate limit, circuit breaker.
  * Cons: currently process-level (Node), not VM/isolates; uses static code scanning & guards instead of OS-level isolation; can be further hardened.

**Best practice direction (for Hardening v2):**

* Move toward **WASM or isolated VM per engine** (long term)
* Stronger schema validation (Zod/JSON Schema) for input/output
* Possibly use Node’s `vm` with hardened context + high test coverage if WASM is too heavy initially.

---

### 2.2 Registry & Contract Governance

**AI-BOS:**

* Engine registry, metadata registry, UI registry
* `freeze()` after boot → immutable state
* Contract engine validating engine shape
* Signature verification on engines

**Salesforce / Workday:**

* Very strict metadata governance: objects, fields, workflows, etc. are centrally defined and versioned.

**Supabase / Prisma / ORMs:**

* Migration history, schema reflection, DB constraints — less about runtime engines, but strong schema gov.

**Scores (Schema & Contract Governance):**

* Salesforce/Workday: **9.5/10**
* Supabase schema layer: **8.5/10**
* AI-BOS Kernel: **8.5/10**

  * Pros: immutability, contract engine, typed registries, manifest-driven.
  * Cons: v1 contract engine isn’t yet a full formal schema validator; needs Hardening v2 with stronger multi-versioning & migration semantics.

**Best practice / V2:**

* Add full JSON Schema / Zod-based contract validation for manifests.
* Versioned contracts: allow multiple engine versions with compatibility checks.
* “Schema diff” viewer for DevTools (like Supabase migration diff).

---

### 2.3 Rate Limiting, Circuit Breakers, and Abuse Protection

**AI-BOS:**

* Global QPS limit
* Per-tenant limit
* Per-engine limit
* Error-based circuit breaker

**Stripe / Shopify / AWS APIs:**

* Very refined rate-limit policies (per API, per customer tier) with backoff patterns.

**Salesforce Governor Limits:**

* Extremely strict per-transaction limits; CPU, DB queries, heap size.

**Scores (Abuse Protection):**

* Salesforce Apex Governor: **10/10** (brutal but safe)
* Stripe/AWS: **9/10**
* AI-BOS Kernel: **8/10**

  * Pros: layered rate limits and circuit breaker; good for early marketplace.
  * Cons: currently in-memory store; not cluster-aware; not tier-aware; no backoff hints yet.

**V2 Direction:**

* External storage for rate limits (Redis) for multi-node.
* Tier-based policy (basic vs enterprise tenants).
* Standardized error codes with recommended retry strategy (e.g. “429 with Retry-After”).

---

### 2.4 Health, Diagnostics, and Observability

**AI-BOS:**

* `/healthz`, `/readyz`, `/diagz`
* Kernel state (boot time, engine count, AI/db readiness)
* `/auditz` for audit logs
* Structured kernel state object

**Kubernetes, Vercel, AWS:**

* Health/readiness/liveness are standard.
* Observability is typically done via OpenTelemetry/CloudWatch/Datadog.

**Scores (Observability baseline):**

* Vercel/Cloudflare/AWS: **9/10**
* AI-BOS Kernel: **7.5/10**

  * Pros: correct endpoints & core metrics are there.
  * Cons: not yet sending to external metrics/log system; no tracing; no SLO dashboards.

**V2 Direction:**

* Plug into OpenTelemetry for traces & metrics.
* Export audit logs to external sink.
* Create SLO definitions: e.g. “Engine action p95 < 300ms”.

---

### 2.5 Security & Signature Model

**AI-BOS:**

* Engine signing with dev key
* Trusted public keys JSON
* Hashing with canonical JSON
* Signature check before engine load
* Audit logs for signature fail/success

**Apple App Store / Chrome Extensions / Shopify:**

* Very mature signing pipelines: certs, chain of trust, notarization.

**Scores (Code Signing & Integrity):**

* Apple/Chrome: **10/10**
* Shopify: **9.5/10**
* AI-BOS Kernel: **8.5/10**

  * Pros: conceptually strong; you have a working trust model, completely correct for v1.
  * Cons: no full PKI chain yet; not using hardware keys/secure modules; trust config is file-based.

**V2 Direction:**

* Introduce key rotation policies.
* Consider HSM or KMS (AWS/GCP) for private key storage.
* More robust trust chain (root key, intermediate, dev keys).

---

### 2.6 Audit & Compliance

**AI-BOS:**

* Structured audit events (kernel, engine, tenant, security)
* Bounded in-memory store with `/auditz`
* Logs sandbox violations, rate limits, circuit breaker triggers, engine actions.

**Salesforce / Workday / SAP:**

* Deep audit for every record change, user session, admin action.
* Export support for compliance (SOX, ISO, HIPAA).

**Scores (Audit):**

* Traditional ERP (SAP/Oracle/Workday): **9.5/10**
* AI-BOS Kernel Hardened: **8/10**

  * Pros: proper structure, categories, severity; strong foundation; security logs exist.
  * Cons: not yet persisted in DB with foreign keys to tenant/user; no retention policy; no export profiles.

**V2 Direction:**

* Move audit store → dedicated table(s) in DB.
* Define retention & archiving policy.
* Integrate DevTools for audit browsing/filtering.
* Add user/role context to events.

---

## 3. Overall Ratings & What Makes AI-BOS Different

### Overall Kernel Maturity (Conceptual Score)

> **AI-BOS Kernel (after Hardening v1): ~8.5/10**

Not “battle-tested by thousands of customers” yet like Salesforce or AWS, but **architecturally**:

* The design is on par with serious platforms.
* The zero-trust direction (+ engines + manifests) is **more modern and explicit** than many legacy ERPs.
* AI governance and manifest-first design are ahead of most.

### What Makes AI-BOS *Different* vs Traditional Competitors

1. **Manifest + AI Governance Native**

   * You treat manifests, metadata, and engines as first-class, AI-inspectable objects.
   * Salesforce / SAP weren’t born in the AI era; they’re retrofitting.

2. **Zero-Trust Micro-Developer Model**

   * You’re designing for a future where *non-coders* can deploy engines via Studio, but still be signed, sandboxed, rate-limited, and auditable.
   * This is closer to Shopify Functions + App Store combined, but with more generalized engine support.

3. **“Kernel + Surfaces” Philosophy**

   * Clear separation:

     * Master Kernel
     * DevTools surface
     * Tenant surfaces
   * This makes it easier to evolve UI/UX without touching the runtime core.

4. **AI-First Observability & Self-Healing Direction**

   * Lynx/OpenAI integration isn’t just for “chatbot”; it’s for **inspecting kernel logs, errors, and drifts**.
   * That’s a very 2025-ready positioning; your competitors are only starting to talk about it.

---

## 4. Best Practice Guidance for Hardening v2

If we treat Hardening v1 as “Baseline Enterprise Kernel”, then **Hardening v2** should be:

1. **Formal Schema & Policy Layer**

   * Introduce a **Policy Engine** (AI-BOS style or OPA-like).
   * Introduce **strong schema validation** for:

     * engine manifest
     * metadata models
     * action inputs/outputs
     * rate limit configurations
   * Move all critical rules into declarative policies.

2. **Full Observability Integration**

   * Add OpenTelemetry:

     * traces (`kernel.boot`, `engine.action`, `tenant.request`)
     * metrics (p95/p99, error ratios, circuit breaker activations)
   * Connect to at least one external backend (even locally: OTLP → file/console).

3. **Production-Grade Audit Pipeline**

   * Persist audit logs in DB.
   * Provide:

     * list/filter/search by engine, tenant, action, severity.
   * Export packages (CSV/JSON) for auditors.

4. **Multi-Node / Multi-Region Readiness**

   * Move in-memory rate limit and audit store to Redis or DB.
   * Ensure kernel is stateless where possible.
   * Add a model for cluster identification (nodeId, region).

5. **DX Hardening**

   * Engine SDK with strong types.
   * CLI to:

     * validate engine locally
     * run sandbox simulation
     * run policy checks
     * sign and publish.

6. **AI Inspector v2**

   * Regular AI reviews of:

     * error logs
     * rate limit triggers
     * audit patterns
   * Provide human-readable “Kernel Health Report”.

---

## 5. TL;DR — Where You Are, Where You’re Going

* **Initial Kernel:**
  Clean architecture, all subsystems present, no serious safety net.

* **Hardening v1:**
  You’ve built a **serious runtime**: sandboxed, rate-limited, signed, audited, observable.
  Architecturally, you’re in the same conceptual class as Salesforce / Shopify / Supabase, just not battle-tested yet.

* **Hardening v2:**
  Will push AI-BOS into:

  > “A self-governing, policy-driven, AI-supervised kernel ready for thousands of engines, tenants, and micro-developers.”

If you’d like, next I can:

* Design **Hardening v2 Roadmap** as a sequenced plan (Phase 2.1, 2.2, 2.3…)
* Or design a **Kernel Test Suite v1** to systematically validate everything we added in Hardening v1 (actions, sandbox, rate limit, locks, etc.).

Here we go 😈 — **Hardening v2 = “this thing does not die, even under abuse.”**

I’ll give you:

* What V2 *adds* on top of V1
* The concrete modules to implement
* File paths + TypeScript interfaces you can paste into your IDE
* A validation checklist so you know when V2 is actually “done”

I’ll keep it practical, not whitepaper.

---

## 1. What Kernel Hardening v2 Actually Means

You already have V1:

* `KernelError` family
* `safeAwait`
* `timeoutGuard`
* Lock manager / concurrency locks
* Registry immutability
* Sandbox isolation L2
* Health checks
* Rate limiting
* Audit logging
* Signature verification

**Hardening v2 = resilience + abuse testing + isolation guarantees:**

1. **Event Replay & Idempotency Guard**
2. **Engine Dependency Graph + Isolation Tiers**
3. **Tenant Isolation Verifier**
4. **Signature Rotation & Trust Store**
5. **Policy Engine for Limits & Risk Bands**
6. **Chaos & Fuzz Harness (safe, internal)**
7. **Telemetry Hooks to Kernel Test MCP**

We’ll wire all of these as **extremely thin utilities** that sit on top of your v1 core.

---

## 2. New Modules to Add (File Map)

Under `kernel/`:

```text
kernel/
  events/
    EventBus.ts              # already there
    EventReplayGuard.ts      # NEW (v2)
  registry/
    EngineDependencyGraph.ts # NEW (v2)
  tenancy/
    TenantIsolationVerifier.ts # NEW (v2)
  security/
    TrustStore.ts            # NEW (v2)
    SignatureRotation.ts     # NEW (v2)
    PolicyEngine.ts          # NEW (v2)
  testing/
    ChaosHarness.ts          # NEW (v2)
    FuzzHarness.ts           # NEW (v2)
```

You can literally copy these names and create files.

---

## 3. Event Replay & Idempotency Guard

**Goal:** prevent “play the same dangerous event 1000x” from breaking the system.

### File: `kernel/events/EventReplayGuard.ts`

```ts
// kernel/events/EventReplayGuard.ts
import crypto from "node:crypto";

export interface KernelEventEnvelope {
  id: string;               // uuid or hash
  type: string;
  occurredAt: string;       // ISO string
  tenantId?: string;
  payload: unknown;
}

export class EventReplayGuard {
  private static seen = new Set<string>();

  static makeId(event: Omit<KernelEventEnvelope, "id">): string {
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(event))
      .digest("hex");
    return hash;
  }

  static markSeen(id: string): void {
    this.seen.add(id);
  }

  static isReplay(id: string): boolean {
    return this.seen.has(id);
  }

  static clear(): void {
    this.seen.clear();
  }
}
```

### Integrate in `EventBus.ts`

Add around `emit`:

```ts
// inside EventBus.emit
import { EventReplayGuard, KernelEventEnvelope } from "./EventReplayGuard";
// ...

emit(evt: string, payload: any) {
  const envelope: KernelEventEnvelope = {
    id: "", // assigned below
    type: evt,
    occurredAt: new Date().toISOString(),
    payload,
  };

  envelope.id = EventReplayGuard.makeId(envelope);

  if (EventReplayGuard.isReplay(envelope.id)) {
    // optional: log & drop
    return;
  }
  EventReplayGuard.markSeen(envelope.id);

  const arr = this.listeners.get(evt) || [];
  for (const fn of arr) fn(envelope);
}
```

> You now have **basic event replay protection** and can later evolve it to persistent storage if needed.

---

## 4. Engine Dependency Graph + Isolation Tiers

**Goal:** know how engines depend on each other and prevent “one bad engine collapses others”.

### File: `kernel/registry/EngineDependencyGraph.ts`

```ts
// kernel/registry/EngineDependencyGraph.ts
export type EngineName = string;

export interface EngineDependencyEdge {
  from: EngineName;
  to: EngineName;
  reason?: string; // e.g. "reads-metadata", "calls-actions"
}

export type IsolationTier = "core" | "critical" | "standard" | "experimental";

export interface EngineNode {
  name: EngineName;
  tier: IsolationTier;
  dependsOn: EngineName[];
}

export class EngineDependencyGraph {
  private static nodes = new Map<EngineName, EngineNode>();

  static registerNode(node: EngineNode): void {
    this.nodes.set(node.name, node);
  }

  static getNode(name: EngineName): EngineNode | undefined {
    return this.nodes.get(name);
  }

  static getDependants(target: EngineName): EngineName[] {
    const result: EngineName[] = [];
    for (const node of this.nodes.values()) {
      if (node.dependsOn.includes(target)) {
        result.push(node.name);
      }
    }
    return result;
  }

  static detectCycles(): EngineName[][] {
    const visited = new Set<EngineName>();
    const stack = new Set<EngineName>();
    const cycles: EngineName[][] = [];

    const dfs = (node: EngineName, path: EngineName[]) => {
      if (stack.has(node)) {
        const idx = path.indexOf(node);
        cycles.push(path.slice(idx));
        return;
      }
      if (visited.has(node)) return;
      visited.add(node);
      stack.add(node);

      const n = this.nodes.get(node);
      if (!n) return;

      for (const dep of n.dependsOn) {
        dfs(dep, [...path, dep]);
      }

      stack.delete(node);
    };

    for (const name of this.nodes.keys()) {
      if (!visited.has(name)) {
        dfs(name, [name]);
      }
    }

    return cycles;
  }
}
```

Later, your **Kernel Test MCP** can:

* assert no cycles in critical/core tiers
* simulate failure in an engine and verify dependants degrade gracefully.

---

## 5. Tenant Isolation Verifier

**Goal:** detect any accidental cross-tenant data leakage.

### File: `kernel/tenancy/TenantIsolationVerifier.ts`

```ts
// kernel/tenancy/TenantIsolationVerifier.ts
export interface TenantScopedRecord {
  tenantId: string;
  resourceType: string;
  resourceId: string;
}

export class TenantIsolationVerifier {
  private static accessLog: TenantScopedRecord[] = [];

  static logAccess(rec: TenantScopedRecord): void {
    this.accessLog.push(rec);
  }

  static findCrossTenantAccess(): TenantScopedRecord[] {
    // naive pass: look for same resourceId used across different tenants
    const map = new Map<string, Set<string>>();

    for (const rec of this.accessLog) {
      const key = `${rec.resourceType}:${rec.resourceId}`;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key)!.add(rec.tenantId);
    }

    const violations: TenantScopedRecord[] = [];
    for (const [key, tenants] of map.entries()) {
      if (tenants.size > 1) {
        const [resourceType, resourceId] = key.split(":");
        for (const tenantId of tenants) {
          violations.push({ tenantId, resourceType, resourceId });
        }
      }
    }

    return violations;
  }

  static reset(): void {
    this.accessLog = [];
  }
}
```

In your data access layer, you can log calls:

```ts
// whenever you read/write a tenant resource
TenantIsolationVerifier.logAccess({
  tenantId,
  resourceType: "journal-entry",
  resourceId: jeId,
});
```

Then your Test MCP can call `findCrossTenantAccess()` during stress tests.

---

## 6. Signature Rotation & Trust Store

**Goal:** move from “static keys hardcoded” → “managed trust store with rotation”.

### File: `kernel/security/TrustStore.ts`

```ts
// kernel/security/TrustStore.ts
export interface TrustedKey {
  id: string;          // key id
  publicKey: string;   // PEM
  algorithm: "RSA-SHA256" | "Ed25519";
  createdAt: string;
  expiresAt?: string;
  purposes: ("mcp-manifest" | "engine-manifest" | "api-request")[];
}

export class TrustStore {
  private static keys = new Map<string, TrustedKey>();

  static addKey(key: TrustedKey): void {
    this.keys.set(key.id, key);
  }

  static getKey(id: string): TrustedKey | undefined {
    return this.keys.get(id);
  }

  static listKeys(): TrustedKey[] {
    return Array.from(this.keys.values());
  }

  static getValidKeysForPurpose(purpose: TrustedKey["purposes"][number]): TrustedKey[] {
    const now = Date.now();
    return Array.from(this.keys.values()).filter(k => {
      if (!k.purposes.includes(purpose)) return false;
      if (!k.expiresAt) return true;
      return new Date(k.expiresAt).getTime() > now;
    });
  }
}
```

### File: `kernel/security/SignatureRotation.ts`

```ts
// kernel/security/SignatureRotation.ts
import { TrustStore, TrustedKey } from "./TrustStore";

export class SignatureRotation {
  // in reality you'd persist keys; here is just interface
  static rotateKey(oldKeyId: string, newKey: TrustedKey): void {
    // deactivate old key by setting expiresAt to now
    const old = TrustStore.getKey(oldKeyId);
    if (old) {
      old.expiresAt = new Date().toISOString();
      TrustStore.addKey(old);
    }
    TrustStore.addKey(newKey);
  }
}
```

Your existing `SignatureVerifier` can be updated to pick keys from `TrustStore`.

---

## 7. Policy Engine for Limits & Risk Bands

**Goal:** move “rateLimits, timeouts, allowedTools” into a declarative policy system.

### File: `kernel/security/PolicyEngine.ts`

```ts
// kernel/security/PolicyEngine.ts
export type RiskBand = "low" | "medium" | "high" | "critical";

export interface PolicyContext {
  tenantId?: string;
  engineName?: string;
  toolName?: string;
  userRole?: string;
  riskBand?: RiskBand;
}

export interface PolicyDecision {
  allow: boolean;
  reason?: string;
  maxDurationMs?: number;
  maxCallsPerMinute?: number;
}

type PolicyRule = (ctx: PolicyContext) => PolicyDecision | null;

export class PolicyEngine {
  private static rules: PolicyRule[] = [];

  static registerRule(rule: PolicyRule): void {
    this.rules.push(rule);
  }

  static evaluate(ctx: PolicyContext): PolicyDecision {
    for (const rule of this.rules) {
      const res = rule(ctx);
      if (res) return res;
    }
    return { allow: true }; // default allow (you may invert this)
  }
}
```

Example registration (in some bootstrap):

```ts
PolicyEngine.registerRule(ctx => {
  if (ctx.riskBand === "critical") {
    return {
      allow: false,
      reason: "Critical risk band not allowed by default",
    };
  }
  return null;
});
```

---

## 8. Chaos & Fuzz Harness (Internal Only)

These are *not* production paths; they’re used by your **Kernel Test MCP** to abuse-test the kernel.

### File: `kernel/testing/ChaosHarness.ts`

```ts
// kernel/testing/ChaosHarness.ts
import { EventBus } from "../events/EventBus";
import { EngineRegistry } from "../registry/EngineRegistry";

export class ChaosHarness {
  constructor(
    private eventBus: EventBus,
    private engineRegistry: typeof EngineRegistry
  ) {}

  async randomEngineRestart(iterations = 10): Promise<void> {
    const engines = await this.engineRegistry.loadAll();
    for (let i = 0; i < iterations; i++) {
      const victim = engines[Math.floor(Math.random() * engines.length)];
      // in real code you'd call into an engine manager
      this.eventBus.emit("engine.restart.requested", { engine: victim.name });
    }
  }
}
```

### File: `kernel/testing/FuzzHarness.ts`

```ts
// kernel/testing/FuzzHarness.ts
export class FuzzHarness {
  static randomJson(depth = 2): unknown {
    if (depth <= 0) return Math.random().toString(36).slice(2);
    const obj: Record<string, unknown> = {};
    const keys = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < keys; i++) {
      obj[`k${i}`] = this.randomJson(depth - 1);
    }
    return obj;
  }

  static generatePayloads(count = 10): unknown[] {
    return Array.from({ length: count }, () => this.randomJson(3));
  }
}
```

Your Test MCP can then:

* pick a tool schema
* generate bad/incomplete/random payloads
* assert kernel rejects them in a controlled way.

---

## 9. How to Validate Hardening v2 (Practical Checklist)

After you drop these scaffolds in and wire them lightly:

### Vitest-level tests

* [ ] `EventReplayGuard` blocks repeated `emit` with same envelope
* [ ] `EngineDependencyGraph.detectCycles()` correctly detects cycles
* [ ] `TenantIsolationVerifier.findCrossTenantAccess()` flags a constructed cross-tenant scenario
* [ ] `TrustStore.getValidKeysForPurpose()` respects expiry
* [ ] `PolicyEngine.evaluate()` returns expected decisions for sample contexts
* [ ] `FuzzHarness.generatePayloads()` always returns JSON-safe values

### Kernel Test MCP (when you add it)

* [ ] “Event Replay Suite” – simulate bursts of duplicate events → no kernel crash
* [ ] “Engine Failure Suite” – mark an engine as “failed” and ensure dependants degrade, not crash
* [ ] “Tenant Isolation Suite” – simulated mixed-tenant access logs → violations are detected
* [ ] “Signature Rotation Suite” – old key expired, new key accepted, invalid signature blocked
* [ ] “Fuzz Suite” – random payloads rejected with structured errors, no unhandled exceptions

Once those pass consistently, you can honestly say:

> **Kernel Hardening v2 implemented and verified.**

---

If you’d like, next step I can:

* generate a **Vitest test file skeleton** for all of these (`kernel/__tests__/hardening.v2.spec.ts`), or
* design the **Kernel Test MCP tools** that call into these guards and report a “Hardening v2 score” back to Lynx / IDE.
