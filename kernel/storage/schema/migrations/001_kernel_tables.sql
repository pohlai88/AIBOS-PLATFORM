-- ============================================================
-- AI-BOS Kernel v1 Schema
-- ============================================================
-- Run this in Supabase SQL Editor or via migration tool
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. kernel_tenants
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kernel_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  plan TEXT NOT NULL DEFAULT 'free',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kernel_tenants_code ON kernel_tenants(code);
CREATE INDEX IF NOT EXISTS idx_kernel_tenants_status ON kernel_tenants(status);

-- ────────────────────────────────────────────────────────────
-- 2. kernel_metadata_entities
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kernel_metadata_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, namespace, key, version)
);

CREATE INDEX IF NOT EXISTS idx_kernel_metadata_tenant ON kernel_metadata_entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kernel_metadata_namespace ON kernel_metadata_entities(namespace);
CREATE INDEX IF NOT EXISTS idx_kernel_metadata_key ON kernel_metadata_entities(key);

-- ────────────────────────────────────────────────────────────
-- 3. kernel_contracts
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kernel_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL,
  name TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  schema JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, contract_type, name, version)
);

CREATE INDEX IF NOT EXISTS idx_kernel_contracts_tenant ON kernel_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kernel_contracts_type ON kernel_contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_kernel_contracts_status ON kernel_contracts(status);

-- ────────────────────────────────────────────────────────────
-- 4. kernel_engines
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kernel_engines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  engine_id TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  manifest JSONB NOT NULL,
  signature TEXT,
  status TEXT NOT NULL DEFAULT 'installed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, engine_id, version)
);

CREATE INDEX IF NOT EXISTS idx_kernel_engines_tenant ON kernel_engines(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kernel_engines_engine_id ON kernel_engines(engine_id);
CREATE INDEX IF NOT EXISTS idx_kernel_engines_status ON kernel_engines(status);

-- ────────────────────────────────────────────────────────────
-- 5. kernel_audit_events
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kernel_audit_events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'kernel',
  subject TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kernel_audit_tenant ON kernel_audit_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kernel_audit_category ON kernel_audit_events(category);
CREATE INDEX IF NOT EXISTS idx_kernel_audit_action ON kernel_audit_events(action);
CREATE INDEX IF NOT EXISTS idx_kernel_audit_created ON kernel_audit_events(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 6. kernel_policies (for PolicyEngine)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kernel_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_kernel_policies_tenant ON kernel_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kernel_policies_status ON kernel_policies(status);

-- ────────────────────────────────────────────────────────────
-- 7. kernel_trusted_keys (for TrustStore)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kernel_trusted_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'RSA-SHA256',
  purposes TEXT[] NOT NULL DEFAULT ARRAY['engine-manifest'],
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_kernel_keys_key_id ON kernel_trusted_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_kernel_keys_expires ON kernel_trusted_keys(expires_at);

-- ────────────────────────────────────────────────────────────
-- Updated_at trigger function
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'kernel_tenants',
    'kernel_metadata_entities',
    'kernel_contracts',
    'kernel_engines',
    'kernel_policies'
  ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- Row Level Security (RLS) - Enable for multi-tenancy
-- ────────────────────────────────────────────────────────────
ALTER TABLE kernel_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE kernel_metadata_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kernel_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE kernel_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE kernel_audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kernel_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE kernel_trusted_keys ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- Insert system tenant
-- ────────────────────────────────────────────────────────────
INSERT INTO kernel_tenants (code, name, status, plan)
VALUES ('system', 'AI-BOS System', 'active', 'enterprise')
ON CONFLICT (code) DO NOTHING;

