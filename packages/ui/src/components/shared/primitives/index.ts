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

// Alert primitive - Status message component
export {
  Alert,
  alertVariants,
  type AlertProps,
  type AlertSize,
  type AlertVariant,
} from './alert'

// AlertDialog primitive - Modal confirmation component
export {
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  type AlertDialogOverlayProps,
  type AlertDialogContentProps,
  type AlertDialogHeaderProps,
  type AlertDialogTitleProps,
  type AlertDialogDescriptionProps,
  type AlertDialogBodyProps,
  type AlertDialogFooterProps,
  type AlertDialogSize,
  type AlertDialogVariant,
} from './alert-dialog'

// Avatar primitive - User avatar component
export {
  Avatar,
  type AvatarProps,
  type AvatarSize,
  type AvatarVariant,
} from './avatar'

// Badge primitive - Status/label component
export {
  Badge,
  badgeVariants,
  type BadgeProps,
  type BadgeSize,
  type BadgeVariant,
} from './badge'

// Breadcrumb primitive - Navigation path component
export {
  Breadcrumb,
  breadcrumbVariants,
  type BreadcrumbProps,
  type BreadcrumbItem,
} from './breadcrumb'

// Button primitive - Action button component
export {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './button'

// Card primitive - Content container component
export { Card, type CardProps, type CardSize, type CardVariant } from './card'

// Checkbox primitive - Form checkbox component
export {
  Checkbox,
  type CheckboxProps,
  type CheckboxSize,
  type CheckboxVariant,
} from './checkbox'

// Code primitive - Inline/code block component
export {
  Code,
  type CodeProps,
  type CodeVariant,
} from './code'

// Container primitive - Max-width wrapper component
export {
  Container,
  type ContainerProps,
  type ContainerSize,
  type ContainerPadding,
} from './container'

// Divider primitive - Visual separator component
export {
  Divider,
  dividerVariants,
  type DividerProps,
  type DividerOrientation,
  type DividerVariant,
} from './divider'

// FieldGroup primitive - Form field layout component
export {
  FieldGroup,
  type FieldGroupProps,
  type FieldGroupSize,
} from './field-group'

// IconButton primitive - Icon-only button component
export {
  IconButton,
  type IconButtonProps,
  type IconButtonSize,
  type IconButtonVariant,
} from './icon-button'

// IconWrapper primitive - Icon container component
export {
  IconWrapper,
  type IconWrapperProps,
  type IconWrapperSize,
} from './icon-wrapper'

// Custom ERP Module Icons
export * from './icons'

// Inline primitive - Horizontal layout component
export {
  Inline,
  type InlineProps,
  type InlineSpacing,
  type InlineAlign,
  type InlineJustify,
} from './inline'

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

// Link primitive - Navigation link component
export {
  Link,
  type LinkProps,
  type LinkVariant,
  type LinkUnderline,
} from './link'

// Progress primitive - Progress indicator component
export {
  Progress,
  type ProgressProps,
  type ProgressSize,
  type ProgressVariant,
} from './progress'

// Radio primitive - Form radio button component
export {
  Radio,
  type RadioProps,
  type RadioSize,
  type RadioVariant,
} from './radio'

// Select primitive - Form select dropdown component
export {
  Select,
  type SelectProps,
  type SelectSize,
  type SelectVariant,
} from './select'

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

// Spinner primitive - Loading spinner component
export {
  Spinner,
  type SpinnerProps,
  type SpinnerSize,
} from './spinner'

// Stack primitive - Vertical layout component
export {
  Stack,
  type StackProps,
  type StackSpacing,
  type StackAlign,
} from './stack'

// Surface primitive - Generic surface/container component
export {
  Surface,
  surfaceVariants,
  type SurfaceProps,
  type SurfaceSize,
  type SurfaceVariant,
} from './surface'

// Table primitive - Table component
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  type TableProps,
  type TableHeaderProps,
  type TableBodyProps,
  type TableFooterProps,
  type TableRowProps,
  type TableHeadProps,
  type TableCellProps,
} from './table'

// Textarea primitive - Form textarea component
export {
  Textarea,
  type TextareaProps,
  type TextareaSize,
  type TextareaVariant,
} from './textarea'

// Toggle primitive - Toggle switch component
export {
  Toggle,
  type ToggleProps,
  type ToggleSize,
  type ToggleVariant,
} from './toggle'

// Tooltip primitive - Tooltip component
export {
  Tooltip,
  type TooltipProps,
  type TooltipSide,
  type TooltipSize,
} from './tooltip'

// VisuallyHidden primitive - Screen reader only component
export {
  VisuallyHidden,
  type VisuallyHiddenProps,
} from './visually-hidden'
