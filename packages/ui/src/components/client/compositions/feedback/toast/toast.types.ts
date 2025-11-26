/**
 * Toast Types - Layer 2 Radix Composition
 * @module ToastTypes
 * @layer 2
 */

import type * as ToastPrimitive from '@radix-ui/react-toast'

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

export interface ToastProviderProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Provider> {}

export interface ToastViewportProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport> {}

export interface ToastRootProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant
  testId?: string
}

export interface ToastTitleProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title> {}

export interface ToastDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description> {}

export interface ToastActionProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action> {}

export interface ToastCloseProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close> {}

