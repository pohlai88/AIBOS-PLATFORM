/**
 * Secret Management Routes
 * 
 * REST API for secret rotation and monitoring
 */

import type { Hono } from "hono";
import { z } from "zod";
import { validateParams, validateJsonBody, getValidParams } from "../middleware/validation";
import { secretManager } from "../security/secret-rotation/secret.manager";
import { AutoRotationService } from "../security/secret-rotation/auto-rotation.service";

const SecretTypeParams = z.object({
  secretType: z.enum(["jwt", "api_key", "db_password", "encryption_key"]),
});

/**
 * Register secret management routes
 */
export function registerSecretRoutes(app: Hono) {
  // GET /secrets/status - Get status of all secrets
  app.get("/secrets/status", async (c) => {
    // Get auto-rotation service instance
    const autoRotation = AutoRotationService.getInstance(secretManager);
    const alerts = autoRotation.getExpirationAlerts();

    return c.json({
      alerts: alerts.map((alert) => ({
        secretType: alert.secretType,
        expiresAt: alert.expiresAt.toISOString(),
        daysUntilExpiration: alert.daysUntilExpiration,
        alertLevel: alert.alertLevel,
      })),
      timestamp: new Date().toISOString(),
    });
  });

  // POST /secrets/:secretType/rotate - Manually rotate a secret
  app.post(
    "/secrets/:secretType/rotate",
    validateParams(SecretTypeParams),
    async (c) => {
      const { secretType } = getValidParams<z.infer<typeof SecretTypeParams>>(c);
      const body = await c.req.json<{ tenantId?: string }>().catch(() => ({}));

      const autoRotation = AutoRotationService.getInstance(secretManager);
      const result = await autoRotation.rotateSecret(
        secretType,
        body.tenantId || "system"
      );

      if (result.success) {
        return c.json({
          success: true,
          message: `Secret ${secretType} rotated successfully`,
          nextRotationAt: autoRotation.getNextRotationTime(secretType)?.toISOString(),
        });
      } else {
        return c.json(
          {
            success: false,
            error: result.error,
          },
          400
        );
      }
    }
  );

  // GET /secrets/:secretType/expiration - Get expiration info for a secret
  app.get(
    "/secrets/:secretType/expiration",
    validateParams(SecretTypeParams),
    async (c) => {
      const { secretType } = getValidParams<z.infer<typeof SecretTypeParams>>(c);
      const autoRotation = AutoRotationService.getInstance(secretManager);
      const nextRotation = autoRotation.getNextRotationTime(secretType);

      const alerts = autoRotation.getExpirationAlerts();
      const alert = alerts.find((a) => a.secretType === secretType);

      return c.json({
        secretType,
        nextRotationAt: nextRotation?.toISOString() || null,
        alert: alert
          ? {
              expiresAt: alert.expiresAt.toISOString(),
              daysUntilExpiration: alert.daysUntilExpiration,
              alertLevel: alert.alertLevel,
            }
          : null,
      });
    }
  );
}

