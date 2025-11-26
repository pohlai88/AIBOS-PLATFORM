// AI-BOS Kernel – HTTP API & OpenAPI v1
// This document contains reference implementations for:
// 1) http/router.ts           – unified HTTP router for the kernel
// 2) http/routes/actions.ts   – golden-path action invoke route
// 3) http/openapi.ts          – minimal OpenAPI 3 generator from registries
//
// Copy each section into its respective file in the `kernel/http` directory.
// Adjust import paths if your folder structure differs slightly.

// ────────────────────────────────────────────────────────────────────────────────
// 1) http/router.ts
// ────────────────────────────────────────────────────────────────────────────────

import { Hono } from 'hono';
import type { Context } from 'hono';

import { authMiddleware } from './middleware/auth';
import { metricsMiddleware } from './middleware/metrics';
import { traceIdMiddleware } from './middleware/trace-id';

import { registerActionRoutes } from './routes/actions';
import { registerEngineRoutes } from './routes/engines';
import { registerUiRoutes } from './routes/ui';
import { registerMetadataRoutes } from './routes/metadata';
import { registerTenantRoutes } from './routes/tenants';
import { registerHealthRoutes } from './routes/health';
import { registerDiagRoutes } from './routes/diag';
import { registerMetricsRoutes } from './routes/metrics';
import { registerAuditRoutes } from './routes/audit';

// Extend Hono context variables for kernel-specific data.
// Adjust these to match your actual middleware contracts.
declare module 'hono' {
  interface ContextVariableMap {
    principal: import('../auth/types').Principal | null;
    tenantId: string | null;
    traceId: string | null;
  }
}

export type KernelApp = Hono;

/**
 * Create and configure the kernel HTTP application.
 *
 * This function is the single entry point for all HTTP routing. It applies
 * global middleware (trace id, metrics, auth) and then mounts all feature
 * routes. This consolidates the previous split between `api/` and `http/`.
 */
export function createKernelApp(): KernelApp {
  const app = new Hono();

  // Global middlewares
  app.use('*', traceIdMiddleware);
  app.use('*', metricsMiddleware);
  app.use('*', authMiddleware);

  // Health / diagnostics
  registerHealthRoutes(app);
  registerDiagRoutes(app);
  registerMetricsRoutes(app);

  // Core kernel domains
  registerActionRoutes(app);
  registerEngineRoutes(app);
  registerUiRoutes(app);
  registerMetadataRoutes(app);
  registerTenantRoutes(app);
  registerAuditRoutes(app);

  return app;
}

// For simple deployments, you can expose a default app instance:
export const kernelHttpApp: KernelApp = createKernelApp();

// ────────────────────────────────────────────────────────────────────────────────
// 2) http/routes/actions.ts
// ────────────────────────────────────────────────────────────────────────────────

import type { Hono } from 'hono';
import type { Context } from 'hono';

import { withHttpSpan, buildHttpSpanAttributes, withActionSpan } from '../../observability/tracing';
import { actionDispatcher } from '../../actions/action-dispatcher';
import { evaluateDefaultPolicy } from '../../security/policies/default.policy';
import { emitPolicyDecision, emitActionInvoked } from '../../audit/emit';
import { incrementActionCounter } from '../../observability/metrics';

export function registerActionRoutes(app: Hono) {
  // Golden-path action invocation endpoint.
  app.post('/actions/:engineId/:actionId', async (c: Context) => {
    const engineId = c.req.param('engineId');
    const actionId = c.req.param('actionId');
    const principal = c.get('principal');
    const tenantId = c.get('tenantId');

    const body = await c.req.json().catch(() => ({}));

    const httpAttrs = buildHttpSpanAttributes({
      method: c.req.method,
      path: c.req.path,
      route: '/actions/:engineId/:actionId',
      tenantId,
    });

    return withHttpSpan('actions.invoke', httpAttrs, async () => {
      if (!principal) {
        // You may want a dedicated AuthError type; for simplicity, we return 401 here.
        return c.json({ error: 'unauthorized' }, 401);
      }

      const fullActionId = `${engineId}.${actionId}`;

      // Policy evaluation (default policy). In a more advanced setup this may
      // delegate to PolicyEngine with multiple policy sources.
      const policyDecision = evaluateDefaultPolicy({
        principal,
        tenantId,
        actionId: fullActionId,
      });

      await emitPolicyDecision({
        principal,
        tenantId,
        actionId: fullActionId,
        decision: policyDecision,
      });

      if (policyDecision.outcome === 'deny') {
        incrementActionCounter(fullActionId, 'deny');
        return c.json(
          {
            error: 'forbidden',
            reason: policyDecision.reason,
          },
          403,
        );
      }

      // Execute the action inside an action span.
      const result = await withActionSpan(fullActionId, { 'aibos.tenant.id': tenantId ?? undefined }, async () => {
        const dispatchResult = await actionDispatcher.dispatch({
          engineId,
          actionId,
          tenantId,
          principal,
          payload: body,
        });

        return dispatchResult;
      });

      incrementActionCounter(fullActionId, 'success');

      await emitActionInvoked({
        principal,
        tenantId,
        actionId: fullActionId,
        outcome: 'success',
      });

      return c.json({ data: result }, 200);
    });
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// 3) http/openapi.ts
// ────────────────────────────────────────────────────────────────────────────────

import type { OpenAPIV3 } from 'openapi-types';
import { getRegisteredActions } from '../registry/action.registry';
import { getEngineRegistrySnapshot } from '../registry/engine.registry';

/**
 * Build a minimal OpenAPI3 document for the Kernel HTTP API.
 *
 * This focuses on the golden-path action invocation endpoint and provides
 * schema-level hints for clients. You can extend this with metadata/UI routes
 * as needed.
 */
export function buildKernelOpenApiDocument(options: {
  title?: string;
  version: string;
  serverUrl?: string;
}): OpenAPIV3.Document {
  const title = options.title ?? 'AI-BOS Kernel API';
  const serverUrl = options.serverUrl ?? 'https://api.example.com/kernel';

  const actions = getRegisteredActions();
  const engines = getEngineRegistrySnapshot();

  const paths: OpenAPIV3.PathsObject = {};

  // Describe the generic action invocation endpoint.
  paths['/actions/{engineId}/{actionId}'] = {
    post: {
      summary: 'Invoke a kernel action',
      description:
        'Invoke an action exposed by a registered engine. The exact input/output schema is defined by the action contract.',
      tags: ['actions'],
      parameters: [
        {
          name: 'engineId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the engine providing the action',
        },
        {
          name: 'actionId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the action to invoke, within the engine',
        },
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              additionalProperties: true,
              description:
                'Action input payload. Actual shape is defined by the action contract for the given engine/action pair.',
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Action executed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    additionalProperties: true,
                    description:
                      'Action output payload. Actual shape is defined by the action contract for the given engine/action pair.',
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Authentication required or failed',
        },
        '403': {
          description: 'Forbidden by policy or missing permissions',
        },
        '500': {
          description: 'Unexpected kernel error during action execution',
        },
      },
      security: [
        { ApiKeyAuth: [] },
        { BearerAuth: [] },
      ],
    },
  };

  // Optionally, you can add per-action documentation as OpenAPI extensions.
  // This keeps the base spec stable while allowing rich metadata.
  const xKernelActions: Record<string, unknown> = {};

  for (const action of actions) {
    const key = `${action.engineId}.${action.id}`;
    xKernelActions[key] = {
      description: action.description,
      engineId: action.engineId,
      inputContractId: action.inputContractId,
      outputContractId: action.outputContractId,
      // you can add more fields as needed
    };
  }

  const doc: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
      title,
      version: options.version,
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
    paths,
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    // AI-BOS-specific extension with richer per-action documentation.
    'x-aibos-actions': xKernelActions,
    'x-aibos-engines': engines,
  } as OpenAPIV3.Document;

  return doc;
}

/**
 * Convenience helper to expose an HTTP handler that returns the OpenAPI
 * document. You can mount this under `/openapi.json` or similar.
 */
export function createOpenApiHandler(options: {
  version: string;
  title?: string;
  serverUrl?: string;
}) {
  const doc = buildKernelOpenApiDocument(options);
  const payload = JSON.stringify(doc, null, 2);

  return (c: Context) => {
    return c.newResponse(payload, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
      },
    });
  };
}
