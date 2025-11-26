-- Migration 008: Create Business Terms table
-- Part of Policy V2 / Metadata Catalog

CREATE TABLE IF NOT EXISTS kernel_business_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  label VARCHAR(500) NOT NULL,
  description TEXT,
  domain VARCHAR(100),
  synonyms JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_terms_tenant ON kernel_business_terms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_terms_slug ON kernel_business_terms(slug);
CREATE INDEX IF NOT EXISTS idx_business_terms_domain ON kernel_business_terms(domain);
CREATE INDEX IF NOT EXISTS idx_business_terms_status ON kernel_business_terms(status);

-- Full-text search on label + description
CREATE INDEX IF NOT EXISTS idx_business_terms_fts ON kernel_business_terms
  USING gin(to_tsvector('english', coalesce(label, '') || ' ' || coalesce(description, '')));

COMMENT ON TABLE kernel_business_terms IS 'Canonical business terminology definitions';
COMMENT ON COLUMN kernel_business_terms.slug IS 'Canonical lower_snake_case identifier (SSOT)';
COMMENT ON COLUMN kernel_business_terms.synonyms IS 'JSON array of alternative names';

