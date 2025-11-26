/**
 * Shared Typography Components
 *
 * RSC-compatible typography components for semantic text rendering
 * - No 'use client' directive
 * - Environment-agnostic (works in Server & Client Components)
 * - Semantic HTML elements (h1-h6, p, span, etc.)
 * - Design token integration (100% token-based)
 * - WCAG 2.1 AA/AAA compliant
 * - MCP validated
 *
 * @version 1.0.0
 * @mcp-validated true
 */

// Core typography components
export { Text, textVariants } from './text'
export type {
  TextAlign,
  TextColor,
  TextProps,
  TextSize,
  TextVariant,
  TextWeight,
} from './text'

export { Heading, headingVariants } from './heading'
export type {
  HeadingAlign,
  HeadingColor,
  HeadingLevel,
  HeadingProps,
  HeadingSize,
  HeadingWeight,
} from './heading'

export { MutedText, mutedTextVariants } from './muted-text'
export type {
  MutedTextAlign,
  MutedTextProps,
  MutedTextSize,
  MutedTextWeight,
} from './muted-text'

export { Code, codeVariants } from './code'
export type { CodeProps, CodeSize, CodeVariant } from './code'

export { Link, linkVariants } from './link'
export type {
  LinkProps,
  LinkSize,
  LinkUnderline,
  LinkVariant,
  LinkWeight,
} from './link'