/**
 * Central export hub for design-system utilities.
 * These utilities are environment-agnostic and safe for both RSC + Client usage.
 *
 * @module DesignUtilities
 * @version 1.0.0
 * @mcp-ready All exports validated for MCP integration
 * @rsc-safe All utilities work in Server Components
 */

// IMPORTANT:
// Do NOT import server.ts or client.ts here.
// Utilities MUST remain environment-agnostic.

export { cn } from './cn'
export { tokenHelpers } from './token-helpers'
export type {
  TokenValidationResult,
  TokenContext,
  BatchValidationResult,
  Severity,
} from './token-helpers'
