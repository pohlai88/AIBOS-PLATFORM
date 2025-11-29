// security/policy.middleware.ts
import type { Context, Next } from "hono";
import { engineRegistry } from "../registry/engine.loader";

export async function policyMiddleware(c: Context, next: Next) {
  const domain = c.req.param("domain");
  const action = c.req.param("action");

  if (!domain || !action) {
    return c.json({ error: "Invalid action path" }, 400);
  }

  const actionId = `${domain}.${action}`;

  const actionMeta = engineRegistry.getAction(actionId);
  if (!actionMeta) {
    return c.json({ error: "Action not found" }, 404);
  }

  const contract = actionMeta.contract;
  const principal = c.get("user");

  const requiredPermissions = contract.permissions ?? [];
  const userPermissions: string[] = principal?.permissions ?? [];

  const allow =
    userPermissions.includes("*") ||
    requiredPermissions.every((p) => userPermissions.includes(p));

  if (!allow) {
    return c.json(
      { error: "Forbidden", required: requiredPermissions },
      403
    );
  }

  c.set("securityContext", {
    principal,
    tenantId: c.req.header("x-tenant-id") ?? null,
    contract,
    actionId,
  });

  await next();
}

