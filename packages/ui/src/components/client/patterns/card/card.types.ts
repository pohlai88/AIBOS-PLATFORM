/**
 * Card Component Types
 * Type definitions for the Card pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Size variants for Card component
 */
export type CardSize = 'sm' | 'md' | 'lg'

/**
 * Visual style variants for Card component
 */
export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled'

/**
 * Props for the Card component.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Size variant
     * @default 'md'
     */
    size?: CardSize

    /**
     * Visual style variant
     * @default 'default'
     */
    variant?: CardVariant

    /**
     * Whether the card is clickable/interactive
     * @default false
     */
    clickable?: boolean

    /**
     * Whether the card has hover effects
     * @default true
     */
    hoverable?: boolean

    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Test ID for automated testing
     */
    testId?: string

    /**
     * Children content
     */
    children: React.ReactNode
}

/**
 * Props for CardHeader component.
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Header title
     */
    title?: string

    /**
     * Header description/subtitle
     */
    description?: string

    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Test ID for automated testing
     */
    testId?: string

    /**
     * Children content (alternative to title/description)
     */
    children?: React.ReactNode
}

/**
 * Props for CardBody component.
 */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Test ID for automated testing
     */
    testId?: string

    /**
     * Children content
     */
    children: React.ReactNode
}

/**
 * Props for CardFooter component.
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Additional CSS classes
     */
    className?: string

    /**
     * Test ID for automated testing
     */
    testId?: string

    /**
     * Children content
     */
    children: React.ReactNode
}

