/**
 * Footer Server Component Types - React 19 RSC Compliant
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

export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps extends ServerElementProps {
  /** Copyright text */
  copyright?: string
  /** Footer links */
  links?: FooterLink[]
  /** Left slot */
  left?: ReactNode
  /** Right slot */
  right?: ReactNode
  /** Child content */
  children?: ReactNode
  /** Footer variant */
  variant?: 'default' | 'minimal' | 'expanded'
}

