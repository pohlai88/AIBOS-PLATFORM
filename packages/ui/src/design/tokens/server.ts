/**
 * Server-Only Design Tokens - Next.js MCP Guardian
 *
 * Tokens that are safe to use in Server Components
 * These tokens do not require client-side JavaScript
 *
 * MCP Architecture:
 * - Next.js MCP: Guardian of server/client token boundaries
 * - Figma MCP: Main composer for design token values
 * - Tailwind MCP: Helper for CSS class generation
 */

import 'server-only'

// Re-export only safe tokens for server components (explicit, not permissive)
export {
  colorTokens,
  spacingTokens,
  radiusTokens,
  shadowTokens,
  typographyTokens,
  accessibilityTokens,
  componentTokens,
  type ColorTokenKey,
  type AccessibilityTokenKey,
  type ComponentTokenKey,
} from './tokens'

export type { TokenPath } from '../index'
import { tokenHelpers } from '../utilities/token-helpers'

// Server-specific token utilities (MCP Guardian approved)
export const serverTokens = {
  // Static color values that don't change based on user interaction
  colors: {
    static: {
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
    },
    // Server-safe semantic colors (from globals.css)
    semantic: {
      bg: 'var(--color-bg)',
      bgMuted: 'var(--color-bg-muted)',
      bgElevated: 'var(--color-bg-elevated)',
      fg: 'var(--color-fg)',
      fgMuted: 'var(--color-fg-muted)',
      fgSubtle: 'var(--color-fg-subtle)',
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      border: 'var(--color-border)',
      borderSubtle: 'var(--color-border-subtle)',
    },
  },

  // Layout tokens for server-side rendering
  layout: {
    maxWidth: '1200px',
    containerPadding: '1rem',
    headerHeight: '4rem',
    sidebarWidth: '16rem',
    contentMaxWidth: '65ch',
  },

  // Typography tokens for server-rendered content
  typography: {
    fontFamily: {
      sans: 'var(--font-sans)',
      mono: 'var(--font-mono)',
    },
    // Server-safe font sizes (no dynamic calculation)
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
  },

  // Spacing tokens (server-safe, no dynamic calculation)
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  // Radius tokens (server-safe)
  radius: {
    xs: 'var(--radius-xs)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    '2xl': 'var(--radius-2xl)',
    full: 'var(--radius-full)',
  },
}

// MCP Guardian: Server-safe token resolution
export function getServerToken(tokenPath: string): string | undefined {
  // Validate token is server-safe
  const validation = tokenHelpers.validateTokenUsage(tokenPath, 'server')

  if (!validation.isValid) {
    console.warn(
      `[MCP Guardian] Server token validation failed for '${tokenPath}':`,
      validation.violations
    )
    return undefined
  }

  // Return server-safe token value
  return tokenHelpers.getTokenValue(tokenPath)
}

// MCP Guardian: Validate server component token usage
export function validateServerTokens(componentCode: string): {
  isValid: boolean
  violations: string[]
  suggestions: string[]
} {
  const violations: string[] = []
  const suggestions: string[] = []

  // Check for client-only token usage in server components
  const clientOnlyPatterns = [
    /hover:/g,
    /active:/g,
    /focus:/g,
    /transition/g,
    /animate-/g,
  ]

  for (const pattern of clientOnlyPatterns) {
    if (pattern.test(componentCode)) {
      violations.push(`Client-only CSS pattern found: ${pattern.source}`)
      suggestions.push('Use server-safe tokens from serverTokens instead')
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    suggestions,
  }
}

// Server-specific token path type (strongly typed for MCP tools)
export type ServerTokenPath =
  | `color.${keyof typeof serverTokens.colors.semantic}`
  | `layout.${keyof typeof serverTokens.layout}`
  | `typography.${keyof typeof serverTokens.typography.fontSize}`
  | `spacing.${keyof typeof serverTokens.spacing}`
  | `radius.${keyof typeof serverTokens.radius}`

// MCP Guardian: Get all server-safe tokens (strongly typed)
export function getServerSafeTokens(): ServerTokenPath[] {
  return [
    ...Object.keys(serverTokens.colors.semantic).map(
      k => `color.${k}` as const
    ),
    ...Object.keys(serverTokens.layout).map(k => `layout.${k}` as const),
    ...Object.keys(serverTokens.typography.fontSize).map(
      k => `typography.${k}` as const
    ),
    ...Object.keys(serverTokens.spacing).map(k => `spacing.${k}` as const),
    ...Object.keys(serverTokens.radius).map(k => `radius.${k}` as const),
  ] as ServerTokenPath[]
}
