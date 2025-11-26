import { Hono } from "hono";
import { metadataRegistry } from "../../registry/metadata.registry";

export function registerMetadataRoutes(app: Hono) {
  app.get("/metadata/models", (c) => {
    return c.json({ models: metadataRegistry.listModels() });
  });

  app.get("/metadata/model/:name", (c) => {
    const model = metadataRegistry.getModel(c.req.param("name"));
    if (!model) return c.json({ error: "not found" }, 404);
    return c.json(model);
  });
}

