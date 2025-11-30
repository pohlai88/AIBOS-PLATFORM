/**
 * Header Server Component Types - React 19 RSC Compliant
 * @version 1.0.0
 */

import type { ReactNode, CSSProperties } from 'react'

/**
 * RSC-Safe Props - No event handlers (React 19 requirement)
 */
type ServerElementProps = {
  id?: string
  role?: string
  title?: string
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'data-testid'?: string
}

export interface HeaderProps extends ServerElementProps {
  /** Logo or brand element */
  logo?: ReactNode
  /** Navigation slot */
  navigation?: ReactNode
  /** Actions slot (search, user menu, etc.) */
  actions?: ReactNode
  /** Child content */
  children?: ReactNode
  /** Header variant */
  variant?: 'default' | 'transparent' | 'elevated'
  /** Sticky behavior */
  sticky?: boolean
}

