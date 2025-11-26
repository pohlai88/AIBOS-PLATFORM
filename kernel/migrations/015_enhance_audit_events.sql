-- Migration 015: Enhance kernel_audit_events for Audit Durability v1
-- Adds principal info, policy context, and correlation fields

-- Add new columns to existing table
ALTER TABLE kernel_audit_events
  ADD COLUMN IF NOT EXISTS principal_id TEXT,
  ADD COLUMN IF NOT EXISTS principal_auth_method TEXT,
  ADD COLUMN IF NOT EXISTS principal_roles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS principal_scopes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS action_id TEXT,
  ADD COLUMN IF NOT EXISTS data_contract_ref TEXT,
  ADD COLUMN IF NOT EXISTS policy_outcome TEXT,
  ADD COLUMN IF NOT EXISTS policy_reason TEXT,
  ADD COLUMN IF NOT EXISTS source_component TEXT,
  ADD COLUMN IF NOT EXISTS trace_id TEXT,
  ADD COLUMN IF NOT EXISTS request_id TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS correlation_id TEXT;

-- Backfill event_type from category for existing rows
UPDATE kernel_audit_events
SET event_type = category || '.' || action
WHERE event_type IS NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_kernel_audit_event_type ON kernel_audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_kernel_audit_action_id ON kernel_audit_events(action_id);
CREATE INDEX IF NOT EXISTS idx_kernel_audit_trace_id ON kernel_audit_events(trace_id);
CREATE INDEX IF NOT EXISTS idx_kernel_audit_principal ON kernel_audit_events(principal_id);
CREATE INDEX IF NOT EXISTS idx_kernel_audit_policy ON kernel_audit_events(policy_outcome);

-- Prevent updates (append-only)
CREATE OR REPLACE FUNCTION kernel_audit_events_prevent_update()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'kernel_audit_events is append-only; updates are not allowed';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kernel_audit_events_prevent_update ON kernel_audit_events;
CREATE TRIGGER trg_kernel_audit_events_prevent_update
  BEFORE UPDATE ON kernel_audit_events
  FOR EACH ROW
  EXECUTE FUNCTION kernel_audit_events_prevent_update();

-- Log deletes (for compliance awareness)
CREATE OR REPLACE FUNCTION kernel_audit_events_log_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE WARNING 'Delete on kernel_audit_events detected for id=%', OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kernel_audit_events_log_delete ON kernel_audit_events;
CREATE TRIGGER trg_kernel_audit_events_log_delete
  BEFORE DELETE ON kernel_audit_events
  FOR EACH ROW
  EXECUTE FUNCTION kernel_audit_events_log_delete();

COMMENT ON TABLE kernel_audit_events IS 'Append-only audit trail for kernel operations';
COMMENT ON COLUMN kernel_audit_events.principal_id IS 'ID of the authenticated principal';
COMMENT ON COLUMN kernel_audit_events.principal_auth_method IS 'api-key, jwt, internal, anonymous';
COMMENT ON COLUMN kernel_audit_events.event_type IS 'Structured event type: auth.success, action.invoked, etc.';
COMMENT ON COLUMN kernel_audit_events.policy_outcome IS 'allow or deny from PolicyEngine';
COMMENT ON COLUMN kernel_audit_events.trace_id IS 'Request correlation ID for distributed tracing';

