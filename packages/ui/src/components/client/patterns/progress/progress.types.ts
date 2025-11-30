/**
 * Progress Pattern Component Types
 * Type definitions for the Progress Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Progress variant
 */
export type ProgressVariant = 'default' | 'primary' | 'success' | 'warning' | 'error'

/**
 * Progress size
 */
export type ProgressSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Progress component
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100)
   * @default 0
   */
  value?: number

  /**
   * Maximum value
   * @default 100
   */
  max?: number

  /**
   * Progress variant
   * @default 'default'
   */
  variant?: ProgressVariant

  /**
   * Progress size
   * @default 'md'
   */
  size?: ProgressSize

  /**
   * Whether to show value label
   * @default false
   */
  showValue?: boolean

  /**
   * Custom label formatter
   */
  formatValue?: (value: number, max: number) => string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string
}

