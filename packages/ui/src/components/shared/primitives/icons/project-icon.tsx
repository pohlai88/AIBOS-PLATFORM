/**
 * ProjectIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Project Management module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface ProjectIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (defaults to 24x24)
   */
  className?: string;
}

/**
 * ProjectIcon - Premium 3D icon for Project Management module
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
 * import { ProjectIcon } from '@aibos/ui/components/shared/primitives/icons';
 * import { IconWrapper } from '@aibos/ui/components/shared/primitives';
 *
 * <IconWrapper size="lg">
 *   <ProjectIcon />
 * </IconWrapper>
 * ```
 */
export const ProjectIcon = React.forwardRef<SVGSVGElement, ProjectIconProps>(
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

          {/* Task/Block gradient */}
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

        {/* 3D Project Board/Kanban - Isometric Perspective */}
        {/* Board base - top face */}
        <path
          d="M 3 10 L 8 8 L 16 8 L 21 10 L 21 18 L 3 18 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.95"
        />

        {/* Board base - front face */}
        <rect
          x="3"
          y="18"
          width="18"
          height="3"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />

        {/* Board base - side face */}
        <path
          d="M 21 10 L 23 9 L 23 21 L 21 21 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* 3D Task Cards/Blocks */}
        {/* Task 1 - top face */}
        <rect
          x="5"
          y="11"
          width="4"
          height="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Task 1 - front face */}
        <rect
          x="5"
          y="12.5"
          width="4"
          height="3"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Task 1 - side face */}
        <path
          d="M 9 11 L 10 10.5 L 10 15.5 L 9 15 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Task 2 - top face */}
        <rect
          x="11"
          y="11"
          width="4"
          height="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Task 2 - front face */}
        <rect
          x="11"
          y="12.5"
          width="4"
          height="4"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Task 2 - side face */}
        <path
          d="M 15 11 L 16 10.5 L 16 16.5 L 15 16 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Task 3 - top face */}
        <rect
          x="5"
          y="14"
          width="4"
          height="1.5"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />

        {/* Task 3 - front face */}
        <rect
          x="5"
          y="15.5"
          width="4"
          height="2.5"
          fill={`url(#${gradientId4})`}
          opacity="0.7"
        />

        {/* Task 3 - side face */}
        <path
          d="M 9 14 L 10 13.5 L 10 18 L 9 18 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Project timeline/Gantt line */}
        <line
          x1="3"
          y1="10"
          x2="21"
          y2="10"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="2 2"
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

ProjectIcon.displayName = "ProjectIcon";

