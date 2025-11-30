-- ============================================================================
-- BFF Audit Store Migration
-- ============================================================================
-- Creates the bff_audit_entries table for persistent audit trail storage
-- 
-- Features:
-- - Hash chain integrity (previous_hash references)
-- - Indexed queries for fast lookups
-- - JSONB metadata for flexible storage
-- - Automatic timestamps
-- ============================================================================

CREATE TABLE IF NOT EXISTS bff_audit_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id VARCHAR(255) NOT NULL UNIQUE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hash VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64),
  
  -- Context
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  
  -- Request details
  method VARCHAR(10) NOT NULL,
  path TEXT NOT NULL,
  protocol VARCHAR(20) NOT NULL,
  action VARCHAR(50) NOT NULL,
  
  -- Classification
  category VARCHAR(20) NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  
  -- Outcome
  status VARCHAR(20) NOT NULL,
  status_code INTEGER,
  duration_ms INTEGER,
  
  -- Metadata
  metadata JSONB,
  
  -- Audit trail
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Primary lookup by request ID
CREATE INDEX IF NOT EXISTS idx_audit_request_id ON bff_audit_entries(request_id);

-- Tenant-based queries
CREATE INDEX IF NOT EXISTS idx_audit_tenant_id ON bff_audit_entries(tenant_id);

-- Time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON bff_audit_entries(timestamp DESC);

-- Hash chain verification
CREATE INDEX IF NOT EXISTS idx_audit_hash ON bff_audit_entries(hash);

-- Composite index for tenant + time queries (most common)
CREATE INDEX IF NOT EXISTS idx_audit_tenant_timestamp ON bff_audit_entries(tenant_id, timestamp DESC);

-- Category and risk level filtering
CREATE INDEX IF NOT EXISTS idx_audit_category ON bff_audit_entries(category);
CREATE INDEX IF NOT EXISTS idx_audit_risk_level ON bff_audit_entries(risk_level);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_audit_status ON bff_audit_entries(status);

-- ============================================================================
-- Retention Policy (Optional - implement via scheduled job)
-- ============================================================================
-- To implement retention, create a scheduled job that runs:
-- DELETE FROM bff_audit_entries WHERE created_at < NOW() - INTERVAL '90 days';
-- 
-- Or use pg_cron extension:
-- SELECT cron.schedule('audit-retention', '0 0 * * *', 
--   'DELETE FROM bff_audit_entries WHERE created_at < NOW() - INTERVAL ''90 days''');

