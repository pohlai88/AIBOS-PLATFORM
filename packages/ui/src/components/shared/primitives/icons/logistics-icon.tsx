/**
 * LogisticsIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Logistics/Supply Chain module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface LogisticsIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * LogisticsIcon - Premium 3D icon for Logistics/Supply Chain module
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
 * import { LogisticsIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <LogisticsIcon />
 * </IconWrapper>
 * ```
 */
export const LogisticsIcon = React.forwardRef<SVGSVGElement, LogisticsIconProps>(
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

          {/* Truck/Vehicle gradient */}
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

        {/* 3D Delivery Truck - Isometric Perspective */}
        {/* Truck cab - top face */}
        <path
          d="M 4 14 L 8 12 L 12 12 L 8 14 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Truck cab - front face */}
        <rect
          x="4"
          y="14"
          width="4"
          height="4"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Truck cab - side face */}
        <path
          d="M 8 12 L 12 12 L 12 18 L 8 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Truck cargo - top face */}
        <path
          d="M 8 12 L 12 12 L 18 13 L 14 14 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Truck cargo - front face */}
        <rect
          x="8"
          y="14"
          width="6"
          height="4"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Truck cargo - side face */}
        <path
          d="M 12 12 L 18 13 L 18 18 L 12 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Truck wheels - front */}
        <circle
          cx="6"
          cy="18"
          r="1.5"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />
        <circle
          cx="6"
          cy="18"
          r="0.8"
          fill="currentColor"
          opacity="0.3"
        />

        {/* Truck wheels - back */}
        <circle
          cx="16"
          cy="18"
          r="1.5"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />
        <circle
          cx="16"
          cy="18"
          r="0.8"
          fill="currentColor"
          opacity="0.3"
        />

        {/* Route/Path line */}
        <path
          d="M 2 20 Q 6 19 10 19.5 Q 14 20 18 19.5 Q 22 19 24 20"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2 2"
          fill="none"
          opacity="0.4"
        />

        {/* 3D Package/Box on truck */}
        {/* Package - top face */}
        <rect
          x="10"
          y="13"
          width="2"
          height="1"
          fill={`url(#${gradientId1})`}
          opacity="0.8"
        />

        {/* Package - front face */}
        <rect
          x="10"
          y="14"
          width="2"
          height="2"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Package - side face */}
        <path
          d="M 12 13 L 13 12.5 L 13 16 L 12 16 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="21.5"
          rx="10"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

LogisticsIcon.displayName = "LogisticsIcon";

