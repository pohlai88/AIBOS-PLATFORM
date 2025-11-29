/**
 * 🚀 BYOS™ (Bring Your Own Storage) — Complete Multi-Cloud Storage System
 * 
 * The world's first true multi-cloud storage abstraction layer for SMEs
 * 
 * Features:
 * - 6 storage providers (Supabase, AWS, Azure, GCP, Neon, Local)
 * - Zero vendor lock-in
 * - 3-click cloud migration
 * - Auto-generated TypeScript types
 * - AI-powered migration builder
 * - Enterprise-grade security & compliance
 * - CSV/Excel import/export
 * 
 * @module @aibos/kernel/storage
 * @version 1.0.0
 * @license MIT
 */

// ═══════════════════════════════════════════════════════════
// Core Storage Abstraction Layer
// ═══════════════════════════════════════════════════════════

export {
  storageAbstractionLayer,
  type TenantStorageConfig,
  type StorageProviderConfig,
} from "./storage-abstraction.layer";

export {
  type StorageContract,
  type QueryOptions,
  type TransactionContext,
} from "./types";

// ═══════════════════════════════════════════════════════════
// Storage Connectors (6 Providers)
// ═══════════════════════════════════════════════════════════

export {
  createStorageConnector,
  getProviderName,
  getProviderFeatures,
  recommendProvider,
  type StorageProvider,
  type AnyProviderConfig,
  // Individual connectors
  SupabaseConnector,
  createSupabaseConnector,
  type SupabaseConfig,
  AWSRDSConnector,
  createAWSConnector,
  type AWSRDSConfig,
  AzureSQLConnector,
  createAzureConnector,
  type AzureSQLConfig,
  GCPCloudSQLConnector,
  createGCPConnector,
  type GCPCloudSQLConfig,
  NeonConnector,
  createNeonConnector,
  type NeonConfig,
  LocalConnector,
  createLocalConnector,
  type LocalConfig,
} from "./connectors";

// ═══════════════════════════════════════════════════════════
// Developer Experience Suite
// ═══════════════════════════════════════════════════════════

export {
  devExperience,
  // Instant Connection Kit
  generateConnectionKit,
  copyToClipboard,
  generateProjectScaffold,
  type InstantConnectionKit,
  type ConnectionCodeSnippet,
  // Schema-to-Types
  generateTypesFromSchema,
  saveGeneratedTypes,
  type GeneratedTypes,
  type DatabaseTable,
  type DatabaseColumn,
  // Migration Builder
  buildMigrationFromIntent,
  saveMigration,
  type GeneratedMigration,
  type MigrationIntent,
  type MigrationChange,
  type MigrationSafetyReport,
} from "./dev-experience";

// ═══════════════════════════════════════════════════════════
// Storage Guardian™ (Security & Compliance)
// ═══════════════════════════════════════════════════════════

export {
  StorageGuardian,
  createStorageGuardian,
  type StorageGuardianConfig,
  type EncryptionConfig,
  type ResidencyConfig,
  type ComplianceConfig,
  type AccessPolicy,
} from "./guardian";

// ═══════════════════════════════════════════════════════════
// Migration Wizard™ (Zero-Downtime Cloud Migration)
// ═══════════════════════════════════════════════════════════

export {
  MigrationWizard,
  migrationWizard,
  type MigrationPlan,
  type MigrationProgress,
  type MigrationValidation,
} from "./migration-wizard";

// ═══════════════════════════════════════════════════════════
// CSV/Excel Import/Export
// ═══════════════════════════════════════════════════════════

export {
  CSVExcelHandler,
  createCSVExcelHandler,
  type ImportOptions,
  type ImportResult,
  type ExportOptions,
} from "./csv-excel";

// ═══════════════════════════════════════════════════════════
// Self-Service Adapter Generator (Create Your Own!)
// ═══════════════════════════════════════════════════════════

export {
  AdapterGenerator,
  adapterGenerator,
  AdapterConfigSchema,
  ADAPTER_TEMPLATES,
  type AdapterConfig,
  type GeneratedAdapter,
} from "./adapter-factory";

// ═══════════════════════════════════════════════════════════
// Universal Adapter Engine™ (Enterprise-Grade)
// ═══════════════════════════════════════════════════════════

export {
  // Main Engine
  UniversalAdapterEngine,
  universalAdapterEngine,
  type UAEConfig,
  // Capability Matrix
  CapabilityChecker,
  capabilityChecker,
  PROVIDER_CAPABILITIES,
  type CapabilityMatrix,
  // Security Policy
  SecurityPolicyEngine,
  securityPolicyEngine,
  type SecurityPolicy,
  type PolicyViolation,
  // Canonical Storage Format
  CSFNormalizer,
  csfNormalizer,
  type CanonicalResponse,
  // Sandbox Executor
  SandboxExecutor,
  sandboxExecutor,
  type SandboxConfig,
  type SandboxResult,
  // Circuit Breaker & Resilience
  CircuitBreaker,
  circuitBreaker,
  ResilienceManager,
  resilienceManager,
  ErrorMapper,
  type CircuitState,
  type NormalizedError,
  // AI Guardrails
  AIGuardrails,
  aiGuardrails,
  type GuardrailCheck,
  type GuardrailResult,
} from "./universal-adapter-engine";

// ═══════════════════════════════════════════════════════════
// Quick Start Examples
// ═══════════════════════════════════════════════════════════

/**
 * Quick Start Example 1: Basic Setup
 * 
 * ```typescript
 * import { storageAbstractionLayer } from '@aibos/kernel/storage';
 * 
 * // Register tenant with Supabase
 * await storageAbstractionLayer.registerTenant('my-tenant', {
 *   provider: 'supabase',
 *   config: { url: '...', anonKey: '...' },
 *   encryption: { enabled: true },
 *   residency: 'singapore',
 * });
 * 
 * // Use storage
 * const storage = storageAbstractionLayer.getStorage('my-tenant');
 * const users = await storage.query('SELECT * FROM users');
 * ```
 */

/**
 * Quick Start Example 2: Developer Experience
 * 
 * ```typescript
 * import { devExperience } from '@aibos/kernel/storage';
 * 
 * // Get instant connection code
 * const kit = await devExperience.getConnectionKit('my-tenant');
 * console.log(kit.snippets.typescript.code); // Copy-paste ready!
 * 
 * // Generate types
 * const types = await devExperience.generateTypes('my-tenant');
 * await devExperience.saveTypes(types, './types');
 * 
 * // Build migration
 * const migration = await devExperience.buildMigration(
 *   'my-tenant',
 *   'Add email_verified column to users'
 * );
 * ```
 */

/**
 * Quick Start Example 3: Cloud Migration
 * 
 * ```typescript
 * import { migrationWizard } from '@aibos/kernel/storage';
 * 
 * // 1. Create plan
 * const plan = await migrationWizard.createMigrationPlan('my-tenant', 'aws');
 * 
 * // 2. Execute
 * const progress = await migrationWizard.executeMigration(plan, awsConfig);
 * 
 * // 3. Validate & finalize
 * const validation = await migrationWizard.validateMigration('my-tenant', 'aws', awsConfig);
 * if (validation.valid) {
 *   await migrationWizard.finalizeMigration('my-tenant', plan, awsConfig);
 * }
 * ```
 */

/**
 * Quick Start Example 4: CSV/Excel Import
 * 
 * ```typescript
 * import { createCSVExcelHandler, storageAbstractionLayer } from '@aibos/kernel/storage';
 * 
 * const storage = storageAbstractionLayer.getStorage('my-tenant');
 * const csvHandler = createCSVExcelHandler(storage);
 * 
 * // Import CSV
 * const result = await csvHandler.importCSV({
 *   table: 'customers',
 *   file: csvBuffer,
 *   fileType: 'csv',
 *   hasHeaders: true,
 * });
 * 
 * console.log(`Imported ${result.rowsImported} rows`);
 * ```
 */
