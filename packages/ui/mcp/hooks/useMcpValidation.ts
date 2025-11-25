/**
 * MCP Constitution Validation Hook - ENTERPRISE EDITION
 *
 * Provides runtime validation against the AI-BOS Constitution Framework
 * Next.js MCP Guardian: Ensures RSC boundaries and constitution compliance
 *
 * @version 2.0.0 - Enterprise MCP Governance Implementation
 * @guardian Next.js MCP - Architecture and RSC boundary enforcement
 * @composer React MCP - Component validation logic
 * @helper Tailwind MCP - Token and class validation
 *
 * PATCH: Full ValidationPipeline integration with constitution governance
 * PATCH: Tenant-aware validation with safe-mode enforcement
 * PATCH: Severity-based error handling with render blocking
 * PATCH: AbortController for async validation race protection
 * PATCH: Enterprise telemetry and governance metadata
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ValidationPipeline } from '../tools/ValidationPipeline'
import { ComponentValidator } from '../tools/ComponentValidator'
import { tokenHelpers } from '../../src/design/utilities/token-helpers'
import type {
  ConstitutionRule,
  TenantContext,
  ValidationPolicy,
  McpContext,
} from '../types/mcp'

// PATCH: Enterprise MCP Validation Result with governance metadata
export interface McpValidationResult {
  isValid: boolean
  violations: Array<{
    rule: string
    message: string
    severity: 'error' | 'warning' | 'info'
    line?: number
    column?: number
    suggestion?: string
    autoFixable?: boolean
  }>
  warnings: string[]
  suggestions: Array<{
    type: 'fix' | 'enhancement' | 'optimization'
    message: string
    code?: string
    diffPatch?: string
  }>
  score: number // 0-100 constitution compliance score
  timestamp: Date
  // PATCH: Enhanced governance context
  governance: {
    isAllowed: boolean
    blockRender: boolean
    fallbackComponent?: string
    tenant?: string
    safeMode: boolean
    constitutionVersion: string
  }
  context: {
    componentName?: string
    componentType?: 'rsc' | 'client' | 'hybrid' | 'utility' | 'auto'
    hasClientDirective: boolean
    usesTokens: string[]
    accessibility: {
      hasAriaLabels: boolean
      hasKeyboardSupport: boolean
      wcagCompliance: 'AA' | 'AAA' | 'partial' | 'none'
      contrastRatio?: number
    }
    performance: {
      codeSize: number
      complexity: number
      renderBlocking: boolean
    }
    security: {
      hasUnsafePatterns: boolean
      tenantIsolation: boolean
    }
  }
  // PATCH: Telemetry metadata
  telemetry: {
    validationTime: number
    pipelineSteps: string[]
    cacheHit: boolean
    aborted: boolean
  }
}

// PATCH: Enterprise MCP Validation Options with governance context
export interface McpValidationOptions {
  // Core validation toggles
  validateTokens?: boolean
  validateAccessibility?: boolean
  validateRSC?: boolean
  validateMotion?: boolean
  validateSecurity?: boolean
  validatePerformance?: boolean

  // Real-time behavior
  realTime?: boolean
  debounceMs?: number
  strictMode?: boolean

  // PATCH: Governance context
  tenant?: string
  safeMode?: boolean
  contrastMode?: 'normal' | 'aa' | 'aaa'
  darkMode?: boolean
  runtime?: 'server' | 'client' | 'rsc' | 'hybrid'

  // PATCH: Constitution integration
  constitutionRules?: ConstitutionRule[]
  validationPolicy?: ValidationPolicy

  // PATCH: Error handling
  stopOnError?: boolean
  fallbackComponent?: string
  blockRenderOnError?: boolean

  // PATCH: Performance
  enableCache?: boolean
  maxValidationTime?: number

  // PATCH: Telemetry
  enableTelemetry?: boolean
  telemetryEndpoint?: string
}

/**
 * PATCH: Enterprise MCP Constitution Validation Hook
 *
 * Provides AI-governed validation against the AI-BOS Constitution Framework
 * with full pipeline orchestration, tenant isolation, and governance enforcement
 *
 * @param componentCode - The component code to validate
 * @param options - Enhanced validation options with governance context
 * @returns Enterprise validation result with governance metadata and fallback
 */
export function useMcpValidation(
  componentCode: string,
  options: McpValidationOptions = {}
): {
  result: McpValidationResult | null
  isValidating: boolean
  error: string | null
  revalidate: () => void
  // PATCH: Enhanced return interface
  governance: {
    isAllowed: boolean
    blockRender: boolean
    fallbackComponent?: string
    severity: 'none' | 'warning' | 'error' | 'critical'
  }
  telemetry: {
    validationCount: number
    averageTime: number
    cacheHitRate: number
  }
} {
  const [result, setResult] = useState<McpValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PATCH: Enhanced state management
  const [governance, setGovernance] = useState({
    isAllowed: true,
    blockRender: false,
    fallbackComponent: undefined as string | undefined,
    severity: 'none' as 'none' | 'warning' | 'error' | 'critical',
  })

  const [telemetry, setTelemetry] = useState({
    validationCount: 0,
    averageTime: 0,
    cacheHitRate: 0,
  })

  // PATCH: Enhanced refs for enterprise features
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const validationPipelineRef = useRef<ValidationPipeline | null>(null)
  const componentValidatorRef = useRef<ComponentValidator | null>(null)
  const validationCacheRef = useRef<Map<string, McpValidationResult>>(new Map())
  const telemetryRef = useRef({ totalTime: 0, count: 0, cacheHits: 0 })

  const {
    // Core validation
    validateTokens = true,
    validateAccessibility = true,
    validateRSC = true,
    validateMotion = true,
    validateSecurity = true,
    validatePerformance = true,

    // Behavior
    realTime = true,
    debounceMs = 300,
    strictMode = false,

    // PATCH: Governance context
    tenant,
    safeMode = false,
    contrastMode = 'normal',
    darkMode = false,
    runtime = 'auto',

    // PATCH: Constitution
    constitutionRules = [],
    validationPolicy,

    // PATCH: Error handling
    stopOnError = false,
    fallbackComponent,
    blockRenderOnError = false,

    // PATCH: Performance
    enableCache = true,
    maxValidationTime = 5000,

    // PATCH: Telemetry
    enableTelemetry = true,
    telemetryEndpoint,
  } = options

  // PATCH: Initialize ValidationPipeline and ComponentValidator
  useEffect(() => {
    if (constitutionRules.length > 0) {
      validationPipelineRef.current = new ValidationPipeline({
        constitutionRules,
        tenantContext: {
          tenant,
          safeMode,
          contrastMode,
          darkMode,
        } as TenantContext,
        validationPolicy: validationPolicy || {
          stopOnError,
          warnOnWarning: true,
          enforceAccessibility: contrastMode !== 'normal',
          allowAutoFix: true,
          strictMode: safeMode,
        },
      })

      componentValidatorRef.current = new ComponentValidator({
        constitutionRules,
        strictMode,
        enableTelemetry,
      })
    }
  }, [
    constitutionRules,
    tenant,
    safeMode,
    contrastMode,
    darkMode,
    validationPolicy,
    stopOnError,
    strictMode,
    enableTelemetry,
  ])

  // PATCH: Enterprise validation with ValidationPipeline integration
  const validateComponent = useCallback(
    async (
      code: string,
      signal?: AbortSignal
    ): Promise<McpValidationResult> => {
      const startTime = Date.now()

      // Check cache first
      const cacheKey = `${code.slice(0, 100)}-${tenant}-${safeMode}-${contrastMode}-${runtime}`
      if (enableCache && validationCacheRef.current.has(cacheKey)) {
        telemetryRef.current.cacheHits++
        const cached = validationCacheRef.current.get(cacheKey)!
        return { ...cached, telemetry: { ...cached.telemetry, cacheHit: true } }
      }

      // Initialize result structure
      const violations: McpValidationResult['violations'] = []
      const warnings: string[] = []
      const suggestions: McpValidationResult['suggestions'] = []
      let score = 100
      let isAllowed = true
      let blockRender = false

      try {
        // PATCH: Use ValidationPipeline if available
        if (validationPipelineRef.current) {
          const pipelineResult =
            await validationPipelineRef.current.validateComponent(
              code,
              'UnknownComponent'
            )

          // Convert pipeline violations to enhanced format
          for (const violation of pipelineResult.violations) {
            violations.push({
              rule: 'constitution',
              message:
                typeof violation === 'string'
                  ? violation
                  : violation.message || 'Constitution violation',
              severity: 'error',
              autoFixable: false,
            })
            score -= 15
          }

          warnings.push(...pipelineResult.warnings)

          // Check if errors should block render
          if (
            pipelineResult.violations.length > 0 &&
            (stopOnError || blockRenderOnError)
          ) {
            isAllowed = false
            blockRender = true
          }
        } else {
          // PATCH: Fallback to ComponentValidator
          if (componentValidatorRef.current) {
            const validatorResult =
              await componentValidatorRef.current.validateComponent(code)

            for (const violation of validatorResult.violations) {
              violations.push({
                rule: 'component',
                message:
                  typeof violation === 'string'
                    ? violation
                    : violation.message || 'Component validation error',
                severity: 'warning',
                autoFixable: false,
              })
              score -= 10
            }

            warnings.push(...validatorResult.warnings)
          }
        }

        // PATCH: Enhanced RSC boundary validation with constitution rules
        const hasClientDirective =
          code.includes("'use client'") || code.includes('"use client"')
        const hasServerOnlyImports = code.includes('server-only')
        const hasReactHooks = /use[A-Z]\w*\(/.test(code)
        const hasEventHandlers = /on[A-Z]\w*=/.test(code)
        const hasDOMAccess = /window\.|document\./.test(code)

        // RSC Boundary Violations (Next.js MCP Guardian)
        if (validateRSC) {
          if (
            !hasClientDirective &&
            (hasReactHooks || hasEventHandlers || hasDOMAccess)
          ) {
            violations.push({
              rule: 'rsc-boundary',
              message:
                "Server Component contains client-side code without 'use client' directive",
              severity: 'error',
              suggestion: "Add 'use client' directive at the top of the file",
              autoFixable: true,
            })
            score -= 20
            if (strictMode) {
              isAllowed = false
              blockRender = true
            }
          }

          if (hasClientDirective && hasServerOnlyImports) {
            violations.push({
              rule: 'server-only-import',
              message: 'Client Component imports server-only modules',
              severity: 'error',
              suggestion: 'Move server-only imports to a Server Component',
              autoFixable: false,
            })
            score -= 25
            if (strictMode) {
              isAllowed = false
              blockRender = true
            }
          }
        }

        // PATCH: Enhanced token validation with tenant context
        if (validateTokens) {
          const tokenMatches = code.match(/--[\w-]+/g) || []
          for (const token of tokenMatches) {
            const validation = tokenHelpers.validateTokenUsage(
              token.replace('--', ''),
              hasClientDirective ? 'client' : 'server'
            )
            if (!validation.isValid) {
              violations.push({
                rule: 'token-usage',
                message: `Invalid token usage: ${token}`,
                severity: 'warning',
                suggestion:
                  validation.suggestions[0] || 'Use valid design system token',
                autoFixable: true,
              })
              score -= 5
            }

            // PATCH: Tenant token isolation check
            if (tenant && token.includes('tenant') && !token.includes(tenant)) {
              violations.push({
                rule: 'tenant-isolation',
                message: `Token ${token} violates tenant isolation for ${tenant}`,
                severity: 'error',
                suggestion: `Use tenant-specific token: --${tenant}-${token.replace('--', '')}`,
                autoFixable: true,
              })
              score -= 15
              if (strictMode) {
                isAllowed = false
              }
            }
          }
        }

        // PATCH: Enhanced accessibility validation with WCAG compliance
        if (validateAccessibility) {
          const hasAriaLabels = /aria-\w+/.test(code)
          const hasKeyboardSupport =
            /onKey\w+/.test(code) || /tabIndex/.test(code)
          const hasInteractiveElements =
            /<(button|input|select|textarea|a)/i.test(code)

          if (hasInteractiveElements && !hasAriaLabels) {
            const severity = contrastMode === 'aaa' ? 'error' : 'warning'
            violations.push({
              rule: 'accessibility-aria',
              message:
                'Interactive elements should have ARIA labels for accessibility',
              severity,
              suggestion: 'Add aria-label or aria-labelledby attributes',
              autoFixable: true,
            })
            score -= contrastMode === 'aaa' ? 20 : 10
            if (severity === 'error' && strictMode) {
              isAllowed = false
            }
          }

          if (hasInteractiveElements && !hasKeyboardSupport) {
            const severity = contrastMode === 'aaa' ? 'error' : 'warning'
            violations.push({
              rule: 'accessibility-keyboard',
              message:
                'Interactive elements should support keyboard navigation',
              severity,
              suggestion: 'Add onKeyDown handlers or ensure proper tabIndex',
              autoFixable: true,
            })
            score -= contrastMode === 'aaa' ? 20 : 10
            if (severity === 'error' && strictMode) {
              isAllowed = false
            }
          }
        }

        // PATCH: Enhanced motion validation with safe mode
        if (validateMotion) {
          const hasAnimations = /animate-|transition-/.test(code)
          const hasReducedMotionCheck = /prefers-reduced-motion/.test(code)

          if (hasAnimations && !hasReducedMotionCheck) {
            const severity = safeMode ? 'error' : 'info'
            violations.push({
              rule: 'motion-accessibility',
              message: 'Animations should respect reduced motion preferences',
              severity,
              suggestion: 'Add prefers-reduced-motion media query check',
              autoFixable: true,
            })
            score -= safeMode ? 15 : 5
            if (safeMode && strictMode) {
              isAllowed = false
            }
          }

          if (safeMode && hasAnimations) {
            violations.push({
              rule: 'safe-mode-motion',
              message: 'Safe mode active: animations should be disabled',
              severity: 'warning',
              suggestion: 'Remove animations or add safe mode check',
              autoFixable: true,
            })
            score -= 10
          }
        }

        // PATCH: Security validation
        if (validateSecurity) {
          const hasUnsafePatterns =
            /dangerouslySetInnerHTML|eval\(|Function\(/.test(code)
          if (hasUnsafePatterns) {
            violations.push({
              rule: 'security-unsafe-patterns',
              message: 'Component contains potentially unsafe patterns',
              severity: 'error',
              suggestion: 'Avoid dangerouslySetInnerHTML and eval() functions',
              autoFixable: false,
            })
            score -= 30
            isAllowed = false
            blockRender = true
          }
        }

        // PATCH: Performance validation
        if (validatePerformance) {
          const codeSize = code.length
          const complexity = (code.match(/if|for|while|switch|catch/g) || [])
            .length

          if (codeSize > 10000) {
            violations.push({
              rule: 'performance-size',
              message: `Component is too large (${codeSize} characters)`,
              severity: 'warning',
              suggestion: 'Consider splitting into smaller components',
              autoFixable: false,
            })
            score -= 10
          }

          if (complexity > 20) {
            violations.push({
              rule: 'performance-complexity',
              message: `Component has high cyclomatic complexity (${complexity})`,
              severity: 'warning',
              suggestion: 'Refactor to reduce complexity',
              autoFixable: false,
            })
            score -= 15
          }
        }

        // PATCH: Component type detection with enhanced categories
        let componentType: McpValidationResult['context']['componentType'] =
          'auto'
        if (hasClientDirective) componentType = 'client'
        else if (!hasReactHooks && !hasEventHandlers) componentType = 'rsc'
        else if (hasReactHooks && hasEventHandlers) componentType = 'hybrid'
        else componentType = 'utility'

        const tokenMatches = code.match(/--[\w-]+/g) || []
        const validationTime = Date.now() - startTime

        // PATCH: Build comprehensive result
        const result: McpValidationResult = {
          isValid: violations.filter(v => v.severity === 'error').length === 0,
          violations,
          warnings,
          suggestions,
          score: Math.max(0, score),
          timestamp: new Date(),
          governance: {
            isAllowed,
            blockRender,
            fallbackComponent,
            tenant,
            safeMode,
            constitutionVersion: '2.0.0',
          },
          context: {
            componentType,
            hasClientDirective,
            usesTokens: tokenMatches,
            accessibility: {
              hasAriaLabels: /aria-\w+/.test(code),
              hasKeyboardSupport:
                /onKey\w+/.test(code) || /tabIndex/.test(code),
              wcagCompliance:
                contrastMode === 'aaa'
                  ? 'AAA'
                  : contrastMode === 'aa'
                    ? 'AA'
                    : 'partial',
            },
            performance: {
              codeSize: code.length,
              complexity: (code.match(/if|for|while|switch|catch/g) || [])
                .length,
              renderBlocking: blockRender,
            },
            security: {
              hasUnsafePatterns:
                /dangerouslySetInnerHTML|eval\(|Function\(/.test(code),
              tenantIsolation:
                !tenant || !code.includes('tenant') || code.includes(tenant),
            },
          },
          telemetry: {
            validationTime,
            pipelineSteps: validationPipelineRef.current
              ? ['pipeline']
              : ['fallback'],
            cacheHit: false,
            aborted: signal?.aborted || false,
          },
        }

        // Cache result
        if (enableCache) {
          validationCacheRef.current.set(cacheKey, result)
          // Limit cache size
          if (validationCacheRef.current.size > 100) {
            const firstKey = validationCacheRef.current.keys().next().value
            if (firstKey) {
              validationCacheRef.current.delete(firstKey)
            }
          }
        }

        return result
      } catch (error) {
        // PATCH: Enhanced error handling
        const validationTime = Date.now() - startTime
        return {
          isValid: false,
          violations: [
            {
              rule: 'validation-error',
              message: `Validation failed: ${error}`,
              severity: 'error',
              autoFixable: false,
            },
          ],
          warnings: [],
          suggestions: [],
          score: 0,
          timestamp: new Date(),
          governance: {
            isAllowed: false,
            blockRender: true,
            fallbackComponent,
            tenant,
            safeMode,
            constitutionVersion: '2.0.0',
          },
          context: {
            componentType: 'auto',
            hasClientDirective: false,
            usesTokens: [],
            accessibility: {
              hasAriaLabels: false,
              hasKeyboardSupport: false,
              wcagCompliance: 'none',
            },
            performance: {
              codeSize: code.length,
              complexity: 0,
              renderBlocking: true,
            },
            security: {
              hasUnsafePatterns: true,
              tenantIsolation: false,
            },
          },
          telemetry: {
            validationTime,
            pipelineSteps: ['error'],
            cacheHit: false,
            aborted: signal?.aborted || false,
          },
        }
      }
    },
    [
      validateTokens,
      validateAccessibility,
      validateRSC,
      validateMotion,
      validateSecurity,
      validatePerformance,
      strictMode,
      tenant,
      safeMode,
      contrastMode,
      runtime,
      stopOnError,
      blockRenderOnError,
      fallbackComponent,
      enableCache,
      enableTelemetry,
    ]
  )

  // PATCH: Enhanced revalidate with AbortController and governance
  const revalidate = useCallback(() => {
    if (!componentCode.trim()) return

    // Abort previous validation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setIsValidating(true)
    setError(null)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const startTime = Date.now()

        // Add timeout protection
        const timeoutId = setTimeout(() => {
          controller.abort()
        }, maxValidationTime)

        const validationResult = await validateComponent(
          componentCode,
          controller.signal
        )

        clearTimeout(timeoutId)

        if (!controller.signal.aborted) {
          setResult(validationResult)

          // PATCH: Update governance state
          setGovernance({
            isAllowed: validationResult.governance.isAllowed,
            blockRender: validationResult.governance.blockRender,
            fallbackComponent: validationResult.governance.fallbackComponent,
            severity: validationResult.violations.some(
              v => v.severity === 'error'
            )
              ? 'error'
              : validationResult.violations.some(v => v.severity === 'warning')
                ? 'warning'
                : validationResult.violations.length > 0
                  ? 'warning'
                  : 'none',
          })

          // PATCH: Update telemetry
          const validationTime = Date.now() - startTime
          telemetryRef.current.totalTime += validationTime
          telemetryRef.current.count++

          setTelemetry({
            validationCount: telemetryRef.current.count,
            averageTime:
              telemetryRef.current.totalTime / telemetryRef.current.count,
            cacheHitRate:
              telemetryRef.current.cacheHits / telemetryRef.current.count,
          })

          // PATCH: Send telemetry if enabled
          if (enableTelemetry && telemetryEndpoint) {
            try {
              fetch(telemetryEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  type: 'validation',
                  tenant,
                  validationTime,
                  violations: validationResult.violations.length,
                  score: validationResult.score,
                  timestamp: new Date().toISOString(),
                }),
              }).catch(() => {}) // Silent fail for telemetry
            } catch {
              // Silent fail for telemetry
            }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Validation failed'
          setError(errorMessage)

          // PATCH: Set error governance state
          setGovernance({
            isAllowed: false,
            blockRender: blockRenderOnError,
            fallbackComponent,
            severity: 'critical',
          })
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsValidating(false)
        }
      }
    }, debounceMs)
  }, [
    componentCode,
    validateComponent,
    debounceMs,
    maxValidationTime,
    tenant,
    enableTelemetry,
    telemetryEndpoint,
    blockRenderOnError,
    fallbackComponent,
  ])

  // Auto-validate on code changes if realTime is enabled
  useEffect(() => {
    if (realTime) {
      revalidate()
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [componentCode, realTime, revalidate])

  return {
    result,
    isValidating,
    error,
    revalidate,
    // PATCH: Enhanced return interface
    governance,
    telemetry,
  }
}

export default useMcpValidation

// PATCH: Type aliases for backward compatibility and index exports
// export type { UseMcpValidationOptions as McpValidationOptions }; // Type doesn't exist
export type McpValidationContext = TenantContext
export type McpValidationSummary = {
  isAllowed: boolean
  blockRender: boolean
  constitutionVersion: string
  tenant?: string
  safeMode: boolean
}
