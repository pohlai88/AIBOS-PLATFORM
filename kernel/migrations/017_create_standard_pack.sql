-- Migration 017: Create Standard Pack table
-- GRCD v4.1.0 Compliant: Source of Truth (SoT) packs for IFRS/MFRS/HL7/etc.

CREATE TABLE IF NOT EXISTS mdm_standard_pack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,  -- "IFRS_15", "MFRS_1", "HL7_FHIR_R4"
  version VARCHAR(50) NOT NULL,  -- "1.0.0" (SemVer format)
  standard_type VARCHAR(50) NOT NULL CHECK (standard_type IN ('IFRS', 'MFRS', 'HL7', 'GS1', 'HACCP', 'CUSTOM')),
  is_deprecated BOOLEAN DEFAULT FALSE,
  definition JSONB NOT NULL,  -- Pack contents (field definitions, mappings, etc.)
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, name, version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_standard_pack_tenant ON mdm_standard_pack(tenant_id);
CREATE INDEX IF NOT EXISTS idx_standard_pack_name ON mdm_standard_pack(name);
CREATE INDEX IF NOT EXISTS idx_standard_pack_type ON mdm_standard_pack(standard_type);
CREATE INDEX IF NOT EXISTS idx_standard_pack_deprecated ON mdm_standard_pack(is_deprecated);
CREATE INDEX IF NOT EXISTS idx_standard_pack_definition ON mdm_standard_pack USING GIN(definition);

-- Full-text search on name + description
CREATE INDEX IF NOT EXISTS idx_standard_pack_fts ON mdm_standard_pack
  USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

COMMENT ON TABLE mdm_standard_pack IS 'Source of Truth (SoT) standard packs for IFRS/MFRS/HL7/etc. (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN mdm_standard_pack.name IS 'Pack name (e.g., IFRS_15, MFRS_1)';
COMMENT ON COLUMN mdm_standard_pack.version IS 'SemVer version (e.g., 1.0.0)';
COMMENT ON COLUMN mdm_standard_pack.standard_type IS 'Standard type: IFRS, MFRS, HL7, GS1, HACCP, or CUSTOM';
COMMENT ON COLUMN mdm_standard_pack.definition IS 'JSONB pack contents: field definitions, mappings, references';
COMMENT ON COLUMN mdm_standard_pack.is_deprecated IS 'Whether this pack version is deprecated';

