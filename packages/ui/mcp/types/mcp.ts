/**
 * MCP Type Definitions - Enterprise Grade
 *
 * TypeScript types for MCP functionality and constitution validation
 * Fixed circular dependencies and enhanced for production use
 *
 * @version 2.0.0 - Enterprise MCP Types
 * @guardian Next.js MCP - Type safety and architecture enforcement
 * @composer React MCP - Component type definitions
 * @helper Tailwind MCP - Token and styling types
 */

// ===================================================================
// ISSUE 1 FIX: Removed circular dependencies
// ===================================================================

// Constitution Types - Enhanced with Domain Segmentation
export interface ConstitutionRule {
  id: string
  domain: 'ui' | 'design' | 'runtime' | 'security' | 'schema' | 'docs'
  category:
    | 'tokens'
    | 'components'
    | 'rsc'
    | 'accessibility'
    | 'motion'
    | 'visual'
  severity: 'error' | 'warning' | 'info'
  description: string
  autoFixable: boolean
  priority?: number
  tags?: string[]
}

export interface ConstitutionViolation {
  ruleId: string
  message: string
  severity: 'error' | 'warning' | 'info'
  file?: string
  line?: number
  column?: number
  suggestion?: string
  autoFix?: string
  context?: Record<string, any>
}

// ===================================================================
// ISSUE 2 FIX: Enhanced ComponentType for RSC compliance
// ===================================================================

export type ComponentType =
  | 'rsc' // Server-only RSC (no hooks, safe)
  | 'client' // "use client" directive required
  | 'hybrid' // Wrapper: RSC → client boundary
  | 'utility' // No JSX - validators, helpers
  | 'auto' // MCP chooses best type

export type ComponentEnvironment = 'server' | 'client' | 'shared'

export interface ComponentDefinition {
  name: string
  type: ComponentType
  environment: ComponentEnvironment
  description?: string
  props?: Record<string, any>
  tokens?: string[]
  accessibility?: AccessibilityMetadata
  rsc?: RSCMetadata
  manifest?: ComponentManifest
}

// ===================================================================
// IMPROVEMENT 1: Added ManifestMetadata
// ===================================================================

export interface ComponentManifest {
  id: string
  version: string
  date: string
  description: string
  author?: string
  dependencies?: string[]
  exports?: string[]
}

export interface McpManifest {
  id: string
  version: string
  date: string
  description: string
  rules: ConstitutionRule[]
  tools: ToolMetadata[]
  compatibility: {
    nextjs: string
    react: string
    typescript: string
  }
}

// ===================================================================
// IMPROVEMENT 4: Added Tool Metadata (OpenAI MCP v1 compliant)
// ===================================================================

export interface ToolMetadata {
  id: string
  name: string
  version: string
  description: string
  sideEffects: 'none' | 'read' | 'write' | 'network'
  inputSchema?: Record<string, any>
  outputSchema?: Record<string, any>
  category: 'validation' | 'generation' | 'transformation' | 'analysis'
}

// ===================================================================
// IMPROVEMENT 2: Added AuditTrail
// ===================================================================

export interface AuditEntry {
  timestamp: number
  actor: 'ai' | 'user' | 'system' | 'mcp'
  action: string
  ruleId?: string
  violationCount?: number
  beforeState?: any
  afterState?: any
  details?: Record<string, any>
  success: boolean
  duration?: number
}

// ===================================================================
// IMPROVEMENT 3: Added Validation Severity Policy
// ===================================================================

export interface ValidationPolicy {
  stopOnError: boolean
  warnOnWarning: boolean
  enforceAccessibility: boolean
  allowAutoFix: boolean
  maxViolations?: number
  excludeRules?: string[]
  includeRules?: string[]
  strictMode: boolean
}

// PATCH: Added ComponentValidationOptions for tool integration
export interface ComponentValidationOptions {
  constitutionRules?: ConstitutionRule[]
  strictMode?: boolean
  enableTelemetry?: boolean
  tenant?: string
  safeMode?: boolean
  contrastMode?: 'normal' | 'aa' | 'aaa'
}

// Accessibility Types - Enhanced
export interface AccessibilityMetadata {
  wcagLevel: 'A' | 'AA' | 'AAA'
  hasAriaLabels: boolean
  hasKeyboardSupport: boolean
  hasFocusManagement: boolean
  touchTargetSize: number
  contrastRatio?: number
  screenReaderTested?: boolean
  keyboardTested?: boolean
  colorBlindnessTested?: boolean
}

// RSC Types - Enhanced
export interface RSCMetadata {
  isServerCompatible: boolean
  usesClientFeatures: boolean
  hasBrowserAPIs: boolean
  hasAsyncOperations: boolean
  canBeStreamed: boolean
  bundleSize?: number
  renderTime?: number
  hydrationTime?: number
}

// Token Types - Enhanced
export interface TokenDefinition {
  name: string
  category: TokenCategory
  layer: TokenLayer
  value: string | number
  description?: string
  immutable?: boolean
  tenantOverridable?: boolean
  wcagCompliant?: boolean
  darkModeValue?: string | number
}

export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'typography'
  | 'radius'
  | 'shadow'
  | 'motion'
  | 'opacity'
  | 'density'
  | 'zIndex'
  | 'focusRing'
  | 'state'
  | 'grid'
  | 'layout'
  | 'font'
  | 'border'
  | 'transition'
  | 'animation'

export type TokenLayer = 'global' | 'semantic' | 'component' | 'utility'

// Theme Types - Enhanced
export interface ThemeDefinition {
  name: string
  mode: 'default' | 'wcag-aa' | 'wcag-aaa' | 'high-contrast' | 'safe-mode'
  tokens: Record<string, TokenDefinition>
  immutable: boolean
  tenantCustomizable: boolean
  darkMode?: boolean
  contrastRatio?: number
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA'
    reducedMotion: boolean
    highContrast: boolean
  }
}

// ===================================================================
// IMPROVEMENT 5: Added Tenant Context
// ===================================================================

export interface TenantContext {
  tenant?: string
  safeMode?: boolean
  contrastMode?: 'normal' | 'aa' | 'aaa'
  darkMode?: boolean
  reducedMotion?: boolean
  brandColors?: Record<string, string>
  customTokens?: Record<string, TokenDefinition>
}

// Validation Types - Enhanced (NO circular dependencies)
export interface ValidationContext {
  componentName: string
  componentType: ComponentType
  environment: ComponentEnvironment
  strictMode: boolean
  enabledRules: string[]
  tenant?: TenantContext
  manifest: McpManifest
}

// ISSUE 1 FIX: ValidationPipeline no longer references McpContext
export interface ValidationPipeline {
  id: string
  name: string
  description?: string
  rules: ConstitutionRule[]
  policy: ValidationPolicy
  enabled: boolean
  version: string
  lastUpdated: number
}

export interface ValidationResult {
  pipelineId: string
  componentName: string
  isValid: boolean
  violations: ConstitutionViolation[]
  warnings: ConstitutionViolation[]
  suggestions: string[]
  score: number
  timestamp: number
  duration: number
  context: ValidationContext
}

// PATCH: Added McpValidationResult for hook integration
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
  score: number
  timestamp: Date
  governance: {
    isAllowed: boolean
    blockRender: boolean
    constitutionVersion: string
    tenant?: string
    safeMode: boolean
  }
  context: {
    componentType: ComponentType
    hasClientDirective: boolean
    usesTokens: string[]
    accessibility: {
      hasAriaLabels: boolean
      hasKeyboardSupport: boolean
      wcagCompliance: 'AA' | 'AAA' | 'partial' | 'none'
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
  telemetry: {
    validationTime: number
    pipelineSteps: string[]
    cacheHit: boolean
    aborted: boolean
  }
}

// ===================================================================
// MAIN MCP CONTEXT - Fixed circular dependencies
// ===================================================================

export interface McpContext {
  // Core identification
  id: string
  version: string

  // Tenant and accessibility context
  tenant: TenantContext

  // Manifest and rules (by reference, not structure)
  manifest: McpManifest

  // Validation (by ID reference, not circular structure)
  validation: {
    pipelineId: string
    policy: ValidationPolicy
    autoFix: boolean
    realTime: boolean
  }

  // Generation settings
  generation: {
    autoValidate: boolean
    defaultType: ComponentType
    outputPath: string
    templatePath?: string
  }

  // Tool registry
  tools: ToolMetadata[]

  // Audit trail
  audit: AuditEntry[]

  // Performance metrics
  metrics: {
    validationCount: number
    fixCount: number
    errorCount: number
    averageScore: number
    lastValidation?: number
  }
}

// MCP Server Configuration - Enhanced
export interface McpServerConfig {
  context: McpContext
  validation: {
    pipelineIds: string[]
    defaultPipelineId: string
  }
  constitution: {
    tokensPath: string
    componentsPath: string
    rscPath: string
    manifestPath: string
  }
  generation: {
    templatesPath: string
    outputPath: string
    autoValidate: boolean
    defaultType: ComponentType
  }
  server: {
    port?: number
    host?: string
    cors?: boolean
    rateLimit?: number
  }
}

// ===================================================================
// UTILITY TYPES
// ===================================================================

// Helper type for pipeline lookup (avoids circular references)
export type PipelineReference = {
  id: string
  name: string
  version: string
}

// Helper type for rule lookup
export type RuleReference = {
  id: string
  domain: ConstitutionRule['domain']
  category: ConstitutionRule['category']
  severity: ConstitutionRule['severity']
}

// Helper type for component lookup
export type ComponentReference = {
  name: string
  type: ComponentType
  environment: ComponentEnvironment
  version?: string
}

// PATCH: Removed duplicate exports - all types are already exported above
