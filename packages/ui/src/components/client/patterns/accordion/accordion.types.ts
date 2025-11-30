/**
 * Accordion Pattern Component Types
 * Type definitions for the Accordion Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Accordion type (single or multiple items open)
 */
export type AccordionType = 'single' | 'multiple'

/**
 * Accordion size variant
 */
export type AccordionSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Accordion root component
 */
export interface AccordionProps {
  /**
   * Accordion type - single or multiple items can be open
   * @default 'single'
   */
  type?: AccordionType

  /**
   * Default open items (for uncontrolled mode)
   */
  defaultValue?: string | string[]

  /**
   * Controlled open items
   */
  value?: string | string[]

  /**
   * Callback when open items change
   */
  onValueChange?: (value: string | string[]) => void

  /**
   * Whether accordion is collapsible (can close all items)
   * @default true
   */
  collapsible?: boolean

  /**
   * Accordion size
   * @default 'md'
   */
  size?: AccordionSize

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Children (AccordionItem components)
   */
  children: React.ReactNode
}

/**
 * Props for AccordionItem component
 */
export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Unique value for this item
   */
  value: string

  /**
   * Whether the item is disabled
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
   * Children (AccordionTrigger and AccordionContent)
   */
  children: React.ReactNode
}

/**
 * Props for AccordionTrigger component
 */
export interface AccordionTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Trigger label/content
   */
  children: React.ReactNode
}

/**
 * Props for AccordionContent component
 */
export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Content to display when expanded
   */
  children: React.ReactNode
}

