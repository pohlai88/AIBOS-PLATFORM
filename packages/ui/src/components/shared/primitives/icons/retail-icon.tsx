/**
 * RetailIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Retail/POS module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface RetailIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * RetailIcon - Premium 3D icon for Retail/POS module
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
 * import { RetailIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <RetailIcon />
 * </IconWrapper>
 * ```
 */
export const RetailIcon = React.forwardRef<SVGSVGElement, RetailIconProps>(
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

          {/* POS/Register gradient */}
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

        {/* 3D Store/Shop Front - Isometric Perspective */}
        {/* Store base - top face */}
        <path
          d="M 3 12 L 8 10 L 16 10 L 21 12 L 21 18 L 3 18 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Store base - front face */}
        <rect
          x="3"
          y="18"
          width="18"
          height="4"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Store base - side face */}
        <path
          d="M 21 12 L 23 11 L 23 22 L 21 22 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Store window - top face */}
        <rect
          x="6"
          y="13"
          width="6"
          height="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Store window - front face */}
        <rect
          x="6"
          y="14.5"
          width="6"
          height="3"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Store window - side face */}
        <path
          d="M 12 13 L 13 12.5 L 13 17.5 L 12 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* 3D POS Terminal/Register - Isometric */}
        {/* Terminal - top face */}
        <path
          d="M 12 6 L 15 5 L 18 5 L 15 6 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Terminal - front face */}
        <rect
          x="12"
          y="6"
          width="3"
          height="4"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Terminal - side face */}
        <path
          d="M 15 5 L 18 5 L 18 10 L 15 10 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Terminal screen */}
        <rect
          x="12.5"
          y="7"
          width="2"
          height="2"
          fill="currentColor"
          opacity="0.3"
        />

        {/* Shopping bag - top face */}
        <ellipse
          cx="18"
          cy="7"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Shopping bag - front face */}
        <path
          d="M 16.5 7.8 L 16.5 11 L 19.5 11 L 19.5 7.8 Z"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Shopping bag - side face */}
        <path
          d="M 19.5 7.8 L 20.5 7.3 L 20.5 11 L 19.5 11 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Shopping bag handles */}
        <path
          d="M 17 7.8 Q 17.5 6.5 18 7.8"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
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

RetailIcon.displayName = "RetailIcon";

