/**
 * FnBIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Food & Beverage (F&B) module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface FnBIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * FnBIcon - Premium 3D icon for Food & Beverage module
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
 * import { FnBIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <FnBIcon />
 * </IconWrapper>
 * ```
 */
export const FnBIcon = React.forwardRef<SVGSVGElement, FnBIconProps>(
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

          {/* Food/Beverage gradient */}
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

        {/* 3D Plate with Food - Isometric Perspective */}
        {/* Plate - top face */}
        <ellipse
          cx="12"
          cy="10"
          rx="5"
          ry="2.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Plate - front face */}
        <ellipse
          cx="12"
          cy="14"
          rx="5"
          ry="1.5"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Plate - side face */}
        <path
          d="M 17 10 L 19 9.5 L 19 15.5 L 17 15 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Food on plate - top face */}
        <ellipse
          cx="12"
          cy="9"
          rx="3"
          ry="1.5"
          fill={`url(#${gradientId4})`}
          opacity="0.8"
        />

        {/* Food on plate - front face */}
        <ellipse
          cx="12"
          cy="11"
          rx="3"
          ry="1"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* 3D Beverage Glass - Isometric */}
        {/* Glass - top face */}
        <ellipse
          cx="18"
          cy="6"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Glass - front face */}
        <path
          d="M 16.5 6 L 16.5 14 L 19.5 14 L 19.5 6 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Glass - side face */}
        <path
          d="M 19.5 6 L 21 5.5 L 21 14 L 19.5 14 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Liquid in glass */}
        <ellipse
          cx="18"
          cy="10"
          rx="1.2"
          ry="0.6"
          fill="currentColor"
          opacity="0.3"
        />

        {/* 3D Utensils - Isometric */}
        {/* Fork - top face */}
        <rect
          x="4"
          y="6"
          width="0.8"
          height="6"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Fork - front face */}
        <rect
          x="4"
          y="8"
          width="0.8"
          height="6"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Fork tines */}
        <path
          d="M 4 6 L 4.3 5.5 L 4.6 6 M 4.2 6 L 4.5 5.5 L 4.8 6"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.6"
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

FnBIcon.displayName = "FnBIcon";

