/**
 * AiBosIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for AI-BOS ERP system.
 * Represents: Hexagonal cell-based architecture, AI-built, compliance-first governance,
 * self-healing, Lego-like modularity (vs monolithic Jenga).
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface AiBosIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * AiBosIcon - Premium 3D icon for AI-BOS ERP system
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
 * import { AiBosIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <AiBosIcon />
 * </IconWrapper>
 * ```
 */
export const AiBosIcon = React.forwardRef<SVGSVGElement, AiBosIconProps>(
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

          {/* Hexagonal cell gradient */}
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

        {/* 3D Hexagonal Cell Structure - Isometric Perspective */}
        {/* Central hexagon - top face */}
        <path
          d="M 12 6 L 14.5 7.5 L 14.5 10.5 L 12 12 L 9.5 10.5 L 9.5 7.5 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Central hexagon - front face */}
        <path
          d="M 9.5 10.5 L 9.5 14.5 L 12 16 L 14.5 14.5 L 14.5 10.5 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Central hexagon - side face */}
        <path
          d="M 14.5 7.5 L 16 8 L 16 14.5 L 14.5 14.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Hexagon 1 (top) - top face */}
        <path
          d="M 12 2 L 14.5 3.5 L 14.5 5.5 L 12 7 L 9.5 5.5 L 9.5 3.5 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Hexagon 1 - front face */}
        <path
          d="M 9.5 5.5 L 9.5 7.5 L 12 9 L 14.5 7.5 L 14.5 5.5 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Hexagon 1 - side face */}
        <path
          d="M 14.5 3.5 L 16 4 L 16 7.5 L 14.5 7.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Hexagon 2 (bottom-left) - top face */}
        <path
          d="M 6 10 L 8.5 11.5 L 8.5 13.5 L 6 15 L 3.5 13.5 L 3.5 11.5 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Hexagon 2 - front face */}
        <path
          d="M 3.5 13.5 L 3.5 16.5 L 6 18 L 8.5 16.5 L 8.5 13.5 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Hexagon 2 - side face */}
        <path
          d="M 8.5 11.5 L 10 12 L 10 16.5 L 8.5 16.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Hexagon 3 (bottom-right) - top face */}
        <path
          d="M 18 10 L 20.5 11.5 L 20.5 13.5 L 18 15 L 15.5 13.5 L 15.5 11.5 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Hexagon 3 - front face */}
        <path
          d="M 15.5 13.5 L 15.5 16.5 L 18 18 L 20.5 16.5 L 20.5 13.5 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Hexagon 3 - side face */}
        <path
          d="M 20.5 11.5 L 22 12 L 22 16.5 L 20.5 16.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* AI sparkle/connection points */}
        <circle
          cx="12"
          cy="9"
          r="0.8"
          fill="currentColor"
          opacity="0.6"
        />
        <circle
          cx="7"
          cy="12"
          r="0.6"
          fill="currentColor"
          opacity="0.5"
        />
        <circle
          cx="17"
          cy="12"
          r="0.6"
          fill="currentColor"
          opacity="0.5"
        />

        {/* Connection lines (modular connections) */}
        <path
          d="M 12 7 L 12 6 M 9.5 10.5 L 8.5 11.5 M 14.5 10.5 L 15.5 11.5"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
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

AiBosIcon.displayName = "AiBosIcon";

