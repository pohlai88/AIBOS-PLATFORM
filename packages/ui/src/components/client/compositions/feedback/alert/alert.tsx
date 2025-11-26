/**
 * Alert Component - Layer 2 Composition
 *
 * A static alert/notification component for displaying messages.
 * Unlike Toast, Alert is not dismissible by default and stays in place.
 *
 * @module Alert
 * @layer 2
 * @category feedback
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import * as React from 'react'

import { radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  AlertDescriptionProps,
  AlertProps,
  AlertSize,
  AlertTitleProps,
  AlertVariant,
} from './alert.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const alertSizeVariants: Record<AlertSize, string> = {
  sm: 'p-3 text-sm',
  md: 'p-4 text-base',
  lg: 'p-5 text-lg',
}

const alertVariantStyles: Record<AlertVariant, string> = {
  default: 'bg-background text-foreground border',
  info: 'bg-blue-50 text-blue-900 border-blue-200',
  success: 'bg-green-50 text-green-900 border-green-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  error: 'bg-red-50 text-red-900 border-red-200',
}

const alertIconMap: Record<AlertVariant, React.FC<{ className?: string }>> = {
  default: InformationCircleIcon,
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: ExclamationCircleIcon,
}

// ============================================================================
// Alert Component
// ============================================================================

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      testId,
      dismissible = false,
      onDismiss,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = alertIconMap[variant]

    return (
      <div
        ref={ref}
        role="alert"
        data-testid={testId}
        data-mcp-validated="true"
        data-constitution-compliant="layer2-composition"
        data-layer="2"
        className={cn(
          'relative flex gap-3',
          radiusTokens.md,
          alertSizeVariants[size],
          alertVariantStyles[variant],
          'mcp-client-interactive',
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex-1">{children}</div>
        {dismissible && onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(
              'absolute right-2 top-2 rounded-sm opacity-70',
              'hover:opacity-100',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          >
            <XMarkIcon className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = 'Alert'

// ============================================================================
// Alert Title Component
// ============================================================================

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = 'AlertTitle'

// ============================================================================
// Alert Description Component
// ============================================================================

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm opacity-90 [&_p]:leading-relaxed', className)}
    {...props}
  />
))
AlertDescription.displayName = 'AlertDescription'

// ============================================================================
// Exports
// ============================================================================

export type {
  AlertDescriptionProps,
  AlertProps,
  AlertSize,
  AlertTitleProps,
  AlertVariant,
} from './alert.types'

export { alertIconMap, alertSizeVariants, alertVariantStyles }

export default Alert

