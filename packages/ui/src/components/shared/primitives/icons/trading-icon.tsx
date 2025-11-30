/**
 * TradingIcon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for Trading module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards with sophisticated
 * gradients, depth, and professional appearance.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface TradingIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const TradingIcon = React.forwardRef<SVGSVGElement, TradingIconProps>(
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

        {/* 3D Exchange/Arrows - Isometric */}
        <path
          d="M 4 8 L 8 6 L 12 8 L 8 10 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />
        <path
          d="M 4 8 L 4 12 L 8 14 L 8 10 Z"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />
        <path
          d="M 8 6 L 12 8 L 12 12 L 8 14 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        <path
          d="M 12 16 L 16 14 L 20 16 L 16 18 Z"
          fill={`url(#${gradientId1})`}
          opacity="0.9"
        />
        <path
          d="M 12 16 L 12 20 L 16 22 L 16 18 Z"
          fill={`url(#${gradientId3})`}
          opacity="0.7"
        />
        <path
          d="M 16 14 L 20 16 L 20 20 L 16 22 Z"
          fill={`url(#${gradientId2})`}
          opacity="0.5"
        />

        {/* Trading chart */}
        <path
          d="M 6 12 L 8 10 L 10 11 L 12 9 L 14 10 L 16 8 L 18 9"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

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

TradingIcon.displayName = "TradingIcon";

