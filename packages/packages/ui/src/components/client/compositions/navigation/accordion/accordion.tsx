/**
 * Accordion Component - Layer 2 Radix Composition
 *
 * A collapsible content component built on Radix UI Accordion primitive.
 *
 * @module Accordion
 * @layer 2
 * @radixPrimitive @radix-ui/react-accordion
 * @category navigation
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import { ChevronDownIcon } from '@heroicons/react/24/outline'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import * as React from 'react'

import { colorTokens, radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionVariant,
} from './accordion.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const accordionVariants: Record<AccordionVariant, string> = {
  default: '',
  bordered: cn(`border ${colorTokens.borderSubtle}`, radiusTokens.md),
  separated: 'space-y-2',
}

const accordionItemVariants: Record<AccordionVariant, string> = {
  default: 'border-b',
  bordered: 'border-b last:border-b-0',
  separated: cn(
    `border ${colorTokens.borderSubtle}`,
    radiusTokens.md,
    colorTokens.bgElevated
  ),
}

// ============================================================================
// Root Component
// ============================================================================

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> & {
    variant?: AccordionVariant
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(accordionVariants[variant], 'mcp-client-interactive', className)}
    data-variant={variant}
    {...props}
  />
))
Accordion.displayName = 'Accordion'

// ============================================================================
// Item Component
// ============================================================================

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

// ============================================================================
// Trigger Component
// ============================================================================

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium',
        'transition-all hover:underline',
        '[&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = 'AccordionTrigger'

// ============================================================================
// Content Component
// ============================================================================

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = 'AccordionContent'

// ============================================================================
// Exports
// ============================================================================

export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionRootProps,
  AccordionTriggerProps,
  AccordionVariant,
} from './accordion.types'

export { accordionItemVariants, accordionVariants }

export default Accordion

