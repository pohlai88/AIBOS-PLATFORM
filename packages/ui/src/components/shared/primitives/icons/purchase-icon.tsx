/**
 * PurchaseIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Purchase/Procurement module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface PurchaseIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * PurchaseIcon - Premium 3D icon for Purchase/Procurement module
 *
 * Features:
 * - 3D isometric perspective design
 * - Sophisticated gradient effects
 * - Depth and dimension
 * - Apple/Microsoft/Google quality standards
 * - RSC-compatible (no 'use client' needed)
 * - Works with IconWrapper for consistent sizing
 * - Theme-aware base color (gradients adapt)
 *
 * @example
 * ```tsx
 * import { PurchaseIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <PurchaseIcon />
 * </IconWrapper>
 * ```
 */
export const PurchaseIcon = React.forwardRef<SVGSVGElement, PurchaseIconProps>(
  ({ className, ...props }, ref) => {
    const gradientId1 = React.useId();
    const gradientId2 = React.useId();
    const gradientId3 = React.useId();
    const gradientId4 = React.useId();

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <defs>
          {/* Top face gradient - brightest */}
          <linearGradient
            id={gradientId1}
            x1="12"
            y1="3"
            x2="12"
            y2="9"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>

          {/* Side face gradient - darkest */}
          <linearGradient
            id={gradientId2}
            x1="12"
            y1="9"
            x2="20"
            y2="17"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
          </linearGradient>

          {/* Front face gradient - medium */}
          <linearGradient
            id={gradientId3}
            x1="0"
            y1="0"
            x2="24"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>

          {/* Document gradient */}
          <linearGradient
            id={gradientId4}
            x1="0"
            y1="0"
            x2="24"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.75" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* 3D Shopping Cart - Isometric Perspective */}
        {/* Cart base - top face */}
        <ellipse
          cx="12"
          cy="16"
          rx="6"
          ry="2"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Cart base - front face */}
        <path
          d="M 6 16 L 6 20 L 18 20 L 18 16 Z"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Cart base - side face */}
        <path
          d="M 18 16 L 20 15 L 20 19 L 18 20 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Cart handle - top */}
        <path
          d="M 16 8 Q 18 6 20 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Cart handle - front */}
        <path
          d="M 16 8 L 16 12 L 20 12 L 20 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* 3D Purchase Order Document - Isometric */}
        {/* Document - top face */}
        <path
          d="M 4 4 L 10 2 L 16 2 L 10 4 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Document - front face */}
        <rect
          x="4"
          y="4"
          width="6"
          height="8"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Document - side face */}
        <path
          d="M 10 2 L 16 2 L 16 10 L 10 12 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Document lines/text */}
        <line
          x1="5"
          y1="6"
          x2="9"
          y2="6"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="5"
          y1="8"
          x2="9"
          y2="8"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="5"
          y1="10"
          x2="8"
          y2="10"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Checkmark on document */}
        <path
          d="M 5.5 6.5 L 6.5 7.5 L 8.5 5.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.7"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="20.5"
          rx="7"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

PurchaseIcon.displayName = "PurchaseIcon";

