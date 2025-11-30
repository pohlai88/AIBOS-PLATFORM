/**
 * CentralKitchenIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Central Kitchen module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface CentralKitchenIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * CentralKitchenIcon - Premium 3D icon for Central Kitchen module
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
 * import { CentralKitchenIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <CentralKitchenIcon />
 * </IconWrapper>
 * ```
 */
export const CentralKitchenIcon = React.forwardRef<SVGSVGElement, CentralKitchenIconProps>(
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

          {/* Kitchen equipment gradient */}
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

        {/* 3D Kitchen Building - Isometric Perspective */}
        {/* Building - top face */}
        <path
          d="M 3 10 L 8 8 L 16 8 L 21 10 L 21 18 L 3 18 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Building - front face */}
        <rect
          x="3"
          y="18"
          width="18"
          height="4"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Building - side face */}
        <path
          d="M 21 10 L 23 9 L 23 22 L 21 22 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Kitchen vent/exhaust - top face */}
        <rect
          x="9"
          y="8"
          width="6"
          height="1"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Kitchen vent - front face */}
        <rect
          x="9"
          y="9"
          width="6"
          height="2"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Kitchen vent - side face */}
        <path
          d="M 15 8 L 16 7.5 L 16 11 L 15 11 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* 3D Cooking Pot - Isometric */}
        {/* Pot lid - top face */}
        <ellipse
          cx="7"
          cy="13"
          rx="2"
          ry="1"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Pot - front face */}
        <path
          d="M 5 13 L 5 17 L 9 17 L 9 13 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Pot - side face */}
        <path
          d="M 9 13 L 10 12.5 L 10 17 L 9 17 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Pot handle */}
        <path
          d="M 9 14 Q 10.5 14 10.5 15"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Steam from pot */}
        <path
          d="M 6 12 Q 6 10 7 10 Q 8 10 8 11"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />

        {/* 3D Chef Hat - Isometric */}
        {/* Hat - top face */}
        <ellipse
          cx="17"
          cy="6"
          rx="2"
          ry="1"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Hat - front face */}
        <path
          d="M 15 6 L 15 9 L 19 9 L 19 6 Z"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Hat - side face */}
        <path
          d="M 19 6 L 20 5.5 L 20 9 L 19 9 Z"
          fill={`url(#${gradientId2})`}
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

CentralKitchenIcon.displayName = "CentralKitchenIcon";

