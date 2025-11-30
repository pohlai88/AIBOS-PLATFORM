/**
 * MCP Context Provider - ENTERPRISE CONSTITUTION ORCHESTRATOR
 *
 * Unified AI-governed Constitution orchestrator for all MCP features
 * Next.js MCP Guardian: Central orchestration of theme, validation, and governance
 *
 * @version 2.0.0 - Enterprise AI-BOS Constitution Implementation
 * @guardian Next.js MCP - Context orchestration and state management
 * @composer React MCP - Provider implementation and hooks
 * @helper Tailwind MCP - Theme and token integration
 *
 * PATCH: Unified provider chain with ThemeProvider and ValidationPipeline
 * PATCH: Constitution loading and governance enforcement
 * PATCH: Token management with design system integration
 * PATCH: Enterprise telemetry and manifest integration
 */

'use client'

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useMemo,
} from 'react'
import { ValidationPipeline } from '../tools/ValidationPipeline'
import { ComponentValidator } from '../tools/ComponentValidator'
import { McpThemeProvider } from './ThemeProvider'
import { useMcpTheme } from '../hooks/useMcpTheme'
import { tokenHelpers } from '../../src/design/utilities/token-helpers'
import type {
  McpValidationResult,
  ConstitutionRule,
  TenantContext,
  ValidationPolicy,
  McpContext as McpContextType,
} from '../types/mcp'

// PATCH: Enhanced MCP context with unified governance
export interface McpContextValue {
  // PATCH: Enhanced theme with constitution integration
  theme: {
    mode: 'default' | 'wcag-aa' | 'wcag-aaa' | 'high-contrast'
    safeMode: boolean // PATCH: Separated from theme mode
    tenant?: string
    tokens: Record<string, string>
    isDark: boolean
    contrastMode: 'normal' | 'aa' | 'aaa'
    // PATCH: Theme governance metadata
    governance: {
      isValid: boolean
      violations: Array<{ token: string; message: string; severity: string }>
      validated: boolean
    }
  }

  // PATCH: Enhanced validation with pipeline integration
  validation: {
    enabled: boolean
    realTime: boolean
    strictMode: boolean
    results: Map<string, McpValidationResult>
    // PATCH: Pipeline integration
    pipeline: ValidationPipeline | null
    policy: ValidationPolicy | null
  }

  // PATCH: Enhanced component generation
  generation: {
    autoValidate: boolean
    defaultComponentType:
      | 'primitive'
      | 'semantic'
      | 'composition'
      | 'compound'
      | 'interactive'
      | 'layout'
      | 'rsc'
      | 'client'
      | 'hybrid'
      | 'ai'
      | 'tenant'
      | 'theme-aware'
    aiModel: 'gpt-4' | 'claude-3' | 'local'
    templateEngine: boolean
  }

  // PATCH: Enhanced constitution with file loading
  constitution: {
    version: string
    rules: ConstitutionRule[]
    enforceTokens: boolean
    enforceAccessibility: boolean
    enforceRSC: boolean
    enforceMotion: boolean
    // PATCH: Constitution file loading
    loaded: boolean
    manifest: any | null
  }

  // PATCH: Enhanced tenant context
  tenant: {
    id?: string
    name?: string
    theme?: string
    overrides: Record<string, string>
    isolation: boolean
  }

  // PATCH: Environment and runtime context
  environment: {
    mode: 'development' | 'test' | 'production' | 'strict'
    mcpVersion: string
    features: string[]
  }

  // PATCH: Enhanced actions with governance
  actions: {
    validateComponent: (
      code: string,
      name?: string
    ) => Promise<McpValidationResult>
    setThemeMode: (mode: McpContextValue['theme']['mode']) => void
    setSafeMode: (enabled: boolean) => void
    setTenant: (tenant: string) => void
    toggleDarkMode: () => void
    setContrastMode: (mode: 'normal' | 'aa' | 'aaa') => void
    updateValidationSettings: (
      settings: Partial<McpContextValue['validation']>
    ) => void
    updateConstitutionSettings: (
      settings: Partial<McpContextValue['constitution']>
    ) => void
    loadConstitution: () => Promise<void>
    clearCache: () => void
    // PATCH: New governance actions
    validateTheme: (overrides: Record<string, string>) => Promise<any>
    generateComponent: (options: any) => Promise<any>
  }
}

const McpContext = createContext<McpContextValue | null>(null)

// PATCH: Enhanced provider props with constitution integration
export interface McpProviderProps {
  children: ReactNode

  // PATCH: Enhanced theme options
  initialTheme?: McpContextValue['theme']['mode']
  safeMode?: boolean
  contrastMode?: 'normal' | 'aa' | 'aaa'
  darkMode?: boolean

  // PATCH: Tenant configuration
  tenant?: string
  tenantConfig?: {
    name: string
    theme: string
    overrides: Record<string, string>
  }

  // PATCH: Validation configuration
  validationEnabled?: boolean
  strictMode?: boolean
  realTimeValidation?: boolean
  validationPolicy?: ValidationPolicy

  // PATCH: Constitution configuration
  constitutionRules?: ConstitutionRule[]
  constitutionVersion?: string
  autoLoadConstitution?: boolean

  // PATCH: Environment configuration
  environment?: 'development' | 'test' | 'production' | 'strict'
  enableTelemetry?: boolean

  // PATCH: Advanced options
  enableCache?: boolean
  preventFlash?: boolean
  fallbackTheme?: Record<string, string>

  // PATCH: Event handlers
  onError?: (error: Error) => void
  onTelemetry?: (event: any) => void
  onConstitutionLoad?: (constitution: any) => void
}

/**
 * PATCH: Enterprise MCP Provider - Unified Constitution Orchestrator
 *
 * Provides unified governance for theme, validation, and constitution enforcement
 * Integrates ThemeProvider, ValidationPipeline, and component generation
 */
export function McpProvider({
  children,
  // PATCH: Enhanced theme options
  initialTheme = 'default',
  safeMode = false,
  contrastMode = 'normal',
  darkMode = false,
  // PATCH: Tenant configuration
  tenant,
  tenantConfig,
  // PATCH: Validation configuration
  validationEnabled = true,
  strictMode = false,
  realTimeValidation = true,
  validationPolicy,
  // PATCH: Constitution configuration
  constitutionRules = [],
  constitutionVersion = '2.0.0',
  autoLoadConstitution = true,
  // PATCH: Environment configuration
  environment = 'development',
  enableTelemetry = true,
  // PATCH: Advanced options
  enableCache = true,
  preventFlash = true,
  fallbackTheme,
  // PATCH: Event handlers
  onError,
  onTelemetry,
  onConstitutionLoad,
}: McpProviderProps) {
  // PATCH: Enhanced theme state
  const [themeMode, setThemeMode] =
    useState<McpContextValue['theme']['mode']>(initialTheme)
  const [safeModeEnabled, setSafeModeEnabled] = useState(safeMode)
  const [currentContrastMode, setCurrentContrastMode] = useState<
    'normal' | 'aa' | 'aaa'
  >(contrastMode)
  const [isDark, setIsDark] = useState(darkMode)
  const [tokens, setTokens] = useState<Record<string, string>>({})
  const [themeGovernance, setThemeGovernance] = useState({
    isValid: true,
    violations: [] as Array<{
      token: string
      message: string
      severity: string
    }>,
    validated: false,
  })

  // PATCH: Enhanced validation state
  const [validationEnabled_, setValidationEnabled] = useState(validationEnabled)
  const [realTime, setRealTime] = useState(realTimeValidation)
  const [strictMode_, setStrictMode] = useState(strictMode)
  const [validationResults, setValidationResults] = useState<
    Map<string, McpValidationResult>
  >(new Map())
  const [validationPipeline, setValidationPipeline] =
    useState<ValidationPipeline | null>(null)
  const [validationPolicyState, setValidationPolicyState] =
    useState<ValidationPolicy | null>(validationPolicy || null)

  // PATCH: Enhanced generation settings
  const [autoValidate, setAutoValidate] = useState(true)
  const [defaultComponentType, setDefaultComponentType] =
    useState<McpContextValue['generation']['defaultComponentType']>('primitive')
  const [aiModel, setAiModel] = useState<'gpt-4' | 'claude-3' | 'local'>(
    'gpt-4'
  )
  const [templateEngine, setTemplateEngine] = useState(true)

  // PATCH: Enhanced constitution state
  const [constitutionState, setConstitutionState] = useState({
    version: constitutionVersion,
    rules: constitutionRules,
    enforceTokens: true,
    enforceAccessibility: true,
    enforceRSC: true,
    enforceMotion: true,
    loaded: constitutionRules.length > 0,
    manifest: null as any,
  })

  // PATCH: Enhanced tenant state
  const [tenantState, setTenantState] = useState({
    id: tenant,
    name: tenantConfig?.name || tenant,
    theme: tenantConfig?.theme,
    overrides: tenantConfig?.overrides || {},
    isolation: true,
  })

  // PATCH: Environment state
  const [environmentState] = useState({
    mode: environment,
    mcpVersion: '2.0.0',
    features: [
      'theme',
      'validation',
      'generation',
      'constitution',
      'telemetry',
    ],
  })

  // PATCH: Enhanced refs for enterprise features
  const validationPipelineRef = useRef<ValidationPipeline | null>(null)
  const componentValidatorRef = useRef<ComponentValidator | null>(null)
  const constitutionCacheRef = useRef<Map<string, any>>(new Map())
  const telemetryRef = useRef({ events: [] as any[], count: 0 })

  // PATCH: Initialize validation pipeline
  useEffect(() => {
    if (constitutionState.rules.length > 0) {
      const pipeline = new ValidationPipeline({
        constitutionRules: constitutionState.rules,
        tenantContext: {
          tenant: tenantState.id,
          safeMode: safeModeEnabled,
          contrastMode: currentContrastMode,
          darkMode: isDark,
        } as TenantContext,
        validationPolicy: validationPolicyState || {
          stopOnError: false,
          warnOnWarning: true,
          enforceAccessibility: currentContrastMode !== 'normal',
          allowAutoFix: true,
          strictMode: false,
        },
      })

      validationPipelineRef.current = pipeline
      setValidationPipeline(pipeline)

      componentValidatorRef.current = new ComponentValidator({
        constitutionRules: constitutionState.rules,
        strictMode: strictMode_,
        enableTelemetry,
      })
    }
  }, [
    constitutionState.rules,
    tenantState.id,
    safeModeEnabled,
    currentContrastMode,
    isDark,
    validationPolicyState,
    strictMode_,
    enableTelemetry,
  ])

  // PATCH: Load constitution files
  const loadConstitution = async () => {
    try {
      // TODO: Load constitution files from manifest or API
      const mockConstitution = {
        version: constitutionVersion,
        rules: constitutionRules,
        manifest: {
          tokens: {},
          components: {},
          accessibility: {},
          motion: {},
        },
      }

      setConstitutionState(prev => ({
        ...prev,
        loaded: true,
        manifest: mockConstitution.manifest,
      }))

      if (onConstitutionLoad) {
        onConstitutionLoad(mockConstitution)
      }

      // Send telemetry
      if (enableTelemetry && onTelemetry) {
        onTelemetry({
          type: 'constitution-loaded',
          version: constitutionVersion,
          rulesCount: constitutionRules.length,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Failed to load constitution:', error)
      if (onError) onError(error as Error)
    }
  }

  useEffect(() => {
    if (autoLoadConstitution && !constitutionState.loaded) {
      loadConstitution()
    }
  }, [
    autoLoadConstitution,
    constitutionState.loaded,
    constitutionVersion,
    constitutionRules.length,
    enableTelemetry,
    onConstitutionLoad,
    onTelemetry,
    onError,
  ])

  // PATCH: Load design tokens
  useEffect(() => {
    const loadTokens = async () => {
      try {
        // Load base tokens from design system
        const baseTokens = await import('../../src/design/tokens/tokens')
        const clientTokens = await import('../../src/design/tokens/client')

        // Merge with tenant overrides and flatten to string values
        const mergedTokens: Record<string, string> = {}

        // Flatten baseTokens structure to simple key-value pairs
        const flattenTokens = (obj: any, prefix = ''): void => {
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
              mergedTokens[prefix + key] = value
            } else if (typeof value === 'object' && value !== null) {
              flattenTokens(value, prefix + key + '-')
            }
          }
        }

        flattenTokens(baseTokens)

        // Add tenant overrides
        if (tenantState.overrides) {
          Object.assign(mergedTokens, tenantState.overrides)
        }

        setTokens(mergedTokens)
      } catch (error) {
        console.warn('Failed to load design tokens:', error)
        if (onError) onError(error as Error)
      }
    }

    loadTokens()
  }, [tenantState.overrides, onError])

  // PATCH: Remove DOM manipulation - delegated to ThemeProvider
  // DOM attributes are now managed by ThemeProvider to avoid conflicts

  // PATCH: Enhanced actions with ValidationPipeline integration
  const validateComponent = async (
    code: string,
    name?: string
  ): Promise<McpValidationResult> => {
    try {
      let result: McpValidationResult

      // PATCH: Use ValidationPipeline instead of ComponentValidator directly
      if (validationPipelineRef.current) {
        const pipelineResult =
          await validationPipelineRef.current.validateComponent(
            code,
            name || 'UnknownComponent'
          )

        // Convert pipeline result to McpValidationResult format
        result = {
          isValid: pipelineResult.violations.length === 0,
          violations: pipelineResult.violations.map(v => ({
            rule: 'constitution',
            message:
              typeof v === 'string' ? v : v.message || 'Constitution violation',
            severity: 'error' as const,
            autoFixable: false,
          })),
          warnings: pipelineResult.warnings,
          suggestions: [],
          score: Math.max(0, 100 - pipelineResult.violations.length * 10),
          timestamp: new Date(),
          governance: {
            isAllowed: pipelineResult.violations.length === 0,
            blockRender: false,
            constitutionVersion: constitutionState.version,
            tenant: tenantState.id,
            safeMode: safeModeEnabled,
          },
          context: {
            componentType: 'auto' as const,
            hasClientDirective:
              code.includes("'use client'") || code.includes('"use client"'),
            usesTokens: code.match(/--[\w-]+/g) || [],
            accessibility: {
              hasAriaLabels: /aria-\w+/.test(code),
              hasKeyboardSupport:
                /onKey\w+/.test(code) || /tabIndex/.test(code),
              wcagCompliance:
                currentContrastMode === 'aaa'
                  ? 'AAA'
                  : currentContrastMode === 'aa'
                    ? 'AA'
                    : 'partial',
            },
            performance: {
              codeSize: code.length,
              complexity: (code.match(/if|for|while|switch|catch/g) || [])
                .length,
              renderBlocking: false,
            },
            security: {
              hasUnsafePatterns:
                /dangerouslySetInnerHTML|eval\(|Function\(/.test(code),
              tenantIsolation:
                !tenantState.id ||
                !code.includes('tenant') ||
                code.includes(tenantState.id),
            },
          },
          telemetry: {
            validationTime: 0,
            pipelineSteps: ['constitution'],
            cacheHit: false,
            aborted: false,
          },
        }
      } else if (componentValidatorRef.current) {
        // Fallback to ComponentValidator
        const validatorResult =
          await componentValidatorRef.current.validateComponent(code, name)
        result = {
          ...validatorResult,
          context: {
            ...validatorResult.context,
            componentType: validatorResult.context.componentType || 'auto',
          },
        }
      } else {
        // Basic validation fallback
        result = {
          isValid: true,
          violations: [],
          warnings: [],
          suggestions: [],
          score: 100,
          timestamp: new Date(),
          governance: {
            isAllowed: true,
            blockRender: false,
            constitutionVersion: constitutionState.version,
            tenant: tenantState.id,
            safeMode: safeModeEnabled,
          },
          context: {
            componentType: 'auto' as const,
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
              renderBlocking: false,
            },
            security: {
              hasUnsafePatterns: false,
              tenantIsolation: true,
            },
          },
          telemetry: {
            validationTime: 0,
            pipelineSteps: ['fallback'],
            cacheHit: false,
            aborted: false,
          },
        }
      }

      // Store result for later reference
      const key = name || `component-${Date.now()}`
      setValidationResults(prev => new Map(prev.set(key, result)))

      // Send telemetry
      if (enableTelemetry && onTelemetry) {
        onTelemetry({
          type: 'component-validation',
          component: name,
          isValid: result.isValid,
          violations: result.violations.length,
          timestamp: new Date().toISOString(),
        })
      }

      return result
    } catch (error) {
      if (onError) onError(error as Error)
      throw error
    }
  }

  // PATCH: Enhanced theme actions
  const handleSetThemeMode = (mode: McpContextValue['theme']['mode']) => {
    setThemeMode(mode)

    // Send telemetry
    if (enableTelemetry && onTelemetry) {
      onTelemetry({
        type: 'theme-mode-change',
        mode,
        tenant: tenantState.id,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleSetSafeMode = (enabled: boolean) => {
    setSafeModeEnabled(enabled)

    // Send telemetry
    if (enableTelemetry && onTelemetry) {
      onTelemetry({
        type: 'safe-mode-toggle',
        enabled,
        tenant: tenantState.id,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleSetTenant = (tenant: string) => {
    setTenantState(prev => ({
      ...prev,
      id: tenant,
      name: tenant,
    }))

    // Send telemetry
    if (enableTelemetry && onTelemetry) {
      onTelemetry({
        type: 'tenant-change',
        tenant,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const toggleDarkMode = () => {
    setIsDark(prev => !prev)

    // Send telemetry
    if (enableTelemetry && onTelemetry) {
      onTelemetry({
        type: 'dark-mode-toggle',
        enabled: !isDark,
        tenant: tenantState.id,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const handleSetContrastMode = (mode: 'normal' | 'aa' | 'aaa') => {
    setCurrentContrastMode(mode)

    // Send telemetry
    if (enableTelemetry && onTelemetry) {
      onTelemetry({
        type: 'contrast-mode-change',
        mode,
        tenant: tenantState.id,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const updateValidationSettings = (
    settings: Partial<McpContextValue['validation']>
  ) => {
    if (settings.enabled !== undefined) setValidationEnabled(settings.enabled)
    if (settings.realTime !== undefined) setRealTime(settings.realTime)
    if (settings.strictMode !== undefined) setStrictMode(settings.strictMode)
    if (settings.policy !== undefined) setValidationPolicyState(settings.policy)
  }

  const updateConstitutionSettings = (
    settings: Partial<McpContextValue['constitution']>
  ) => {
    setConstitutionState(prev => ({
      ...prev,
      ...settings,
    }))
  }

  // PATCH: New governance actions (moved loadConstitution above)

  const clearCache = () => {
    constitutionCacheRef.current.clear()
    setValidationResults(new Map())

    // Send telemetry
    if (enableTelemetry && onTelemetry) {
      onTelemetry({
        type: 'cache-cleared',
        tenant: tenantState.id,
        timestamp: new Date().toISOString(),
      })
    }
  }

  const validateTheme = async (overrides: Record<string, string>) => {
    // TODO: Implement theme validation through ValidationPipeline
    return { isValid: true, violations: [] }
  }

  const generateComponent = async (options: any) => {
    // TODO: Implement component generation integration
    return { code: '', metadata: {} }
  }

  // PATCH: Enhanced context value with unified governance
  const contextValue: McpContextValue = useMemo(
    () => ({
      theme: {
        mode: themeMode,
        safeMode: safeModeEnabled,
        tenant: tenantState.id,
        tokens,
        isDark,
        contrastMode: currentContrastMode,
        governance: themeGovernance,
      },
      validation: {
        enabled: validationEnabled_,
        realTime,
        strictMode: strictMode_,
        results: validationResults,
        pipeline: validationPipeline,
        policy: validationPolicyState,
      },
      generation: {
        autoValidate,
        defaultComponentType,
        aiModel,
        templateEngine,
      },
      constitution: constitutionState,
      tenant: tenantState,
      environment: environmentState,
      actions: {
        validateComponent,
        setThemeMode: handleSetThemeMode,
        setSafeMode: handleSetSafeMode,
        setTenant: handleSetTenant,
        toggleDarkMode,
        setContrastMode: handleSetContrastMode,
        updateValidationSettings,
        updateConstitutionSettings,
        loadConstitution,
        clearCache,
        validateTheme,
        generateComponent,
      },
    }),
    [
      themeMode,
      safeModeEnabled,
      tenantState,
      tokens,
      isDark,
      currentContrastMode,
      themeGovernance,
      validationEnabled_,
      realTime,
      strictMode_,
      validationResults,
      validationPipeline,
      validationPolicyState,
      autoValidate,
      defaultComponentType,
      aiModel,
      templateEngine,
      constitutionState,
      environmentState,
      validateComponent,
      handleSetThemeMode,
      handleSetSafeMode,
      handleSetTenant,
      toggleDarkMode,
      handleSetContrastMode,
      updateValidationSettings,
      updateConstitutionSettings,
      loadConstitution,
      clearCache,
      validateTheme,
      generateComponent,
    ]
  )

  // PATCH: Unified provider chain with ThemeProvider integration
  return (
    <McpContext.Provider value={contextValue}>
      <McpThemeProvider
        tenant={tenantState.id}
        safeMode={safeModeEnabled}
        contrastMode={currentContrastMode}
        darkMode={isDark}
        constitutionRules={constitutionState.rules}
        validationPolicy={validationPolicyState || undefined}
        enableTelemetry={enableTelemetry}
        onTelemetry={onTelemetry}
        enableCache={enableCache}
        preventFlash={preventFlash}
        fallbackTheme={fallbackTheme}
        onError={onError}
        validateOnLoad={validationEnabled_}
        strictMode={strictMode_}
        enableDomAttributes={true}
      >
        {children}
      </McpThemeProvider>
    </McpContext.Provider>
  )
}

/**
 * Hook to access MCP context
 * Next.js MCP Guardian: Centralized access to MCP functionality
 */
export function useMcp(): McpContextValue {
  const context = useContext(McpContext)
  if (!context) {
    throw new Error('useMcp must be used within an McpProvider')
  }
  return context
}

/**
 * Hook to access MCP validation specifically
 */
export function useMcpValidationContext() {
  const { validation, actions } = useMcp()
  return {
    ...validation,
    validateComponent: actions.validateComponent,
  }
}

/**
 * Hook to access MCP theme specifically
 */
export function useMcpThemeContext() {
  const { theme, actions } = useMcp()
  return {
    ...theme,
    setThemeMode: actions.setThemeMode,
    setTenant: actions.setTenant,
    toggleDarkMode: actions.toggleDarkMode,
  }
}

/**
 * Hook to access MCP constitution specifically
 */
export function useMcpConstitutionContext() {
  const { constitution, actions } = useMcp()
  return {
    ...constitution,
    updateConstitutionSettings: actions.updateConstitutionSettings,
  }
}
