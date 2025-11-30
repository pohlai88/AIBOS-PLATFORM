/**
 * Shared Components - Universal
 *
 * Components that work in both Server and Client environments
 * - No 'use client' directive
 * - No browser APIs
 * - Accept event handlers as props
 * - No React hooks
 * - Environment-agnostic
 */

// Basic UI building blocks
export * from './primitives'

// Text and content components
export * from './typography'

// Note: Components will be built incrementally
// Each component will be:
// - Environment-agnostic
// - MCP-validated
// - Token-compliant
// - Type-safe
// - RSC-compatible
