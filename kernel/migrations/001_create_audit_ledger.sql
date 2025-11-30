-- migrations/001_create_audit_ledger.sql
-- Immutable append-only audit ledger with cryptographic hash-chain

CREATE TABLE IF NOT EXISTS kernel_audit_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  prev_hash TEXT NOT NULL,
  hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for tenant-based queries
CREATE INDEX idx_audit_log_tenant ON kernel_audit_log(tenant_id, id DESC);

-- Index for actor-based queries
CREATE INDEX idx_audit_log_actor ON kernel_audit_log(tenant_id, actor_id, id DESC);

-- Index for action-based queries
CREATE INDEX idx_audit_log_action ON kernel_audit_log(tenant_id, action_id, id DESC);

-- Index for hash lookups (integrity verification)
CREATE INDEX idx_audit_log_hash ON kernel_audit_log(hash);

-- Prevent updates and deletes (append-only)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    RAISE EXCEPTION 'Audit log is immutable. Cannot modify or delete entries.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_audit_modification
  BEFORE UPDATE OR DELETE ON kernel_audit_log
  FOR EACH ROW
  EXECUTE FUNCTION prevent_audit_modification();

-- Comment for documentation
COMMENT ON TABLE kernel_audit_log IS 'Immutable cryptographic audit ledger with SHA-256 hash-chain linking';
COMMENT ON COLUMN kernel_audit_log.prev_hash IS 'Hash of previous entry in chain (GENESIS for first entry)';
COMMENT ON COLUMN kernel_audit_log.hash IS 'SHA-256 hash of this entry (includes prev_hash for chain integrity)';

