-- Migration 012: Add updated_at triggers for catalog tables
-- Part of Policy V2 / Metadata Catalog

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Business Terms
DROP TRIGGER IF EXISTS trg_business_terms_updated ON kernel_business_terms;
CREATE TRIGGER trg_business_terms_updated
  BEFORE UPDATE ON kernel_business_terms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Data Contracts
DROP TRIGGER IF EXISTS trg_data_contracts_updated ON kernel_data_contracts;
CREATE TRIGGER trg_data_contracts_updated
  BEFORE UPDATE ON kernel_data_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Field Dictionary
DROP TRIGGER IF EXISTS trg_field_dictionary_updated ON kernel_field_dictionary;
CREATE TRIGGER trg_field_dictionary_updated
  BEFORE UPDATE ON kernel_field_dictionary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Field Aliases
DROP TRIGGER IF EXISTS trg_field_aliases_updated ON kernel_field_aliases;
CREATE TRIGGER trg_field_aliases_updated
  BEFORE UPDATE ON kernel_field_aliases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

