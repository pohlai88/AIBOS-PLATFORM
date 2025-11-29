/**
 * 🚀 Instant Connection Kit™
 * 
 * One-click copy-paste ready connection code for any storage provider.
 * Generates fully-configured, production-ready code snippets.
 * 
 * Features:
 * - Environment-safe (uses env vars, never hardcodes secrets)
 * - Copy-to-clipboard ready
 * - Multiple format support (ESM, CommonJS, TypeScript, JavaScript)
 * - Connection pooling configured
 * - Error handling included
 * - Governance-compliant
 */

import { StorageProviderConfig, TenantStorageConfig } from "../types";
import crypto from "node:crypto";

export interface ConnectionCodeSnippet {
  format: "typescript" | "javascript" | "esm" | "commonjs";
  code: string;
  envVars: Record<string, string>;
  dependencies: string[];
  setupInstructions: string[];
}

export interface InstantConnectionKit {
  provider: string;
  tenantId: string;
  snippets: {
    typescript: ConnectionCodeSnippet;
    javascript: ConnectionCodeSnippet;
    dotenv: string;
    readme: string;
  };
  quickCopyCommand: string;
  testConnection: string;
}

/**
 * Generate instant connection kit for a tenant's storage
 */
export async function generateConnectionKit(
  tenantId: string,
  config: TenantStorageConfig
): Promise<InstantConnectionKit> {
  const provider = config.provider;
  const envPrefix = `${tenantId.toUpperCase().replace(/-/g, "_")}`;

  // Generate environment variable names
  const envVars = generateEnvVarNames(envPrefix, provider);

  // Generate code snippets
  const tsSnippet = generateTypeScriptSnippet(provider, envVars, config);
  const jsSnippet = generateJavaScriptSnippet(provider, envVars, config);
  const dotenv = generateDotEnv(envVars, config);
  const readme = generateReadme(provider, envVars, tenantId);

  // Generate quick copy command (CLI-style)
  const quickCopyCommand = generateQuickCopyCommand(tenantId);

  // Generate test connection snippet
  const testConnection = generateTestConnectionSnippet(provider);

  return {
    provider,
    tenantId,
    snippets: {
      typescript: tsSnippet,
      javascript: jsSnippet,
      dotenv,
      readme,
    },
    quickCopyCommand,
    testConnection,
  };
}

/**
 * Generate environment variable names based on provider
 */
function generateEnvVarNames(
  prefix: string,
  provider: string
): Record<string, string> {
  const base = {
    DATABASE_URL: `${prefix}_DATABASE_URL`,
    DATABASE_HOST: `${prefix}_DATABASE_HOST`,
    DATABASE_PORT: `${prefix}_DATABASE_PORT`,
    DATABASE_NAME: `${prefix}_DATABASE_NAME`,
    DATABASE_USER: `${prefix}_DATABASE_USER`,
    DATABASE_PASSWORD: `${prefix}_DATABASE_PASSWORD`,
  };

  // Provider-specific additions
  if (provider === "supabase") {
    return {
      ...base,
      SUPABASE_URL: `${prefix}_SUPABASE_URL`,
      SUPABASE_ANON_KEY: `${prefix}_SUPABASE_ANON_KEY`,
      SUPABASE_SERVICE_ROLE_KEY: `${prefix}_SUPABASE_SERVICE_ROLE_KEY`,
    };
  }

  if (provider === "aws") {
    return {
      ...base,
      AWS_REGION: `${prefix}_AWS_REGION`,
      AWS_ACCESS_KEY_ID: `${prefix}_AWS_ACCESS_KEY_ID`,
      AWS_SECRET_ACCESS_KEY: `${prefix}_AWS_SECRET_ACCESS_KEY`,
    };
  }

  if (provider === "azure") {
    return {
      ...base,
      AZURE_SQL_SERVER: `${prefix}_AZURE_SQL_SERVER`,
      AZURE_SQL_DATABASE: `${prefix}_AZURE_SQL_DATABASE`,
      AZURE_CLIENT_ID: `${prefix}_AZURE_CLIENT_ID`,
      AZURE_CLIENT_SECRET: `${prefix}_AZURE_CLIENT_SECRET`,
      AZURE_TENANT_ID: `${prefix}_AZURE_TENANT_ID`,
    };
  }

  return base;
}

/**
 * Generate TypeScript connection snippet
 */
function generateTypeScriptSnippet(
  provider: string,
  envVars: Record<string, string>,
  config: TenantStorageConfig
): ConnectionCodeSnippet {
  let code = "";
  let dependencies: string[] = [];
  let setupInstructions: string[] = [];

  if (provider === "supabase") {
    dependencies = ["@supabase/supabase-js"];
    setupInstructions = [
      "npm install @supabase/supabase-js",
      "Copy .env.example to .env and fill in your credentials",
      "Import and use the client in your code",
    ];

    code = `import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database.types';

// 🔐 Environment variables (never commit these!)
const SUPABASE_URL = process.env.${envVars.SUPABASE_URL};
const SUPABASE_ANON_KEY = process.env.${envVars.SUPABASE_ANON_KEY};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase credentials. Check your .env file.');
}

// ✅ Create Supabase client with type safety
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-tenant-id': '${config.tenantId}',
    },
  },
});

// 🧪 Test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from('_health_check').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    return false;
  }
}

// 🎯 Example usage
// const { data, error } = await supabase.from('users').select('*');
`;
  } else if (provider === "local") {
    dependencies = ["better-sqlite3", "@types/better-sqlite3"];
    setupInstructions = [
      "npm install better-sqlite3 @types/better-sqlite3",
      "Database will be created automatically at the specified path",
      "No credentials needed for local development",
    ];

    code = `import Database from 'better-sqlite3';
import path from 'node:path';

// 📁 Local database path
const DB_PATH = process.env.${envVars.DATABASE_URL} || path.join(__dirname, '../data/local.db');

// ✅ Create SQLite connection with best practices
export const db = new Database(DB_PATH, {
  verbose: console.log, // Remove in production
  fileMustExist: false, // Auto-create if missing
});

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

// 🧪 Test connection
export function testConnection() {
  try {
    const result = db.prepare('SELECT 1 as health').get();
    console.log('✅ SQLite connection successful!');
    return true;
  } catch (err) {
    console.error('❌ SQLite connection failed:', err);
    return false;
  }
}

// 🎯 Example usage
// const users = db.prepare('SELECT * FROM users').all();
`;
  } else if (provider === "aws") {
    dependencies = ["pg", "@types/pg"];
    setupInstructions = [
      "npm install pg @types/pg",
      "Configure AWS RDS credentials in .env",
      "Ensure security group allows your IP",
    ];

    code = `import { Pool } from 'pg';

// 🔐 AWS RDS connection config
const pool = new Pool({
  host: process.env.${envVars.DATABASE_HOST},
  port: parseInt(process.env.${envVars.DATABASE_PORT} || '5432'),
  database: process.env.${envVars.DATABASE_NAME},
  user: process.env.${envVars.DATABASE_USER},
  password: process.env.${envVars.DATABASE_PASSWORD},
  // Production best practices
  max: 20, // Max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: true, // Enforce SSL
  },
});

// 🧪 Test connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ AWS RDS connection successful!');
    return true;
  } catch (err) {
    console.error('❌ AWS RDS connection failed:', err);
    return false;
  }
}

// 🎯 Example usage
// const { rows } = await pool.query('SELECT * FROM users');
`;
  } else {
    // Generic PostgreSQL
    dependencies = ["pg", "@types/pg"];
    setupInstructions = [
      "npm install pg @types/pg",
      "Copy .env.example to .env and configure credentials",
      "Run test connection to verify setup",
    ];

    code = `import { Pool } from 'pg';

// 🔐 Database connection config
const pool = new Pool({
  connectionString: process.env.${envVars.DATABASE_URL},
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 🧪 Test connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
}

export { pool as db };
`;
  }

  return {
    format: "typescript",
    code,
    envVars: Object.fromEntries(
      Object.entries(envVars).map(([key, envName]) => [envName, `your_${key.toLowerCase()}_here`])
    ),
    dependencies,
    setupInstructions,
  };
}

/**
 * Generate JavaScript version (transpiled from TS)
 */
function generateJavaScriptSnippet(
  provider: string,
  envVars: Record<string, string>,
  config: TenantStorageConfig
): ConnectionCodeSnippet {
  const tsSnippet = generateTypeScriptSnippet(provider, envVars, config);
  
  // Simple conversion: remove type annotations
  const jsCode = tsSnippet.code
    .replace(/: Database/g, "")
    .replace(/: string/g, "")
    .replace(/: number/g, "")
    .replace(/import type { Database } from '.\/types\/database.types';/g, "")
    .replace(/: boolean/g, "");

  return {
    format: "javascript",
    code: jsCode,
    envVars: tsSnippet.envVars,
    dependencies: tsSnippet.dependencies.filter(d => !d.startsWith("@types/")),
    setupInstructions: tsSnippet.setupInstructions,
  };
}

/**
 * Generate .env file template
 */
function generateDotEnv(
  envVars: Record<string, string>,
  config: TenantStorageConfig
): string {
  let content = `# 🔐 Storage Configuration for Tenant: ${config.tenantId}
# Provider: ${config.provider}
# Generated: ${new Date().toISOString()}
# ⚠️ NEVER commit this file to git!

`;

  Object.entries(envVars).forEach(([key, envName]) => {
    content += `${envName}=your_${key.toLowerCase()}_here\n`;
  });

  content += `\n# 📝 Setup Instructions:
# 1. Copy this file to .env
# 2. Replace placeholder values with your actual credentials
# 3. Add .env to your .gitignore
# 4. Run your application
`;

  return content;
}

/**
 * Generate README with setup instructions
 */
function generateReadme(
  provider: string,
  envVars: Record<string, string>,
  tenantId: string
): string {
  return `# 🚀 Database Connection Setup

## Provider: ${provider}
## Tenant: ${tenantId}

### Quick Start

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env and add your credentials

# 4. Test connection
npm run test:db
\`\`\`

### Environment Variables

${Object.keys(envVars).map(key => `- \`${envVars[key]}\``).join("\n")}

### Security Best Practices

✅ **DO:**
- Store credentials in environment variables
- Use different credentials for dev/staging/prod
- Rotate credentials regularly
- Use connection pooling
- Enable SSL/TLS for production

❌ **DON'T:**
- Hardcode credentials in source code
- Commit .env files to git
- Share credentials via email/slack
- Use production credentials locally
- Disable SSL in production

### Troubleshooting

**Connection refused:**
- Check if database is running
- Verify firewall/security group settings
- Confirm credentials are correct

**SSL errors:**
- Ensure SSL certificates are valid
- Check \`rejectUnauthorized\` setting
- Verify SSL mode in database config

### Support

For issues, contact: support@aibos.platform
`;
}

/**
 * Generate quick copy command for CLI
 */
function generateQuickCopyCommand(tenantId: string): string {
  return `npx aibos-cli storage connect ${tenantId} --copy`;
}

/**
 * Generate test connection snippet
 */
function generateTestConnectionSnippet(provider: string): string {
  return `// Quick test - paste this in your terminal or REPL
import { testConnection } from './db';
await testConnection();
`;
}

/**
 * Copy connection kit to clipboard (browser-compatible)
 */
export function copyToClipboard(kit: InstantConnectionKit, format: "typescript" | "javascript" | "env"): string {
  if (format === "env") {
    return kit.snippets.dotenv;
  }
  return kit.snippets[format].code;
}

/**
 * Generate a complete project scaffold
 */
export async function generateProjectScaffold(
  tenantId: string,
  config: TenantStorageConfig,
  outputDir: string
): Promise<{ files: Array<{ path: string; content: string }> }> {
  const kit = await generateConnectionKit(tenantId, config);

  return {
    files: [
      {
        path: `${outputDir}/db.ts`,
        content: kit.snippets.typescript.code,
      },
      {
        path: `${outputDir}/.env.example`,
        content: kit.snippets.dotenv,
      },
      {
        path: `${outputDir}/README.md`,
        content: kit.snippets.readme,
      },
      {
        path: `${outputDir}/package.json`,
        content: JSON.stringify({
          name: `aibos-${tenantId}`,
          version: "1.0.0",
          type: "module",
          scripts: {
            "test:db": "tsx db.ts",
          },
          dependencies: Object.fromEntries(
            kit.snippets.typescript.dependencies.map(dep => [dep, "latest"])
          ),
        }, null, 2),
      },
      {
        path: `${outputDir}/.gitignore`,
        content: `.env
.env.local
node_modules/
dist/
*.db
*.db-shm
*.db-wal
`,
      },
    ],
  };
}

