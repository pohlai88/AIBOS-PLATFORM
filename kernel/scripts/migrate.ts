#!/usr/bin/env tsx
/**
 * Database Migration Runner
 * 
 * Applies SQL migrations from kernel/migrations/ to the database
 * Tracks applied migrations in a migrations table
 */

import { readdir, readFile } from "fs/promises";
import * as path from "path";
import { Database } from "../storage/db";
import { baseLogger } from "../observability/logger";
import { loadConfig } from "../boot/kernel.config";

// Load config first
loadConfig();

const MIGRATIONS_DIR = path.join(__dirname, "../migrations");
const MIGRATIONS_TABLE = "schema_migrations";

interface MigrationFile {
  version: string;
  filename: string;
  filepath: string;
}

/**
 * Create migrations tracking table if it doesn't exist
 */
async function ensureMigrationsTable(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version VARCHAR(255) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT NOW(),
      checksum VARCHAR(64) NOT NULL
    );
  `;

  await Database.query(sql);
  baseLogger.info("[Migrate] Migrations table ready");
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await Database.query<{ version: string }>(
    `SELECT version FROM ${MIGRATIONS_TABLE} ORDER BY version ASC`
  );

  return new Set(result.rows.map((row) => row.version));
}

/**
 * Get list of migration files from disk
 */
async function getMigrationFiles(): Promise<MigrationFile[]> {
  const files = await readdir(MIGRATIONS_DIR);
  
  const migrations = files
    .filter((f) => f.endsWith(".sql"))
    .map((filename) => {
      // Extract version from filename (e.g., "001_create_audit_ledger.sql" -> "001")
      const match = filename.match(/^(\d+)_/);
      if (!match) {
        throw new Error(`Invalid migration filename format: ${filename}`);
      }

      return {
        version: match[1],
        filename,
        filepath: path.join(MIGRATIONS_DIR, filename),
      };
    })
    .sort((a, b) => a.version.localeCompare(b.version));

  return migrations;
}

/**
 * Calculate checksum for migration file
 */
function calculateChecksum(content: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Apply a single migration
 */
async function applyMigration(migration: MigrationFile): Promise<void> {
  baseLogger.info(
    { version: migration.version, filename: migration.filename },
    "[Migrate] Applying migration"
  );

  const sql = await readFile(migration.filepath, "utf-8");
  const checksum = calculateChecksum(sql);

  try {
    // Execute migration SQL
    await Database.query(sql);

    // Record migration as applied
    await Database.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (version, filename, checksum) VALUES ($1, $2, $3)`,
      [migration.version, migration.filename, checksum]
    );

    baseLogger.info(
      { version: migration.version },
      "[Migrate] ✅ Migration applied successfully"
    );
  } catch (error: any) {
    baseLogger.error(
      { error, version: migration.version, filename: migration.filename },
      "[Migrate] ❌ Migration failed"
    );
    throw error;
  }
}

/**
 * Main migration runner
 */
async function runMigrations(): Promise<void> {
  baseLogger.info("[Migrate] Starting database migrations...");

  // Initialize database connection
  Database.init();

  // Check database health
  const health = await Database.health();
  if (health.status === "down") {
    throw new Error(`Database is not available: ${health.error}`);
  }

  baseLogger.info(
    { latencyMs: health.latencyMs },
    "[Migrate] Database connection healthy"
  );

  // Ensure migrations table exists
  await ensureMigrationsTable();

  // Get applied migrations
  const applied = await getAppliedMigrations();
  baseLogger.info(
    { count: applied.size },
    "[Migrate] Found applied migrations"
  );

  // Get migration files
  const files = await getMigrationFiles();
  baseLogger.info(
    { count: files.length },
    "[Migrate] Found migration files"
  );

  // Filter pending migrations
  const pending = files.filter((f) => !applied.has(f.version));

  if (pending.length === 0) {
    baseLogger.info("[Migrate] No pending migrations");
    return;
  }

  baseLogger.info(
    { count: pending.length },
    "[Migrate] Found pending migrations"
  );

  // Apply pending migrations
  for (const migration of pending) {
    await applyMigration(migration);
  }

  baseLogger.info(
    { applied: pending.length },
    "[Migrate] ✅ All migrations applied successfully"
  );
}

/**
 * Rollback last migration (dangerous!)
 */
async function rollbackLastMigration(): Promise<void> {
  baseLogger.warn("[Migrate] Rolling back last migration (DANGER!)");

  Database.init();

  const result = await Database.query<{ version: string; filename: string }>(
    `SELECT version, filename FROM ${MIGRATIONS_TABLE} ORDER BY version DESC LIMIT 1`
  );

  if (result.rows.length === 0) {
    baseLogger.info("[Migrate] No migrations to rollback");
    return;
  }

  const lastMigration = result.rows[0];
  
  baseLogger.warn(
    { version: lastMigration.version, filename: lastMigration.filename },
    "[Migrate] WARNING: Rollback is not automatic. You must manually revert changes!"
  );

  await Database.query(
    `DELETE FROM ${MIGRATIONS_TABLE} WHERE version = $1`,
    [lastMigration.version]
  );

  baseLogger.info(
    { version: lastMigration.version },
    "[Migrate] ✅ Migration record removed (manual DB cleanup required)"
  );
}

/**
 * Show migration status
 */
async function showStatus(): Promise<void> {
  baseLogger.info("[Migrate] Migration status");

  Database.init();
  await ensureMigrationsTable();

  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();

  console.log("\n📊 Migration Status:\n");
  console.log(`Total migrations: ${files.length}`);
  console.log(`Applied: ${applied.size}`);
  console.log(`Pending: ${files.length - applied.size}\n`);

  if (files.length === 0) {
    console.log("No migration files found.\n");
    return;
  }

  console.log("Migrations:");
  for (const file of files) {
    const status = applied.has(file.version) ? "✅ Applied" : "⏳ Pending";
    console.log(`  ${file.version} ${file.filename.padEnd(40)} ${status}`);
  }
  console.log();
}

// CLI handler
const command = process.argv[2] || "up";

(async () => {
  try {
    switch (command) {
      case "up":
        await runMigrations();
        break;

      case "rollback":
        await rollbackLastMigration();
        break;

      case "status":
        await showStatus();
        break;

      default:
        console.log(`
Usage: pnpm run db:migrate [command]

Commands:
  up         Apply pending migrations (default)
  rollback   Remove last migration record (manual cleanup required)
  status     Show migration status
        `);
        process.exit(1);
    }

    await Database.shutdown();
    process.exit(0);
  } catch (error: any) {
    baseLogger.error({ error }, "[Migrate] Fatal error");
    console.error("\n❌ Migration failed:", error.message);
    await Database.shutdown();
    process.exit(1);
  }
})();

