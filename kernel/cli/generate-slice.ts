#!/usr/bin/env node
// cli/generate-slice.ts
/**
 * Vertical Slice Generator CLI
 * 
 * Scaffolds a complete vertical slice with:
 * - Contract (Zod schemas)
 * - Action handler
 * - Integration test
 * - Unit test (optional)
 * 
 * Zero-drift, governance-compliant, production-ready.
 * 
 * Usage:
 * ```bash
 * npm run generate:slice accounting read.journal_entries
 * # or
 * node cli/generate-slice.ts accounting read.journal_entries
 * ```
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// CLI Colors (no dependencies)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Templates
 */
const templates = {
  /**
   * Contract template
   */
  contract: (domain: string, actionId: string, entityName: string) => `// contracts/${domain}/${actionId}.contract.ts
import { z } from 'zod';
import type { KernelActionContract } from '../contract.types';

/**
 * Input schema for ${domain}.${actionId}
 */
export const ${toPascalCase(actionId)}InputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
  // Add your filters here
});

export type ${toPascalCase(actionId)}Input = z.infer<typeof ${toPascalCase(actionId)}InputSchema>;

/**
 * Output schema for ${domain}.${actionId}
 */
export const ${toPascalCase(actionId)}OutputSchema = z.object({
  items: z.array(z.unknown()), // Replace with your entity schema
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export type ${toPascalCase(actionId)}Output = z.infer<typeof ${toPascalCase(actionId)}OutputSchema>;

/**
 * Action contract for ${domain}.${actionId}
 */
export const ${toCamelCase(actionId)}Contract: KernelActionContract<
  typeof ${toPascalCase(actionId)}InputSchema,
  typeof ${toPascalCase(actionId)}OutputSchema
> = {
  id: '${domain}.${actionId}',
  version: '1.0.0',
  domain: '${domain}',
  kind: 'query', // Change to 'command' or 'mutation' if needed
  summary: '${toHumanReadable(actionId)}',
  description: 'Returns a paginated list of ${entityName} for the current tenant.',
  inputSchema: ${toPascalCase(actionId)}InputSchema,
  outputSchema: ${toPascalCase(actionId)}OutputSchema,
  classification: {
    piiLevel: 'low',
    sensitivity: 'internal',
  },
  tags: ['${domain}', '${actionId.split('.')[0]}', 'query'],
  permissions: ['${domain}.read'], // Adjust as needed
};
`,

  /**
   * Action handler template
   */
  action: (domain: string, actionId: string, entityName: string) => `// engines/${domain}/${actionId}.action.ts
import type { ActionContext } from '../../types/engine.types';
import type {
  ${toPascalCase(actionId)}Input,
  ${toPascalCase(actionId)}Output,
} from '../../contracts/${domain}/${actionId}.contract';

/**
 * ${domain}.${actionId} action handler
 * 
 * @param ctx - Action context
 * @returns Paginated ${entityName}
 */
export async function ${toCamelCase(actionId)}Handler(
  ctx: ActionContext<${toPascalCase(actionId)}Input>
): Promise<${toPascalCase(actionId)}Output> {
  const { input, tenant, db, log } = ctx;

  if (!tenant) {
    throw new Error('Tenant context is required');
  }

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  // TODO: Replace with your actual table name and query
  const rows = await db.query(
    \`SELECT * FROM ${toSnakeCase(entityName)}
     WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3\`,
    [tenant, pageSize, offset]
  );

  const [{ count }] = await db.query<{ count: number }>(
    \`SELECT COUNT(*)::int as count FROM ${toSnakeCase(entityName)} WHERE tenant_id = $1\`,
    [tenant]
  );

  log(\`[${domain}.${actionId}] Fetched \${rows.length} ${entityName} for tenant \${tenant}\`);

  return {
    items: rows,
    page,
    pageSize,
    total: count,
  };
}
`,

  /**
   * Engine index template (for first action in engine)
   */
  engineIndex: (domain: string, actionId: string) => `// engines/${domain}/index.ts
import type { KernelEngine, KernelEngineManifest } from '../../types/engine.types';
import { ${toCamelCase(actionId)}Contract } from '../../contracts/${domain}/${actionId}.contract';
import { ${toCamelCase(actionId)}Handler } from './${actionId}.action';

/**
 * ${toTitleCase(domain)} Engine Manifest
 */
export const ${toCamelCase(domain)}EngineManifest: KernelEngineManifest = {
  id: '${domain}',
  name: '${toTitleCase(domain)} Engine',
  version: '1.0.0',
  description: 'Core ${domain} actions for AI-BOS Kernel',
  domain: '${domain}',
  actions: {
    '${actionId}': {
      id: '${actionId}',
      contract: ${toCamelCase(actionId)}Contract,
      description: '${toHumanReadable(actionId)}',
      tags: ['${domain}', '${actionId.split('.')[0]}'],
    },
  },
};

/**
 * ${toTitleCase(domain)} Engine
 */
export const ${toCamelCase(domain)}Engine: KernelEngine = {
  id: '${domain}',
  manifest: ${toCamelCase(domain)}EngineManifest,
  actions: {
    '${actionId}': ${toCamelCase(actionId)}Handler,
  },
};

// Auto-register (import this file in your bootstrap)
import { registerEngine } from '../../registry/engine.loader';
registerEngine(${toCamelCase(domain)}Engine);
`,

  /**
   * Integration test template
   */
  integrationTest: (domain: string, actionId: string) => `// tests/integration/slices/${domain}.${actionId}.test.ts
/**
 * Integration test for ${domain}.${actionId}
 * 
 * Maturity Level: 3 (Observable)
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { kernelContainer } from '../../../core/container';
import { actionDispatcher } from '../../../dispatcher/action.dispatcher';
import { buildTestContext } from '../../utils/test-context';
import { seedTestData, cleanupTestData } from '../../utils/test-db';

describe('Slice: ${domain}.${actionId} (Level 3 - Observable)', () => {
  beforeAll(async () => {
    await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await kernelContainer.shutdown();
  });

  it('should validate input schema - reject invalid page number', async () => {
    const context = await buildTestContext({
      tenant: 'tenant-a',
      user: { id: 'user-1', permissions: ['${domain}.read'] },
    });

    const result = await actionDispatcher.dispatch(
      '${domain}.${actionId}',
      { page: -1 }, // Invalid
      context
    );

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('INPUT_VALIDATION_FAILED');
  });

  it('should return data for valid request', async () => {
    const context = await buildTestContext({
      tenant: 'tenant-a',
      user: { id: 'user-1', permissions: ['${domain}.read'] },
    });

    const result = await actionDispatcher.dispatch(
      '${domain}.${actionId}',
      { page: 1, pageSize: 10 },
      context
    );

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('items');
    expect(Array.isArray(result.data.items)).toBe(true);
  });

  it('should enforce tenant isolation', async () => {
    const contextA = await buildTestContext({
      tenant: 'tenant-a',
      user: { id: 'user-1', permissions: ['${domain}.read'] },
    });

    const resultA = await actionDispatcher.dispatch(
      '${domain}.${actionId}',
      { page: 1, pageSize: 100 },
      contextA
    );

    expect(resultA.success).toBe(true);

    // Verify all items belong to tenant-a
    const allTenantA = resultA.data.items.every(
      (item: any) => item.tenantId === 'tenant-a' || item.tenant_id === 'tenant-a'
    );
    expect(allTenantA).toBe(true);
  });

  it('should include response metadata', async () => {
    const context = await buildTestContext({
      tenant: 'tenant-a',
      user: { id: 'user-1', permissions: ['${domain}.read'] },
    });

    const result = await actionDispatcher.dispatch(
      '${domain}.${actionId}',
      { page: 1 },
      context
    );

    expect(result.meta).toBeDefined();
    expect(result.meta.actionId).toBe('${domain}.${actionId}');
    expect(result.meta.duration).toBeGreaterThanOrEqual(0);
  });
});
`,
};

/**
 * Utility functions
 */
function toPascalCase(str: string): string {
  return str
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

function toTitleCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toHumanReadable(str: string): string {
  return str
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Main CLI function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    log('❌ Missing required arguments', 'red');
    log('\nUsage:', 'yellow');
    log('  npm run generate:slice <domain> <action-id>', 'bright');
    log('\nExample:', 'yellow');
    log('  npm run generate:slice accounting read.journal_entries', 'bright');
    log('  npm run generate:slice inventory list.stock_items', 'bright');
    process.exit(1);
  }

  const [domain, actionId] = args;

  // Infer entity name from action ID
  const entityName = actionId.split('.').slice(1).join('_') || 'entity';

  log(`\n🚀 Generating vertical slice for ${domain}.${actionId}`, 'blue');
  log('━'.repeat(60), 'blue');

  // Create directories
  const rootDir = process.cwd();
  const contractsDir = path.join(rootDir, 'contracts', domain);
  const enginesDir = path.join(rootDir, 'engines', domain);
  const testsDir = path.join(rootDir, 'tests', 'integration', 'slices');

  [contractsDir, enginesDir, testsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`✓ Created directory: ${path.relative(rootDir, dir)}`, 'green');
    }
  });

  // Generate files
  const files: Array<{ path: string; content: string; label: string }> = [
    {
      path: path.join(contractsDir, `${actionId}.contract.ts`),
      content: templates.contract(domain, actionId, entityName),
      label: 'Contract',
    },
    {
      path: path.join(enginesDir, `${actionId}.action.ts`),
      content: templates.action(domain, actionId, entityName),
      label: 'Action Handler',
    },
    {
      path: path.join(testsDir, `${domain}.${actionId}.test.ts`),
      content: templates.integrationTest(domain, actionId),
      label: 'Integration Test',
    },
  ];

  // Check if engine index exists, create if not
  const engineIndexPath = path.join(enginesDir, 'index.ts');
  if (!fs.existsSync(engineIndexPath)) {
    files.push({
      path: engineIndexPath,
      content: templates.engineIndex(domain, actionId),
      label: 'Engine Manifest',
    });
  } else {
    log(`ℹ Engine index already exists: ${path.relative(rootDir, engineIndexPath)}`, 'yellow');
    log(`  You'll need to manually add this action to the manifest.`, 'yellow');
  }

  // Write files
  files.forEach(({ path: filePath, content, label }) => {
    fs.writeFileSync(filePath, content, 'utf-8');
    log(`✓ Generated ${label}: ${path.relative(rootDir, filePath)}`, 'green');
  });

  // Summary
  log('\n━'.repeat(60), 'blue');
  log('✅ Vertical slice generated successfully!', 'green');
  log('\n📝 Next steps:', 'yellow');
  log('  1. Update the contract schemas with your entity fields', 'bright');
  log('  2. Implement the action handler business logic', 'bright');
  log('  3. Add database seeding to tests/utils/test-db.ts', 'bright');
  log(`  4. Import the engine in your bootstrap file`, 'bright');
  log('  5. Run tests: npm test', 'bright');
  log('\n🔗 Files created:', 'yellow');
  files.forEach(({ path: filePath }) => {
    log(`  • ${path.relative(rootDir, filePath)}`, 'bright');
  });
  log('');
}

// Run CLI
main();

