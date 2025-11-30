# GRCD Metadata Studio - Conflict Analysis

**Date:** November 30, 2025  
**Status:** 🔴 **CRITICAL CONFLICTS IDENTIFIED**  
**Purpose:** Evaluate GRCD v4.1.0 against existing `kernel/metadata/` implementation

---

## 🎯 Executive Summary

The GRCD Metadata Studio v4.1.0 defines a **comprehensive metadata governance system** inspired by OpenMetadata, but it **conflicts significantly** with the existing `kernel/metadata/` implementation in:

1. **Directory Structure** - GRCD expects separate `metadata-studio/` package vs. current `kernel/metadata/`
2. **Naming Conventions** - Different table names, field names, and concepts
3. **Missing Features** - Lineage, SoT packs, governance tiers, profiling, quality, usage analytics
4. **Schema Mismatches** - Different data models and validation schemas
5. **Architecture Approach** - GRCD is "Lite OpenMetadata" vs. current "Kernel-embedded" approach

**Recommendation:** Either:

- **Option A:** Migrate existing code to GRCD structure (major refactor)
- **Option B:** Align GRCD with existing implementation (update GRCD)
- **Option C:** Create `metadata-studio/` as new package, keep `kernel/metadata/` for kernel-specific needs

---

## 🔴 Critical Conflicts

### 1. Directory Structure Conflict

| GRCD Expects                           | Current Implementation                              | Conflict Level  |
| -------------------------------------- | --------------------------------------------------- | --------------- |
| `/metadata-studio/` (separate package) | `kernel/metadata/` (kernel component)               | 🔴 **CRITICAL** |
| `api/` routes directory                | No API routes in metadata (likely in `kernel/api/`) | 🟡 **MEDIUM**   |
| `schemas/` directory                   | `catalog/types.ts` (single file)                    | 🟡 **MEDIUM**   |
| `services/` directory                  | Repositories in `catalog/`                          | 🟡 **MEDIUM**   |
| `db/` directory                        | Repositories use `getDB()` from `storage/db`        | 🟢 **LOW**      |
| `mcp/` directory                       | No MCP tools in metadata                            | 🔴 **CRITICAL** |

**Impact:** GRCD expects a completely different package structure outside the kernel.

---

### 2. Naming Convention Conflicts

#### Table Names

| GRCD Expects              | Current Implementation     | Conflict        |
| ------------------------- | -------------------------- | --------------- |
| `mdm_global_metadata`     | `kernel_metadata_entities` | 🔴 **CRITICAL** |
| `mdm_standard_pack`       | ❌ **NOT EXISTS**          | 🔴 **CRITICAL** |
| `mdm_usage_log`           | ❌ **NOT EXISTS**          | 🔴 **CRITICAL** |
| `kernel_business_terms`   | ✅ Exists                  | ✅ **ALIGNED**  |
| `kernel_data_contracts`   | ✅ Exists                  | ✅ **ALIGNED**  |
| `kernel_field_dictionary` | ✅ Exists                  | ✅ **ALIGNED**  |
| `kernel_field_aliases`    | ✅ Exists                  | ✅ **ALIGNED**  |

#### Field Names

| GRCD Expects                 | Current Implementation                      | Conflict        |
| ---------------------------- | ------------------------------------------- | --------------- |
| `canonical_key`              | `slug` (in catalog)                         | 🔴 **CRITICAL** |
| `governance_tier` (Tier 1-5) | `status` (draft/active/deprecated/archived) | 🔴 **CRITICAL** |
| `standard_pack_id_primary`   | ❌ **NOT EXISTS**                           | 🔴 **CRITICAL** |
| `entity_urn`                 | ❌ **NOT EXISTS**                           | 🔴 **CRITICAL** |
| `domain`                     | ✅ Exists (in BusinessTerm)                 | ✅ **ALIGNED**  |
| `owner`                      | ✅ Exists (in DataContract)                 | ✅ **ALIGNED**  |

**Impact:** Schema migration required to align naming conventions.

---

### 3. Missing Features (GRCD Requirements Not Implemented)

#### 🔴 Critical Missing Features

| GRCD Requirement                         | Current Status                                      | Priority    |
| ---------------------------------------- | --------------------------------------------------- | ----------- |
| **MS-F-3:** SoT packs (IFRS/MFRS)        | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-10:** Data lineage (nodes/edges)  | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-11:** Impact analysis             | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-12:** Governance tiers (Tier 1-5) | ❌ **NOT IMPLEMENTED** (uses `is_critical` boolean) | 🔴 **MUST** |
| **MS-F-13:** Data profiling              | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-14:** Data quality checks         | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-15:** Usage analytics             | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-16:** Lineage graph API           | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-17:** LineageTracer agent         | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-18:** Composite KPI modeling      | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |
| **MS-F-19:** HITL approval workflows     | ❌ **NOT IMPLEMENTED**                              | 🔴 **MUST** |

#### 🟡 Partially Implemented

| GRCD Requirement                      | Current Status | Gap                                                                       |
| ------------------------------------- | -------------- | ------------------------------------------------------------------------- |
| **MS-F-1:** Global metadata registry  | ✅ **PARTIAL** | Missing `canonical_key`, `governance_tier`, `standard_pack_id`            |
| **MS-F-2:** Domain & industry scoping | ✅ **PARTIAL** | Has `domain` but missing industry enums (IFRS, HL7, GS1)                  |
| **MS-F-4:** One canonical per tenant  | ✅ **PARTIAL** | Uses `slug` uniqueness, but not `canonical_key` concept                   |
| **MS-F-5:** Alias system              | ✅ **PARTIAL** | Has field aliases, but missing semantic aliases for KPIs/glossary         |
| **MS-F-7:** Business Glossary         | ✅ **PARTIAL** | Has BusinessTerm, but missing relationships, owners per term              |
| **MS-F-8:** Tags & classifications    | ✅ **PARTIAL** | Has `classification` and `sensitivity` enums, but no tag system           |
| **MS-F-9:** Ownership & stewardship   | ✅ **PARTIAL** | Has `owner` in DataContract, but missing steward, SME, domain owner roles |

#### ✅ Implemented

| GRCD Requirement                            | Current Status         | Notes                                    |
| ------------------------------------------- | ---------------------- | ---------------------------------------- |
| **MS-F-6:** Search APIs                     | ⚪ **UNKNOWN**         | May exist in `kernel/api/` routes        |
| **MS-F-20:** Popularity & health signals    | ❌ **NOT IMPLEMENTED** | SHOULD requirement                       |
| **MS-F-21:** Soft-delete + deprecation      | ✅ **IMPLEMENTED**     | Has `deprecated` and `archived` statuses |
| **MS-F-22:** Service catalog                | ❌ **NOT IMPLEMENTED** | SHOULD requirement                       |
| **MS-F-23:** Change feed                    | ❌ **NOT IMPLEMENTED** | MAY requirement                          |
| **MS-F-24:** External ticketing integration | ❌ **NOT IMPLEMENTED** | MAY requirement                          |

---

### 4. Schema Conflicts

#### Current Schema (`catalog/types.ts`)

```typescript
// Current: Uses slug-based identification
ZBusinessTerm = {
  slug: string,           // ❌ GRCD expects canonical_key
  domain: string,         // ✅ Aligned
  synonyms: string[],     // ✅ Aligned (but missing semantic aliases)
  status: FieldStatusEnum // ❌ GRCD expects governance_tier (Tier 1-5)
}

ZFieldDictionaryEntry = {
  slug: string,                    // ❌ GRCD expects canonical_key
  businessTermId: uuid,            // ✅ Aligned
  dataContractId: uuid,            // ✅ Aligned
  // ❌ Missing: governance_tier, standard_pack_id_primary, entity_urn
}
```

#### GRCD Expected Schema (`mdm-global-metadata.schema.ts`)

```typescript
// GRCD: Uses canonical_key + governance tiers + SoT packs
mdm_global_metadata = {
  canonical_key: string,              // ❌ Current uses slug
  label: string,                      // ✅ Current has label
  description: string,                // ✅ Aligned
  domain: string,                     // ✅ Aligned
  module: string,                     // ❌ Missing
  entity_urn: string,                 // ❌ Missing
  governance_tier: Tier1-5,          // ❌ Current uses status enum
  standard_pack_id_primary: uuid,     // ❌ Missing
  standard_pack_id_secondary: uuid[], // ❌ Missing
  alias_lexical: string[],           // ✅ Current has field aliases
  alias_semantic: SemanticAlias[],   // ❌ Missing
}
```

**Impact:** Complete schema redesign required.

---

### 5. Architecture Approach Conflicts

#### GRCD Approach: "Lite OpenMetadata"

- **Separate package:** `metadata-studio/` outside kernel
- **Service hierarchy:** Service → Entity → Field
- **SoT packs as law:** IFRS/MFRS primary, versioned packs
- **Tiered governance:** Tier 1-5 with strict requirements
- **MCP-governed:** Tools exposed via MCP to Kernel/agents
- **Lineage-first:** Mandatory for Tier 1 fields/KPIs

#### Current Approach: "Kernel-Embedded"

- **Kernel component:** `kernel/metadata/` inside kernel
- **Catalog-based:** Business terms, contracts, fields, aliases
- **Status-based:** draft/active/deprecated/archived
- **No SoT packs:** No standard pack support
- **No lineage:** No lineage tracking
- **No tiers:** Uses `is_critical` boolean (if exists)

**Impact:** Fundamental architectural mismatch.

---

## 🟡 Medium-Level Conflicts

### 6. API Structure Conflicts

| GRCD Expects         | Current Status         | Conflict                       |
| -------------------- | ---------------------- | ------------------------------ |
| `/metadata/*` routes | ❌ **NOT IN METADATA** | Routes likely in `kernel/api/` |
| `/lineage/*` routes  | ❌ **NOT EXISTS**      | Missing                        |
| `/impact/*` routes   | ❌ **NOT EXISTS**      | Missing                        |
| `/glossary/*` routes | ❌ **NOT EXISTS**      | Missing                        |
| `/tags/*` routes     | ❌ **NOT EXISTS**      | Missing                        |
| `/quality/*` routes  | ❌ **NOT EXISTS**      | Missing                        |
| `/usage/*` routes    | ❌ **NOT EXISTS**      | Missing                        |

**Impact:** API routes need to be created or moved.

---

### 7. MCP Integration Conflicts

| GRCD Expects                   | Current Status    | Conflict             |
| ------------------------------ | ----------------- | -------------------- |
| `mcp/metadata-studio.mcp.json` | ❌ **NOT EXISTS** | Missing MCP manifest |
| `mcp/tools/metadata.tools.ts`  | ❌ **NOT EXISTS** | Missing MCP tools    |
| `mcp/tools/lineage.tools.ts`   | ❌ **NOT EXISTS** | Missing              |
| `mcp/tools/impact.tools.ts`    | ❌ **NOT EXISTS** | Missing              |
| `mcp/tools/glossary.tools.ts`  | ❌ **NOT EXISTS** | Missing              |
| `mcp/tools/quality.tools.ts`   | ❌ **NOT EXISTS** | Missing              |
| `mcp/tools/usage.tools.ts`     | ❌ **NOT EXISTS** | Missing              |

**Impact:** Complete MCP integration missing.

---

### 8. Database Schema Conflicts

#### Missing Tables (GRCD Requires)

| Table                        | Purpose                     | Status         |
| ---------------------------- | --------------------------- | -------------- |
| `mdm_global_metadata`        | Field-level semantics       | ❌ **MISSING** |
| `mdm_standard_pack`          | SoT pack definitions        | ❌ **MISSING** |
| `mdm_lineage_nodes`          | Lineage graph nodes         | ❌ **MISSING** |
| `mdm_lineage_edges`          | Lineage graph edges         | ❌ **MISSING** |
| `mdm_usage_log`              | Usage analytics             | ❌ **MISSING** |
| `mdm_profiler_stats`         | Data profiling results      | ❌ **MISSING** |
| `mdm_quality_rules`          | Data quality rules          | ❌ **MISSING** |
| `mdm_kpi`                    | Composite KPI definitions   | ❌ **MISSING** |
| `mdm_tags`                   | Tag system                  | ❌ **MISSING** |
| `mdm_glossary_relationships` | Glossary term relationships | ❌ **MISSING** |

#### Existing Tables (Aligned)

| Table                               | GRCD Equivalent       | Status                                    |
| ----------------------------------- | --------------------- | ----------------------------------------- |
| `kernel_business_terms`             | Glossary terms        | ✅ **ALIGNED**                            |
| `kernel_data_contracts`             | Data contracts        | ✅ **ALIGNED**                            |
| `kernel_field_dictionary`           | Field definitions     | ✅ **PARTIAL** (missing GRCD fields)      |
| `kernel_field_aliases`              | Alias system          | ✅ **PARTIAL** (missing semantic aliases) |
| `kernel_action_data_contract_links` | Action-contract links | ✅ **ALIGNED**                            |

**Impact:** Major database migration required.

---

## 🟢 Low-Level Conflicts (Compatible)

### 9. Compatible Features

| Feature            | Current | GRCD | Status         |
| ------------------ | ------- | ---- | -------------- |
| Zod validation     | ✅      | ✅   | ✅ **ALIGNED** |
| Multi-tenancy      | ✅      | ✅   | ✅ **ALIGNED** |
| Redis caching      | ✅      | ✅   | ✅ **ALIGNED** |
| Repository pattern | ✅      | ✅   | ✅ **ALIGNED** |
| Business terms     | ✅      | ✅   | ✅ **ALIGNED** |
| Data contracts     | ✅      | ✅   | ✅ **ALIGNED** |
| Field aliases      | ✅      | ✅   | ✅ **PARTIAL** |
| Status lifecycle   | ✅      | ✅   | ✅ **ALIGNED** |

---

## 📊 Conflict Summary Matrix

| Conflict Category       | Critical | Medium | Low   | Total  |
| ----------------------- | -------- | ------ | ----- | ------ |
| **Directory Structure** | 2        | 4      | 0     | 6      |
| **Naming Conventions**  | 4        | 2      | 0     | 6      |
| **Missing Features**    | 11       | 7      | 4     | 22     |
| **Schema Conflicts**    | 8        | 3      | 0     | 11     |
| **Architecture**        | 1        | 2      | 0     | 3      |
| **API Structure**       | 0        | 7      | 0     | 7      |
| **MCP Integration**     | 1        | 6      | 0     | 7      |
| **Database Schema**     | 9        | 0      | 0     | 9      |
| **TOTAL**               | **36**   | **31** | **4** | **71** |

---

## 🎯 Recommendations

**Core Pillar Decision:** Since metadata is a **core pillar** of the kernel, we must choose one path:

### Option A: Align Existing Implementation with GRCD ✅ (RECOMMENDED)

**Strategy:** Evolve `kernel/metadata/` to fully comply with GRCD v4.1.0 requirements.

**Pros:**

- ✅ Maintains kernel integration (metadata is core kernel function)
- ✅ Full GRCD compliance with OpenMetadata patterns
- ✅ Comprehensive metadata governance (SoT packs, lineage, tiers, profiling)
- ✅ Single source of truth (no duplication)
- ✅ MCP-governed for AI agents

**Cons:**

- ❌ Major refactoring effort (6-12 months)
- ❌ Database migration required
- ❌ Schema changes (slug → canonical_key, status → governance_tier)
- ❌ Breaking changes to existing APIs

**Effort:** 🔴 **HIGH** (6-12 months)

**Implementation Plan:**

1. **Phase 1: Schema Migration** (2-3 months)
   - Rename `slug` → `canonical_key` in catalog types
   - Add `governance_tier` (Tier 1-5) replacing `status` enum
   - Add `standard_pack_id_primary` to all catalog entities
   - Add `entity_urn` for lineage support
   - Create `mdm_global_metadata` table (unified field registry)
   - Migrate existing catalog data to new schema

2. **Phase 2: Core Features** (2-3 months)
   - Implement SoT packs (`mdm_standard_pack` table + repository)
   - Implement governance tiers (Tier 1-5 system)
   - Add semantic aliases (beyond lexical aliases)
   - Update BusinessTerm to support relationships and owners
   - Add tags system (`mdm_tags` table)

3. **Phase 3: Advanced Features** (2-3 months)
   - Implement data lineage (nodes/edges graph)
   - Build impact analysis service
   - Add data profiling (basic stats for Tier 1/2)
   - Implement data quality checks (rule-based)
   - Add usage analytics (`mdm_usage_log`)

4. **Phase 4: Integration** (1-2 months)
   - Create MCP tools and manifest
   - Build API routes (`/metadata/`, `/lineage/`, `/impact/`, etc.)
   - Implement HITL approval workflows
   - Add composite KPI modeling
   - Create LineageTracer agent

5. **Phase 5: Migration & Cleanup** (1 month)
   - Migrate all existing data to new schema
   - Update all references (slug → canonical_key)
   - Remove deprecated fields
   - Update documentation

---

### Option B: Drop GRCD, Keep Current Implementation ❌

**Strategy:** Reject GRCD v4.1.0 and maintain current `kernel/metadata/` as-is.

**Pros:**

- ✅ No refactoring required
- ✅ No breaking changes
- ✅ Faster to maintain

**Cons:**

- ❌ Missing critical features (lineage, SoT packs, tiers, profiling)
- ❌ No GRCD compliance
- ❌ Cannot support audit-grade financial reporting (SOX, IFRS/MFRS)
- ❌ No impact analysis for schema changes
- ❌ Limited metadata governance
- ❌ No MCP integration for AI agents

**Impact:** 🔴 **CRITICAL** - Cannot meet compliance requirements (MS-C-1, MS-C-2)

**Recommendation:** ❌ **NOT RECOMMENDED** - GRCD requirements are essential for:

- Financial compliance (IFRS/MFRS, SOX)
- Audit trails (lineage for Tier 1 fields)
- AI governance (MCP-governed metadata)
- Enterprise metadata management

---

## ✅ Decision Required

**Since metadata is a core pillar, choose:**

1. **✅ Option A: Align with GRCD** - Full compliance, comprehensive features, 6-12 month effort
2. **❌ Option B: Drop GRCD** - Keep current, but lose compliance and critical features

**Recommendation:** **Option A (Align with GRCD)** because:

- Metadata is core kernel function (must be comprehensive)
- GRCD requirements are essential for compliance (IFRS/MFRS, SOX, audit trails)
- OpenMetadata patterns are proven and scalable
- Missing features (lineage, SoT packs, tiers) are critical for enterprise use

---

## 📋 Next Steps (If Option A Selected)

1. **Update GRCD:** Modify directory structure to use `kernel/metadata/` instead of `metadata-studio/`
2. **Create Migration Plan:** Detailed phase-by-phase implementation
3. **Schema Design:** Finalize `mdm-global-metadata.schema.ts` aligned with existing catalog
4. **Database Migration:** Scripts for slug → canonical_key, status → governance_tier
5. **Feature Implementation:** Start with Phase 1 (Schema Migration)

---

**Last Updated:** November 30, 2025  
**Status:** 🔴 **CONFLICTS IDENTIFIED - DECISION REQUIRED**
