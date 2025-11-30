/**
 * Switch Types - Layer 2 Radix Composition
 * @module SwitchTypes
 * @layer 2
 */

import type * as SwitchPrimitive from '@radix-ui/react-switch'

export type SwitchSize = 'sm' | 'md' | 'lg'
export type SwitchVariant = 'default' | 'success' | 'warning'

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: SwitchSize
  variant?: SwitchVariant
  testId?: string
}

