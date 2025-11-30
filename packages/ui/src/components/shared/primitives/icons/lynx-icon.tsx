/**
 * LynxIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Lynx AI Assistant in AI-BOS ERP system.
 * Represents: AI Assistant derived from LLMs, consuming MCP (Model Context Protocol),
 * thread/kite relationship (push and pull dynamics).
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface LynxIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * LynxIcon - Premium 3D icon for Lynx AI Assistant
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
 * import { LynxIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <LynxIcon />
 * </IconWrapper>
 * ```
 */
export const LynxIcon = React.forwardRef<SVGSVGElement, LynxIconProps>(
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

          {/* AI/Thread gradient */}
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

        {/* 3D Lynx Head - Isometric Perspective */}
        {/* Head - top face */}
        <ellipse
          cx="12"
          cy="8"
          rx="5"
          ry="3"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Head - front face */}
        <path
          d="M 7 8 L 7 14 L 17 14 L 17 8 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Head - side face */}
        <path
          d="M 17 8 L 19 7.5 L 19 14 L 17 14 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Ear 1 (left) - top face */}
        <path
          d="M 6 6 L 7 4 L 8 5 L 7 6 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Ear 1 - front face */}
        <path
          d="M 6 6 L 6 8 L 7 9 L 7 6 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Ear 2 (right) - top face */}
        <path
          d="M 18 6 L 19 4 L 20 5 L 19 6 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Ear 2 - front face */}
        <path
          d="M 18 6 L 18 8 L 19 9 L 19 6 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Eye 1 (left) */}
        <ellipse
          cx="9"
          cy="10"
          rx="1"
          ry="0.8"
          fill="currentColor"
          opacity="0.8"
        />

        {/* Eye 2 (right) */}
        <ellipse
          cx="15"
          cy="10"
          rx="1"
          ry="0.8"
          fill="currentColor"
          opacity="0.8"
        />

        {/* Nose */}
        <path
          d="M 12 12 L 11 13 L 12 13.5 L 13 13 Z"
          fill="currentColor"
          opacity="0.6"
        />

        {/* 3D Thread/Connection - Isometric */}
        {/* Thread spool - top face */}
        <ellipse
          cx="4"
          cy="16"
          rx="1.5"
          ry="0.8"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Thread spool - front face */}
        <ellipse
          cx="4"
          cy="18"
          rx="1.5"
          ry="1"
          fill={`url(#${gradientId3})`}
          opacity="0.6"
        />

        {/* Thread spool - side face */}
        <path
          d="M 5.5 16 L 6.5 15.5 L 6.5 19 L 5.5 18.5 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Thread line (push/pull connection) */}
        <path
          d="M 5.5 18 Q 8 16 10 14 Q 12 12 12 12"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />

        {/* 3D Kite/Context - Isometric */}
        {/* Kite - top face */}
        <path
          d="M 18 16 L 20 15 L 22 16 L 20 17 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.85"
        />

        {/* Kite - front face */}
        <path
          d="M 18 16 L 18 18 L 20 19 L 22 18 L 22 16 Z"
          fill={`url(#${gradientId4})`}
          opacity="0.6"
        />

        {/* Kite - side face */}
        <path
          d="M 22 16 L 23 15.5 L 23 18 L 22 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.4"
        />

        {/* Kite tail/connection */}
        <path
          d="M 20 17 L 20 19"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* MCP connection line (thread to kite) */}
        <path
          d="M 12 12 Q 15 14 18 16"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="2 2"
          fill="none"
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

LynxIcon.displayName = "LynxIcon";

