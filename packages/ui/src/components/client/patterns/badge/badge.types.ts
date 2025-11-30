/**
 * Badge Pattern Component Types
 * Type definitions for the Badge Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'
import type { BadgeVariant, BadgeSize } from '../../../shared/primitives/badge'

/**
 * Props for the Badge pattern component.
 * Extends the Badge primitive with additional features.
 */
export interface BadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onClick'> {
    /**
     * Visual variant (inherited from Badge primitive)
     * @default 'default'
     */
    variant?: BadgeVariant

    /**
     * Size variant (inherited from Badge primitive)
     * @default 'md'
     */
    size?: BadgeSize

    /**
     * Leading icon element (rendered before text)
     */
    leadingIcon?: React.ReactNode

    /**
     * Trailing icon element (rendered after text)
     */
    trailingIcon?: React.ReactNode

    /**
     * Whether the badge is dismissible
     * @default false
     */
    dismissible?: boolean

    /**
     * Callback fired when badge is dismissed
     */
    onDismiss?: () => void

    /**
     * Whether the badge is clickable
     * @default false
     */
    clickable?: boolean

    /**
     * Click handler (only used when clickable is true)
     */
    onClick?: React.MouseEventHandler<HTMLSpanElement>

    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Test ID for automated testing
     */
    testId?: string

    /**
     * Children content (badge text)
     */
    children: React.ReactNode
}

