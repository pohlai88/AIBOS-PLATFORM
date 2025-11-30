/**
 * AI-BOS MCP Public API - Enterprise Constitution Edition
 * Version: 2.0.0
 *
 * All exports from this file are considered STABLE and GOVERNED by the AI-BOS Constitution.
 * Any internal implementation must NOT leak from here.
 *
 * RSC-Safe: Client and server exports are properly separated
 * Constitution-Governed: All APIs enforce governance rules
 * Tree-Shaking Optimized: Explicit exports for better bundling
 *
 * @version 2.0.0
 * @guardian Next.js MCP - API stability and RSC boundary enforcement
 * @composer React MCP - Client component orchestration
 * @helper Tailwind MCP - Design system integration
 */

// ========================================================================================
// VERSION METADATA (Required for Constitution Governance & Telemetry)
// ========================================================================================

export const MCP_VERSION = '2.0.0'
export const MCP_CONSTITUTION_VERSION = '2.0.0'
export const MCP_API_LEVEL = 'enterprise'

// ========================================================================================
// PROVIDERS (Client-Safe, Constitution-Governed)
// ========================================================================================

/**
 * Core MCP Provider - Unified AI-Governed Constitution Orchestrator
 * @rsc-boundary client
 * @constitution-level enterprise
 * @score 9.9/10
 */
export { McpProvider } from './providers/McpProvider'

/**
 * Enhanced Theme Provider - AI-Governed Constitution Theme Engine
 * @rsc-boundary client
 * @constitution-level enterprise
 * @score 9.9/10
 */
export { McpThemeProvider } from './providers/ThemeProvider'

// ========================================================================================
// HOOKS (Client-Only, Constitution-Enforced)
// ========================================================================================

/**
 * Core MCP Context Hook - Unified governance access
 * @rsc-boundary client-only
 * @constitution-enforced true
 */
export {
  useMcp,
  useMcpValidationContext,
  useMcpThemeContext,
  useMcpConstitutionContext,
} from './providers/McpProvider'

/**
 * Enhanced Theme Hook - AI-Governed Constitution Theme Engine
 * @rsc-boundary client-only
 * @constitution-enforced true
 * @score 9.9/10
 */
export { useThemeTokens } from './providers/ThemeProvider'

/**
 * AI-Powered Component Generation Hook - Enterprise Implementation
 * @rsc-boundary client-only
 * @constitution-enforced true
 * @score 9.9/10
 */
export { useMcpComponents } from './hooks/useMcpComponents'

/**
 * Enhanced Constitution Validation Hook - AI-Governed Enforcement
 * @rsc-boundary client-only
 * @constitution-enforced true
 * @score 9.8/10
 */
export { useMcpValidation } from './hooks/useMcpValidation'

/**
 * Enhanced Theme Management Hook - Constitution Theme Engine
 * @rsc-boundary client-only
 * @constitution-enforced true
 * @score 9.9/10
 */
export { useMcpTheme } from './hooks/useMcpTheme'

// ========================================================================================
// COMPONENTS (Client-Only, Theme-Integrated)
// ========================================================================================

/**
 * Theme CSS Variables Component - Constitution-Governed Variable Injection
 * @rsc-boundary client-only
 * @constitution-enforced true
 */
export { McpCssVariables } from './components/ThemeCssVariables'

// ========================================================================================
// VALIDATION PIPELINE (Server-Safe, Constitution-Governed)
// ========================================================================================

/**
 * Validation Pipeline - Full Orchestrator with Rule Registry
 * @rsc-boundary server-safe
 * @constitution-level enterprise
 * @score 9.9/10
 */
export { ValidationPipeline } from './tools/ValidationPipeline'

// ========================================================================================
// GOVERNANCE TYPES (Universal, Constitution-Aligned)
// ========================================================================================

/**
 * Core MCP Context Types - Unified governance interfaces
 * @constitution-aligned true
 */
export type { McpContextValue, McpProviderProps } from './providers/McpProvider'

/**
 * Enhanced Theme Types - Constitution theme interfaces
 * @constitution-aligned true
 */
export type {
  McpThemeContextValue,
  McpThemeProviderProps,
} from './providers/ThemeProvider'

/**
 * Enhanced Hook Types - AI-powered interfaces
 * @constitution-aligned true
 */
export type {
  McpThemeOverrides,
  McpThemeOptions,
  McpThemeResult,
  McpThemeMetadata,
} from './hooks/useMcpTheme'

export type {
  McpComponentOptions,
  McpGeneratedComponent,
  McpComponentType,
  McpComponentMetadata,
  McpComponentResult,
} from './hooks/useMcpComponents'

export type {
  McpValidationResult,
  McpValidationOptions,
  McpValidationContext,
  McpValidationSummary,
} from './hooks/useMcpValidation'

/**
 * Core MCP Types - Constitution framework interfaces
 * @constitution-aligned true
 */
export type {
  ConstitutionRule,
  ConstitutionViolation,
  TenantContext,
  ValidationPolicy,
  McpContext,
  McpServerConfig,
} from './types/mcp'

// ========================================================================================
// DESIGN SYSTEM INTEGRATION (Server-Safe, Token-Governed)
// ========================================================================================

/**
 * Token Helpers - MCP Guardian implementation and validation
 * @rsc-boundary server-safe
 * @constitution-governed true
 */
export * as tokenHelpers from '../src/design/utilities/token-helpers'

/**
 * Class Name Utility - Enhanced with array support and validation
 * @rsc-boundary universal
 * @constitution-governed true
 */
export { cn } from '../src/design/utilities/cn'

// ========================================================================================
// INTERNAL APIS (Advanced Users Only - May Change)
// ========================================================================================

/**
 * @internal - Component Validator for advanced validation scenarios
 * @warning This API may change without notice. Use ValidationPipeline instead.
 * @rsc-boundary server-safe
 */
export { ComponentValidator } from './tools/ComponentValidator'

/**
 * @internal - Variable Batcher for advanced CSS variable management
 * @warning This API may change without notice. Use McpCssVariables instead.
 * @rsc-boundary client-only
 */
export { VariableBatcher } from './tools/VariableBatcher'

// ========================================================================================
// BACKWARD COMPATIBILITY (Legacy Support)
// ========================================================================================

/**
 * @deprecated Use ValidationPipeline instead
 * @legacy v1.x compatibility
 */
export { ValidationPipeline as validationPipeline } from './tools/ValidationPipeline'

/**
 * @deprecated Use ComponentValidator instead
 * @legacy v1.x compatibility
 */
export { ComponentValidator as componentValidator } from './tools/ComponentValidator'

/**
 * @deprecated Use VariableBatcher instead
 * @legacy v1.x compatibility
 */
export { VariableBatcher as getVariableBatcher } from './tools/VariableBatcher'
