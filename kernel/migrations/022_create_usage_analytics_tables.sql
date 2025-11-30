-- Migration 022: Create Usage Analytics Tables
-- GRCD v4.1.0 Compliant: Usage analytics for metadata assets
-- Phase 3.3: Usage Analytics Service

-- Usage Log table
CREATE TABLE IF NOT EXISTS mdm_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  asset_urn VARCHAR(500) NOT NULL,  -- URN of the metadata asset
  asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN (
    'business_term', 'data_contract', 'field_dictionary', 'kpi', 'report', 'transformation'
  )),
  action VARCHAR(20) NOT NULL CHECK (action IN (
    'view', 'query', 'export', 'update', 'create', 'delete', 'download', 'share'
  )),
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  
  -- Context
  context JSONB DEFAULT '{}'::jsonb,  -- Additional context (query params, filters, etc.)
  ip_address VARCHAR(45),  -- IPv4 or IPv6
  user_agent TEXT,
  
  -- Duration (for queries/exports)
  duration_ms INTEGER,
  
  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Usage Log
CREATE INDEX IF NOT EXISTS idx_usage_log_tenant ON mdm_usage_log(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_asset_urn ON mdm_usage_log(asset_urn);
CREATE INDEX IF NOT EXISTS idx_usage_log_asset_type ON mdm_usage_log(asset_type);
CREATE INDEX IF NOT EXISTS idx_usage_log_action ON mdm_usage_log(action);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_id ON mdm_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_log_created_at ON mdm_usage_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_log_asset_action ON mdm_usage_log(asset_urn, action);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_asset ON mdm_usage_log(user_id, asset_urn);
CREATE INDEX IF NOT EXISTS idx_usage_log_success ON mdm_usage_log(success);

-- Composite index for common queries (asset + date range)
CREATE INDEX IF NOT EXISTS idx_usage_log_asset_date ON mdm_usage_log(asset_urn, created_at DESC);

-- Full-text search on asset_urn
CREATE INDEX IF NOT EXISTS idx_usage_log_urn_fts ON mdm_usage_log
  USING gin(to_tsvector('english', asset_urn));

-- Partitioning by month (optional, for large datasets)
-- CREATE TABLE mdm_usage_log_2025_11 PARTITION OF mdm_usage_log
--   FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

COMMENT ON TABLE mdm_usage_log IS 'Usage analytics log for metadata assets (GRCD v4.1.0 compliant)';
COMMENT ON COLUMN mdm_usage_log.asset_urn IS 'URN of the metadata asset (e.g., urn:metadata:field:revenue)';
COMMENT ON COLUMN mdm_usage_log.context IS 'JSONB additional context (query params, filters, etc.)';
COMMENT ON COLUMN mdm_usage_log.duration_ms IS 'Duration in milliseconds (for queries/exports)';
COMMENT ON COLUMN mdm_usage_log.success IS 'Whether the action was successful';

