/**
 * DashboardIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Dashboard module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface DashboardIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * DashboardIcon - Premium 3D icon for Dashboard module
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
 * import { DashboardIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <DashboardIcon />
 * </IconWrapper>
 * ```
 */
export const DashboardIcon = React.forwardRef<SVGSVGElement, DashboardIconProps>(
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

          {/* Chart/Widget gradient */}
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

        {/* 3D Dashboard Board - Isometric Perspective */}
        {/* Board base - top face */}
        <path
          d="M 2 8 L 6 6 L 18 6 L 22 8 L 22 20 L 2 20 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Board base - front face */}
        <rect
          x="2"
          y="20"
          width="20"
          height="2"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Board base - side face */}
        <path
          d="M 22 8 L 24 7 L 24 22 L 22 22 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Widget 1 (top-left) - top face */}
        <rect
          x="4"
          y="10"
          width="6"
          height="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Widget 1 - front face */}
        <rect
          x="4"
          y="11.5"
          width="6"
          height="4"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Widget 1 - side face */}
        <path
          d="M 10 10 L 11 9.5 L 11 15.5 L 10 15 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Widget 2 (top-right) - top face */}
        <rect
          x="12"
          y="10"
          width="6"
          height="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Widget 2 - front face */}
        <rect
          x="12"
          y="11.5"
          width="6"
          height="4"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Widget 2 - side face */}
        <path
          d="M 18 10 L 19 9.5 L 19 15.5 L 18 15 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Widget 3 (bottom) - top face */}
        <rect
          x="4"
          y="16"
          width="14"
          height="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Widget 3 - front face */}
        <rect
          x="4"
          y="17.5"
          width="14"
          height="2"
          fill={`url(#${gradientId4})`}
          opacity="0.5"
        />

        {/* Widget 3 - side face */}
        <path
          d="M 18 16 L 19 15.5 L 19 19.5 L 18 19 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.3"
        />

        {/* Chart lines on widgets */}
        <path
          d="M 5 13 L 7 12 L 9 13.5 L 11 12"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M 13 13 L 15 12.5 L 17 13 L 19 12"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
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

DashboardIcon.displayName = "DashboardIcon";

