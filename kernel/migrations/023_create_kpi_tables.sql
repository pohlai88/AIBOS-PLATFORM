-- Migration: Create Composite KPI Tables
-- GRCD v4.1.0 Compliant: Composite KPI Modeling (MS-F-18)
-- Option 2: Composite KPI Modeling

-- ─────────────────────────────────────────────────────────────
-- Composite KPI Table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mdm_composite_kpi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID,
  canonical_key VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Numerator component
  numerator_field_id UUID NOT NULL,
  numerator_expression TEXT,
  numerator_standard_pack_id UUID NOT NULL,
  numerator_description TEXT,
  
  -- Denominator component
  denominator_field_id UUID NOT NULL,
  denominator_expression TEXT,
  denominator_standard_pack_id UUID NOT NULL,
  denominator_description TEXT,
  
  -- Governance
  governance_tier VARCHAR(20) NOT NULL CHECK (governance_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5')),
  owner VARCHAR(255),
  steward VARCHAR(255),
  entity_urn VARCHAR(500),
  domain VARCHAR(100),
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_deprecated BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT fk_numerator_field FOREIGN KEY (numerator_field_id) REFERENCES kernel_field_dictionary(id) ON DELETE RESTRICT,
  CONSTRAINT fk_denominator_field FOREIGN KEY (denominator_field_id) REFERENCES kernel_field_dictionary(id) ON DELETE RESTRICT,
  CONSTRAINT fk_numerator_standard_pack FOREIGN KEY (numerator_standard_pack_id) REFERENCES mdm_standard_pack(id) ON DELETE RESTRICT,
  CONSTRAINT fk_denominator_standard_pack FOREIGN KEY (denominator_standard_pack_id) REFERENCES mdm_standard_pack(id) ON DELETE RESTRICT,
  CONSTRAINT uq_kpi_tenant_canonical UNIQUE (tenant_id, canonical_key)
);

-- ─────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_kpi_tenant_id ON mdm_composite_kpi(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kpi_canonical_key ON mdm_composite_kpi(canonical_key);
CREATE INDEX IF NOT EXISTS idx_kpi_governance_tier ON mdm_composite_kpi(governance_tier);
CREATE INDEX IF NOT EXISTS idx_kpi_domain ON mdm_composite_kpi(domain);
CREATE INDEX IF NOT EXISTS idx_kpi_owner ON mdm_composite_kpi(owner);
CREATE INDEX IF NOT EXISTS idx_kpi_steward ON mdm_composite_kpi(steward);
CREATE INDEX IF NOT EXISTS idx_kpi_entity_urn ON mdm_composite_kpi(entity_urn);
CREATE INDEX IF NOT EXISTS idx_kpi_numerator_field ON mdm_composite_kpi(numerator_field_id);
CREATE INDEX IF NOT EXISTS idx_kpi_denominator_field ON mdm_composite_kpi(denominator_field_id);
CREATE INDEX IF NOT EXISTS idx_kpi_active ON mdm_composite_kpi(is_active) WHERE is_active = true;

-- ─────────────────────────────────────────────────────────────
-- KPI Calculation History (Optional - for tracking calculations)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mdm_kpi_calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID NOT NULL,
  tenant_id UUID,
  numerator_value NUMERIC,
  denominator_value NUMERIC,
  kpi_value NUMERIC,
  calculation_context JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculated_by VARCHAR(255),
  
  CONSTRAINT fk_kpi_calculation FOREIGN KEY (kpi_id) REFERENCES mdm_composite_kpi(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kpi_calc_history_kpi ON mdm_kpi_calculation_history(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_calc_history_tenant ON mdm_kpi_calculation_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kpi_calc_history_date ON mdm_kpi_calculation_history(calculated_at DESC);

-- ─────────────────────────────────────────────────────────────
-- Comments
-- ─────────────────────────────────────────────────────────────

COMMENT ON TABLE mdm_composite_kpi IS 'Composite KPIs with numerator/denominator components and SoT pack enforcement';
COMMENT ON COLUMN mdm_composite_kpi.canonical_key IS 'Unique identifier for the KPI (e.g., "revenue_margin")';
COMMENT ON COLUMN mdm_composite_kpi.numerator_field_id IS 'Reference to field_dictionary for numerator';
COMMENT ON COLUMN mdm_composite_kpi.denominator_field_id IS 'Reference to field_dictionary for denominator';
COMMENT ON COLUMN mdm_composite_kpi.numerator_standard_pack_id IS 'SoT pack for numerator (required for Tier 1/2)';
COMMENT ON COLUMN mdm_composite_kpi.denominator_standard_pack_id IS 'SoT pack for denominator (required for Tier 1/2)';
COMMENT ON COLUMN mdm_composite_kpi.entity_urn IS 'URN for lineage tracking (e.g., "urn:metadata:kpi:revenue_margin")';

COMMENT ON TABLE mdm_kpi_calculation_history IS 'History of KPI calculations for audit and analysis';

