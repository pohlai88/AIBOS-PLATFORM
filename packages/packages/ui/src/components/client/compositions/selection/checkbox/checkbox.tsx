/**
 * Checkbox Component - Layer 2 Radix Composition
 *
 * A checkbox component built on Radix UI Checkbox primitive.
 *
 * @module Checkbox
 * @layer 2
 * @radixPrimitive @radix-ui/react-checkbox
 * @category selection
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as React from 'react'

import { radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  CheckboxProps,
  CheckboxSize,
  CheckboxVariant,
} from './checkbox.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const checkboxSizeVariants: Record<CheckboxSize, { root: string; icon: string }> =
  {
    sm: { root: 'h-3.5 w-3.5', icon: 'h-3 w-3' },
    md: { root: 'h-4 w-4', icon: 'h-3.5 w-3.5' },
    lg: { root: 'h-5 w-5', icon: 'h-4 w-4' },
  }

const checkboxVariantStyles: Record<CheckboxVariant, string> = {
  default:
    'data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  primary:
    'data-[state=checked]:bg-blue-600 data-[state=checked]:text-white data-[state=checked]:border-blue-600',
  success:
    'data-[state=checked]:bg-green-600 data-[state=checked]:text-white data-[state=checked]:border-green-600',
}

// ============================================================================
// Checkbox Component
// ============================================================================

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = 'md', variant = 'default', testId, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      'peer shrink-0 border border-primary',
      radiusTokens.sm,
      'ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      checkboxSizeVariants[size].root,
      checkboxVariantStyles[variant],
      'mcp-client-interactive',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      {props.checked === 'indeterminate' ? (
        <MinusIcon className={checkboxSizeVariants[size].icon} />
      ) : (
        <CheckIcon className={checkboxSizeVariants[size].icon} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

// ============================================================================
// Exports
// ============================================================================

export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxVariant,
} from './checkbox.types'

export { checkboxSizeVariants, checkboxVariantStyles }

export default Checkbox

