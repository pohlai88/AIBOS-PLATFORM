/**
 * FranchiseIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Franchise module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface FranchiseIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * FranchiseIcon - Premium 3D icon for Franchise module
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
 * import { FranchiseIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <FranchiseIcon />
 * </IconWrapper>
 * ```
 */
export const FranchiseIcon = React.forwardRef<SVGSVGElement, FranchiseIconProps>(
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

          {/* Network/Branch gradient */}
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

        {/* 3D Network/Branch Structure - Isometric Perspective */}
        {/* Central hub - top face */}
        <circle
          cx="12"
          cy="8"
          r="3"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Central hub - front face */}
        <ellipse
          cx="12"
          cy="12"
          rx="3"
          ry="2"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Central hub - side face */}
        <path
          d="M 15 8 L 17 7.5 L 17 12 L 15 12.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Branch 1 (top-left) - top face */}
        <circle
          cx="6"
          cy="6"
          r="2"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Branch 1 - front face */}
        <ellipse
          cx="6"
          cy="9"
          rx="2"
          ry="1.5"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Branch 1 - side face */}
        <path
          d="M 8 6 L 9 5.5 L 9 10.5 L 8 10 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Branch 2 (top-right) - top face */}
        <circle
          cx="18"
          cy="6"
          r="2"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Branch 2 - front face */}
        <ellipse
          cx="18"
          cy="9"
          rx="2"
          ry="1.5"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Branch 2 - side face */}
        <path
          d="M 20 6 L 21 5.5 L 21 10.5 L 20 10 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Branch 3 (bottom-left) - top face */}
        <circle
          cx="6"
          cy="16"
          r="2"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Branch 3 - front face */}
        <ellipse
          cx="6"
          cy="18"
          rx="2"
          ry="1.5"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Branch 3 - side face */}
        <path
          d="M 8 16 L 9 15.5 L 9 19.5 L 8 19 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Branch 4 (bottom-right) - top face */}
        <circle
          cx="18"
          cy="16"
          r="2"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Branch 4 - front face */}
        <ellipse
          cx="18"
          cy="18"
          rx="2"
          ry="1.5"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Branch 4 - side face */}
        <path
          d="M 20 16 L 21 15.5 L 21 19.5 L 20 19 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Connection lines */}
        <path
          d="M 9 8 L 8 6 M 15 8 L 16 6 M 9 12 L 8 16 M 15 12 L 16 16"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="21.5"
          rx="9"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

FranchiseIcon.displayName = "FranchiseIcon";

