/**
 * CommandPalette Component - Layer 2 Composition
 *
 * A command palette/search component using Radix Dialog + custom command logic.
 * Similar to VS Code's Cmd+K or Spotlight search.
 *
 * @module CommandPalette
 * @layer 2
 * @category navigation
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  CommandEmptyProps,
  CommandGroupProps,
  CommandInputProps,
  CommandItemProps,
  CommandListProps,
  CommandPaletteProps,
  CommandSeparatorProps,
  CommandShortcutProps,
} from './command-palette.types'

// ============================================================================
// Context
// ============================================================================

const CommandContext = React.createContext<{
  search: string
  setSearch: (value: string) => void
}>({ search: '', setSearch: () => {} })

// ============================================================================
// Root Component
// ============================================================================

export const Command = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [search, setSearch] = React.useState('')

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div
        ref={ref}
        data-mcp-validated="true"
        data-constitution-compliant="layer2-composition"
        data-layer="2"
        className={cn(
          'flex h-full w-full flex-col overflow-hidden',
          colorTokens.bgElevated,
          colorTokens.fg,
          radiusTokens.lg,
          'mcp-client-interactive',
          className
        )}
        {...props}
      />
    </CommandContext.Provider>
  )
})
Command.displayName = 'Command'

// ============================================================================
// Dialog Wrapper
// ============================================================================

export const CommandDialog: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  children,
  testId,
  className,
}) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/50',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
        )}
      />
      <DialogPrimitive.Content
        data-testid={testId}
        className={cn(
          'fixed left-[50%] top-[50%] z-50',
          'translate-x-[-50%] translate-y-[-50%]',
          'w-full max-w-lg',
          shadowTokens.lg,
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          className
        )}
      >
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          {children}
        </Command>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
)
CommandDialog.displayName = 'CommandDialog'

// ============================================================================
// Input Component
// ============================================================================

export const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => {
    const { search, setSearch } = React.useContext(CommandContext)

    return (
      <div className="flex items-center border-b px-3">
        <MagnifyingGlassIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <input
          ref={ref}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'flex h-11 w-full bg-transparent py-3 text-sm outline-none',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)
CommandInput.displayName = 'CommandInput'

// ============================================================================
// List Component
// ============================================================================

export const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  )
)
CommandList.displayName = 'CommandList'

// ============================================================================
// Empty Component
// ============================================================================

export const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('py-6 text-center text-sm', className)}
      {...props}
    />
  )
)
CommandEmpty.displayName = 'CommandEmpty'

// ============================================================================
// Group Component
// ============================================================================

export const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-hidden p-1 text-foreground',
        '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5',
        '[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
        '[&_[cmdk-group-heading]]:text-muted-foreground',
        className
      )}
      {...props}
    >
      {heading && (
        <div cmdk-group-heading="" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </div>
  )
)
CommandGroup.displayName = 'CommandGroup'

// ============================================================================
// Separator Component
// ============================================================================

export const CommandSeparator = React.forwardRef<
  HTMLDivElement,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('-mx-1 h-px bg-border', className)}
    {...props}
  />
))
CommandSeparator.displayName = 'CommandSeparator'

// ============================================================================
// Item Component
// ============================================================================

export const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
  ({ className, disabled, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      role="option"
      aria-selected={false}
      aria-disabled={disabled}
      onClick={() => !disabled && onSelect?.()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !disabled) {
          onSelect?.()
        }
      }}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'relative flex cursor-default select-none items-center',
        'px-2 py-1.5 text-sm outline-none',
        radiusTokens.sm,
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'aria-selected:bg-accent aria-selected:text-accent-foreground',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    />
  )
)
CommandItem.displayName = 'CommandItem'

// ============================================================================
// Shortcut Component
// ============================================================================

export const CommandShortcut: React.FC<CommandShortcutProps> = ({
  className,
  ...props
}) => (
  <span
    className={cn(
      'ml-auto text-xs tracking-widest text-muted-foreground',
      className
    )}
    {...props}
  />
)
CommandShortcut.displayName = 'CommandShortcut'

// ============================================================================
// Exports
// ============================================================================

export type {
  CommandEmptyProps,
  CommandGroup as CommandGroupType,
  CommandGroupProps,
  CommandInputProps,
  CommandItem as CommandItemType,
  CommandItemProps,
  CommandListProps,
  CommandPaletteProps,
  CommandSeparatorProps,
  CommandShortcutProps,
} from './command-palette.types'

export default Command

