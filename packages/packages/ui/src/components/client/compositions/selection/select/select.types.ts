/**
 * Select Types - Layer 2 Radix Composition
 * @module SelectTypes
 * @layer 2
 */

import type * as SelectPrimitive from '@radix-ui/react-select'

export type SelectSize = 'sm' | 'md' | 'lg'
export type SelectVariant = 'default' | 'bordered' | 'ghost'

export interface SelectRootProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  testId?: string
}

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: SelectSize
  variant?: SelectVariant
}

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}

export interface SelectLabelProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {}

export interface SelectSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}

