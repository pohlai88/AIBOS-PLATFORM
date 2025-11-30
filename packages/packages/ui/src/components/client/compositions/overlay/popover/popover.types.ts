/**
 * Popover Component Types
 * Layer 2 - Radix Popover Composition
 *
 * @module popover.types
 * @layer 2
 */

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

/**
 * Popover side position
 */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'

/**
 * Popover alignment
 */
export type PopoverAlign = 'start' | 'center' | 'end'

/**
 * Popover size variants
 */
export type PopoverSize = 'sm' | 'md' | 'lg' | 'auto'

/**
 * Popover visual variants
 */
export type PopoverVariant = 'default' | 'elevated' | 'bordered'

/**
 * Props for the Popover root component
 */
export interface PopoverRootProps {
  /**
   * Controlled open state
   */
  open?: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean

  /**
   * Modal behavior (prevents interaction with content behind)
   * @default false
   */
  modal?: boolean

  /**
   * Children elements (Trigger, Content, etc.)
   */
  children: React.ReactNode
}

/**
 * Props for Popover Trigger component
 */
export interface PopoverTriggerProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> {
  /**
   * Render trigger as child (for custom styling)
   * @default false
   */
  asChild?: boolean
}

/**
 * Props for Popover Content component
 */
export interface PopoverContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    'className'
  > {
  /**
   * Size variant of the popover
   * @default 'md'
   */
  size?: PopoverSize

  /**
   * Visual variant of the popover
   * @default 'default'
   */
  variant?: PopoverVariant

  /**
   * Side of the trigger to render on
   * @default 'bottom'
   */
  side?: PopoverSide

  /**
   * Alignment relative to the trigger
   * @default 'center'
   */
  align?: PopoverAlign

  /**
   * Distance in pixels from the trigger
   * @default 8
   */
  sideOffset?: number

  /**
   * Show arrow pointing to trigger
   * @default false
   */
  showArrow?: boolean

  /**
   * Custom className for content container
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Children content
   */
  children: React.ReactNode
}

/**
 * Props for Popover Close component
 */
export interface PopoverCloseProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close> {
  /**
   * Render as child element (for custom styling)
   * @default false
   */
  asChild?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Children content
   */
  children?: React.ReactNode
}

/**
 * Props for Popover Arrow component
 */
export interface PopoverArrowProps
  extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Arrow> {
  /**
   * Additional CSS classes
   */
  className?: string
}
