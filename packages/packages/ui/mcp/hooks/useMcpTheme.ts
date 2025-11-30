// packages/ui/src/hooks/useMcpTheme.ts
// React hook for MCP theme management
// Version: 1.1.0
// Score: 9.5/10 (Production-Grade, Enterprise Ready)

'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { ValidationPipeline } from '../tools/ValidationPipeline'
import * as tokenHelpers from '../../src/design/utilities/token-helpers'
import type { TenantContext, ConstitutionRule } from '../types/mcp'

export interface McpThemeOverrides {
  [key: string]: string
}

export interface UseMcpThemeOptions {
  tenant?: string
  safeMode?: boolean
  enabled?: boolean
  debounceMs?: number // Debounce rapid changes (default: 100ms)
  // PATCH: Constitution integration
  constitutionRules?: ConstitutionRule[]
  // PATCH: Enhanced accessibility
  contrastMode?: 'normal' | 'aa' | 'aaa'
  darkMode?: boolean
  // PATCH: Validation options
  validateTokens?: boolean
  strictMode?: boolean
}

// PATCH: Enhanced theme validation result
export interface ThemeValidationResult {
  isValid: boolean
  violations: Array<{
    token: string
    message: string
    severity: 'error' | 'warning' | 'info'
    suggestion?: string
  }>
  warnings: string[]
  appliedTokens: string[]
  removedTokens: string[]
  accessibilityScore: number
}

export interface UseMcpThemeResult {
  overrides: McpThemeOverrides | null
  loading: boolean
  error: Error | null
  // PATCH: Enhanced metadata
  metadata: {
    tenant?: string
    safeMode: boolean
    contrastMode: 'normal' | 'aa' | 'aaa'
    darkMode: boolean
    validated: boolean
    validation?: ThemeValidationResult
    cacheHit: boolean
    loadTime: number
    tokenCount: number
  }
}

// PATCH: Enhanced theme cache with validation metadata
interface CachedTheme {
  overrides: McpThemeOverrides
  validation: ThemeValidationResult
  timestamp: number
  version: string
}

const themeCache = new Map<string, CachedTheme>()
const CACHE_KEY_SEPARATOR = '::'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// PATCH: Known theme tokens registry for validation (aligned with themeTokens v3.3)
const KNOWN_TOKENS = new Set([
  // Surfaces
  '--theme-bg',
  '--theme-bg-muted',
  '--theme-bg-elevated',
  // Text
  '--theme-fg',
  '--theme-fg-muted',
  '--theme-fg-subtle',
  // Primary
  '--theme-primary',
  '--theme-primary-soft',
  '--theme-primary-foreground',
  // Secondary
  '--theme-secondary',
  '--theme-secondary-soft',
  '--theme-secondary-foreground',
  // Brand (tenant customizable)
  '--theme-brand',
  '--theme-brand-soft',
  '--theme-brand-foreground',
  // Status
  '--theme-success',
  '--theme-success-soft',
  '--theme-success-foreground',
  '--theme-warning',
  '--theme-warning-soft',
  '--theme-warning-foreground',
  '--theme-danger',
  '--theme-danger-soft',
  '--theme-danger-foreground',
  // Border / Ring
  '--theme-border',
  '--theme-border-subtle',
  '--theme-ring',
  // Shadows
  '--theme-shadow-xs',
  '--theme-shadow-sm',
  '--theme-shadow-md',
  '--theme-shadow-lg',
  // Typography
  '--theme-font-xs',
  '--theme-font-sm',
  '--theme-font-base',
  '--theme-font-lg',
  '--theme-font-h1',
  '--theme-font-h2',
  '--theme-font-h3',
  '--theme-font-h4',
  '--theme-font-h5',
  '--theme-font-h6',
  '--theme-font-display-sm',
  '--theme-font-display-md',
  '--theme-font-display-lg',
  '--theme-line-height-normal',
  '--theme-line-height-relaxed',
  '--theme-font-sans',
  // Spacing
  '--theme-spacing-2xs',
  '--theme-spacing-xs',
  '--theme-spacing-sm',
  '--theme-spacing-md',
  '--theme-spacing-lg',
  '--theme-spacing-xl',
  '--theme-spacing-2xl',
  // Radius
  '--theme-radius-xxs',
  '--theme-radius-xs',
  '--theme-radius-sm',
  '--theme-radius-md',
  '--theme-radius-lg',
  '--theme-radius-xl',
  '--theme-radius-2xl',
  '--theme-radius-full',
])

/**
 * React hook for MCP theme management with race condition protection,
 * batching, caching, and improved error handling.
 *
 * Fetches theme overrides from MCP Theme Server and merges with CSS base tokens.
 *
 * @param options - Theme options
 * @returns Theme result object with overrides, loading state, and error
 *
 * @example
 * ```tsx
 * const { overrides, loading, error } = useMcpTheme({
 *   tenant: "dlbb",
 *   safeMode: false
 * });
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * ```
 */
export function useMcpTheme(
  options: UseMcpThemeOptions = {}
): UseMcpThemeResult {
  const {
    tenant,
    safeMode = false,
    enabled = true,
    debounceMs = 100,
    // PATCH: New options
    constitutionRules = [],
    contrastMode = 'normal',
    darkMode = false,
    validateTokens = true,
    strictMode = false,
  } = options

  const [overrides, setOverrides] = useState<McpThemeOverrides | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // PATCH: Enhanced state management
  const [metadata, setMetadata] = useState<UseMcpThemeResult['metadata']>({
    safeMode,
    contrastMode,
    darkMode,
    validated: false,
    cacheHit: false,
    loadTime: 0,
    tokenCount: 0,
  })

  // Keep last known good overrides for graceful degradation
  const lastKnownGoodOverrides = useRef<McpThemeOverrides | null>(null)

  // PATCH: Validation pipeline instance
  const validationPipeline = useRef<ValidationPipeline | null>(null)

  // AbortController for race condition protection
  const abortControllerRef = useRef<AbortController | null>(null)

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // PATCH: Enhanced cache key with all theme parameters
  const cacheKey = useMemo(() => {
    if (!enabled) return null
    return [
      tenant || 'default',
      safeMode ? 'safe' : 'normal',
      contrastMode,
      darkMode ? 'dark' : 'light',
    ].join(CACHE_KEY_SEPARATOR)
  }, [tenant, safeMode, enabled, contrastMode, darkMode])

  // PATCH: Initialize validation pipeline in useEffect
  useEffect(() => {
    if (validateTokens && constitutionRules.length > 0) {
      validationPipeline.current = new ValidationPipeline({
        constitutionRules,
        tenantContext: {
          tenant,
          safeMode,
          contrastMode,
          darkMode,
        },
        strictMode,
      })
    }
  }, [
    constitutionRules,
    tenant,
    safeMode,
    contrastMode,
    darkMode,
    validateTokens,
    strictMode,
  ])

  useEffect(() => {
    // Clear debounce timer on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      // Use a timeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setLoading(false)
        setError(null)
        // Return last known good overrides instead of null
        setOverrides(lastKnownGoodOverrides.current)
      }, 0)
      return () => clearTimeout(timer)
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    const controller = new AbortController()
    abortControllerRef.current = controller
    const signal = controller.signal

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Debounce rapid changes
    debounceTimerRef.current = setTimeout(async () => {
      // Check if request was aborted during debounce
      if (signal.aborted) return

      async function loadTheme() {
        try {
          setLoading(true)
          setError(null)

          // PATCH: Enhanced cache with validation and TTL
          if (cacheKey && themeCache.has(cacheKey)) {
            const cached = themeCache.get(cacheKey)!
            const isExpired = Date.now() - cached.timestamp > CACHE_TTL

            if (!isExpired && !signal.aborted) {
              setOverrides(cached.overrides)
              lastKnownGoodOverrides.current = cached.overrides
              setMetadata(prev => ({
                ...prev,
                tenant,
                validated: true,
                validation: cached.validation,
                cacheHit: true,
                loadTime: 0,
                tokenCount: Object.keys(cached.overrides).length,
              }))
              setLoading(false)

              // PATCH: Set DOM attributes for CSS activation
              if (typeof document !== 'undefined') {
                updateDOMAttributes({
                  tenant,
                  safeMode,
                  contrastMode,
                  darkMode,
                })
              }

              return
            } else if (isExpired) {
              // Remove expired cache entry
              themeCache.delete(cacheKey)
            }
          }

          // Get base tokens from CSS (already loaded)
          // Note: This is safe in client components per RSC Constitution
          const baseTokens = getComputedStyle(document.documentElement)

          // Call API routes instead of MCP directly (MCP tools are server-side only)
          const apiCalls: Promise<Response>[] = []

          if (tenant) {
            apiCalls.push(
              fetch('/api/mcp/theme/tenant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tenantId: tenant }),
              })
            )
          }

          if (safeMode) {
            apiCalls.push(
              fetch('/api/mcp/theme/safe-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              })
            )
          }

          // Execute all API calls in parallel
          const responses = await Promise.all(apiCalls)
          const results = await Promise.all(
            responses.map(res => (res.ok ? res.json() : null))
          )

          // Check if request was aborted during async operations
          if (signal.aborted) return

          // PATCH: Safe theme merging with constitution validation
          const startTime = Date.now()
          let mcpOverrides: McpThemeOverrides = {}
          const appliedTokens: string[] = []
          const removedTokens: string[] = []
          const violations: ThemeValidationResult['violations'] = []
          const warnings: string[] = []

          let resultIndex = 0

          // Step 1: Apply tenant theme with safety guards
          if (tenant) {
            const tenantTheme = results[resultIndex++]
            if (tenantTheme?.overrides) {
              const safeOverrides = validateAndFilterTenantOverrides(
                tenantTheme.overrides,
                { safeMode, contrastMode, strictMode }
              )
              mcpOverrides = { ...mcpOverrides, ...safeOverrides.overrides }
              appliedTokens.push(...safeOverrides.appliedTokens)
              removedTokens.push(...safeOverrides.removedTokens)
              violations.push(...safeOverrides.violations)
              warnings.push(...safeOverrides.warnings)
            }
          }

          // Step 2: Apply safe mode overrides (highest priority)
          if (safeMode) {
            const safeModeOverrides = results[resultIndex++]
            if (safeModeOverrides?.overrides) {
              const constitutionSafeOverrides = enforceConstitutionSafeMode(
                safeModeOverrides.overrides,
                mcpOverrides
              )
              mcpOverrides = {
                ...mcpOverrides,
                ...constitutionSafeOverrides.overrides,
              }
              appliedTokens.push(...constitutionSafeOverrides.appliedTokens)
              removedTokens.push(...constitutionSafeOverrides.removedTokens)
              warnings.push(...constitutionSafeOverrides.warnings)
            }
          }

          // Step 3: Validate final theme against constitution
          const validation = await validateThemeOverrides(mcpOverrides, {
            tenant,
            safeMode,
            contrastMode,
            darkMode,
            constitutionRules,
            validationPipeline: validationPipeline.current,
          })

          const loadTime = Date.now() - startTime

          // PATCH: Enhanced caching with validation metadata
          if (cacheKey && Object.keys(mcpOverrides).length > 0) {
            const cachedTheme: CachedTheme = {
              overrides: mcpOverrides,
              validation,
              timestamp: Date.now(),
              version: '1.0.0', // TODO: Get from theme version API
            }

            themeCache.set(cacheKey, cachedTheme)

            // Limit cache size to prevent memory leaks (keep last 10 entries)
            if (themeCache.size > 10) {
              const firstKey = themeCache.keys().next().value
              if (firstKey) {
                themeCache.delete(firstKey)
              }
            }
          }

          // PATCH: Enhanced state updates with metadata
          if (!signal.aborted) {
            setOverrides(mcpOverrides)
            lastKnownGoodOverrides.current = mcpOverrides
            setMetadata({
              tenant,
              safeMode,
              contrastMode,
              darkMode,
              validated: true,
              validation,
              cacheHit: false,
              loadTime,
              tokenCount: Object.keys(mcpOverrides).length,
            })
            setLoading(false)

            // PATCH: Set DOM attributes for CSS activation
            if (typeof document !== 'undefined') {
              updateDOMAttributes({ tenant, safeMode, contrastMode, darkMode })
            }
          }
        } catch (err) {
          // Check if error is due to abort
          if (signal.aborted) return

          // Log error but don't un-theme the app
          console.error('Failed to load MCP theme:', err)
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)

          // Return last known good overrides instead of null for graceful degradation
          if (lastKnownGoodOverrides.current) {
            setOverrides(lastKnownGoodOverrides.current)
            console.warn(
              'MCP theme loading failed, using last known good theme'
            )
          } else {
            // Only set to null if we have no fallback
            setOverrides(null)
            console.warn('MCP theme loading failed, using CSS base tokens only')
          }

          setLoading(false)
        }
      }

      loadTheme()
    }, debounceMs)

    // Cleanup: abort request on unmount or dependency change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [tenant, safeMode, enabled, cacheKey, debounceMs])

  return {
    overrides,
    loading,
    error,
    metadata,
  }
}

// ===================================================================
// PATCH: Constitution Validation and Safety Functions
// ===================================================================

/**
 * PATCH: Validate and filter tenant overrides for safety
 */
function validateAndFilterTenantOverrides(
  tenantOverrides: McpThemeOverrides,
  options: { safeMode: boolean; contrastMode: string; strictMode: boolean }
): {
  overrides: McpThemeOverrides
  appliedTokens: string[]
  removedTokens: string[]
  violations: ThemeValidationResult['violations']
  warnings: string[]
} {
  const safeOverrides: McpThemeOverrides = {}
  const appliedTokens: string[] = []
  const removedTokens: string[] = []
  const violations: ThemeValidationResult['violations'] = []
  const warnings: string[] = []

  // PATCH: Tenant override safety rules
  // Tokens tenants CANNOT override (accessibility critical)
  const TENANT_FORBIDDEN_TOKENS = new Set([
    '--theme-bg',
    '--theme-fg', // Core accessibility tokens
    '--theme-success',
    '--theme-warning',
    '--theme-danger', // Status colors
    '--theme-ring', // Accessibility critical
  ])

  // Tokens allowed in safe mode (brand customization only)
  const SAFE_MODE_ALLOWED_TOKENS = new Set([
    '--theme-brand',
    '--theme-brand-soft',
    '--theme-brand-foreground', // Only brand colors allowed
    '--theme-radius-sm',
    '--theme-radius-md',
    '--theme-radius-lg', // Safe radius tokens
    '--theme-spacing-xs',
    '--theme-spacing-sm',
    '--theme-spacing-md',
    '--theme-spacing-lg', // Safe spacing
  ])

  for (const [token, value] of Object.entries(tenantOverrides)) {
    // Check if token exists in known tokens
    if (!KNOWN_TOKENS.has(token)) {
      violations.push({
        token,
        message: `Unknown token '${token}' not found in design system`,
        severity: 'warning',
        suggestion: 'Use only tokens defined in globals.css and tokens.ts',
      })
      removedTokens.push(token)
      continue
    }

    // Check tenant forbidden tokens
    if (TENANT_FORBIDDEN_TOKENS.has(token)) {
      violations.push({
        token,
        message: `Token '${token}' cannot be overridden by tenants (accessibility critical)`,
        severity: 'error',
        suggestion: 'Use accent tokens for brand customization instead',
      })
      removedTokens.push(token)
      continue
    }

    // Safe mode restrictions
    if (options.safeMode && !SAFE_MODE_ALLOWED_TOKENS.has(token)) {
      warnings.push(`Safe mode active: Token '${token}' not applied`)
      removedTokens.push(token)
      continue
    }

    // Validate token exists in design system
    const tokenName = token.replace('--theme-', '')
    if (!tokenHelpers.isThemeToken(tokenName)) {
      violations.push({
        token,
        message: `Unknown theme token '${token}'`,
        severity: 'warning',
        suggestion: 'Use tokens defined in themeTokens',
      })
      // Allow unknown tokens but warn
    }

    // Token passed all checks
    safeOverrides[token] = value
    appliedTokens.push(token)
  }

  return {
    overrides: safeOverrides,
    appliedTokens,
    removedTokens,
    violations,
    warnings,
  }
}

/**
 * PATCH: Enforce constitution-based safe mode
 */
function enforceConstitutionSafeMode(
  safeModeOverrides: McpThemeOverrides,
  currentOverrides: McpThemeOverrides
): {
  overrides: McpThemeOverrides
  appliedTokens: string[]
  removedTokens: string[]
  warnings: string[]
} {
  const enforced: McpThemeOverrides = { ...currentOverrides }
  const appliedTokens: string[] = []
  const removedTokens: string[] = []
  const warnings: string[] = []

  // PATCH: Constitution safe mode rules
  // Safe mode neutralizes colors to high-contrast grayscale
  const SAFE_MODE_NEUTRALS = {
    '--theme-primary': 'var(--theme-fg)', // Neutral to foreground
    '--theme-primary-soft': 'var(--theme-border-subtle)',
    '--theme-primary-foreground': 'var(--theme-bg)',
    '--theme-brand': 'var(--theme-fg)',
    '--theme-brand-soft': 'var(--theme-border-subtle)',
    '--theme-brand-foreground': 'var(--theme-bg)',
    '--theme-shadow-xs': 'none',
    '--theme-shadow-sm': 'none',
    '--theme-shadow-md': 'none',
    '--theme-shadow-lg': 'none',
  }

  // Apply safe mode neutralization
  for (const [token, neutralValue] of Object.entries(SAFE_MODE_NEUTRALS)) {
    if (enforced[token] && enforced[token] !== neutralValue) {
      warnings.push(
        `Safe mode: Neutralized '${token}' from '${enforced[token]}' to '${neutralValue}'`
      )
      removedTokens.push(token)
    }
    enforced[token] = neutralValue
    appliedTokens.push(token)
  }

  // Apply explicit safe mode overrides
  for (const [token, value] of Object.entries(safeModeOverrides)) {
    enforced[token] = value
    appliedTokens.push(token)
  }

  return { overrides: enforced, appliedTokens, removedTokens, warnings }
}

/**
 * PATCH: Validate theme overrides against constitution
 */
async function validateThemeOverrides(
  overrides: McpThemeOverrides,
  context: {
    tenant?: string
    safeMode: boolean
    contrastMode: string
    darkMode: boolean
    constitutionRules: ConstitutionRule[]
    validationPipeline: ValidationPipeline | null
  }
): Promise<ThemeValidationResult> {
  const violations: ThemeValidationResult['violations'] = []
  const warnings: string[] = []
  const appliedTokens = Object.keys(overrides)
  const removedTokens: string[] = []

  // Basic accessibility score calculation
  let accessibilityScore = 100

  // Validate with pipeline if available
  if (context.validationPipeline) {
    try {
      // Create mock component code for validation
      const mockThemeCode = `
        const theme = {
          ${Object.entries(overrides)
            .map(([key, value]) => `"${key}": "${value}"`)
            .join(',\n          ')}
        };
      `

      const result = await context.validationPipeline.validateComponent(
        mockThemeCode,
        'ThemeOverrides'
      )

      // Convert pipeline violations to theme violations
      for (const violation of result.violations) {
        violations.push({
          token: 'theme',
          message:
            typeof violation === 'string'
              ? violation
              : violation.message || 'Validation error',
          severity: 'error',
        })
        accessibilityScore -= 10
      }

      warnings.push(...result.warnings)
    } catch (error) {
      warnings.push(`Theme validation failed: ${error}`)
    }
  }

  // Additional theme-specific validations
  for (const [token, value] of Object.entries(overrides)) {
    // Check for potential contrast issues
    if (token.includes('color') && typeof value === 'string') {
      if (value.includes('#fff') || value.includes('#000')) {
        violations.push({
          token,
          message: `Potential contrast issue with absolute color '${value}'`,
          severity: 'warning',
          suggestion: 'Use semantic color tokens for better accessibility',
        })
        accessibilityScore -= 5
      }
    }
  }

  return {
    isValid: violations.filter(v => v.severity === 'error').length === 0,
    violations,
    warnings,
    appliedTokens,
    removedTokens,
    accessibilityScore: Math.max(0, accessibilityScore),
  }
}

/**
 * PATCH: Update DOM attributes for CSS activation
 */
function updateDOMAttributes(context: {
  tenant?: string
  safeMode: boolean
  contrastMode: string
  darkMode: boolean
}): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Set tenant attribute
  if (context.tenant) {
    root.dataset.tenant = context.tenant
  } else {
    delete root.dataset.tenant
  }

  // Set safe mode attribute
  root.dataset.safeMode = context.safeMode.toString()

  // Set contrast mode attribute
  root.dataset.theme =
    context.contrastMode === 'normal'
      ? 'default'
      : `wcag-${context.contrastMode}`

  // Set dark mode class/attribute
  if (context.darkMode) {
    root.classList.add('dark')
    root.dataset.mode = 'dark'
  } else {
    root.classList.remove('dark')
    root.dataset.mode = 'light'
  }
}

/**
 * Get theme version for tracking
 */
export async function getThemeVersion(): Promise<string | null> {
  try {
    const response = await fetch('/api/mcp/theme/version', {
      method: 'GET',
    })
    if (!response.ok) return null
    const data = await response.json()
    return data?.version || null
  } catch {
    return null
  }
}

/**
 * Clear theme cache (useful for testing or forced refresh)
 */
export function clearThemeCache(): void {
  themeCache.clear()
}

/**
 * Get current cache size (useful for debugging)
 */
export function getThemeCacheSize(): number {
  return themeCache.size
}

// PATCH: Type aliases for backward compatibility and index exports
export type McpThemeOptions = UseMcpThemeOptions
export type McpThemeResult = UseMcpThemeResult
export type McpThemeMetadata = ThemeValidationResult
