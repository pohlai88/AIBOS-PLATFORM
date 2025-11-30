-- Migration 013: Add classification/sensitivity to data contracts + action links
-- Part of Policy V2

-- Add classification and sensitivity columns to data contracts
ALTER TABLE kernel_data_contracts
  ADD COLUMN IF NOT EXISTS classification VARCHAR(20) DEFAULT 'internal'
    CHECK (classification IN ('public', 'internal', 'financial', 'operational', 'regulatory')),
  ADD COLUMN IF NOT EXISTS sensitivity VARCHAR(20) DEFAULT 'internal'
    CHECK (sensitivity IN ('public', 'internal', 'confidential', 'restricted'));

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_data_contracts_classification ON kernel_data_contracts(classification);
CREATE INDEX IF NOT EXISTS idx_data_contracts_sensitivity ON kernel_data_contracts(sensitivity);

-- Create action ↔ data contract link table
CREATE TABLE IF NOT EXISTS kernel_action_data_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES kernel_tenants(id) ON DELETE CASCADE,
  action_id VARCHAR(255) NOT NULL,
  data_contract_id UUID NOT NULL REFERENCES kernel_data_contracts(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('read', 'write', 'read-write')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (tenant_id, action_id, data_contract_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_action_dc_tenant ON kernel_action_data_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_dc_action ON kernel_action_data_contracts(action_id);
CREATE INDEX IF NOT EXISTS idx_action_dc_contract ON kernel_action_data_contracts(data_contract_id);
CREATE INDEX IF NOT EXISTS idx_action_dc_access ON kernel_action_data_contracts(access_type);

COMMENT ON TABLE kernel_action_data_contracts IS 'Links actions to the data contracts they touch';
COMMENT ON COLUMN kernel_action_data_contracts.access_type IS 'read, write, or read-write';
COMMENT ON COLUMN kernel_data_contracts.classification IS 'Data classification: public, internal, financial, operational, regulatory';
COMMENT ON COLUMN kernel_data_contracts.sensitivity IS 'Sensitivity level: public, internal, confidential, restricted';

