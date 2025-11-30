/**
 * RadioGroup Types - Layer 2 Radix Composition
 * @module RadioGroupTypes
 * @layer 2
 */

import type * as RadioGroupPrimitive from '@radix-ui/react-radio-group'

export type RadioGroupSize = 'sm' | 'md' | 'lg'
export type RadioGroupVariant = 'default' | 'primary' | 'cards'

export interface RadioGroupRootProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  variant?: RadioGroupVariant
  testId?: string
}

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  size?: RadioGroupSize
}

