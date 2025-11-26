-- ============================================================
-- AI-BOS Kernel: Role Policies Table
-- ============================================================
-- Defines what each role can do based on risk and side effects
-- ============================================================

CREATE TABLE IF NOT EXISTS kernel_role_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL,                                    -- e.g. "admin", "viewer", "operator"
  max_risk_band TEXT NOT NULL,                           -- 'low' | 'medium' | 'high' | 'critical'
  allowed_side_effect_levels TEXT[] NOT NULL DEFAULT '{}', -- e.g. {'none','local','external'}
  required_scopes TEXT[] NOT NULL DEFAULT '{}',          -- e.g. {'actions:execute'}
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, role)
);

-- Index for fast lookup by tenant + role
CREATE INDEX IF NOT EXISTS idx_kernel_role_policies_tenant_role
  ON kernel_role_policies(tenant_id, role);

-- Enable RLS
ALTER TABLE kernel_role_policies ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_kernel_role_policies_updated_at ON kernel_role_policies;
CREATE TRIGGER update_kernel_role_policies_updated_at
  BEFORE UPDATE ON kernel_role_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Default policies (system tenant)
-- ============================================================

-- Admin: full access
INSERT INTO kernel_role_policies (tenant_id, role, max_risk_band, allowed_side_effect_levels, required_scopes)
SELECT id, 'admin', 'critical', ARRAY['none', 'local', 'external', 'destructive'], ARRAY[]::TEXT[]
FROM kernel_tenants WHERE code = 'system'
ON CONFLICT (tenant_id, role) DO NOTHING;

-- Operator: high risk, no destructive
INSERT INTO kernel_role_policies (tenant_id, role, max_risk_band, allowed_side_effect_levels, required_scopes)
SELECT id, 'operator', 'high', ARRAY['none', 'local', 'external'], ARRAY['actions:execute']
FROM kernel_tenants WHERE code = 'system'
ON CONFLICT (tenant_id, role) DO NOTHING;

-- Service: medium risk, local only
INSERT INTO kernel_role_policies (tenant_id, role, max_risk_band, allowed_side_effect_levels, required_scopes)
SELECT id, 'service', 'medium', ARRAY['none', 'local'], ARRAY['actions:execute']
FROM kernel_tenants WHERE code = 'system'
ON CONFLICT (tenant_id, role) DO NOTHING;

-- Viewer: low risk, read-only
INSERT INTO kernel_role_policies (tenant_id, role, max_risk_band, allowed_side_effect_levels, required_scopes)
SELECT id, 'viewer', 'low', ARRAY['none'], ARRAY['actions:read']
FROM kernel_tenants WHERE code = 'system'
ON CONFLICT (tenant_id, role) DO NOTHING;

