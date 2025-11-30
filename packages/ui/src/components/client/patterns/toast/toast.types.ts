/**
 * Toast Pattern Component Types
 * Type definitions for the Toast Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Toast variant
 */
export type ToastVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

/**
 * Toast position
 */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

/**
 * Props for ToastProvider component
 */
export interface ToastProviderProps {
  /**
   * Toast position
   * @default 'bottom-right'
   */
  position?: ToastPosition

  /**
   * Duration in milliseconds before toast auto-dismisses
   * @default 5000
   */
  duration?: number

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Children
   */
  children: React.ReactNode
}

/**
 * Props for Toast component
 */
export interface ToastProps {
  /**
   * Toast variant
   * @default 'default'
   */
  variant?: ToastVariant

  /**
   * Toast title
   */
  title?: string

  /**
   * Toast description/content
   */
  description?: string

  /**
   * Whether toast is dismissible
   * @default true
   */
  dismissible?: boolean

  /**
   * Action button element
   */
  action?: React.ReactNode

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

/**
 * Props for ToastViewport component
 */
export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string
}

