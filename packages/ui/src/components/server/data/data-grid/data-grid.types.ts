/**
 * DataGrid Server Component Types - React 19 RSC Compliant
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

export interface DataGridProps extends ServerElementProps {
  /** Child content */
  children?: ReactNode
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg'
  /** Responsive columns (mobile first) */
  responsive?: boolean
}

