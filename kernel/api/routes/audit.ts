import { Hono } from "hono";
import { auditStore } from "../../audit/audit.store";

export const auditRoute = new Hono();

auditRoute.get("/", c => {
  return c.json(auditStore.all());
});

auditRoute.get("/filter", c => {
  const category = c.req.query("category");
  const actor = c.req.query("actor");
  return c.json(auditStore.filter(category, actor));
});

