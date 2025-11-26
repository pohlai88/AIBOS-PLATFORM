/**
 * RadioGroup Component - Layer 2 Radix Composition
 *
 * A radio group component built on Radix UI RadioGroup primitive.
 *
 * @module RadioGroup
 * @layer 2
 * @radixPrimitive @radix-ui/react-radio-group
 * @category selection
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import * as React from 'react'

import { cn } from '../../../../../design/utilities/cn'

import type {
  RadioGroupItemProps,
  RadioGroupRootProps,
  RadioGroupSize,
  RadioGroupVariant,
} from './radio-group.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const radioGroupSizeVariants: Record<
  RadioGroupSize,
  { root: string; indicator: string }
> = {
  sm: { root: 'h-3.5 w-3.5', indicator: 'h-1.5 w-1.5' },
  md: { root: 'h-4 w-4', indicator: 'h-2 w-2' },
  lg: { root: 'h-5 w-5', indicator: 'h-2.5 w-2.5' },
}

const radioGroupVariantStyles: Record<RadioGroupVariant, string> = {
  default: 'grid gap-2',
  primary: 'grid gap-2',
  cards: 'grid gap-4',
}

// ============================================================================
// RadioGroup Root Component
// ============================================================================

export const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupRootProps
>(({ className, variant = 'default', testId, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(radioGroupVariantStyles[variant], 'mcp-client-interactive', className)}
    {...props}
  />
))
RadioGroup.displayName = 'RadioGroup'

// ============================================================================
// RadioGroup Item Component
// ============================================================================

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size = 'md', ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'aspect-square rounded-full border border-primary text-primary',
      'ring-offset-background',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      radioGroupSizeVariants[size].root,
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div
        className={cn(
          'rounded-full bg-current',
          radioGroupSizeVariants[size].indicator
        )}
      />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = 'RadioGroupItem'

// ============================================================================
// Exports
// ============================================================================

export type {
  RadioGroupItemProps,
  RadioGroupRootProps,
  RadioGroupSize,
  RadioGroupVariant,
} from './radio-group.types'

export { radioGroupSizeVariants, radioGroupVariantStyles }

export default RadioGroup

