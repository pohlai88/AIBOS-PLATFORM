-- Migration 021: Create Data Quality Tables
-- GRCD v4.1.0 Compliant: Data quality checks for metadata fields
-- Phase 3.2: Data Quality Checks Service

-- Quality Rules table
CREATE TABLE IF NOT EXISTS mdm_quality_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES kernel_field_dictionary(id) ON DELETE CASCADE,
  field_urn VARCHAR(500) NOT NULL,
  rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN (
    'not_null', 'unique', 'min_value', 'max_value', 'min_length', 'max_length',
    'pattern', 'enum', 'referential_integrity', 'custom_sql'
  )),
  rule_name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Rule configuration (JSONB)
  config JSONB DEFAULT '{}'::jsonb,
  
  -- Thresholds and constraints
  threshold NUMERIC,
  pattern VARCHAR(500),  -- Regex pattern
  enum_values JSONB,     -- Array of allowed values
  custom_sql TEXT,       -- Custom SQL assertion
  
  -- Severity
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (tenant_id, field_id, rule_name)  -- One rule name per field
);

-- Quality Check Results table
CREATE TABLE IF NOT EXISTS mdm_quality_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES mdm_quality_rules(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES kernel_field_dictionary(id) ON DELETE CASCADE,
  field_urn VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('passed', 'failed', 'warning', 'error')),
  
  -- Results
  passed BOOLEAN NOT NULL,
  failed_count BIGINT,  -- Number of rows that failed
  total_count BIGINT,   -- Total rows checked
  pass_rate DECIMAL(5,2),  -- Pass rate percentage (0.00 to 100.00)
  
  -- Details
  message TEXT,
  details JSONB DEFAULT '{}'::jsonb,  -- Rule-specific details
  
  -- Execution metadata
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  executed_by VARCHAR(255),
  execution_duration_ms INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality Violations table
CREATE TABLE IF NOT EXISTS mdm_quality_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES mdm_quality_rules(id) ON DELETE CASCADE,
  check_result_id UUID NOT NULL REFERENCES mdm_quality_check_results(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES kernel_field_dictionary(id) ON DELETE CASCADE,
  field_urn VARCHAR(500) NOT NULL,
  
  -- Violation details
  violation_type VARCHAR(50) NOT NULL CHECK (violation_type IN (
    'not_null', 'unique', 'min_value', 'max_value', 'min_length', 'max_length',
    'pattern', 'enum', 'referential_integrity', 'custom_sql'
  )),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,  -- Violation-specific details
  
  -- Violation data
  sample_values JSONB,  -- Sample values that violated the rule
  row_count BIGINT NOT NULL DEFAULT 0,  -- Number of rows with this violation
  
  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255),
  resolution_notes TEXT,
  
  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Quality Rules
CREATE INDEX IF NOT EXISTS idx_quality_rules_tenant ON mdm_quality_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_rules_field ON mdm_quality_rules(field_id);
CREATE INDEX IF NOT EXISTS idx_quality_rules_field_urn ON mdm_quality_rules(field_urn);
CREATE INDEX IF NOT EXISTS idx_quality_rules_type ON mdm_quality_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_quality_rules_active ON mdm_quality_rules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_quality_rules_severity ON mdm_quality_rules(severity);

-- Indexes for Quality Check Results
CREATE INDEX IF NOT EXISTS idx_quality_check_results_tenant ON mdm_quality_check_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_check_results_rule ON mdm_quality_check_results(rule_id);
CREATE INDEX IF NOT EXISTS idx_quality_check_results_field ON mdm_quality_check_results(field_id);
CREATE INDEX IF NOT EXISTS idx_quality_check_results_field_urn ON mdm_quality_check_results(field_urn);
CREATE INDEX IF NOT EXISTS idx_quality_check_results_status ON mdm_quality_check_results(status);
CREATE INDEX IF NOT EXISTS idx_quality_check_results_passed ON mdm_quality_check_results(passed);
CREATE INDEX IF NOT EXISTS idx_quality_check_results_executed_at ON mdm_quality_check_results(executed_at DESC);

-- Indexes for Quality Violations
CREATE INDEX IF NOT EXISTS idx_quality_violations_tenant ON mdm_quality_violations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_quality_violations_rule ON mdm_quality_violations(rule_id);
CREATE INDEX IF NOT EXISTS idx_quality_violations_check_result ON mdm_quality_violations(check_result_id);
CREATE INDEX IF NOT EXISTS idx_quality_violations_field ON mdm_quality_violations(field_id);
CREATE INDEX IF NOT EXISTS idx_quality_violations_field_urn ON mdm_quality_violations(field_urn);
CREATE INDEX IF NOT EXISTS idx_quality_violations_type ON mdm_quality_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_quality_violations_severity ON mdm_quality_violations(severity);
CREATE INDEX IF NOT EXISTS idx_quality_violations_resolved ON mdm_quality_violations(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX IF NOT EXISTS idx_quality_violations_detected_at ON mdm_quality_violations(detected_at DESC);

-- Full-text search on rule_name and description
CREATE INDEX IF NOT EXISTS idx_quality_rules_fts ON mdm_quality_rules
  USING gin(to_tsvector('english', coalesce(rule_name, '') || ' ' || coalesce(description, '')));

COMMENT ON TABLE mdm_quality_rules IS 'Data quality rules for metadata fields (GRCD v4.1.0 compliant)';
COMMENT ON TABLE mdm_quality_check_results IS 'Quality check execution results (GRCD v4.1.0 compliant)';
COMMENT ON TABLE mdm_quality_violations IS 'Quality violations detected during checks (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN mdm_quality_rules.config IS 'JSONB rule-specific configuration';
COMMENT ON COLUMN mdm_quality_rules.enum_values IS 'JSONB array of allowed values for enum rules';
COMMENT ON COLUMN mdm_quality_check_results.details IS 'JSONB rule-specific check details';
COMMENT ON COLUMN mdm_quality_violations.details IS 'JSONB violation-specific details';
COMMENT ON COLUMN mdm_quality_violations.sample_values IS 'JSONB array of sample values that violated the rule';

