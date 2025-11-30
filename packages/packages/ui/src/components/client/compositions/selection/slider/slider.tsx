/**
 * Slider Component - Layer 2 Radix Composition
 *
 * A slider input component built on Radix UI Slider primitive.
 *
 * @module Slider
 * @layer 2
 * @radixPrimitive @radix-ui/react-slider
 * @category selection
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as SliderPrimitive from '@radix-ui/react-slider'
import * as React from 'react'

import { cn } from '../../../../../design/utilities/cn'

import type { SliderProps, SliderSize, SliderVariant } from './slider.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const sliderSizeVariants: Record<SliderSize, { track: string; thumb: string }> = {
  sm: { track: 'h-1', thumb: 'h-4 w-4' },
  md: { track: 'h-2', thumb: 'h-5 w-5' },
  lg: { track: 'h-3', thumb: 'h-6 w-6' },
}

const sliderVariantStyles: Record<SliderVariant, { range: string; thumb: string }> = {
  default: { range: 'bg-primary', thumb: 'border-primary/50' },
  primary: { range: 'bg-blue-600', thumb: 'border-blue-600/50' },
  success: { range: 'bg-green-600', thumb: 'border-green-600/50' },
}

// ============================================================================
// Slider Component
// ============================================================================

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, size = 'md', variant = 'default', testId, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      'mcp-client-interactive',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        'relative w-full grow overflow-hidden rounded-full bg-secondary',
        sliderSizeVariants[size].track
      )}
    >
      <SliderPrimitive.Range
        className={cn('absolute h-full', sliderVariantStyles[variant].range)}
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        'block rounded-full border-2 bg-background',
        'ring-offset-background transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        sliderSizeVariants[size].thumb,
        sliderVariantStyles[variant].thumb
      )}
    />
  </SliderPrimitive.Root>
))
Slider.displayName = 'Slider'

// ============================================================================
// Exports
// ============================================================================

export type { SliderProps, SliderSize, SliderVariant } from './slider.types'

export { sliderSizeVariants, sliderVariantStyles }

export default Slider

