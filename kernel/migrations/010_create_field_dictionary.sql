-- Migration 010: Create Field Dictionary table
-- Part of Policy V2 / Metadata Catalog

CREATE TABLE IF NOT EXISTS kernel_field_dictionary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
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
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_dict_tenant ON kernel_field_dictionary(tenant_id);
CREATE INDEX IF NOT EXISTS idx_field_dict_slug ON kernel_field_dictionary(slug);
CREATE INDEX IF NOT EXISTS idx_field_dict_data_type ON kernel_field_dictionary(data_type);
CREATE INDEX IF NOT EXISTS idx_field_dict_business_term ON kernel_field_dictionary(business_term_id);
CREATE INDEX IF NOT EXISTS idx_field_dict_data_contract ON kernel_field_dictionary(data_contract_id);
CREATE INDEX IF NOT EXISTS idx_field_dict_status ON kernel_field_dictionary(status);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_field_dict_fts ON kernel_field_dictionary
  USING gin(to_tsvector('english', coalesce(label, '') || ' ' || coalesce(description, '')));

COMMENT ON TABLE kernel_field_dictionary IS 'Field definitions with types, formats, and constraints';
COMMENT ON COLUMN kernel_field_dictionary.slug IS 'Canonical lower_snake_case identifier';
COMMENT ON COLUMN kernel_field_dictionary.constraints IS 'JSON: min, max, pattern, enum, etc.';

