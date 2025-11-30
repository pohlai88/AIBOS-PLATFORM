/**
 * ManufacturingIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Manufacturing/Production module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface ManufacturingIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * ManufacturingIcon - Premium 3D icon for Manufacturing/Production module
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
 * import { ManufacturingIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <ManufacturingIcon />
 * </IconWrapper>
 * ```
 */
export const ManufacturingIcon = React.forwardRef<
  SVGSVGElement,
  ManufacturingIconProps
>(({ className, ...props }, ref) => {
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

        {/* Gear/Machine gradient */}
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

      {/* 3D Factory/Gear - Isometric Perspective */}
      {/* Main gear - top face */}
      <circle
        cx="12"
        cy="8"
        r="5"
        fill={`url(#${gradientId1})`}
        opacity="0.9"
      />

      {/* Main gear - front face (cylinder) */}
      <ellipse
        cx="12"
        cy="14"
        rx="5"
        ry="2"
        fill={`url(#${gradientId3})`}
        opacity="0.7"
      />

      {/* Main gear - side face */}
      <path
        d="M 17 8 L 19 7 L 19 13 L 17 14 Z"
        fill={`url(#${gradientId2})`}
        opacity="0.5"
      />

      {/* Gear teeth - top */}
      <circle cx="12" cy="3" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="12" cy="13" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="7" cy="8" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="17" cy="8" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="9" cy="4" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="15" cy="4" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="9" cy="12" r="1" fill="currentColor" opacity="0.9" />
      <circle cx="15" cy="12" r="1" fill="currentColor" opacity="0.9" />

      {/* Gear center hole */}
      <circle
        cx="12"
        cy="8"
        r="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.6"
      />

      {/* 3D Production Line - Isometric */}
      {/* Conveyor belt - top */}
      <rect
        x="2"
        y="16"
        width="20"
        height="1.5"
        fill={`url(#${gradientId1})`}
        opacity="0.8"
        transform="rotate(-2 12 16.75)"
      />

      {/* Conveyor belt - front */}
      <rect
        x="2"
        y="17.5"
        width="20"
        height="2"
        fill={`url(#${gradientId3})`}
        opacity="0.6"
      />

      {/* Conveyor belt - side */}
      <path
        d="M 22 17.5 L 23 17 L 23 19.5 L 22 19 Z"
        fill={`url(#${gradientId2})`}
        opacity="0.4"
      />

      {/* Items on conveyor */}
      <rect
        x="4"
        y="16"
        width="2"
        height="1.5"
        fill={`url(#${gradientId4})`}
        opacity="0.7"
      />
      <rect
        x="10"
        y="16"
        width="2"
        height="1.5"
        fill={`url(#${gradientId4})`}
        opacity="0.7"
      />
      <rect
        x="16"
        y="16"
        width="2"
        height="1.5"
        fill={`url(#${gradientId4})`}
        opacity="0.7"
      />

      {/* Subtle depth shadow */}
      <ellipse
        cx="12"
        cy="20.5"
        rx="10"
        ry="1.5"
        fill="currentColor"
        opacity="0.15"
      />
    </svg>
  );
});

ManufacturingIcon.displayName = "ManufacturingIcon";

