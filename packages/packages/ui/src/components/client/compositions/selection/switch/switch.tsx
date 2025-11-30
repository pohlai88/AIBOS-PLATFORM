/**
 * Switch Component - Layer 2 Radix Composition
 *
 * A toggle switch component built on Radix UI Switch primitive.
 *
 * @module Switch
 * @layer 2
 * @radixPrimitive @radix-ui/react-switch
 * @category selection
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as React from 'react'

import { radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type { SwitchProps, SwitchSize, SwitchVariant } from './switch.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const switchSizeVariants: Record<SwitchSize, { root: string; thumb: string }> = {
  sm: {
    root: 'h-4 w-7',
    thumb: 'h-3 w-3 data-[state=checked]:translate-x-3',
  },
  md: {
    root: 'h-5 w-9',
    thumb: 'h-4 w-4 data-[state=checked]:translate-x-4',
  },
  lg: {
    root: 'h-6 w-11',
    thumb: 'h-5 w-5 data-[state=checked]:translate-x-5',
  },
}

const switchVariantStyles: Record<SwitchVariant, string> = {
  default: 'data-[state=checked]:bg-primary',
  success: 'data-[state=checked]:bg-green-500',
  warning: 'data-[state=checked]:bg-yellow-500',
}

// ============================================================================
// Switch Component
// ============================================================================

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = 'md', variant = 'default', testId, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      'peer inline-flex shrink-0 cursor-pointer items-center',
      'border-2 border-transparent',
      radiusTokens.full,
      'transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=unchecked]:bg-input',
      switchSizeVariants[size].root,
      switchVariantStyles[variant],
      'mcp-client-interactive',
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block rounded-full bg-background shadow-lg ring-0',
        'transition-transform',
        'data-[state=unchecked]:translate-x-0',
        switchSizeVariants[size].thumb
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

// ============================================================================
// Exports
// ============================================================================

export type { SwitchProps, SwitchSize, SwitchVariant } from './switch.types'

export { switchSizeVariants, switchVariantStyles }

export default Switch

