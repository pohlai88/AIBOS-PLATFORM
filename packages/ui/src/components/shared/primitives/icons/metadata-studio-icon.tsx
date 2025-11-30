/**
 * MetadataStudioIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Metadata Studio module in AI-BOS ERP system.
 * Inspired by OpenMetadata philosophy: data catalog, schema governance, and metadata management.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface MetadataStudioIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * MetadataStudioIcon - Premium 3D icon for Metadata Studio module
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
 * import { MetadataStudioIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <MetadataStudioIcon />
 * </IconWrapper>
 * ```
 */
export const MetadataStudioIcon = React.forwardRef<
  SVGSVGElement,
  MetadataStudioIconProps
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

        {/* Metadata/Schema gradient */}
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

      {/* 3D Data Catalog Structure - Isometric Perspective */}
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

      {/* Schema node 1 (top-left) - top face */}
      <circle
        cx="6"
        cy="6"
        r="1.5"
        fill={`url(#${gradientId1})`}
        opacity="0.85"
      />

      {/* Schema node 1 - front face */}
      <ellipse
        cx="6"
        cy="9"
        rx="1.5"
        ry="1"
        fill={`url(#${gradientId4})`}
        opacity="0.6"
      />

      {/* Schema node 1 - side face */}
      <path
        d="M 7.5 6 L 8.5 5.5 L 8.5 10 L 7.5 9.5 Z"
        fill={`url(#${gradientId2})`}
        opacity="0.4"
      />

      {/* Schema node 2 (top-right) - top face */}
      <circle
        cx="18"
        cy="6"
        r="1.5"
        fill={`url(#${gradientId1})`}
        opacity="0.85"
      />

      {/* Schema node 2 - front face */}
      <ellipse
        cx="18"
        cy="9"
        rx="1.5"
        ry="1"
        fill={`url(#${gradientId4})`}
        opacity="0.6"
      />

      {/* Schema node 2 - side face */}
      <path
        d="M 19.5 6 L 20.5 5.5 L 20.5 10 L 19.5 9.5 Z"
        fill={`url(#${gradientId2})`}
        opacity="0.4"
      />

      {/* Schema node 3 (bottom-left) - top face */}
      <circle
        cx="6"
        cy="16"
        r="1.5"
        fill={`url(#${gradientId1})`}
        opacity="0.85"
      />

      {/* Schema node 3 - front face */}
      <ellipse
        cx="6"
        cy="18"
        rx="1.5"
        ry="1"
        fill={`url(#${gradientId4})`}
        opacity="0.6"
      />

      {/* Schema node 3 - side face */}
      <path
        d="M 7.5 16 L 8.5 15.5 L 8.5 19 L 7.5 18.5 Z"
        fill={`url(#${gradientId2})`}
        opacity="0.4"
      />

      {/* Schema node 4 (bottom-right) - top face */}
      <circle
        cx="18"
        cy="16"
        r="1.5"
        fill={`url(#${gradientId1})`}
        opacity="0.85"
      />

      {/* Schema node 4 - front face */}
      <ellipse
        cx="18"
        cy="18"
        rx="1.5"
        ry="1"
        fill={`url(#${gradientId4})`}
        opacity="0.6"
      />

      {/* Schema node 4 - side face */}
      <path
        d="M 19.5 16 L 20.5 15.5 L 20.5 19 L 19.5 18.5 Z"
        fill={`url(#${gradientId2})`}
        opacity="0.4"
      />

      {/* Connection lines (metadata relationships) */}
      <path
        d="M 9 8 L 7.5 6 M 15 8 L 16.5 6 M 9 12 L 7.5 16 M 15 12 L 16.5 16"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />

      {/* 3D Studio/Workspace Frame - Isometric */}
      {/* Frame - top face */}
      <path
        d="M 2 4 L 6 3 L 18 3 L 22 4 L 22 6 L 2 6 Z"
        fill={`url(#${gradientId1})`}
        opacity="0.7"
      />

      {/* Frame - front face */}
      <rect
        x="2"
        y="6"
        width="20"
        height="1"
        fill={`url(#${gradientId3})`}
        opacity="0.5"
      />

      {/* Frame - side face */}
      <path
        d="M 22 4 L 24 3.5 L 24 7 L 22 7 Z"
        fill={`url(#${gradientId2})`}
        opacity="0.3"
      />

      {/* Subtle depth shadow */}
      <ellipse
        cx="12"
        cy="21.5"
        rx="10"
        ry="1.5"
        fill="currentColor"
        opacity="0.15"
      />
    </svg>
  );
});

MetadataStudioIcon.displayName = "MetadataStudioIcon";
