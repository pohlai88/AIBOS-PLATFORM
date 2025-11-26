/**
 * ToggleGroup Component - Layer 2 Radix Composition
 *
 * A group of toggle buttons built on Radix UI ToggleGroup primitive.
 *
 * @module ToggleGroup
 * @layer 2
 * @radixPrimitive @radix-ui/react-toggle-group
 * @category selection
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import * as React from 'react'

import { radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type {
  ToggleGroupItemProps,
  ToggleGroupRootProps,
  ToggleGroupSize,
  ToggleGroupVariant,
} from './toggle-group.types'

// ============================================================================
// Context
// ============================================================================

const ToggleGroupContext = React.createContext<{
  variant?: ToggleGroupVariant
  size?: ToggleGroupSize
}>({})

// ============================================================================
// Variant Definitions
// ============================================================================

const toggleGroupSizeVariants: Record<ToggleGroupSize, string> = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-10 px-3 text-sm',
  lg: 'h-12 px-4 text-base',
}

const toggleGroupVariantStyles: Record<ToggleGroupVariant, string> = {
  default: cn(
    'bg-transparent',
    'hover:bg-muted hover:text-muted-foreground',
    'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground'
  ),
  outline: cn(
    'border border-input bg-transparent',
    'hover:bg-accent hover:text-accent-foreground',
    'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground'
  ),
}

// ============================================================================
// Root Component
// ============================================================================

export const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  ToggleGroupRootProps
>(({ className, variant = 'default', size = 'md', testId, children, type = 'single', value, defaultValue, onValueChange, disabled, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    type={type as any}
    value={value as any}
    defaultValue={defaultValue as any}
    onValueChange={onValueChange as any}
    disabled={disabled}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      'inline-flex items-center justify-center gap-1',
      radiusTokens.md,
      'mcp-client-interactive',
      className
    )}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))
ToggleGroup.displayName = 'ToggleGroup'

// ============================================================================
// Item Component
// ============================================================================

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  ToggleGroupItemProps
>(({ className, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)
  const resolvedVariant = variant || context.variant || 'default'
  const resolvedSize = size || context.size || 'md'

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium',
        'ring-offset-background transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        radiusTokens.md,
        toggleGroupSizeVariants[resolvedSize],
        toggleGroupVariantStyles[resolvedVariant],
        className
      )}
      {...props}
    />
  )
})
ToggleGroupItem.displayName = 'ToggleGroupItem'

// ============================================================================
// Exports
// ============================================================================

export type {
  ToggleGroupItemProps,
  ToggleGroupRootProps,
  ToggleGroupSize,
  ToggleGroupVariant,
} from './toggle-group.types'

export { toggleGroupSizeVariants, toggleGroupVariantStyles }

export default ToggleGroup

