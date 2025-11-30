/**
 * 🧙 Migration Wizard™ — Zero-Downtime Cloud Migration
 * 
 * 3-click migration between any storage providers
 * 
 * Example:
 * ```typescript
 * // Step 1: Create migration plan
 * const plan = await migrationWizard.createMigrationPlan('tenant-id', 'aws');
 * 
 * // Step 2: Execute migration
 * const progress = await migrationWizard.executeMigration(plan, awsConfig);
 * 
 * // Step 3: Validate and finalize
 * const validation = await migrationWizard.validateMigration('tenant-id', 'aws', awsConfig);
 * if (validation.valid) {
 *   await migrationWizard.finalizeMigration('tenant-id', plan, awsConfig);
 * }
 * ```
 */

export {
  MigrationWizard,
  migrationWizard,
  type MigrationPlan,
  type MigrationProgress,
  type MigrationValidation,
} from "./migration.wizard";

