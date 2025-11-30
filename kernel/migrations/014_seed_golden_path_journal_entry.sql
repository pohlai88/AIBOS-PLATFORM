-- Migration 014: Seed Golden Path - accounting.createJournalEntry
-- Seeds all 5 catalog tables for the first complete data-contract-aware action

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. BUSINESS TERMS (IFRS-aligned terminology)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO kernel_business_terms (tenant_id, canonical_key, label, description, domain, synonyms, governance_tier)
VALUES
  -- Journal Date
  (NULL, 'journal_date', 'Journal Date',
   'Date on which the journal entry is recognized in the ledger. Per MFRS 101.',
   'finance', '["posting date", "entry date", "transaction date"]', 'tier_1'),

  -- GL Account Code
  (NULL, 'gl_account_code', 'GL Account Code',
   'Code of the general ledger account being debited or credited. Per MFRS 101/102.',
   'finance', '["account code", "gl code", "coa code", "ledger account"]', 'tier_1'),

  -- Debit Amount
  (NULL, 'debit_amount', 'Debit Amount',
   'Debit amount in transaction currency. Per MFRS 101.',
   'finance', '["debit", "dr", "dr amount"]', 'tier_1'),

  -- Credit Amount
  (NULL, 'credit_amount', 'Credit Amount',
   'Credit amount in transaction currency. Per MFRS 101.',
   'finance', '["credit", "cr", "cr amount"]', 'tier_1'),

  -- Line Description
  (NULL, 'line_description', 'Line Description',
   'Description for the journal line item.',
   'finance', '["description", "narration", "memo", "remarks"]', 'tier_2'),

  -- Document Number
  (NULL, 'document_number', 'Document Number',
   'External document number or reference for the journal entry.',
   'finance', '["doc number", "reference", "ref no", "voucher number"]', 'tier_2'),

  -- Currency Code
  (NULL, 'currency_code', 'Currency Code',
   'ISO 4217 currency code for the transaction (e.g. MYR, USD). Per MFRS 121.',
   'finance', '["currency", "ccy", "curr"]', 'tier_1'),

  -- Created By
  (NULL, 'created_by', 'Created By',
   'User who created the journal entry.',
   'system', '["creator", "author", "entered by"]', 'tier_3')

ON CONFLICT (tenant_id, canonical_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. DATA CONTRACT (Journal Entries dataset)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO kernel_data_contracts (
  tenant_id, canonical_key, name, description, version, owner, source_system,
  classification, sensitivity, governance_tier, schema
)
VALUES (
  NULL,
  'journal_entries',
  'Journal Entries',
  'Core double-entry journal entries for AI-BOS financial module. IFRS/MFRS compliant.',
  1,
  'finance-team',
  'aibos.kernel',
  'financial',
  'confidential',
  'tier_1',
  jsonb_build_object(
    'type', 'object',
    'required', ARRAY['journal_date', 'lines'],
    'properties', jsonb_build_object(
      'journal_date', jsonb_build_object('type', 'string', 'format', 'date'),
      'document_number', jsonb_build_object('type', 'string'),
      'currency_code', jsonb_build_object('type', 'string', 'default', 'MYR'),
      'lines', jsonb_build_object(
        'type', 'array',
        'minItems', 2,
        'items', jsonb_build_object(
          'type', 'object',
          'required', ARRAY['gl_account_code'],
          'properties', jsonb_build_object(
            'gl_account_code', jsonb_build_object('type', 'string'),
            'debit_amount', jsonb_build_object('type', 'number', 'minimum', 0),
            'credit_amount', jsonb_build_object('type', 'number', 'minimum', 0),
            'line_description', jsonb_build_object('type', 'string')
          )
        )
      )
    )
  )
)
ON CONFLICT (tenant_id, canonical_key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. FIELD DICTIONARY (Fields for Journal Entries contract)
-- ═══════════════════════════════════════════════════════════════════════════

-- Get the data contract ID
DO $$
DECLARE
  v_contract_id UUID;
  v_bt_journal_date UUID;
  v_bt_gl_account UUID;
  v_bt_debit UUID;
  v_bt_credit UUID;
  v_bt_description UUID;
  v_bt_doc_number UUID;
  v_bt_currency UUID;
  v_bt_created_by UUID;
BEGIN
  -- Get contract ID
  SELECT id INTO v_contract_id
  FROM kernel_data_contracts
  WHERE canonical_key = 'journal_entries' AND tenant_id IS NULL;

  -- Get business term IDs
  SELECT id INTO v_bt_journal_date FROM kernel_business_terms WHERE canonical_key = 'journal_date' AND tenant_id IS NULL;
  SELECT id INTO v_bt_gl_account FROM kernel_business_terms WHERE canonical_key = 'gl_account_code' AND tenant_id IS NULL;
  SELECT id INTO v_bt_debit FROM kernel_business_terms WHERE canonical_key = 'debit_amount' AND tenant_id IS NULL;
  SELECT id INTO v_bt_credit FROM kernel_business_terms WHERE canonical_key = 'credit_amount' AND tenant_id IS NULL;
  SELECT id INTO v_bt_description FROM kernel_business_terms WHERE canonical_key = 'line_description' AND tenant_id IS NULL;
  SELECT id INTO v_bt_doc_number FROM kernel_business_terms WHERE canonical_key = 'document_number' AND tenant_id IS NULL;
  SELECT id INTO v_bt_currency FROM kernel_business_terms WHERE canonical_key = 'currency_code' AND tenant_id IS NULL;
  SELECT id INTO v_bt_created_by FROM kernel_business_terms WHERE canonical_key = 'created_by' AND tenant_id IS NULL;

  -- Insert field dictionary entries
  INSERT INTO kernel_field_dictionary (
    tenant_id, canonical_key, label, description, data_type, format, unit,
    business_term_id, data_contract_id, constraints, examples, governance_tier
  )
  VALUES
    -- journal_date
    (NULL, 'journal_date', 'Journal Date', 'Date of the journal entry',
     'date', 'YYYY-MM-DD', NULL,
     v_bt_journal_date, v_contract_id,
     '{"required": true}', '["2024-01-15", "2024-12-31"]', 'tier_1'),

    -- gl_account_code
    (NULL, 'gl_account_code', 'GL Account Code', 'General ledger account code',
     'string', NULL, NULL,
     v_bt_gl_account, v_contract_id,
     '{"required": true, "pattern": "^[0-9]{4,10}$"}', '["1100", "4000", "5100"]', 'tier_1'),

    -- debit_amount
    (NULL, 'debit_amount', 'Debit Amount', 'Debit amount in transaction currency',
     'decimal', '#,##0.00', 'MYR',
     v_bt_debit, v_contract_id,
     '{"minimum": 0}', '["1000.00", "5500.50"]', 'tier_1'),

    -- credit_amount
    (NULL, 'credit_amount', 'Credit Amount', 'Credit amount in transaction currency',
     'decimal', '#,##0.00', 'MYR',
     v_bt_credit, v_contract_id,
     '{"minimum": 0}', '["1000.00", "5500.50"]', 'tier_1'),

    -- line_description
    (NULL, 'line_description', 'Line Description', 'Description for the journal line',
     'string', NULL, NULL,
     v_bt_description, v_contract_id,
     '{"maxLength": 512}', '["Office supplies expense", "Sales revenue Q1"]', 'tier_2'),

    -- document_number
    (NULL, 'document_number', 'Document Number', 'External document reference',
     'string', NULL, NULL,
     v_bt_doc_number, v_contract_id,
     '{"maxLength": 50}', '["INV-2024-001", "JE-00123"]', 'tier_2'),

    -- currency_code
    (NULL, 'currency_code', 'Currency Code', 'ISO 4217 currency code',
     'string', NULL, NULL,
     v_bt_currency, v_contract_id,
     '{"pattern": "^[A-Z]{3}$", "default": "MYR"}', '["MYR", "USD", "SGD"]', 'tier_1'),

    -- created_by
    (NULL, 'created_by', 'Created By', 'User who created the entry',
     'string', NULL, NULL,
     v_bt_created_by, v_contract_id,
     '{"required": true}', '["user@example.com"]', 'tier_3')

  ON CONFLICT (tenant_id, canonical_key) DO NOTHING;

END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. FIELD ALIASES (Human/legacy name mappings)
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO kernel_field_aliases (tenant_id, alias_raw, alias_normalized, canonical_key, source)
VALUES
  -- Journal Date aliases
  (NULL, 'Journal Date', 'journal date', 'journal_date', 'manual'),
  (NULL, 'Posting Date', 'posting date', 'journal_date', 'legacy'),
  (NULL, 'Entry Date', 'entry date', 'journal_date', 'legacy'),
  (NULL, 'Transaction Date', 'transaction date', 'journal_date', 'legacy'),

  -- GL Account aliases
  (NULL, 'GL Account', 'gl account', 'gl_account_code', 'manual'),
  (NULL, 'Account', 'account', 'gl_account_code', 'manual'),
  (NULL, 'GL Code', 'gl code', 'gl_account_code', 'legacy'),
  (NULL, 'Account Code', 'account code', 'gl_account_code', 'legacy'),
  (NULL, 'Ledger Account', 'ledger account', 'gl_account_code', 'legacy'),

  -- Debit aliases
  (NULL, 'Debit', 'debit', 'debit_amount', 'manual'),
  (NULL, 'Debit Amount', 'debit amount', 'debit_amount', 'manual'),
  (NULL, 'Dr', 'dr', 'debit_amount', 'legacy'),
  (NULL, 'DR', 'dr', 'debit_amount', 'legacy'),

  -- Credit aliases
  (NULL, 'Credit', 'credit', 'credit_amount', 'manual'),
  (NULL, 'Credit Amount', 'credit amount', 'credit_amount', 'manual'),
  (NULL, 'Cr', 'cr', 'credit_amount', 'legacy'),
  (NULL, 'CR', 'cr', 'credit_amount', 'legacy'),

  -- Description aliases
  (NULL, 'Description', 'description', 'line_description', 'manual'),
  (NULL, 'Line Description', 'line description', 'line_description', 'manual'),
  (NULL, 'Narration', 'narration', 'line_description', 'legacy'),
  (NULL, 'Memo', 'memo', 'line_description', 'legacy'),
  (NULL, 'Remarks', 'remarks', 'line_description', 'legacy'),

  -- Document Number aliases
  (NULL, 'Document Number', 'document number', 'document_number', 'manual'),
  (NULL, 'Doc No', 'doc no', 'document_number', 'legacy'),
  (NULL, 'Reference', 'reference', 'document_number', 'legacy'),
  (NULL, 'Ref No', 'ref no', 'document_number', 'legacy'),
  (NULL, 'Voucher Number', 'voucher number', 'document_number', 'legacy'),

  -- Currency aliases
  (NULL, 'Currency', 'currency', 'currency_code', 'manual'),
  (NULL, 'Currency Code', 'currency code', 'currency_code', 'manual'),
  (NULL, 'CCY', 'ccy', 'currency_code', 'legacy'),
  (NULL, 'Curr', 'curr', 'currency_code', 'legacy')

ON CONFLICT (tenant_id, alias_normalized) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ACTION ↔ DATA CONTRACT LINK (Policy V2)
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_contract_id UUID;
BEGIN
  SELECT id INTO v_contract_id
  FROM kernel_data_contracts
  WHERE canonical_key = 'journal_entries' AND tenant_id IS NULL;

  -- Link createJournalEntry action to journal_entries contract (write access)
  INSERT INTO kernel_action_data_contracts (tenant_id, action_id, data_contract_id, access_type)
  VALUES (NULL, 'accounting.createJournalEntry', v_contract_id, 'write')
  ON CONFLICT (tenant_id, action_id, data_contract_id) DO NOTHING;

  -- Link getJournalEntries action (read access) - for future use
  INSERT INTO kernel_action_data_contracts (tenant_id, action_id, data_contract_id, access_type)
  VALUES (NULL, 'accounting.getJournalEntries', v_contract_id, 'read')
  ON CONFLICT (tenant_id, action_id, data_contract_id) DO NOTHING;

  -- Link updateJournalEntry action (read-write access) - for future use
  INSERT INTO kernel_action_data_contracts (tenant_id, action_id, data_contract_id, access_type)
  VALUES (NULL, 'accounting.updateJournalEntry', v_contract_id, 'read-write')
  ON CONFLICT (tenant_id, action_id, data_contract_id) DO NOTHING;

END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES (run manually to confirm)
-- ═══════════════════════════════════════════════════════════════════════════

-- SELECT 'Business Terms' as table_name, count(*) as count FROM kernel_business_terms WHERE tenant_id IS NULL;
-- SELECT 'Data Contracts' as table_name, count(*) as count FROM kernel_data_contracts WHERE tenant_id IS NULL;
-- SELECT 'Field Dictionary' as table_name, count(*) as count FROM kernel_field_dictionary WHERE tenant_id IS NULL;
-- SELECT 'Field Aliases' as table_name, count(*) as count FROM kernel_field_aliases WHERE tenant_id IS NULL;
-- SELECT 'Action Links' as table_name, count(*) as count FROM kernel_action_data_contracts WHERE tenant_id IS NULL;

-- Policy V2 test query:
-- SELECT
--   adc.action_id,
--   dc.name as contract_name,
--   dc.classification,
--   dc.sensitivity,
--   adc.access_type
-- FROM kernel_action_data_contracts adc
-- JOIN kernel_data_contracts dc ON dc.id = adc.data_contract_id
-- WHERE adc.action_id = 'accounting.createJournalEntry';

