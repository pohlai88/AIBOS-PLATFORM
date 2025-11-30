/**
 * ContentSection Server Component Types - React 19 RSC Compliant
 * @version 1.0.0
 */

import type { ReactNode, CSSProperties } from 'react'

type ServerElementProps = {
  id?: string
  role?: string
  className?: string
  style?: CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
  'data-testid'?: string
}

export interface ContentSectionProps extends ServerElementProps {
  /** Section title */
  title?: string
  /** Section subtitle */
  subtitle?: string
  /** Heading level */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4'
  /** Child content */
  children?: ReactNode
  /** Spacing variant */
  spacing?: 'sm' | 'md' | 'lg'
}

