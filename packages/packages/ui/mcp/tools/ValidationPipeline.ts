/**
 * MCP Validation Pipeline - Production Implementation
 *
 * Orchestrates validation across all MCP components
 * Next.js MCP Guardian: Central validation orchestration
 *
 * @version 1.0.0 - Phase 1.2 Implementation
 * @guardian Next.js MCP - Pipeline orchestration and architecture
 * @composer React MCP - Component validation logic
 * @helper Tailwind MCP - Token and class validation
 */

import { ComponentValidator } from './ComponentValidator'
import { tokenHelpers } from '../../src/design/utilities/token-helpers'
import type { McpValidationResult } from '../hooks/useMcpValidation'
import type {
  ConstitutionRule,
  TenantContext,
  ValidationPolicy,
} from '../types/mcp'

export interface ValidationPipelineOptions {
  enableTokenValidation?: boolean
  enableAccessibilityValidation?: boolean
  enableRSCValidation?: boolean
  enableMotionValidation?: boolean
  enableConstitutionValidation?: boolean
  strictMode?: boolean
  parallel?: boolean
  // PATCH: Constitution integration
  constitutionRules?: ConstitutionRule[]
  // PATCH: Multi-tenant support
  tenantContext?: TenantContext
  // PATCH: Severity handling
  validationPolicy?: ValidationPolicy
  // PATCH: Enhanced validation
  enableTailwindValidation?: boolean
  enableSemanticValidation?: boolean
  enableNamingValidation?: boolean
}

// PATCH: Enhanced pipeline step interface
export interface PipelineStep {
  id: string
  name: string
  description: string
  category:
    | 'tokens'
    | 'rsc'
    | 'accessibility'
    | 'motion'
    | 'tailwind'
    | 'semantic'
    | 'naming'
    | 'constitution'
  severity: 'error' | 'warning' | 'info'
  dependencies?: string[]
  enabled: boolean
  run(input: ValidationStepInput): Promise<ValidationStepOutput>
}

export interface ValidationStepInput {
  code: string
  componentName?: string
  tenantContext?: TenantContext
  previousResults?: ValidationStepOutput[]
}

export interface ValidationStepOutput {
  stepId: string
  passed: boolean
  duration: number
  violations: Array<{
    message: string
    severity: 'error' | 'warning' | 'info'
    line?: number
    column?: number
    suggestion?: string
    autoFix?: string
  }>
  warnings: string[]
  suggestions: string[]
  metadata?: Record<string, any>
}

export interface PipelineValidationResult extends McpValidationResult {
  pipeline: {
    stages: string[]
    duration: number
    stageResults: Record<string, ValidationStepOutput>
    // PATCH: Enhanced telemetry
    telemetry: {
      totalSteps: number
      passedSteps: number
      failedSteps: number
      averageDuration: number
      tenantContext?: TenantContext
      constitutionVersion?: string
    }
  }
}

/**
 * Validation Pipeline Class
 * Next.js MCP Guardian: Orchestrates all validation stages
 */
export class ValidationPipeline {
  private componentValidator: ComponentValidator
  private options: ValidationPipelineOptions
  // PATCH: Pipeline steps registry
  private steps: Map<string, PipelineStep> = new Map()
  // PATCH: Constitution rules cache
  private constitutionRules: Map<string, ConstitutionRule> = new Map()
  // PATCH: Telemetry collection
  private telemetryData: Array<{
    stepId: string
    duration: number
    violations: number
    warnings: number
    timestamp: number
    tenantContext?: TenantContext
  }> = []

  constructor(options: ValidationPipelineOptions = {}) {
    this.options = {
      enableTokenValidation: true,
      enableAccessibilityValidation: true,
      enableRSCValidation: true,
      enableMotionValidation: true,
      enableConstitutionValidation: true,
      enableTailwindValidation: true,
      enableSemanticValidation: true,
      enableNamingValidation: false,
      strictMode: false,
      parallel: false, // Sequential by default for proper dependency handling
      validationPolicy: {
        stopOnError: false,
        warnOnWarning: true,
        enforceAccessibility: true,
        allowAutoFix: true,
        strictMode: false,
      },
      ...options,
    }

    // PATCH: Initialize constitution rules
    if (options.constitutionRules) {
      options.constitutionRules.forEach(rule => {
        this.constitutionRules.set(rule.id, rule)
      })
    }

    // PATCH: Create component validator with enhanced options
    this.componentValidator = new ComponentValidator({
      validateTokens: this.options.enableTokenValidation,
      validateAccessibility: this.options.enableAccessibilityValidation,
      validateRSC: this.options.enableRSCValidation,
      validateMotion: this.options.enableMotionValidation,
      validateTailwindClasses: this.options.enableTailwindValidation,
      validateSemanticHTML: this.options.enableSemanticValidation,
      strictMode: this.options.strictMode,
      constitutionRules: Array.from(this.constitutionRules.values()),
      tenantContext: this.options.tenantContext,
    })

    // PATCH: Initialize default pipeline steps
    this.initializeDefaultSteps()
  }

  /**
   * PATCH: Initialize default pipeline steps with proper ordering
   */
  private initializeDefaultSteps(): void {
    // Step 1: Constitution validation (foundation)
    this.registerStep({
      id: 'constitution',
      name: 'Constitution Validation',
      description: 'Validate against AI-BOS Constitution Framework',
      category: 'constitution',
      severity: 'error',
      enabled: this.options.enableConstitutionValidation || false,
      run: async input => this.runConstitutionValidation(input),
    })

    // Step 2: Token validation (depends on constitution)
    this.registerStep({
      id: 'tokens',
      name: 'Token Validation',
      description: 'Validate design token usage and compliance',
      category: 'tokens',
      severity: 'error',
      dependencies: ['constitution'],
      enabled: this.options.enableTokenValidation || false,
      run: async input => this.runTokenValidation(input),
    })

    // Step 3: Tailwind validation (depends on tokens)
    this.registerStep({
      id: 'tailwind',
      name: 'Tailwind Validation',
      description: 'Validate Tailwind class usage and MCP compliance',
      category: 'tailwind',
      severity: 'warning',
      dependencies: ['tokens'],
      enabled: this.options.enableTailwindValidation || false,
      run: async input => this.runTailwindValidation(input),
    })

    // Step 4: RSC boundary validation (independent)
    this.registerStep({
      id: 'rsc',
      name: 'RSC Boundary Validation',
      description: 'Validate React Server Component boundaries',
      category: 'rsc',
      severity: 'error',
      enabled: this.options.enableRSCValidation || false,
      run: async input => this.runRSCValidation(input),
    })

    // Step 5: Accessibility validation (independent)
    this.registerStep({
      id: 'accessibility',
      name: 'Accessibility Validation',
      description: 'Validate WCAG compliance and accessibility features',
      category: 'accessibility',
      severity: 'warning',
      enabled: this.options.enableAccessibilityValidation || false,
      run: async input => this.runAccessibilityValidation(input),
    })

    // Step 6: Motion validation (depends on accessibility)
    this.registerStep({
      id: 'motion',
      name: 'Motion Validation',
      description: 'Validate animations and reduced motion support',
      category: 'motion',
      severity: 'info',
      dependencies: ['accessibility'],
      enabled: this.options.enableMotionValidation || false,
      run: async input => this.runMotionValidation(input),
    })

    // Step 7: Semantic validation (optional)
    this.registerStep({
      id: 'semantic',
      name: 'Semantic HTML Validation',
      description: 'Validate semantic HTML structure and landmarks',
      category: 'semantic',
      severity: 'info',
      enabled: this.options.enableSemanticValidation || false,
      run: async input => this.runSemanticValidation(input),
    })

    // Step 8: Naming validation (optional)
    this.registerStep({
      id: 'naming',
      name: 'Naming Convention Validation',
      description: 'Validate component and variable naming conventions',
      category: 'naming',
      severity: 'info',
      enabled: this.options.enableNamingValidation || false,
      run: async input => this.runNamingValidation(input),
    })
  }

  /**
   * PATCH: Register a validation step
   */
  public registerStep(step: PipelineStep): void {
    this.steps.set(step.id, step)
  }

  /**
   * PATCH: Unregister a validation step
   */
  public unregisterStep(stepId: string): void {
    this.steps.delete(stepId)
  }

  /**
   * PATCH: Get ordered steps based on dependencies
   */
  private getOrderedSteps(): PipelineStep[] {
    const steps = Array.from(this.steps.values()).filter(step => step.enabled)
    const ordered: PipelineStep[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (step: PipelineStep) => {
      if (visiting.has(step.id)) {
        throw new Error(`Circular dependency detected: ${step.id}`)
      }
      if (visited.has(step.id)) {
        return
      }

      visiting.add(step.id)

      if (step.dependencies) {
        for (const depId of step.dependencies) {
          const depStep = this.steps.get(depId)
          if (depStep && depStep.enabled) {
            visit(depStep)
          }
        }
      }

      visiting.delete(step.id)
      visited.add(step.id)
      ordered.push(step)
    }

    for (const step of steps) {
      if (!visited.has(step.id)) {
        visit(step)
      }
    }

    return ordered
  }

  /**
   * PATCH: Enhanced validation pipeline with proper orchestration
   * Next.js MCP Guardian: AI-governed Constitution Pipeline
   */
  async validateComponent(
    componentCode: string,
    componentName?: string
  ): Promise<PipelineValidationResult> {
    const startTime = Date.now()
    const stages: string[] = []
    const stageResults: Record<string, ValidationStepOutput> = {}

    const allViolations: McpValidationResult['violations'] = []
    const allWarnings: string[] = []
    const allSuggestions: McpValidationResult['suggestions'] = []
    let totalScore = 100

    // PATCH: Get ordered pipeline steps
    const orderedSteps = this.getOrderedSteps()
    const previousResults: ValidationStepOutput[] = []

    let passedSteps = 0
    let failedSteps = 0

    // PATCH: Execute ordered pipeline steps with dependency management
    for (const step of orderedSteps) {
      const stepStart = Date.now()
      stages.push(step.id)

      try {
        const stepInput: ValidationStepInput = {
          code: componentCode,
          componentName,
          tenantContext: this.options.tenantContext,
          previousResults,
        }

        const stepOutput = await step.run(stepInput)
        stageResults[step.id] = stepOutput
        previousResults.push(stepOutput)

        // PATCH: Severity-based flow control
        const errorViolations = stepOutput.violations.filter(
          v => v.severity === 'error'
        )
        const warningViolations = stepOutput.violations.filter(
          v => v.severity === 'warning'
        )
        const infoViolations = stepOutput.violations.filter(
          v => v.severity === 'info'
        )

        allViolations.push(
          ...errorViolations.map(v => ({
            rule: step.id,
            message: v.message,
            severity: v.severity,
            suggestion: v.suggestion,
            autoFixable: !!v.autoFix,
          }))
        )
        allWarnings.push(...warningViolations.map(v => v.message))
        allWarnings.push(...stepOutput.warnings)
        allSuggestions.push(
          ...infoViolations.map(v => ({
            type: 'fix' as const,
            message: v.message,
          }))
        )
        allSuggestions.push(
          ...stepOutput.suggestions.map(s => ({
            type: 'enhancement' as const,
            message: s,
          }))
        )

        // PATCH: Update counters
        if (stepOutput.passed) {
          passedSteps++
        } else {
          failedSteps++
        }

        // PATCH: Record telemetry
        this.recordTelemetry({
          stepId: step.id,
          duration: stepOutput.duration,
          violations: stepOutput.violations.length,
          warnings: stepOutput.warnings.length,
          timestamp: Date.now(),
          tenantContext: this.options.tenantContext,
        })

        // PATCH: Severity gating - stop on critical errors
        if (
          errorViolations.length > 0 &&
          this.options.validationPolicy?.stopOnError
        ) {
          console.warn(
            `Pipeline stopped at step '${step.id}' due to critical errors`
          )
          break
        }
      } catch (error) {
        const errorOutput: ValidationStepOutput = {
          stepId: step.id,
          passed: false,
          duration: Date.now() - stepStart,
          violations: [
            {
              message: `${step.name} failed: ${error}`,
              severity: 'error',
            },
          ],
          warnings: [],
          suggestions: [],
        }

        stageResults[step.id] = errorOutput
        allViolations.push({
          rule: step.id,
          message: `${step.name} failed: ${error}`,
          severity: 'error',
          autoFixable: false,
        })
        failedSteps++

        // PATCH: Record error telemetry
        this.recordTelemetry({
          stepId: step.id,
          duration: Date.now() - stepStart,
          violations: 1,
          warnings: 0,
          timestamp: Date.now(),
          tenantContext: this.options.tenantContext,
        })
      }
    }

    const totalDuration = Date.now() - startTime
    const totalSteps = orderedSteps.length

    return {
      isValid: allViolations.length === 0,
      violations: allViolations,
      warnings: allWarnings,
      suggestions: allSuggestions,
      score: totalScore,
      timestamp: new Date(),
      governance: {
        isAllowed:
          allViolations.filter(v => v.severity === 'error').length === 0,
        blockRender: false,
        constitutionVersion: '2.0.0',
        safeMode: this.options.tenantContext?.safeMode || false,
      },
      context: {
        componentName,
        componentType: componentCode.includes("'use client'")
          ? 'client'
          : 'rsc',
        hasClientDirective: componentCode.includes("'use client'"),
        usesTokens: this.extractTokens(componentCode),
        accessibility: {
          hasAriaLabels: /aria-\w+/.test(componentCode),
          hasKeyboardSupport: /onKey\w+/.test(componentCode),
          wcagCompliance: allViolations.length === 0 ? 'AA' : 'partial',
        },
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
        validationTime: totalDuration,
        pipelineSteps: stages,
        cacheHit: false,
        aborted: false,
      },
      pipeline: {
        stages,
        duration: totalDuration,
        stageResults,
        // PATCH: Enhanced telemetry
        telemetry: {
          totalSteps,
          passedSteps,
          failedSteps,
          averageDuration: totalSteps > 0 ? totalDuration / totalSteps : 0,
          tenantContext: this.options.tenantContext,
          constitutionVersion: this.getConstitutionVersion(),
        },
      },
    }
  }

  // ===================================================================
  // PATCH: Individual Validation Step Methods
  // ===================================================================

  /**
   * PATCH: Constitution validation step
   */
  private async runConstitutionValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()

    try {
      const result = await this.componentValidator.validateComponent(
        input.code,
        input.componentName
      )

      return {
        stepId: 'constitution',
        passed: result.isValid,
        duration: Date.now() - startTime,
        violations: result.violations.map(violation => ({
          message:
            typeof violation === 'string' ? violation : violation.message,
          severity: 'error' as const,
        })),
        warnings: result.warnings,
        suggestions: result.suggestions.map(s =>
          typeof s === 'string' ? s : s.message
        ),
        metadata: {
          score: result.score,
          context: result.context,
        },
      }
    } catch (error) {
      return {
        stepId: 'constitution',
        passed: false,
        duration: Date.now() - startTime,
        violations: [
          {
            message: `Constitution validation failed: ${error}`,
            severity: 'error' as const,
          },
        ],
        warnings: [],
        suggestions: [],
      }
    }
  }

  /**
   * PATCH: Token validation step
   */
  private async runTokenValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()
    const violations: Array<{
      message: string
      severity: 'error' | 'warning' | 'info'
    }> = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const tokens = this.extractTokens(input.code)
    const hasClientDirective = input.code.includes("'use client'")

    for (const token of tokens) {
      const validation = tokenHelpers.validateTokenUsage(
        token.replace('--', ''),
        hasClientDirective ? 'client' : 'server'
      )

      if (!validation.isValid) {
        violations.push({
          message: `Invalid token: ${token}`,
          severity: 'error',
        })
      }

      violations.push(
        ...validation.violations.map(msg => ({
          message: msg,
          severity: 'warning' as const,
        }))
      )
      warnings.push(...validation.suggestions)
    }

    return {
      stepId: 'tokens',
      passed: violations.filter(v => v.severity === 'error').length === 0,
      duration: Date.now() - startTime,
      violations,
      warnings,
      suggestions,
      metadata: {
        tokensFound: tokens.length,
        clientDirective: hasClientDirective,
      },
    }
  }

  /**
   * PATCH: Tailwind validation step
   */
  private async runTailwindValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()
    const violations: Array<{
      message: string
      severity: 'error' | 'warning' | 'info'
    }> = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Detect arbitrary values (forbidden in MCP)
    const arbitraryValues = input.code.match(/\w+-\[[^\]]+\]/g) || []
    for (const arbitrary of arbitraryValues) {
      violations.push({
        message: `Arbitrary Tailwind value not allowed: ${arbitrary}. Use design tokens instead.`,
        severity: 'error',
      })
    }

    // Detect raw hex colors
    const hexColors =
      input.code.match(/(?:text|bg|border)-\[#[0-9a-fA-F]{3,6}\]/g) || []
    for (const hex of hexColors) {
      violations.push({
        message: `Raw hex color not allowed: ${hex}. Use semantic color tokens.`,
        severity: 'error',
      })
    }

    return {
      stepId: 'tailwind',
      passed: violations.filter(v => v.severity === 'error').length === 0,
      duration: Date.now() - startTime,
      violations,
      warnings,
      suggestions,
      metadata: {
        arbitraryValues: arbitraryValues.length,
        hexColors: hexColors.length,
      },
    }
  }

  /**
   * PATCH: RSC validation step
   */
  private async runRSCValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()
    const result = this.validateRSCBoundaries(input.code)

    return {
      stepId: 'rsc',
      passed: result.violations.length === 0,
      duration: Date.now() - startTime,
      violations: result.violations.map(msg => ({
        message: msg,
        severity: 'error' as const,
      })),
      warnings: result.warnings,
      suggestions: result.suggestions,
    }
  }

  /**
   * PATCH: Accessibility validation step
   */
  private async runAccessibilityValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()
    const result = this.validateAccessibility(input.code)

    return {
      stepId: 'accessibility',
      passed: result.violations.length === 0,
      duration: Date.now() - startTime,
      violations: result.violations.map(msg => ({
        message: msg,
        severity: 'warning' as const,
      })),
      warnings: result.warnings,
      suggestions: result.suggestions,
    }
  }

  /**
   * PATCH: Motion validation step
   */
  private async runMotionValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()
    const violations: Array<{
      message: string
      severity: 'error' | 'warning' | 'info'
    }> = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const hasAnimations = /animate-|transition-/.test(input.code)
    const hasReducedMotionCheck = /prefers-reduced-motion/.test(input.code)

    if (hasAnimations && !hasReducedMotionCheck) {
      suggestions.push(
        'Consider adding reduced motion support for accessibility'
      )
    }

    // Safe mode check
    if (input.tenantContext?.safeMode && hasAnimations) {
      warnings.push('Safe mode active: Animations may be reduced or disabled')
    }

    return {
      stepId: 'motion',
      passed: true,
      duration: Date.now() - startTime,
      violations,
      warnings,
      suggestions,
      metadata: {
        hasAnimations,
        hasReducedMotionCheck,
        safeMode: input.tenantContext?.safeMode,
      },
    }
  }

  /**
   * PATCH: Semantic validation step
   */
  private async runSemanticValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()
    const violations: Array<{
      message: string
      severity: 'error' | 'warning' | 'info'
    }> = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check for div soup
    const divCount = (input.code.match(/<div/g) || []).length
    const totalElements = (input.code.match(/<\w+/g) || []).length
    if (divCount > totalElements * 0.7) {
      suggestions.push(
        'Consider using semantic HTML elements (header, nav, main, section, article) instead of divs'
      )
    }

    return {
      stepId: 'semantic',
      passed: true,
      duration: Date.now() - startTime,
      violations,
      warnings,
      suggestions,
      metadata: {
        divCount,
        totalElements,
        divRatio: totalElements > 0 ? divCount / totalElements : 0,
      },
    }
  }

  /**
   * PATCH: Naming validation step
   */
  private async runNamingValidation(
    input: ValidationStepInput
  ): Promise<ValidationStepOutput> {
    const startTime = Date.now()
    const violations: Array<{
      message: string
      severity: 'error' | 'warning' | 'info'
    }> = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check component naming convention
    const componentName = input.componentName
    if (componentName && !/^[A-Z][A-Za-z0-9]*$/.test(componentName)) {
      violations.push({
        message: `Component name '${componentName}' should use PascalCase`,
        severity: 'warning',
      })
    }

    return {
      stepId: 'naming',
      passed: violations.filter(v => v.severity === 'error').length === 0,
      duration: Date.now() - startTime,
      violations,
      warnings,
      suggestions,
      metadata: {
        componentName,
      },
    }
  }

  /**
   * Validate RSC boundaries
   */
  private validateRSCBoundaries(code: string): {
    violations: string[]
    warnings: string[]
    suggestions: string[]
  } {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const hasClientDirective = code.includes("'use client'")
    const hasReactHooks = /use[A-Z]\w*\(/.test(code)
    const hasEventHandlers = /on[A-Z]\w*=/.test(code)
    const hasBrowserAPIs = /window\.|document\./.test(code)
    const hasServerOnlyImports = code.includes('server-only')

    // Server Component with client features
    if (
      !hasClientDirective &&
      (hasReactHooks || hasEventHandlers || hasBrowserAPIs)
    ) {
      violations.push(
        "Server Component uses client-side features without 'use client' directive"
      )
    }

    // Client Component with server-only imports
    if (hasClientDirective && hasServerOnlyImports) {
      violations.push('Client Component imports server-only modules')
    }

    // Unnecessary client directive
    if (
      hasClientDirective &&
      !hasReactHooks &&
      !hasEventHandlers &&
      !hasBrowserAPIs
    ) {
      suggestions.push("Component may not need 'use client' directive")
    }

    return { violations, warnings, suggestions }
  }

  /**
   * Validate accessibility features
   */
  private validateAccessibility(code: string): {
    violations: string[]
    warnings: string[]
    suggestions: string[]
  } {
    const violations: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    const hasInteractiveElements = /<(button|input|select|textarea|a)/i.test(
      code
    )
    const hasAriaLabels = /aria-\w+/.test(code)
    const hasKeyboardSupport = /onKey\w+/.test(code) || /tabIndex/.test(code)

    if (hasInteractiveElements && !hasAriaLabels) {
      warnings.push('Interactive elements should have ARIA labels')
    }

    if (hasInteractiveElements && !hasKeyboardSupport) {
      warnings.push('Interactive elements should support keyboard navigation')
    }

    // Form validation
    if (/<input|select|textarea/i.test(code) && !/<label/i.test(code)) {
      violations.push('Form elements must have associated labels')
    }

    return { violations, warnings, suggestions }
  }

  /**
   * Extract tokens from component code
   */
  private extractTokens(code: string): string[] {
    const tokenMatches = code.match(/--[\w-]+/g) || []
    return [...new Set(tokenMatches)]
  }

  // ===================================================================
  // PATCH: Utility Methods and Telemetry
  // ===================================================================

  /**
   * PATCH: Record telemetry data
   */
  private recordTelemetry(data: {
    stepId: string
    duration: number
    violations: number
    warnings: number
    timestamp: number
    tenantContext?: TenantContext
  }): void {
    this.telemetryData.push(data)

    // Keep only last 1000 entries to prevent memory leaks
    if (this.telemetryData.length > 1000) {
      this.telemetryData = this.telemetryData.slice(-1000)
    }
  }

  /**
   * PATCH: Get constitution version
   */
  private getConstitutionVersion(): string {
    // In production, this would read from constitution manifest
    return '1.0.0'
  }

  /**
   * PATCH: Add constitution rule
   */
  public addConstitutionRule(rule: ConstitutionRule): void {
    this.constitutionRules.set(rule.id, rule)
    // Update component validator
    this.componentValidator.addConstitutionRule(rule)
  }

  /**
   * PATCH: Remove constitution rule
   */
  public removeConstitutionRule(ruleId: string): void {
    this.constitutionRules.delete(ruleId)
    this.componentValidator.removeConstitutionRule(ruleId)
  }

  /**
   * PATCH: Set tenant context
   */
  public setTenantContext(tenantContext: TenantContext): void {
    this.options.tenantContext = tenantContext
    this.componentValidator.setTenantContext(tenantContext)
  }

  /**
   * PATCH: Get pipeline metrics for telemetry
   */
  public getPipelineMetrics(): {
    totalValidations: number
    averageDuration: number
    successRate: number
    stepMetrics: Record<
      string,
      {
        count: number
        averageDuration: number
        successRate: number
      }
    >
    tenantMetrics?: Record<
      string,
      {
        validations: number
        successRate: number
      }
    >
  } {
    const totalValidations = this.telemetryData.length
    const averageDuration =
      totalValidations > 0
        ? this.telemetryData.reduce((sum, data) => sum + data.duration, 0) /
          totalValidations
        : 0

    const successfulValidations = this.telemetryData.filter(
      data => data.violations === 0
    ).length
    const successRate =
      totalValidations > 0 ? successfulValidations / totalValidations : 0

    // Step-level metrics
    const stepMetrics: Record<
      string,
      { count: number; averageDuration: number; successRate: number }
    > = {}
    const stepGroups = this.telemetryData.reduce(
      (groups, data) => {
        if (!groups[data.stepId]) groups[data.stepId] = []
        groups[data.stepId].push(data)
        return groups
      },
      {} as Record<string, typeof this.telemetryData>
    )

    for (const [stepId, stepData] of Object.entries(stepGroups)) {
      const count = stepData.length
      const avgDuration =
        stepData.reduce((sum, data) => sum + data.duration, 0) / count
      const successful = stepData.filter(data => data.violations === 0).length
      const stepSuccessRate = successful / count

      stepMetrics[stepId] = {
        count,
        averageDuration: avgDuration,
        successRate: stepSuccessRate,
      }
    }

    // Tenant-level metrics
    const tenantMetrics: Record<
      string,
      { validations: number; successRate: number }
    > = {}
    const tenantGroups = this.telemetryData.reduce(
      (groups, data) => {
        const tenant = data.tenantContext?.tenant || 'default'
        if (!groups[tenant]) groups[tenant] = []
        groups[tenant].push(data)
        return groups
      },
      {} as Record<string, typeof this.telemetryData>
    )

    for (const [tenant, tenantData] of Object.entries(tenantGroups)) {
      const validations = tenantData.length
      const successful = tenantData.filter(data => data.violations === 0).length
      const tenantSuccessRate = successful / validations

      tenantMetrics[tenant] = {
        validations,
        successRate: tenantSuccessRate,
      }
    }

    return {
      totalValidations,
      averageDuration,
      successRate,
      stepMetrics,
      tenantMetrics,
    }
  }

  /**
   * PATCH: Enhanced update options with step reconfiguration
   */
  updateOptions(options: Partial<ValidationPipelineOptions>) {
    this.options = { ...this.options, ...options }

    // Update constitution rules if provided
    if (options.constitutionRules) {
      this.constitutionRules.clear()
      options.constitutionRules.forEach(rule => {
        this.constitutionRules.set(rule.id, rule)
      })
    }

    // Recreate component validator with new options
    this.componentValidator = new ComponentValidator({
      validateTokens: this.options.enableTokenValidation,
      validateAccessibility: this.options.enableAccessibilityValidation,
      validateRSC: this.options.enableRSCValidation,
      validateMotion: this.options.enableMotionValidation,
      validateTailwindClasses: this.options.enableTailwindValidation,
      validateSemanticHTML: this.options.enableSemanticValidation,
      strictMode: this.options.strictMode,
      constitutionRules: Array.from(this.constitutionRules.values()),
      tenantContext: this.options.tenantContext,
    })

    // Reinitialize steps with new options
    this.steps.clear()
    this.initializeDefaultSteps()
  }
}

// Export singleton instance for convenience
export const validationPipeline = new ValidationPipeline({
  enableTokenValidation: true,
  enableAccessibilityValidation: true,
  enableRSCValidation: true,
  enableMotionValidation: true,
  strictMode: false,
})

// PATCH: Type aliases for backward compatibility and index exports
// export type PipelineValidationResult = McpValidationResult; // Duplicate - using interface above
export type ValidationStep = PipelineStep
export type ValidationSequence = PipelineStep[]
export type PipelineMetrics = {
  totalSteps: number
  completedSteps: number
  failedSteps: number
  totalDuration: number
  averageStepTime: number
}
export type RuleRegistry = Map<string, ConstitutionRule>
