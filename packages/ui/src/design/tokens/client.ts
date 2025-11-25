/**
 * Client-Safe Design Tokens - React MCP Helper
 *
 * Tokens that can be safely used in Client Components
 * Includes dynamic tokens that may change based on user interaction
 *
 * MCP Architecture:
 * - React MCP: Helper for client component token validation
 * - Next.js MCP: Guardian of client/server boundaries
 * - Tailwind MCP: Helper for interactive CSS classes
 */

'use client'

import { useState, useEffect } from 'react'

// NOTE: Do NOT re-export tokens.ts from here to prevent server code
// accidentally importing a client-marked module.
// Use @aibos/ui/design for shared tokens instead.
import { tokenHelpers } from '../utilities/token-helpers'

// Client-specific token utilities (React MCP approved)
export const clientTokens = {
  // Dynamic tokens that can change based on user state
  interactive: {
    hover: {
      primary: 'hover:opacity-95',
      secondary: 'hover:bg-secondary-soft/80',
      ghost: 'hover:border-border hover:bg-bg-muted',
    },
    active: {
      primary: 'active:scale-[0.98]',
      secondary: 'active:scale-[0.98]',
      ghost: 'active:scale-[0.98]',
    },
    focus: {
      ring: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      border: 'focus-visible:border-ring',
    },
  },

  // Animation tokens for client-side interactions
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    // Tailwind MCP Helper: Animation classes
    classes: {
      transition: 'transition-all duration-300 ease-in-out',
      fadeIn: 'animate-in fade-in duration-300',
      fadeOut: 'animate-out fade-out duration-300',
      slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
      slideOut: 'animate-out slide-out-to-bottom-4 duration-300',
    },
  },

  // State-based tokens (client-only)
  states: {
    loading: 'animate-pulse opacity-50',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    selected: 'ring-2 ring-primary ring-offset-2',
    error: 'ring-2 ring-danger border-danger',
  },

  // Theme-aware tokens (client-reactive)
  theme: {
    // These can change based on user theme preference
    surface: {
      default: 'bg-bg text-fg',
      elevated: 'bg-bg-elevated text-fg shadow-sm',
      muted: 'bg-bg-muted text-fg-muted',
    },
  },
}

// React MCP Helper: Client-side token resolution with reactivity
export function useClientToken(tokenPath: string): {
  value: string | undefined
  isValid: boolean
  error: string | null
} {
  const [value, setValue] = useState<string | undefined>(undefined)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Validate token for client usage
    const validation = tokenHelpers.validateTokenUsage(tokenPath, 'client')

    if (!validation.isValid) {
      // Use a timeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setError(validation.violations.join(', '))
        setIsValid(false)
        setValue(undefined)
      }, 0)
      return () => clearTimeout(timer)
    }

    // Get token value
    const tokenValue = tokenHelpers.getTokenValue(tokenPath)
    setValue(tokenValue)
    setIsValid(true)
    setError(null)
  }, [tokenPath])

  return { value, isValid, error }
}

// React MCP Helper: Theme-aware token hook
export function useThemeToken(tokenPath: string, fallback?: string): string {
  const { value, isValid } = useClientToken(tokenPath)

  if (!isValid || !value) {
    console.warn(
      `[React MCP] Invalid theme token: ${tokenPath}, using fallback`
    )
    return fallback || ''
  }

  return value
}

// React MCP Helper: Validate client component token usage
export function validateClientTokens(componentCode: string): {
  isValid: boolean
  violations: string[]
  suggestions: string[]
} {
  const violations: string[] = []
  const suggestions: string[] = []

  // Check for missing 'use client' directive
  if (
    !componentCode.includes("'use client'") &&
    !componentCode.includes('"use client"')
  ) {
    violations.push("Client component must have 'use client' directive")
    suggestions.push("Add 'use client' at the top of the file")
  }

  // Check for server-only patterns in client components
  const serverOnlyPatterns = [
    /async\s+function/g,
    /await\s+fetch/g,
    /getServerSideProps/g,
    /getStaticProps/g,
  ]

  for (const pattern of serverOnlyPatterns) {
    if (pattern.test(componentCode)) {
      violations.push(
        `Server-only pattern found in client component: ${pattern.source}`
      )
      suggestions.push(
        'Move server-side logic to Server Components or API routes'
      )
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
    suggestions,
  }
}

// Client-specific token path type (strongly typed for MCP tools)
export type ClientTokenPath =
  | `interactive.hover.${keyof typeof clientTokens.interactive.hover}`
  | `interactive.active.${keyof typeof clientTokens.interactive.active}`
  | `interactive.focus.${keyof typeof clientTokens.interactive.focus}`
  | `animations.duration.${keyof typeof clientTokens.animations.duration}`
  | `animations.easing.${keyof typeof clientTokens.animations.easing}`
  | `animations.classes.${keyof typeof clientTokens.animations.classes}`
  | `states.${keyof typeof clientTokens.states}`

// React MCP Helper: Ergonomic hooks for developers
export function useInteractiveToken(
  kind: keyof typeof clientTokens.interactive.hover
): string {
  return clientTokens.interactive.hover[kind]
}

export function useAnimationPreset(
  preset: keyof typeof clientTokens.animations.classes
): string {
  return clientTokens.animations.classes[preset]
}

// React MCP Helper: Reduced motion support (connects to globals.css)
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setPrefersReduced(mq.matches)
    }, 0)

    const handler = (event: MediaQueryListEvent) =>
      setPrefersReduced(event.matches)
    mq.addEventListener('change', handler)
    return () => {
      clearTimeout(timer)
      mq.removeEventListener('change', handler)
    }
  }, [])

  return prefersReduced
}

// React MCP Helper: Get all client-safe tokens (strongly typed)
export function getClientSafeTokens(): ClientTokenPath[] {
  return [
    ...Object.keys(clientTokens.interactive.hover).map(
      k => `interactive.hover.${k}` as const
    ),
    ...Object.keys(clientTokens.interactive.active).map(
      k => `interactive.active.${k}` as const
    ),
    ...Object.keys(clientTokens.interactive.focus).map(
      k => `interactive.focus.${k}` as const
    ),
    ...Object.keys(clientTokens.animations.duration).map(
      k => `animations.duration.${k}` as const
    ),
    ...Object.keys(clientTokens.animations.easing).map(
      k => `animations.easing.${k}` as const
    ),
    ...Object.keys(clientTokens.animations.classes).map(
      k => `animations.classes.${k}` as const
    ),
    ...Object.keys(clientTokens.states).map(k => `states.${k}` as const),
  ] as ClientTokenPath[]
}
