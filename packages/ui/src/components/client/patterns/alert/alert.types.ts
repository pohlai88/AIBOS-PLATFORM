/**
 * Alert Pattern Component Types
 * Type definitions for the Alert Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Alert variant
 */
export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

/**
 * Alert size
 */
export type AlertSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Alert component
 */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Alert variant
   * @default 'default'
   */
  variant?: AlertVariant

  /**
   * Alert size
   * @default 'md'
   */
  size?: AlertSize

  /**
   * Alert title
   */
  title?: string

  /**
   * Alert description/content
   */
  description?: string

  /**
   * Whether alert is dismissible
   * @default false
   */
  dismissible?: boolean

  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void

  /**
   * Leading icon element
   */
  icon?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Children content (alternative to description)
   */
  children?: React.ReactNode
}

