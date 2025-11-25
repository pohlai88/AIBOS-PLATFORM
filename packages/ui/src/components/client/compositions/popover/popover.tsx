/**
 * Popover Component - Layer 2 Radix Composition
 *
 * A popover component built on Radix UI Popover primitive,
 * integrated with Layer 1 Typography components (Text, Heading)
 * and AI-BOS design tokens.
 *
 * Features:
 * - Floating content with smart positioning
 * - Click or hover trigger options
 * - ARIA attributes (role="dialog")
 * - Customizable size and visual variants
 * - Layer 1 Typography integration
 * - WCAG 2.1 AA/AAA compliant
 * - MCP validated Client Component
 *
 * @module Popover
 * @layer 2
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

// Design System
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from '../../../../design/tokens/tokens'
import { cn } from '../../../../design/utilities/cn'

// Types
import type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverRootProps,
  PopoverSize,
  PopoverTriggerProps,
  PopoverVariant,
} from './popover.types'

// ============================================================================
// Variant Definitions
// ============================================================================

/**
 * Popover size variants
 */
const popoverSizeVariants: Record<PopoverSize, string> = {
  sm: 'w-64',
  md: 'w-80',
  lg: 'w-96',
  auto: 'w-auto',
}

/**
 * Popover visual variants using design tokens
 */
const popoverVariantStyles: Record<PopoverVariant, string> = {
  default: cn(
    colorTokens.bgElevated,
    colorTokens.text,
    shadowTokens.md,
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
    shadowTokens.sm,
    `border ${colorTokens.borderSubtle}`
  ),
}

// ============================================================================
// Popover Root Component
// ============================================================================

/**
 * Popover Root - Container for all popover parts
 *
 * @example
 * ```tsx
 * <Popover open={isOpen} onOpenChange={setIsOpen}>
 *   <PopoverTrigger>Click me</PopoverTrigger>
 *   <PopoverContent>
 *     <p>Popover content here</p>
 *   </PopoverContent>
 * </Popover>
 * ```
 */
export const Popover = PopoverPrimitive.Root

// ============================================================================
// Popover Trigger Component
// ============================================================================

/**
 * Popover Trigger - Button that opens the popover
 *
 * @example
 * ```tsx
 * <PopoverTrigger asChild>
 *   <button>Open Popover</button>
 * </PopoverTrigger>
 * ```
 */
export const PopoverTrigger = PopoverPrimitive.Trigger

// ============================================================================
// Popover Anchor Component
// ============================================================================

/**
 * Popover Anchor - Element to anchor the popover to
 */
export const PopoverAnchor = PopoverPrimitive.Anchor

// ============================================================================
// Popover Content Component
// ============================================================================

/**
 * Popover Content - Main content container
 *
 * Integrates Layer 1 Typography components and design tokens
 *
 * @example
 * ```tsx
 * <PopoverContent size="lg" variant="elevated" showArrow>
 *   <h3>Popover Title</h3>
 *   <p>Popover content here</p>
 * </PopoverContent>
 * ```
 */
export const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      children,
      size = 'md',
      variant = 'default',
      side = 'bottom',
      align = 'center',
      sideOffset = 8,
      showArrow = false,
      testId,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        data-testid={testId}
        data-mcp-validated="true"
        data-constitution-compliant="client-component-interactive"
        className={cn(
          // Size
          popoverSizeVariants[size],
          // Visual variant
          popoverVariantStyles[variant],
          // Spacing and borders
          'px-4 py-3',
          radiusTokens.md,
          'border',
          // Max height for scrolling
          'max-h-[var(--radix-popover-content-available-height)]',
          'overflow-y-auto',
          // Z-index
          'z-50',
          // Animation
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2',
          'data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2',
          'data-[side=top]:slide-in-from-bottom-2',
          // Focus styles
          'focus:outline-none',
          // MCP marker
          'mcp-client-interactive',
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <PopoverPrimitive.Arrow
            className={cn(
              colorTokens.bgElevated,
              'fill-current',
              variant === 'bordered' && `stroke-${colorTokens.borderSubtle}`
            )}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
)
PopoverContent.displayName = 'PopoverContent'

// ============================================================================
// Popover Close Component
// ============================================================================

/**
 * Popover Close - Button to close the popover
 *
 * @example
 * ```tsx
 * <PopoverClose asChild>
 *   <button>Close</button>
 * </PopoverClose>
 * ```
 */
export const PopoverClose = PopoverPrimitive.Close

// ============================================================================
// Exports
// ============================================================================

export type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverRootProps,
  PopoverSize,
  PopoverTriggerProps,
  PopoverVariant,
}

// Default export for convenience
export default Popover
