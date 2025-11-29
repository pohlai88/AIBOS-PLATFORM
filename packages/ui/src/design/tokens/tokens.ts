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

  // Accent color
  accent: "var(--color-accent)",
  accentGlow: "var(--color-accent-glow)",
} as const;

// ---------------------------------------------------------------
// TYPOGRAPHY TOKENS — Fonts + Headings + Displays
// ---------------------------------------------------------------
export const typographyTokens = {
  // Base text sizes (Figma Best Practice: 14px minimum)
  xs: "var(--font-xs)",      // 14px
  sm: "var(--font-sm)",      // 16px
  base: "var(--font-base)",  // 18px
  lg: "var(--font-lg)",      // 20px
  xl: "var(--font-xl)",      // 24px

  // Headings (Perfect Fourth Scale)
  h1: "var(--font-h1)",      // 49px
  h2: "var(--font-h2)",      // 39px
  h3: "var(--font-h3)",      // 31px
  h4: "var(--font-h4)",      // 25px
  h5: "var(--font-h5)",      // 20px
  h6: "var(--font-h6)",      // 16px

  // Display sizes (Hero headlines)
  displaySm: "var(--font-display-sm)",  // 61px
  displayMd: "var(--font-display-md)",  // 76px
  displayLg: "var(--font-display-lg)",  // 95px

  // Line heights
  lineHeightTight: "var(--line-height-tight)",
  lineHeightNormal: "var(--line-height-normal)",
  lineHeightRelaxed: "var(--line-height-relaxed)",

  // Font family
  fontSans: "var(--font-sans)",
  fontMono: "var(--font-mono)",
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
// SHADOW TOKENS (Elevation System)
// ---------------------------------------------------------------
export const shadowTokens = {
  xs: "var(--shadow-xs)",
  sm: "var(--shadow-sm)",
  md: "var(--shadow-md)",
  lg: "var(--shadow-lg)",
  xl: "var(--shadow-xl)",
  "2xl": "var(--shadow-2xl)",
  glow: "var(--shadow-glow)",
  inner: "var(--shadow-inner)",
} as const;

// ---------------------------------------------------------------
// GRADIENT TOKENS (Cinematic Enhancements)
// ---------------------------------------------------------------
export const gradientTokens = {
  // Linear gradients
  ember: "var(--gradient-ember)",
  void: "var(--gradient-void)",
  glass: "var(--gradient-glass)",
  metallic: "var(--gradient-metallic)",
  
  // Radial gradients
  intelligence: "var(--gradient-intelligence)",
  aiGlow: "var(--gradient-ai-glow)",
  
  // Conic gradients
  spinner: "var(--gradient-spinner)",
} as const;

// ---------------------------------------------------------------
// INTERACTIVE STATE TOKENS
// ---------------------------------------------------------------
export const interactiveTokens = {
  accentHover: "var(--color-accent-hover)",
  accentActive: "var(--color-accent-active)",
  accentFocus: "var(--color-accent-focus)",
} as const;

// ---------------------------------------------------------------
// ANIMATION TIMING TOKENS
// ---------------------------------------------------------------
export const animationTokens = {
  // Durations
  instant: "var(--duration-instant)",
  fast: "var(--duration-fast)",
  normal: "var(--duration-normal)",
  slow: "var(--duration-slow)",
  slower: "var(--duration-slower)",
  cinematic: "var(--duration-cinematic)",
  
  // Easing functions
  linear: "var(--easing-linear)",
  ease: "var(--easing-ease)",
  in: "var(--easing-in)",
  out: "var(--easing-out)",
  inOut: "var(--easing-in-out)",
  smooth: "var(--easing-smooth)",
  bounce: "var(--easing-bounce)",
} as const;

// ---------------------------------------------------------------
// Z-INDEX SCALE
// ---------------------------------------------------------------
export const zIndexTokens = {
  base: "var(--z-base)",
  dropdown: "var(--z-dropdown)",
  sticky: "var(--z-sticky)",
  fixed: "var(--z-fixed)",
  modalBackdrop: "var(--z-modal-backdrop)",
  modal: "var(--z-modal)",
  popover: "var(--z-popover)",
  tooltip: "var(--z-tooltip)",
  toast: "var(--z-toast)",
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

  // Gradients
  gradientEmber: "var(--gradient-ember)",
  gradientVoid: "var(--gradient-void)",
  gradientGlass: "var(--gradient-glass)",
  gradientMetallic: "var(--gradient-metallic)",
  gradientIntelligence: "var(--gradient-intelligence)",
  gradientAiGlow: "var(--gradient-ai-glow)",
  gradientSpinner: "var(--gradient-spinner)",

  // Interactive states
  accentHover: "var(--color-accent-hover)",
  accentActive: "var(--color-accent-active)",
  accentFocus: "var(--color-accent-focus)",

  // Accent
  accent: "var(--color-accent)",
  accentGlow: "var(--color-accent-glow)",

  // Animation timing
  durationInstant: "var(--duration-instant)",
  durationFast: "var(--duration-fast)",
  durationNormal: "var(--duration-normal)",
  durationSlow: "var(--duration-slow)",
  durationSlower: "var(--duration-slower)",
  durationCinematic: "var(--duration-cinematic)",

  easingLinear: "var(--easing-linear)",
  easingEase: "var(--easing-ease)",
  easingIn: "var(--easing-in)",
  easingOut: "var(--easing-out)",
  easingInOut: "var(--easing-in-out)",
  easingSmooth: "var(--easing-smooth)",
  easingBounce: "var(--easing-bounce)",

  // Z-Index
  zBase: "var(--z-base)",
  zDropdown: "var(--z-dropdown)",
  zSticky: "var(--z-sticky)",
  zFixed: "var(--z-fixed)",
  zModalBackdrop: "var(--z-modal-backdrop)",
  zModal: "var(--z-modal)",
  zPopover: "var(--z-popover)",
  zTooltip: "var(--z-tooltip)",
  zToast: "var(--z-toast)",
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
export type GradientToken = keyof typeof gradientTokens;
export type InteractiveToken = keyof typeof interactiveTokens;
export type AnimationToken = keyof typeof animationTokens;
export type ZIndexToken = keyof typeof zIndexTokens;
