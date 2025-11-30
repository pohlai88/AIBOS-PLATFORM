/**
 * QualityAssuranceIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Quality Assurance/Laboratory module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface QualityAssuranceIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * QualityAssuranceIcon - Premium 3D icon for Quality Assurance/Laboratory module
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
 * import { QualityAssuranceIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <QualityAssuranceIcon />
 * </IconWrapper>
 * ```
 */
export const QualityAssuranceIcon = React.forwardRef<SVGSVGElement, QualityAssuranceIconProps>(
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

          {/* Flask/Beaker gradient */}
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

        {/* 3D Laboratory Flask - Isometric Perspective */}
        {/* Flask body - top face (ellipse) */}
        <ellipse
          cx="12"
          cy="8"
          rx="4"
          ry="2"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Flask body - front face (trapezoid) */}
        <path
          d="M 8 8 L 8 16 L 16 16 L 16 8 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Flask body - side face */}
        <path
          d="M 16 8 L 18 7 L 18 15 L 16 16 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Flask neck - top face */}
        <ellipse
          cx="12"
          cy="6"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Flask neck - front face */}
        <rect
          x="10.5"
          y="6"
          width="3"
          height="2"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Flask neck - side face */}
        <path
          d="M 13.5 6 L 14.5 5.5 L 14.5 8 L 13.5 8 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Liquid in flask */}
        <ellipse
          cx="12"
          cy="12"
          rx="3.5"
          ry="1.5"
          fill="currentColor"
          opacity="0.3"
        />

        {/* 3D Checkmark/Quality Seal - Isometric */}
        {/* Seal circle - top face */}
        <circle
          cx="18"
          cy="6"
          r="2.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Seal circle - front face */}
        <ellipse
          cx="18"
          cy="8"
          rx="2.5"
          ry="1"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Seal circle - side face */}
        <path
          d="M 20.5 6 L 21.5 5.5 L 21.5 9 L 20.5 8.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Checkmark on seal */}
        <path
          d="M 16.5 6 L 17.5 7 L 19.5 5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.8"
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

QualityAssuranceIcon.displayName = "QualityAssuranceIcon";

