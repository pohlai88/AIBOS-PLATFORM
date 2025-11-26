import { Hono } from "hono";
import { getUISchema } from "../../ui/ui.generator";
import { uiRegistry } from "../../ui/ui.registry";

export function registerUIRoutes(app: Hono) {
  app.get("/ui/:model", (c) => {
    try {
      const schema = getUISchema(c.req.param("model"));
      return c.json(schema);
    } catch (err: any) {
      return c.json({ error: err.message }, 404);
    }
  });

  app.get("/ui", (c) => {
    return c.json({ models: uiRegistry.list() });
  });
}

