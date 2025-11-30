-- Migration 008: Create Business Terms table
-- Part of Policy V2 / Metadata Catalog
-- GRCD v4.1.0 Compliant: Uses canonical_key and governance_tier

CREATE TABLE IF NOT EXISTS kernel_business_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  canonical_key VARCHAR(255) NOT NULL,  -- GRCD: Replaces slug
  label VARCHAR(500) NOT NULL,
  description TEXT,
  domain VARCHAR(100),
  module VARCHAR(100),  -- GRCD: Module (GL, AR, AP, etc.)
  synonyms JSONB DEFAULT '[]'::jsonb,
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
CREATE INDEX IF NOT EXISTS idx_business_terms_tenant ON kernel_business_terms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_terms_canonical_key ON kernel_business_terms(canonical_key);
CREATE INDEX IF NOT EXISTS idx_business_terms_domain ON kernel_business_terms(domain);
CREATE INDEX IF NOT EXISTS idx_business_terms_governance_tier ON kernel_business_terms(governance_tier);
CREATE INDEX IF NOT EXISTS idx_business_terms_standard_pack ON kernel_business_terms(standard_pack_id_primary);
CREATE INDEX IF NOT EXISTS idx_business_terms_entity_urn ON kernel_business_terms(entity_urn);

-- Full-text search on label + description
CREATE INDEX IF NOT EXISTS idx_business_terms_fts ON kernel_business_terms
  USING gin(to_tsvector('english', coalesce(label, '') || ' ' || coalesce(description, '')));

COMMENT ON TABLE kernel_business_terms IS 'Canonical business terminology definitions (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN kernel_business_terms.canonical_key IS 'Canonical lower_snake_case identifier (SSOT) - GRCD compliant';
COMMENT ON COLUMN kernel_business_terms.governance_tier IS 'Governance tier (tier_1 to tier_5) - GRCD compliant';
COMMENT ON COLUMN kernel_business_terms.standard_pack_id_primary IS 'Primary Source of Truth pack reference (IFRS/MFRS)';
COMMENT ON COLUMN kernel_business_terms.entity_urn IS 'Unique Resource Name for lineage tracking';
COMMENT ON COLUMN kernel_business_terms.synonyms IS 'JSON array of alternative names';

