/**
 * AssetIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Fixed Assets module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface AssetIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * AssetIcon - Premium 3D icon for Fixed Assets module
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
 * import { AssetIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <AssetIcon />
 * </IconWrapper>
 * ```
 */
export const AssetIcon = React.forwardRef<SVGSVGElement, AssetIconProps>(
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

          {/* Building gradient */}
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

        {/* 3D Building/Structure - Isometric Perspective */}
        {/* Building base - top face */}
        <path
          d="M 4 12 L 8 10 L 16 10 L 20 12 L 20 18 L 4 18 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Building base - front face */}
        <rect
          x="4"
          y="18"
          width="16"
          height="4"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Building base - side face */}
        <path
          d="M 20 12 L 22 11 L 22 22 L 20 22 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Building windows - top face */}
        <rect
          x="6"
          y="13"
          width="2"
          height="1"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />
        <rect
          x="10"
          y="13"
          width="2"
          height="1"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />
        <rect
          x="14"
          y="13"
          width="2"
          height="1"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Building windows - front face */}
        <rect
          x="6"
          y="19"
          width="2"
          height="2"
          fill={`url(#${gradientId4})`}
          opacity="0.5"
        />
        <rect
          x="10"
          y="19"
          width="2"
          height="2"
          fill={`url(#${gradientId4})`}
          opacity="0.5"
        />
        <rect
          x="14"
          y="19"
          width="2"
          height="2"
          fill={`url(#${gradientId4})`}
          opacity="0.5"
        />

        {/* 3D Tag/Label - Asset Tag */}
        {/* Tag - top face */}
        <path
          d="M 16 4 L 18 3 L 20 4 L 20 6 L 18 7 L 16 6 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Tag - front face */}
        <rect
          x="16"
          y="6"
          width="4"
          height="2"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Tag - side face */}
        <path
          d="M 20 4 L 21.5 3.5 L 21.5 8 L 20 8 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Tag string */}
        <path
          d="M 18 3 L 18 1"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="22.5"
          rx="9"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

AssetIcon.displayName = "AssetIcon";

