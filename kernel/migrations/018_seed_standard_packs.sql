-- Migration 018: Seed initial Standard Packs
-- GRCD v4.1.0 Compliant: Initial IFRS/MFRS packs

-- Seed IFRS 15 (Revenue from Contracts with Customers)
INSERT INTO mdm_standard_pack (tenant_id, name, version, standard_type, is_deprecated, definition, description)
VALUES (
  NULL,  -- Global pack (tenant_id = NULL)
  'IFRS_15',
  '1.0.0',
  'IFRS',
  FALSE,
  '{
    "revenue": {
      "canonical_key": "revenue",
      "description": "Revenue from contracts with customers",
      "ifrs_reference": "IFRS 15.31",
      "governance_tier": "tier_1"
    },
    "contract_liability": {
      "canonical_key": "contract_liability",
      "description": "Contract liability (performance obligation not yet satisfied)",
      "ifrs_reference": "IFRS 15.106",
      "governance_tier": "tier_1"
    },
    "contract_asset": {
      "canonical_key": "contract_asset",
      "description": "Contract asset (right to consideration)",
      "ifrs_reference": "IFRS 15.107",
      "governance_tier": "tier_1"
    }
  }'::jsonb,
  'IFRS 15 - Revenue from Contracts with Customers (v1.0.0)'
)
ON CONFLICT (tenant_id, name, version) DO NOTHING;

-- Seed MFRS 1 (First-time Adoption of Malaysian Financial Reporting Standards)
INSERT INTO mdm_standard_pack (tenant_id, name, version, standard_type, is_deprecated, definition, description)
VALUES (
  NULL,  -- Global pack (tenant_id = NULL)
  'MFRS_1',
  '1.0.0',
  'MFRS',
  FALSE,
  '{
    "accounting_policies": {
      "canonical_key": "accounting_policies",
      "description": "Accounting policies adopted in preparing financial statements",
      "mfrs_reference": "MFRS 1.7",
      "governance_tier": "tier_1"
    },
    "opening_balance_sheet": {
      "canonical_key": "opening_balance_sheet",
      "description": "Opening balance sheet on date of transition",
      "mfrs_reference": "MFRS 1.10",
      "governance_tier": "tier_1"
    }
  }'::jsonb,
  'MFRS 1 - First-time Adoption of Malaysian Financial Reporting Standards (v1.0.0)'
)
ON CONFLICT (tenant_id, name, version) DO NOTHING;

COMMENT ON TABLE mdm_standard_pack IS 'Seeded with initial IFRS_15 and MFRS_1 packs (GRCD v4.1.0 compliant)';

