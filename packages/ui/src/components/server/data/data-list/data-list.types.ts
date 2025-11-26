/**
 * DataList Server Component Types - React 19 RSC Compliant
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

export interface DataListItem {
  id: string | number
  primary: ReactNode
  secondary?: ReactNode
  meta?: ReactNode
}

export interface DataListProps extends ServerElementProps {
  /** List items */
  items: DataListItem[]
  /** List variant */
  variant?: 'default' | 'divided' | 'cards'
  /** Empty state message */
  emptyMessage?: string
}

