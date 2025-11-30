/**
 * Toast Component - Layer 2 Radix Composition
 *
 * A toast notification component built on Radix UI Toast primitive.
 *
 * @module Toast
 * @layer 2
 * @radixPrimitive @radix-ui/react-toast
 * @category feedback
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import * as ToastPrimitive from '@radix-ui/react-toast'
import * as React from 'react'

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  ToastActionProps,
  ToastCloseProps,
  ToastDescriptionProps,
  ToastRootProps,
  ToastTitleProps,
  ToastVariant,
  ToastViewportProps,
} from './toast.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const toastVariantStyles: Record<ToastVariant, string> = {
  default: cn(colorTokens.bgElevated, colorTokens.fg, 'border'),
  success: 'bg-green-50 text-green-900 border-green-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  error: 'bg-red-50 text-red-900 border-red-200',
  info: 'bg-blue-50 text-blue-900 border-blue-200',
}

// ============================================================================
// Provider Component
// ============================================================================

export const ToastProvider = ToastPrimitive.Provider

// ============================================================================
// Viewport Component
// ============================================================================

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4',
      'sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col',
      'md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = 'ToastViewport'

// ============================================================================
// Root Component
// ============================================================================

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastRootProps
>(({ className, variant = 'default', testId, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      'group pointer-events-auto relative flex w-full items-center justify-between',
      'space-x-4 overflow-hidden p-6',
      radiusTokens.md,
      shadowTokens.lg,
      'transition-all',
      'data-[swipe=cancel]:translate-x-0',
      'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
      'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
      'data-[swipe=move]:transition-none',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[swipe=end]:animate-out',
      'data-[state=closed]:fade-out-80',
      'data-[state=closed]:slide-out-to-right-full',
      'data-[state=open]:slide-in-from-top-full',
      'data-[state=open]:sm:slide-in-from-bottom-full',
      toastVariantStyles[variant],
      'mcp-client-interactive',
      className
    )}
    {...props}
  />
))
Toast.displayName = 'Toast'

// ============================================================================
// Action Component
// ============================================================================

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  ToastActionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center',
      'px-3 text-sm font-medium',
      radiusTokens.md,
      'border bg-transparent',
      'ring-offset-background transition-colors',
      'hover:bg-secondary',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'group-[.error]:border-muted/40 group-[.error]:hover:border-error/30',
      'group-[.error]:hover:bg-error group-[.error]:hover:text-error-foreground',
      'group-[.error]:focus:ring-error',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = 'ToastAction'

// ============================================================================
// Close Component
// ============================================================================

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  ToastCloseProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1',
      'text-foreground/50',
      'opacity-0 transition-opacity',
      'hover:text-foreground',
      'focus:opacity-100 focus:outline-none focus:ring-2',
      'group-hover:opacity-100',
      'group-[.error]:text-red-300 group-[.error]:hover:text-red-50',
      'group-[.error]:focus:ring-red-400 group-[.error]:focus:ring-offset-red-600',
      className
    )}
    toast-close=""
    {...props}
  >
    <XMarkIcon className="h-4 w-4" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = 'ToastClose'

// ============================================================================
// Title Component
// ============================================================================

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  ToastTitleProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = 'ToastTitle'

// ============================================================================
// Description Component
// ============================================================================

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn('text-sm opacity-90', className)}
    {...props}
  />
))
ToastDescription.displayName = 'ToastDescription'

// ============================================================================
// Exports
// ============================================================================

export type {
  ToastActionProps,
  ToastCloseProps,
  ToastDescriptionProps,
  ToastProviderProps,
  ToastRootProps,
  ToastTitleProps,
  ToastVariant,
  ToastViewportProps,
} from './toast.types'

export { toastVariantStyles }

export default Toast

