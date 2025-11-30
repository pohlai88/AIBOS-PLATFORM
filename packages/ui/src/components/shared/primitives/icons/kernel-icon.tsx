/**
 * KernelIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Kernel module in AI-BOS ERP system.
 * Inspired by ZohoOne's regulatory and governance approach: central control,
 * constitutional authority, and system regulation.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface KernelIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * KernelIcon - Premium 3D icon for Kernel module
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
 * import { KernelIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <KernelIcon />
 * </IconWrapper>
 * ```
 */
export const KernelIcon = React.forwardRef<SVGSVGElement, KernelIconProps>(
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

          {/* Core/Regulatory gradient */}
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

        {/* 3D Central Core - Isometric Perspective */}
        {/* Core - top face */}
        <circle
          cx="12"
          cy="8"
          r="4"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Core - front face */}
        <ellipse
          cx="12"
          cy="14"
          rx="4"
          ry="3"
          fill={`url(#${gradientId3})`}
          opacity="0.8"
        />

        {/* Core - side face */}
        <path
          d="M 16 8 L 18 7.5 L 18 14 L 16 14.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.6"
        />

        {/* Inner core highlight */}
        <circle
          cx="12"
          cy="8"
          r="2"
          fill="currentColor"
          opacity="0.3"
        />

        {/* 3D Regulatory Shield/Badge - Isometric */}
        {/* Shield - top face */}
        <path
          d="M 12 4 L 14 5 L 16 4 L 16 6 L 14 7 L 12 6 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Shield - front face */}
        <path
          d="M 12 6 L 12 8 L 14 9 L 16 8 L 16 6 L 14 7 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Shield - side face */}
        <path
          d="M 16 4 L 17 3.5 L 17 8 L 16 8 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Regulatory rays/connections */}
        <path
          d="M 8 8 L 4 6 M 16 8 L 20 6 M 8 12 L 4 14 M 16 12 L 20 14 M 12 4 L 12 2"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* 3D Governance Rings - Isometric */}
        {/* Ring 1 - top face */}
        <ellipse
          cx="12"
          cy="8"
          rx="5.5"
          ry="2.5"
          fill="none"
          stroke={`url(#${gradientId1})`}
          strokeWidth="0.5"
          opacity="0.6"
        />

        {/* Ring 2 - top face */}
        <ellipse
          cx="12"
          cy="8"
          rx="6.5"
          ry="3"
          fill="none"
          stroke={`url(#${gradientId1})`}
          strokeWidth="0.5"
          opacity="0.4"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="20.5"
          rx="6"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

KernelIcon.displayName = "KernelIcon";

