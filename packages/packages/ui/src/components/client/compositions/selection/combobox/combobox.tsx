/**
 * Combobox Component - Layer 2 Composition
 *
 * A searchable select/combobox component using Radix Popover + custom logic.
 *
 * @module Combobox
 * @layer 2
 * @category selection
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import {
  CheckIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type { ComboboxProps, ComboboxSize } from './combobox.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const comboboxSizeVariants: Record<ComboboxSize, string> = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

// ============================================================================
// Combobox Component
// ============================================================================

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  size = 'md',
  disabled = false,
  className,
  testId,
}) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    return options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search])

  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          data-testid={testId}
          data-mcp-validated="true"
          data-constitution-compliant="layer2-composition"
          data-layer="2"
          className={cn(
            'flex w-full items-center justify-between',
            colorTokens.bgElevated,
            radiusTokens.md,
            'border',
            'ring-offset-background',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            comboboxSizeVariants[size],
            'mcp-client-interactive',
            className
          )}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            'z-50 w-[var(--radix-popover-trigger-width)] p-0',
            colorTokens.bgElevated,
            radiusTokens.md,
            shadowTokens.md,
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          sideOffset={4}
        >
          <div className="flex items-center border-b px-3">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'flex h-10 w-full bg-transparent py-3 text-sm outline-none',
                'placeholder:text-muted-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  disabled={option.disabled}
                  onClick={() => {
                    onValueChange?.(option.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'relative flex w-full cursor-default select-none items-center',
                    'py-1.5 pl-8 pr-2 text-sm outline-none',
                    radiusTokens.sm,
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus:bg-accent focus:text-accent-foreground',
                    option.disabled && 'pointer-events-none opacity-50'
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {value === option.value && <CheckIcon className="h-4 w-4" />}
                  </span>
                  {option.label}
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
Combobox.displayName = 'Combobox'

// ============================================================================
// Exports
// ============================================================================

export type { ComboboxOption, ComboboxProps, ComboboxSize } from './combobox.types'

export { comboboxSizeVariants }

export default Combobox

