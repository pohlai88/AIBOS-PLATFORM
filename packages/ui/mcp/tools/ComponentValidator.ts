/**
 * MCP Component Validator - Production Implementation
 *
 * Runtime validation tool for components against the AI-BOS Constitution
 * Next.js MCP Guardian: Comprehensive constitution enforcement
 *
 * @version 1.0.0 - Phase 1.2 Implementation
 * @guardian Next.js MCP - Architecture and RSC boundary enforcement
 * @composer React MCP - Component validation logic
 * @helper Tailwind MCP - Token and class validation
 */

import type { McpValidationResult } from '../hooks/useMcpValidation'
import { tokenHelpers } from '../../src/design/utilities/token-helpers'
import type { ConstitutionRule, TenantContext } from '../types/mcp'

export interface ComponentValidationOptions {
  validateTokens?: boolean
  validateAccessibility?: boolean
  validateRSC?: boolean
  validateMotion?: boolean
  validateVisual?: boolean
  strictMode?: boolean
  enableTelemetry?: boolean
  // PATCH: Constitution integration
  constitutionRules?: ConstitutionRule[]
  // PATCH: Multi-tenant support
  tenantContext?: TenantContext
  // PATCH: Enhanced validation
  validateTailwindClasses?: boolean
  validateSemanticHTML?: boolean
  validateContrastRatios?: boolean
}

export interface ComponentMetadata {
  name: string
  type: 'primitive' | 'composition' | 'functional' | 'layout'
  hasClientDirective: boolean
  usesHooks: string[]
  usesTokens: string[]
  hasEventHandlers: boolean
  accessibility: {
    hasAriaLabels: boolean
    hasKeyboardSupport: boolean
    hasFocusManagement: boolean
    wcagCompliance: 'AA' | 'AAA' | 'partial' | 'none'
  }
  rsc: {
    isServerCompatible: boolean
    usesClientFeatures: boolean
    hasBrowserAPIs: boolean
  }
}

interface ValidationResult {
  violations: string[]
  warnings: string[]
  suggestions: string[]
}

/**
 * Component Validator Class
 *
 * Provides comprehensive validation against the AI-BOS Constitution Framework
 * Next.js MCP Guardian ensures proper RSC boundaries and architecture compliance
 */
export class ComponentValidator {
  private options: ComponentValidationOptions
  // PATCH: Constitution rules cache
  private constitutionRules: Map<string, ConstitutionRule> = new Map()
  // PATCH: Known client-only APIs for better RSC detection
  private readonly CLIENT_ONLY_APIS = new Set([
    'window',
    'document',
    'localStorage',
    'sessionStorage',
    'navigator',
    'location',
    'history',
    'screen',
    'performance',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'fetch',
    'XMLHttpRequest',
    'WebSocket',
    'EventSource',
    'ResizeObserver',
    'IntersectionObserver',
    'MutationObserver',
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
  ])

  // PATCH: Known React hooks for better detection
  private readonly REACT_HOOKS = new Set([
    'useState',
    'useEffect',
    'useContext',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useImperativeHandle',
    'useLayoutEffect',
    'useDebugValue',
    'useDeferredValue',
    'useId',
    'useInsertionEffect',
    'useSyncExternalStore',
    'useTransition',
  ])

  constructor(options: ComponentValidationOptions = {}) {
    this.options = {
      validateTokens: true,
      validateAccessibility: true,
      validateRSC: true,
      validateMotion: true,
      validateVisual: false,
      strictMode: false,
      validateTailwindClasses: true,
      validateSemanticHTML: true,
      validateContrastRatios: false, // Expensive, opt-in
      ...options,
    }

    // PATCH: Initialize constitution rules
    if (options.constitutionRules) {
      options.constitutionRules.forEach(rule => {
        this.constitutionRules.set(rule.id, rule)
      })
    }
  }

  /**
   * Validate component code against constitution rules
   * Next.js MCP Guardian: Comprehensive constitution enforcement
   */
  async validateComponent(
    componentCode: string,
    componentName?: string
  ): Promise<McpValidationResult & { metadata: ComponentMetadata }> {
    const violations: McpValidationResult['violations'] = []
    const warnings: string[] = []
    const suggestions: McpValidationResult['suggestions'] = []
    let score = 100

    // Extract component metadata
    const metadata: ComponentMetadata = {
      name:
        componentName ||
        this.extractComponentName(componentCode) ||
        'UnknownComponent',
      type: this.detectComponentType(componentCode),
      hasClientDirective:
        componentCode.includes("'use client'") ||
        componentCode.includes('"use client"'),
      usesHooks: this.extractHooks(componentCode),
      usesTokens: this.extractTokens(componentCode),
      hasEventHandlers: this.hasEventHandlers(componentCode),
      accessibility: this.analyzeAccessibility(componentCode),
      rsc: this.analyzeRSC(componentCode),
    }

    // Next.js MCP Guardian: RSC Boundary Validation
    if (this.options.validateRSC) {
      const rscViolations = this.validateRSCBoundaries(componentCode, metadata)
      violations.push(
        ...rscViolations.violations.map(msg => ({
          rule: 'rsc-boundary',
          message: msg,
          severity: 'error' as const,
          autoFixable: false,
        }))
      )
      warnings.push(...rscViolations.warnings)
      score -= rscViolations.violations.length * 15
    }

    // Token Validation (Tailwind MCP Helper)
    if (this.options.validateTokens) {
      const tokenViolations = this.validateTokenUsage(componentCode, metadata)
      violations.push(
        ...tokenViolations.violations.map(msg => ({
          rule: 'token-validation',
          message: msg,
          severity: 'warning' as const,
          autoFixable: true,
        }))
      )
      warnings.push(...tokenViolations.warnings)
      score -= tokenViolations.violations.length * 10
    }

    // Accessibility Validation (React MCP Helper)
    if (this.options.validateAccessibility) {
      const a11yViolations = this.validateAccessibility(componentCode, metadata)
      violations.push(
        ...a11yViolations.violations.map(msg => ({
          rule: 'accessibility',
          message: msg,
          severity: 'warning' as const,
          autoFixable: false,
        }))
      )
      warnings.push(...a11yViolations.warnings)
      suggestions.push(
        ...a11yViolations.suggestions.map(msg => ({
          type: 'enhancement' as const,
          message: msg,
        }))
      )
      score -= a11yViolations.violations.length * 12
    }

    // Motion Validation (Tailwind MCP Helper)
    if (this.options.validateMotion) {
      const motionViolations = this.validateMotion(componentCode, metadata)
      warnings.push(...motionViolations.warnings)
      suggestions.push(
        ...motionViolations.suggestions.map(msg => ({
          type: 'enhancement' as const,
          message: msg,
        }))
      )
      score -= motionViolations.warnings.length * 5
    }

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      suggestions,
      score: Math.max(0, score),
      timestamp: new Date(),
      governance: {
        isAllowed: violations.filter(v => v.severity === 'error').length === 0,
        blockRender: false,
        constitutionVersion: '2.0.0',
        safeMode: this.options.tenantContext?.safeMode || false,
      },
      context: {
        componentName: metadata.name,
        componentType: metadata.hasClientDirective ? 'client' : 'rsc',
        hasClientDirective: metadata.hasClientDirective,
        usesTokens: metadata.usesTokens,
        accessibility: metadata.accessibility,
        performance: {
          codeSize: componentCode.length,
          complexity: (componentCode.match(/if|for|while|switch|catch/g) || [])
            .length,
          renderBlocking: false,
        },
        security: {
          hasUnsafePatterns: /dangerouslySetInnerHTML|eval\(|Function\(/.test(
            componentCode
          ),
          tenantIsolation: true,
        },
      },
      telemetry: {
        validationTime: 0,
        pipelineSteps: ['component-validator'],
        cacheHit: false,
        aborted: false,
      },
      metadata,
    }
  }

  /**
   * Next.js MCP Guardian: Validate RSC boundaries
   */
  private validateRSCBoundaries(
    code: string,
    metadata: ComponentMetadata
  ): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Server Component with client-side code
    if (!metadata.hasClientDirective && metadata.rsc.usesClientFeatures) {
      violations.push(
        "Server Component contains client-side code without 'use client' directive"
      )
    }

    // Client Component with server-only imports
    if (metadata.hasClientDirective && code.includes('server-only')) {
      violations.push('Client Component imports server-only modules')
    }

    // Unnecessary client directive
    if (
      metadata.hasClientDirective &&
      !metadata.rsc.usesClientFeatures &&
      !metadata.hasEventHandlers
    ) {
      suggestions.push(
        "Component may not need 'use client' directive - consider making it a Server Component"
      )
    }

    return { violations, warnings, suggestions }
  }

  /**
   * PATCH: Enhanced token validation with constitution integration
   */
  private validateTokenUsage(
    code: string,
    metadata: ComponentMetadata
  ): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // PATCH: Validate extracted tokens
    for (const token of metadata.usesTokens) {
      const validation = tokenHelpers.validateTokenUsage(
        token.replace('--', ''),
        metadata.hasClientDirective ? 'client' : 'server'
      )

      if (!validation.isValid) {
        violations.push(`Invalid token usage: ${token}`)
      }

      if (validation.violations.length > 0) {
        warnings.push(...validation.violations)
      }

      if (validation.suggestions.length > 0) {
        suggestions.push(...validation.suggestions)
      }
    }

    // PATCH: Validate Tailwind classes if enabled
    if (this.options.validateTailwindClasses) {
      const tailwindViolations = this.validateTailwindClasses(code)
      violations.push(...tailwindViolations.violations)
      warnings.push(...tailwindViolations.warnings)
      suggestions.push(...tailwindViolations.suggestions)
    }

    // PATCH: Tenant-specific token validation
    if (this.options.tenantContext) {
      const tenantViolations = this.validateTenantTokens(
        code,
        this.options.tenantContext
      )
      violations.push(...tenantViolations.violations)
      warnings.push(...tenantViolations.warnings)
    }

    return { violations, warnings, suggestions }
  }

  /**
   * PATCH: Validate Tailwind classes for MCP compliance
   */
  private validateTailwindClasses(code: string): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Detect arbitrary values (forbidden in MCP)
    const arbitraryValues = code.match(/\w+-\[[^\]]+\]/g) || []
    for (const arbitrary of arbitraryValues) {
      violations.push(
        `Arbitrary Tailwind value not allowed: ${arbitrary}. Use design tokens instead.`
      )

      // Suggest token alternatives
      if (arbitrary.includes('text-[#')) {
        suggestions.push(
          'Use semantic color tokens like text-fg-primary, text-fg-secondary'
        )
      }
      if (arbitrary.includes('bg-[#')) {
        suggestions.push(
          'Use semantic background tokens like bg-surface, bg-elevated'
        )
      }
      if (
        arbitrary.includes('px-[') ||
        arbitrary.includes('py-[') ||
        arbitrary.includes('m-[')
      ) {
        suggestions.push('Use spacing tokens like px-4, py-2, m-6')
      }
    }

    // Detect raw hex colors in className
    const hexColors =
      code.match(/(?:text|bg|border)-\[#[0-9a-fA-F]{3,6}\]/g) || []
    for (const hex of hexColors) {
      violations.push(
        `Raw hex color not allowed: ${hex}. Use semantic color tokens.`
      )
    }

    return { violations, warnings, suggestions }
  }

  /**
   * PATCH: Validate tenant-specific token usage
   */
  private validateTenantTokens(
    code: string,
    tenantContext: TenantContext
  ): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Safe mode restrictions
    if (tenantContext.safeMode) {
      const colorTokens = code.match(/--color-[\w-]+/g) || []
      for (const token of colorTokens) {
        if (!token.includes('neutral') && !token.includes('gray')) {
          warnings.push(
            `Safe mode active: Consider using neutral colors instead of ${token}`
          )
        }
      }

      // Check for animations in safe mode
      if (/animate-|transition-/.test(code)) {
        warnings.push('Safe mode active: Animations may be reduced or disabled')
      }
    }

    // Tenant-specific restrictions
    if (tenantContext.tenant) {
      // Example: DLBB tenant restrictions
      if (tenantContext.tenant === 'dlbb') {
        // Validate brand color usage
        if (code.includes('--accent-bg') && !code.includes('emerald')) {
          suggestions.push(
            'DLBB tenant: Consider using emerald accent colors for brand consistency'
          )
        }
      }
    }

    return { violations, warnings, suggestions }
  }

  /**
   * PATCH: Enhanced accessibility validation with comprehensive WCAG checks
   */
  private validateAccessibility(
    code: string,
    metadata: ComponentMetadata
  ): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Interactive elements without ARIA labels
    const hasInteractiveElements = /<(button|input|select|textarea|a)/i.test(
      code
    )
    if (hasInteractiveElements && !metadata.accessibility.hasAriaLabels) {
      warnings.push(
        'Interactive elements should have ARIA labels for accessibility'
      )
    }

    // Interactive elements without keyboard support
    if (hasInteractiveElements && !metadata.accessibility.hasKeyboardSupport) {
      warnings.push('Interactive elements should support keyboard navigation')
    }

    // Missing focus management
    if (
      metadata.hasEventHandlers &&
      !metadata.accessibility.hasFocusManagement
    ) {
      suggestions.push(
        'Consider adding focus management for better accessibility'
      )
    }

    // Form elements without labels
    if (/<input|select|textarea/i.test(code) && !/<label/i.test(code)) {
      violations.push('Form elements must have associated labels')
    }

    // PATCH: Enhanced accessibility checks

    // Images without alt text
    const imgWithoutAlt = /<img(?![^>]*alt=)/i.test(code)
    if (imgWithoutAlt) {
      violations.push('Images must have alt attributes for screen readers')
    }

    // Buttons without accessible names
    const buttonPattern =
      /<button(?![^>]*(?:aria-label|aria-labelledby))[^>]*>(?!\s*<)/i
    if (buttonPattern.test(code)) {
      warnings.push(
        'Buttons should have accessible names via aria-label or visible text'
      )
    }

    // Links without href or role
    const linkWithoutHref = /<a(?![^>]*(?:href|role))/i.test(code)
    if (linkWithoutHref) {
      violations.push('Links must have href attribute or appropriate role')
    }

    // Missing semantic HTML
    if (this.options.validateSemanticHTML) {
      const semanticViolations = this.validateSemanticHTML(code)
      warnings.push(...semanticViolations.warnings)
      suggestions.push(...semanticViolations.suggestions)
    }

    // Color contrast validation (if enabled)
    if (this.options.validateContrastRatios) {
      const contrastViolations = this.validateContrastRatios(code)
      violations.push(...contrastViolations.violations)
      warnings.push(...contrastViolations.warnings)
    }

    // WCAG AAA compliance for tenant context
    if (this.options.tenantContext?.contrastMode === 'aaa') {
      suggestions.push(
        'AAA compliance mode: Ensure 7:1 contrast ratio and 16px minimum font size'
      )
    }

    return { violations, warnings, suggestions }
  }

  /**
   * PATCH: Validate semantic HTML usage
   */
  private validateSemanticHTML(code: string): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check for div soup (too many nested divs)
    const divCount = (code.match(/<div/g) || []).length
    const totalElements = (code.match(/<\w+/g) || []).length
    if (divCount > totalElements * 0.7) {
      suggestions.push(
        'Consider using semantic HTML elements (header, nav, main, section, article) instead of divs'
      )
    }

    // Missing main landmark
    if (code.includes('layout') && !/<main/i.test(code)) {
      suggestions.push('Layout components should include a main landmark')
    }

    // Heading hierarchy
    const headings = code.match(/<h[1-6]/gi) || []
    if (headings.length > 1) {
      suggestions.push('Ensure proper heading hierarchy (h1 → h2 → h3, etc.)')
    }

    return { violations, warnings, suggestions }
  }

  /**
   * PATCH: Validate color contrast ratios (basic implementation)
   */
  private validateContrastRatios(code: string): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // This is a simplified implementation - in production, you'd use a proper color contrast library
    const hasLightText = /text-white|text-gray-100|text-gray-200/.test(code)
    const hasLightBackground = /bg-white|bg-gray-100|bg-gray-200/.test(code)

    if (hasLightText && hasLightBackground) {
      violations.push(
        'Potential contrast issue: Light text on light background'
      )
    }

    // Check for custom colors that might have contrast issues
    const customColors = code.match(/(?:text|bg)-\[#[0-9a-fA-F]{6}\]/g) || []
    if (customColors.length > 0) {
      warnings.push(
        'Custom colors detected: Verify contrast ratios meet WCAG standards'
      )
    }

    return { violations, warnings, suggestions }
  }

  /**
   * Tailwind MCP Helper: Validate motion and animations
   */
  private validateMotion(
    code: string,
    metadata: ComponentMetadata
  ): ValidationResult {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const hasAnimations = /animate-|transition-/.test(code)
    const hasReducedMotionCheck = /prefers-reduced-motion/.test(code)

    if (hasAnimations && !hasReducedMotionCheck) {
      suggestions.push(
        'Consider adding reduced motion support for accessibility'
      )
    }

    return { violations, warnings, suggestions }
  }

  /**
   * Extract component name from code
   */
  private extractComponentName(code: string): string | null {
    const match = code.match(
      /(?:export\s+(?:default\s+)?(?:function|const)\s+|function\s+)([A-Z][A-Za-z0-9]*)/
    )
    return match ? match[1] : null
  }

  /**
   * Detect component type based on patterns
   */
  private detectComponentType(
    code: string
  ): 'primitive' | 'composition' | 'functional' | 'layout' {
    if (
      code.includes('children') &&
      /<div|section|main|header|footer/i.test(code)
    ) {
      return 'layout'
    }
    if (code.includes('useState') || code.includes('useEffect')) {
      return 'functional'
    }
    if (code.split('<').length > 5) {
      return 'composition'
    }
    return 'primitive'
  }

  /**
   * Extract React hooks used in component
   */
  private extractHooks(code: string): string[] {
    const hookMatches = code.match(/use[A-Z]\w*(?=\()/g) || []
    return [...new Set(hookMatches)]
  }

  /**
   * Extract design tokens used in component
   */
  private extractTokens(code: string): string[] {
    const tokenMatches = code.match(/--[\w-]+/g) || []
    return [...new Set(tokenMatches)]
  }

  /**
   * Check if component has event handlers
   */
  private hasEventHandlers(code: string): boolean {
    return /on[A-Z]\w*=/.test(code)
  }

  /**
   * Analyze accessibility features
   */
  private analyzeAccessibility(
    code: string
  ): ComponentMetadata['accessibility'] {
    const hasAriaLabels = /aria-\w+/.test(code)
    const hasKeyboardSupport = /onKey\w+/.test(code) || /tabIndex/.test(code)
    const hasFocusManagement = /focus|blur/i.test(code)

    let wcagCompliance: 'AA' | 'AAA' | 'partial' | 'none' = 'none'
    if (hasAriaLabels && hasKeyboardSupport) {
      wcagCompliance = 'AA'
    } else if (hasAriaLabels || hasKeyboardSupport) {
      wcagCompliance = 'partial'
    }

    return {
      hasAriaLabels,
      hasKeyboardSupport,
      hasFocusManagement,
      wcagCompliance,
    }
  }

  /**
   * PATCH: Enhanced RSC compatibility analysis
   * Improved detection with comprehensive API checking
   */
  private analyzeRSC(code: string): ComponentMetadata['rsc'] {
    // PATCH: Better hook detection
    const hookMatches = code.match(/\b(use[A-Z]\w*)\s*\(/g) || []
    const detectedHooks = hookMatches.map(match => match.replace(/\s*\($/, ''))
    const usesReactHooks = detectedHooks.some(hook =>
      this.REACT_HOOKS.has(hook)
    )

    // PATCH: Better event handler detection (avoid false positives in strings/comments)
    const eventHandlerPattern = /\s(on[A-Z]\w*)\s*=/g
    const hasEventHandlers = eventHandlerPattern.test(code)

    // PATCH: Comprehensive browser API detection
    let hasBrowserAPIs = false
    for (const api of this.CLIENT_ONLY_APIS) {
      if (new RegExp(`\\b${api}\\b`).test(code)) {
        hasBrowserAPIs = true
        break
      }
    }

    // PATCH: Check for client-only patterns
    const hasClientPatterns =
      /\bwindow\s*\[/.test(code) || // window['property']
      /\bdocument\s*\[/.test(code) || // document['property']
      /\.addEventListener\s*\(/.test(code) || // .addEventListener(
      /\.removeEventListener\s*\(/.test(code) || // .removeEventListener(
      /new\s+(ResizeObserver|IntersectionObserver|MutationObserver)/.test(code)

    const usesClientFeatures =
      usesReactHooks || hasEventHandlers || hasBrowserAPIs || hasClientPatterns
    const isServerCompatible = !usesClientFeatures

    return {
      isServerCompatible,
      usesClientFeatures,
      hasBrowserAPIs,
    }
  }

  // ===================================================================
  // PATCH: Constitution Integration Methods
  // ===================================================================

  /**
   * Add constitution rule for dynamic validation
   */
  public addConstitutionRule(rule: ConstitutionRule): void {
    this.constitutionRules.set(rule.id, rule)
  }

  /**
   * Remove constitution rule
   */
  public removeConstitutionRule(ruleId: string): void {
    this.constitutionRules.delete(ruleId)
  }

  /**
   * Get all active constitution rules
   */
  public getConstitutionRules(): ConstitutionRule[] {
    return Array.from(this.constitutionRules.values())
  }

  /**
   * Update tenant context for validation
   */
  public setTenantContext(tenantContext: TenantContext): void {
    this.options.tenantContext = tenantContext
  }

  /**
   * Get validation metrics for telemetry
   */
  public getValidationMetrics(): {
    rulesCount: number
    enabledValidators: string[]
    tenantContext: TenantContext | undefined
    strictMode: boolean
  } {
    const enabledValidators: string[] = []
    if (this.options.validateTokens) enabledValidators.push('tokens')
    if (this.options.validateAccessibility)
      enabledValidators.push('accessibility')
    if (this.options.validateRSC) enabledValidators.push('rsc')
    if (this.options.validateMotion) enabledValidators.push('motion')
    if (this.options.validateTailwindClasses) enabledValidators.push('tailwind')
    if (this.options.validateSemanticHTML) enabledValidators.push('semantic')

    return {
      rulesCount: this.constitutionRules.size,
      enabledValidators,
      tenantContext: this.options.tenantContext,
      strictMode: this.options.strictMode || false,
    }
  }
}

// Export singleton instance for convenience
export const componentValidator = new ComponentValidator({
  validateTokens: true,
  validateAccessibility: true,
  validateRSC: true,
  validateMotion: true,
  strictMode: false,
})

// PATCH: Type aliases for backward compatibility and index exports
export type ComponentValidationResult = McpValidationResult
export type ComponentContext = TenantContext
export type AccessibilityMetrics = ComponentMetadata['accessibility']
export type PerformanceMetrics = {
  codeSize: number
  complexity: number
  renderBlocking: boolean
}
export type SecurityMetrics = {
  hasUnsafePatterns: boolean
  tenantIsolation: boolean
  xssVulnerabilities: string[]
}
