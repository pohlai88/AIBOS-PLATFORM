/**
 * 🎯 Developer Experience Suite
 * 
 * Three killer features that make BYOS irresistible:
 * 
 * 1. Instant Connection Kit™ - Copy-paste ready connection code
 * 2. Schema-to-Types™ - Auto-generate TypeScript types
 * 3. Migration Builder™ - AI-powered migration generator
 * 
 * Usage:
 * ```ts
 * import { devExperience } from './dev-experience';
 * 
 * // One-click connection setup
 * const kit = await devExperience.getConnectionKit(tenantId);
 * console.log(kit.snippets.typescript.code); // Copy-paste ready!
 * 
 * // Auto-generate types
 * const types = await devExperience.generateTypes(storage);
 * await devExperience.saveTypes(types, './types');
 * 
 * // AI migration builder
 * const migration = await devExperience.buildMigration(
 *   storage,
 *   "Add email column to users table"
 * );
 * await devExperience.saveMigration(migration, './migrations');
 * ```
 */

import { StorageContract, TenantStorageConfig } from "../types";
import { storageAbstractionLayer } from "../storage-abstraction.layer";
import {
  generateConnectionKit,
  copyToClipboard,
  generateProjectScaffold,
  type InstantConnectionKit,
} from "./instant-connection.kit";
import {
  generateTypesFromSchema,
  saveGeneratedTypes,
  type GeneratedTypes,
  type DatabaseTable,
} from "./schema-to-types.generator";
import {
  buildMigrationFromIntent,
  saveMigration,
  type GeneratedMigration,
  type MigrationSafetyReport,
} from "./migration-builder.ai";

/**
 * Main Developer Experience API
 */
export const devExperience = {
  /**
   * 🚀 Feature 1: Instant Connection Kit™
   * Get copy-paste ready connection code for any tenant's storage
   */
  async getConnectionKit(tenantId: string): Promise<InstantConnectionKit> {
    const config = await storageAbstractionLayer.getTenantConfig(tenantId);
    if (!config) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    return generateConnectionKit(tenantId, config);
  },

  /**
   * Copy connection code to clipboard (format: typescript | javascript | env)
   */
  copyConnection(kit: InstantConnectionKit, format: "typescript" | "javascript" | "env"): string {
    return copyToClipboard(kit, format);
  },

  /**
   * Generate complete project scaffold with all necessary files
   */
  async scaffoldProject(
    tenantId: string,
    outputDir: string
  ): Promise<{ files: Array<{ path: string; content: string }> }> {
    const config = await storageAbstractionLayer.getTenantConfig(tenantId);
    if (!config) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    return generateProjectScaffold(tenantId, config, outputDir);
  },

  /**
   * 🎯 Feature 2: Schema-to-Types™
   * Auto-generate TypeScript types from database schema
   */
  async generateTypes(
    tenantId: string,
    options?: {
      schemas?: string[];
      tables?: string[];
      includeZod?: boolean;
      includeRelations?: boolean;
    }
  ): Promise<GeneratedTypes> {
    const storage = storageAbstractionLayer.getStorage(tenantId);
    if (!storage) {
      throw new Error(`Storage not found for tenant ${tenantId}`);
    }
    return generateTypesFromSchema(storage, options);
  },

  /**
   * Save generated types to files
   */
  async saveTypes(types: GeneratedTypes, outputDir: string): Promise<void> {
    return saveGeneratedTypes(types, outputDir);
  },

  /**
   * Quick command: Generate and save types in one go
   */
  async generateAndSaveTypes(
    tenantId: string,
    outputDir: string,
    options?: Parameters<typeof devExperience.generateTypes>[1]
  ): Promise<GeneratedTypes> {
    const types = await devExperience.generateTypes(tenantId, options);
    await devExperience.saveTypes(types, outputDir);
    return types;
  },

  /**
   * 🤖 Feature 3: Migration Builder™
   * AI-powered migration generator from natural language
   */
  async buildMigration(
    tenantId: string,
    intent: string,
    options?: {
      useShadowTables?: boolean;
      validateOnly?: boolean;
    }
  ): Promise<GeneratedMigration> {
    const storage = storageAbstractionLayer.getStorage(tenantId);
    if (!storage) {
      throw new Error(`Storage not found for tenant ${tenantId}`);
    }
    return buildMigrationFromIntent(storage, intent, options);
  },

  /**
   * Save migration to file
   */
  async saveMigration(
    migration: GeneratedMigration,
    outputDir: string
  ): Promise<{ path: string; content: string }> {
    return saveMigration(migration, outputDir);
  },

  /**
   * Quick command: Build and save migration in one go
   */
  async buildAndSaveMigration(
    tenantId: string,
    intent: string,
    outputDir: string,
    options?: Parameters<typeof devExperience.buildMigration>[2]
  ): Promise<{ migration: GeneratedMigration; file: { path: string; content: string } }> {
    const migration = await devExperience.buildMigration(tenantId, intent, options);
    const file = await devExperience.saveMigration(migration, outputDir);
    return { migration, file };
  },

  /**
   * 🔥 Power User: Full Setup in One Command
   * Generate connection kit, types, and scaffold entire project
   */
  async setupProject(
    tenantId: string,
    outputDir: string,
    options?: {
      includeTypes?: boolean;
      includeMigrations?: boolean;
      migrationsToCreate?: string[];
    }
  ): Promise<{
    connectionKit: InstantConnectionKit;
    types?: GeneratedTypes;
    migrations?: GeneratedMigration[];
    scaffold: { files: Array<{ path: string; content: string }> };
  }> {
    const { includeTypes = true, includeMigrations = false, migrationsToCreate = [] } = options || {};

    // 1. Generate connection kit
    const connectionKit = await devExperience.getConnectionKit(tenantId);

    // 2. Scaffold project structure
    const scaffold = await devExperience.scaffoldProject(tenantId, outputDir);

    // 3. Generate types if requested
    let types: GeneratedTypes | undefined;
    if (includeTypes) {
      types = await devExperience.generateAndSaveTypes(tenantId, `${outputDir}/types`);
    }

    // 4. Generate migrations if requested
    let migrations: GeneratedMigration[] | undefined;
    if (includeMigrations && migrationsToCreate.length > 0) {
      migrations = [];
      for (const intent of migrationsToCreate) {
        const { migration } = await devExperience.buildAndSaveMigration(
          tenantId,
          intent,
          `${outputDir}/migrations`
        );
        migrations.push(migration);
      }
    }

    return {
      connectionKit,
      types,
      migrations,
      scaffold,
    };
  },
};

/**
 * Export individual modules for advanced usage
 */
export {
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
};

