/**
 * ScrollArea Component - Layer 2 Radix Composition
 *
 * A custom scrollable area with styled scrollbars.
 * Wraps Radix UI ScrollArea primitive with AI-BOS design tokens.
 *
 * @layer Layer 2 - Radix Compositions
 * @radixPrimitive @radix-ui/react-scroll-area
 * @category Client Components
 * @example
 * ```tsx
 * import { ScrollArea } from '@aibos/ui/compositions';
 *
 * export default function Page() {
 *   return (
 *     <ScrollArea className="h-[400px]">
 *       <div>Your scrollable content...</div>
 *     </ScrollArea>
 *   );
 * }
 * ```
 */

'use client'

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import * as React from 'react'

// Import design tokens
import { colorTokens, radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

// Import types
import type {
  ScrollAreaCornerProps,
  ScrollAreaProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaViewportProps,
  ScrollbarSize,
  ScrollbarVisibility,
} from './scroll-area.types'

/**
 * Scrollbar size variants
 */
const scrollbarSizeVariants: Record<ScrollbarSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

/**
 * Scrollbar visibility variants
 */
const scrollbarVisibilityVariants: Record<ScrollbarVisibility, string> = {
  auto: '', // Default Radix behavior
  always: 'opacity-100',
  hover: 'opacity-0 group-hover:opacity-100 transition-opacity',
  scroll: 'opacity-0 data-[state=visible]:opacity-100 transition-opacity',
}

/**
 * ScrollArea - Root component
 * Main container with custom scrollbars
 *
 * @mcp-marker client-component-wrapper
 */
export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    {
      className,
      children,
      scrollType = 'vertical',
      scrollbarSize = 'md',
      scrollbarVisibility = 'hover',
      testId,
      ...props
    },
    ref
  ) => {
    const showVertical = scrollType === 'vertical' || scrollType === 'both'
    const showHorizontal = scrollType === 'horizontal' || scrollType === 'both'

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn(
          'group relative overflow-hidden',
          'mcp-client-interactive',
          className
        )}
        data-testid={testId}
        data-mcp-validated="true"
        data-constitution-compliant="client-component-interactive"
        {...props}
      >
        <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
          {children}
        </ScrollAreaPrimitive.Viewport>

        {showVertical && (
          <ScrollAreaScrollbar
            orientation="vertical"
            className={cn(
              scrollbarSizeVariants[scrollbarSize],
              scrollbarVisibilityVariants[scrollbarVisibility]
            )}
          />
        )}

        {showHorizontal && (
          <ScrollAreaScrollbar
            orientation="horizontal"
            className={cn(
              scrollbarSizeVariants[scrollbarSize],
              scrollbarVisibilityVariants[scrollbarVisibility]
            )}
          />
        )}

        {showVertical && showHorizontal && <ScrollAreaCorner />}
      </ScrollAreaPrimitive.Root>
    )
  }
)
ScrollArea.displayName = 'ScrollArea'

/**
 * ScrollAreaViewport - The scrollable content viewport
 *
 * @mcp-marker client-component-viewport
 */
export const ScrollAreaViewport = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Viewport>,
  ScrollAreaViewportProps
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Viewport
    ref={ref}
    className={cn('h-full w-full rounded-[inherit]', className)}
    {...props}
  >
    {children}
  </ScrollAreaPrimitive.Viewport>
))
ScrollAreaViewport.displayName = 'ScrollAreaViewport'

/**
 * ScrollAreaScrollbar - The scrollbar track and thumb
 *
 * @mcp-marker client-component-scrollbar
 */
export const ScrollAreaScrollbar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  ScrollAreaScrollbarProps
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none transition-colors select-none',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' &&
        'h-2.5 w-full border-t border-t-transparent p-px',
      className
    )}
    {...props}
  >
    <ScrollAreaThumb />
  </ScrollAreaPrimitive.Scrollbar>
))
ScrollAreaScrollbar.displayName = 'ScrollAreaScrollbar'

/**
 * ScrollAreaThumb - The draggable thumb inside the scrollbar
 *
 * @mcp-marker client-component-thumb
 */
export const ScrollAreaThumb = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Thumb>,
  ScrollAreaThumbProps
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Thumb
    ref={ref}
    className={cn(
      'relative flex-1',
      radiusTokens.full,
      'bg-gray-300 hover:bg-gray-400',
      'dark:bg-gray-700 dark:hover:bg-gray-600',
      'transition-colors',
      className
    )}
    {...props}
  />
))
ScrollAreaThumb.displayName = 'ScrollAreaThumb'

/**
 * ScrollAreaCorner - The corner element when both scrollbars are visible
 *
 * @mcp-marker client-component-corner
 */
export const ScrollAreaCorner = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Corner>,
  ScrollAreaCornerProps
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Corner
    ref={ref}
    className={cn(colorTokens.bg, className)}
    {...props}
  />
))
ScrollAreaCorner.displayName = 'ScrollAreaCorner'

// Default export for convenience
export default Object.assign(ScrollArea, {
  Viewport: ScrollAreaViewport,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner,
})
