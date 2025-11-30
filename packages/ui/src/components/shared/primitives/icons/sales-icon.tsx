/**
 * SalesIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Sales/CRM module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface SalesIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * SalesIcon - Premium 3D icon for Sales/CRM module
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
 * import { SalesIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <SalesIcon />
 * </IconWrapper>
 * ```
 */
export const SalesIcon = React.forwardRef<SVGSVGElement, SalesIconProps>(
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
            y1="4"
            x2="12"
            y2="10"
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
            y1="10"
            x2="20"
            y2="18"
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

          {/* Chart/Graph gradient */}
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

        {/* 3D Sales Chart/Graph - Isometric Perspective */}
        {/* Chart base - top face */}
        <path
          d="M 4 14 L 8 10 L 12 12 L 16 8 L 20 10 L 20 16 L 4 16 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Chart base - front face */}
        <path
          d="M 4 16 L 4 20 L 20 20 L 20 16 Z"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Chart base - side face */}
        <path
          d="M 20 10 L 20 20 L 24 18 L 24 8 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* 3D Trend Line on chart */}
        <path
          d="M 4 14 L 8 10 L 12 12 L 16 8 L 20 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />

        {/* 3D Data Points */}
        <circle cx="4" cy="14" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="8" cy="10" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="16" cy="8" r="1.5" fill="currentColor" opacity="0.9" />
        <circle cx="20" cy="10" r="1.5" fill="currentColor" opacity="0.9" />

        {/* 3D Handshake/Deal Symbol - Isometric */}
        {/* Hand 1 - top face */}
        <ellipse
          cx="6"
          cy="6"
          rx="2"
          ry="1"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
          transform="rotate(-20 6 6)"
        />

        {/* Hand 1 - front face */}
        <rect
          x="4.5"
          y="6"
          width="3"
          height="2"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
          transform="rotate(-20 6 7)"
        />

        {/* Hand 2 - top face */}
        <ellipse
          cx="18"
          cy="6"
          rx="2"
          ry="1"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
          transform="rotate(20 18 6)"
        />

        {/* Hand 2 - front face */}
        <rect
          x="16.5"
          y="6"
          width="3"
          height="2"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
          transform="rotate(20 18 7)"
        />

        {/* Connection line between hands */}
        <path
          d="M 8 6 Q 12 4 16 6"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="20.5"
          rx="8"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

SalesIcon.displayName = "SalesIcon";

