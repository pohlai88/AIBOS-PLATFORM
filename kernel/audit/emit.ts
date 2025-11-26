import { logAudit } from "./audit.logger";

export function emitKernelEvent(action: string, details?: any) {
  logAudit({
    category: "kernel",
    actor: "kernel",
    severity: "info",
    action,
    details,
  });
}

export function emitEngineEvent(engine: string, action: string, details?: any) {
  logAudit({
    category: "engine",
    actor: engine,
    severity: "info",
    action,
    details,
  });
}

export function emitTenantEvent(tenantId: string, action: string, details?: any) {
  logAudit({
    category: "tenant",
    actor: tenantId,
    severity: "info",
    action,
    details,
  });
}

