/**
 * Actions Routes
 *
 * Golden-path action invocation endpoint with full observability,
 * policy enforcement, and audit logging.
 */

import type { Hono, Context } from 'hono';

import { withHttpSpan, buildHttpSpanAttributes, withActionSpan } from '../../observability/tracing';
import { actionDispatcher } from '../../actions/action-dispatcher';
import { evaluateDefaultPolicy } from '../../security/policies/default.policy';
import { emitPolicyDecision, emitActionCompleted } from '../../audit/emit';
import { actionsExecutedTotal } from '../../observability/metrics';
import type { Principal, AuthContext } from '../../auth/types';

function principalToAuthContext(principal: Principal, tenantId: string | null): AuthContext {
  return {
    tenantId,
    principal: { type: 'user', id: principal.id, subject: principal.id },
    roles: principal.roles,
    scopes: principal.scopes,
    tokenType: principal.authMethod === 'api_key' ? 'api-key' : principal.authMethod === 'jwt' ? 'jwt' : 'anonymous',
  };
}

export function registerActionRoutes(app: Hono) {
  // Golden-path action invocation endpoint.
  app.post('/actions/:engineId/:actionId', async (c: Context) => {
    const engineId = c.req.param('engineId');
    const actionId = c.req.param('actionId');
    const principal = c.get('principal') as Principal | null;
    const tenantId = c.get('tenantId') as string | null;

    const body = await c.req.json().catch(() => ({}));

    const httpAttrs = buildHttpSpanAttributes({
      method: c.req.method,
      path: c.req.path,
      route: '/actions/:engineId/:actionId',
      tenantId,
    });

    return withHttpSpan('actions.invoke', httpAttrs, async () => {
      if (!principal) {
        return c.json({ error: 'unauthorized' }, 401);
      }

      const fullActionId = `${engineId}.${actionId}`;
      const authCtx = principalToAuthContext(principal, tenantId);

      // Policy evaluation (default policy)
      const policyDecision = evaluateDefaultPolicy({
        principal,
        tenantId,
        actionId: fullActionId,
      });

      await emitPolicyDecision(
        authCtx,
        fullActionId,
        policyDecision.outcome,
        policyDecision.reason,
        { traceId: c.get('traceId') ?? undefined },
      );

      if (policyDecision.outcome === 'deny') {
        actionsExecutedTotal.inc({
          actionId: fullActionId,
          effect: 'deny',
          tenantId: tenantId ?? 'null',
        });
        return c.json(
          {
            error: 'forbidden',
            reason: policyDecision.reason,
          },
          403,
        );
      }

      // Execute the action inside an action span.
      const result = await withActionSpan(
        fullActionId,
        { 'aibos.tenant.id': tenantId ?? '' },
        async () => {
          const dispatchResult = await actionDispatcher.execute(
            fullActionId,
            {
              tenantId,
              subject: principal.id,
              traceId: c.get('traceId'),
              roles: principal.roles,
              scopes: principal.scopes,
            },
            body,
          );

          return dispatchResult;
        },
      );

      actionsExecutedTotal.inc({
        actionId: fullActionId,
        effect: 'allow',
        tenantId: tenantId ?? 'null',
      });

      await emitActionCompleted(authCtx, fullActionId, {
        traceId: c.get('traceId') ?? undefined,
      });

      return c.json({ data: result }, 200);
    });
  });
}
