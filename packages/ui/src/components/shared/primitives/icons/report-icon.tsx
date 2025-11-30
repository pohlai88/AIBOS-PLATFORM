/**
 * ReportIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Reporting/Analytics module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface ReportIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * ReportIcon - Premium 3D icon for Reporting/Analytics module
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
 * import { ReportIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <ReportIcon />
 * </IconWrapper>
 * ```
 */
export const ReportIcon = React.forwardRef<SVGSVGElement, ReportIconProps>(
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

        {/* 3D Report Document - Isometric Perspective */}
        {/* Document stack - top face (first document) */}
        <path
          d="M 3 6 L 9 4 L 15 4 L 9 6 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Document stack - front face (first document) */}
        <rect
          x="3"
          y="6"
          width="6"
          height="10"
          fill={`url(#${gradientId3})`}
          opacity="0.8"
        />

        {/* Document stack - side face (first document) */}
        <path
          d="M 9 4 L 15 4 L 15 14 L 9 16 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.6"
        />

        {/* Document stack - top face (second document, offset) */}
        <path
          d="M 5 8 L 11 6 L 17 6 L 11 8 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Document stack - front face (second document) */}
        <rect
          x="5"
          y="8"
          width="6"
          height="10"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Document stack - side face (second document) */}
        <path
          d="M 11 6 L 17 6 L 17 16 L 11 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Document lines/text on front document */}
        <line
          x1="5.5"
          y1="10"
          x2="10.5"
          y2="10"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.5"
        />
        <line
          x1="5.5"
          y1="12"
          x2="10.5"
          y2="12"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.5"
        />
        <line
          x1="5.5"
          y1="14"
          x2="9.5"
          y2="14"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.5"
        />

        {/* 3D Chart/Graph overlay - Isometric */}
        {/* Chart bars on document */}
        <g transform="translate(6, 10) rotate(-2 0 0)">
          {/* Bar 1 */}
          <rect
            x="0"
            y="0"
            width="1"
            height="3"
            fill={`url(#${gradientId4})`}
            opacity="0.6"
          />
          {/* Bar 2 */}
          <rect
            x="1.5"
            y="0"
            width="1"
            height="4.5"
            fill={`url(#${gradientId4})`}
            opacity="0.6"
          />
          {/* Bar 3 */}
          <rect
            x="3"
            y="0"
            width="1"
            height="2"
            fill={`url(#${gradientId4})`}
            opacity="0.6"
          />
        </g>

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

ReportIcon.displayName = "ReportIcon";

