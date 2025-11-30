// packages/ui/mcp/providers/index.ts
// Central export hub for MCP providers - ENTERPRISE CONSTITUTION EDITION
// All MCP context providers and unified governance orchestration
// Version: 2.0.0 - Enterprise AI-BOS Constitution Implementation

// PATCH: Core MCP Provider - Unified AI-Governed Constitution Orchestrator (9.9/10)
export {
  McpProvider,
  useMcp,
  useMcpValidationContext,
  useMcpThemeContext,
  useMcpConstitutionContext,
} from './McpProvider'
export type { McpContextValue, McpProviderProps } from './McpProvider'

// PATCH: Enhanced Theme Provider - AI-Governed Constitution Theme Engine (9.9/10)
export { McpThemeProvider, useThemeTokens } from './ThemeProvider'
export type {
  McpThemeContextValue,
  McpThemeProviderProps,
} from './ThemeProvider'
