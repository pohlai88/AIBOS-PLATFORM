# Database Migrations

This directory contains SQL migration files for the Kernel database schema.

## Migration Files

Migrations are numbered and applied in order:

```
001_create_audit_ledger.sql
008_create_business_terms.sql
009_create_data_contracts.sql
...
```

## Running Migrations

### Apply All Pending Migrations

```bash
cd kernel
pnpm run db:migrate
```

This will:

1. Create a `schema_migrations` table (if it doesn't exist)
2. Check which migrations have been applied
3. Apply pending migrations in order
4. Record each migration as applied

### Check Migration Status

```bash
pnpm run db:status
```

Output:

```
📊 Migration Status:

Total migrations: 9
Applied: 5
Pending: 4

Migrations:
  001 001_create_audit_ledger.sql          ✅ Applied
  008 008_create_business_terms.sql        ✅ Applied
  009 009_create_data_contracts.sql        ⏳ Pending
  ...
```

### Rollback Last Migration

⚠️ **WARNING:** Rollback only removes the migration record. You must manually revert database changes!

```bash
pnpm run db:rollback
```

This will:

1. Remove the last migration record from `schema_migrations`
2. **NOT** automatically undo the SQL changes (you must do this manually)

## Creating a New Migration

1. Create a new SQL file with the next version number:

```bash
cd kernel/migrations
touch 016_add_user_preferences.sql
```

2. Write your migration SQL:

```sql
-- Migration: 016 - Add user preferences
-- Description: Add preferences column to tenants table

ALTER TABLE tenants
ADD COLUMN preferences JSONB DEFAULT '{}';

CREATE INDEX idx_tenants_preferences ON tenants USING GIN (preferences);
```

3. Run the migration:

```bash
cd ..
pnpm run db:migrate
```

## Migration Naming Convention

Format: `{version}_{description}.sql`

- **Version:** 3-digit zero-padded number (e.g., `001`, `016`, `999`)
- **Description:** Snake-case description (e.g., `create_audit_ledger`, `add_user_preferences`)

Examples:

- ✅ `001_create_audit_ledger.sql`
- ✅ `016_add_user_preferences.sql`
- ❌ `1_create_audit.sql` (version not padded)
- ❌ `016-add-preferences.sql` (use underscores, not hyphens)

## Best Practices

### 1. **Idempotent Migrations**

Use `IF NOT EXISTS` / `IF EXISTS` to make migrations safe to re-run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
```

### 2. **Incremental Changes**

Keep migrations small and focused:

```sql
-- ✅ GOOD: Single, focused change
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- ❌ BAD: Multiple unrelated changes
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE tenants ADD COLUMN billing_id VARCHAR(50);
CREATE TABLE invoices (...);
```

### 3. **Backwards Compatibility**

Avoid breaking changes that affect running instances:

```sql
-- ✅ GOOD: Add nullable column first
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;
-- Later migration can make it NOT NULL after backfilling

-- ❌ BAD: Add NOT NULL column immediately
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NOT NULL;
-- This breaks if users table has existing rows
```

### 4. **Data Migrations**

Separate schema changes from data changes:

```sql
-- Schema migration: 016_add_status_column.sql
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Data migration: 017_backfill_status.sql
UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ALTER COLUMN status SET NOT NULL;
```

### 5. **Testing**

Test migrations on a copy of production data:

```bash
# 1. Create a snapshot of production DB
pg_dump $PROD_DB > prod_snapshot.sql

# 2. Restore to test DB
psql $TEST_DB < prod_snapshot.sql

# 3. Run migrations on test DB
DATABASE_URL=$TEST_DB pnpm run db:migrate

# 4. Verify data integrity
psql $TEST_DB -c "SELECT COUNT(*) FROM users;"
```

## Environment Configuration

Set `DATABASE_URL` or `SUPABASE_DB_URL` in your `.env.local`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/aibos_dev
# OR
SUPABASE_DB_URL=postgresql://postgres:password@db.xyz.supabase.co:5432/postgres
```

For production:

```env
KERNEL_STORAGE_MODE=SUPABASE
DATABASE_URL=postgresql://...
```

## Troubleshooting

### Migration Failed Midway

If a migration fails after partially executing:

1. Check the `schema_migrations` table:

```sql
SELECT * FROM schema_migrations ORDER BY applied_at DESC;
```

2. If the failed migration is recorded, manually revert changes and remove the record:

```sql
-- Manually undo changes
DROP TABLE IF EXISTS failed_table;

-- Remove migration record
DELETE FROM schema_migrations WHERE version = '016';
```

3. Fix the migration SQL and re-run:

```bash
pnpm run db:migrate
```

### Migration Already Applied

If you see "migration already applied" but want to re-run:

```sql
-- Remove migration record
DELETE FROM schema_migrations WHERE version = '016';
```

Then run migrations again.

### Database Connection Failed

Check your environment variables:

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Or
psql "postgresql://postgres:password@localhost:5432/aibos_dev" -c "SELECT 1;"
```

If using Supabase, verify:

- Project is active
- Password is correct
- Firewall allows your IP
- `DATABASE_URL` format is correct

---

## Migration Tracking Table

The migration runner creates a table to track applied migrations:

```sql
CREATE TABLE schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
  checksum VARCHAR(64) NOT NULL
);
```

Columns:

- `version`: Migration version (e.g., "001", "016")
- `filename`: Original filename
- `applied_at`: When migration was applied
- `checksum`: SHA256 hash of migration SQL (for verification)

---

## Next Steps

- [Kernel Configuration Guide](../README_CONFIGURATION.md)
- [Database Schema Documentation](./SCHEMA.md) _(coming soon)_
- [Production Deployment Checklist](../../apps/docs/pages/02-architecture/backend/deployment.md) _(coming soon)_
