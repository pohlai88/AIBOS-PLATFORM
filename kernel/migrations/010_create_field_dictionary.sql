-- Migration 010: Create Field Dictionary table
-- Part of Policy V2 / Metadata Catalog
-- GRCD v4.1.0 Compliant: Uses canonical_key and governance_tier

CREATE TABLE IF NOT EXISTS kernel_field_dictionary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  canonical_key VARCHAR(255) NOT NULL,  -- GRCD: Replaces slug
  label VARCHAR(500) NOT NULL,
  description TEXT,
  data_type VARCHAR(50) NOT NULL CHECK (data_type IN (
    'string', 'number', 'integer', 'boolean', 'date', 'datetime',
    'decimal', 'currency', 'percentage', 'json', 'array', 'object'
  )),
  format VARCHAR(100),
  unit VARCHAR(50),
  business_term_id UUID REFERENCES kernel_business_terms(id) ON DELETE SET NULL,
  data_contract_id UUID REFERENCES kernel_data_contracts(id) ON DELETE SET NULL,
  constraints JSONB,
  examples JSONB DEFAULT '[]'::jsonb,
  governance_tier VARCHAR(20) DEFAULT 'tier_3' CHECK (governance_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5')),  -- GRCD: Tier 1-5
  standard_pack_id_primary UUID,  -- GRCD: Primary SoT pack reference
  standard_pack_id_secondary UUID[],  -- GRCD: Secondary SoT pack references
  entity_urn VARCHAR(500),  -- GRCD: Unique Resource Name for lineage
  owner VARCHAR(255),  -- GRCD: Owner
  steward VARCHAR(255),  -- GRCD: Steward
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, canonical_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_dict_tenant ON kernel_field_dictionary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_field_dict_canonical_key ON kernel_field_dictionary(canonical_key);
CREATE INDEX IF NOT EXISTS idx_field_dict_data_type ON kernel_field_dictionary(data_type);
CREATE INDEX IF NOT EXISTS idx_field_dict_business_term ON kernel_field_dictionary(business_term_id);
CREATE INDEX IF NOT EXISTS idx_field_dict_data_contract ON kernel_field_dictionary(data_contract_id);
CREATE INDEX IF NOT EXISTS idx_field_dict_governance_tier ON kernel_field_dictionary(governance_tier);
CREATE INDEX IF NOT EXISTS idx_field_dict_standard_pack ON kernel_field_dictionary(standard_pack_id_primary);
CREATE INDEX IF NOT EXISTS idx_field_dict_entity_urn ON kernel_field_dictionary(entity_urn);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_field_dict_fts ON kernel_field_dictionary
  USING gin(to_tsvector('english', coalesce(label, '') || ' ' || coalesce(description, '')));

COMMENT ON TABLE kernel_field_dictionary IS 'Field definitions with types, formats, and constraints (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN kernel_field_dictionary.canonical_key IS 'Canonical lower_snake_case identifier - GRCD compliant';
COMMENT ON COLUMN kernel_field_dictionary.governance_tier IS 'Governance tier (tier_1 to tier_5) - GRCD compliant';
COMMENT ON COLUMN kernel_field_dictionary.standard_pack_id_primary IS 'Primary Source of Truth pack reference (IFRS/MFRS)';
COMMENT ON COLUMN kernel_field_dictionary.entity_urn IS 'Unique Resource Name for lineage tracking';
COMMENT ON COLUMN kernel_field_dictionary.constraints IS 'JSON: min, max, pattern, enum, etc.';

