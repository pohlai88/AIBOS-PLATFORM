/**
 * Breadcrumb Pattern Component Types
 * Type definitions for the Breadcrumb Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /**
   * Label text
   */
  label: string

  /**
   * Link URL (optional for current page)
   */
  href?: string

  /**
   * Icon element (optional)
   */
  icon?: React.ReactNode

  /**
   * Whether this item is disabled
   */
  disabled?: boolean
}

/**
 * Breadcrumb separator
 */
export type BreadcrumbSeparator = string | React.ReactNode

/**
 * Props for the Breadcrumb component
 */
export interface BreadcrumbProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Breadcrumb items
   */
  items: BreadcrumbItem[]

  /**
   * Separator between items
   * @default '/'
   */
  separator?: BreadcrumbSeparator

  /**
   * Maximum number of items to show (truncates with ellipsis)
   */
  maxItems?: number

  /**
   * Whether to show home icon for first item
   * @default false
   */
  showHome?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string
}

