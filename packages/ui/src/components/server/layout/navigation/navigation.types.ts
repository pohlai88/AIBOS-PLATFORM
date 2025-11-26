/**
 * Navigation Server Component Types - React 19 RSC Compliant
 * @version 1.0.0
 */

import type { ReactNode, CSSProperties } from 'react'

type ServerElementProps = {
  id?: string
  role?: string
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'data-testid'?: string
}

export interface NavItem {
  label: string
  href: string
  icon?: ReactNode
  active?: boolean
  disabled?: boolean
}

export interface NavigationProps extends ServerElementProps {
  /** Navigation items */
  items?: NavItem[]
  /** Child content */
  children?: ReactNode
  /** Navigation orientation */
  orientation?: 'horizontal' | 'vertical'
  /** Navigation variant */
  variant?: 'default' | 'pills' | 'underline'
}

