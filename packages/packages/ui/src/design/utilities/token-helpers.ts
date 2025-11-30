// ======================================================================
// AI-BOS Token Helpers v3.3
// A collection of utilities for working with design tokens safely.
//
// Goals:
// - Zero drift between tokens.ts and CSS variables
// - RSC-safe token-safe helpers
// - Convert semantic tokens → inline CSS styles
// - Token validation helpers for MCP
// - Client-safe helpers for computed styles
// ======================================================================

import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  shadowTokens,
  typographyTokens,
  themeTokens,
  type ColorToken,
  type SpacingToken,
  type RadiusToken,
  type ShadowToken,
  type TypographyToken,
  type ThemeToken,
} from "../tokens";

// ----------------------------------------------------------------------
// 1. TOKEN NAME VALIDATORS (MCP relies on these)
// ----------------------------------------------------------------------

export function isColorToken(token: string): token is ColorToken {
  return token in colorTokens;
}

export function isSpacingToken(token: string): token is SpacingToken {
  return token in spacingTokens;
}

export function isRadiusToken(token: string): token is RadiusToken {
  return token in radiusTokens;
}

export function isShadowToken(token: string): token is ShadowToken {
  return token in shadowTokens;
}

export function isTypographyToken(token: string): token is TypographyToken {
  return token in typographyTokens;
}

// ----------------------------------------------------------------------
// 2. RSC-SAFE TOKEN RESOLUTION
// ----------------------------------------------------------------------
// These functions return CSS variables directly without touching window/document
// ----------------------------------------------------------------------

export function resolveColor(token: ColorToken): string {
  return colorTokens[token];
}

export function resolveSpacing(token: SpacingToken): string {
  return spacingTokens[token];
}

export function resolveRadius(token: RadiusToken): string {
  return radiusTokens[token];
}

export function resolveShadow(token: ShadowToken): string {
  return shadowTokens[token];
}

export function resolveTypography(token: TypographyToken): string {
  return typographyTokens[token];
}

// ----------------------------------------------------------------------
// 3. STYLE BUILDERS (Inline style object generators)
//    These allow direct token → style usage in components
// ----------------------------------------------------------------------

export function colorStyle(token: ColorToken) {
  return { color: resolveColor(token) };
}

export function backgroundStyle(token: ColorToken) {
  return { backgroundColor: resolveColor(token) };
}

export function borderStyle(token: ColorToken) {
  return { borderColor: resolveColor(token) };
}

export function paddingStyle(token: SpacingToken) {
  return { padding: resolveSpacing(token) };
}

export function paddingX(token: SpacingToken) {
  return { paddingInline: resolveSpacing(token) };
}

export function paddingY(token: SpacingToken) {
  return { paddingBlock: resolveSpacing(token) };
}

export function marginStyle(token: SpacingToken) {
  return { margin: resolveSpacing(token) };
}

export function radiusStyle(token: RadiusToken) {
  return { borderRadius: resolveRadius(token) };
}

export function shadowStyle(token: ShadowToken) {
  return { boxShadow: resolveShadow(token) };
}

export function typographyStyle(token: TypographyToken) {
  return { fontSize: resolveTypography(token) };
}

// Combined shorthand
export function box(token: SpacingToken) {
  return {
    padding: resolveSpacing(token),
    margin: resolveSpacing(token),
  };
}

// ----------------------------------------------------------------------
// 4. COMPOSITE STYLE HELPERS (ERP-safe preset bundles)
//    Uses themeTokens for WCAG/Tenant override compatibility
// ----------------------------------------------------------------------

export function cardSurfaceStyle() {
  return {
    backgroundColor: themeTokens.bgElevated,
    border: `1px solid ${themeTokens.border}`,
    borderRadius: themeTokens.radiusLg,
    boxShadow: themeTokens.shadowXs,
  };
}

export function inputSurfaceStyle() {
  return {
    backgroundColor: themeTokens.bgElevated,
    border: `1px solid ${themeTokens.border}`,
    borderRadius: themeTokens.radiusMd,
  };
}

export function primaryButtonSurface() {
  return {
    backgroundColor: themeTokens.primary,
    color: themeTokens.primaryForeground,
    borderRadius: themeTokens.radiusLg,
  };
}

// ----------------------------------------------------------------------
// 4b. THEME TOKEN VALIDATOR
// ----------------------------------------------------------------------

export function isThemeToken(token: string): token is ThemeToken {
  return token in themeTokens;
}

export function resolveTheme(token: ThemeToken): string {
  return themeTokens[token];
}

// ----------------------------------------------------------------------
// 5. CLIENT-SIDE TOKEN EVALUATION (Optional)
//    For situations where a component truly needs real-time computed style.
//    DO NOT USE inside Server Components.
// ----------------------------------------------------------------------

export function getComputedTokenValue(
  cssVar: string,
  fallback?: string
): string | undefined {
  if (typeof window === "undefined") return fallback;
  // Extract variable name from var(--name) format
  const varName = cssVar.startsWith("var(") 
    ? cssVar.slice(4, -1) 
    : cssVar;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || fallback;
}

export const clientResolve = {
  color: (t: ColorToken) => getComputedTokenValue(colorTokens[t]),
  spacing: (t: SpacingToken) => getComputedTokenValue(spacingTokens[t]),
  radius: (t: RadiusToken) => getComputedTokenValue(radiusTokens[t]),
  shadow: (t: ShadowToken) => getComputedTokenValue(shadowTokens[t]),
  typo: (t: TypographyToken) => getComputedTokenValue(typographyTokens[t]),
};

// ----------------------------------------------------------------------
// 6. TOKEN VALIDATION (MCP uses this)
// ----------------------------------------------------------------------

export interface TokenValidationResult {
  isValid: boolean;
  violations: string[];
  suggestions: string[];
}

export function validateTokenUsage(
  token: string,
  context: 'server' | 'client'
): TokenValidationResult {
  const violations: string[] = [];
  const suggestions: string[] = [];

  // Check if token exists in any token group
  const isKnownToken =
    isColorToken(token) ||
    isSpacingToken(token) ||
    isRadiusToken(token) ||
    isShadowToken(token) ||
    isTypographyToken(token) ||
    isThemeToken(token);

  if (!isKnownToken) {
    violations.push(`Unknown token: ${token}`);
    suggestions.push('Use tokens defined in design system');
  }

  // Theme tokens should be used in client components
  if (isThemeToken(token) && context === 'server') {
    suggestions.push(`Consider using base tokens instead of theme tokens in server components`);
  }

  return {
    isValid: violations.length === 0,
    violations,
    suggestions,
  };
}

// ----------------------------------------------------------------------
// 7. TOKEN DEBUGGER (MCP uses this)
// ----------------------------------------------------------------------

export function debugTokenGroup() {
  return {
    colors: colorTokens,
    spacing: spacingTokens,
    radius: radiusTokens,
    shadows: shadowTokens,
    typography: typographyTokens,
    theme: themeTokens,
  };
}

// ----------------------------------------------------------------------
// 8. NAMESPACE EXPORT (for MCP compatibility)
// ----------------------------------------------------------------------

export const tokenHelpers = {
  isColorToken,
  isSpacingToken,
  isRadiusToken,
  isShadowToken,
  isTypographyToken,
  isThemeToken,
  resolveColor,
  resolveSpacing,
  resolveRadius,
  resolveShadow,
  resolveTypography,
  resolveTheme,
  validateTokenUsage,
  debugTokenGroup,
  colorStyle,
  backgroundStyle,
  borderStyle,
  paddingStyle,
  paddingX,
  paddingY,
  marginStyle,
  radiusStyle,
  shadowStyle,
  typographyStyle,
  box,
  cardSurfaceStyle,
  inputSurfaceStyle,
  primaryButtonSurface,
  getComputedTokenValue,
  clientResolve,
};