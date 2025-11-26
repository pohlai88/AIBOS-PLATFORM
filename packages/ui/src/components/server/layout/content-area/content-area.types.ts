/**
 * ContentArea Server Component Types - React 19 RSC Compliant
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

export interface ContentAreaProps extends ServerElementProps {
  /** Child content */
  children?: ReactNode
  /** Max width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Center content */
  centered?: boolean
}

