/**
 * NavigationMenu Pattern Component Types
 * Type definitions for the NavigationMenu Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Navigation menu item
 */
export interface NavigationMenuItem {
  /**
   * Label text
   */
  label: string

  /**
   * Link URL
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

  /**
   * Submenu items (for nested menus)
   */
  submenu?: NavigationMenuItem[]

  /**
   * Click handler (alternative to href)
   */
  onClick?: () => void
}

/**
 * Navigation menu variant
 */
export type NavigationMenuVariant = 'default' | 'horizontal' | 'vertical'

/**
 * Navigation menu size
 */
export type NavigationMenuSize = 'sm' | 'md' | 'lg'

/**
 * Props for the NavigationMenu component
 */
export interface NavigationMenuProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Navigation menu items
   */
  items: NavigationMenuItem[]

  /**
   * Menu variant
   * @default 'horizontal'
   */
  variant?: NavigationMenuVariant

  /**
   * Menu size
   * @default 'md'
   */
  size?: NavigationMenuSize

  /**
   * Whether to show icons
   * @default false
   */
  showIcons?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string
}

