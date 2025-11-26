/**
 * OpenAPI Generator
 *
 * Builds a minimal OpenAPI 3 document for the Kernel HTTP API.
 * Includes kernel-specific extensions for actions and engines.
 */

import type { Context } from 'hono';
import type { OpenAPIV3 } from 'openapi-types';
import { listRegisteredActions } from '../registry/action.registry';

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

  const actions = listRegisteredActions();

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
      security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
    },
  };

  // Health endpoints
  paths['/healthz'] = {
    get: {
      summary: 'Liveness check',
      description: 'Returns 200 if the kernel is alive',
      tags: ['health'],
      responses: {
        '200': { description: 'Kernel is alive' },
      },
    },
  };

  paths['/readyz'] = {
    get: {
      summary: 'Readiness check',
      description: 'Returns 200 if the kernel is ready to accept requests',
      tags: ['health'],
      responses: {
        '200': { description: 'Kernel is ready' },
        '503': { description: 'Kernel is not ready' },
      },
    },
  };

  // Per-action documentation as OpenAPI extensions
  const xKernelActions: Record<string, unknown> = {};

  for (const action of actions) {
    const key = action.contract.actionId;
    xKernelActions[key] = {
      description: action.contract.metadata?.description,
      domain: action.contract.metadata?.domain,
      category: action.contract.metadata?.category,
      riskBand: action.contract.metadata?.riskBand,
      sideEffectLevel: action.contract.metadata?.sideEffectLevel,
      dataContractRef: action.contract.metadata?.dataContractRef,
    };
  }

  const doc: OpenAPIV3.Document = {
    openapi: '3.0.3',
    info: {
      title,
      version: options.version,
      description: 'AI-BOS Kernel HTTP API',
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
  };

  // Add AI-BOS-specific extensions
  (doc as any)['x-aibos-actions'] = xKernelActions;

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

