/**
 * Design Token Utilities - MCP Guardian Implementation
 *
 * Next.js MCP: Guardian of token validation and architecture compliance
 * Figma MCP: Main composer for design token definitions
 * Tailwind MCP: Helper for CSS class generation and compliance
 * React MCP: Helper for component token usage validation
 *
 * @rsc-safe All functions work in Server Components
 * @mcp-ready Validated for MCP integration and rule enforcement
 */

import type { TokenCategory, TokenLayer } from '../../../mcp/types/mcp'
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typographyTokens,
  componentTokens,
} from '../tokens/tokens'

// Severity levels for MCP rule enforcement (literal union for type safety)
export type Severity = 'forbidden' | 'warning' | 'safe' | 'unknown'

// Token context for debugging and MCP integration
export interface TokenContext {
  token: string
  tokenType: string
  layer: 'server' | 'client' | 'shared'
  source?: string
  line?: number
  column?: number
}

// Enhanced validation result with MCP context
export interface TokenValidationResult {
  isValid: boolean
  severity: Severity
  context: TokenContext
  message: string
  suggestions: string[]
  violations: string[]
}

// Batch validation result for MCP linters
export interface BatchValidationResult {
  results: TokenValidationResult[]
  summary: {
    total: number
    forbidden: number
    warnings: number
    safe: number
    unknown: number
  }
}

// Token path type for type safety
export type TokenPath =
  | `${TokenCategory}.${string}`
  | `${TokenLayer}.${TokenCategory}.${string}`

// Known CSS variables from globals.css (MCP Guardian Registry)
// Synced with packages/ui/src/design/tokens/globals.css
const KNOWN_CSS_VARIABLES = {
  // Color tokens - Base surfaces & text
  '--color-bg': '#f9fafb',
  '--color-bg-muted': '#f3f4f6',
  '--color-bg-elevated': '#ffffff',
  '--color-fg': '#111827',
  '--color-fg-muted': '#6b7280',
  '--color-fg-subtle': '#9ca3af',

  // Brand colors with soft variants
  '--color-primary': '#2563eb',
  '--color-primary-soft': 'rgba(37, 99, 235, 0.12)',
  '--color-primary-foreground': '#f9fafb',
  '--color-secondary': '#1d4ed8',
  '--color-secondary-soft': 'rgba(29, 78, 216, 0.10)',
  '--color-secondary-foreground': '#f9fafb',

  // Border & ring colors
  '--color-border': '#e5e7eb',
  '--color-border-subtle': '#f3f4f6',
  '--color-ring': '#2563eb',

  // Status colors with soft variants (WCAG compliant)
  '--color-success': '#16a34a',
  '--color-success-soft': 'rgba(22, 163, 74, 0.10)',
  '--color-success-foreground': '#f9fafb',
  '--color-warning': '#f59e0b',
  '--color-warning-soft': 'rgba(245, 158, 11, 0.12)',
  '--color-warning-foreground': '#111827',
  '--color-danger': '#dc2626',
  '--color-danger-soft': 'rgba(220, 38, 38, 0.10)',
  '--color-danger-foreground': '#f9fafb',

  // Radius tokens (rem units to match globals.css)
  '--radius-xs': '0.25rem',
  '--radius-sm': '0.375rem',
  '--radius-md': '0.5rem',
  '--radius-lg': '0.5rem',
  '--radius-xl': '0.75rem',
  '--radius-2xl': '1rem',
  '--radius-full': '9999px',

  // Shadow tokens (updated to match globals.css)
  '--shadow-xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  '--shadow-sm':
    '0 1px 3px 0 rgb(0 0 0 / 0.10), 0 1px 2px -1px rgb(0 0 0 / 0.10)',
  '--shadow-md': '0 6px 16px 0 rgb(15 23 42 / 0.08)',
  '--shadow-lg': '0 14px 32px 0 rgb(15 23 42 / 0.16)',

  // Layout tokens
  '--sidebar-width': '16rem',
  '--topbar-height': '3.5rem',

  // Font tokens
  '--font-sans': 'Inter, ui-sans-serif, system-ui, sans-serif',
  '--font-mono':
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',

  // Extended spacing tokens
  '--spacing-8xl': '90rem',
  '--spacing-9xl': '105rem',
  '--spacing-10xl': '120rem',
} as const

// MCP Guardian: Token validation utilities
export const tokenHelpers = {
  /**
   * Next.js MCP Guardian: Validate if a token exists in the design system
   */
  isValidToken(tokenPath: string): boolean {
    const cssVar = this.getCSSVariable(tokenPath)
    return cssVar in KNOWN_CSS_VARIABLES
  },

  /**
   * Tailwind MCP Helper: Get the CSS variable name for a token
   */
  getCSSVariable(tokenPath: string): string {
    // Convert token path to CSS variable format
    // e.g., "color.primary" -> "--color-primary"
    return `--${tokenPath.replace(/\./g, '-')}`
  },

  /**
   * Next.js MCP Guardian: Get the computed value of a token
   */
  getTokenValue(tokenPath: string): string | undefined {
    const cssVar = this.getCSSVariable(tokenPath)
    return KNOWN_CSS_VARIABLES[cssVar as keyof typeof KNOWN_CSS_VARIABLES]
  },

  /**
   * React MCP Helper: Validate token usage against constitution rules
   * @server-only Safe for Server Components
   */
  validateTokenUsage(
    tokenPath: string,
    context: 'server' | 'client' | 'shared',
    source?: string,
    line?: number,
    column?: number
  ): TokenValidationResult {
    const violations: string[] = []
    const suggestions: string[] = []
    let severity: Severity = 'safe'

    // Determine token type for context
    const tokenType = tokenPath.split('.')[0] || 'unknown'

    // Check if token exists
    if (!this.isValidToken(tokenPath)) {
      violations.push(`Token '${tokenPath}' does not exist in design system`)
      suggestions.push(
        'Use tokens from the KNOWN_CSS_VARIABLES registry: color, radius, shadow, spacing, layout, or font tokens'
      )
      severity = 'forbidden'
    }

    // Check context-specific rules
    if (context === 'server' && tokenPath.includes('interactive')) {
      violations.push(
        'Interactive tokens should not be used in Server Components'
      )
      suggestions.push('Use static tokens for server-side rendering')
      severity = 'forbidden'
    }

    // Validate soft color variants for SSR
    if (tokenPath.includes('-soft') && context === 'server') {
      violations.push('Soft color variants may cause hydration issues in SSR')
      suggestions.push(
        'Consider using solid colors for better SSR performance, or ensure proper client-side hydration'
      )
      severity = violations.length > 0 ? 'warning' : severity
    }

    // Validate modern CSS features
    const tokenValue = this.getTokenValue(tokenPath)
    if (tokenValue?.includes('color-mix') && context === 'server') {
      violations.push(
        'color-mix() CSS function may not be supported in all SSR environments'
      )
      suggestions.push(
        'Ensure fallback values are provided for color-mix() usage'
      )
      severity = 'warning'
    }

    // Validate layout tokens usage
    if (
      (tokenPath.includes('-width') || tokenPath.includes('-height')) &&
      context === 'server'
    ) {
      suggestions.push(
        'Layout tokens are safe for SSR but ensure responsive behavior is handled properly'
      )
    }

    // Determine final severity
    if (violations.length > 0) {
      severity = severity === 'safe' ? 'warning' : severity
    }

    const tokenContext: TokenContext = {
      token: tokenPath,
      tokenType,
      layer: context,
      source,
      line,
      column,
    }

    return {
      isValid: violations.length === 0,
      severity,
      context: tokenContext,
      message:
        violations.length > 0
          ? `Token validation failed: ${violations.join(', ')}`
          : `Token '${tokenPath}' is valid for ${context} usage`,
      violations,
      suggestions,
    }
  },

  /**
   * Figma MCP Composer: Get all tokens in a category
   */
  getTokensByCategory(category: TokenCategory): string[] {
    const allTokens = Object.keys(KNOWN_CSS_VARIABLES)

    switch (category) {
      case 'color':
        return allTokens.filter(token => token.startsWith('--color-'))
      case 'radius':
        return allTokens.filter(token => token.startsWith('--radius-'))
      case 'shadow':
        return allTokens.filter(token => token.startsWith('--shadow-'))
      case 'spacing':
        return allTokens.filter(token => token.startsWith('--spacing-'))
      case 'layout':
        return allTokens.filter(
          token => token.includes('-width') || token.includes('-height')
        )
      case 'font':
        return allTokens.filter(token => token.startsWith('--font-'))
      case 'typography':
        return Object.keys(typographyTokens)
      default:
        return []
    }
  },

  /**
   * Next.js MCP Guardian: Get all tokens in a layer
   */
  getTokensByLayer(layer: TokenLayer): string[] {
    const allTokens = Object.keys(KNOWN_CSS_VARIABLES)

    switch (layer) {
      case 'global':
        return allTokens
      case 'semantic':
        return allTokens.filter(
          token =>
            token.startsWith('--color-') ||
            token.startsWith('--radius-') ||
            token.startsWith('--shadow-')
        )
      case 'component':
        return Object.keys(componentTokens)
      case 'utility':
        return allTokens.filter(
          token =>
            token.startsWith('--spacing-') ||
            token.startsWith('--font-') ||
            token.includes('-width') ||
            token.includes('-height')
        )
      default:
        return []
    }
  },

  /**
   * Constitution Guardian: Check if a token is tenant-overridable
   */
  isTenantOverridable(tokenPath: string): boolean {
    // Primary and secondary colors are tenant-overridable
    // WCAG compliance colors are NOT tenant-overridable
    const overridableTokens = [
      'color.primary',
      'color.secondary',
      'color.bg',
      'color.bg-muted',
      'color.bg-elevated',
    ]
    return overridableTokens.includes(tokenPath)
  },

  /**
   * Constitution Guardian: Check if a token is immutable
   */
  isImmutable(tokenPath: string): boolean {
    // WCAG compliance tokens are immutable
    // Status colors are immutable
    const immutableTokens = [
      'color.success',
      'color.warning',
      'color.danger',
      'color.success-foreground',
      'color.warning-foreground',
      'color.danger-foreground',
    ]
    return immutableTokens.includes(tokenPath)
  },

  /**
   * MCP Guardian: Validate entire token system integrity
   */
  validateTokenSystem(): {
    isValid: boolean
    errors: string[]
    warnings: string[]
    summary: {
      totalTokens: number
      validTokens: number
      invalidTokens: number
      tenantOverridable: number
      immutable: number
    }
  } {
    const errors: string[] = []
    const warnings: string[] = []
    let validTokens = 0
    let invalidTokens = 0
    let tenantOverridable = 0
    let immutable = 0

    // Generate token paths from KNOWN_CSS_VARIABLES
    const allTokenPaths = Object.keys(KNOWN_CSS_VARIABLES).map(cssVar => {
      // Convert CSS variable to token path format
      // e.g., "--color-primary" -> "color.primary"
      return cssVar.substring(2).replace(/-/g, '.')
    })

    for (const tokenPath of allTokenPaths) {
      if (this.isValidToken(tokenPath)) {
        validTokens++
      } else {
        invalidTokens++
        errors.push(`Invalid token: ${tokenPath}`)
      }

      if (this.isTenantOverridable(tokenPath)) {
        tenantOverridable++
      }

      if (this.isImmutable(tokenPath)) {
        immutable++
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary: {
        totalTokens: allTokenPaths.length,
        validTokens,
        invalidTokens,
        tenantOverridable,
        immutable,
      },
    }
  },

  /**
   * Batch validation for MCP linters - validates multiple tokens at once
   * @param tokens Array of token paths to validate
   * @param context Validation context (server/client/shared)
   * @param source Optional source file path for debugging
   * @returns Batch validation result with summary
   * @server-only Safe for Server Components
   */
  validateTokens(
    tokens: string[],
    context: 'server' | 'client' | 'shared',
    source?: string
  ): BatchValidationResult {
    const results: TokenValidationResult[] = []
    const summary = {
      total: tokens.length,
      forbidden: 0,
      warnings: 0,
      safe: 0,
      unknown: 0,
    }

    for (const token of tokens) {
      const result = this.validateTokenUsage(token, context, source)
      results.push(result)

      // Update summary counts
      if (result.severity === 'forbidden') summary.forbidden++
      else if (result.severity === 'warning') summary.warnings++
      else if (result.severity === 'safe') summary.safe++
      else summary.unknown++
    }

    return {
      results,
      summary,
    }
  },
}

export default tokenHelpers
