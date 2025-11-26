/**
 * AlertDialog Types - Layer 2 Radix Composition
 * @module AlertDialogTypes
 * @layer 2
 */

import type * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'

export type AlertDialogVariant = 'default' | 'destructive'

export interface AlertDialogRootProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Root> {}

export interface AlertDialogTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Trigger> {}

export interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  testId?: string
}

export interface AlertDialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertDialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertDialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {}

export interface AlertDialogDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {}

export interface AlertDialogActionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  variant?: AlertDialogVariant
}

export interface AlertDialogCancelProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> {}

