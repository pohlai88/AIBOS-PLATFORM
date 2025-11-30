/**
 * EcommerceIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for E-commerce module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface EcommerceIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * EcommerceIcon - Premium 3D icon for E-commerce module
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
 * import { EcommerceIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <EcommerceIcon />
 * </IconWrapper>
 * ```
 */
export const EcommerceIcon = React.forwardRef<SVGSVGElement, EcommerceIconProps>(
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

          {/* Device/Screen gradient */}
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

        {/* 3D Shopping Cart/Device - Isometric Perspective */}
        {/* Mobile device - top face */}
        <path
          d="M 6 4 L 10 3 L 16 3 L 20 4 L 20 10 L 6 10 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Mobile device - front face */}
        <rect
          x="6"
          y="10"
          width="14"
          height="8"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Mobile device - side face */}
        <path
          d="M 20 4 L 22 3.5 L 22 18 L 20 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Screen content - shopping cart icon */}
        <circle
          cx="13"
          cy="13"
          r="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx="13"
          cy="13"
          r="1"
          fill="currentColor"
          opacity="0.3"
        />

        {/* Shopping cart handle */}
        <path
          d="M 15.5 11 Q 16.5 10 17.5 11"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* 3D Package/Product - Isometric */}
        {/* Package - top face */}
        <path
          d="M 2 16 L 5 15 L 8 15 L 5 16 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Package - front face */}
        <rect
          x="2"
          y="16"
          width="3"
          height="4"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Package - side face */}
        <path
          d="M 5 15 L 8 15 L 8 20 L 5 20 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Package label */}
        <rect
          x="2.5"
          y="17"
          width="2"
          height="1"
          fill="currentColor"
          opacity="0.3"
        />

        {/* 3D Credit Card - Isometric */}
        {/* Card - top face */}
        <path
          d="M 14 18 L 17 17.5 L 20 17.5 L 17 18 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.8"
        />

        {/* Card - front face */}
        <rect
          x="14"
          y="18"
          width="3"
          height="2"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Card - side face */}
        <path
          d="M 17 17.5 L 20 17.5 L 20 20 L 17 20 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Card chip */}
        <rect
          x="14.5"
          y="18.3"
          width="0.8"
          height="0.6"
          fill="currentColor"
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

EcommerceIcon.displayName = "EcommerceIcon";

