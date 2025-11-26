import { Hono } from "hono";
import { engineRegistry } from "../../registry/engine.registry";

export function registerEngineRoutes(app: Hono) {
  app.get("/engines", (c) => {
    return c.json({ engines: engineRegistry.list() });
  });
}

