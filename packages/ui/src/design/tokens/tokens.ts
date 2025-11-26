// ======================================================================
// AI-BOS Design Tokens v3.3 — FINAL SSOT VERSION
// WCAG AA/AAA • Dark Mode • Safe Mode • Tenant Cascading
// NO Tailwind classes. NO UI logic. Pure design tokens.
// ======================================================================

// ---------------------------------------------------------------
// COLOR TOKENS — Semantic Layers
// ---------------------------------------------------------------
export const colorTokens = {
  bg: "var(--color-bg)",
  bgMuted: "var(--color-bg-muted)",
  bgElevated: "var(--color-bg-elevated)",

  fg: "var(--color-fg)",
  fgMuted: "var(--color-fg-muted)",
  fgSubtle: "var(--color-fg-subtle)",

  primary: "var(--color-primary)",
  primarySoft: "var(--color-primary-soft)",
  primaryForeground: "var(--color-primary-foreground)",

  secondary: "var(--color-secondary)",
  secondarySoft: "var(--color-secondary-soft)",
  secondaryForeground: "var(--color-secondary-foreground)",

  brand: "var(--color-brand)",
  brandSoft: "var(--color-brand-soft)",
  brandForeground: "var(--color-brand-foreground)",

  success: "var(--color-success)",
  successSoft: "var(--color-success-soft)",
  successForeground: "var(--color-success-foreground)",

  warning: "var(--color-warning)",
  warningSoft: "var(--color-warning-soft)",
  warningForeground: "var(--color-warning-foreground)",

  danger: "var(--color-danger)",
  dangerSoft: "var(--color-danger-soft)",
  dangerForeground: "var(--color-danger-foreground)",

  border: "var(--color-border)",
  borderSubtle: "var(--color-border-subtle)",
  ring: "var(--color-ring)",
} as const;

// ---------------------------------------------------------------
// TYPOGRAPHY TOKENS — Fonts + Headings + Displays
// ---------------------------------------------------------------
export const typographyTokens = {
  // Base text sizes
  xs: "var(--font-xs)",
  sm: "var(--font-sm)",
  base: "var(--font-base)",
  lg: "var(--font-lg)",

  // Headings
  h1: "var(--font-h1)",
  h2: "var(--font-h2)",
  h3: "var(--font-h3)",
  h4: "var(--font-h4)",
  h5: "var(--font-h5)",
  h6: "var(--font-h6)",

  // Display
  displaySm: "var(--font-display-sm)",
  displayMd: "var(--font-display-md)",
  displayLg: "var(--font-display-lg)",

  // Added for MCP (missing previously)
  lineHeightNormal: "var(--line-height-normal)",
  lineHeightRelaxed: "var(--line-height-relaxed)",

  // Font family
  fontSans: "var(--font-sans)",
} as const;

// ---------------------------------------------------------------
// RADIUS TOKENS
// ---------------------------------------------------------------
export const radiusTokens = {
  xxs: "var(--radius-xxs)",
  xs: "var(--radius-xs)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  full: "var(--radius-full)",
} as const;

// ---------------------------------------------------------------
// SHADOW TOKENS
// ---------------------------------------------------------------
export const shadowTokens = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
} as const;

// ---------------------------------------------------------------
// SPACING TOKENS (ERP-Approved Scale)
// ---------------------------------------------------------------
export const spacingTokens = {
  "2xs": "var(--spacing-2xs)",
  xs: "var(--spacing-xs)",
  sm: "var(--spacing-sm)",
  md: "var(--spacing-md)",
  lg: "var(--spacing-lg)",
  xl: "var(--spacing-xl)",
  "2xl": "var(--spacing-2xl)",
  "3xl": "var(--spacing-3xl)",
  "4xl": "var(--spacing-4xl)",
  "5xl": "var(--spacing-5xl)",
  "6xl": "var(--spacing-6xl)",
} as const;

// ---------------------------------------------------------------
// LETTER SPACING TOKENS
// ---------------------------------------------------------------
export const trackingTokens = {
  tight: "var(--tracking-tight)",
  normal: "var(--tracking-normal)",
  wide: "var(--tracking-wide)",
  wider: "var(--tracking-wider)",
} as const;

// ---------------------------------------------------------------
// ACCESSIBILITY TOKENS (WCAG AA / AAA)
// ---------------------------------------------------------------
export const contrastTokens = {
  aa: { normal: 4.5, large: 3.0 },
  aaa: { normal: 7.0, large: 4.5 },
} as const;

// ---------------------------------------------------------------
// SAFE MODE TOKENS — for High-Contrast Accessibility
// ---------------------------------------------------------------
export const safeModeTokens = {
  fontMultiplier: "var(--safe-mode-font-multiplier)",
} as const;

// ---------------------------------------------------------------
// THEME TOKENS — Component-Facing Layer (WCAG/Tenant Override-Safe)
// Components MUST use these, not colorTokens/typographyTokens directly
// ---------------------------------------------------------------
export const themeTokens = {
  // Surfaces
  bg: "var(--theme-bg)",
  bgMuted: "var(--theme-bg-muted)",
  bgElevated: "var(--theme-bg-elevated)",

  // Text
  fg: "var(--theme-fg)",
  fgMuted: "var(--theme-fg-muted)",
  fgSubtle: "var(--theme-fg-subtle)",

  // Primary
  primary: "var(--theme-primary)",
  primarySoft: "var(--theme-primary-soft)",
  primaryForeground: "var(--theme-primary-foreground)",

  // Secondary
  secondary: "var(--theme-secondary)",
  secondarySoft: "var(--theme-secondary-soft)",
  secondaryForeground: "var(--theme-secondary-foreground)",

  // Brand
  brand: "var(--theme-brand)",
  brandSoft: "var(--theme-brand-soft)",
  brandForeground: "var(--theme-brand-foreground)",

  // Status
  success: "var(--theme-success)",
  successSoft: "var(--theme-success-soft)",
  successForeground: "var(--theme-success-foreground)",

  warning: "var(--theme-warning)",
  warningSoft: "var(--theme-warning-soft)",
  warningForeground: "var(--theme-warning-foreground)",

  danger: "var(--theme-danger)",
  dangerSoft: "var(--theme-danger-soft)",
  dangerForeground: "var(--theme-danger-foreground)",

  // Border / Ring
  border: "var(--theme-border)",
  borderSubtle: "var(--theme-border-subtle)",
  ring: "var(--theme-ring)",

  // Shadows
  shadowXs: "var(--theme-shadow-xs)",
  shadowSm: "var(--theme-shadow-sm)",
  shadowMd: "var(--theme-shadow-md)",
  shadowLg: "var(--theme-shadow-lg)",

  // Typography
  fontXs: "var(--theme-font-xs)",
  fontSm: "var(--theme-font-sm)",
  fontBase: "var(--theme-font-base)",
  fontLg: "var(--theme-font-lg)",
  fontH1: "var(--theme-font-h1)",
  fontH2: "var(--theme-font-h2)",
  fontH3: "var(--theme-font-h3)",
  fontH4: "var(--theme-font-h4)",
  fontH5: "var(--theme-font-h5)",
  fontH6: "var(--theme-font-h6)",
  fontDisplaySm: "var(--theme-font-display-sm)",
  fontDisplayMd: "var(--theme-font-display-md)",
  fontDisplayLg: "var(--theme-font-display-lg)",
  lineHeightNormal: "var(--theme-line-height-normal)",
  lineHeightRelaxed: "var(--theme-line-height-relaxed)",
  fontSans: "var(--theme-font-sans)",

  // Spacing
  spacing2xs: "var(--theme-spacing-2xs)",
  spacingXs: "var(--theme-spacing-xs)",
  spacingSm: "var(--theme-spacing-sm)",
  spacingMd: "var(--theme-spacing-md)",
  spacingLg: "var(--theme-spacing-lg)",
  spacingXl: "var(--theme-spacing-xl)",
  spacing2xl: "var(--theme-spacing-2xl)",
  spacing3xl: "var(--theme-spacing-3xl)",
  spacing4xl: "var(--theme-spacing-4xl)",
  spacing5xl: "var(--theme-spacing-5xl)",
  spacing6xl: "var(--theme-spacing-6xl)",

  // Letter Spacing
  trackingTight: "var(--theme-tracking-tight)",
  trackingNormal: "var(--theme-tracking-normal)",
  trackingWide: "var(--theme-tracking-wide)",
  trackingWider: "var(--theme-tracking-wider)",

  // Radius
  radiusXxs: "var(--theme-radius-xxs)",
  radiusXs: "var(--theme-radius-xs)",
  radiusSm: "var(--theme-radius-sm)",
  radiusMd: "var(--theme-radius-md)",
  radiusLg: "var(--theme-radius-lg)",
  radiusXl: "var(--theme-radius-xl)",
  radius2xl: "var(--theme-radius-2xl)",
  radiusFull: "var(--theme-radius-full)",
} as const;

// ---------------------------------------------------------------
// TYPE EXPORTS (MCP Uses These for Validation)
// ---------------------------------------------------------------
export type ColorToken = keyof typeof colorTokens;
export type RadiusToken = keyof typeof radiusTokens;
export type ShadowToken = keyof typeof shadowTokens;
export type SpacingToken = keyof typeof spacingTokens;
export type TypographyToken = keyof typeof typographyTokens;
export type ContrastToken = keyof typeof contrastTokens;
export type SafeModeToken = keyof typeof safeModeTokens;
export type ThemeToken = keyof typeof themeTokens;
