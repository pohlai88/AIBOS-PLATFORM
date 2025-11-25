// src/design/tokens.ts

// Atomic color tokens mapped to Tailwind utilities (which are backed by CSS vars)
export const colorTokens = {
  // surfaces
  bg: 'bg-bg',
  bgMuted: 'bg-bg-muted',
  bgElevated: 'bg-bg-elevated',
  border: 'border-border',
  borderSubtle: 'border-border-subtle',
  ring: 'ring-ring',

  // text
  text: 'text-fg',
  textMuted: 'text-fg-muted',
  textSubtle: 'text-fg-subtle',

  // brand surfaces
  primarySurface: 'bg-primary',
  primarySoftSurface: 'bg-primary-soft',
  secondarySurface: 'bg-secondary',
  secondarySoftSurface: 'bg-secondary-soft',

  // status surfaces
  successSurface: 'bg-success',
  successSoftSurface: 'bg-success-soft',
  warningSurface: 'bg-warning',
  warningSoftSurface: 'bg-warning-soft',
  dangerSurface: 'bg-danger',
  dangerSoftSurface: 'bg-danger-soft',
} as const

// Text-on-surface pairs (for a11y & clarity)
export const accessibilityTokens = {
  textOnBg: 'text-fg',
  textOnBgMuted: 'text-fg-muted',
  textOnBgElevated: 'text-fg',

  textOnPrimary: 'text-primary-foreground',
  textOnSecondary: 'text-secondary-foreground',

  textOnSuccess: 'text-success-foreground',
  textOnWarning: 'text-warning-foreground',
  textOnDanger: 'text-danger-foreground',
} as const

// Radius tokens – always use these instead of raw rounded-*
export const radiusTokens = {
  xs: 'rounded-[var(--radius-xs)]',
  sm: 'rounded-[var(--radius-sm)]',
  md: 'rounded-[var(--radius-md)]',
  lg: 'rounded-[var(--radius-lg)]',
  xl: 'rounded-[var(--radius-xl)]',
  '2xl': 'rounded-[var(--radius-2xl)]',
  full: 'rounded-[var(--radius-full)]',
} as const

// Shadows – backed by CSS vars so theme can change softness
export const shadowTokens = {
  xs: 'shadow-[var(--shadow-xs)]',
  sm: 'shadow-[var(--shadow-sm)]',
  md: 'shadow-[var(--shadow-md)]',
  lg: 'shadow-[var(--shadow-lg)]',
} as const

// Spacing scale for components (MCP can choose from these)
export const spacingTokens = {
  xs: 'px-2 py-1',
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-5 py-2.5',
} as const

// Typography – semantic text styles
export const typographyTokens = {
  // Labels (existing)
  labelSm: 'text-[11px] font-medium tracking-wide uppercase',
  label: 'text-sm font-medium',

  // Body text (expanded)
  bodySm: 'text-sm leading-relaxed',
  bodyMd: 'text-[15px] leading-relaxed',
  body: 'text-base leading-relaxed',
  bodyLg: 'text-lg leading-relaxed',

  // Headings - visual sizes (existing)
  headingSm: 'text-sm font-semibold',
  headingMd: 'text-base font-semibold',
  headingLg: 'text-lg font-semibold',

  // Headings - semantic levels (new)
  h1: 'text-4xl font-semibold leading-tight',
  h2: 'text-3xl font-semibold leading-tight',
  h3: 'text-2xl font-semibold leading-normal',
  h4: 'text-xl font-semibold leading-normal',
  h5: 'text-lg font-semibold leading-normal',
  h6: 'text-base font-semibold leading-normal',

  // UI text (new)
  caption: 'text-xs text-fg-subtle leading-normal',
  helpText: 'text-xs text-fg-muted leading-normal',
  overline: 'text-xs font-medium tracking-wide uppercase',

  // Display text (new)
  display: 'text-5xl font-bold leading-none',
} as const

// High-level component presets – what MCP will mostly use
export const componentTokens = {
  buttonPrimary: [
    'inline-flex items-center justify-center gap-1.5',
    spacingTokens.sm,
    radiusTokens.lg,
    colorTokens.primarySurface,
    accessibilityTokens.textOnPrimary,
    shadowTokens.xs,
    'transition hover:opacity-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ].join(' '),

  buttonSecondary: [
    'inline-flex items-center justify-center gap-1.5',
    spacingTokens.sm,
    radiusTokens.lg,
    colorTokens.secondarySoftSurface,
    accessibilityTokens.textOnSecondary,
    shadowTokens.xs,
    'border border-border hover:bg-secondary-soft/80 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ].join(' '),

  buttonGhost: [
    'inline-flex items-center justify-center gap-1.5',
    spacingTokens.sm,
    radiusTokens.lg,
    colorTokens.bgElevated,
    accessibilityTokens.textOnBgElevated,
    'border border-transparent hover:border-border hover:bg-bg-muted active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  ].join(' '),

  card: [
    colorTokens.bgElevated,
    accessibilityTokens.textOnBgElevated,
    'border border-border',
    radiusTokens.lg,
    shadowTokens.xs,
    'p-4',
  ].join(' '),

  badgePrimary: [
    'inline-flex items-center gap-1',
    'px-2 py-0.5',
    radiusTokens.full,
    colorTokens.primarySoftSurface,
    'text-[11px] font-medium',
    'border border-transparent',
  ].join(' '),

  badgeMuted: [
    'inline-flex items-center gap-1',
    'px-2 py-0.5',
    radiusTokens.full,
    colorTokens.bgMuted,
    accessibilityTokens.textOnBgMuted,
    'text-[11px] font-medium',
    'border border-border-subtle',
  ].join(' '),

  input: [
    colorTokens.bgElevated,
    accessibilityTokens.textOnBgElevated,
    'border',
    colorTokens.border,
    radiusTokens.md,
    spacingTokens.sm,
    typographyTokens.bodySm,
    'transition',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:border-ring',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    'placeholder:text-fg-subtle',
  ].join(' '),
} as const

// Types to help MCP / devs stay inside the design system
export type ColorTokenKey = keyof typeof colorTokens
export type SpacingTokenKey = keyof typeof spacingTokens
export type RadiusTokenKey = keyof typeof radiusTokens
export type ShadowTokenKey = keyof typeof shadowTokens
export type TypographyTokenKey = keyof typeof typographyTokens
export type AccessibilityTokenKey = keyof typeof accessibilityTokens
export type ComponentTokenKey = keyof typeof componentTokens

// Token categories for MCP validation
export type TokenCategory =
  | 'color'
  | 'spacing'
  | 'typography'
  | 'radius'
  | 'shadow'
  | 'component'
  | 'accessibility'
