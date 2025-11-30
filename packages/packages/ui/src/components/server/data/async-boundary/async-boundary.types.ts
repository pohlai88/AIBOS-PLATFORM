/**
 * AsyncBoundary Server Component Types - React 19 RSC Compliant
 * @version 1.0.0
 */

import type { ReactNode, CSSProperties } from 'react'

type ServerElementProps = {
  id?: string
  className?: string
  style?: CSSProperties
  'data-testid'?: string
}

export interface AsyncBoundaryProps extends ServerElementProps {
  /** Child content (async) */
  children?: ReactNode
  /** Fallback while loading */
  fallback?: ReactNode
  /** Error fallback */
  errorFallback?: ReactNode
}

