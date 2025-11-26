/**
 * StatBanner Server Component Types - React 19 RSC Compliant
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

export interface StatItem {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
}

export interface StatBannerProps extends ServerElementProps {
  /** Stat items */
  stats: StatItem[]
  /** Layout variant */
  variant?: 'default' | 'compact' | 'cards'
}

