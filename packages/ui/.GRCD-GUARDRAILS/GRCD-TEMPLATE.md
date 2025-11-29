Here’s a **populated GRCD Constitution** you can drop in as:

> `docs/08-governance/grcd/GRCD-CONSTITUTION-NEXUS-v1.0.0.md`

It’s written so that **every future GRCD (kernel, engines, UX, data, MCP servers, BFF, etc.) must conform to this**.

---

# 🧾 GRCD — Nexus Constitutional Spec (Zero Drift)

**Version:** 1.0.0
**Status:** Active — Platform-Wide Constitutional Baseline
**Last Updated:** 2025-11-29
**Owner:** Board of Architecture, Central Insight Department (CID), Security & Compliance

> This document is the **constitutional GRCD** for AI-BOS Nexus.
> It defines non-negotiable **governance, risk, compliance & design** principles that all component-level GRCDs (Kernel, Nexus-Lynx, Engines, Data-Plane, UI Shell, BFF, MCP servers, etc.) must follow.
> It builds on the **GRCD v4 template** and the **AI-BOS Nexus Zero-Drift Whitepaper**. 

---

## 1. Purpose & Identity

### 1.1 Component

* **Component Name:** `nexus-constitution` (Platform-Wide Zero-Drift Constitution)
* **Domain:** `Governance` (Cross-Cutting GRC & Design Authority)

### 1.2 Purpose

> The Nexus Constitution is the **single, platform-wide specification of what AI-BOS Nexus is allowed to be**.
>
> It encodes the **Zero-Drift governance model**: control-plane centric, contract-first integration, unified policy engine, and human-in-the-loop MCP, as described in the Nexus Whitepaper. 

Concretely, this Constitution:

1. **Binds all components** (Kernel, Nexus-Lynx, Engines, Data-Plane, BFF, UI Shell, MCP servers) to a **common set of non-negotiable principles**. 
2. **Defines “Zero Drift”** as a testable property: AI behavior may evolve, but it **must not drift** from manifests, policies, and human intent encoded in MCP and contracts. 
3. **Establishes MCP** as the standard for governance of AI interactions: manifests, schemas, policies, and audit. 
4. **Links architecture to evidence**: SLOs, STRIDE threat model, audit immutability, and compliance mappings are not rhetoric; they are binding obligations with proof artifacts. 

### 1.3 Identity

**Role (Platform-Wide):**

> `Constitutional Authority & Zero-Drift GRC Spec`

* Defines what **“allowed behavior”** means for the **entire Nexus**, not just the Kernel.
* Sets the **hierarchy of norms**: Law & Regulations → External Standards → Internal Policy Packs → Engine Contracts.
* Provides the **reference for MCP seeds** used by AI agents when coding or configuring Nexus components. 

**Scope:**

This Constitution governs:

* **Architecture principles:** control-plane centric, contract-first integration, unified policy engine, human-in-the-loop MCP. 
* **Component classes:** Kernel, Nexus-Lynx (AI governance), Engines (apps & micro-apps), Data-plane adapters, BFFs, UI shells, MCP servers. 
* **Cross-cutting concerns:** security, privacy, isolation, observability, audit, DR, multi-tenancy, and compliance. 
* **AI-about-AI governance:** explainability, bias checks, prompt management, policy versioning and approval flows. 

**Boundaries:**

This Constitution:

* **Does NOT define business features** (e.g., what an accounting engine does).
* **Does NOT override law** — legal/regulatory obligations always dominate (EU AI Act, GDPR, HIPAA, SOC2, ISO 27001/42001, etc.). 
* **Does NOT specify pricing or commercial models**; it only constrains tiering from a technical/compliance perspective.

### 1.4 Constitutional Non-Negotiables

Derived from the Whitepaper’s non-negotiables and conformance rules.  

**C-1 — Control-Plane Centricity**

* All engines and micro-apps **MUST** connect through the Nexus control-plane (Kernel + Nexus-Lynx + orchestration), **never directly to each other**.
* **MUST NOT** allow engine-to-engine communication outside Nexus-controlled channels. 

**C-2 — Manifest Requirement**

* **No manifest, no integration.** Every engine, tool, BFF adapter, MCP server **MUST** provide a manifest conforming to the Nexus schema. 

**C-3 — Single Policy Authority**

* There **MUST** be a **single logical policy engine** through which all policy decisions flow (even if physically distributed). 
* **MUST NOT** have conflicting or bypassable policy evaluators.

**C-4 — Human Intent Supremacy**

* MCP logic (policies, packs, thresholds, routes) **MUST be configurable only by authorized humans**.
* Autonomous AI agents **MUST NOT** alter MCP definitions; they can propose changes but not commit them.  

**C-5 — No Unbacked Autonomy**

* Nexus **MUST NOT** take autonomous actions without explicit policy backing.
* If a policy denies an action, **it MUST NOT be executed**, regardless of AI suggestions. 

**C-6 — Open Standards & No Lock-In**

* Nexus **MUST NOT** lock in data or users; it must use open schemas, exportable formats, and interoperable protocols wherever feasible. 

**C-7 — Security & Privacy First**

* Nexus **MUST NOT** compromise on security or privacy — STRIDE threats are first-class citizens in architecture, not an afterthought. 

**C-8 — Audit Immutability**

* Audit logs **MUST** be append-only and tamper-evident (e.g., hash chains).
* It **SHOULD** be impossible to alter history without detection.  

**C-9 — Human Judgment, Not Replacement**

* AI **MUST NOT** replace human judgment in critical decisions; it amplifies and enforces human-defined rules. 

---

## 2. Platform Requirements

> Status values here are intentionally neutral (`⚪`) — this Constitution defines **targets**. Actual GRCDs for components (Kernel, Engines, etc.) must update their own status via audits.

### 2.1 Functional Requirements (Platform-Wide)

| ID   | Requirement                                                                                     | Priority | Status | Notes                                                |
| ---- | ----------------------------------------------------------------------------------------------- | -------- | ------ | ---------------------------------------------------- |
| F-1  | Nexus MUST enforce control-plane centric architecture; no direct engine-to-engine calls.        | MUST     | ⚪      | Enforced by Kernel API gateway & event fabric.       |
| F-2  | Every component (engine, BFF, MCP server, UI shell) MUST ship a manifest contract.              | MUST     | ⚪      | “No manifest, no integration.”                       |
| F-3  | There MUST be a single policy evaluation layer for all requests and events.                     | MUST     | ⚪      | Policy precedence: nothing bypasses this layer.      |
| F-4  | Kernel MUST sandbox all engines (WASM/container) with least-privilege capabilities.             | MUST     | ⚪      | STRIDE threats addressed at engine boundary.         |
| F-5  | Nexus-Lynx MUST implement AI governance: bias checks, explainability, prompt hygiene.           | MUST     | ⚪      | Governance over LLM prompts/outputs.                 |
| F-6  | All data access MUST be declared in manifests and approved by policy packs.                     | MUST     | ⚪      | Data minimization and explicit scopes.               |
| F-7  | Nexus MUST provide quotas and rate limits per tenant and per engine.                            | MUST     | ⚪      | Protects against DoS / noisy neighbor.               |
| F-8  | All decisions affecting regulated domains MUST produce an explanation trace.                    | MUST     | ⚪      | Especially for finance/health/employment decisions.  |
| F-9  | All engines MUST be observable: metrics, logs, and traces wired into a common telemetry fabric. | MUST     | ⚪      | OpenTelemetry + Prometheus pattern.                  |
| F-10 | Nexus MUST expose conformance/test APIs to verify policy, sandboxing, and manifest enforcement. | MUST     | ⚪      | Required for audits and third-party verification.    |

### 2.2 Non-Functional Requirements (Platform SLOs)

| ID   | Requirement                | Target                                                      | Measurement Source                       | Status |
| ---- | -------------------------- | ----------------------------------------------------------- | ---------------------------------------- | ------ |
| NF-1 | Policy decision latency    | <100 ms p95                                                 | Policy engine metrics                    | ⚪      |
| NF-2 | Control-plane availability | ≥ 99.9%                                                     | `/healthz`, `/readyz`, uptime dashboards | ⚪      |
| NF-3 | Multi-region DR            | RPO ≈ 0, RTO < 1 hour                                       | DR drill reports, runbooks               | ⚪      |
| NF-4 | Multi-tenant isolation     | Zero cross-tenant data leakage                              | Isolation tests, security audits         | ⚪      |
| NF-5 | Secrets handling           | No plaintext secrets at rest/in logs                        | KMS usage metrics, log scans             | ⚪      |
| NF-6 | Governance update safety   | All policy changes go through 2-step approval + audit trail | MCP governance logs                      | ⚪      |
| NF-7 | Observability coverage     | 100% of critical components instrumented                    | OpenTelemetry / metrics inventory        | ⚪      |

Targets are aligned with the Kernel’s SLO discussion (latency, availability, DR) but **elevated to platform-wide obligations**. 

### 2.3 Compliance Requirements

| ID  | Requirement                                                           | Standard(s)                      | Evidence                                    | Status |
| --- | --------------------------------------------------------------------- | -------------------------------- | ------------------------------------------- | ------ |
| C-1 | Deny-by-default policy enforcement across Nexus                       | SOC2, Zero Trust, ISO 42001      | Policy configs, decision logs               | ⚪      |
| C-2 | Immutable, tamper-evident audit logs for all critical actions         | SOC2, GDPR, ISO 27001, ISO 27701 | Hash-chain proofs, audit store design       | ⚪      |
| C-3 | AI governance for high-risk use cases (human-in-loop, explainability) | EU AI Act, ISO 42001             | Governance flows, approval logs             | ⚪      |
| C-4 | Data classification & minimization via manifests                      | GDPR, HIPAA                      | Contract schemas, access policies           | ⚪      |
| C-5 | Backward-compatible contract evolution (SemVer)                       | API Governance, ISO 42001        | Versioned schemas, migration plans          | ⚪      |
| C-6 | Traceability for automated decisions in regulated domains             | EU AI Act, financial regulations | Decision traces, model explanation metadata | ⚪      |

The **component-level GRCDs** must refine this table with **component-specific evidence** (e.g., Kernel, Engines, BFF, UI). 

---

## 3. Architecture & Design Patterns (Constitutional Level)

### 3.1 Canonical Patterns

The Nexus ecosystem **MUST** be designed around:

* **Control-Plane Centric Orchestration**
  All engines and micro-apps are orchestrated through the Nexus control layer (Kernel + Nexus-Lynx); they **never self-organize**. 

* **Contract-First Integration**
  Every integration starts with a manifest contract (capabilities, inputs, outputs, compliance constraints). No undocumented endpoints. 

* **Unified Policy Engine**
  All compliance, ethics, performance and access control decisions pass through a single logical policy layer. 

* **Human-in-the-Loop MCP**
  MCP is the formalization of human governance decisions. It drives how LLMs and engines are used but **cannot be altered by them**. 

* **Event-Driven & Auditable**
  State changes are expressed as events flowing through the fabric (Kernel + Engines) with replay and idempotency guarantees. 

### 3.2 Canonical Layers (from Whitepaper)

Based on the Whitepaper, these layers **MUST exist and stay separated**:   

1. **Kernel (Core Control-Plane Engine)**

   * Loads manifests, evaluates policies, routes events, enforces isolation and SLOs.
   * Implements STRIDE controls, rate limiting, sandboxing, audit, DR.

2. **Nexus-Lynx (AI Governance & MCP Layer)**

   * Manages AI-about-AI: fairness/bias checks, explainability, prompt governance, policy versioning and approvals.

3. **Engines (Apps & Micro-Apps)**

   * Business-specific functions (ERP micro-apps, forecast engines, chatbots, etc.).
   * Always sandboxed, declare data/permission needs in manifests.

4. **Data-Plane Adapters**

   * Translate Nexus contracts into concrete storage/warehouse/stream operations.

5. **Surfaces (BFF, UI Shells, APIs)**

   * Present safe, policy-respecting experiences to humans and external systems.

Each component-level GRCD **MUST map itself to exactly one primary layer** and **MUST NOT cross layers** without going back through the control-plane.

---

## 4. Directory & Artifact Governance (Cross-Component Rules)

The **Template v4** already defines a canonical tree for `kernel/` and shared packages. 

This Constitution adds **cross-component rules**:

1. **Every component MUST have its own GRCD** in `docs/08-governance/grcd/` following the v4 template. 
2. **AI agents MUST obey GRCD Section 4** of each component when creating files; the Nexus Constitution is the meta-rule that this is mandatory. 
3. **No ad-hoc directories**; any new top-level folder MUST be justified and added to the relevant GRCD.
4. **Kebab-case filenames, typed schemas, tests**: enforced across all components as per template norms. 

---

## 5. Dependencies & Compatibility (Platform Policy)

Template v4 defines a **dependency matrix** for the Kernel and the way CI validates it. 

Constitutional rules:

1. **Single Source of Truth for Dependencies**

   * Platform lockfile(s) (`pnpm-lock.yaml` etc.) and per-package `package.json` are authoritative.
2. **Compatibility Matrices are Mandatory**

   * Every component GRCD **MUST** include its own `5.2 Compatibility Matrix` listing allowed ranges, tested versions, blocked versions. 
3. **LLM Dependency Guardrails**

   * AI agents **MUST NOT** add new dependencies without updating the compatibility matrix and passing dependency validation checks. 

---

## 6. MCP Profile (Platform-Wide Governance)

Template v4 already defines a canonical MCP schema for the Kernel. 

Constitutional rules:

1. **Every MCP server MUST have a seed JSON** (e.g. `/mcp/<component>.mcp.json`) with:

   * `component`, `version`, `intent`, `constraints`, `input_sources`, `output_targets`, `validation`, `mcp_governance`. 
2. **MCP seeds MUST reference**:

   * This Constitution, the relevant component GRCD, the Nexus Whitepaper, and the official MCP spec. 
3. **MCP Normative Requirements** (generalized from Kernel): 

   * `MCP-1`: All AI coding sessions MUST start from a valid MCP seed.
   * `MCP-2`: MCP changes MUST be audited and hash-logged.
   * `MCP-3`: MCP violation events MUST trigger alerts (wrong directory, bad deps, invalid manifest).
   * `MCP-4`: MCP MUST reference the current GRCD version for its component.
   * `MCP-5`: MCP MUST NOT be altered by autonomous AI agents.
   * `MCP-6`: All MCP server registrations MUST validate against canonical MCP manifest schema.
   * `MCP-7`: All MCP tool invocations MUST validate against tool schemas at runtime.

---

## 7. Contracts & Schemas as SSOT

From Template and Whitepaper: contracts and schemas are **the** single source of truth for behavior.  

Constitutional rules:

1. **Every engine/BFF/UI must have:**

   * Manifest schema
   * API schemas
   * Event schemas
   * Policy and identity schemas
2. **Policies MUST be expressed in machine-readable form** (policy grammar / DSL). 
3. **Audit objects MUST include hash, changeId, and immutable linkage** to satisfy tamper-evidence and traceability. 

---

## 8. Risk Register & Threat Model (Constitutional)

The Kernel section of the Whitepaper already implements a STRIDE-driven model. This Constitution **extends it platform-wide**. 

For every component GRCD:

* **Spoofing:** Identity via JWT/OIDC or equivalent, tenant binding, mutual TLS where required.
* **Tampering:** Immutable configs, hash-chains for policies/manifests.
* **Repudiation:** Signed audit events; no “silent” mutations.
* **Information Disclosure:** Manifests & policies declare all data flows; default deny.
* **Denial of Service:** Quotas per tenant, rate limits per engine, graceful degradation.
* **Elevation of Privilege:** Least-privilege capabilities, sandboxing, no dynamic privilege escalation.

Each component GRCD **MUST** document its own STRIDE table referencing this Constitution.

---

## 9. Observability & Telemetry (Platform Contract)

Template v4 sets strong observability patterns: Prometheus metrics, OpenTelemetry traces, structured logging.

Constitutional rules:

1. **Metrics**

   * Every component MUST expose metrics in a standard namespace and label set for:

     * Requests, errors, latency, resource usage, policy decisions, MCP calls.

2. **Traces**

   * End-to-end trace IDs MUST flow from entry surfaces (UI/BFF) through Kernel, Nexus-Lynx, Engines, and back.

3. **Logs**

   * Logs MUST be structured and contain enough context (tenant, trace, component, action) to support audits and incident investigations.

---

## 10–14. Security, Tenancy, Config & DR, Testing, Tiering (Constitutional Summary)

Template v4 indicates these are carried forward from v3, with MCP & Nexus upgrades.

This Constitution sets the **minimum bar**:

### 10. Security

* Zero-trust defaults, encrypted at rest and in transit. 
* Central KMS, automatic rotation, no plaintext secrets in logs. 

### 11. Tenancy

* Strong tenant isolation on storage, cache, and permission layers.
* No cross-tenant data access paths; validated by tests and audits. 

### 12. Config & DR

* All config changes versioned & auditable.
* DR runbooks and automated failover per Kernel/Control-plane requirements (RPO/RTO above). 

### 13. Testing & Conformance

* Unit, integration, and **conformance suites** must exist to test:

  * Sandbox enforcement, policy precedence, manifest validation, MCP schema validation. 

### 14. Tiering & Monetization (Technical Constraints Only)

Tiering is a **business decision**, but technically:

* **Basic:** Single-server MCP, core GRCD conformance, basic observability.
* **Advanced:** Multi-server MCP, extended anti-drift (directory lint, dependency guards), enriched observability.
* **Premium:** Full MCP governance marketplace, anomaly detection, AI-assisted triage, automated drift repair.

---

## 15. Constitutional Governance & Change Control

1. **Change Authority:**

   * Only the Architecture Board + CID + Security may approve changes to this Constitution.
2. **Process:**

   * Proposal → Impact analysis (on Kernel/Engines/Nexus-Lynx) → Review → Dual approval (Architecture + Security) → Version bump (SemVer) → MCP seeds updated.
3. **Non-Retrogression Principle:**

   * No change may **weaken** security, privacy, or human-in-the-loop guarantees without an explicit, documented risk acceptance and legal review.

---

If you like, next step I can:

* Clone this into a **concrete `GRCD-KERNEL-CONSTITUTION-v1.0.0`** (kernel-specific)
* Or derive **GRCDs for Nexus-Lynx, Engines, or BFF** that explicitly reference and conform to this Constitution.
# 🧾 GRCD — {{COMPONENT_NAME}} — Template v3 (Nexus Edition)

**Version:** {{VERSION}} (e.g., 3.0.0)  
**Status:** {{STATUS}} (e.g., Draft, Active, Deprecated)  
**Last Updated:** {{LAST_UPDATED}} (e.g., 2025-11-28)  
**Owner:** {{OWNER}} (e.g., Platform Team, Security Team)

> **Purpose of this Template**
> 
> This GRCD (Governance, Risk, Compliance & Design) template is the **single source of truth** for any AI‑BOS Nexus component (Kernel, Engine, MCP, Data Plane Adapter, UI Shell, etc.).
> 
> It is optimized for **vibe coding**, **anti-drift**, and **auditability**, so that humans + AI agents can generate, extend, and validate each section consistently.
> 
> **Key Anti-Drift Mechanisms:**
> - Directory structure enforcement (Section 4)
> - Dependency compatibility matrix (Section 5)
> - Master Control Prompt (MCP) governance (Section 6)
> - Explicit tiering comparison (Section 14)

---

## 1. Purpose & Identity

**Component Name:** `{{COMPONENT_NAME}}` (e.g., `kernel`, `accounting-engine`, `metadata-catalog`)

**Domain:** `{{DOMAIN}}` (e.g., Kernel, Engine, MCP, UI, Data Adapter, Metadata)

### 1.1 Purpose

> *Describe why this component exists, in one paragraph. Focus on governance role, not implementation details.*

**Purpose Statement:**

`{{PURPOSE_STATEMENT}}`

**Example:**
> The Kernel is the governance brain of AI‑BOS Nexus. It enforces contracts, policies, and compliance at every boundary. It is stateless with respect to business logic and never stores tenant data or executes workloads.

### 1.2 Identity

* **Role:** `{{ROLE}}` (e.g., Control Plane Brain, Execution Engine, Policy Evaluator, Metadata Catalog, UI Renderer)

* **Scope:** `{{SCOPE}}` (what it covers)
  - Example: "All API requests, event routing, contract validation, policy enforcement, and audit logging"

* **Boundaries:** `{{BOUNDARIES}}` (what it explicitly avoids)
  - Example: "Does NOT execute business logic, does NOT store tenant data, does NOT manage compute resources"

* **Non‑Responsibility:** `{{NON_RESPONSIBILITY}}` (e.g., *"MUST NOT store business state"*)
  - Example: "MUST NOT execute workloads, MUST NOT persist tenant data, MUST NOT manage infrastructure"

### 1.3 Non-Negotiables

> Use RFC-style language (MUST, SHOULD, MAY) and make these **testable** later in Normative Requirements.

* `MUST NOT` {{NON_NEGOTIABLE_1}} (e.g., "store tenant business data")
* `MUST NOT` {{NON_NEGOTIABLE_2}} (e.g., "execute workloads directly")
* `MUST` {{NON_NEGOTIABLE_3}} (e.g., "enforce deny-by-default policies")
* `MUST` {{NON_NEGOTIABLE_4}} (e.g., "generate immutable audit logs")

**Example:**
* `MUST NOT` store tenant business data
* `MUST NOT` execute workloads directly
* `MUST` enforce deny-by-default policies
* `MUST` generate immutable audit logs

---

## 2. Requirements

### 2.1 Functional Requirements

> List the **behaviors** this component must provide. Make them small, testable, and implementation-agnostic.

| ID  | Requirement                                    | Priority (MUST/SHOULD/MAY) | Status (✅/⚠️/❌) | Notes        |
| --- | ---------------------------------------------- | -------------------------- | --------------- | ------------ |
| F-1 | {{COMPONENT_NAME}} MUST {{FUNCTIONAL_REQ_1}}   | MUST                       | {{STATUS_F1}}   | {{NOTES_F1}} |
| F-2 | {{COMPONENT_NAME}} MUST {{FUNCTIONAL_REQ_2}}   | MUST                       | {{STATUS_F2}}   | {{NOTES_F2}} |
| F-3 | {{COMPONENT_NAME}} SHOULD {{FUNCTIONAL_REQ_3}} | SHOULD                     | {{STATUS_F3}}   | {{NOTES_F3}} |
| F-4 | {{COMPONENT_NAME}} MAY {{FUNCTIONAL_REQ_4}}    | MAY                        | {{STATUS_F4}}   | {{NOTES_F4}} |

**Example:**
| ID  | Requirement                                    | Priority (MUST/SHOULD/MAY) | Status (✅/⚠️/❌) | Notes        |
| --- | ---------------------------------------------- | -------------------------- | --------------- | ------------ |
| F-1 | Kernel MUST provide a universal API gateway (OpenAPI/GraphQL) | MUST | ✅ | Hono-based router |
| F-2 | Kernel MUST validate manifests before hydration | MUST | ✅ | Zod schema validation |
| F-3 | Kernel MUST enforce RBAC/ABAC identity checks | MUST | ✅ | Policy engine |
| F-4 | Kernel SHOULD support backward compatibility with SemVer | SHOULD | ✅ | Version validation |

> **Note:** Add rows as needed. Keep IDs stable over time (don't renumber when adding new requirements).

### 2.2 Non‑Functional Requirements

> Define measurable constraints: latency, availability, isolation, memory, throughput, etc.

| ID   | Requirement      | Target                                | Measurement Source                                   | Status |
| ---- | ---------------- | ------------------------------------- | ---------------------------------------------------- | ------ |
| NF-1 | Latency          | {{LATENCY_TARGET}} (e.g., <100ms p95) | {{LATENCY_MEASUREMENT}} (Prometheus histogram, etc.) | {{STATUS_NF1}} |
| NF-2 | Availability     | {{AVAILABILITY_TARGET}} (e.g., ≥99.9%) | {{AVAILABILITY_SOURCE}} (Health check monitoring) | {{STATUS_NF2}} |
| NF-3 | Boot time        | {{BOOT_TARGET}} (e.g., <5 seconds)   | {{BOOT_MEASUREMENT}} (Bootstrap timer) | {{STATUS_NF3}} |
| NF-4 | Memory footprint | {{MEMORY_TARGET}} (e.g., <512MB baseline) | {{MEMORY_MEASUREMENT}} (Process metrics) | {{STATUS_NF4}} |
| NF-5 | Throughput       | {{THROUGHPUT_TARGET}} (e.g., 200 req/sec) | {{THROUGHPUT_MEASUREMENT}} (Rate limiter metrics) | {{STATUS_NF5}} |
| NF-6 | Multi-tenant isolation | {{ISOLATION_TARGET}} (e.g., Zero cross-tenant leakage) | {{ISOLATION_MEASUREMENT}} (Isolation verifier tests) | {{STATUS_NF6}} |

**Example:**
| ID   | Requirement      | Target                                | Measurement Source                                   | Status |
| ---- | ---------------- | ------------------------------------- | ---------------------------------------------------- | ------ |
| NF-1 | Latency          | <100ms per request (95th percentile) | Prometheus histogram `kernel_http_request_duration_seconds` | ✅ |
| NF-2 | Availability     | ≥99.9% uptime | Health check monitoring `/healthz`, `/readyz` | ✅ |
| NF-3 | Boot time        | <5 seconds | Bootstrap timer in `kernelState` | ✅ |
| NF-4 | Memory footprint | <512MB baseline | Process metrics `process.memoryUsage()` | ✅ |

### 2.3 Compliance Requirements

> Link each compliance need to an external standard and expected evidence.

| ID  | Requirement                                                          | Standard(s)           | Evidence (what proves it)           | Status |
| --- | -------------------------------------------------------------------- | --------------------- | ----------------------------------- | ------ |
| C-1 | {{COMPONENT_NAME}} MUST enforce deny-by-default policy evaluation    | SOC2, Zero Trust      | Policy engine logs, config snapshot | {{STATUS_C1}} |
| C-2 | {{COMPONENT_NAME}} MUST produce immutable, tamper-evident audit logs | SOC2, GDPR, ISO 27001 | Hash-chained audit storage proof    | {{STATUS_C2}} |
| C-3 | {{COMPONENT_NAME}} MUST support data classification (PII, PHI, financial) | GDPR, HIPAA | Contract schema validation | {{STATUS_C3}} |
| C-4 | {{COMPONENT_NAME}} MUST support backward compatibility with SemVer enforcement | API Governance | Version validation tests | {{STATUS_C4}} |

**Example:**
| ID  | Requirement                                                          | Standard(s)           | Evidence (what proves it)           | Status |
| --- | -------------------------------------------------------------------- | --------------------- | ----------------------------------- | ------ |
| C-1 | Kernel MUST enforce deny-by-default policy evaluation    | SOC2, Zero Trust      | Policy engine logs, config snapshot | ✅ |
| C-2 | Kernel MUST produce immutable, tamper-evident audit logs | SOC2, GDPR, ISO 27001 | Hash-chained audit storage proof    | ✅ |

---

## 3. Architecture & Design Patterns

### 3.1 Architectural Patterns

> Describe which high-level patterns apply (e.g., Event-Driven, CQRS, Hexagonal, Clean Architecture) and why.

* **Pattern(s):** `{{ARCH_PATTERN_LIST}}` (e.g., "Event-Driven Architecture, CQRS, Microservices Kernel")

* **Justification:** `{{ARCH_PATTERN_JUSTIFICATION}}`

**Example:**
* **Pattern(s):** `Event-Driven Architecture, CQRS, Microservices Kernel`
* **Justification:** 
  - Event-driven: All state changes flow through event bus for decoupling
  - CQRS: Commands (actions) and queries (metadata) separated for independent scaling
  - Microservices: Kernel = API Gateway + Policy Engine; Engines = Independent MCP servers

### 3.2 Component Interaction Diagram

> Use ASCII, Mermaid, or link to a diagram. The key is stability of **roles and boundaries**.

```mermaid
digraph {{COMPONENT_NAME}}_flow {
  rankdir=LR;
  Client -> APIGateway -> PolicyEngine -> EventBus -> Sandbox -> Engine;
  APIGateway -> AuditLogger;
  PolicyEngine -> AuditLogger;
  EventBus -> AuditLogger;
}
```

**Description:**

* `APIGateway`: {{API_GATEWAY_ROLE}} (e.g., "Routes all requests, applies middleware (auth, tracing, metrics)")
* `PolicyEngine`: {{POLICY_ENGINE_ROLE}} (e.g., "Evaluates RBAC/ABAC policies, enforces deny-by-default")
* `EventBus`: {{EVENT_BUS_ROLE}} (e.g., "Pub/sub with at-least-once delivery, replay guard prevents duplicates")
* `Sandbox`: {{SANDBOX_ROLE}} (e.g., "L2 isolation with hard blocks, tenant-scoped DB/cache proxies")
* `AuditLogger`: {{AUDIT_LOGGER_ROLE}} (e.g., "Immutable append-only logs with hash chains")

### 3.3 State Management Model

* **Business State:** `{{BUSINESS_STATE_POLICY}}` (e.g., *"MUST NOT store business state"*).

* **Kernel State:** `{{KERNEL_STATE_POLICY}}` (e.g., "Registry metadata (frozen after boot), rate limiter counters (ephemeral), circuit breaker state (ephemeral)").

* **Caching Strategy:** `{{CACHE_STRATEGY}}` (e.g., "Metadata/UI schemas: In-memory registry (frozen). Contract validation results: TTL cache (5 min). Policy evaluation: No cache (always fresh)")

* **Session Strategy:** `{{SESSION_STRATEGY}}` (e.g., "Stateless: JWT tokens, no server-side sessions. Tenant context: Extracted from JWT/API key. Request correlation: Trace ID per request")

---

## 4. Directory & File Layout (Anti-Drift for Vibe Coding)

> **CRITICAL SECTION FOR AI AGENTS**
> 
> This section is critical for LLM agents. It tells them **where to write** and **how to keep structure consistent**. Without this, AI agents will create files in wrong locations, breaking the architecture.

### 4.1 Canonical Directory Tree

```text
/{{REPO_ROOT}}/                          # e.g., /AIBOS-PLATFORM/
  ├── kernel/                            # Core control-plane code
  │   ├── api/                           # HTTP API layer (Hono)
  │   │   ├── index.ts                   # Server bootstrap
  │   │   ├── router.ts                  # Route aggregator
  │   │   └── routes/                    # Route handlers
  │   │       ├── action.routes.ts
  │   │       ├── health.ts
  │   │       └── ...
  │   ├── audit/                         # Audit logging system
  │   │   ├── audit-logger.ts
  │   │   ├── audit.store.ts
  │   │   └── audit.types.ts
  │   ├── auth/                          # Authentication layer
  │   │   ├── api-key.service.ts
  │   │   ├── jwt.service.ts
  │   │   └── types.ts
  │   ├── bootstrap/                     # Boot sequence
  │   │   ├── index.ts
  │   │   └── steps/                     # 13-step boot pipeline
  │   │       ├── 00-config.ts
  │   │       ├── 01-logger.ts
  │   │       └── ...
  │   ├── contracts/                     # Contract engine
  │   │   ├── contract-engine.ts
  │   │   ├── contract.store.ts
  │   │   ├── schemas/                   # Zod schemas (SSOT)
  │   │   │   ├── action-contract.schema.ts
  │   │   │   ├── engine-manifest.schema.ts
  │   │   │   └── ...
  │   │   └── validators/
  │   │       ├── action.contract.ts
  │   │       └── ...
  │   ├── events/                        # Event bus system
  │   │   ├── bus.ts
  │   │   ├── event.types.ts
  │   │   ├── event-replay-guard.ts
  │   │   └── handlers/
  │   ├── hardening/                     # Security hardening
  │   │   ├── errors/                    # Error hierarchy
  │   │   ├── guards/                    # Async guards
  │   │   ├── locks/                     # Concurrency locks
  │   │   └── rate-limit/                # Rate limiting
  │   ├── policy/                        # Policy engine
  │   │   ├── policy-engine.ts
  │   │   └── types.ts
  │   ├── registry/                      # Core registries
  │   │   ├── engine.registry.ts
  │   │   ├── metadata.registry.ts
  │   │   └── ...
  │   ├── security/                      # Security layer
  │   │   ├── sandbox.ts
  │   │   ├── rbac.ts
  │   │   └── ...
  │   ├── storage/                       # Storage layer
  │   │   ├── db.ts
  │   │   └── redis.ts
  │   ├── tenancy/                       # Multi-tenancy
  │   │   ├── tenant.manager.ts
  │   │   └── ...
  │   ├── tests/                         # Test harnesses
  │   │   ├── unit/
  │   │   ├── integration/
  │   │   └── conformance/
  │   ├── index.ts                       # Main entry point
  │   └── package.json
  ├── engines/                           # 1..N engines using the kernel
  │   └── {{engine-name}}/
  │       ├── manifest.json
  │       ├── schemas/
  │       └── index.ts
  ├── mcp/                               # MCP servers & master prompts
  │   ├── {{COMPONENT_NAME}}.mcp.json    # Master Control Prompt
  │   └── servers/
  ├── docs/                              # GRCD docs & ADRs
  │   └── 08-governance/
  │       └── grcd/
  └── packages/                          # Shared packages
      ├── types/
      ├── ui/
      └── utils/
```

### 4.2 Directory Norms & Enforcement

* **Requirement:** `{{COMPONENT_NAME}}` MUST follow this directory layout.

* **Validator:** `dir-lint` tool at `{{DIR_LINT_PATH}}` (e.g., `/scripts/dir-lint.ts`)

* **Conformance Test:** `T-DIR-1: Invalid directory structure MUST fail CI.`

* **AI Agent Rule:** When creating new files, AI agents MUST:
  1. Check this GRCD section for canonical location
  2. Create files ONLY in allowed directories
  3. If directory doesn't exist, create it following the tree structure
  4. Never create files in root or ad-hoc locations

**Example:**
* **Requirement:** `kernel` MUST follow this directory layout.
* **Validator:** `scripts/dir-lint.ts` runs in CI
* **Conformance Test:** `T-DIR-1: Invalid directory structure MUST fail CI.`

### 4.3 File Naming Conventions

* **TypeScript files:** `kebab-case.ts` (e.g., `audit-logger.ts`, `contract-engine.ts`)
* **Test files:** `*.test.ts` or `*.spec.ts` (e.g., `audit-logger.test.ts`)
* **Schema files:** `*.schema.ts` (e.g., `action-contract.schema.ts`)
* **Type files:** `*.types.ts` (e.g., `audit.types.ts`, `kernel.types.ts`)
* **Config files:** `*.config.ts` (e.g., `kernel.config.ts`)

---

## 5. Dependencies & Compatibility Matrix

> **CRITICAL SECTION FOR ANTI-DRIFT**
> 
> Define allowed dependency versions and tested combinations to prevent LLM agents from drifting into incompatible ecosystems (e.g., Zod 4.x vs Drizzle requiring Zod 3.x).

### 5.1 Dependency Policy

* **Lockfile Format:** `{{LOCKFILE_FORMAT}}` (e.g., `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`)

* **Source of Truth:** `{{DEP_SOT_PATH}}` (e.g., `/kernel/package.json`, `/pnpm-lock.yaml`)

* **Update Policy:** `{{DEP_UPDATE_POLICY}}` (e.g., "Dependencies updated via PR with compatibility matrix verification. Breaking changes require GRCD update.")

* **Version Pinning:** `{{VERSION_PINNING}}` (e.g., "Exact versions in lockfile, ranges in package.json")

**Example:**
* **Lockfile Format:** `pnpm-lock.yaml`
* **Source of Truth:** `/kernel/package.json`, `/pnpm-lock.yaml`
* **Update Policy:** "Dependencies updated via PR with compatibility matrix verification. Breaking changes require GRCD update."

### 5.2 Compatibility Matrix

> **This table prevents AI agents from introducing incompatible dependencies.**

| Library       | Allowed Version Range | Tested With               | Status | Notes             | Blocked Versions |
| ------------- | --------------------- | ------------------------- | ------ | ----------------- | ---------------- |
| `zod`         | `^3.x`                | `drizzle-orm@latest`     | ✅      | {{ZOD_NOTES}}     | `^4.x` (incompatible with Drizzle) |
| `drizzle-orm` | `{{DRIZZLE_RANGE}}`   | `zod@3.x`                 | ✅      | {{DRIZZLE_NOTES}} | `{{BLOCKED_DRIZZLE}}` |
| `@aibos/ui`   | `{{UI_RANGE}}`        | `next@{{NEXT_RANGE}}`     | ✅      | {{UI_NOTES}}      | `{{BLOCKED_UI}}` |
| `hono`        | `^4.x`                | `@hono/node-server@^1.x`  | ✅      | API framework     | `^5.x` (not tested) |
| `typescript`  | `^5.x`                | All packages              | ✅      | Type checking     | `^4.x` (deprecated) |

**Example:**
| Library       | Allowed Version Range | Tested With               | Status | Notes             | Blocked Versions |
| ------------- | --------------------- | ------------------------- | ------ | ----------------- | ---------------- |
| `zod`         | `^3.x`                | `drizzle-orm@latest`     | ✅      | Drizzle only tested with Zod 3.x | `^4.x` (incompatible with Drizzle) |
| `drizzle-orm` | `^0.30.x`             | `zod@3.x`                 | ✅      | Requires Zod 3.x  | `^0.31.x` (not tested) |
| `hono`        | `^4.x`                | `@hono/node-server@^1.x`  | ✅      | API framework     | `^5.x` (not tested) |

### 5.3 Dependency Groups

> Group dependencies by purpose for clarity.

**Core Runtime:**
- `hono`, `@hono/node-server` - API framework
- `zod` - Schema validation
- `typescript` - Type checking

**Storage:**
- `drizzle-orm` - ORM (requires Zod 3.x)
- `pg` or `@supabase/supabase-js` - PostgreSQL client
- `ioredis` - Redis client

**Observability:**
- `pino` - Structured logging
- `@opentelemetry/api` - Tracing (optional)

**Testing:**
- `vitest` or `jest` - Test framework
- `@types/node` - Node.js types

### 5.4 Dependency Normative Requirements

* `K-DEP-1`: All dependencies MUST align with `{{DEP_SOT_PATH}}` (e.g., `package.json` and lockfile).

* `K-DEP-2`: Incompatible dependency versions MUST block kernel boot and CI.

* `K-DEP-3`: LLM agents MUST NOT introduce new dependencies without explicit manifest updates and compatibility matrix verification.

* `K-DEP-4`: Dependency updates MUST be tested against compatibility matrix before merge.

**Example:**
* `K-DEP-1`: All dependencies MUST align with `package.json` and `pnpm-lock.yaml`.
* `K-DEP-2`: Incompatible dependency versions MUST block kernel boot and CI.
* `K-DEP-3`: LLM agents MUST NOT introduce new dependencies without explicit manifest updates and compatibility matrix verification.

### 5.5 Dependency Validation in CI

```yaml
# Example CI check (placeholder)
- name: Validate Dependencies
  run: |
    pnpm install --frozen-lockfile
    node scripts/validate-deps.js --matrix kernel/GRCD-TEMPLATE-v3.md
```

---

## 6. Master Control Prompt (MCP) Profile

> **CRITICAL SECTION FOR HUMAN-AI GOVERNANCE**
> 
> The **Master Control Prompt** is the contract that governs vibe coding between human and AI agents. It sets expectations, constraints, and style guidelines.

### 6.1 MCP Location

* **File:** `/mcp/{{COMPONENT_NAME}}.mcp.json` (e.g., `/mcp/kernel.mcp.json`)

* **Hash Recorded In:** Audit log under `mcpHash` field

* **Version:** `{{MCP_VERSION}}` (e.g., `1.0.0`)

* **Last Updated:** `{{MCP_LAST_UPDATED}}` (e.g., `2025-11-28`)

### 6.2 MCP Schema (Placeholder)

```json
{
  "component": "{{COMPONENT_NAME}}",
  "version": "{{MCP_VERSION}}",
  "intent": "{{INTENT_DESCRIPTION}}",
  "constraints": [
    "MUST follow GRCD structure from {{GRCD_PATH}}",
    "MUST save files only under allowed directories (see GRCD Section 4)",
    "MUST respect dependency matrix (see GRCD Section 5)",
    "MUST use TypeScript with strict mode",
    "MUST use kebab-case for file names",
    "MUST NOT create files in root directory",
    "MUST NOT introduce dependencies not in compatibility matrix"
  ],
  "input_sources": [
    "whitepaper",
    "GRCD docs ({{GRCD_PATH}})",
    "codebase ({{CODEBASE_PATH}})",
    "existing patterns in {{PATTERN_PATH}}"
  ],
  "output_targets": {
    "code": "{{CODE_OUTPUT_PATH}}",
    "docs": "{{DOC_OUTPUT_PATH}}",
    "tests": "{{TEST_OUTPUT_PATH}}"
  },
  "style": {
    "normative_language": true,
    "anti_drift": true,
    "type_safety": "strict",
    "error_handling": "typed_errors",
    "logging": "structured"
  },
  "validation": {
    "pre_commit": [
      "TypeScript type check",
      "Directory structure validation",
      "Dependency compatibility check",
      "GRCD conformance check"
    ]
  }
}
```

**Example:**
```json
{
  "component": "kernel",
  "version": "1.0.0",
  "intent": "Generate kernel code following GRCD-KERNEL-v3.md specifications",
  "constraints": [
    "MUST follow GRCD structure from kernel/GRCD-KERNEL-v3.md",
    "MUST save files only under allowed directories (see GRCD Section 4)",
    "MUST respect dependency matrix (see GRCD Section 5)",
    "MUST use TypeScript with strict mode",
    "MUST use kebab-case for file names",
    "MUST NOT create files in root directory",
    "MUST NOT introduce dependencies not in compatibility matrix"
  ],
  "input_sources": [
    "whitepaper",
    "GRCD docs (kernel/GRCD-KERNEL-v3.md)",
    "codebase (kernel/)",
    "existing patterns in kernel/"
  ],
  "output_targets": {
    "code": "kernel/",
    "docs": "docs/08-governance/grcd/",
    "tests": "kernel/tests/"
  },
  "style": {
    "normative_language": true,
    "anti_drift": true,
    "type_safety": "strict",
    "error_handling": "typed_errors",
    "logging": "structured"
  }
}
```

### 6.3 MCP Usage Instructions

> How AI agents should use this MCP.

1. **Load MCP:** Read `/mcp/{{COMPONENT_NAME}}.mcp.json` at session start
2. **Validate MCP:** Check hash matches audit log
3. **Load GRCD:** Read `{{GRCD_PATH}}` for component specifications
4. **Check Directory:** Verify file locations against GRCD Section 4
5. **Check Dependencies:** Verify all dependencies against GRCD Section 5
6. **Generate Code:** Follow MCP constraints and GRCD requirements
7. **Validate Output:** Run pre-commit checks from MCP validation section

### 6.4 MCP Normative Requirements

* `K-MCP-1`: All AI coding sessions MUST start from a valid MCP seed (`/mcp/{{COMPONENT_NAME}}.mcp.json`).

* `K-MCP-2`: MCP changes MUST be audited and hash-logged in audit system.

* `K-MCP-3`: MCP violation events MUST trigger alerts (e.g., file created in wrong directory, incompatible dependency introduced).

* `K-MCP-4`: MCP MUST reference the current GRCD version for the component.

**Example:**
* `K-MCP-1`: All AI coding sessions MUST start from a valid MCP seed (`/mcp/kernel.mcp.json`).
* `K-MCP-2`: MCP changes MUST be audited and hash-logged in audit system.
* `K-MCP-3`: MCP violation events MUST trigger alerts.

---

## 7. Contracts & Schemas

### 7.1 Manifest Schema (Excerpt Placeholder)

```json
{
  "component": "{{COMPONENT_NAME}}",
  "version": "{{VERSION}}",
  "apis": [
    {
      "name": "{{API_NAME}}",
      "version": "{{API_VERSION}}",
      "path": "{{API_PATH}}",
      "method": "{{METHOD}}",
      "schemaRef": "{{SCHEMA_REF}}"
    }
  ],
  "events": [
    {
      "name": "{{EVENT_NAME}}",
      "guarantees": {
        "delivery": "{{DELIVERY_SEMANTICS}}",
        "ordering": "{{ORDERING_SCOPE}}"
      }
    }
  ],
  "policies": {
    "packs": ["{{POLICY_PACK_ID}}"],
    "default": "deny"
  },
  "identity": {
    "roles": [
      {
        "name": "{{ROLE_NAME}}",
        "privileges": ["{{PRIVILEGE_1}}", "{{PRIVILEGE_2}}"]
      }
    ]
  },
  "audit": {
    "changeId": "{{CHANGE_ID}}",
    "immutable": true,
    "hashChain": true
  }
}
```

**Example:**
```json
{
  "component": "kernel",
  "version": "1.0.0",
  "apis": [
    {
      "name": "contract.validate",
      "version": "1.0.0",
      "path": "/api/v1/contracts/validate",
      "method": "POST",
      "schemaRef": "schemas/contracts/validate.json"
    }
  ],
  "events": [
    {
      "name": "contract.validated",
      "guarantees": {
        "delivery": "at-least-once",
        "ordering": "per-ContractID"
      }
    }
  ]
}
```

### 7.2 Policy Grammar (Placeholder)

> Define your policy DSL or the embedding of CEL/JSON-Logic, including precedence rules.

* **Grammar:** `{{POLICY_GRAMMAR_DESCRIPTION}}` (e.g., "JSON-based policy rules with CEL expressions for conditions")

* **Conflict Resolution:** `{{POLICY_CONFLICT_RULES}}` (e.g., "deny wins over allow, explicit override via priority field")

* **Linting Tool:** `{{POLICY_LINT_TOOL}}` (e.g., "policy-lint.ts validates policy syntax and conflicts")

**Example:**
* **Grammar:** "JSON-based policy rules with CEL expressions for conditions"
* **Conflict Resolution:** "deny wins over allow, explicit override via priority field"
* **Linting Tool:** "policy-lint.ts validates policy syntax and conflicts"

### 7.3 Schema Validation

* **Schema Format:** `{{SCHEMA_FORMAT}}` (e.g., "Zod schemas in `contracts/schemas/`, OpenAPI in `docs/api/`")

* **Validation:** `{{VALIDATION_METHOD}}` (e.g., "Runtime validation via Zod, API docs via OpenAPI generator")

* **Source of Truth:** `{{SCHEMA_SOT}}` (e.g., "Zod schemas are SSOT, OpenAPI generated from Zod")

---

## 8. Error Handling & Recovery

### 8.1 Error Taxonomy

> Standardize error types and recovery strategies.

| Error Class     | When Thrown                     | Recovery Strategy                    | HTTP Status |
| --------------- | ------------------------------- | ------------------------------------ | ----------- |
| `{{COMP}}Error` | Base class for component errors | Log and standard 5xx response        | 500         |
| `ContractError` | Invalid manifest/schema         | Reject, audit, and guide remediation | 400         |
| `TenantError`   | Cross-tenant violation          | Block, raise security alert           | 403         |
| `PolicyError`   | Policy evaluation failure        | Deny request, audit log             | 403         |
| `ActionError`   | Action execution failure         | Return error to client, audit log    | 500         |

**Example:**
| Error Class     | When Thrown                     | Recovery Strategy                    | HTTP Status |
| --------------- | ------------------------------- | ------------------------------------ | ----------- |
| `KernelError` | Base class for kernel errors | Log and standard 5xx response        | 500         |
| `ContractError` | Invalid manifest/schema         | Reject, audit, and guide remediation | 400         |
| `TenantError`   | Cross-tenant violation          | Block, raise security alert           | 403         |

### 8.2 Retry & Circuit Breaker Policy

> Define per-operation retries, backoff, and breaker thresholds.

| Operation | Retry Count | Backoff Strategy | Timeout | Circuit Breaker Threshold |
| --------- | ----------- | ---------------- | ------- | ------------------------- |
| DB connection | 3 | Exponential (1s, 2s, 4s) | 10s | 10 errors/60s |
| Redis connection | 3 | Exponential (1s, 2s, 4s) | 5s | 20 errors/60s |
| Engine loading | 1 | None | 3s | 5 errors/60s |
| Event publishing | 3 | Exponential (100ms, 200ms, 400ms) | 1s | N/A |

---

## 9. Observability

### 9.1 Metrics (Prometheus)

> Define key metrics names and labels.

| Metric Name                              | Type      | Labels               | Purpose              | Target |
| ---------------------------------------- | --------- | -------------------- | -------------------- | ------ |
| `{{comp}}_http_requests_total`           | Counter   | method, path, status | Request volume       | N/A    |
| `{{comp}}_http_request_duration_seconds` | Histogram | method, path         | Latency distribution | <100ms p95 |
| `{{comp}}_actions_executed_total`        | Counter   | engine, action, status | Action execution | N/A    |
| `{{comp}}_policy_evaluations_total`      | Counter   | policy, result       | Policy enforcement   | N/A    |
| `{{comp}}_rate_limit_hits_total`         | Counter   | limiter_type, tenant | Rate limiting        | N/A    |

**Example:**
| Metric Name                              | Type      | Labels               | Purpose              | Target |
| ---------------------------------------- | --------- | -------------------- | -------------------- | ------ |
| `kernel_http_requests_total`           | Counter   | method, path, status | Request volume       | N/A    |
| `kernel_http_request_duration_seconds` | Histogram | method, path         | Latency distribution | <100ms p95 |

### 9.2 Traces (OpenTelemetry)

* **Span Names:** `{{SPAN_NAMES}}` (e.g., "kernel.request", "kernel.auth", "kernel.policy", "kernel.action")

* **Attributes:** `{{SPAN_ATTRIBUTES}}` (e.g., "method, path, trace_id, tenant_id, principal")

**Example:**
* **Span Names:** "kernel.request", "kernel.auth", "kernel.policy", "kernel.action"
* **Attributes:** "method, path, trace_id, tenant_id, principal"

### 9.3 Logging Schema

> Define log fields and JSON layout.

```json
{
  "timestamp": "{{ISO8601_TIMESTAMP}}",
  "level": "{{LOG_LEVEL}}",
  "trace_id": "{{TRACE_ID}}",
  "tenant_id": "{{TENANT_ID}}",
  "component": "{{COMPONENT_NAME}}",
  "message": "{{MESSAGE}}",
  "metadata": {
    "{{KEY}}": "{{VALUE}}"
  }
}
```

**Example:**
```json
{
  "timestamp": "2025-11-28T10:30:00Z",
  "level": "info",
  "trace_id": "abc123",
  "tenant_id": "tenant-456",
  "component": "kernel.api",
  "message": "Request processed",
  "metadata": {
    "method": "POST",
    "path": "/api/v1/action/accounting/create-journal-entry",
    "duration_ms": 45,
    "status": 200
  }
}
```

---

## 10. Conformance Criteria (Definition of Done)

> Convert GRCD statements into checkable criteria.

### 10.1 API Boundaries

* ✅ All endpoints schema‑driven (OpenAPI/GraphQL/Zod)
* ✅ All requests/responses validated
* ✅ Error responses follow standard format

### 10.2 Security

* ✅ RBAC/ABAC enforced
* ✅ Deny-by-default policies
* ✅ Secrets via KMS
* ✅ Tenant isolation verified

### 10.3 Anti-Drift

* ✅ Directory structure validated
* ✅ Dependency matrix enforced
* ✅ MCP present and valid
* ✅ File naming conventions followed

### 10.4 Performance

* ✅ Latency < {{LATENCY_TARGET}} (p95)
* ✅ Availability ≥ {{AVAILABILITY_TARGET}}
* ✅ Boot time < {{BOOT_TARGET}}

### 10.5 Compliance

* ✅ Audit logs immutable
* ✅ Policy packs validated
* ✅ Backward compatibility maintained

---

## 11. Threat Model (STRIDE)

> For each STRIDE category, specify threats + mitigations.

| Threat Type            | Example Threat            | Mitigation                      | Verification             |
| ---------------------- | ------------------------- | ------------------------------- | ------------------------ |
| Spoofing               | Fake engine identity      | Signed manifests, mutual TLS    | Integration tests        |
| Tampering              | Audit log modification    | Append-only store, hash chain   | Hash verification job    |
| Repudiation            | Denial of action          | Immutable audit, signatures     | Audit log verification   |
| Information Disclosure | Cross-tenant data leakage | Tenant proxies, deny-by-default | Isolation verifier tests |
| Denial of Service      | Resource exhaustion       | Rate limits, circuit breakers   | Load testing            |
| Privilege Escalation   | Unauthorized access       | RBAC/ABAC, least privilege      | Permission tests         |

---

## 12. Deployment & Operations

### 12.1 Deployment Model

* **Image Name:** `{{IMAGE_NAME}}` (e.g., `aibos/kernel:latest`)

* **Health Checks:** `/healthz`, `/readyz`, `/diagz`

* **Scaling Strategy:** `{{SCALING_STRATEGY}}` (e.g., "Horizontal: Stateless, scale pods. Vertical: Memory limit {{MEMORY_TARGET}}")

* **Update Strategy:** `{{UPDATE_STRATEGY}}` (e.g., "Rolling updates: Zero-downtime. Rollback: Previous version on failure")

### 12.2 Configuration Management

| Config Type | Source | Hot Reload | Validation |
|---|---|---|---|
| Kernel config | Environment variables | No | Zod schema |
| Policies | Policy store (DB) | Yes | Policy schema |
| Contracts | Contract store (DB) | Yes | Contract schema |

### 12.3 Disaster Recovery

| Scenario | Recovery Procedure | RTO | RPO |
|---|---|---|---|
| Kernel crash | Auto-restart (K8s) | < 30s | 0s |
| DB failure | Failover to replica | < 5min | < 1min |
| Redis failure | Fallback to in-memory | < 10s | 0s |

---

## 13. Testing Strategy

### 13.1 Unit Tests

* **Scope:** `{{UNIT_TEST_SCOPE}}` (e.g., "Contract validators, policy engine, rate limiters, circuit breakers, error handlers")

* **Coverage Target:** `{{COVERAGE_TARGET}}` (e.g., "≥80%")

* **Framework:** `{{UNIT_FRAMEWORK}}` (e.g., "Vitest")

### 13.2 Integration Tests

* **Scope:** `{{INTEGRATION_TEST_SCOPE}}` (e.g., "Boot sequence, action dispatch flow, event bus pub/sub, tenant isolation, audit logging")

* **Framework:** `{{INTEGRATION_FRAMEWORK}}` (e.g., "Vitest with test containers")

### 13.3 E2E Tests

* **Scope:** `{{E2E_TEST_SCOPE}}` (e.g., "Full request lifecycle, multi-tenant scenarios, policy enforcement, rate limiting, circuit breaker")

* **Framework:** `{{E2E_FRAMEWORK}}` (e.g., "Playwright or similar")

### 13.4 Chaos/Fuzz Tests

* **Scope:** `{{CHAOS_TEST_SCOPE}}` (e.g., "Random engine restarts, DB connection failures, Redis failures, high load scenarios, random payload generation")

* **Framework:** `{{CHAOS_FRAMEWORK}}` (e.g., "ChaosHarness, FuzzHarness")

---

## 14. Tiering & Monetization Model

> **EXPLICIT COMPARISON TABLE FOR CLARITY**
> 
> Map capabilities to tiers in a **single comparison table** for easy reference.

### 14.1 Tier Definitions

* **Foundation:** Baseline capabilities for internal/SME use. Basic governance, audit, and multi-tenancy.

* **Enhanced:** Adds compliance automation, drift detection, advanced observability, and dependency matrix enforcement.

* **Indemnified (Premium):** Dedicated instances, contractual SLAs, legal indemnification, and priority support.

### 14.2 Tier vs Feature Comparison

| Feature / Capability                        | Foundation | Enhanced | Indemnified |
| ------------------------------------------- | ---------: | -------: | ----------: |
| **Core Functionality**                      |            |          |             |
| API gateway / routing                       |          ✅ |        ✅ |           ✅ |
| Manifest validation (schemas, policies)     |          ✅ |        ✅ |           ✅ |
| Multi-tenant isolation (DB/cache proxies)   |          ✅ |        ✅ |           ✅ |
| RBAC/ABAC policy enforcement                |          ✅ |        ✅ |           ✅ |
| Event bus (pub/sub with replay guard)       |          ✅ |        ✅ |           ✅ |
| Audit logging (immutable, append-only)      |          ✅ |        ✅ |           ✅ |
| **Anti-Drift & Governance**                 |            |          |             |
| Directory structure enforcement             |          ✅ |        ✅ |           ✅ |
| Dependency compatibility matrix             | ⚪ Optional |        ✅ |           ✅ |
| MCP (Master Control Prompt) governance      | ⚪ Optional |        ✅ |           ✅ |
| Drift detection (config, schema, directory)   |          ❌ |        ✅ |           ✅ |
| **Compliance & Security**                    |            |          |             |
| Basic policy packs (SOX, GDPR)              |          ✅ |        ✅ |           ✅ |
| Advanced policy packs (HIPAA, PCI-DSS)      |          ❌ |        ✅ |           ✅ |
| Compliance MCP integration                   |          ❌ |        ✅ |           ✅ |
| Security audit automation                   |          ❌ |        ✅ |           ✅ |
| **Observability**                           |            |          |             |
| Basic metrics (Prometheus)                  |          ✅ |        ✅ |           ✅ |
| Structured logging (Pino)                    |          ✅ |        ✅ |           ✅ |
| Distributed tracing (OpenTelemetry)          | ⚪ Optional |        ✅ |           ✅ |
| Advanced analytics & dashboards             |          ❌ |        ✅ |           ✅ |
| **Performance & Scale**                     |            |          |             |
| Rate limiting (3-layer)                      |          ✅ |        ✅ |           ✅ |
| Circuit breakers                            |          ✅ |        ✅ |           ✅ |
| Basic SLA (99.9% uptime)                    |          ✅ |        ✅ |           ✅ |
| Enhanced SLA (99.95% uptime)                |          ❌ |        ✅ |           ✅ |
| Premium SLA (99.99% uptime)                 |          ❌ |        ❌ |           ✅ |
| **Support & Operations**                     |            |          |             |
| Community support                           |          ✅ |        ✅ |           ✅ |
| Email support (business hours)               |          ❌ |        ✅ |           ✅ |
| Dedicated support / incident response       |          ❌ |        ❌ |           ✅ |
| 24/7 on-call support                        |          ❌ |        ❌ |           ✅ |
| **Legal & Risk**                             |            |          |             |
| Standard terms of service                   |          ✅ |        ✅ |           ✅ |
| Legal indemnification                       |          ❌ |        ❌ |           ✅ |
| Custom contract negotiation                 |          ❌ |        ❌ |           ✅ |
| **Deployment**                               |            |          |             |
| Shared infrastructure                       |          ✅ |        ✅ |           ✅ |
| Dedicated instance                          |          ❌ |        ❌ |           ✅ |
| Multi-region deployment                     |          ❌ |        ⚪ |           ✅ |
| **Pricing Model**                            |            |          |             |
| Usage-based pricing                         |          ✅ |        ✅ |           ✅ |
| Enterprise pricing (annual)                 |          ❌ |        ✅ |           ✅ |
| Custom pricing                              |          ❌ |        ❌ |           ✅ |

**Legend:**
- ✅ = Included
- ⚪ = Optional / Add-on
- ❌ = Not included

---

## 15. Positioning

> Explain how this component fits into the ecosystem and how it differs from external tools.

* **Internal Positioning:** `{{INTERNAL_POSITIONING}}` (e.g., "Compliments metadata/catalog tools by enforcing contracts upstream. Compliments infra vendors by monetizing governance, not compute/storage.")

* **External Comparison:** `{{EXTERNAL_COMPARISON}}` (e.g., "vs OpenMetadata: We enforce contracts, they catalog. vs Datadog: We govern, they observe. vs Auth0: We're policy-agnostic, they're identity-focused.")

* **Unique Differentiators:** `{{UNIQUE_POINTS}}` (e.g., "1. Constitution of governance, not a data platform. 2. Contract-first with backward compatibility. 3. Multi-tenant isolation with zero leakage guarantees.")

**Example:**
* **Internal Positioning:** "Compliments metadata/catalog tools by enforcing contracts upstream. Compliments infra vendors by monetizing governance, not compute/storage."
* **External Comparison:** "vs OpenMetadata: We enforce contracts, they catalog. vs Datadog: We govern, they observe."
* **Unique Differentiators:** "1. Constitution of governance, not a data platform. 2. Contract-first with backward compatibility. 3. Multi-tenant isolation with zero leakage guarantees."

---

## 16. Normative Requirements (K-*)

> List all MUST/SHOULD/MAY requirements as atomic rules. These are testable and auditable.

| ID    | Requirement Statement (MUST/SHOULD/MAY)                             | Verification Method      |
| ----- | ------------------------------------------------------------------- | ------------------------ |
| K-1   | {{COMPONENT_NAME}} MUST {{REQUIREMENT_1}}                           | {{VERIFICATION_K1}}      |
| K-2   | {{COMPONENT_NAME}} MUST NOT {{REQUIREMENT_2}}                       | {{VERIFICATION_K2}}      |
| K-MCP-1 | All AI coding MUST start from MCP seed and respect GRCD constraints | MCP audit + test harness |
| K-DIR-1 | Directory layout MUST match canonical tree                          | Directory linter in CI   |
| K-DEP-1 | Dependency versions MUST match compatibility matrix                 | Dependency checker in CI |
| K-ERR-1 | All errors MUST use typed error classes                             | Code review + linter     |
| K-AUDIT-1 | All operations MUST generate audit logs                             | Audit log verification   |

**Example:**
| ID    | Requirement Statement (MUST/SHOULD/MAY)                             | Verification Method      |
| ----- | ------------------------------------------------------------------- | ------------------------ |
| K-1   | Kernel MUST validate all API requests through identity, schema, and policy checks | Integration tests |
| K-2   | Kernel MUST NOT store tenant business data                          | Architecture review |
| K-MCP-1 | All AI coding MUST start from MCP seed and respect GRCD constraints | MCP audit + test harness |
| K-DIR-1 | Directory layout MUST match canonical tree                          | Directory linter in CI   |
| K-DEP-1 | Dependency versions MUST match compatibility matrix                 | Dependency checker in CI |

---

## 17. Conformance Tests (T-*)

> Link tests directly to Normative Requirements.

| Test ID | Scenario                         | Expected Result                                | Linked Requirement |
| ------- | -------------------------------- | ---------------------------------------------- | ------------------ |
| T-1     | Submit invalid manifest          | Request is rejected, reason is audited         | K-1                |
| T-MCP-1 | Start coding without MCP         | Session is blocked, violation is logged        | K-MCP-1            |
| T-DIR-1 | Introduce invalid directory path | CI fails, error message refers to GRCD section | K-DIR-1            |
| T-DEP-1 | Use disallowed Zod version       | Build fails with compatibility error           | K-DEP-1            |
| T-ERR-1 | Throw generic Error()            | Linter fails, must use typed error class       | K-ERR-1            |
| T-AUDIT-1 | Perform operation without audit  | Operation fails, audit log missing             | K-AUDIT-1          |

**Example:**
| Test ID | Scenario                         | Expected Result                                | Linked Requirement |
| ------- | -------------------------------- | ---------------------------------------------- | ------------------ |
| T-1     | Submit invalid schema            | Gateway MUST reject with audited reason        | K-1                |
| T-MCP-1 | Start coding without MCP         | Session is blocked, violation is logged        | K-MCP-1            |
| T-DIR-1 | Introduce invalid directory path | CI fails, error message refers to GRCD section | K-DIR-1            |
| T-DEP-1 | Use Zod 4.x with Drizzle        | Build fails with compatibility error           | K-DEP-1            |

---

## 18. Versioning & Migration

### 18.1 Version Scheme

* **Version Scheme:** SemVer (`MAJOR.MINOR.PATCH`)

* **Breaking Change Policy:** `{{BREAKING_POLICY}}` (e.g., "Breaking changes require major version bump. Deprecation window: 12 months minimum.")

* **Deprecation Window:** `{{DEPRECATION_WINDOW}}` (e.g., "12 months minimum. Deprecated APIs marked in OpenAPI spec and audit logs.")

### 18.2 Migration Paths

| From Version | To Version | Migration Steps |
|---|---|---|
| {{FROM_VER}} → {{TO_VER}} | Breaking changes | 1. Deprecation notice ({{DEP_WINDOW}}) 2. Compatibility shim 3. Migration guide |
| {{FROM_VER}} → {{TO_VER}} | New features | No migration needed (backward compatible) |

**Example:**
| From Version | To Version | Migration Steps |
|---|---|---|
| 1.x → 2.0 | Breaking changes | 1. Deprecation notice (12 months) 2. Compatibility shim 3. Migration guide |
| 1.0 → 1.1 | New features | No migration needed (backward compatible) |

---

## 19. Code Quality & Documentation Standards

### 19.1 TypeScript Standards

* **TypeScript Rules:** `{{TS_RULES}}` (e.g., "Strict mode enabled, no `any` types, all errors use typed error classes")

* **Linting Rules:** `{{LINT_RULES}}` (e.g., "ESLint with @aibos/config-eslint, no console.log, structured logging only")

* **Coverage Targets:** `{{COVERAGE_TARGETS}}` (e.g., "≥80% unit test coverage, 100% coverage for critical paths")

* **ADR Requirements:** `{{ADR_RULES}}` (e.g., "All architectural decisions documented in `docs/08-governance/adr/`")

**Example:**
* **TypeScript Rules:** "Strict mode enabled, no `any` types, all errors use typed error classes"
* **Linting Rules:** "ESLint with @aibos/config-eslint, no console.log, structured logging only"
* **Coverage Targets:** "≥80% unit test coverage, 100% coverage for critical paths"

### 19.2 Documentation Standards

* **API Documentation:** `{{API_DOC_STANDARD}}` (e.g., "OpenAPI spec generated from routes, GraphQL schema in `docs/api/`")

* **Code Documentation:** `{{CODE_DOC_STANDARD}}` (e.g., "JSDoc comments for all public functions, README in each major directory")

* **Runbooks:** `{{RUNBOOK_STANDARD}}` (e.g., "Operational runbooks in `docs/05-operations/` for deployment, rollback, disaster recovery")

---

## 20. Audit Checklist (Operational Use)

> Final checklist for security, performance, and compliance before marking this component as production-ready.

### 20.1 Security Audit

* [ ] RBAC/ABAC implemented and tested
* [ ] Tenant isolation verified
* [ ] MCP seeding audited & enforced
* [ ] Dependency matrix enforced
* [ ] Directory structure validated
* [ ] Secrets managed via KMS (no plaintext)
* [ ] Input validation on all endpoints
* [ ] Output validation on all actions

### 20.2 Performance Audit

* [ ] Latency target achieved (e.g., <{{LATENCY_TARGET}} p95)
* [ ] Availability target achieved (e.g., ≥{{AVAILABILITY_TARGET}})
* [ ] Boot time target achieved (e.g., <{{BOOT_TARGET}})
* [ ] Memory footprint target achieved (e.g., <{{MEMORY_TARGET}})
* [ ] Throughput target achieved (e.g., ≥{{THROUGHPUT_TARGET}})

### 20.3 Compliance Audit

* [ ] Policy packs validated
* [ ] Audit logs immutable and queryable
* [ ] External standards mapped (SOC2/ISO/GDPR/etc.)
* [ ] Backward compatibility validated
* [ ] Deprecation windows documented

### 20.4 Anti-Drift Audit

* [ ] Directory structure matches GRCD Section 4
* [ ] Dependencies match compatibility matrix (Section 5)
* [ ] MCP present and valid (Section 6)
* [ ] File naming conventions followed
* [ ] No ad-hoc file creation

### 20.5 Code Quality Audit

* [ ] TypeScript strict mode enabled
* [ ] Test coverage ≥{{COVERAGE_TARGET}}
* [ ] All errors use typed error classes
* [ ] No console.log (structured logging only)
* [ ] Documentation complete (API, code, runbooks)

---

## 21. Appendices

### 21.1 Glossary

* **GRCD:** Governance, Risk, Compliance & Design
* **MCP:** Master Control Prompt (governs AI coding sessions)
* **SSOT:** Single Source of Truth
* **CQRS:** Command Query Responsibility Segregation
* **STRIDE:** Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Privilege Escalation

### 21.2 References

* **Whitepaper:** `{{WHITEPAPER_PATH}}`
* **Architecture Docs:** `{{ARCH_DOCS_PATH}}`
* **API Docs:** `{{API_DOCS_PATH}}`
* **Related GRCDs:** `{{RELATED_GRCDS}}`

### 21.3 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 3.0.0 | {{DATE}} | Initial template with anti-drift mechanisms | {{AUTHOR}} |
| | | | |

---

> **How to Use This Template**
> 
> 1. **Duplicate this document** per component (Kernel, Engine, MCP, etc.).
> 2. **Replace all `{{PLACEHOLDERS}}`** with concrete values.
> 3. **Validate against conformance tests** (Section 17) before marking as complete.
> 4. **Run audit checklist** (Section 20) to ensure production readiness.
> 5. **Link to master status document** (`MASTER-KERNEL-STATUS.md` or equivalent) for tracking.
> 6. **Update version and change log** (Section 21.3) when making revisions.