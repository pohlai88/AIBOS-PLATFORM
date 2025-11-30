/**
 * Grid Pattern Component Types
 * Type definitions for the Grid Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Grid columns
 */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 12

/**
 * Grid gap
 */
export type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Grid alignment
 */
export type GridAlign = 'start' | 'center' | 'end' | 'stretch'

/**
 * Props for the Grid component
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Number of columns
   * @default 12
   */
  columns?: GridColumns

  /**
   * Gap between grid items
   * @default 'md'
   */
  gap?: GridGap

  /**
   * Alignment of grid items
   * @default 'stretch'
   */
  align?: GridAlign

  /**
   * Custom gap value (CSS value) - overrides gap prop
   */
  gapValue?: string | number

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string
}

/**
 * Props for GridItem component
 */
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Column span (1-12)
   */
  span?: number

  /**
   * Column start position
   */
  start?: number

  /**
   * Column end position
   */
  end?: number

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string
}

