/**
 * FinanceIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Finance/Accounting module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface FinanceIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * FinanceIcon - Premium 3D icon for Finance module
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
 * import { FinanceIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * // Basic usage
 * <IconWrapper size="lg">
 *   <FinanceIcon />
 * </IconWrapper>
 *
 * // In navigation
 * <NavigationMenu
 *   items={[
 *     { label: 'Finance', href: '/finance', icon: <FinanceIcon /> }
 *   ]}
 * />
 * ```
 */
export const FinanceIcon = React.forwardRef<SVGSVGElement, FinanceIconProps>(
  ({ className, ...props }, ref) => {
    // Generate unique IDs for gradients to avoid conflicts
    const gradientId1 = React.useId();
    const gradientId2 = React.useId();
    const gradientId3 = React.useId();
    const shadowId = React.useId();

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
          {/* Premium 3D gradient for dollar coin - top face */}
          <linearGradient
            id={gradientId1}
            x1="12"
            y1="4"
            x2="12"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.85" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>

          {/* Premium 3D gradient for dollar coin - side face */}
          <linearGradient
            id={gradientId2}
            x1="12"
            y1="12"
            x2="20"
            y2="20"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
          </linearGradient>

          {/* Premium gradient for chart bars */}
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

          {/* Soft shadow for depth */}
          <filter id={shadowId}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
            <feOffset dx="0.5" dy="0.5" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 3D Dollar Coin - Isometric Perspective */}
        {/* Top face of coin (ellipse) */}
        <ellipse
          cx="12"
          cy="8"
          rx="6"
          ry="3"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Side face of coin (trapezoid for 3D effect) */}
        <path
          d="M 6 8 L 6 16 L 18 16 L 18 8 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.85"
        />

        {/* Dollar sign on top face */}
        <path
          d="M 12 5.5 L 12 10.5 M 10 6.5 C 10.5 6.5 11 7 11 7.5 C 11 8 10.5 8.5 10 8.5 M 14 6.5 C 13.5 6.5 13 7 13 7.5 C 13 8 13.5 8.5 14 8.5 M 10 8.5 L 14 8.5 M 10 9.5 C 10.5 9.5 11 10 11 10.5 C 11 11 10.5 11.5 10 11.5 M 14 9.5 C 13.5 9.5 13 10 13 10.5 C 13 11 13.5 11.5 14 11.5"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />

        {/* 3D Chart Bars - Isometric Perspective */}
        {/* Bar 1 - Left (tallest) */}
        <g transform="translate(2, 14) rotate(-30 0 0)">
          {/* Top face */}
          <rect
            x="0"
            y="0"
            width="2.5"
            height="1"
            fill={`url(#${gradientId3})`}
            opacity="0.9"
          />
          {/* Front face */}
          <rect
            x="0"
            y="1"
            width="2.5"
            height="4"
            fill={`url(#${gradientId3})`}
            opacity="0.7"
          />
          {/* Side face */}
          <path
            d="M 2.5 1 L 3.5 0.5 L 3.5 4.5 L 2.5 5 Z"
            fill={`url(#${gradientId3})`}
            opacity="0.5"
          />
        </g>

        {/* Bar 2 - Middle */}
        <g transform="translate(8, 16) rotate(-30 0 0)">
          {/* Top face */}
          <rect
            x="0"
            y="0"
            width="2.5"
            height="1"
            fill={`url(#${gradientId3})`}
            opacity="0.9"
          />
          {/* Front face */}
          <rect
            x="0"
            y="1"
            width="2.5"
            height="3"
            fill={`url(#${gradientId3})`}
            opacity="0.7"
          />
          {/* Side face */}
          <path
            d="M 2.5 1 L 3.5 0.5 L 3.5 3.5 L 2.5 4 Z"
            fill={`url(#${gradientId3})`}
            opacity="0.5"
          />
        </g>

        {/* Bar 3 - Right */}
        <g transform="translate(14, 17) rotate(-30 0 0)">
          {/* Top face */}
          <rect
            x="0"
            y="0"
            width="2.5"
            height="1"
            fill={`url(#${gradientId3})`}
            opacity="0.9"
          />
          {/* Front face */}
          <rect
            x="0"
            y="1"
            width="2.5"
            height="2.5"
            fill={`url(#${gradientId3})`}
            opacity="0.7"
          />
          {/* Side face */}
          <path
            d="M 2.5 1 L 3.5 0.5 L 3.5 3 L 2.5 3.5 Z"
            fill={`url(#${gradientId3})`}
            opacity="0.5"
          />
        </g>

        {/* Subtle depth shadow under coin */}
        <ellipse
          cx="13"
          cy="16.5"
          rx="5"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

FinanceIcon.displayName = "FinanceIcon";
