-- Migration 011: Create Field Aliases table
-- Part of Policy V2 / Metadata Catalog

CREATE TABLE IF NOT EXISTS kernel_field_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  alias_raw VARCHAR(500) NOT NULL,
  alias_normalized VARCHAR(500) NOT NULL,
  canonical_slug VARCHAR(255) NOT NULL,
  source VARCHAR(20) DEFAULT 'manual' CHECK (source IN (
    'manual', 'ai_suggested', 'ai_approved', 'import', 'legacy'
  )),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  approved_by VARCHAR(255),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, alias_normalized)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_field_aliases_tenant ON kernel_field_aliases(tenant_id);
CREATE INDEX IF NOT EXISTS idx_field_aliases_normalized ON kernel_field_aliases(alias_normalized);
CREATE INDEX IF NOT EXISTS idx_field_aliases_canonical ON kernel_field_aliases(canonical_slug);
CREATE INDEX IF NOT EXISTS idx_field_aliases_source ON kernel_field_aliases(source);

-- Trigram index for fuzzy matching (requires pg_trgm extension)
-- CREATE INDEX IF NOT EXISTS idx_field_aliases_trgm ON kernel_field_aliases
--   USING gin(alias_normalized gin_trgm_ops);

COMMENT ON TABLE kernel_field_aliases IS 'Maps external field names to canonical slugs';
COMMENT ON COLUMN kernel_field_aliases.alias_raw IS 'Original external name (preserved)';
COMMENT ON COLUMN kernel_field_aliases.alias_normalized IS 'Normalized for lookup (lowercase, no accents)';
COMMENT ON COLUMN kernel_field_aliases.canonical_slug IS 'Points to field_dictionary.slug';
COMMENT ON COLUMN kernel_field_aliases.confidence IS 'AI suggestion confidence (0.0-1.0)';

