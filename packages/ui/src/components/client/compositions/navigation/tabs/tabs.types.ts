/**
 * Tabs Types - Layer 2 Radix Composition
 * @module TabsTypes
 * @layer 2
 */

import type * as TabsPrimitive from '@radix-ui/react-tabs'

export type TabsSize = 'sm' | 'md' | 'lg'
export type TabsVariant = 'default' | 'pills' | 'underline'

export interface TabsRootProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  testId?: string
}

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsVariant
}

export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  size?: TabsSize
}

export interface TabsContentProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> {
  testId?: string
}

