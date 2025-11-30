/**
 * Accordion Types - Layer 2 Radix Composition
 * @module AccordionTypes
 * @layer 2
 */

import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import type * as AccordionPrimitive from '@radix-ui/react-accordion'

export type AccordionVariant = 'default' | 'bordered' | 'separated'

export interface AccordionRootProps {
  type?: 'single' | 'multiple'
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  disabled?: boolean
  variant?: AccordionVariant
  testId?: string
  className?: string
  children?: ReactNode
}

export interface AccordionItemProps
  extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

export interface AccordionTriggerProps
  extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {}

export interface AccordionContentProps
  extends ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {}

