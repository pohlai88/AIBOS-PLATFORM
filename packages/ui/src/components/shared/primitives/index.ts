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
