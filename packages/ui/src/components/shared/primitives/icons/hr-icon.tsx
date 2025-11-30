/**
 * HRIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Human Resources module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface HRIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * HRIcon - Premium 3D icon for Human Resources module
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
 * import { HRIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <HRIcon />
 * </IconWrapper>
 * ```
 */
export const HRIcon = React.forwardRef<SVGSVGElement, HRIconProps>(
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

          {/* People gradient */}
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

        {/* 3D People/Team - Isometric Perspective */}
        {/* Person 1 - top face (head) */}
        <circle
          cx="8"
          cy="6"
          r="2.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Person 1 - front face (body) */}
        <rect
          x="6"
          y="8.5"
          width="4"
          height="6"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Person 1 - side face */}
        <path
          d="M 10 8.5 L 11.5 7.5 L 11.5 14.5 L 10 15.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Person 2 - top face (head) */}
        <circle
          cx="16"
          cy="6"
          r="2.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Person 2 - front face (body) */}
        <rect
          x="14"
          y="8.5"
          width="4"
          height="6"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Person 2 - side face */}
        <path
          d="M 18 8.5 L 19.5 7.5 L 19.5 14.5 L 18 15.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Connection/Team line */}
        <path
          d="M 10.5 11 Q 12 9 13.5 11"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* 3D Document/File - Isometric */}
        {/* Document - top face */}
        <path
          d="M 2 16 L 6 14 L 10 14 L 6 16 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Document - front face */}
        <rect
          x="2"
          y="16"
          width="4"
          height="4"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Document - side face */}
        <path
          d="M 6 14 L 10 14 L 10 18 L 6 20 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Document lines */}
        <line
          x1="2.5"
          y1="17.5"
          x2="5.5"
          y2="17.5"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.4"
        />
        <line
          x1="2.5"
          y1="18.5"
          x2="5.5"
          y2="18.5"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.4"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="20.5"
          rx="9"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

HRIcon.displayName = "HRIcon";

