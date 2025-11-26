// ======================================================================
// AI-BOS Design Tokens — CLIENT EDITION v3.3
// For Client Components (motion, transitions, hover, interaction flags)
// Zero overlap with semantic design tokens from tokens.ts
// ======================================================================

// ----------------------------------------------------------------------
// CLIENT-ONLY INTERACTION TOKENS
// These DO NOT exist in CSS; they are runtime constants
// to ensure RSC always stays pure and client features stay isolated.
// ----------------------------------------------------------------------
export const clientTokens = {
  motion: {
    transition: "150ms ease",
    transitionFast: "100ms ease",
    transitionSlow: "250ms ease",

    // Motion ergonomics for Safe Mode / AAA fallback
    safeModeTransition: "80ms linear",
  },

  interaction: {
    hoverOpacity: 0.95,
    activeScale: 0.98,

    // High-contrast safe-mode overrides
    safeModeHoverOpacity: 1,
    safeModeActiveScale: 1,
  },

  // Used for micro-interactions in charts, widgets, dropdowns
  effects: {
    focusRing: "0 0 0 2px var(--theme-ring)",
    cardHoverShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
} as const;

// ----------------------------------------------------------------------
// Type Export
// ----------------------------------------------------------------------
export type ClientTokens = typeof clientTokens;

// ----------------------------------------------------------------------
// CLIENT-STRICT RULE:
// Only runtime UX tokens live here.
// NO semantic colors, NO sizes, NO typography.
// ----------------------------------------------------------------------
