/**
 * Progress Component - Layer 2 Radix Composition
 *
 * A progress bar component built on Radix UI Progress primitive.
 *
 * @module Progress
 * @layer 2
 * @radixPrimitive @radix-ui/react-progress
 * @category feedback
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  ProgressProps,
  ProgressSize,
  ProgressVariant,
} from './progress.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const progressSizeVariants: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
}

const progressVariantStyles: Record<ProgressVariant, string> = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
}

// ============================================================================
// Progress Component
// ============================================================================

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      size = 'md',
      variant = 'default',
      testId,
      indicatorClassName,
      ...props
    },
    ref
  ) => (
    <ProgressPrimitive.Root
      ref={ref}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer2-radix-composition"
      data-layer="2"
      className={cn(
        'relative w-full overflow-hidden',
        'bg-secondary',
        radiusTokens.full,
        progressSizeVariants[size],
        'mcp-client-interactive',
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 transition-all',
          progressVariantStyles[variant],
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
)
Progress.displayName = 'Progress'

// ============================================================================
// Exports
// ============================================================================

export type {
  ProgressProps,
  ProgressSize,
  ProgressVariant,
} from './progress.types'

export { progressSizeVariants, progressVariantStyles }

export default Progress

