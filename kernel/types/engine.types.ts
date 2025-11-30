// types/engine.types.ts
import type { KernelActionContract } from '../contracts/contract.types';

/**
 * Kernel Engine Manifest
 * 
 * Metadata that describes an engine and its available actions.
 * Used by the engine registry for discovery and routing.
 */
export interface KernelEngineManifest {
  /** Unique engine ID (e.g., accounting, inventory, workflow) */
  id: string;

  /** Human-readable engine name */
  name: string;

  /** Semantic version (e.g., 1.0.0) */
  version: string;

  /** Description of what this engine does */
  description: string;

  /** Domain/namespace this engine belongs to */
  domain: string;

  /** Map of action IDs to action metadata */
  actions: Record<string, KernelEngineActionMetadata>;

  /** Optional: Engine-level configuration schema */
  configSchema?: unknown;

  /** Optional: Dependencies on other engines */
  dependencies?: string[];

  /** Optional: Tags for discovery */
  tags?: string[];
}

/**
 * Metadata for a single action within an engine
 */
export interface KernelEngineActionMetadata {
  /** Action ID (e.g., read.journal_entries) */
  id: string;

  /** Reference to the action contract */
  contract: KernelActionContract;

  /** Description of this specific action */
  description: string;

  /** Tags for discovery and policy */
  tags?: string[];

  /** Optional: Action-specific configuration */
  config?: unknown;
}

/**
 * Engine instance with manifest and action implementations
 */
export interface KernelEngine {
  /** Engine ID */
  id: string;

  /** Engine manifest (metadata) */
  manifest: KernelEngineManifest;

  /** Map of action IDs to action handler functions */
  actions: Record<string, ActionHandler>;

  /** Optional: Engine initialization function */
  onInit?: (config: unknown) => Promise<void>;

  /** Optional: Engine shutdown function */
  onShutdown?: () => Promise<void>;
}

/**
 * Generic action handler function signature
 * 
 * Engines implement this interface for each action.
 * The sandbox v2 calls these handlers with an ActionContext.
 */
export type ActionHandler<
  TInput = unknown,
  TOutput = unknown,
  TContext extends ActionContext = ActionContext
> = (ctx: TContext) => Promise<TOutput>;

/**
 * Action execution context
 * 
 * Injected by the sandbox v2 into each action handler.
 * Provides access to:
 * - Input (validated against contract)
 * - Tenant context
 * - User/principal
 * - Database proxy
 * - Cache
 * - Metadata
 * - Event bus
 * - Logging
 * - Engine config
 */
export interface ActionContext<TInput = unknown> {
  /** Validated input (already parsed by contract inputSchema) */
  input: TInput;

  /** Tenant ID (from auth context or override) */
  tenant: string | null;

  /** User/principal (opaque at engine level) */
  user: unknown;

  /** Database proxy (sandboxed) */
  db: DatabaseProxy;

  /** Cache proxy */
  cache: CacheProxy;

  /** Metadata engine proxy */
  metadata: MetadataProxy;

  /** Event emitter */
  emit: (event: string, payload: unknown) => void;

  /** Logger */
  log: (...args: unknown[]) => void;

  /** Engine-specific configuration */
  engineConfig: unknown;

  /** Request ID (for tracing) */
  requestId?: string;

  /** Correlation ID (for distributed tracing) */
  correlationId?: string;
}

/**
 * Database proxy interface
 * 
 * Sandboxed database access.
 * All queries are tenant-scoped and logged for audit.
 */
export interface DatabaseProxy {
  /**
   * Execute a parameterized SQL query
   * 
   * @param sql - SQL query with $1, $2, etc. placeholders
   * @param params - Query parameters (optional)
   * @returns Array of rows
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Execute a query and return a single row
   * 
   * @param sql - SQL query
   * @param params - Query parameters (optional)
   * @returns Single row or null
   */
  one<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;

  /**
   * Execute a query and return multiple rows
   * 
   * @param sql - SQL query
   * @param params - Query parameters (optional)
   * @returns Array of rows
   */
  many<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;

  /**
   * Execute a query and return no rows (INSERT/UPDATE/DELETE)
   * 
   * @param sql - SQL query
   * @param params - Query parameters (optional)
   * @returns Number of affected rows
   */
  none(sql: string, params?: unknown[]): Promise<number>;
}

/**
 * Cache proxy interface
 * 
 * Sandboxed cache access (Redis/In-memory).
 */
export interface CacheProxy {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * Metadata engine proxy interface
 * 
 * Access to metadata registry.
 */
export interface MetadataProxy {
  getEntity(name: string): Promise<unknown>;
  getSchema(entityName: string): Promise<unknown>;
  getContract(actionId: string): Promise<KernelActionContract | null>;
}
