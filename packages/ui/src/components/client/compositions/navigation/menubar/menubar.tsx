/**
 * Menubar Component - Layer 2 Radix Composition
 *
 * A horizontal menu bar built on Radix UI Menubar primitive.
 *
 * @module Menubar
 * @layer 2
 * @radixPrimitive @radix-ui/react-menubar
 * @category navigation
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import { CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import * as MenubarPrimitive from '@radix-ui/react-menubar'
import * as React from 'react'

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  MenubarCheckboxItemProps,
  MenubarContentProps,
  MenubarItemProps,
  MenubarLabelProps,
  MenubarRadioItemProps,
  MenubarRootProps,
  MenubarSeparatorProps,
  MenubarShortcutProps,
  MenubarSubContentProps,
  MenubarSubTriggerProps,
  MenubarTriggerProps,
} from './menubar.types'

// ============================================================================
// Root Component
// ============================================================================

export const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  MenubarRootProps
>(({ className, testId, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      'flex h-10 items-center space-x-1 p-1',
      colorTokens.bgElevated,
      radiusTokens.md,
      'border',
      'mcp-client-interactive',
      className
    )}
    {...props}
  />
))
Menubar.displayName = 'Menubar'

export const MenubarMenu = MenubarPrimitive.Menu
export const MenubarGroup = MenubarPrimitive.Group
export const MenubarPortal = MenubarPrimitive.Portal
export const MenubarSub = MenubarPrimitive.Sub
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup

// ============================================================================
// Trigger Component
// ============================================================================

export const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  MenubarTriggerProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center',
      'px-3 py-1.5 text-sm font-medium outline-none',
      radiusTokens.sm,
      'focus:bg-accent focus:text-accent-foreground',
      'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      className
    )}
    {...props}
  />
))
MenubarTrigger.displayName = 'MenubarTrigger'

// ============================================================================
// Content Component
// ============================================================================

export const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  MenubarContentProps
>(
  (
    { className, align = 'start', alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden p-1',
          colorTokens.bgElevated,
          colorTokens.fg,
          radiusTokens.md,
          shadowTokens.md,
          'data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
)
MenubarContent.displayName = 'MenubarContent'

// ============================================================================
// Item Component
// ============================================================================

export const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  MenubarItemProps
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center',
      'px-2 py-1.5 text-sm outline-none',
      radiusTokens.sm,
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
))
MenubarItem.displayName = 'MenubarItem'

// ============================================================================
// Checkbox Item Component
// ============================================================================

export const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  MenubarCheckboxItemProps
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center',
      'py-1.5 pl-8 pr-2 text-sm outline-none',
      radiusTokens.sm,
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = 'MenubarCheckboxItem'

// ============================================================================
// Radio Item Component
// ============================================================================

export const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  MenubarRadioItemProps
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center',
      'py-1.5 pl-8 pr-2 text-sm outline-none',
      radiusTokens.sm,
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <div className="h-2 w-2 rounded-full bg-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = 'MenubarRadioItem'

// ============================================================================
// Label Component
// ============================================================================

export const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  MenubarLabelProps
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      className
    )}
    {...props}
  />
))
MenubarLabel.displayName = 'MenubarLabel'

// ============================================================================
// Separator Component
// ============================================================================

export const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  MenubarSeparatorProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
))
MenubarSeparator.displayName = 'MenubarSeparator'

// ============================================================================
// Sub Trigger Component
// ============================================================================

export const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  MenubarSubTriggerProps
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      'flex cursor-default select-none items-center',
      'px-2 py-1.5 text-sm outline-none',
      radiusTokens.sm,
      'focus:bg-accent focus:text-accent-foreground',
      'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      inset && 'pl-8',
      className
    )}
    {...props}
  >
    {children}
    <ChevronRightIcon className="ml-auto h-4 w-4" />
  </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = 'MenubarSubTrigger'

// ============================================================================
// Sub Content Component
// ============================================================================

export const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  MenubarSubContentProps
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      'z-50 min-w-[8rem] overflow-hidden p-1',
      colorTokens.bgElevated,
      colorTokens.fg,
      radiusTokens.md,
      shadowTokens.md,
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[side=bottom]:slide-in-from-top-2',
      'data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2',
      'data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
MenubarSubContent.displayName = 'MenubarSubContent'

// ============================================================================
// Shortcut Component
// ============================================================================

export const MenubarShortcut: React.FC<MenubarShortcutProps> = ({
  className,
  ...props
}) => (
  <span
    className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
    {...props}
  />
)
MenubarShortcut.displayName = 'MenubarShortcut'

// ============================================================================
// Exports
// ============================================================================

export type {
  MenubarCheckboxItemProps,
  MenubarContentProps,
  MenubarItemProps,
  MenubarLabelProps,
  MenubarRadioItemProps,
  MenubarRootProps,
  MenubarSeparatorProps,
  MenubarShortcutProps,
  MenubarSubContentProps,
  MenubarSubTriggerProps,
  MenubarTriggerProps,
} from './menubar.types'

export default Menubar

