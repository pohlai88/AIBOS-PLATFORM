/**
 * AI Agents HTTP API Routes
 * 
 * AI-BOS Kernel v6.0.0 Phase 5: Agent Management API
 */

import type { Hono } from "hono";
import { z } from "zod";
import { validateJsonBody, validateParams, getValidBody, getValidParams } from "../zod-middleware";
import { agentRegistry } from "../../agents/registry/agent-registry";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("agent-routes");

export function registerAgentRoutes(app: Hono) {
  // --- Agent Discovery ---

  // GET /agents - List all registered agents
  app.get("/agents", async (c) => {
    const agents = agentRegistry.listAgents();
    return c.json({ agents, count: agents.length });
  });

  // GET /agents/:id - Get agent details
  const GetAgentParams = z.object({
    id: z.string().min(1),
  });
  app.get("/agents/:id", validateParams(GetAgentParams), async (c) => {
    const { id } = getValidParams(c);
    const entry = agentRegistry.getAgentEntry(id);
    
    if (!entry) {
      return c.json({ error: `Agent '${id}' not found` }, 404);
    }

    return c.json(entry);
  });

  // GET /agents/:id/health - Get agent health status
  app.get("/agents/:id/health", validateParams(GetAgentParams), async (c) => {
    const { id } = getValidParams(c);
    const agent = agentRegistry.getAgent(id);
    
    if (!agent) {
      return c.json({ error: `Agent '${id}' not found` }, 404);
    }

    try {
      const health = await agent.getHealth();
      return c.json(health);
    } catch (error) {
      logger.error({ error, agentId: id }, "Failed to get agent health");
      return c.json({ error: "Failed to get agent health" }, 500);
    }
  });

  // --- Agent Lifecycle Management ---

  // POST /agents/:id/pause - Pause an agent
  app.post("/agents/:id/pause", validateParams(GetAgentParams), async (c) => {
    const { id } = getValidParams(c);
    
    try {
      await agentRegistry.pauseAgent(id);
      return c.json({ success: true, message: `Agent '${id}' paused` });
    } catch (error) {
      logger.error({ error, agentId: id }, "Failed to pause agent");
      return c.json({ error: error instanceof Error ? error.message : "Failed to pause agent" }, 400);
    }
  });

  // POST /agents/:id/resume - Resume an agent
  app.post("/agents/:id/resume", validateParams(GetAgentParams), async (c) => {
    const { id } = getValidParams(c);
    
    try {
      await agentRegistry.resumeAgent(id);
      return c.json({ success: true, message: `Agent '${id}' resumed` });
    } catch (error) {
      logger.error({ error, agentId: id }, "Failed to resume agent");
      return c.json({ error: error instanceof Error ? error.message : "Failed to resume agent" }, 400);
    }
  });

  // POST /agents/:id/stop - Stop an agent
  app.post("/agents/:id/stop", validateParams(GetAgentParams), async (c) => {
    const { id } = getValidParams(c);
    
    try {
      await agentRegistry.stopAgent(id);
      return c.json({ success: true, message: `Agent '${id}' stopped` });
    } catch (error) {
      logger.error({ error, agentId: id }, "Failed to stop agent");
      return c.json({ error: error instanceof Error ? error.message : "Failed to stop agent" }, 400);
    }
  });

  // --- Agent Discovery by Capability/Domain ---

  // GET /agents/by-capability/:capability - Find agents by capability
  const GetByCapabilityParams = z.object({
    capability: z.string().min(1),
  });
  app.get("/agents/by-capability/:capability", validateParams(GetByCapabilityParams), async (c) => {
    const { capability } = getValidParams(c);
    const agents = agentRegistry.findAgentsByCapability(capability);
    return c.json({ capability, agents, count: agents.length });
  });

  // GET /agents/by-domain/:domain - Find agents by orchestra domain
  const GetByDomainParams = z.object({
    domain: z.string().min(1),
  });
  app.get("/agents/by-domain/:domain", validateParams(GetByDomainParams), async (c) => {
    const { domain } = getValidParams(c);
    const agents = agentRegistry.findAgentsByDomain(domain);
    return c.json({ domain, agents, count: agents.length });
  });

  // --- Agent Health Dashboard ---

  // GET /agents/health - Get health status for all agents
  app.get("/agents/health", async (c) => {
    try {
      const healthStatuses = await agentRegistry.getHealthStatuses();
      const healthArray = Array.from(healthStatuses.values());
      
      return c.json({
        agents: healthArray,
        totalAgents: healthArray.length,
        healthy: healthArray.filter(h => h.status === "running").length,
        paused: healthArray.filter(h => h.status === "paused").length,
        errors: healthArray.filter(h => h.status === "error").length,
      });
    } catch (error) {
      logger.error({ error }, "Failed to get all agent health statuses");
      return c.json({ error: "Failed to get agent health statuses" }, 500);
    }
  });

  logger.info("Agent routes registered");
}

