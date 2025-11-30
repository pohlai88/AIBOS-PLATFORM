/**
 * ResearchDevelopmentIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Research & Development module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface ResearchDevelopmentIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * ResearchDevelopmentIcon - Premium 3D icon for Research & Development module
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
 * import { ResearchDevelopmentIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <ResearchDevelopmentIcon />
 * </IconWrapper>
 * ```
 */
export const ResearchDevelopmentIcon = React.forwardRef<SVGSVGElement, ResearchDevelopmentIconProps>(
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

          {/* Microscope/Research gradient */}
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

        {/* 3D Microscope - Isometric Perspective */}
        {/* Microscope base - top face */}
        <path
          d="M 4 18 L 8 17 L 12 17 L 16 18 L 16 20 L 4 20 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Microscope base - front face */}
        <rect
          x="4"
          y="20"
          width="12"
          height="2"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Microscope base - side face */}
        <path
          d="M 16 18 L 18 17.5 L 18 22 L 16 22 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Microscope arm - top face */}
        <rect
          x="9"
          y="12"
          width="2"
          height="5"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
          transform="rotate(-15 10 14.5)"
        />

        {/* Microscope arm - front face */}
        <rect
          x="9"
          y="14"
          width="2"
          height="5"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Microscope eyepiece - top face */}
        <ellipse
          cx="10"
          cy="10"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Microscope eyepiece - front face */}
        <ellipse
          cx="10"
          cy="12"
          rx="1.5"
          ry="1"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Microscope eyepiece - side face */}
        <path
          d="M 11.5 10 L 12.5 9.5 L 12.5 13 L 11.5 12.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* 3D Light Bulb/Idea - Isometric */}
        {/* Bulb - top face */}
        <circle
          cx="18"
          cy="6"
          r="2.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Bulb - front face */}
        <ellipse
          cx="18"
          cy="8"
          rx="2.5"
          ry="1.5"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Bulb - side face */}
        <path
          d="M 20.5 6 L 21.5 5.5 L 21.5 9.5 L 20.5 9 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Light rays */}
        <path
          d="M 18 3 L 18 2 M 15 5 L 14 4 M 21 5 L 22 4"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* 3D Document/Research Paper - Isometric */}
        {/* Document - top face */}
        <path
          d="M 2 14 L 5 13 L 8 13 L 5 14 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Document - front face */}
        <rect
          x="2"
          y="14"
          width="3"
          height="4"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Document - side face */}
        <path
          d="M 5 13 L 8 13 L 8 18 L 5 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Document lines */}
        <line
          x1="2.5"
          y1="15.5"
          x2="4.5"
          y2="15.5"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.4"
        />
        <line
          x1="2.5"
          y1="16.5"
          x2="4.5"
          y2="16.5"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.4"
        />

        {/* Subtle depth shadow */}
        <ellipse
          cx="12"
          cy="22.5"
          rx="8"
          ry="1.5"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
    );
  }
);

ResearchDevelopmentIcon.displayName = "ResearchDevelopmentIcon";

