/**
 * Sidebar Server Component Types - React 19 RSC Compliant
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

export interface SidebarProps extends ServerElementProps {
  /** Header slot */
  header?: ReactNode
  /** Footer slot */
  footer?: ReactNode
  /** Child content */
  children?: ReactNode
  /** Sidebar position */
  position?: 'left' | 'right'
  /** Sidebar width */
  width?: 'sm' | 'md' | 'lg'
  /** Collapsed state (server-rendered) */
  collapsed?: boolean
}

