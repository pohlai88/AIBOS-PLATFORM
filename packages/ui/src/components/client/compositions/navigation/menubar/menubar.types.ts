/**
 * Menubar Types - Layer 2 Radix Composition
 * @module MenubarTypes
 * @layer 2
 */

import type * as MenubarPrimitive from '@radix-ui/react-menubar'

export interface MenubarRootProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root> {
  testId?: string
}

export interface MenubarMenuProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Menu> {}

export interface MenubarTriggerProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger> {}

export interface MenubarContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content> {}

export interface MenubarItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  inset?: boolean
}

export interface MenubarCheckboxItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem> {}

export interface MenubarRadioItemProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem> {}

export interface MenubarLabelProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> {
  inset?: boolean
}

export interface MenubarSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator> {}

export interface MenubarSubTriggerProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> {
  inset?: boolean
}

export interface MenubarSubContentProps
  extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent> {}

export interface MenubarShortcutProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

