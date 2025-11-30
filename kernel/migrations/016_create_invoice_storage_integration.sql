-- Migration: 016 - Invoice Storage Integration
-- Description: Create tables for OCR invoice processing with Supabase Storage integration
-- Author: AI-BOS Platform
-- Date: 2025-11-27

-- ============================================================================
-- 1. SUPPLIERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code VARCHAR(50) UNIQUE,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT suppliers_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

COMMENT ON TABLE suppliers IS 'Supplier/vendor master data for invoice processing';

-- ============================================================================
-- 2. INVOICES TABLE (WITH STORAGE INTEGRATION)
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File reference (links to Supabase Storage)
  file_bucket TEXT NOT NULL DEFAULT 'invoices',
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  file_type TEXT,
  
  -- Invoice header data
  invoice_number VARCHAR(100),
  supplier_id UUID REFERENCES suppliers(id),
  supplier_name TEXT,
  invoice_date DATE,
  due_date DATE,
  
  -- Amounts
  total_amount DECIMAL(12,2),
  tax_amount DECIMAL(12,2),
  net_amount DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- OCR metadata
  ocr_status VARCHAR(20) DEFAULT 'pending',
  ocr_confidence DECIMAL(3,2),
  ocr_data JSONB DEFAULT '{}',
  ocr_processed_at TIMESTAMPTZ,
  
  -- Workflow status
  status VARCHAR(30) DEFAULT 'draft',
  is_locked BOOLEAN DEFAULT false,
  
  -- Verification
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  
  -- AP integration
  ap_posted_at TIMESTAMPTZ,
  ap_batch_id VARCHAR(50),
  ap_system_id VARCHAR(100),
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoices_valid_status CHECK (
    status IN (
      'draft', 
      'pending_verification', 
      'verified', 
      'approved_to_ap', 
      'rejected',
      'on_hold'
    )
  ),
  CONSTRAINT invoices_valid_ocr_status CHECK (
    ocr_status IN ('pending', 'processing', 'completed', 'failed')
  ),
  CONSTRAINT invoices_valid_file_path CHECK (length(trim(file_path)) > 0),
  CONSTRAINT invoices_ocr_confidence_range CHECK (
    ocr_confidence IS NULL OR (ocr_confidence >= 0 AND ocr_confidence <= 1)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_file_path ON invoices(file_bucket, file_path);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number) WHERE invoice_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date) WHERE invoice_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- GIN index for JSONB columns
CREATE INDEX IF NOT EXISTS idx_invoices_ocr_data ON invoices USING GIN (ocr_data);
CREATE INDEX IF NOT EXISTS idx_invoices_metadata ON invoices USING GIN (metadata);

COMMENT ON TABLE invoices IS 'Invoice headers with Supabase Storage integration for OCR processing';
COMMENT ON COLUMN invoices.file_path IS 'Path to file in Supabase Storage bucket (format: {user_id}/{invoice_id}/filename)';
COMMENT ON COLUMN invoices.is_locked IS 'Prevents editing after approval/verification';
COMMENT ON COLUMN invoices.ocr_confidence IS 'Overall OCR confidence score (0.00 to 1.00)';

-- ============================================================================
-- 3. INVOICE LINE ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Line item data
  line_number INTEGER NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2),
  unit_price DECIMAL(12,2),
  line_total DECIMAL(12,2),
  tax_rate DECIMAL(5,2),
  tax_amount DECIMAL(12,2),
  
  -- Account coding
  gl_account VARCHAR(50),
  cost_center VARCHAR(50),
  project_code VARCHAR(50),
  
  -- OCR confidence per field (stores confidence for each extracted field)
  ocr_confidence JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoice_line_items_unique_line UNIQUE(invoice_id, line_number),
  CONSTRAINT invoice_line_items_positive_quantity CHECK (quantity IS NULL OR quantity >= 0),
  CONSTRAINT invoice_line_items_line_number_positive CHECK (line_number > 0)
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_gl_account ON invoice_line_items(gl_account) WHERE gl_account IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_ocr_confidence ON invoice_line_items USING GIN (ocr_confidence);

COMMENT ON TABLE invoice_line_items IS 'Line-level detail for invoices extracted via OCR';
COMMENT ON COLUMN invoice_line_items.ocr_confidence IS 'Per-field OCR confidence scores (JSONB)';

-- ============================================================================
-- 4. INVOICE COMMENTS/AUDIT TRAIL TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoice_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Comment details
  comment_type VARCHAR(20) DEFAULT 'note',
  comment TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT invoice_comments_valid_type CHECK (
    comment_type IN (
      'note', 
      'status_change', 
      'ocr_result', 
      'verification', 
      'approval',
      'rejection',
      'system'
    )
  ),
  CONSTRAINT invoice_comments_not_empty CHECK (length(trim(comment)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_invoice_comments_invoice ON invoice_comments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_comments_created_at ON invoice_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_comments_created_by ON invoice_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_invoice_comments_type ON invoice_comments(comment_type);

COMMENT ON TABLE invoice_comments IS 'Audit trail and comments for invoice workflow';

-- ============================================================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_line_items_updated_at ON invoice_line_items;
CREATE TRIGGER update_invoice_line_items_updated_at
  BEFORE UPDATE ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Insert sample supplier
INSERT INTO suppliers (name, code, email, phone, address)
VALUES 
  ('Acme Corporation', 'ACME001', 'ap@acme.com', '+1-555-0100', '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001"}'::jsonb),
  ('Beta Supplies Inc', 'BETA002', 'billing@betasupplies.com', '+1-555-0200', '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90001"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 7. VIEWS (OPTIONAL - FOR REPORTING)
-- ============================================================================

-- View: Invoices with supplier info
CREATE OR REPLACE VIEW vw_invoices_with_supplier AS
SELECT 
  i.id,
  i.invoice_number,
  i.invoice_date,
  i.due_date,
  i.total_amount,
  i.currency,
  i.status,
  i.is_locked,
  i.ocr_status,
  i.ocr_confidence,
  i.file_path,
  s.name AS supplier_name,
  s.code AS supplier_code,
  s.email AS supplier_email,
  i.created_at,
  i.updated_at
FROM invoices i
LEFT JOIN suppliers s ON i.supplier_id = s.id;

COMMENT ON VIEW vw_invoices_with_supplier IS 'Invoice list with supplier details for reporting';

-- ============================================================================
-- 8. HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate invoice net amount
CREATE OR REPLACE FUNCTION calculate_invoice_net_amount(invoice_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
  net DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(line_total), 0)
  INTO net
  FROM invoice_line_items
  WHERE invoice_id = invoice_uuid;
  
  RETURN net;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_invoice_net_amount IS 'Calculate net amount from line items';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add migration comment
COMMENT ON TABLE invoices IS 'Invoice storage integration - Migration 016 - 2025-11-27';

