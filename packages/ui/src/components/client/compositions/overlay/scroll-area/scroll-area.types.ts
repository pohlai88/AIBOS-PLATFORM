/**
 * ScrollArea Component Types
 * Type definitions for the ScrollArea composition component.
 *
 * @layer Layer 2 - Radix Compositions
 * @radixPrimitive @radix-ui/react-scroll-area
 * @category Type Definitions
 */

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import * as React from 'react'

/**
 * Scroll direction type
 */
export type ScrollDirection = 'vertical' | 'horizontal' | 'both'

/**
 * Scrollbar size variants
 */
export type ScrollbarSize = 'sm' | 'md' | 'lg'

/**
 * Scrollbar visibility behavior
 */
export type ScrollbarVisibility = 'auto' | 'always' | 'hover' | 'scroll'

/**
 * Props for the ScrollArea root component.
 * The main container with custom scrollbars.
 */
export interface ScrollAreaProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
    'className' | 'type'
  > {
  /**
   * Scroll direction
   * @default 'vertical'
   */
  scrollType?: ScrollDirection

  /**
   * Scrollbar size variant
   * @default 'md'
   */
  scrollbarSize?: ScrollbarSize

  /**
   * Scrollbar visibility behavior
   * @default 'hover'
   */
  scrollbarVisibility?: ScrollbarVisibility

  /**
   * Custom className for the root container
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Children content to be scrolled
   */
  children: React.ReactNode
}

/**
 * Props for the ScrollAreaViewport component.
 * The scrollable content viewport.
 */
export interface ScrollAreaViewportProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport> {
  /**
   * Custom className for the viewport
   */
  className?: string

  /**
   * Children content
   */
  children: React.ReactNode
}

/**
 * Props for the ScrollAreaScrollbar component.
 * The scrollbar track and thumb.
 */
export interface ScrollAreaScrollbarProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>,
    'forceMount'
  > {
  /**
   * Scrollbar orientation
   */
  orientation?: 'vertical' | 'horizontal'

  /**
   * Custom className for the scrollbar
   */
  className?: string
}

/**
 * Props for the ScrollAreaThumb component.
 * The draggable thumb inside the scrollbar.
 */
export interface ScrollAreaThumbProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Thumb> {
  /**
   * Custom className for the thumb
   */
  className?: string
}

/**
 * Props for the ScrollAreaCorner component.
 * The corner element when both scrollbars are visible.
 */
export interface ScrollAreaCornerProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Corner> {
  /**
   * Custom className for the corner
   */
  className?: string
}
