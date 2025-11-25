/**
 * Server Components - RSC Optimized
 *
 * Components that run exclusively on the server
 * - No 'use client' directive
 * - No browser APIs
 * - No event handlers
 * - No React hooks
 * - Async components allowed
 * - Direct data fetching allowed
 */

// Data-fetching components
export * from './data'

// Static display components
export * from './display'

// Layout components
export * from './layout'

// Note: Components will be built incrementally
// Each component will be:
// - RSC-safe by default
// - MCP-validated
// - Token-compliant
// - Type-safe
