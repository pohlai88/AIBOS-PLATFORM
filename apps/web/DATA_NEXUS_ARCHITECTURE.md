# AI-BOS Data Nexus - Technical Architecture

**Version:** 1.0.0  
**Last Updated:** November 27, 2025

---

## 🏗️ **Application Structure** (Next.js App Router)

### **Complete Directory Tree**

```
apps/web/
├── app/
│   ├── (auth)/                              ← Public routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx                       → Simple auth layout
│   │
│   ├── (dashboard)/                         ← Main app shell
│   │   ├── layout.tsx                       → AppShell wrapper
│   │   │
│   │   ├── (modules)/                       ← ERP + Data Nexus modules
│   │   │   │
│   │   │   ├── data-nexus/                  ← 🎯 DATA GOVERNANCE MODULE
│   │   │   │   ├── layout.tsx               → Module layout
│   │   │   │   ├── page.tsx                 → Dashboard home
│   │   │   │   │
│   │   │   │   ├── catalog/                 ← Data Catalog
│   │   │   │   │   ├── page.tsx             → Catalog home (search)
│   │   │   │   │   ├── assets/
│   │   │   │   │   │   └── [assetId]/
│   │   │   │   │   │       ├── page.tsx     → Asset detail
│   │   │   │   │   │       ├── schema/page.tsx
│   │   │   │   │   │       ├── lineage/page.tsx
│   │   │   │   │   │       ├── quality/page.tsx
│   │   │   │   │   │       └── contracts/page.tsx
│   │   │   │   │   ├── search/page.tsx
│   │   │   │   │   └── browse/page.tsx
│   │   │   │   │
│   │   │   │   ├── lineage/                 ← Lineage Explorer
│   │   │   │   │   ├── page.tsx             → Graph viewer
│   │   │   │   │   ├── graph/page.tsx
│   │   │   │   │   ├── impact-analysis/page.tsx
│   │   │   │   │   └── column-lineage/
│   │   │   │   │       └── [assetId]/page.tsx
│   │   │   │   │
│   │   │   │   ├── contracts/               ← Data Contracts
│   │   │   │   │   ├── page.tsx             → Contracts list
│   │   │   │   │   ├── create/page.tsx      → Contract wizard
│   │   │   │   │   ├── [contractId]/
│   │   │   │   │   │   ├── page.tsx         → Contract detail
│   │   │   │   │   │   ├── edit/page.tsx
│   │   │   │   │   │   └── monitor/page.tsx
│   │   │   │   │   ├── monitor/page.tsx     → All SLAs
│   │   │   │   │   └── violations/page.tsx
│   │   │   │   │
│   │   │   │   ├── quality/                 ← Data Quality
│   │   │   │   │   ├── page.tsx             → Quality overview
│   │   │   │   │   ├── profiling/
│   │   │   │   │   │   └── [assetId]/page.tsx
│   │   │   │   │   ├── tests/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── create/page.tsx
│   │   │   │   │   └── anomalies/page.tsx
│   │   │   │   │
│   │   │   │   ├── governance/              ← Governance
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── policies/page.tsx
│   │   │   │   │   ├── classifications/page.tsx
│   │   │   │   │   └── audit/page.tsx
│   │   │   │   │
│   │   │   │   ├── pipelines/               ← Orchestration
│   │   │   │   │   ├── page.tsx             → DAGs list
│   │   │   │   │   ├── dags/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── create/page.tsx
│   │   │   │   │   │   └── [dagId]/
│   │   │   │   │   │       ├── page.tsx     → DAG editor
│   │   │   │   │   │       └── runs/page.tsx
│   │   │   │   │   ├── runs/page.tsx
│   │   │   │   │   └── schedules/page.tsx
│   │   │   │   │
│   │   │   │   ├── glossary/                ← Business Glossary
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── terms/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [termId]/page.tsx
│   │   │   │   │   ├── categories/page.tsx
│   │   │   │   │   └── mappings/page.tsx
│   │   │   │   │
│   │   │   │   └── insights/                ← AI Insights
│   │   │   │       ├── page.tsx
│   │   │   │       ├── recommendations/page.tsx
│   │   │   │       ├── usage-analytics/page.tsx
│   │   │   │       └── cost-optimization/page.tsx
│   │   │   │
│   │   │   ├── accounting/                  ← Other ERP modules
│   │   │   ├── inventory/
│   │   │   ├── sales/
│   │   │   └── ... (other modules)
│   │   │
│   │   └── (settings)/                      ← Settings
│   │       ├── profile/page.tsx
│   │       ├── tenants/page.tsx
│   │       └── users/page.tsx
│   │
│   ├── api/                                 ← API Routes
│   │   ├── (modules)/
│   │   │   └── data-nexus/
│   │   │       ├── catalog/
│   │   │       │   ├── assets/route.ts
│   │   │       │   └── search/route.ts
│   │   │       ├── lineage/
│   │   │       │   └── graph/route.ts
│   │   │       ├── contracts/route.ts
│   │   │       ├── quality/route.ts
│   │   │       └── pipelines/route.ts
│   │   │
│   │   ├── (platform)/
│   │   │   ├── health/route.ts
│   │   │   └── webhooks/route.ts
│   │   │
│   │   └── (ai)/
│   │       ├── recommend/route.ts
│   │       ├── classify/route.ts
│   │       └── chat/route.ts
│   │
│   ├── layout.tsx                           → Root (ThemeProvider)
│   └── globals.css
│
├── components/                              ← App-specific components
│   ├── data-nexus/
│   │   ├── catalog/
│   │   │   ├── AssetCard.tsx
│   │   │   ├── AssetSearch.tsx
│   │   │   ├── SchemaTable.tsx
│   │   │   └── TagCloud.tsx
│   │   ├── lineage/
│   │   │   ├── LineageGraph.tsx             → D3.js graph
│   │   │   ├── TimelineScrubber.tsx
│   │   │   └── NodeDetail.tsx
│   │   ├── contracts/
│   │   │   ├── ContractWizard.tsx
│   │   │   ├── SchemaEditor.tsx
│   │   │   └── SLAMonitor.tsx
│   │   ├── quality/
│   │   │   ├── ProfilingStats.tsx
│   │   │   ├── TestSuite.tsx
│   │   │   └── AnomalyTimeline.tsx
│   │   ├── pipelines/
│   │   │   ├── DAGEditor.tsx                → React Flow
│   │   │   ├── CodeEditor.tsx               → Monaco
│   │   │   └── RunHistory.tsx
│   │   └── shared/
│   │       ├── MetadataPanel.tsx
│   │       ├── OwnershipBadge.tsx
│   │       └── PopularityScore.tsx
│   │
│   └── navigation/
│       ├── ModuleSwitcher.tsx
│       └── DataNexusNav.tsx
│
├── lib/                                     ← Utilities
│   ├── data-nexus/
│   │   ├── catalog-client.ts
│   │   ├── lineage-engine.ts
│   │   ├── quality-rules.ts
│   │   └── ai-recommender.ts
│   ├── auth.ts
│   └── supabase.ts
│
└── package.json
```

---

## 🗂️ **Database Schema** (PostgreSQL + Neo4j)

### **PostgreSQL Tables** (Structured Metadata)

```sql
-- Core Assets
CREATE TABLE data_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'table', 'file', 'api', 'stream'
  schema_name VARCHAR(255),
  fully_qualified_name TEXT UNIQUE NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  tags JSONB DEFAULT '[]',
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX idx_assets_tenant ON data_assets(tenant_id);
CREATE INDEX idx_assets_type ON data_assets(type);
CREATE INDEX idx_assets_tags ON data_assets USING GIN(tags);
CREATE INDEX idx_assets_search ON data_assets USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Columns (Schema Details)
CREATE TABLE data_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES data_assets(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  nullable BOOLEAN DEFAULT true,
  is_primary_key BOOLEAN DEFAULT false,
  is_foreign_key BOOLEAN DEFAULT false,
  description TEXT,
  tags JSONB DEFAULT '[]',
  statistics JSONB DEFAULT '{}', -- {nulls: 0.23, cardinality: 12345, ...}
  position INT NOT NULL,
  
  UNIQUE(asset_id, name)
);

CREATE INDEX idx_columns_asset ON data_columns(asset_id);

-- Data Contracts
CREATE TABLE data_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  asset_id UUID NOT NULL REFERENCES data_assets(id),
  producer_team_id UUID REFERENCES teams(id),
  consumer_teams UUID[] DEFAULT '{}',
  schema_definition JSONB NOT NULL, -- JSON Schema
  sla_freshness INTERVAL,
  sla_completeness DECIMAL(5,2), -- 95.5 = 95.5%
  sla_accuracy DECIMAL(5,2),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'deprecated', 'violated'
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_contract_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Contract Violations
CREATE TABLE contract_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES data_contracts(id),
  violation_type VARCHAR(100) NOT NULL, -- 'freshness', 'schema', 'quality'
  details JSONB NOT NULL,
  severity VARCHAR(20) NOT NULL, -- 'critical', 'high', 'medium', 'low'
  resolved BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Quality Tests
CREATE TABLE quality_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES data_assets(id),
  column_id UUID REFERENCES data_columns(id),
  test_type VARCHAR(100) NOT NULL, -- 'not_null', 'unique', 'in_set', 'custom_sql'
  test_config JSONB NOT NULL,
  last_run_at TIMESTAMPTZ,
  last_result JSONB, -- {passed: true, rows_tested: 12345, ...}
  enabled BOOLEAN DEFAULT true
);

-- Quality Test Runs
CREATE TABLE quality_test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES quality_tests(id),
  asset_id UUID NOT NULL REFERENCES data_assets(id),
  passed BOOLEAN NOT NULL,
  rows_tested BIGINT,
  rows_passed BIGINT,
  execution_time_ms INT,
  details JSONB,
  run_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Glossary
CREATE TABLE glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  synonyms TEXT[],
  acronyms TEXT[],
  category_id UUID REFERENCES glossary_categories(id),
  owner_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'approved', 'deprecated'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_id, name)
);

CREATE TABLE glossary_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES glossary_categories(id),
  description TEXT,
  
  UNIQUE(tenant_id, name)
);

-- Term-to-Asset Mappings
CREATE TABLE glossary_asset_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  term_id UUID NOT NULL REFERENCES glossary_terms(id),
  asset_id UUID REFERENCES data_assets(id),
  column_id UUID REFERENCES data_columns(id),
  confidence DECIMAL(5,2) DEFAULT 100.00, -- AI-suggested mappings < 100%
  approved BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CHECK (asset_id IS NOT NULL OR column_id IS NOT NULL)
);

-- Usage Analytics
CREATE TABLE asset_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES data_assets(id),
  user_id UUID REFERENCES users(id),
  query_type VARCHAR(50), -- 'select', 'insert', 'update', 'delete'
  query_hash VARCHAR(64), -- SHA-256 of SQL
  duration_ms INT,
  rows_affected BIGINT,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_usage_asset ON asset_usage(asset_id, accessed_at DESC);
CREATE INDEX idx_usage_user ON asset_usage(user_id, accessed_at DESC);

-- AI Recommendations
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(100) NOT NULL, -- 'similar_asset', 'archive_candidate', 'contract_suggestion'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  confidence DECIMAL(5,2),
  dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### **Neo4j Graph Schema** (Lineage Relationships)

```cypher
// Nodes
(:Asset {id, name, type, tenant_id})
(:Column {id, name, asset_id, data_type})
(:Pipeline {id, name, type})
(:Job {id, name, pipeline_id})
(:User {id, email, name})
(:Team {id, name})

// Relationships
(:Asset)-[:PRODUCES]->(:Asset)
(:Asset)-[:CONSUMES]->(:Asset)
(:Column)-[:DERIVED_FROM]->(:Column)
(:Pipeline)-[:CONTAINS]->(:Job)
(:Job)-[:READS]->(:Asset)
(:Job)-[:WRITES]->(:Asset)
(:User)-[:OWNS]->(:Asset)
(:Team)-[:OWNS]->(:Asset)
(:Asset)-[:TAGGED_WITH]->(:Tag)
(:Asset)-[:GOVERNED_BY]->(:Contract)

// Example: Create lineage
CREATE (raw:Asset {id: 'uuid1', name: 'raw_events', type: 'table'})
CREATE (transformed:Asset {id: 'uuid2', name: 'customer_events', type: 'table'})
CREATE (analytics:Asset {id: 'uuid3', name: 'analytics_orders', type: 'table'})
CREATE (pipeline:Pipeline {id: 'uuid4', name: 'ETL Pipeline'})
CREATE (job:Job {id: 'uuid5', name: 'Transform Events'})

CREATE (pipeline)-[:CONTAINS]->(job)
CREATE (job)-[:READS]->(raw)
CREATE (job)-[:WRITES]->(transformed)
CREATE (transformed)-[:PRODUCES]->(analytics)

// Query: Get full upstream lineage
MATCH path = (downstream:Asset {name: 'analytics_orders'})<-[:PRODUCES*]-(upstream:Asset)
RETURN path

// Query: Find all assets using PII data
MATCH (asset:Asset)-[:TAGGED_WITH]->(:Tag {name: 'PII'})
MATCH (downstream:Asset)<-[:PRODUCES*]-(asset)
RETURN downstream
```

---

## 🔄 **Data Flow Architecture**

### **1. Metadata Ingestion Pipeline**

```
┌─────────────┐
│ Data Source │ (Postgres, Snowflake, S3, etc.)
└──────┬──────┘
       │
       ↓ (1) Extract Metadata
┌────────────────┐
│ Ingestion Job  │ (Cron / Event-triggered)
│ (Python/Rust)  │
└────────┬───────┘
         │
         ↓ (2) Transform to standard format
┌────────────────┐
│ Metadata API   │ (REST/GraphQL)
│ (Next.js API)  │
└────────┬───────┘
         │
         ↓ (3) Store in DB
┌────────────────┐     ┌────────────────┐
│  PostgreSQL    │     │    Neo4j       │
│ (Structured)   │     │  (Lineage)     │
└────────┬───────┘     └────────┬───────┘
         │                      │
         └──────────┬───────────┘
                    ↓ (4) Index for search
         ┌──────────────────┐
         │   Meilisearch    │
         │  (Full-text)     │
         └─────────┬────────┘
                   │
                   ↓ (5) Serve to frontend
         ┌──────────────────┐
         │   Next.js App    │
         │  (React Query)   │
         └──────────────────┘
```

### **2. Real-time Update Flow**

```
┌──────────────┐
│ Source Event │ (Table created, Schema changed)
└──────┬───────┘
       │
       ↓ (1) Webhook/CDC
┌──────────────┐
│  BullMQ Job  │ (Redis queue)
└──────┬───────┘
       │
       ↓ (2) Process async
┌──────────────┐
│ Worker Pool  │ (Background jobs)
└──────┬───────┘
       │
       ↓ (3) Update DB
┌──────────────┐
│ PostgreSQL + │
│ Neo4j Update │
└──────┬───────┘
       │
       ↓ (4) Broadcast change
┌──────────────┐
│ Supabase RT  │ (WebSocket)
└──────┬───────┘
       │
       ↓ (5) Auto-refresh UI
┌──────────────┐
│ React Query  │ (Cache invalidation)
└──────────────┘
```

### **3. AI Recommendation Pipeline**

```
┌──────────────────┐
│ User Activity    │ (Search, view, query logs)
└────────┬─────────┘
         │
         ↓ (1) Feature extraction
┌──────────────────┐
│ Analytics Engine │
└────────┬─────────┘
         │
         ↓ (2) Generate embeddings
┌──────────────────┐
│ OpenAI API       │ (text-embedding-ada-002)
└────────┬─────────┘
         │
         ↓ (3) Vector similarity search
┌──────────────────┐
│ pgvector Query   │ (Find similar assets)
└────────┬─────────┘
         │
         ↓ (4) Rank & filter
┌──────────────────┐
│ ML Model         │ (Collaborative filtering)
└────────┬─────────┘
         │
         ↓ (5) Store recommendations
┌──────────────────┐
│ ai_recommendations│ (Table)
└────────┬─────────┘
         │
         ↓ (6) Display in UI
┌──────────────────┐
│ Recommendation   │
│ Feed Component   │
└──────────────────┘
```

---

## 🚀 **Deployment Architecture**

### **Development**

```
┌─────────────────────────────────────────────────────────┐
│ Docker Compose                                          │
│ ┌─────────────┐  ┌──────────┐  ┌──────────┐           │
│ │ Next.js App │  │ Postgres │  │  Neo4j   │           │
│ │ (Port 3000) │  │ (5432)   │  │ (7474)   │           │
│ └─────────────┘  └──────────┘  └──────────┘           │
│ ┌─────────────┐  ┌──────────┐  ┌──────────┐           │
│ │ Meilisearch │  │  Redis   │  │ BullMQ   │           │
│ │ (7700)      │  │ (6379)   │  │ Dashboard│           │
│ └─────────────┘  └──────────┘  └──────────┘           │
└─────────────────────────────────────────────────────────┘
```

### **Production (Kubernetes)**

```
┌─────────── Kubernetes Cluster ───────────┐
│                                           │
│ ┌─── Ingress (NGINX) ───┐                │
│ │  data-nexus.com       │                │
│ └───────────┬───────────┘                │
│             │                             │
│    ┌────────┴────────┐                   │
│    │                 │                   │
│ ┌──▼──┐          ┌──▼──┐                │
│ │Next │          │Next │  (3 replicas)  │
│ │ Pod │          │ Pod │                │
│ └──┬──┘          └──┬──┘                │
│    │                │                    │
│    └────────┬───────┘                   │
│             │                             │
│   ┌─────────▼─────────┐                 │
│   │ Supabase Postgres │ (Managed)       │
│   └───────────────────┘                 │
│                                           │
│   ┌───────────────────┐                 │
│   │ Neo4j Aura        │ (Managed)       │
│   └───────────────────┘                 │
│                                           │
│   ┌───────────────────┐                 │
│   │ Redis Cloud       │ (Managed)       │
│   └───────────────────┘                 │
└───────────────────────────────────────────┘
```

---

## 📊 **Performance Targets**

| Metric | Target | Strategy |
|--------|--------|----------|
| **Search Response** | < 200ms | Meilisearch + caching |
| **Lineage Load** | < 500ms | Graph DB + lazy loading |
| **Asset Detail** | < 100ms | PostgreSQL indexes + React Query |
| **Real-time Update** | < 1s | WebSocket + optimistic UI |
| **AI Recommendation** | < 2s | Pre-computed + vector cache |
| **Quality Test Run** | < 5s/1M rows | Parallel execution + sampling |

---

## 🔐 **Security Architecture**

### **Multi-Tenant Isolation**

```
Every query filtered by tenant_id:

-- Row-Level Security (RLS)
CREATE POLICY tenant_isolation ON data_assets
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Application layer
const assets = await db
  .from('data_assets')
  .select('*')
  .eq('tenant_id', session.tenantId);
```

### **Access Control Levels**

1. **Tenant-Level** - User sees only their tenant's data
2. **Role-Level** - Admin vs. Analyst vs. Viewer
3. **Asset-Level** - Ownership and permissions per dataset
4. **Column-Level** - PII masking for certain roles
5. **Row-Level** - Data filters based on user attributes

---

**Status:** Architecture Complete ✅  
**Next:** Begin Phase 1 implementation with catalog module

