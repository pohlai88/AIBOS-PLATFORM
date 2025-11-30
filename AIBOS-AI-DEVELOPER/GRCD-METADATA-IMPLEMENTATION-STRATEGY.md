# Metadata Studio - Implementation Strategy & Planning

**Date:** November 30, 2025  
**Status:** 📋 **STRATEGY DOCUMENT**  
**Purpose:** Comprehensive implementation plan for aligning `kernel/metadata/` with GRCD v4.1.0

---

## 🎯 Executive Summary

Based on repository analysis, this document provides:
1. **Implementation Strategy** - Phased approach leveraging existing patterns
2. **GRCD Gaps** - Missing requirements and enhancements needed
3. **Special Features** - Uplift features beyond GRCD requirements
4. **Best Practices** - Patterns from existing kernel components

**Key Finding:** The repository already has **proven patterns** we can leverage:
- ✅ MFRS/IFRS validation (`kernel/finance/compliance/`)
- ✅ HITL approval workflows (`kernel/governance/hitl/`)
- ✅ MCP tool patterns (`kernel/mcp/`)
- ✅ Impact analysis (`kernel/drift/cascade-predictor.ts`)
- ✅ Tier system (`kernel/sandbox/resource-governor.ts`)
- ✅ Graph relationships (`packages/ui/` entity-relationship-graph)

---

## 📋 Implementation Strategy

### Phase 1: Foundation & Schema Migration (2-3 months)

#### 1.1 Update Directory Structure

**Action:** Align with GRCD while keeping `kernel/metadata/` location

```typescript
kernel/metadata/
├── api/                    # NEW: Hono routes
│   ├── metadata.routes.ts
│   ├── lineage.routes.ts
│   ├── impact.routes.ts
│   ├── glossary.routes.ts
│   ├── tags.routes.ts
│   ├── quality.routes.ts
│   └── usage.routes.ts
├── schemas/                # NEW: Split from catalog/types.ts
│   ├── mdm-global-metadata.schema.ts
│   ├── standard-pack.schema.ts
│   ├── lineage.schema.ts
│   ├── glossary.schema.ts
│   ├── tags.schema.ts
│   ├── kpi.schema.ts
│   └── observability.schema.ts
├── services/               # NEW: Business logic layer
│   ├── metadata.service.ts
│   ├── lineage.service.ts
│   ├── impact-analysis.service.ts
│   ├── glossary.service.ts
│   ├── tags.service.ts
│   ├── quality.service.ts
│   └── usage.service.ts
├── catalog/                # EXISTING: Keep repositories
│   ├── business-term.repository.ts
│   ├── data-contract.repository.ts
│   ├── field-dictionary.repository.ts
│   ├── field-alias.repository.ts
│   └── types.ts            # REFACTOR: Move to schemas/
├── mcp/                    # NEW: MCP tools
│   ├── metadata-studio.mcp.json
│   └── tools/
│       ├── metadata.tools.ts
│       ├── lineage.tools.ts
│       ├── impact.tools.ts
│       ├── glossary.tools.ts
│       ├── quality.tools.ts
│       └── usage.tools.ts
├── adaptive-migration/     # EXISTING: Keep
└── metadata-engine.ts      # EXISTING: Keep
```

**Pattern:** Follow `kernel/api/` route structure, `kernel/mcp/` tool patterns

---

#### 1.2 Schema Migration

**Action:** Migrate from `slug` → `canonical_key`, add governance tiers

**Leverage:** Existing Zod patterns from `kernel/contracts/`, `kernel/finance/compliance/`

```typescript
// NEW: schemas/mdm-global-metadata.schema.ts
export const ZMdmGlobalMetadata = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  canonicalKey: z.string().min(1),  // ← Renamed from slug
  label: z.string().min(1),
  description: z.string().nullable(),
  domain: z.string(),  // FINANCE, HR, SCM, etc.
  module: z.string().nullable(),  // GL, AR, AP, etc.
  entityUrn: z.string().nullable(),  // NEW
  governanceTier: GovernanceTierEnum,  // NEW: Tier 1-5
  standardPackIdPrimary: z.string().uuid().nullable(),  // NEW
  standardPackIdSecondary: z.array(z.string().uuid()).default([]),  // NEW
  // ... existing fields
});

// NEW: schemas/observability.schema.ts
export const GovernanceTierEnum = z.enum([
  "tier_1",  // Critical - finance/reporting, requires lineage
  "tier_2",  // Important - operational, requires profiling
  "tier_3",  // Standard - general use
  "tier_4",  // Low priority
  "tier_5",  // Deprecated/archived
]);
```

**Migration Script:**
```typescript
// scripts/migrate-slug-to-canonical-key.ts
// 1. Read all catalog entities
// 2. Map slug → canonical_key
// 3. Add governance_tier based on existing status
// 4. Update database
// 5. Update all references
```

---

#### 1.3 SoT Packs Implementation

**Action:** Create standard pack system for IFRS/MFRS

**Leverage:** Existing `kernel/finance/compliance/mfrs-ifrs-validator.ts` patterns

```typescript
// NEW: schemas/standard-pack.schema.ts
export const ZStandardPack = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  name: z.string(),  // "IFRS_15", "MFRS_1", "HL7_FHIR_R4"
  version: z.string().regex(/^\d+\.\d+\.\d+$/),  // SemVer
  standardType: z.enum(["IFRS", "MFRS", "HL7", "GS1", "HACCP", "CUSTOM"]),
  isDeprecated: z.boolean().default(false),
  definition: z.record(z.any()),  // JSON schema of pack contents
  createdAt: z.date(),
  updatedAt: z.date(),
});

// NEW: services/standard-pack.service.ts
export class StandardPackService {
  // Load packs from JSON/YAML files (treated as code)
  async loadPackFromFile(packPath: string): Promise<StandardPack> {}
  
  // Validate field against SoT pack
  async validateFieldAgainstPack(fieldId: string, packId: string): Promise<ValidationResult> {}
  
  // Get all fields using a pack
  async getFieldsByPack(packId: string): Promise<MdmGlobalMetadata[]> {}
}
```

**Pattern:** Follow `kernel/finance/compliance/mfrs-ifrs-validator.ts` validation approach

---

### Phase 2: Core Features (2-3 months)

#### 2.1 Governance Tiers

**Action:** Implement Tier 1-5 system

**Leverage:** `kernel/sandbox/resource-governor.ts` tier patterns

```typescript
// NEW: services/governance-tier.service.ts
export class GovernanceTierService {
  private TIER_REQUIREMENTS = {
    tier_1: {
      requiresLineage: true,
      requiresProfiling: true,
      requiresQuality: true,
      requiresHITL: true,
      requiresOwner: true,
      requiresSoTPack: true,
    },
    tier_2: {
      requiresLineage: false,
      requiresProfiling: true,
      requiresQuality: true,
      requiresHITL: true,
      requiresOwner: true,
      requiresSoTPack: false,
    },
    // ... tier_3, tier_4, tier_5
  };
  
  validateTierCompliance(metadata: MdmGlobalMetadata): ValidationResult {}
}
```

---

#### 2.2 Data Lineage

**Action:** Implement lineage graph (nodes/edges)

**Leverage:** 
- `apps/web/DATA_NEXUS_ARCHITECTURE.md` Neo4j patterns
- `kernel/drift/cascade-predictor.ts` dependency traversal
- `packages/ui/` entity-relationship-graph component

```typescript
// NEW: schemas/lineage.schema.ts
export const ZLineageNode = z.object({
  urn: z.string(),  // Unique Resource Name
  type: z.enum(["field", "entity", "kpi", "report"]),
  tenantId: z.string().uuid().nullable(),
  metadata: z.record(z.any()),
});

export const ZLineageEdge = z.object({
  id: z.string().uuid(),
  sourceUrn: z.string(),
  targetUrn: z.string(),
  edgeType: z.enum(["produces", "consumes", "derived_from", "transforms"]),
  transformation: z.string().nullable(),  // SQL/expression
  tenantId: z.string().uuid().nullable(),
});

// NEW: services/lineage.service.ts
export class LineageService {
  // Build lineage graph
  async getLineageGraph(urn: string, direction: "upstream" | "downstream", depth: number): Promise<LineageGraph> {}
  
  // Add lineage edge
  async addEdge(edge: LineageEdge): Promise<void> {}
  
  // Get all downstream dependencies
  async getDownstream(urn: string): Promise<LineageNode[]> {}
}
```

**Storage:** Use PostgreSQL with recursive CTEs (no Neo4j dependency per GRCD)

---

#### 2.3 Impact Analysis

**Action:** Implement "what breaks if X changes?" analysis

**Leverage:** `kernel/drift/cascade-predictor.ts` patterns

```typescript
// NEW: services/impact-analysis.service.ts
export class ImpactAnalysisService {
  // Analyze impact of metadata change
  async analyzeImpact(
    changeType: "field_update" | "sot_change" | "kpi_change",
    targetId: string
  ): Promise<ImpactReport> {
    // 1. Traverse lineage graph (upstream/downstream)
    // 2. Find all KPIs using this field
    // 3. Find all reports using this field
    // 4. Calculate blast radius
    // 5. Return impact report
  }
  
  // Get affected assets
  async getAffectedAssets(urn: string): Promise<AffectedAsset[]> {}
}
```

**Pattern:** Reuse `CascadePredictor` traversal logic

---

#### 2.4 HITL Approval Workflows

**Action:** Integrate HITL for Tier 1/2 changes

**Leverage:** `kernel/governance/hitl/approval-engine.ts`

```typescript
// NEW: services/metadata-hitl.service.ts
import { HITLApprovalEngine } from "../../governance/hitl/approval-engine";

export class MetadataHITLService {
  private hitlEngine: HITLApprovalEngine;
  
  async requestApproval(
    change: MetadataChange,
    actorId: string
  ): Promise<ApprovalRequest> {
    // Check if change requires approval (Tier 1/2)
    if (change.governanceTier === "tier_1" || change.governanceTier === "tier_2") {
      return await this.hitlEngine.requestApproval({
        actionType: "metadata.update",
        actorId,
        payload: change,
        riskLevel: "high",
      });
    }
  }
}
```

**Pattern:** Reuse existing HITL engine, add metadata-specific rules

---

### Phase 3: Advanced Features (2-3 months)

#### 3.1 Data Profiling

**Action:** Implement basic profiling for Tier 1/2 assets

**Leverage:** `apps/web/DATA_WAREHOUSE_PRD.md` profiling patterns

```typescript
// NEW: services/profiling.service.ts
export class ProfilingService {
  async profileField(
    fieldId: string,
    tableName: string,
    columnName: string
  ): Promise<ProfilerStats> {
    // Run SQL queries:
    // - COUNT(*) as row_count
    // - COUNT(DISTINCT column) as distinct_count
    // - COUNT(*) FILTER (WHERE column IS NULL) as null_count
    // - MIN(column), MAX(column) as range
    // - AVG(column) as avg_value (for numeric)
  }
  
  async scheduleProfiling(tier: "tier_1" | "tier_2"): Promise<void> {
    // Schedule profiling job (≥ 1 run per 7 days for Tier 1)
  }
}
```

---

#### 3.2 Data Quality Checks

**Action:** Implement rule-based quality checks

**Leverage:** `apps/web/DATA_WAREHOUSE_PRD.md` Great Expectations patterns

```typescript
// NEW: services/quality.service.ts
export class QualityService {
  async runQualityChecks(fieldId: string): Promise<QualityReport> {
    // Run checks:
    // - NOT NULL constraint
    // - Uniqueness
    // - Min/max thresholds
    // - Pattern matching
    // - Referential integrity
  }
  
  async defineQualityRule(rule: QualityRule): Promise<void> {}
}
```

---

#### 3.3 Usage Analytics

**Action:** Track "who used what?"

**Leverage:** `apps/web/DATA_NEXUS_ARCHITECTURE.md` usage patterns

```typescript
// NEW: services/usage.service.ts
export class UsageService {
  async logUsage(
    assetUrn: string,
    userId: string,
    action: "view" | "query" | "export" | "update"
  ): Promise<void> {
    // Log to mdm_usage_log table
  }
  
  async getUsageStats(assetUrn: string): Promise<UsageStats> {
    // Aggregate usage data
  }
}
```

---

#### 3.4 Composite KPI Modeling

**Action:** Implement numerator/denominator KPIs with SoT enforcement

```typescript
// NEW: schemas/kpi.schema.ts
export const ZCompositeKPI = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  name: z.string(),
  numerator: z.object({
    fieldId: z.string().uuid(),
    expression: z.string().nullable(),  // SQL expression
    standardPackId: z.string().uuid(),
  }),
  denominator: z.object({
    fieldId: z.string().uuid(),
    expression: z.string().nullable(),
    standardPackId: z.string().uuid(),
  }),
  governanceTier: GovernanceTierEnum,
  owner: z.string().nullable(),
  steward: z.string().nullable(),
});
```

---

### Phase 4: MCP Integration (1-2 months)

#### 4.1 MCP Tools

**Action:** Expose metadata tools via MCP

**Leverage:** `kernel/mcp/executor/tool.executor.ts` patterns

```typescript
// NEW: mcp/tools/metadata.tools.ts
export const metadataTools: MCPTool[] = [
  {
    name: "metadata_search",
    description: "Search metadata by name, tag, owner, SoT pack, tier, domain",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        filters: {
          type: "object",
          properties: {
            domain: { type: "string" },
            tier: { type: "string" },
            standardPackId: { type: "string" },
          },
        },
      },
    },
  },
  {
    name: "metadata_lookup",
    description: "Lookup metadata by canonical_key before creating",
    inputSchema: {
      type: "object",
      properties: {
        canonicalKey: { type: "string" },
        tenantId: { type: "string" },
      },
    },
  },
  // ... more tools
];
```

**Pattern:** Follow `kernel/api/routes/mcp.ts` registration pattern

---

#### 4.2 MCP Manifest

**Action:** Create metadata-studio.mcp.json

**Leverage:** `kernel/mcp/manifests/example-manifest.json` structure

```json
{
  "name": "metadata-studio",
  "version": "4.1.0",
  "protocol": "mcp",
  "protocolVersion": "2025-03-26",
  "description": "Nexus Metadata Studio - Global metadata, lineage, and quality",
  "tools": [
    // ... all metadata tools
  ],
  "policies": {
    "enforceSoTPack": true,
    "enforceTiering": true,
    "enforceHITL": true,
    "noPII": true
  }
}
```

---

### Phase 5: API Routes (1 month)

#### 5.1 Hono Routes

**Action:** Create API routes in `kernel/metadata/api/`

**Leverage:** `kernel/api/routes/` patterns

```typescript
// NEW: api/metadata.routes.ts
import { Hono } from "hono";
import { metadataService } from "../services/metadata.service";

export function registerMetadataRoutes(app: Hono) {
  // GET /metadata/search
  app.get("/metadata/search", async (c) => {
    const query = c.req.query("q");
    const filters = c.req.query("filters");
    const result = await metadataService.search(query, filters);
    return c.json(result);
  });
  
  // GET /metadata/:canonicalKey
  app.get("/metadata/:canonicalKey", async (c) => {
    const canonicalKey = c.req.param("canonicalKey");
    const result = await metadataService.getByCanonicalKey(canonicalKey);
    return c.json(result);
  });
  
  // POST /metadata (with HITL check)
  app.post("/metadata", async (c) => {
    const body = await c.req.json();
    const result = await metadataService.create(body, c.get("actorId"));
    return c.json(result, 201);
  });
}
```

**Pattern:** Follow `kernel/api/router.ts` registration pattern

---

## 🔍 GRCD Gaps Identified

### Missing Requirements

| Gap | Description | Impact | Priority |
|-----|-------------|--------|----------|
| **MS-GAP-1** | No explicit **versioning strategy** for metadata entities | Cannot track history | 🟡 **MEDIUM** |
| **MS-GAP-2** | No **soft-delete** implementation details | Cannot deprecate safely | 🟡 **MEDIUM** |
| **MS-GAP-3** | No **bulk import/export** specification | Migration difficult | 🟡 **MEDIUM** |
| **MS-GAP-4** | No **change feed** implementation | Cannot track changes over time | 🟢 **LOW** |
| **MS-GAP-5** | No **search ranking** algorithm | Poor search relevance | 🟢 **LOW** |
| **MS-GAP-6** | No **caching invalidation** strategy | Stale metadata | 🟡 **MEDIUM** |
| **MS-GAP-7** | No **multi-language** support for glossary | Limited internationalization | 🟢 **LOW** |
| **MS-GAP-8** | No **data retention** policies for usage logs | Compliance risk | 🟡 **MEDIUM** |

---

### Enhancement Opportunities

| Enhancement | Description | Value | Effort |
|-------------|-------------|-------|--------|
| **MS-ENH-1** | **AI-powered metadata suggestions** | Auto-complete metadata from data | 🔴 **HIGH** | Medium |
| **MS-ENH-2** | **Automated lineage inference** | Parse SQL/jobs to build lineage | 🔴 **HIGH** | High |
| **MS-ENH-3** | **Metadata health scoring** | Composite score (profiling + quality + usage) | 🟡 **MEDIUM** | Low |
| **MS-ENH-4** | **Collaborative annotations** | Comments, discussions on metadata | 🟡 **MEDIUM** | Medium |
| **MS-ENH-5** | **Metadata templates** | Pre-defined metadata for common patterns | 🟢 **LOW** | Low |
| **MS-ENH-6** | **Version comparison** | Diff metadata versions | 🟡 **MEDIUM** | Medium |
| **MS-ENH-7** | **Metadata drift detection** | Compare actual vs. defined metadata | 🔴 **HIGH** | High |
| **MS-ENH-8** | **Integration with external catalogs** | OpenMetadata, DataHub, Collibra | 🟡 **MEDIUM** | High |

---

## 🚀 Special Features to Uplift Metadata Studio

### 1. AI-Powered Metadata Enrichment

**Feature:** Auto-suggest metadata from actual data

**Implementation:**
```typescript
// NEW: services/ai-metadata-enricher.service.ts
export class AIMetadataEnricherService {
  async suggestMetadata(
    tableName: string,
    columnName: string,
    sampleData: any[]
  ): Promise<MetadataSuggestion> {
    // 1. Analyze data patterns
    // 2. Infer data type, format, constraints
    // 3. Suggest business term mapping
    // 4. Suggest SoT pack
    // 5. Suggest governance tier
    // 6. Return confidence scores
  }
}
```

**Value:** Reduces manual metadata entry by 60-80%

---

### 2. Automated Lineage Inference

**Feature:** Parse SQL/jobs to automatically build lineage

**Implementation:**
```typescript
// NEW: services/lineage-inference.service.ts
export class LineageInferenceService {
  async inferFromSQL(sql: string): Promise<LineageEdge[]> {
    // 1. Parse SQL AST
    // 2. Extract FROM/JOIN clauses (sources)
    // 3. Extract SELECT/INSERT/UPDATE (targets)
    // 4. Extract transformations (expressions)
    // 5. Build lineage edges
  }
  
  async inferFromJob(jobId: string): Promise<LineageEdge[]> {
    // 1. Get job definition
    // 2. Parse job steps
    // 3. Build lineage graph
  }
}
```

**Value:** Eliminates 90% of manual lineage entry

---

### 3. Metadata Health Scoring

**Feature:** Composite health score for metadata assets

**Implementation:**
```typescript
// NEW: services/health-scoring.service.ts
export class HealthScoringService {
  async calculateHealthScore(assetUrn: string): Promise<HealthScore> {
    const profiling = await this.profilingService.getStats(assetUrn);
    const quality = await this.qualityService.getQualityReport(assetUrn);
    const usage = await this.usageService.getUsageStats(assetUrn);
    const lineage = await this.lineageService.getLineageCoverage(assetUrn);
    
    return {
      overall: this.weightedScore([
        { value: profiling.completeness, weight: 0.3 },
        { value: quality.passRate, weight: 0.3 },
        { value: usage.activityScore, weight: 0.2 },
        { value: lineage.coverage, weight: 0.2 },
      ]),
      badges: this.generateBadges(profiling, quality, usage, lineage),
    };
  }
}
```

**Value:** Quick visual indicator of metadata quality

---

### 4. Metadata Drift Detection

**Feature:** Compare actual schema vs. defined metadata

**Implementation:**
```typescript
// NEW: services/drift-detection.service.ts
export class DriftDetectionService {
  async detectDrift(
    entityUrn: string,
    actualSchema: Record<string, any>
  ): Promise<DriftReport> {
    // 1. Get defined metadata
    // 2. Compare with actual schema
    // 3. Detect:
    //    - New columns (not in metadata)
    //    - Missing columns (in metadata, not in DB)
    //    - Type mismatches
    //    - Constraint changes
    // 4. Generate drift report
  }
}
```

**Value:** Prevents metadata from becoming stale

---

### 5. Collaborative Annotations

**Feature:** Comments and discussions on metadata

**Implementation:**
```typescript
// NEW: schemas/annotation.schema.ts
export const ZMetadataAnnotation = z.object({
  id: z.string().uuid(),
  assetUrn: z.string(),
  authorId: z.string(),
  content: z.string(),
  type: z.enum(["comment", "question", "suggestion", "approval"]),
  createdAt: z.date(),
  resolvedAt: z.date().nullable(),
});
```

**Value:** Improves metadata quality through collaboration

---

### 6. Integration with External Catalogs

**Feature:** Sync with OpenMetadata, DataHub, Collibra

**Implementation:**
```typescript
// NEW: services/external-catalog-sync.service.ts
export class ExternalCatalogSyncService {
  async syncFromOpenMetadata(openMetadataUrl: string): Promise<SyncResult> {
    // 1. Fetch metadata from OpenMetadata API
    // 2. Transform to mdm_global_metadata format
    // 3. Merge with existing metadata
    // 4. Resolve conflicts
  }
}
```

**Value:** Leverage existing metadata investments

---

## 📊 Implementation Timeline

| Phase | Duration | Key Deliverables | Dependencies |
|-------|----------|-----------------|--------------|
| **Phase 1** | 2-3 months | Schema migration, SoT packs, directory structure | Database migration scripts |
| **Phase 2** | 2-3 months | Governance tiers, lineage, impact analysis, HITL | Phase 1 complete |
| **Phase 3** | 2-3 months | Profiling, quality, usage, KPIs | Phase 2 complete |
| **Phase 4** | 1-2 months | MCP tools, API routes | Phase 3 complete |
| **Phase 5** | 1 month | Testing, documentation, migration | All phases complete |
| **TOTAL** | **8-12 months** | Full GRCD compliance + enhancements | |

---

## 🎯 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **GRCD Compliance** | 100% | All MS-F-* requirements implemented |
| **Metadata Coverage** | ≥ 80% of fields | Fields with metadata / Total fields |
| **Lineage Coverage (Tier 1)** | 100% | Tier 1 fields with lineage / Total Tier 1 |
| **Profiling Coverage (Tier 1/2)** | ≥ 90% | Profiled assets / Total Tier 1/2 |
| **Search Latency** | < 150ms p95 | `metadata_search_duration_seconds` |
| **Lineage Query Latency** | < 300ms p95 | `metadata_lineage_duration_seconds` |
| **HITL Approval Time** | < 4 hours | Average approval time for Tier 1 changes |

---

## ✅ Next Steps

1. **Approve Strategy** - Review and approve this implementation plan
2. **Create Epic** - Break down into Jira/GitHub issues
3. **Start Phase 1** - Begin schema migration
4. **Set Up CI/CD** - Automated testing for each phase
5. **Documentation** - Update GRCD with implementation details

---

**Last Updated:** November 30, 2025  
**Status:** 📋 **READY FOR REVIEW**

