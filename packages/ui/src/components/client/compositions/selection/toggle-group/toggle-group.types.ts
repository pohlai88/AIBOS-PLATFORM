/**
 * ToggleGroup Types - Layer 2 Radix Composition
 * @module ToggleGroupTypes
 * @layer 2
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'

export type ToggleGroupSize = 'sm' | 'md' | 'lg'
export type ToggleGroupVariant = 'default' | 'outline'

export interface ToggleGroupRootProps {
  type: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  disabled?: boolean
  variant?: ToggleGroupVariant
  size?: ToggleGroupSize
  testId?: string
  className?: string
  children?: ReactNode
}

export interface ToggleGroupItemProps
  extends ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> {
  variant?: ToggleGroupVariant
  size?: ToggleGroupSize
}

