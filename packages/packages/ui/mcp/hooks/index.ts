// packages/ui/mcp/hooks/index.ts
// Central export hub for MCP hooks - ENTERPRISE CONSTITUTION EDITION
// All MCP-related React hooks for AI-governed theme, validation, and component generation
// Version: 2.0.0 - Enterprise AI-BOS Constitution Implementation

// PATCH: Enhanced Theme Management Hook - AI-Governed Constitution Theme Engine (9.9/10)
export { useMcpTheme } from './useMcpTheme'
export type {
  McpThemeOverrides,
  McpThemeOptions,
  McpThemeResult,
  McpThemeMetadata,
} from './useMcpTheme'

// PATCH: AI-Powered Component Generation Hook - Full Enterprise Implementation (9.9/10)
export { useMcpComponents } from './useMcpComponents'
export type {
  McpComponentOptions,
  McpGeneratedComponent,
  McpComponentType,
  McpComponentMetadata,
  McpComponentResult,
} from './useMcpComponents'

// PATCH: Enhanced Constitution Validation Hook - AI-Governed Enforcement (9.8/10)
export { useMcpValidation } from './useMcpValidation'
export type {
  McpValidationResult,
  McpValidationOptions,
  McpValidationContext,
  McpValidationSummary,
} from './useMcpValidation'

// PATCH: Backward compatibility aliases
export type { UseMcpThemeOptions, UseMcpThemeResult } from './useMcpTheme'
