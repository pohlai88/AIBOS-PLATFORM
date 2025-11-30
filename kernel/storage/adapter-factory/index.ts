/**
 * 🔧 Self-Service Adapter Factory
 * 
 * Create custom storage adapters for ANY provider
 */

export {
  AdapterGenerator,
  adapterGenerator,
  AdapterConfigSchema,
  ADAPTER_TEMPLATES,
  type AdapterConfig,
  type GeneratedAdapter,
} from "./adapter.generator";

// ═══════════════════════════════════════════════════════════
// Quick Examples
// ═══════════════════════════════════════════════════════════

/**
 * Example 1: Create iCloud Adapter
 * 
 * ```typescript
 * const icloudAdapter = await adapterGenerator.createAdapter("tenant-123", {
 *   id: "icloud-storage",
 *   name: "iCloud Storage",
 *   version: "1.0.0",
 *   provider: {
 *     type: "rest",
 *     baseUrl: "https://api.icloud.com/v1",
 *     authType: "oauth2",
 *   },
 *   connection: {
 *     requiredFields: [
 *       { name: "appleId", type: "string", required: true },
 *       { name: "appSpecificPassword", type: "secret", required: true },
 *     ],
 *   },
 *   operations: {
 *     insert: { method: "POST", endpoint: "/records/{table}" },
 *     findMany: { method: "GET", endpoint: "/records/{table}" },
 *   },
 * });
 * ```
 */

/**
 * Example 2: Create Payemnt Adapter
 * 
 * ```typescript
 * const payemntAdapter = await adapterGenerator.createAdapter("tenant-456", {
 *   id: "payemnt-storage",
 *   name: "Payemnt Storage",
 *   version: "1.0.0",
 *   provider: {
 *     type: "rest",
 *     baseUrl: "https://api.payemnt.com/v2",
 *     authType: "api-key",
 *   },
 *   connection: {
 *     requiredFields: [
 *       { name: "apiKey", type: "secret", required: true },
 *       { name: "merchantId", type: "string", required: true },
 *     ],
 *     testEndpoint: "/health",
 *   },
 *   operations: {
 *     insert: { method: "POST", endpoint: "/data/{table}" },
 *     findMany: { method: "GET", endpoint: "/data/{table}" },
 *     update: { method: "PUT", endpoint: "/data/{table}/{id}" },
 *   },
 * });
 * 
 * // Test the adapter
 * const testResults = await adapterGenerator.testAdapter(payemntAdapter.id);
 * 
 * // Activate if tests pass
 * if (testResults.passed) {
 *   await adapterGenerator.activateAdapter(payemntAdapter.id);
 * }
 * ```
 */

/**
 * Example 3: Use Pre-built Template (Airtable)
 * 
 * ```typescript
 * import { ADAPTER_TEMPLATES } from '@aibos/kernel/storage/adapter-factory';
 * 
 * const airtableAdapter = await adapterGenerator.createAdapter("tenant-789", {
 *   ...ADAPTER_TEMPLATES.airtable,
 *   id: "my-airtable",
 *   name: "My Airtable Base",
 *   connection: {
 *     requiredFields: [
 *       { name: "token", type: "secret", required: true },
 *       { name: "baseId", type: "string", required: true },
 *     ],
 *   },
 * });
 * ```
 */

