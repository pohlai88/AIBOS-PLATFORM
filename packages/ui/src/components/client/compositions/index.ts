/**
 * Layer 2 - Radix Compositions
 *
 * Client Components that compose Radix UI primitives with Layer 1 components
 * and AI-BOS design tokens.
 *
 * @module compositions
 * @layer 2
 */

// Dialog Composition
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog'

export type {
  DialogCloseProps,
  DialogContentProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogOverlayBlur,
  DialogRootProps,
  DialogSize,
  DialogTitleProps,
  DialogTriggerProps,
  DialogVariant,
} from './dialog'

// Popover Composition
export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './popover'

export type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverContentProps,
  PopoverRootProps,
  PopoverSize,
  PopoverTriggerProps,
  PopoverVariant,
} from './popover'

// Tooltip Composition
export {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

export type {
  TooltipAlign,
  TooltipArrowProps,
  TooltipContentProps,
  TooltipProviderProps,
  TooltipRootProps,
  TooltipSide,
  TooltipSize,
  TooltipTriggerProps,
  TooltipVariant,
} from './tooltip'

// ScrollArea Composition
export {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from './scroll-area'

export type {
  ScrollAreaCornerProps,
  ScrollAreaProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaViewportProps,
  ScrollDirection,
  ScrollbarSize,
  ScrollbarVisibility,
} from './scroll-area'
