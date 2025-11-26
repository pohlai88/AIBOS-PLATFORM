/**
 * Checkbox Types - Layer 2 Radix Composition
 * @module CheckboxTypes
 * @layer 2
 */

import type * as CheckboxPrimitive from '@radix-ui/react-checkbox'

export type CheckboxSize = 'sm' | 'md' | 'lg'
export type CheckboxVariant = 'default' | 'primary' | 'success'

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: CheckboxSize
  variant?: CheckboxVariant
  testId?: string
}

