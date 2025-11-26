/**
 * Sheet Component - Layer 2 Radix Composition
 *
 * A slide-out panel (drawer) built on Radix UI Dialog primitive.
 *
 * @module Sheet
 * @layer 2
 * @radixPrimitive @radix-ui/react-dialog
 * @category overlay
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

import {
  colorTokens,
  shadowTokens,
} from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetSide,
  SheetSize,
  SheetTitleProps,
} from './sheet.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const sheetSideVariants: Record<SheetSide, string> = {
  top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
  left: 'inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  right: 'inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
}

const sheetSizeVariants: Record<SheetSide, Record<SheetSize, string>> = {
  top: { sm: 'h-1/4', md: 'h-1/3', lg: 'h-1/2', xl: 'h-2/3', full: 'h-full' },
  bottom: { sm: 'h-1/4', md: 'h-1/3', lg: 'h-1/2', xl: 'h-2/3', full: 'h-full' },
  left: { sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[480px]', full: 'w-full' },
  right: { sm: 'w-64', md: 'w-80', lg: 'w-96', xl: 'w-[480px]', full: 'w-full' },
}

// ============================================================================
// Root Components
// ============================================================================

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetPortal = DialogPrimitive.Portal

// ============================================================================
// Overlay Component
// ============================================================================

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

// ============================================================================
// Content Component
// ============================================================================

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ className, children, side = 'right', size = 'md', testId, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer2-radix-composition"
      data-layer="2"
      className={cn(
        'fixed z-50 gap-4 p-6',
        colorTokens.bgElevated,
        shadowTokens.lg,
        'transition ease-in-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:duration-300 data-[state=open]:duration-500',
        sheetSideVariants[side],
        sheetSizeVariants[side][size],
        'mcp-client-interactive',
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className={cn(
          'absolute right-4 top-4 rounded-sm opacity-70',
          'ring-offset-background transition-opacity',
          'hover:opacity-100',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:pointer-events-none',
          'data-[state=open]:bg-secondary'
        )}
      >
        <XMarkIcon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = 'SheetContent'

// ============================================================================
// Header Component
// ============================================================================

export const SheetHeader: React.FC<SheetHeaderProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

// ============================================================================
// Footer Component
// ============================================================================

export const SheetFooter: React.FC<SheetFooterProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

// ============================================================================
// Title Component
// ============================================================================

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  SheetTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
SheetTitle.displayName = 'SheetTitle'

// ============================================================================
// Description Component
// ============================================================================

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  SheetDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
SheetDescription.displayName = 'SheetDescription'

// ============================================================================
// Exports
// ============================================================================

export type {
  SheetContentProps,
  SheetDescriptionProps,
  SheetFooterProps,
  SheetHeaderProps,
  SheetRootProps,
  SheetSide,
  SheetSize,
  SheetTitleProps,
  SheetTriggerProps,
} from './sheet.types'

export { sheetSideVariants, sheetSizeVariants }

export default Sheet

