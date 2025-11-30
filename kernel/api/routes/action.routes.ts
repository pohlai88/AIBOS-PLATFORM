/**
 * Legacy Action Routes
 *
 * @deprecated Use /actions/:engineId/:actionId from http/routes/actions.ts instead
 */

import { Hono } from "hono";
import { actionDispatcher } from "../../actions/action-dispatcher";
import type { Principal } from "../../auth/types";

export function registerActionRoutes(app: Hono) {
  app.post("/action/:engine/:action", async (c) => {
    const engine = c.req.param("engine");
    const action = c.req.param("action");
    const body = await c.req.json().catch(() => ({}));
    const { payload, user, tenant } = body;

    const principal = c.get("principal") as Principal | null;
    const tenantId = tenant ?? c.get("tenantId") ?? null;

    try {
      const result = await actionDispatcher.execute(
        `${engine}.${action}`,
        {
          tenantId,
          subject: principal?.id ?? user?.id ?? "anonymous",
          traceId: c.get("traceId") ?? null,
          roles: principal?.roles ?? [],
          scopes: principal?.scopes ?? [],
        },
        payload,
      );

      return c.json({ ok: true, data: result.output });
    } catch (err: any) {
      return c.json({ ok: false, error: err.message }, 500);
    }
  });
}
