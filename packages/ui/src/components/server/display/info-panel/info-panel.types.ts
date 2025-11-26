/**
 * InfoPanel Server Component Types - React 19 RSC Compliant
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

export interface InfoPanelProps extends ServerElementProps {
  /** Panel title */
  title?: string
  /** Icon slot */
  icon?: ReactNode
  /** Child content */
  children?: ReactNode
  /** Panel variant */
  variant?: 'info' | 'success' | 'warning' | 'error'
}

