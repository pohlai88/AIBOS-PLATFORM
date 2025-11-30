-- Migration 019: Create Lineage tables
-- GRCD v4.1.0 Compliant: Data lineage tracking for Tier 1/2 assets
-- Phase 2.2: Lineage System

-- Lineage Nodes table
CREATE TABLE IF NOT EXISTS mdm_lineage_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  urn VARCHAR(500) NOT NULL,  -- Unique Resource Name (e.g., "urn:metadata:field:revenue")
  type VARCHAR(50) NOT NULL CHECK (type IN ('field', 'entity', 'kpi', 'report', 'transformation', 'source')),
  entity_id UUID,  -- Reference to business_term, field_dictionary, etc.
  entity_type VARCHAR(50) CHECK (entity_type IN ('business_term', 'data_contract', 'field_dictionary', 'kpi', 'report', 'transformation')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, urn)
);

-- Lineage Edges table
CREATE TABLE IF NOT EXISTS mdm_lineage_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  source_urn VARCHAR(500) NOT NULL,  -- Source node URN
  target_urn VARCHAR(500) NOT NULL,  -- Target node URN
  edge_type VARCHAR(50) NOT NULL CHECK (edge_type IN ('produces', 'consumes', 'derived_from', 'transforms', 'references')),
  transformation TEXT,  -- SQL/expression/description of transformation
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, source_urn, target_urn, edge_type)
);

-- Indexes for Lineage Nodes
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_tenant ON mdm_lineage_nodes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_urn ON mdm_lineage_nodes(urn);
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_type ON mdm_lineage_nodes(type);
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_entity ON mdm_lineage_nodes(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_metadata ON mdm_lineage_nodes USING GIN(metadata);

-- Indexes for Lineage Edges
CREATE INDEX IF NOT EXISTS idx_lineage_edges_tenant ON mdm_lineage_edges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lineage_edges_source ON mdm_lineage_edges(source_urn);
CREATE INDEX IF NOT EXISTS idx_lineage_edges_target ON mdm_lineage_edges(target_urn);
CREATE INDEX IF NOT EXISTS idx_lineage_edges_type ON mdm_lineage_edges(edge_type);
CREATE INDEX IF NOT EXISTS idx_lineage_edges_source_target ON mdm_lineage_edges(source_urn, target_urn);
CREATE INDEX IF NOT EXISTS idx_lineage_edges_metadata ON mdm_lineage_edges USING GIN(metadata);

-- Foreign key constraints (self-referential for edges)
-- Note: We don't add FK constraints to nodes because URNs can reference external entities

-- Full-text search on URNs
CREATE INDEX IF NOT EXISTS idx_lineage_nodes_urn_fts ON mdm_lineage_nodes
  USING gin(to_tsvector('english', urn));

COMMENT ON TABLE mdm_lineage_nodes IS 'Lineage graph nodes representing metadata entities (GRCD v4.1.0 compliant)';
COMMENT ON TABLE mdm_lineage_edges IS 'Lineage graph edges representing relationships between metadata entities (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN mdm_lineage_nodes.urn IS 'Unique Resource Name (URN) for the entity (e.g., "urn:metadata:field:revenue")';
COMMENT ON COLUMN mdm_lineage_nodes.entity_id IS 'Reference to the actual entity (business_term.id, field_dictionary.id, etc.)';
COMMENT ON COLUMN mdm_lineage_nodes.entity_type IS 'Type of entity referenced (business_term, field_dictionary, etc.)';
COMMENT ON COLUMN mdm_lineage_edges.source_urn IS 'Source node URN (where data flows from)';
COMMENT ON COLUMN mdm_lineage_edges.target_urn IS 'Target node URN (where data flows to)';
COMMENT ON COLUMN mdm_lineage_edges.edge_type IS 'Type of relationship: produces, consumes, derived_from, transforms, references';
COMMENT ON COLUMN mdm_lineage_edges.transformation IS 'SQL/expression/description of how source is transformed into target';

