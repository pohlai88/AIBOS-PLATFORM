/**
 * Prometheus Metrics Route
 * 
 * Exposes /metrics endpoint for Prometheus scraping
 */

import { Hono } from "hono";
import { metricsRegistry } from "../../observability/metrics";

const app = new Hono();

app.get("/metrics", async (c) => {
  const body = await metricsRegistry.metrics();
  return c.text(body, 200, {
    "Content-Type": metricsRegistry.contentType,
  });
});

export default app;

