import { Hono } from "hono";
import { collectDiagnostics } from "../../hardening/diagnostics/collect";

export const diagRoute = new Hono();

diagRoute.get("/", c => {
  return c.json(collectDiagnostics());
});

