/**
 * Tooltip Component Types
 * Type definitions for the Tooltip composition component.
 *
 * @layer Layer 2 - Radix Compositions
 * @radixPrimitive @radix-ui/react-tooltip
 * @category Type Definitions
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import * as React from 'react'

/**
 * Size variants for tooltip
 */
export type TooltipSize = 'sm' | 'md' | 'lg'

/**
 * Visual variants for tooltip styling
 */
export type TooltipVariant = 'default' | 'dark' | 'light' | 'bordered'

/**
 * Side of trigger to display tooltip
 */
export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

/**
 * Alignment relative to the trigger
 */
export type TooltipAlign = 'start' | 'center' | 'end'

/**
 * Props for the TooltipProvider component.
 * Wraps the application or section to enable tooltips.
 */
export interface TooltipProviderProps
  extends Omit<TooltipPrimitive.TooltipProviderProps, 'children'> {
  /**
   * The delay in milliseconds before showing the tooltip
   * @default 200
   */
  delayDuration?: number

  /**
   * Whether to skip the delay when moving between tooltips
   * @default true
   */
  skipDelayDuration?: number

  /**
   * Prevents tooltips from opening during the delay period after the user stops interacting
   * @default false
   */
  disableHoverableContent?: boolean

  /**
   * Children that can trigger tooltips
   */
  children: React.ReactNode
}

/**
 * Props for the Tooltip root component.
 * Controls the open state of the tooltip.
 */
export interface TooltipRootProps
  extends Omit<TooltipPrimitive.TooltipProps, 'children'> {
  /**
   * Whether the tooltip is open (controlled)
   */
  open?: boolean

  /**
   * Default open state (uncontrolled)
   * @default false
   */
  defaultOpen?: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * The delay in milliseconds before showing the tooltip
   * @default 200
   */
  delayDuration?: number

  /**
   * Prevents the tooltip from closing when hovering over the content
   * @default false
   */
  disableHoverableContent?: boolean

  /**
   * Children that includes trigger and content
   */
  children: React.ReactNode
}

/**
 * Props for the TooltipTrigger component.
 * The element that triggers the tooltip on hover/focus.
 */
export interface TooltipTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> {
  /**
   * Custom className for the trigger
   */
  className?: string

  /**
   * Children content (typically a button or element to be hovered)
   */
  children: React.ReactNode

  /**
   * Test ID for automated testing
   */
  testId?: string
}

/**
 * Props for the TooltipContent component.
 * The content displayed when the tooltip is open.
 */
export interface TooltipContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
    'className'
  > {
  /**
   * Size variant
   * @default 'md'
   */
  size?: TooltipSize

  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: TooltipVariant

  /**
   * Side of the trigger to render on
   * @default 'top'
   */
  side?: TooltipSide

  /**
   * Alignment relative to the trigger
   * @default 'center'
   */
  align?: TooltipAlign

  /**
   * Distance in pixels from the trigger
   * @default 4
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
 * Props for the TooltipArrow component.
 * The arrow that points to the trigger.
 */
export interface TooltipArrowProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow> {
  /**
   * Width of the arrow
   * @default 8
   */
  width?: number

  /**
   * Height of the arrow
   * @default 4
   */
  height?: number

  /**
   * Custom className for the arrow
   */
  className?: string
}
