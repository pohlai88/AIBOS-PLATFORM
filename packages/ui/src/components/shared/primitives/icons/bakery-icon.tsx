/**
 * BakeryIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Bakery module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface BakeryIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * BakeryIcon - Premium 3D icon for Bakery module
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
 * import { BakeryIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <BakeryIcon />
 * </IconWrapper>
 * ```
 */
export const BakeryIcon = React.forwardRef<SVGSVGElement, BakeryIconProps>(
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
            y1="2"
            x2="12"
            y2="8"
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
            y1="8"
            x2="20"
            y2="16"
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

          {/* Bread/Bakery item gradient */}
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

        {/* 3D Bread Loaf - Isometric Perspective */}
        {/* Bread - top face */}
        <ellipse
          cx="12"
          cy="8"
          rx="5"
          ry="2.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Bread - front face */}
        <path
          d="M 7 8 L 7 16 L 17 16 L 17 8 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Bread - side face */}
        <path
          d="M 17 8 L 19 7.5 L 19 16 L 17 16 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Bread scoring/cuts */}
        <path
          d="M 9 10 L 15 10 M 9 12 L 15 12"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* 3D Oven - Isometric */}
        {/* Oven - top face */}
        <path
          d="M 2 16 L 5 15 L 8 15 L 5 16 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Oven - front face */}
        <rect
          x="2"
          y="16"
          width="3"
          height="4"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Oven - side face */}
        <path
          d="M 5 15 L 8 15 L 8 20 L 5 20 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Oven door/window */}
        <rect
          x="2.5"
          y="17"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.2"
        />

        {/* Oven handle */}
        <circle
          cx="4.5"
          cy="19.5"
          r="0.3"
          fill="currentColor"
          opacity="0.4"
        />

        {/* 3D Rolling Pin - Isometric */}
        {/* Pin - top face */}
        <ellipse
          cx="20"
          cy="14"
          rx="3"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Pin - front face */}
        <ellipse
          cx="20"
          cy="16"
          rx="3"
          ry="1"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Pin - side face */}
        <path
          d="M 23 14 L 24.5 13.5 L 24.5 17 L 23 17 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="21.5"
          rx="8"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

BakeryIcon.displayName = "BakeryIcon";

