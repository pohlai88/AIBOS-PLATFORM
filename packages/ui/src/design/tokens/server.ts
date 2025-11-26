// ======================================================================
// AI-BOS Design Tokens — SERVER EDITION v3.3
// RSC-Safe Tokens for Server Components (NO client APIs, NO motion)
// Pure semantic tokens, aligned with globals.css v3.3 & tokens.ts v3.3
// ======================================================================

import {
  colorTokens,
  typographyTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  contrastTokens,
  safeModeTokens,
  themeTokens,
} from "./tokens";

// ----------------------------------------------------------------------
// SERVER-ONLY: Provide a consolidated export of ALL semantic tokens
// This can be used inside Server Components without hydration risks.
// ----------------------------------------------------------------------
export const serverTokens = {
  // Raw design tokens (for internal use / MCP validation)
  color: colorTokens,
  typography: typographyTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  spacing: spacingTokens,
  contrast: contrastTokens,
  safemode: safeModeTokens,

  // Theme tokens (components MUST use these)
  theme: themeTokens,
} as const;

// ----------------------------------------------------------------------
// RSC-STRICT RULE:
// DO NOT ADD animation, transitions, visibility, media-queries,
// window/document access, or any reactive client behavior here.
// ----------------------------------------------------------------------

export type ServerTokens = typeof serverTokens;
