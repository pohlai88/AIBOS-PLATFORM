/**
 * Agent Management Routes
 * 
 * REST API for agent memory and management
 */

import type { Hono } from "hono";
import { z } from "zod";
import { validateParams, validateJsonBody, getValidParams } from "../middleware/validation";
import { agentMemoryManager } from "../agents/memory";
import { agentRegistry } from "../agents/registry/agent-registry";

const AgentSessionParams = z.object({
  agentId: z.string().min(1),
  sessionId: z.string().min(1),
});

/**
 * Register agent management routes
 */
export function registerAgentRoutes(app: Hono) {
  // GET /agents/:agentId/memory/:sessionId - Get agent memory
  app.get(
    "/agents/:agentId/memory/:sessionId",
    validateParams(AgentSessionParams),
    async (c) => {
      const { agentId, sessionId } = getValidParams<z.infer<typeof AgentSessionParams>>(c);

      const memory = await agentMemoryManager.getMemory(agentId, sessionId, false);

      if (!memory) {
        return c.json({ error: "Memory not found" }, 404);
      }

      return c.json({
        agentId: memory.agentId,
        sessionId: memory.sessionId,
        context: memory.context,
        historyCount: memory.history.length,
        recentHistory: memory.history.slice(-10), // Last 10 actions
        metadata: {
          createdAt: memory.metadata.createdAt.toISOString(),
          lastAccessed: memory.metadata.lastAccessed.toISOString(),
          lastUpdated: memory.metadata.lastUpdated.toISOString(),
          accessCount: memory.metadata.accessCount,
        },
      });
    }
  );

  // PUT /agents/:agentId/memory/:sessionId/context - Update agent context
  app.put(
    "/agents/:agentId/memory/:sessionId/context",
    validateParams(AgentSessionParams),
    validateJsonBody(z.record(z.any())),
    async (c) => {
      const { agentId, sessionId } = getValidParams<z.infer<typeof AgentSessionParams>>(c);
      const updates = await c.req.json<Record<string, any>>();

      await agentMemoryManager.updateContext(agentId, sessionId, updates);

      return c.json({
        success: true,
        message: "Context updated",
      });
    }
  );

  // POST /agents/:agentId/memory/:sessionId/snapshot - Create memory snapshot
  app.post(
    "/agents/:agentId/memory/:sessionId/snapshot",
    validateParams(AgentSessionParams),
    async (c) => {
      const { agentId, sessionId } = getValidParams<z.infer<typeof AgentSessionParams>>(c);

      const snapshot = await agentMemoryManager.createSnapshot(agentId, sessionId);

      if (!snapshot) {
        return c.json({ error: "Memory not found" }, 404);
      }

      return c.json({
        success: true,
        snapshot: {
          agentId: snapshot.agentId,
          sessionId: snapshot.sessionId,
          context: snapshot.context,
          historyCount: snapshot.history.length,
          metadata: {
            createdAt: snapshot.metadata.createdAt.toISOString(),
            lastUpdated: snapshot.metadata.lastUpdated.toISOString(),
          },
        },
      });
    }
  );

  // GET /agents/:agentId/sessions - List all sessions for an agent
  app.get(
    "/agents/:agentId/sessions",
    validateParams(z.object({ agentId: z.string().min(1) })),
    async (c) => {
      const { agentId } = getValidParams<z.infer<typeof z.object({ agentId: z.string().min(1) })>>(c);

      const sessions = await agentMemoryManager.listSessions(agentId);

      return c.json({
        agentId,
        sessions,
        count: sessions.length,
      });
    }
  );

  // DELETE /agents/:agentId/memory/:sessionId - Delete agent memory
  app.delete(
    "/agents/:agentId/memory/:sessionId",
    validateParams(AgentSessionParams),
    async (c) => {
      const { agentId, sessionId } = getValidParams<z.infer<typeof AgentSessionParams>>(c);

      await agentMemoryManager.deleteMemory(agentId, sessionId);

      return c.json({
        success: true,
        message: "Memory deleted",
      });
    }
  );
}
