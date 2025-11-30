-- Migration 020: Create Data Profiling Tables
-- GRCD v4.1.0 Compliant: Data profiling for Tier 1/2 assets
-- Phase 3.1: Data Profiling Service

-- Profiling Statistics table
CREATE TABLE IF NOT EXISTS mdm_profiling_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  field_id UUID NOT NULL,  -- Reference to field_dictionary.id
  field_urn VARCHAR(500) NOT NULL,  -- URN for quick lookup
  table_name VARCHAR(255) NOT NULL,
  column_name VARCHAR(255) NOT NULL,
  
  -- Basic Statistics
  row_count BIGINT NOT NULL DEFAULT 0,
  distinct_count BIGINT NOT NULL DEFAULT 0,
  null_count BIGINT NOT NULL DEFAULT 0,
  null_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,  -- 0.00 to 100.00
  
  -- Numeric Statistics
  min_value NUMERIC,
  max_value NUMERIC,
  avg_value NUMERIC,
  median_value NUMERIC,
  std_dev NUMERIC,
  
  -- String Statistics
  min_length INTEGER,
  max_length INTEGER,
  avg_length NUMERIC,
  
  -- Date Statistics
  min_date TIMESTAMPTZ,
  max_date TIMESTAMPTZ,
  
  -- Distribution (top values as JSONB)
  top_values JSONB DEFAULT '[]'::jsonb,  -- Array of {value, count, percentage}
  
  -- Metadata
  data_type VARCHAR(50) NOT NULL,
  profiled_at TIMESTAMPTZ DEFAULT NOW(),
  profiled_by VARCHAR(255),
  profiling_duration_ms INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (tenant_id, field_id, profiled_at)  -- One profile per field per timestamp
);

-- Profiling Jobs table
CREATE TABLE IF NOT EXISTS mdm_profiling_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES kernel_field_dictionary(id) ON DELETE CASCADE,
  field_urn VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  stats_id UUID REFERENCES mdm_profiling_stats(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiling Schedules table
CREATE TABLE IF NOT EXISTS mdm_profiling_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES kernel_field_dictionary(id) ON DELETE CASCADE,
  field_urn VARCHAR(500) NOT NULL,
  governance_tier VARCHAR(20) NOT NULL CHECK (governance_tier IN ('tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5')),
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  cron_expression VARCHAR(100) NOT NULL,  -- Cron expression for scheduling
  is_active BOOLEAN DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (tenant_id, field_id)  -- One schedule per field
);

-- Indexes for Profiling Stats
CREATE INDEX IF NOT EXISTS idx_profiling_stats_tenant ON mdm_profiling_stats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiling_stats_field ON mdm_profiling_stats(field_id);
CREATE INDEX IF NOT EXISTS idx_profiling_stats_field_urn ON mdm_profiling_stats(field_urn);
CREATE INDEX IF NOT EXISTS idx_profiling_stats_profiled_at ON mdm_profiling_stats(profiled_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiling_stats_table_column ON mdm_profiling_stats(table_name, column_name);

-- Indexes for Profiling Jobs
CREATE INDEX IF NOT EXISTS idx_profiling_jobs_tenant ON mdm_profiling_jobs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiling_jobs_field ON mdm_profiling_jobs(field_id);
CREATE INDEX IF NOT EXISTS idx_profiling_jobs_status ON mdm_profiling_jobs(status);
CREATE INDEX IF NOT EXISTS idx_profiling_jobs_scheduled_at ON mdm_profiling_jobs(scheduled_at);

-- Indexes for Profiling Schedules
CREATE INDEX IF NOT EXISTS idx_profiling_schedules_tenant ON mdm_profiling_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiling_schedules_field ON mdm_profiling_schedules(field_id);
CREATE INDEX IF NOT EXISTS idx_profiling_schedules_active ON mdm_profiling_schedules(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_profiling_schedules_next_run ON mdm_profiling_schedules(next_run_at) WHERE is_active = TRUE;

-- Full-text search on field_urn
CREATE INDEX IF NOT EXISTS idx_profiling_stats_urn_fts ON mdm_profiling_stats
  USING gin(to_tsvector('english', field_urn));

COMMENT ON TABLE mdm_profiling_stats IS 'Data profiling statistics for metadata fields (GRCD v4.1.0 compliant)';
COMMENT ON TABLE mdm_profiling_jobs IS 'Profiling job execution tracking (GRCD v4.1.0 compliant)';
COMMENT ON TABLE mdm_profiling_schedules IS 'Profiling schedule configuration for Tier 1/2 assets (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN mdm_profiling_stats.top_values IS 'JSONB array of top N values with counts and percentages';
COMMENT ON COLUMN mdm_profiling_schedules.frequency IS 'Profiling frequency: daily (Tier 1), weekly (Tier 1), monthly (Tier 2)';
COMMENT ON COLUMN mdm_profiling_schedules.cron_expression IS 'Cron expression for scheduling (e.g., "0 2 * * 0" for weekly Sunday 2 AM)';

