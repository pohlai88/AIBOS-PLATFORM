-- Migration 009: Create Data Contracts table
-- Part of Policy V2 / Metadata Catalog

CREATE TABLE IF NOT EXISTS kernel_data_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  version INTEGER DEFAULT 1,
  owner VARCHAR(255),
  source_system VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
  schema JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_contracts_tenant ON kernel_data_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_contracts_slug ON kernel_data_contracts(slug);
CREATE INDEX IF NOT EXISTS idx_data_contracts_source ON kernel_data_contracts(source_system);
CREATE INDEX IF NOT EXISTS idx_data_contracts_status ON kernel_data_contracts(status);
CREATE INDEX IF NOT EXISTS idx_data_contracts_owner ON kernel_data_contracts(owner);

COMMENT ON TABLE kernel_data_contracts IS 'Data contract definitions for governed data flows';
COMMENT ON COLUMN kernel_data_contracts.slug IS 'Canonical lower_snake_case identifier';
COMMENT ON COLUMN kernel_data_contracts.schema IS 'JSON schema or field definitions';

