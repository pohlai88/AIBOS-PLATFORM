// packages/ui/src/design/index.ts
//
// AI-BOS Design System Entrypoint v3.3
// RSC-Safe • Tenant-Aware • WCAG AA/AAA • Token-Synced
// This is the ONLY import path consumers should use.
// Provides unified access to all design primitives.

//
// TOKENS
//
export * from "./tokens";  // colorTokens, radiusTokens, typographyTokens, serverTokens, clientTokens

//
// GLOBALS (CSS) - import directly in consuming app's layout
// import "@aibos/ui/design/tokens/globals.css"
//

//
// THEMES (Tenant / WCAG Layers) - import CSS directly in consuming app
// import "@aibos/ui/design/themes/default.css"
//

//
// UTILITIES
//
export * from "./utilities";  // cn(), token-helpers

//
// VERSION METADATA (for MCP Governance)
//
export const AIBOS_DESIGN_VERSION = "v3.3";
export const AIBOS_DESIGN_BUILD = 33001; // build number for MCP drift detection
