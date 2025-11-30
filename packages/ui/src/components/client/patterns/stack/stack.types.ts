/**
 * Stack Pattern Component Types
 * Type definitions for the Stack Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Stack direction
 */
export type StackDirection = 'row' | 'column'

/**
 * Stack alignment
 */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch'

/**
 * Stack justify
 */
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

/**
 * Stack spacing
 */
export type StackSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Stack wrap
 */
export type StackWrap = 'nowrap' | 'wrap' | 'wrap-reverse'

/**
 * Props for the Stack component
 */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction
   * @default 'column'
   */
  direction?: StackDirection

  /**
   * Stack alignment (cross-axis)
   * @default 'stretch'
   */
  align?: StackAlign

  /**
   * Stack justify (main-axis)
   * @default 'start'
   */
  justify?: StackJustify

  /**
   * Spacing between items
   * @default 'md'
   */
  spacing?: StackSpacing

  /**
   * Whether to wrap items
   * @default 'nowrap'
   */
  wrap?: StackWrap

  /**
   * Gap value (CSS value) - overrides spacing
   */
  gap?: string | number

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string
}

