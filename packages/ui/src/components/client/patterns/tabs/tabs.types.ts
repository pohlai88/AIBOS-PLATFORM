/**
 * Tabs Pattern Component Types
 * Type definitions for the Tabs Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Tabs orientation
 */
export type TabsOrientation = 'horizontal' | 'vertical'

/**
 * Tabs size variant
 */
export type TabsSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Tabs root component
 */
export interface TabsProps {
  /**
   * Default selected tab value
   */
  defaultValue?: string

  /**
   * Controlled selected tab value
   */
  value?: string

  /**
   * Callback when tab value changes
   */
  onValueChange?: (value: string) => void

  /**
   * Tabs orientation
   * @default 'horizontal'
   */
  orientation?: TabsOrientation

  /**
   * Tabs size
   * @default 'md'
   */
  size?: TabsSize

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Children (TabsList and TabsContent components)
   */
  children: React.ReactNode
}

/**
 * Props for TabsList component
 */
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Children (TabsTrigger components)
   */
  children: React.ReactNode
}

/**
 * Props for TabsTrigger component
 */
export interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * Unique value for this tab
   */
  value: string

  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Tab label/content
   */
  children: React.ReactNode
}

/**
 * Props for TabsContent component
 */
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Unique value matching TabsTrigger
   */
  value: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Tab panel content
   */
  children: React.ReactNode
}

