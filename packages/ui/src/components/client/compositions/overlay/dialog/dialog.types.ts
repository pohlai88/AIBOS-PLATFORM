/**
 * Dialog Component Types
 * Layer 2 - Radix Dialog Composition
 *
 * @module dialog.types
 * @layer 2
 */

import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

/**
 * Dialog size variants
 */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/**
 * Dialog visual variants
 */
export type DialogVariant = 'default' | 'elevated' | 'bordered'

/**
 * Dialog overlay blur intensity
 */
export type DialogOverlayBlur = 'none' | 'light' | 'medium' | 'heavy'

/**
 * Props for the Dialog root component
 */
export interface DialogRootProps {
  /**
   * Controlled open state
   */
  open?: boolean

  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean

  /**
   * Modal behavior (prevents interaction with content behind)
   * @default true
   */
  modal?: boolean

  /**
   * Children elements (Trigger, Content, etc.)
   */
  children: React.ReactNode
}

/**
 * Props for Dialog Trigger component
 */
export interface DialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {
  /**
   * Render trigger as child (for custom styling)
   * @default false
   */
  asChild?: boolean
}

/**
 * Props for Dialog Content component
 */
export interface DialogContentProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    'className'
  > {
  /**
   * Size variant of the dialog
   * @default 'md'
   */
  size?: DialogSize

  /**
   * Visual variant of the dialog
   * @default 'default'
   */
  variant?: DialogVariant

  /**
   * Overlay blur intensity
   * @default 'medium'
   */
  overlayBlur?: DialogOverlayBlur

  /**
   * Show close button in top-right corner
   * @default true
   */
  showCloseButton?: boolean

  /**
   * Custom className for content container
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Additional CSS classes for overlay
   */
  overlayClassName?: string

  /**
   * Children content
   */
  children: React.ReactNode
}

/**
 * Props for Dialog Header component
 */
export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Children content
   */
  children: React.ReactNode
}

/**
 * Props for Dialog Title component
 */
export interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  /**
   * Render as child element (for custom styling)
   * @default false
   */
  asChild?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Children content
   */
  children: React.ReactNode
}

/**
 * Props for Dialog Description component
 */
export interface DialogDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {
  /**
   * Render as child element (for custom styling)
   * @default false
   */
  asChild?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Children content
   */
  children: React.ReactNode
}

/**
 * Props for Dialog Footer component
 */
export interface DialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Children content (typically action buttons)
   */
  children: React.ReactNode
}

/**
 * Props for Dialog Close component
 */
export interface DialogCloseProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close> {
  /**
   * Render as child element (for custom styling)
   * @default false
   */
  asChild?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Children content
   */
  children?: React.ReactNode
}
