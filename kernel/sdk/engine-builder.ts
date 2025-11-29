// sdk/engine-builder.ts
/**
 * MCP Engine SDK — Type-Safe Engine & Action Builder
 * 
 * Provides fluent API for creating kernel engines and actions with:
 * - Zero-drift contract enforcement
 * - Automatic validation
 * - Type safety
 * - Auto-registration
 * - RBAC enforcement
 * - Classification auto-generation
 * 
 * Usage:
 * ```typescript
 * const myAction = defineAction({
 *   id: 'accounting.read.journal_entries',
 *   domain: 'accounting',
 *   summary: 'Read journal entries',
 *   input: ReadJournalEntriesInputSchema,
 *   output: ReadJournalEntriesOutputSchema,
 *   permissions: ['accounting.read'],
 *   handler: async (ctx) => { ... }
 * });
 * 
 * const myEngine = defineEngine({
 *   id: 'accounting',
 *   name: 'Accounting Engine',
 *   version: '1.0.0',
 *   domain: 'accounting',
 *   actions: [myAction]
 * });
 * ```
 */

import type { z } from 'zod';
import type { KernelActionContract, InferInput, InferOutput } from '../contracts/contract.types';
import type { KernelEngine, KernelEngineManifest, ActionHandler, ActionContext } from '../types/engine.types';
import { registerEngine } from '../registry/engine.loader';

/**
 * Action Definition Builder
 * 
 * Type-safe action definition with automatic contract generation
 */
export interface ActionDefinition<
  TInputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny = z.ZodTypeAny
> {
  /** Unique action ID (e.g., read.journal_entries) */
  id: string;

  /** Domain/namespace (e.g., accounting) */
  domain: string;

  /** Action kind */
  kind?: 'query' | 'command' | 'mutation';

  /** Short summary */
  summary: string;

  /** Detailed description */
  description?: string;

  /** Input schema (Zod) */
  input: TInputSchema;

  /** Output schema (Zod) */
  output: TOutputSchema;

  /** Required permissions */
  permissions?: string[];

  /** Tags for discovery */
  tags?: string[];

  /** Data classification */
  classification?: {
    piiLevel?: 'none' | 'low' | 'medium' | 'high';
    sensitivity?: 'public' | 'internal' | 'confidential' | 'financial' | 'pii';
    compliance?: Array<'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'PCI-DSS'>;
  };

  /** Action handler implementation */
  handler: ActionHandler<InferInput<KernelActionContract<TInputSchema, TOutputSchema>>>;
}

/**
 * Built action with contract and handler
 */
export interface BuiltAction<
  TInputSchema extends z.ZodTypeAny = z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny = z.ZodTypeAny
> {
  /** Action ID */
  id: string;

  /** Domain */
  domain: string;

  /** Generated contract */
  contract: KernelActionContract<TInputSchema, TOutputSchema>;

  /** Action handler */
  handler: ActionHandler;

  /** Metadata for manifest */
  metadata: {
    description: string;
    tags: string[];
  };
}

/**
 * Define a kernel action
 * 
 * Creates a type-safe action with automatic contract generation.
 * 
 * @param definition - Action definition
 * @returns Built action with contract and handler
 * 
 * @example
 * ```typescript
 * const readJournalEntries = defineAction({
 *   id: 'read.journal_entries',
 *   domain: 'accounting',
 *   summary: 'Read journal entries',
 *   input: ReadJournalEntriesInputSchema,
 *   output: ReadJournalEntriesOutputSchema,
 *   permissions: ['accounting.read'],
 *   handler: async (ctx) => {
 *     const rows = await ctx.db.query('SELECT * FROM journal_entries WHERE tenant_id = $1', [ctx.tenant]);
 *     return { items: rows, total: rows.length };
 *   }
 * });
 * ```
 */
export function defineAction<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny
>(
  definition: ActionDefinition<TInputSchema, TOutputSchema>
): BuiltAction<TInputSchema, TOutputSchema> {
  // Generate full action ID
  const fullActionId = `${definition.domain}.${definition.id}`;

  // Auto-detect kind based on ID prefix if not specified
  const kind = definition.kind || detectActionKind(definition.id);

  // Auto-generate tags
  const tags = [
    ...(definition.tags || []),
    definition.domain,
    kind,
    ...definition.id.split('.'),
  ];

  // Build contract
  const contract: KernelActionContract<TInputSchema, TOutputSchema> = {
    id: fullActionId,
    version: '1.0.0', // Can be overridden later
    domain: definition.domain,
    kind,
    summary: definition.summary,
    description: definition.description || definition.summary,
    inputSchema: definition.input,
    outputSchema: definition.output,
    tags,
    permissions: definition.permissions,
    classification: definition.classification,
  };

  return {
    id: definition.id,
    domain: definition.domain,
    contract,
    handler: definition.handler as ActionHandler,
    metadata: {
      description: definition.description || definition.summary,
      tags,
    },
  };
}

/**
 * Auto-detect action kind based on ID
 */
function detectActionKind(actionId: string): 'query' | 'command' | 'mutation' {
  const verb = actionId.split('.')[0].toLowerCase();

  const queryVerbs = ['read', 'get', 'list', 'search', 'find', 'query'];
  const commandVerbs = ['create', 'post', 'insert', 'add'];
  const mutationVerbs = ['update', 'delete', 'patch', 'remove', 'modify'];

  if (queryVerbs.includes(verb)) return 'query';
  if (commandVerbs.includes(verb)) return 'command';
  if (mutationVerbs.includes(verb)) return 'mutation';

  // Default to query
  return 'query';
}

/**
 * Engine Definition
 */
export interface EngineDefinition {
  /** Engine ID */
  id: string;

  /** Human-readable name */
  name: string;

  /** Semantic version */
  version: string;

  /** Description */
  description: string;

  /** Domain */
  domain: string;

  /** Actions (built via defineAction) */
  actions: BuiltAction[];

  /** Optional: Initialization function */
  onInit?: (config: unknown) => Promise<void>;

  /** Optional: Shutdown function */
  onShutdown?: () => Promise<void>;

  /** Optional: Tags */
  tags?: string[];

  /** Optional: Dependencies */
  dependencies?: string[];
}

/**
 * Define a kernel engine
 * 
 * Creates a complete engine with manifest and auto-registers it.
 * 
 * @param definition - Engine definition
 * @returns Kernel engine
 * 
 * @example
 * ```typescript
 * const accountingEngine = defineEngine({
 *   id: 'accounting',
 *   name: 'Accounting Engine',
 *   version: '1.0.0',
 *   domain: 'accounting',
 *   description: 'Core accounting actions',
 *   actions: [readJournalEntries, createJournalEntry]
 * });
 * ```
 */
export function defineEngine(definition: EngineDefinition): KernelEngine {
  // Build manifest
  const manifest: KernelEngineManifest = {
    id: definition.id,
    name: definition.name,
    version: definition.version,
    description: definition.description,
    domain: definition.domain,
    actions: {},
    tags: definition.tags,
    dependencies: definition.dependencies,
  };

  // Build actions map
  const actions: Record<string, ActionHandler> = {};

  for (const action of definition.actions) {
    // Add to manifest
    manifest.actions[action.id] = {
      id: action.id,
      contract: action.contract,
      description: action.metadata.description,
      tags: action.metadata.tags,
    };

    // Add handler
    actions[action.id] = action.handler;
  }

  // Create engine
  const engine: KernelEngine = {
    id: definition.id,
    manifest,
    actions,
    onInit: definition.onInit,
    onShutdown: definition.onShutdown,
  };

  // Auto-register
  registerEngine(engine);

  // Import logger dynamically to avoid circular dependency
  const { baseLogger } = await import("../observability/logger");
  baseLogger.info(
    { engineId: definition.id, actionCount: definition.actions.length },
    '[SDK] Engine "%s" defined and registered (%d actions)',
    definition.id,
    definition.actions.length
  );

  return engine;
}

/**
 * Quick action builder for simple cases
 * 
 * @example
 * ```typescript
 * export const simpleAction = quickAction(
 *   'accounting',
 *   'ping',
 *   z.object({}),
 *   z.object({ message: z.string() }),
 *   async (ctx) => ({ message: 'pong' })
 * );
 * ```
 */
export function quickAction<
  TInputSchema extends z.ZodTypeAny,
  TOutputSchema extends z.ZodTypeAny
>(
  domain: string,
  actionId: string,
  input: TInputSchema,
  output: TOutputSchema,
  handler: ActionHandler<InferInput<KernelActionContract<TInputSchema, TOutputSchema>>>
): BuiltAction<TInputSchema, TOutputSchema> {
  return defineAction({
    id: actionId,
    domain,
    summary: `${actionId} action`,
    input,
    output,
    handler,
  });
}

