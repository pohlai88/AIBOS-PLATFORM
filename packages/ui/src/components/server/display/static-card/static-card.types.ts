/**
 * StaticCard Server Component Types - React 19 RSC Compliant
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

export interface StaticCardProps extends ServerElementProps {
  /** Card title */
  title?: ReactNode
  /** Card description */
  description?: ReactNode
  /** Header slot */
  header?: ReactNode
  /** Footer slot */
  footer?: ReactNode
  /** Child content */
  children?: ReactNode
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated'
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

