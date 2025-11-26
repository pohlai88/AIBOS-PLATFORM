/**
 * Collapsible Types - Layer 2 Radix Composition
 * @module CollapsibleTypes
 * @layer 2
 */

import type * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

export interface CollapsibleRootProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root> {
  testId?: string
}

export interface CollapsibleTriggerProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> {}

export interface CollapsibleContentProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> {}

