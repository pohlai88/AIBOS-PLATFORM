/**
 * HITL Approval HTTP API Routes
 * 
 * GRCD Compliance: C-8 (Human-in-the-Loop)
 * Standard: EU AI Act, ISO 42001
 * 
 * REST API for managing human approval workflows.
 */

import type { Hono } from "hono";
import {
  hitlApprovalEngine,
  type RequestApprovalOptions,
  approvalQueue,
  type QueueFilter,
} from "../../governance/hitl";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("http-approvals");

export function registerApprovalRoutes(app: Hono): void {
  /**
   * POST /approvals/request
   * Request approval for an action
   */
  app.post("/approvals/request", async (c) => {
    try {
      const body = await c.req.json<RequestApprovalOptions>();
      
      // Validate required fields
      if (!body.actionType || !body.requester || !body.tenantId || !body.description) {
        return c.json(
          {
            success: false,
            error: "Missing required fields: actionType, requester, tenantId, description",
          },
          400
        );
      }

      const requestId = await hitlApprovalEngine.requestApproval(body);

      return c.json({
        success: true,
        data: {
          requestId,
          message: requestId.startsWith("auto-approved-")
            ? "Action auto-approved (low risk)"
            : "Approval request created",
        },
      });
    } catch (error) {
      logger.error("Failed to request approval", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to request approval",
        },
        500
      );
    }
  });

  /**
   * POST /approvals/:requestId/approve
   * Approve an action
   */
  app.post("/approvals/:requestId/approve", async (c) => {
    try {
      const requestId = c.req.param("requestId");
      const body = await c.req.json<{ approverId: string; reason: string }>();

      if (!body.approverId || !body.reason) {
        return c.json(
          {
            success: false,
            error: "Missing required fields: approverId, reason",
          },
          400
        );
      }

      await hitlApprovalEngine.approveAction(requestId, body.approverId, body.reason);

      return c.json({
        success: true,
        message: "Action approved",
      });
    } catch (error) {
      logger.error("Failed to approve action", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to approve action",
        },
        500
      );
    }
  });

  /**
   * POST /approvals/:requestId/reject
   * Reject an action
   */
  app.post("/approvals/:requestId/reject", async (c) => {
    try {
      const requestId = c.req.param("requestId");
      const body = await c.req.json<{ approverId: string; reason: string }>();

      if (!body.approverId || !body.reason) {
        return c.json(
          {
            success: false,
            error: "Missing required fields: approverId, reason",
          },
          400
        );
      }

      await hitlApprovalEngine.rejectAction(requestId, body.approverId, body.reason);

      return c.json({
        success: true,
        message: "Action rejected",
      });
    } catch (error) {
      logger.error("Failed to reject action", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to reject action",
        },
        500
      );
    }
  });

  /**
   * POST /approvals/:requestId/cancel
   * Cancel an approval request
   */
  app.post("/approvals/:requestId/cancel", async (c) => {
    try {
      const requestId = c.req.param("requestId");
      const body = await c.req.json<{ reason: string }>();

      if (!body.reason) {
        return c.json(
          {
            success: false,
            error: "Missing required field: reason",
          },
          400
        );
      }

      await hitlApprovalEngine.cancelRequest(requestId, body.reason);

      return c.json({
        success: true,
        message: "Approval request canceled",
      });
    } catch (error) {
      logger.error("Failed to cancel request", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to cancel request",
        },
        500
      );
    }
  });

  /**
   * GET /approvals/pending
   * Get pending approvals (optionally filtered by approver)
   */
  app.get("/approvals/pending", async (c) => {
    try {
      const approverId = c.req.query("approverId");
      const pending = hitlApprovalEngine.getPendingApprovals(approverId);

      return c.json({
        success: true,
        data: {
          count: pending.length,
          requests: pending,
        },
      });
    } catch (error) {
      logger.error("Failed to get pending approvals", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get pending approvals",
        },
        500
      );
    }
  });

  /**
   * GET /approvals/:requestId
   * Get approval request details
   */
  app.get("/approvals/:requestId", async (c) => {
    try {
      const requestId = c.req.param("requestId");
      const request = hitlApprovalEngine.getRequest(requestId);

      if (!request) {
        return c.json(
          {
            success: false,
            error: "Approval request not found",
          },
          404
        );
      }

      return c.json({
        success: true,
        data: request,
      });
    } catch (error) {
      logger.error("Failed to get approval request", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get approval request",
        },
        500
      );
    }
  });

  /**
   * GET /approvals/stats
   * Get approval queue statistics
   */
  app.get("/approvals/stats", async (c) => {
    try {
      const stats = hitlApprovalEngine.getStats();

      return c.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error("Failed to get approval stats", {
        error: error instanceof Error ? error.message : String(error),
      });
      
      return c.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get approval stats",
        },
        500
      );
    }
  });

  logger.info("Approval routes registered", {
    routes: [
      "POST /approvals/request",
      "POST /approvals/:requestId/approve",
      "POST /approvals/:requestId/reject",
      "POST /approvals/:requestId/cancel",
      "GET /approvals/pending",
      "GET /approvals/:requestId",
      "GET /approvals/stats",
    ],
  });
}

