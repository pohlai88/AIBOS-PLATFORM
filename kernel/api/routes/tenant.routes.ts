import { Hono } from "hono";
import { tenantManager } from "../../tenancy/tenant.manager";

export function registerTenantRoutes(app: Hono) {
  app.get("/tenants", (c) => {
    return c.json({ tenants: tenantManager.list() });
  });

  app.post("/tenant/create", async (c) => {
    const { id, name } = await c.req.json();
    const t = tenantManager.createTenant(id, name);
    return c.json(t);
  });

  app.post("/tenant/:id/enable-engine", async (c) => {
    const tenantId = c.req.param("id");
    const { engine } = await c.req.json();
    tenantManager.enableEngine(tenantId, engine);
    return c.json({ ok: true });
  });

  app.post("/tenant/:id/disable-engine", async (c) => {
    const tenantId = c.req.param("id");
    const { engine } = await c.req.json();
    tenantManager.disableEngine(tenantId, engine);
    return c.json({ ok: true });
  });

  app.get("/tenant/:id", (c) => {
    const tenant = tenantManager.getTenant(c.req.param("id"));
    if (!tenant) return c.json({ error: "not found" }, 404);
    return c.json(tenant);
  });

  app.delete("/tenant/:id", (c) => {
    tenantManager.deleteTenant(c.req.param("id"));
    return c.json({ ok: true });
  });
}

