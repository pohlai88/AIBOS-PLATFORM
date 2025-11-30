// kernel/api/server.ts

import { Hono } from "hono";
import { healthHandler } from "./routes/health";

const app = new Hono();

// Health check endpoint
app.get("/kernel/health", healthHandler);

// TODO: Add other routes
// app.post("/kernel/action/:engine/:action", actionHandler);
// app.get("/kernel/readyz", readyHandler);
// app.get("/kernel/diagz", diagHandler);
// app.get("/kernel/auditz", auditHandler);

export default app;

