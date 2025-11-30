// ======================================================================
// AI-BOS Design Tokens Index v3.3
// Entry point for ALL design tokens
// Exposes:
//   - Semantic Tokens (SSOT)
//   - Server Tokens (RSC-safe)
//   - Client Tokens (interactive)
//   - Token Types (MCP-friendly)
// ======================================================================

// ---------------------------------------------------------------
// 1. DESIGN TOKENS (SSOT)
// ---------------------------------------------------------------
export {
  colorTokens,
  typographyTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  contrastTokens,
  safeModeTokens,
  themeTokens,
  type ColorToken,
  type TypographyToken,
  type RadiusToken,
  type ShadowToken,
  type SpacingToken,
  type ContrastToken,
  type SafeModeToken,
  type ThemeToken,
} from "./tokens";

// ---------------------------------------------------------------
// 2. SERVER TOKENS (RSC-safe)
// ---------------------------------------------------------------
export { serverTokens, type ServerTokens } from "./server";

// ---------------------------------------------------------------
// 3. CLIENT TOKENS (interactive-only)
// ---------------------------------------------------------------
export { clientTokens, type ClientTokens } from "./client";
