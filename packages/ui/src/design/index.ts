// packages/ui/src/design/index.ts
// Environment-agnostic design tokens entrypoint (no 'use client', no React)

export {
  colorTokens,
  spacingTokens,
  radiusTokens,
  shadowTokens,
  typographyTokens,
  accessibilityTokens,
  componentTokens,
  // types
  type ColorTokenKey,
  type AccessibilityTokenKey,
  type ComponentTokenKey,
} from './tokens/tokens'

// Shared token path types for MCP validation
export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'typography'
  | 'radius'
  | 'shadow'
  | 'component'
  | 'accessibility'

// Shared token path type - used by both server.ts and client.ts
export type TokenPath =
  | `color.${keyof typeof import('./tokens/tokens').colorTokens}`
  | `spacing.${keyof typeof import('./tokens/tokens').spacingTokens}`
  | `typography.${keyof typeof import('./tokens/tokens').typographyTokens}`
  | `radius.${keyof typeof import('./tokens/tokens').radiusTokens}`
  | `shadow.${keyof typeof import('./tokens/tokens').shadowTokens}`
  | `component.${keyof typeof import('./tokens/tokens').componentTokens}`
  | `accessibility.${keyof typeof import('./tokens/tokens').accessibilityTokens}`

// Design utilities (environment-agnostic)
export { cn } from './utilities/cn'

// NOTE:
// - Do NOT export anything from './tokens/client' or './tokens/server' here.
// - This index must remain safe for both server and client bundles.
// - Use @aibos/ui/design/server or @aibos/ui/design/client for specialized tokens.
// - tokenHelpers are not exported here as they may have environment-specific logic
