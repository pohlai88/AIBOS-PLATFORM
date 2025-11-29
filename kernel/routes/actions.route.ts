// routes/actions.route.ts
import { Hono } from 'hono';
import { actionDispatcher } from '../dispatcher/action.dispatcher';
import type { ActionContext } from '../types/engine.types';

/**
 * Actions HTTP Router
 * 
 * Routes:
 * - POST /actions/:domain/:action - Execute an action
 * - GET /actions - List all actions
 * - GET /actions/:domain/:action/contract - Get action contract
 */
export const actionsRouter = new Hono();

/**
 * POST /actions/:domain/:action
 * 
 * Execute a kernel action
 * 
 * Example:
 * POST /actions/accounting/read.journal_entries
 * Body: { dateFrom: "2025-01-01", dateTo: "2025-12-31", page: 1, pageSize: 50 }
 */
actionsRouter.post('/:domain/:action', async (c) => {
  try {
    const domain = c.req.param('domain');
    const action = c.req.param('action');
    const actionId = `${domain}.${action}`;

    // Parse request body
    const input = await c.req.json();

    // Get tenant from auth context (middleware should set this)
    const tenant = c.get('tenant') || null;
    const user = c.get('user') || null;

    // TODO: Replace with actual database proxy
    const dbProxy = {
      query: async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
        // This is a placeholder - replace with actual DB connection
        console.log('[DB Query]', sql, params);
        return [] as T[];
      },
      one: async <T = unknown>(sql: string, params?: unknown[]): Promise<T | null> => {
        const results = await dbProxy.query<T>(sql, params);
        return results[0] || null;
      },
      many: async <T = unknown>(sql: string, params?: unknown[]): Promise<T[]> => {
        return dbProxy.query<T>(sql, params);
      },
      none: async (sql: string, params?: unknown[]): Promise<number> => {
        console.log('[DB None]', sql, params);
        return 0;
      },
    };

    // TODO: Replace with actual cache proxy
    const cacheProxy = {
      get: async <T = unknown>(key: string): Promise<T | null> => {
        console.log('[Cache Get]', key);
        return null;
      },
      set: async (key: string, value: unknown, ttl?: number): Promise<void> => {
        console.log('[Cache Set]', key, value, ttl);
      },
      del: async (key: string): Promise<void> => {
        console.log('[Cache Del]', key);
      },
      exists: async (key: string): Promise<boolean> => {
        console.log('[Cache Exists]', key);
        return false;
      },
    };

    // TODO: Replace with actual metadata proxy
    const metadataProxy = {
      getEntity: async (name: string): Promise<unknown> => {
        console.log('[Metadata GetEntity]', name);
        return null;
      },
      getSchema: async (entityName: string): Promise<unknown> => {
        console.log('[Metadata GetSchema]', entityName);
        return null;
      },
      getContract: async (actionId: string): Promise<unknown> => {
        console.log('[Metadata GetContract]', actionId);
        return null;
      },
    };

    // Build action context
    const context: Partial<ActionContext> = {
      tenant,
      user,
      db: dbProxy,
      cache: cacheProxy,
      metadata: metadataProxy,
      emit: (event: string, payload: unknown) => {
        console.log('[Event]', event, payload);
        // TODO: Emit to event bus
      },
      log: (...args: unknown[]) => {
        console.log('[Action Log]', ...args);
      },
      engineConfig: {},
      requestId: c.req.header('x-request-id') || undefined,
      correlationId: c.req.header('x-correlation-id') || undefined,
    };

    // Dispatch action
    const result = await actionDispatcher.dispatch(actionId, input, context);

    // Return result
    if (result.success) {
      return c.json({
        success: true,
        data: result.data,
        meta: result.meta,
      });
    } else {
      return c.json(
        {
          success: false,
          error: result.error,
          meta: result.meta,
        },
        result.error?.code === 'ACTION_NOT_FOUND' ? 404 : 400
      );
    }
  } catch (error) {
    console.error('[Actions Route] Error:', error);
    return c.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      500
    );
  }
});

/**
 * GET /actions
 * 
 * List all registered actions
 */
actionsRouter.get('/', (c) => {
  const { engineRegistry } = require('../registry/engine.loader');
  const actions = engineRegistry.getAllActionIds();

  return c.json({
    success: true,
    data: {
      actions,
      count: actions.length,
    },
  });
});

/**
 * GET /actions/:domain/:action/contract
 * 
 * Get action contract metadata
 */
actionsRouter.get('/:domain/:action/contract', (c) => {
  const domain = c.req.param('domain');
  const action = c.req.param('action');
  const actionId = `${domain}.${action}`;

  const { engineRegistry } = require('../registry/engine.loader');
  const engine = engineRegistry.get(domain);

  if (!engine) {
    return c.json(
      {
        success: false,
        error: {
          code: 'ENGINE_NOT_FOUND',
          message: `Engine "${domain}" not found`,
        },
      },
      404
    );
  }

  const actionMeta = engine.manifest.actions[action];
  if (!actionMeta) {
    return c.json(
      {
        success: false,
        error: {
          code: 'ACTION_NOT_FOUND',
          message: `Action "${actionId}" not found`,
        },
      },
      404
    );
  }

  return c.json({
    success: true,
    data: {
      contract: {
        id: actionMeta.contract.id,
        version: actionMeta.contract.version,
        domain: actionMeta.contract.domain,
        kind: actionMeta.contract.kind,
        summary: actionMeta.contract.summary,
        description: actionMeta.contract.description,
        classification: actionMeta.contract.classification,
        tags: actionMeta.contract.tags,
        permissions: actionMeta.contract.permissions,
        // Note: Schemas are omitted for brevity (Zod schemas can't be easily serialized)
        // In production, you'd generate JSON Schema from Zod schemas
      },
    },
  });
});

