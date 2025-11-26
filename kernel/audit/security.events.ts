import { logAudit } from "./audit.logger";

// Sandbox violation
export function logSandboxViolation(actor: string, reason: string) {
  logAudit({
    category: "security",
    severity: "critical",
    actor,
    action: "sandbox.violation",
    details: { reason },
  });
}

// Rate limiting
export function logRateLimit(actor: string, limit: string) {
  logAudit({
    category: "security",
    severity: "warn",
    actor,
    action: "ratelimit.exceeded",
    details: { limit },
  });
}

// Circuit breaker
export function logCircuitBreaker(engine: string) {
  logAudit({
    category: "security",
    severity: "error",
    actor: engine,
    action: "engine.circuitbreaker",
    details: null,
  });
}

// Unauthorized access
export function logUnauthorizedAccess(actor: string, resource: string) {
  logAudit({
    category: "security",
    severity: "critical",
    actor,
    action: "unauthorized.access",
    details: { resource },
  });
}

// Contract validation failure
export function logContractViolation(engine: string, errors: string[]) {
  logAudit({
    category: "security",
    severity: "error",
    actor: engine,
    action: "contract.violation",
    details: { errors },
  });
}

