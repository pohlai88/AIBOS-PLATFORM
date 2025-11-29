/**
 * @fileoverview BFF Middleware Exports
 * @module @bff/middleware
 */

// Auth Middleware
export {
  createAuthMiddleware,
  createSystemContext,
  isSystemContext,
  type AuthContext,
  type AuthResult,
  type AuthEvents,
  type TokenValidator,
  type TokenValidationResult,
} from './auth.middleware';

// Rate Limit Middleware
export {
  createRateLimitMiddleware,
  createWsRateLimiter,
  type RateLimitResult,
} from './rate-limit.middleware';

// Headers Middleware
export {
  createRequestHeadersMiddleware,
  createResponseHeadersMiddleware,
  createCorsMiddleware,
} from './headers.middleware';

// Zone Guard Middleware
export {
  createZoneGuardMiddleware,
  extractTenantFromPath,
  canAccessTenant,
  type ZoneGuardResult,
  type ZoneGuardEvents,
} from './zone-guard.middleware';

// Audit Middleware
export {
  createAuditMiddleware,
  InMemoryAuditStore,
  type AuditEntry,
  type AuditConfig,
  type AuditStore,
  type PendingAudit,
} from './audit.middleware';

// Sanitizer Middleware
export {
  createSanitizerMiddleware,
  sanitize,
  isSafeString,
  type SanitizeResult,
  type ValidateResult,
  type SanitizerConfig,
} from './sanitizer.middleware';

// AI Firewall Middleware
export {
  createAIFirewall,
  type FirewallResult,
  type FirewallContext,
  type FirewallConfig,
  type AIFirewall,
} from './ai-firewall.middleware';

// Error Format
export {
  standardError,
  createErrorFactory,
  parseErrorResponse,
  isErrorResponse,
  jsonRpcError,
  mcpError,
  llmError,
  streamingError,
  type StandardError,
  type ErrorOptions,
} from './error-format';

// Middleware Composer
export {
  createMiddlewareStack,
  type MiddlewareContext,
  type MiddlewareResult,
  type MiddlewareStack,
} from './compose.middleware';
