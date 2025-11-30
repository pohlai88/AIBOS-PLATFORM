/**
 * FlatIconBase - Modern Flat Icon Base Component
 *
 * Based on Microsoft Fluent Design and Google Material Design principles.
 * Replaces 3D/isometric style with clean, flat, modern design.
 *
 * Features:
 * - Flat, clean design (no 3D effects)
 * - Material Design / Fluent Design inspired
 * - Theme-aware with currentColor
 * - Accessibility-first
 * - Size flexibility
 * - Weight variants (outline/solid)
 * - TypeScript-first
 */

import * as React from "react";

export type IconWeight = "outline" | "solid" | "duotone";
export type IconSize = number | string;

export interface FlatIconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "color"> {
  /**
   * Icon size (defaults to 24)
   * Supports number (px) or string (rem, em, %, etc.)
   */
  size?: IconSize;

  /**
   * Icon color (defaults to currentColor for theme compatibility)
   */
  color?: string;

  /**
   * Icon weight/style variant
   * - outline: Stroke-based (default)
   * - solid: Fill-based
   * - duotone: Two-tone effect
   */
  weight?: IconWeight;

  /**
   * Title for accessibility (makes icon semantic)
   * If not provided, icon is decorative (aria-hidden)
   */
  title?: string;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Whether icon should be mirrored (for RTL)
   */
  mirrored?: boolean;
}

/**
 * FlatIconBase - Base component for all flat icons
 *
 * Follows Material Design and Fluent Design principles:
 * - Clean, flat design (no 3D effects)
 * - Simple, recognizable shapes
 * - Consistent stroke width (2px for outline)
 * - Theme-aware coloring
 * - Accessibility-first
 */
export const FlatIconBase = React.forwardRef<SVGSVGElement, FlatIconProps>(
  (
    {
      size = 24,
      color = "currentColor",
      weight = "outline",
      title,
      className = "",
      mirrored = false,
      children,
      ...props
    },
    ref
  ) => {
    // Determine if icon is decorative (no title = decorative)
    const isDecorative = !title;

    // Size handling - convert number to string with px
    const sizeValue = typeof size === "number" ? `${size}px` : size;

    // Base classes
    const baseClasses = [
      "aibos-icon",
      `aibos-icon--${weight}`,
      mirrored && "aibos-icon--mirrored",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Stroke props for outline weight
    const strokeProps =
      weight === "outline"
        ? {
            fill: "none",
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
          }
        : {};

    // Fill props for solid weight
    const fillProps =
      weight === "solid"
        ? {
            fill: color,
            stroke: "none",
          }
        : {};

    // Duotone props
    const duotoneProps =
      weight === "duotone"
        ? {
            fill: color,
            fillOpacity: 0.2,
            stroke: color,
            strokeWidth: 2,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const,
          }
        : {};

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={sizeValue}
        height={sizeValue}
        viewBox="0 0 24 24"
        className={baseClasses}
        role={isDecorative ? "presentation" : "img"}
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={title}
        style={{
          transform: mirrored ? "scaleX(-1)" : undefined,
        }}
        {...strokeProps}
        {...fillProps}
        {...duotoneProps}
        {...props}
      >
        {title && <title>{title}</title>}
        {children}
      </svg>
    );
  }
);

FlatIconBase.displayName = "FlatIconBase";
