/**
 * PlantationIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Plantation module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface PlantationIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * PlantationIcon - Premium 3D icon for Plantation module
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
 * import { PlantationIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <PlantationIcon />
 * </IconWrapper>
 * ```
 */
export const PlantationIcon = React.forwardRef<SVGSVGElement, PlantationIconProps>(
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

          {/* Plant/Crop gradient */}
          <linearGradient
            id={gradientId4}
            x1="0"
            y1="0"
            x2="24"
            y2="24"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* 3D Plant/Crop Rows - Isometric Perspective */}
        {/* Ground/Field - top face */}
        <path
          d="M 2 18 L 6 17 L 18 17 L 22 18 L 22 20 L 2 20 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Ground/Field - front face */}
        <rect
          x="2"
          y="20"
          width="20"
          height="2"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Ground/Field - side face */}
        <path
          d="M 22 18 L 24 17.5 L 24 22 L 22 22 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Plant 1 (left) - top face */}
        <ellipse
          cx="6"
          cy="12"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Plant 1 - front face */}
        <path
          d="M 4.5 12 L 4.5 18 L 7.5 18 L 7.5 12 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Plant 1 - side face */}
        <path
          d="M 7.5 12 L 8.5 11.5 L 8.5 18 L 7.5 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Plant 1 leaves */}
        <path
          d="M 6 10 Q 5 9 4 10 Q 5 11 6 10 M 6 10 Q 7 9 8 10 Q 7 11 6 10"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Plant 2 (middle) - top face */}
        <ellipse
          cx="12"
          cy="10"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Plant 2 - front face */}
        <path
          d="M 10.5 10 L 10.5 18 L 13.5 18 L 13.5 10 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Plant 2 - side face */}
        <path
          d="M 13.5 10 L 14.5 9.5 L 14.5 18 L 13.5 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Plant 2 leaves */}
        <path
          d="M 12 8 Q 11 7 10 8 Q 11 9 12 8 M 12 8 Q 13 7 14 8 Q 13 9 12 8"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Plant 3 (right) - top face */}
        <ellipse
          cx="18"
          cy="12"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Plant 3 - front face */}
        <path
          d="M 16.5 12 L 16.5 18 L 19.5 18 L 19.5 12 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Plant 3 - side face */}
        <path
          d="M 19.5 12 L 20.5 11.5 L 20.5 18 L 19.5 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Plant 3 leaves */}
        <path
          d="M 18 10 Q 17 9 16 10 Q 17 11 18 10 M 18 10 Q 19 9 20 10 Q 19 11 18 10"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* Field rows/lines */}
        <path
          d="M 2 17.5 L 22 17.5"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="1 1"
          opacity="0.2"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="22.5"
          rx="10"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

PlantationIcon.displayName = "PlantationIcon";

