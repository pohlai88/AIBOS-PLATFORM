/**
 * ServerTable Server Component Types - React 19 RSC Compliant
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

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T) => ReactNode
}

export interface ServerTableProps<T = Record<string, unknown>> extends ServerElementProps {
  /** Table data */
  data: T[]
  /** Column definitions */
  columns: TableColumn<T>[]
  /** Caption for accessibility */
  caption?: string
  /** Table variant */
  variant?: 'default' | 'striped' | 'bordered'
  /** Compact mode */
  compact?: boolean
}

