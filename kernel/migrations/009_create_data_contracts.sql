-- Migration 009: Create Data Contracts table
-- Part of Policy V2 / Metadata Catalog
-- GRCD v4.1.0 Compliant: Uses canonical_key and governance_tier

CREATE TABLE IF NOT EXISTS kernel_data_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  canonical_key VARCHAR(255) NOT NULL,  -- GRCD: Replaces slug
  name VARCHAR(500) NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  owner VARCHAR(255),
  steward VARCHAR(255),  -- GRCD: Steward
  source_system VARCHAR(100),
  governance_tier VARCHAR(20) DEFAULT 'tier_3' CHECK (governance_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5')),  -- GRCD: Tier 1-5
  standard_pack_id_primary UUID,  -- GRCD: Primary SoT pack reference
  standard_pack_id_secondary UUID[],  -- GRCD: Secondary SoT pack references
  entity_urn VARCHAR(500),  -- GRCD: Unique Resource Name for lineage
  schema JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, canonical_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_contracts_tenant ON kernel_data_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_contracts_canonical_key ON kernel_data_contracts(canonical_key);
CREATE INDEX IF NOT EXISTS idx_data_contracts_source ON kernel_data_contracts(source_system);
CREATE INDEX IF NOT EXISTS idx_data_contracts_governance_tier ON kernel_data_contracts(governance_tier);
CREATE INDEX IF NOT EXISTS idx_data_contracts_owner ON kernel_data_contracts(owner);
CREATE INDEX IF NOT EXISTS idx_data_contracts_standard_pack ON kernel_data_contracts(standard_pack_id_primary);
CREATE INDEX IF NOT EXISTS idx_data_contracts_entity_urn ON kernel_data_contracts(entity_urn);

COMMENT ON TABLE kernel_data_contracts IS 'Data contract definitions for governed data flows (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN kernel_data_contracts.canonical_key IS 'Canonical lower_snake_case identifier - GRCD compliant';
COMMENT ON COLUMN kernel_data_contracts.governance_tier IS 'Governance tier (tier_1 to tier_5) - GRCD compliant';
COMMENT ON COLUMN kernel_data_contracts.standard_pack_id_primary IS 'Primary Source of Truth pack reference (IFRS/MFRS)';
COMMENT ON COLUMN kernel_data_contracts.entity_urn IS 'Unique Resource Name for lineage tracking';
COMMENT ON COLUMN kernel_data_contracts.schema IS 'JSON schema or field definitions';

