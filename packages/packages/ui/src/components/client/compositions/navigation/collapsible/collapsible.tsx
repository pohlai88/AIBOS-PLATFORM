/**
 * Collapsible Component - Layer 2 Radix Composition
 *
 * A collapsible content section built on Radix UI Collapsible primitive.
 *
 * @module Collapsible
 * @layer 2
 * @radixPrimitive @radix-ui/react-collapsible
 * @category navigation
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import * as React from 'react'

import { cn } from '../../../../../design/utilities/cn'

import type {
  CollapsibleContentProps,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
} from './collapsible.types'

// ============================================================================
// Root Component
// ============================================================================

export const Collapsible = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  CollapsibleRootProps
>(({ className, testId, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn('mcp-client-interactive', className)}
    {...props}
  />
))
Collapsible.displayName = 'Collapsible'

// ============================================================================
// Trigger Component
// ============================================================================

export const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  CollapsibleTriggerProps
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex items-center justify-between',
      '[&[data-state=open]>svg]:rotate-180',
      className
    )}
    {...props}
  />
))
CollapsibleTrigger.displayName = 'CollapsibleTrigger'

// ============================================================================
// Content Component
// ============================================================================

export const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden',
      'data-[state=closed]:animate-collapsible-up',
      'data-[state=open]:animate-collapsible-down',
      className
    )}
    {...props}
  />
))
CollapsibleContent.displayName = 'CollapsibleContent'

// ============================================================================
// Exports
// ============================================================================

export type {
  CollapsibleContentProps,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
} from './collapsible.types'

export default Collapsible

