/**
 * FeatureHighlight Server Component Types - React 19 RSC Compliant
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

export interface FeatureHighlightProps extends ServerElementProps {
  /** Feature title */
  title: string
  /** Feature description */
  description?: string
  /** Icon or image */
  icon?: ReactNode
  /** Child content */
  children?: ReactNode
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
  /** Alignment */
  align?: 'left' | 'center' | 'right'
}

