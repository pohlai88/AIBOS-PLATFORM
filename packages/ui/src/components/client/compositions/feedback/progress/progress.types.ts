/**
 * Progress Types - Layer 2 Radix Composition
 * @module ProgressTypes
 * @layer 2
 */

import type * as ProgressPrimitive from '@radix-ui/react-progress'

export type ProgressSize = 'sm' | 'md' | 'lg'
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error'

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  size?: ProgressSize
  variant?: ProgressVariant
  testId?: string
  indicatorClassName?: string
}

