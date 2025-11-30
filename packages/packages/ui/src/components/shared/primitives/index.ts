/**
 * Shared Primitive Components
 *
 * RSC-Compatible Primitives (NO 'use client' directive)
 * - Environment-agnostic (work in both server & client)
 * - Accept event handlers as props
 * - Server-side rendering compatible
 * - Next.js RSC Official Pattern
 *
 * All primitives follow AI-BOS design system:
 * - Flat token structure from tokens.ts
 * - WCAG 2.1 AA/AAA accessibility
 * - MCP validated
 */

// Surface primitive - Generic surface/container component
export {
  Surface,
  surfaceVariants,
  type SurfaceProps,
  type SurfaceSize,
  type SurfaceVariant,
} from './surface'

// Badge primitive - Status/label component
export {
  Badge,
  badgeVariants,
  type BadgeProps,
  type BadgeSize,
  type BadgeVariant,
} from './badge'

// Button primitive - Action button component
export {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './button'

// Input primitive - Form input component
export {
  Input,
  type InputProps,
  type InputSize,
  type InputVariant,
} from './input'

// Label primitive - Form label component
export {
  Label,
  type LabelProps,
  type LabelSize,
  type LabelVariant,
} from './label'

// Separator primitive - Visual divider component
export {
  Separator,
  type SeparatorOrientation,
  type SeparatorProps,
  type SeparatorVariant,
} from './separator'

// Skeleton primitive - Loading placeholder component
export {
  Skeleton,
  type SkeletonProps,
  type SkeletonSize,
  type SkeletonVariant,
} from './skeleton'

// Avatar primitive - User avatar component
export {
  Avatar,
  type AvatarProps,
  type AvatarSize,
  type AvatarVariant,
} from './avatar'

// Card primitive - Content container component
export { Card, type CardProps, type CardSize, type CardVariant } from './card'

// Fieldset primitive - Form grouping component
export {
  Fieldset,
  fieldsetVariants,
  type FieldsetProps,
  type FieldsetSize,
  type FieldsetVariant,
} from './fieldset'

// FormDescription primitive - Helper text component
export {
  FormDescription,
  formDescriptionVariants,
  type FormDescriptionProps,
  type FormDescriptionSize,
} from './form-description'

// FormError primitive - Error message component
export {
  FormError,
  formErrorVariants,
  type FormErrorProps,
  type FormErrorSize,
} from './form-error'

// Tag primitive - Tag/chip component
export {
  Tag,
  tagVariants,
  type TagProps,
  type TagSize,
  type TagVariant,
} from './tag'

// Grid primitive - CSS Grid layout component
export {
  Grid,
  gridVariants,
  type GridCols,
  type GridGap,
  type GridProps,
} from './grid'

// Flex primitive - Flexbox layout component
export {
  Flex,
  flexVariants,
  type FlexAlign,
  type FlexDirection,
  type FlexGap,
  type FlexJustify,
  type FlexProps,
  type FlexWrap,
} from './flex'

// Spacer primitive - Spacing utility component
export {
  Spacer,
  spacerVariants,
  type SpacerAxis,
  type SpacerProps,
  type SpacerSize,
} from './spacer'

// ScrollArea primitive - Simple scroll container
export {
  ScrollArea,
  scrollAreaVariants,
  type ScrollAreaOrientation,
  type ScrollAreaProps,
} from './scroll-area'

// ResponsiveBox primitive - Responsive container
export {
  ResponsiveBox,
  responsiveBoxVariants,
  type Breakpoint,
  type ResponsiveBoxProps,
  type ResponsiveDisplay,
} from './responsive-box'