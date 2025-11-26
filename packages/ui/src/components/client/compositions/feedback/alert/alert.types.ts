/**
 * Alert Types - Layer 2 Composition
 * @module AlertTypes
 * @layer 2
 */

export type AlertVariant = 'default' | 'info' | 'success' | 'warning' | 'error'
export type AlertSize = 'sm' | 'md' | 'lg'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  size?: AlertSize
  testId?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

