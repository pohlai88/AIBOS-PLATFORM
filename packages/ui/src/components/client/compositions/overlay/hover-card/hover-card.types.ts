/**
 * HoverCard Types - Layer 2 Radix Composition
 * @module HoverCardTypes
 * @layer 2
 */

import type * as HoverCardPrimitive from '@radix-ui/react-hover-card'

export type HoverCardSide = 'top' | 'right' | 'bottom' | 'left'
export type HoverCardAlign = 'start' | 'center' | 'end'

export interface HoverCardRootProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root> {}

export interface HoverCardTriggerProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger> {}

export interface HoverCardContentProps
  extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  testId?: string
}

