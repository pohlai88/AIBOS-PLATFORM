# 📁 Kernel Directory Structure Analysis

**Date:** November 29, 2025  
**Status:** ⚠️ **DISCREPANCIES IDENTIFIED**

---

## 🔍 Problem Statement

The actual kernel directory structure does not match the proposed structure documented in `grcd_template_v_4_kernel_compatible.md` and `GRCD-KERNEL.md`. This creates confusion for AI agents and developers about where files should be placed.

---

## 📊 Proposed Structure (from GRCD Template)

According to `grcd_template_v_4_kernel_compatible.md` Section 4.1, the canonical structure should be:

```text
kernel/
├── api/                           # HTTP API layer (Hono)
│   ├── index.ts
│   ├── router.ts
│   └── routes/
├── audit/                         # Audit logging system
├── auth/                          # Authentication layer
├── bootstrap/                     # Boot sequence
│   └── steps/
├── contracts/                     # Contract engine
│   ├── schemas/
│   └── validators/
├── events/                        # Event bus system
├── hardening/                     # Security hardening
│   ├── errors/
│   ├── guards/
│   ├── locks/
│   └── rate-limit/
├── mcp/                           # MCP Governance Layer
│   ├── registry/
│   ├── validator/
│   ├── executor/
│   └── schemas/
├── policy/                        # Policy engine
├── registry/                      # Core registries
├── security/                      # Security layer
├── storage/                       # Storage layer
├── tenancy/                       # Multi-tenancy
├── tests/                         # Test harnesses
│   ├── unit/
│   ├── integration/
│   └── conformance/
├── index.ts
└── package.json
```

**Note:** The GRCD template structure is **incomplete** - it doesn't include directories added during Phase 4-6 development.

---

## 📂 Actual Structure (Current Implementation)

The actual kernel directory contains many more directories:

### ✅ Directories Present in Both Proposed and Actual

- ✅ `api/` - HTTP API layer
- ✅ `audit/` - Audit logging
- ✅ `auth/` - Authentication
- ✅ `bootstrap/` - Boot sequence
- ✅ `contracts/` - Contract engine
- ✅ `events/` - Event bus
- ✅ `hardening/` - Security hardening
- ✅ `mcp/` - MCP Governance Layer
- ✅ `policy/` - Policy engine
- ✅ `registry/` - Core registries
- ✅ `security/` - Security layer
- ✅ `storage/` - Storage layer
- ✅ `tenancy/` - Multi-tenancy
- ✅ `tests/` - Test harnesses

### ⚠️ Directories in Actual but NOT in Proposed Structure

These directories were added during development but are not documented in the GRCD template:

1. **`actions/`** - Action dispatcher and registry
2. **`agents/`** - AI Agent Integration framework (Phase 5)
   - `connector/`
   - `examples/`
   - `policy/`
   - `registry/`
3. **`ai/`** - AI governance engine
   - `governance.engine.ts`
   - `governance.hooks.ts`
   - `guardians/`
   - `inspectors/`
   - `lynx.adapter.ts`
   - `lynx.client.ts`
   - `reasoning/`
4. **`ai-optimization/`** - Self-optimizing AI layer
5. **`boot/`** - Boot configuration (separate from bootstrap?)
6. **`cli/`** - CLI tools
7. **`concurrency/`** - Concurrency control
8. **`core/`** - Core container
9. **`dispatcher/`** - Action dispatcher
10. **`distributed/`** - Distributed features (Phase 5)
    - `policy/`
    - `realtime/`
    - `regions/`
11. **`drift/`** - DriftShield
12. **`engines/`** - Engine loader
13. **`errors/`** - Error types
14. **`examples/`** - Example code
15. **`finance/`** - Finance compliance (Phase 6)
    - `compliance/`
16. **`governance/`** - Governance features (Phase 6)
    - `hitl/`
17. **`http/`** - HTTP layer (duplicate of `api/`?)
    - `routes/`
    - `middleware/`
18. **`isolation/`** - Isolation mechanisms
19. **`jobs/`** - Job scheduling
20. **`metadata/`** - Metadata management
21. **`migrations/`** - Database migrations
22. **`naming/`** - Naming conventions
23. **`observability/`** - Observability (Phase 6)
    - `dashboards/`
    - `performance/`
    - `sla/`
24. **`offline-governance/`** - Offline governance
25. **`orchestras/`** - AI Orchestra Coordination (Phase 4)
    - `coordinator/`
    - `domains/`
    - `implementations/`
    - `registry/`
    - `schemas/`
26. **`performance/`** - Performance monitoring
27. **`routes/`** - Routes (duplicate of `api/routes/`?)
28. **`sandbox/`** - Sandbox execution
29. **`scripts/`** - Scripts
30. **`sdk/`** - SDK
31. **`telemetry/`** - Telemetry
32. **`types/`** - TypeScript types
33. **`ui/`** - UI components
34. **`utils/`** - Utilities
35. **`validation/`** - Validation utilities
36. **`watchdog/`** - Watchdog services
37. **`workflows/`** - Workflow engine

### ❌ Potential Issues

1. **Duplicate/Overlapping Directories:**
   - `api/` vs `http/` - **CONFIRMED OVERLAP**
     - `api/router.ts` imports middleware and routes from `http/`
     - `api/` contains legacy routes (marked as `@deprecated`)
     - `http/` contains the newer, complete implementation
     - `api/index.ts` is the server entry point
     - **Recommendation:** Consolidate into single `api/` directory
   
   - `api/routes/` vs `http/routes/` vs `routes/` - Three route directories
     - `api/routes/` - Legacy routes (deprecated, marked with `@deprecated`)
     - `http/routes/` - New routes (active, used by `api/router.ts`)
     - `routes/` - Contains only `actions.route.ts`, appears unused
     - **Recommendation:** Remove `routes/` directory if confirmed unused
   
   - `boot/` vs `bootstrap/` - **NOT DUPLICATES** (different purposes)
     - `boot/` - Configuration loading (`kernel.config.ts`)
     - `bootstrap/` - Boot sequence steps (00-config.ts → 18-*.ts)
     - **Status:** Both are used and serve different purposes
     - **Recommendation:** Keep both, but consider renaming `boot/` to `config/` for clarity

2. **Missing from Proposed:**
   - `orchestras/` - Major feature added in Phase 4, not in template
   - `agents/` - Major feature added in Phase 5, not in template
   - `distributed/` - Major feature added in Phase 5, not in template
   - `observability/` - Major feature added in Phase 6, not in template
   - `governance/` - Major feature added in Phase 6, not in template
   - `finance/` - Major feature added in Phase 6, not in template

---

## 🎯 Recommended Actions

### Option A: Update GRCD Template (Recommended)

Update `grcd_template_v_4_kernel_compatible.md` and `GRCD-KERNEL.md` to include all actual directories:

1. Add missing directories to the canonical structure
2. Document the purpose of each directory
3. Clarify relationships (e.g., `api/` vs `http/`)
4. Mark directories as "Phase 4", "Phase 5", "Phase 6" additions

### Option B: Consolidate Duplicate Directories

1. **Merge `http/` into `api/`:**
   - Move `http/routes/` → `api/routes/`
   - Move `http/middleware/` → `api/middleware/`
   - Remove `http/` directory

2. **Merge `boot/` into `bootstrap/`:**
   - Move `boot/` contents → `bootstrap/config/`
   - Remove `boot/` directory

3. **Consolidate route directories:**
   - Keep only `api/routes/`
   - Remove `routes/` and `http/routes/`

### Option C: Create Directory Mapping Document

Create a mapping document that shows:
- Proposed structure → Actual structure
- Purpose of each directory
- When it was added (Phase)
- Whether it's required or optional

---

## 📝 Next Steps

1. ✅ **Document Analysis Complete** - This document
2. ⏭️ **Update GRCD Template** - Add all missing directories (orchestras, agents, distributed, observability, governance, finance)
3. ⏭️ **Resolve api/ vs http/ Duplication** - Consolidate into single `api/` directory
   - Move `http/middleware/` → `api/middleware/`
   - Move `http/routes/` → `api/routes/` (replace legacy routes)
   - Update all imports
   - Remove `http/` directory
4. ⏭️ **Verify routes/ Directory** - Check if `routes/` is used or can be removed
5. ⏭️ **Update GRCD-KERNEL.md** - Add complete directory structure with all Phase 4-6 additions
6. ⏭️ **Create Directory Linter** - Enforce structure compliance (future)
7. ⏭️ **Update Documentation** - Ensure all docs reflect actual structure

---

## 🔗 Related Documents

- `kernel/grcd_template_v_4_kernel_compatible.md` - GRCD template (Section 4.1)
- `kernel/GRCD-KERNEL.md` - GRCD compliance document (Section 4.1)
- `kernel/README.md` - Kernel README (Section 5)

---

**Status:** ⚠️ **ACTION REQUIRED** - Structure discrepancies need resolution

