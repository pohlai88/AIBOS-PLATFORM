/**
 * Sheet Types - Layer 2 Radix Composition
 * @module SheetTypes
 * @layer 2
 */

import type * as DialogPrimitive from '@radix-ui/react-dialog'

export type SheetSide = 'top' | 'right' | 'bottom' | 'left'
export type SheetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface SheetRootProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

export interface SheetTriggerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger> {}

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: SheetSide
  size?: SheetSize
  testId?: string
}

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface SheetTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {}
export interface SheetDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {}

