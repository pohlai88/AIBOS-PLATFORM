import { Hono } from "hono";

export function registerHealthRoutes(app: Hono) {
  app.get("/health", (c) =>
    c.json({ ok: true, status: "Kernel API alive" })
  );
}

