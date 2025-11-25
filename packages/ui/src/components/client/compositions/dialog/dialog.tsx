/**
 * Dialog Component - Layer 2 Radix Composition
 *
 * A modal dialog component built on Radix UI Dialog primitive,
 * integrated with Layer 1 Typography components (Text, Heading)
 * and AI-BOS design tokens.
 *
 * Features:
 * - Modal overlay with focus trap
 * - Keyboard navigation (Escape to close)
 * - ARIA attributes (rol)(({ className, children, asChild = false, ...prop)(({ className, children, asChild = false, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} asChild={asChild} {...props}>
    {asChild ? (
      children
    ) : (
      <Text size="sm" color="muted" className={cn('leading-relaxed', className)}>
        {children}
      </Text>
    )}
  </DialogPrimitive.Description>
))
DialogDescription.displayName = 'DialogDescription' (
  <DialogPrimitive.Title ref={ref} asChild={asChild} {...props}>
    {asChild ? (
      children
    ) : (
      <Heading
        level={2}
        size="lg"
        className={cn('font-semibold tracking-tight', className)}
      >
        {children}
      </Heading>
    )}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = 'DialogTitle' Customizable size and visual variants
 * - Layer 1 Typography integration
 * - WCAG 2.1 AA/AAA compliant
 * - MCP validated Client Component
 *
 * @module Dialog
 * @layer 2
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

// Layer 1 Typography Integration
import { Heading } from '../../../shared/typography/heading'
import { Text } from '../../../shared/typography/text'

// Design System
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from '../../../../design/tokens/tokens'
import { cn } from '../../../../design/utilities/cn'

// Types
import type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayBlur,
  DialogRootProps,
  DialogSize,
  DialogTitleProps,
  DialogTriggerProps,
  DialogVariant,
} from './dialog.types'

// ============================================================================
// Variant Definitions
// ============================================================================

/**
 * Dialog size variants with responsive breakpoints
 */
const dialogSizeVariants: Record<DialogSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-[95vw] max-h-[95vh]',
}

/**
 * Dialog visual variants using design tokens
 */
const dialogVariantStyles: Record<DialogVariant, string> = {
  default: cn(
    colorTokens.bgElevated,
    colorTokens.text,
    shadowTokens.lg,
    'border-transparent'
  ),
  elevated: cn(
    colorTokens.bgElevated,
    colorTokens.text,
    shadowTokens.lg,
    'border-transparent'
  ),
  bordered: cn(
    colorTokens.bgElevated,
    colorTokens.text,
    shadowTokens.md,
    `border ${colorTokens.borderSubtle}`
  ),
}

/**
 * Overlay blur intensity variants
 */
const overlayBlurVariants: Record<DialogOverlayBlur, string> = {
  none: 'backdrop-blur-none',
  light: 'backdrop-blur-sm',
  medium: 'backdrop-blur-md',
  heavy: 'backdrop-blur-lg',
}

// ============================================================================
// Dialog Root Component
// ============================================================================

/**
 * Dialog Root - Container for all dialog parts
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogTrigger>Open Dialog</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Dialog description here</DialogDescription>
 *     </DialogHeader>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export const Dialog = DialogPrimitive.Root

// ============================================================================
// Dialog Trigger Component
// ============================================================================

/**
 * Dialog Trigger - Button that opens the dialog
 *
 * @example
 * ```tsx
 * <DialogTrigger asChild>
 *   <button>Open Dialog</button>
 * </DialogTrigger>
 * ```
 */
export const DialogTrigger = DialogPrimitive.Trigger

// ============================================================================
// Dialog Portal Component
// ============================================================================

/**
 * Dialog Portal - Portals the dialog content to document.body
 */
export const DialogPortal = DialogPrimitive.Portal

// ============================================================================
// Dialog Overlay Component
// ============================================================================

/**
 * Dialog Overlay - Semi-transparent backdrop behind dialog
 */
export const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    blur?: DialogOverlayBlur
  }
>(({ className, blur = 'medium', ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Base overlay styles
      'fixed inset-0 z-50',
      // Background with opacity
      'bg-black/50',
      // Blur effect
      overlayBlurVariants[blur],
      // Animation
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      // MCP marker
      'mcp-client-interactive',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

// ============================================================================
// Dialog Content Component
// ============================================================================

/**
 * Dialog Content - Main content container
 *
 * Integrates Layer 1 Typography components and design tokens
 *
 * @example
 * ```tsx
 * <DialogContent size="lg" variant="elevated" showCloseButton>
 *   <DialogHeader>
 *     <DialogTitle>Confirm Action</DialogTitle>
 *   </DialogHeader>
 *   <p>Content here</p>
 * </DialogContent>
 * ```
 */
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(
  (
    {
      className,
      children,
      size = 'md',
      variant = 'default',
      overlayBlur = 'medium',
      showCloseButton = true,
      testId,
      overlayClassName,
      ...props
    },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay blur={overlayBlur} className={overlayClassName} />
      <DialogPrimitive.Content
        ref={ref}
        data-testid={testId}
        data-mcp-validated="true"
        data-constitution-compliant="client-component-interactive"
        className={cn(
          // Positioning
          'fixed top-[50%] left-[50%] z-50',
          'translate-x-[-50%] translate-y-[-50%]',
          // Size
          'w-full',
          dialogSizeVariants[size],
          // Visual variant
          dialogVariantStyles[variant],
          // Spacing and borders
          'px-6 py-6',
          radiusTokens.lg,
          'border',
          // Max height for scrolling
          'max-h-[85vh] overflow-y-auto',
          // Animation
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          // Focus styles
          'focus:outline-none',
          // MCP marker
          'mcp-client-interactive',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              'absolute top-4 right-4',
              'rounded-sm opacity-70',
              'ring-offset-background transition-opacity',
              'hover:opacity-100',
              'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
              'disabled:pointer-events-none',
              colorTokens.textMuted,
              'data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
            )}
          >
            <XMarkIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = 'DialogContent'

// ============================================================================
// Dialog Header Component
// ============================================================================

/**
 * Dialog Header - Container for title and description
 *
 * @example
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>Title Here</DialogTitle>
 *   <DialogDescription>Description here</DialogDescription>
 * </DialogHeader>
 * ```
 */
export const DialogHeader: React.FC<DialogHeaderProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  >
    {children}
  </div>
)
DialogHeader.displayName = 'DialogHeader'

// ============================================================================
// Dialog Title Component
// ============================================================================

/**
 * Dialog Title - Heading for the dialog (integrates Layer 1 Heading)
 *
 * @example
 * ```tsx
 * <DialogTitle asChild>
 *   <Heading level="h2">Confirm Action</Heading>
 * </DialogTitle>
 * ```
 */
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, children, asChild = false, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} asChild={asChild} {...props}>
    {asChild ? (
      children
    ) : (
      <Heading
        level={2}
        size="lg"
        className={cn('font-semibold tracking-tight', className)}
      >
        {children}
      </Heading>
    )}
  </DialogPrimitive.Title>
))
DialogTitle.displayName = 'DialogTitle'

// ============================================================================
// Dialog Description Component
// ============================================================================

/**
 * Dialog Description - Descriptive text (integrates Layer 1 Text)
 *
 * @example
 * ```tsx
 * <DialogDescription asChild>
 *   <Text variant="body" color="muted">
 *     This action cannot be undone.
 *   </Text>
 * </DialogDescription>
 * ```
 */
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, children, asChild = false, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} asChild={asChild} {...props}>
    {asChild ? (
      children
    ) : (
      <Text
        size="sm"
        color="muted"
        className={cn('leading-relaxed', className)}
      >
        {children}
      </Text>
    )}
  </DialogPrimitive.Description>
))
DialogDescription.displayName = 'DialogDescription'

// ============================================================================
// Dialog Footer Component
// ============================================================================

/**
 * Dialog Footer - Container for action buttons
 *
 * @example
 * ```tsx
 * <DialogFooter>
 *   <button onClick={onCancel}>Cancel</button>
 *   <button onClick={onConfirm}>Confirm</button>
 * </DialogFooter>
 * ```
 */
export const DialogFooter: React.FC<DialogFooterProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  >
    {children}
  </div>
)
DialogFooter.displayName = 'DialogFooter'

// ============================================================================
// Dialog Close Component
// ============================================================================

/**
 * Dialog Close - Button to close the dialog
 *
 * @example
 * ```tsx
 * <DialogClose asChild>
 *   <button>Cancel</button>
 * </DialogClose>
 * ```
 */
export const DialogClose = DialogPrimitive.Close

// ============================================================================
// Exports
// ============================================================================

export type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayBlur,
  DialogRootProps,
  DialogSize,
  DialogTitleProps,
  DialogTriggerProps,
  DialogVariant,
}

// Default export for convenience
export default Dialog
