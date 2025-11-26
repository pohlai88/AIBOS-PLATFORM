-- ============================================================
-- AI-BOS Kernel: API Keys Table
-- ============================================================
-- Supports API key authentication with hashed keys
-- ============================================================

CREATE TABLE IF NOT EXISTS kernel_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL,             -- e.g. "user:123", "service:billing"
  key_hash TEXT NOT NULL,               -- hashed API key (never store raw)
  label TEXT,                           -- human-friendly label
  scopes TEXT[] NOT NULL DEFAULT '{}',  -- e.g. {"actions:read","actions:execute"}
  roles TEXT[] NOT NULL DEFAULT '{}',   -- e.g. {"admin","service"}
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Index for fast lookup by tenant + subject
CREATE INDEX IF NOT EXISTS idx_kernel_api_keys_tenant_subject
  ON kernel_api_keys(tenant_id, subject_id);

-- Index for key hash lookup (primary auth path)
CREATE INDEX IF NOT EXISTS idx_kernel_api_keys_hash
  ON kernel_api_keys(key_hash);

-- Enable RLS
ALTER TABLE kernel_api_keys ENABLE ROW LEVEL SECURITY;

