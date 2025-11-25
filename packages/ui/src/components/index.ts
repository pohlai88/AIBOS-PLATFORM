/**
 * AI-BOS UI Components - Clean Slate Architecture
 *
 * Next.js MCP Compliant Component System
 * - Server Components (RSC-optimized)
 * - Client Components (Interactive)
 * - Shared Components (Universal)
 *
 * @version 2.0.0 - Complete Rebuild
 * @architecture Next.js 16+ App Router
 * @mcp-ready Full MCP validation and compliance
 * @rsc-safe Server/Client boundary enforcement
 */

// Server Components (default exports - RSC optimized)
export * from './server'
export * from './shared'

// Client Components (named exports with clear indication)
export * as ClientComponents from './client'

// Re-export design utilities for convenience
export { cn } from '../design/utilities/cn'
export { tokenHelpers } from '../design/utilities/token-helpers'

// Note: Individual components will be built incrementally using:
// - Modern Next.js 16+ patterns
// - Professional token system
// - MCP validation built-in
// - Zero technical debt approach
