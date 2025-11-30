# Kernel Naming Constitution v1

> **Source of truth** for file and code naming conventions in `kernel/`.

---

## A. File & Folder Naming

### Rule F1 – Folder names = domain (plural), kebab-case

```
✅ actions/
✅ audit/
✅ auth/
✅ contracts/
✅ events/
✅ policy/
✅ security/
✅ storage/
```

### Rule F2 – File names = `kebab-case` + optional suffix

**Allowed suffixes:**
- `.types.ts` – Type definitions
- `.schema.ts` – Zod schemas
- `.routes.ts` – HTTP routes
- `.repository.ts` – Data access
- `.service.ts` – Business logic services

**Examples:**
```
✅ contract-engine.ts
✅ engine-dependency-graph.ts
✅ event-replay-guard.ts
✅ action-dispatcher.ts
✅ action-registry.ts
✅ action-contract.schema.ts
✅ tenant.types.ts
✅ metadata.validator.ts
✅ engine.routes.ts
✅ role-policy.repository.ts
✅ api-key.service.ts
```

**Not allowed:**
```
❌ contractEngine.ts        (camelCase file name)
❌ contract.engine.ts       (dot used as word joiner)
❌ EventReplayGuard.ts      (PascalCase file name)
❌ actionContract.schema.ts (camel + dot)
```

---

## B. Inside Files (Identifiers)

### Rule C1 – Classes / main types = `PascalCase`

```typescript
✅ class ContractEngine { }
✅ class EventReplayGuard { }
✅ class KernelError extends Error { }
✅ class TenantIsolationVerifier { }
```

### Rule C2 – Functions / variables = `camelCase`

```typescript
✅ function dispatchAction() { }
✅ function loadEngine() { }
✅ const withTimeout = async () => { }
✅ const safeAwait = async () => { }
```

### Rule C3 – Types / interfaces = `PascalCase`

```typescript
✅ interface KernelConfig { }
✅ interface KernelContext { }
✅ type ActionContract = { }
✅ type AuditEvent = { }
```

---

## C. Index Files

Index files should re-export using the **new kebab-case** file names:

```typescript
// ✅ Correct
export { KernelError } from "./kernel-error";
export { ContractError } from "./contract-error";

// ❌ Wrong
export { KernelError } from "./KernelError";
```

---

## D. New Code Guidelines

All **new** files must follow these conventions. When adding:

1. **New modules:** Use `kebab-case.ts`
2. **New schemas:** Use `thing-name.schema.ts`
3. **New repositories:** Use `thing-name.repository.ts`
4. **New services:** Use `thing-name.service.ts`

Example for a new "naming" feature:
```
kernel/
  naming/
    name-engine.ts          ✅
    alias-resolver.ts       ✅
    types.ts                ✅
```

---

## E. Migration Status

Files renamed as of 2025-01-26:

| Old Name | New Name |
|----------|----------|
| `actionDispatcher.ts` | `action-dispatcher.ts` |
| `actionRegistry.ts` | `action-registry.ts` |
| `contractEngine.ts` | `contract-engine.ts` |
| `actionSchemaRuntime.ts` | `action-schema-runtime.ts` |
| `actionContract.schema.ts` | `action-contract.schema.ts` |
| `engineManifest.schema.ts` | `engine-manifest.schema.ts` |
| `EventReplayGuard.ts` | `event-replay-guard.ts` |
| `eventBus.ts` | `event-bus.ts` |
| `engineLoader.ts` | `engine-loader.ts` |
| `metadataEngine.ts` | `metadata-engine.ts` |
| `policyEngine.ts` | `policy-engine.ts` |
| `rolePolicyRepository.ts` | `role-policy.repository.ts` |
| `auditLogger.ts` | `audit-logger.ts` |
| `apiKeyService.ts` | `api-key.service.ts` |
| `jwtService.ts` | `jwt.service.ts` |
| `zodMiddleware.ts` | `zod-middleware.ts` |
| `EngineDependencyGraph.ts` | `engine-dependency-graph.ts` |
| `ManifestSigner.ts` | `manifest-signer.ts` |
| `PolicyEngine.ts` | `policy-engine.ts` |
| `SignatureRotation.ts` | `signature-rotation.ts` |
| `SignatureVerifier.ts` | `signature-verifier.ts` |
| `TrustStore.ts` | `trust-store.ts` |
| `TenantIsolationVerifier.ts` | `tenant-isolation-verifier.ts` |
| `ChaosHarness.ts` | `chaos-harness.ts` |
| `FuzzHarness.ts` | `fuzz-harness.ts` |
| `ActionError.ts` | `action-error.ts` |
| `AIError.ts` | `ai-error.ts` |
| `ContractError.ts` | `contract-error.ts` |
| `KernelError.ts` | `kernel-error.ts` |
| `MetadataError.ts` | `metadata-error.ts` |
| `RegistryError.ts` | `registry-error.ts` |
| `TenantError.ts` | `tenant-error.ts` |
| `engineLoaderLock.ts` | `engine-loader-lock.ts` |
| `registryLock.ts` | `registry-lock.ts` |
| `tenantLock.ts` | `tenant-lock.ts` |
| `safeAwait.ts` | `safe-await.ts` |
| `withTimeout.ts` | `with-timeout.ts` |

**Deleted:**
- `contract.engine.ts` (duplicate of `contract-engine.ts`)

---

## F. Enforcement

- All PRs must follow these conventions
- CI can optionally lint for PascalCase/camelCase file names
- New subsystems (NameEngine, Policy V2) start clean

