/**
 * CafeIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Cafe module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface CafeIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * CafeIcon - Premium 3D icon for Cafe module
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
 * import { CafeIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <CafeIcon />
 * </IconWrapper>
 * ```
 */
export const CafeIcon = React.forwardRef<SVGSVGElement, CafeIconProps>(
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

          {/* Coffee/Cafe gradient */}
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

        {/* 3D Coffee Cup - Isometric Perspective */}
        {/* Cup - top face */}
        <ellipse
          cx="12"
          cy="8"
          rx="4"
          ry="2"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Cup - front face */}
        <path
          d="M 8 8 L 8 16 L 16 16 L 16 8 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Cup - side face */}
        <path
          d="M 16 8 L 18 7.5 L 18 16 L 16 16 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Coffee liquid - top face */}
        <ellipse
          cx="12"
          cy="8"
          rx="3.5"
          ry="1.5"
          fill="currentColor"
          opacity="0.4"
        />

        {/* Cup handle - top face */}
        <path
          d="M 16 10 Q 18 10 18 12 Q 18 14 16 14"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Cup handle - front face */}
        <path
          d="M 16 10 L 16.5 10.5 L 16.5 13.5 L 16 14"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
        />

        {/* 3D Coffee Bean - Isometric */}
        {/* Bean - top face */}
        <ellipse
          cx="6"
          cy="6"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Bean - front face */}
        <ellipse
          cx="6"
          cy="8"
          rx="1.5"
          ry="1"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Bean - side face */}
        <path
          d="M 7.5 6 L 8.5 5.5 L 8.5 9 L 7.5 8.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Bean line detail */}
        <path
          d="M 5.5 6.5 Q 6 7 6.5 6.5"
          stroke="currentColor"
          strokeWidth="0.5"
          fill="none"
          opacity="0.3"
        />

        {/* 3D Saucer - Isometric */}
        {/* Saucer - top face */}
        <ellipse
          cx="12"
          cy="16"
          rx="5"
          ry="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.8"
        />

        {/* Saucer - front face */}
        <ellipse
          cx="12"
          cy="18"
          rx="5"
          ry="1"
          fill={`url(#${gradientId3})`}
          opacity="0.5"
        />

        {/* Saucer - side face */}
        <path
          d="M 17 16 L 19 15.5 L 19 19 L 17 18.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.3"
        />

        {/* Steam from cup */}
        <path
          d="M 10 6 Q 10 4 11 4 Q 12 4 12 5 M 13 5 Q 13 3 14 3 Q 15 3 15 4"
          stroke="currentColor"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
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

CafeIcon.displayName = "CafeIcon";

