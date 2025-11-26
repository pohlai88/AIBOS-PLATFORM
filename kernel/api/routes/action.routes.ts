import { Hono } from "hono";
import { runAction } from "../../security/sandbox";

export function registerActionRoutes(app: Hono) {
  app.post("/action/:engine/:action", async (c) => {
    const engine = c.req.param("engine");
    const action = c.req.param("action");
    const { payload, user, tenant } = await c.req.json();

    const result = await runAction({
      engine,
      action,
      payload,
      user,
      tenant
    });

    return c.json(result);
  });
}

