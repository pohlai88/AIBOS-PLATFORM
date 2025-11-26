# **AINote: Kernel–MCP Engineering Constitution**
### **AI‑BOS MCP — Engineering Requirements Specification (ERS v1.0.0)**
_Last Updated: 2025‑11‑26_

---

# **0. Purpose of This Document**
This Engineering Constitution defines the **official, non‑negotiable technical specification** for the AI‑BOS Model Context Protocol (MCP) architecture. It serves as the **Single Source of Truth (SSOT)** for:

- Kernel‑integrated MCP servers
- External/marketplace MCP servers
- Engine lifecycle contracts
- Metadata‑driven schemas
- Governance, sandboxing, and security
- Versioning and validation rules
- MCP testing and hardening requirements

This specification governs **ALL MCP implementations** inside the AI‑BOS ecosystem, permanently.

---

# **1. Architectural Overview**
AI‑BOS adopts MCP as the foundational protocol for tool invocation, metadata exchange, and engine governance.

A full MCP server in AI‑BOS consists of:

```
MCP Server
  ├── manifest.json
  ├── schemas/
  ├── tools/
  ├── index.ts
  └── (optional) resources/, prompts/
```

The Master Kernel extends MCP with:
- Engine Registry
- Metadata Registry
- Tenant Context provider
- Sandbox Isolation Manager
- Governance & Permission systems
- Hardening/Validation pipelines

---

# **2. MCP Server Lifecycle (Extended for AI‑BOS)**

All MCP servers MUST implement the following lifecycle:

```
boot → register → validate → serve → audit → shutdown
```

## **2.1 boot()**
Loads manifest, compiles schemas, verifies signature.

## **2.2 register()**
Declares:
- tool capabilities
- schemas
- permission scopes
- version metadata
- sandbox level

## **2.3 validate()** (Kernel-only)
Kernel performs:
- schema verification
- signature validation
- contract enforcement
- permission gating
- drift detection

## **2.4 serve()**
Respond to tool invocations via deterministic async functions.

## **2.5 audit()**
Every tool execution generates:
- Trace ID
- Tenant ID
- Payload checksum
- Determinism record
- Execution time
- Resource footprint

## **2.6 shutdown()**
Clean termination.

---

# **3. MCP Contract Requirements**
Every MCP MUST satisfy the following:

## **3.1 Schema Contract**
- JSON Schema v7
- Required fields explicit
- `additionalProperties: false` unless allowed
- Input and output schemas must exist for EVERY tool
- Schemas must include version tags

## **3.2 Manifest Contract**
`manifest.json` MUST contain:

```
name
version
permissions
runtime.sandboxLevel
runtime.timeoutMs
tools[inputSchema, outputSchema]
signature
```

## **3.3 Determinism Contract**
- Same input → Same output (byte-level)
- No random, time, or nondeterministic behavior unless sandboxed

## **3.4 Permission Contract**
Allowed scopes:
```
kernel
public
tenant
sandbox
```
No MCP may exceed declared permissions.

## **3.5 Signature Contract**
Every MCP MUST be signed:
- manifest signature
- tool definition signature
- schema checksums

---

# **4. Sandbox Isolation Model**
Isolation Levels:

### **Level 1 — Internal Kernel MCP**
- Full performance
- Tight permissions
- kernel-level visibility

### **Level 2 — External/Marketplace MCP**
- Strict sandbox
- No kernel registry access
- No direct file system access
- Tenant‑scoped only

### **Level 3 — Untrusted Code Execution**
- For micro-developer engines
- 100% restricted
- No network, FS, or process access

---

# **5. Engine Lifecycle Requirements**
Each engine MUST expose:

```
engineManifest.json
schemas/
actions/
metadata/
ui/
```

Kernel enforces:
- version compatibility
- metadata contract compliance
- action signature alignment
- sandbox level correctness
- tenant isolation

---

# **6. Registry Requirements**
## **6.1 MCP Registry**
All MCP servers MUST register in the Kernel MCP registry.
Fields include:
- Name
- Version
- Sandbox level
- Signature
- Tools
- Schema hashes
- Determinism report

## **6.2 Engine Registry**
Every engine MCP registered MUST pass:
- signature validation
- schema validation
- action contract alignment
- drift checks

## **6.3 Metadata Registry**
All schemas MUST reference Kernel metadata definitions.

---

# **7. Governance & Validation**
AI‑BOS includes the following kernel-level enforcement systems:

### **7.1 Hardening v1**
- Registry Immutability
- Lock Manager
- Sandbox L2
- Timeout guard
- Rate limiting
- Signature validation

### **7.2 Hardening v2**
- Event replay protection
- Engine dependency graph analysis
- Tenant isolation stress-testing
- Signature rotation
- Fuzzing

### **7.3 Drift Detection**
- Schema drift
- Manifest drift
- Permission drift
- Behavior drift

---

# **8. MCP Confidence Protocol**
Every MCP response MUST include:

```
confidenceScore
validated
schemaVerified
signatureVerified
deterministic
runtimeMs
```

Confidence score must be ≥ 0.95 for automatic acceptance.

---

# **9. Testing Requirements**
All MCP servers MUST pass:

### **9.1 Vitest Validation**
- Schema test
- Permission test
- Determinism test
- Registry test

### **9.2 Kernel Test MCP Validation**
- Hardening v1 suite
- Hardening v2 suite
- Sandbox penetration tests
- Signature corruption tests

### **9.3 CI/CD Requirements**
- All tests MUST pass before publishing

---

# **10. Versioning Rules**
All MCP servers MUST follow:

```
MAJOR — breaking
MINOR — additive
PATCH — bugfix
```

Kernel enforces version ranges for compatibility.

---

# **11. Security Constraints**
The following MUST be prevented:
- Cross-tenant data access
- Schema drift
- Action elevation
- Manifest tampering
- Signature bypass

Supported by:
- Sandbox
- Signatures
- Audit logs
- Rate limiting
- Drift detection

---

# **12. Compliance Requirements**
All MCP implementations MUST be:
- deterministic
- schema-valid
- signed
- permission-scoped
- tested
- auditable

Non-compliant MCP servers are automatically rejected.

---

# **13. Status**
**This is the official SSOT for ALL engineering work involving MCP in AI‑BOS.**
Updates require:
- Kernel team approval
- Semver major/minor bump
- Regeneration of MCP Inspector metadata

