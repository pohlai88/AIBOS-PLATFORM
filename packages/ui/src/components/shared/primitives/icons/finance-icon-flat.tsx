/**
 * FinanceIcon - Modern Flat Design
 * 
 * Migrated from 3D isometric to flat design following:
 * - Microsoft Fluent Design principles
 * - Google Material Design guidelines
 * - GitHub best practices (Heroicons, Phosphor)
 * 
 * Features:
 * - Clean, flat design (no 3D effects)
 * - Weight variants (outline/solid/duotone)
 * - Theme-aware (currentColor)
 * - Accessibility-first
 * - Simple, recognizable shape
 */

import * as React from "react";
import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

export interface FinanceIconProps extends FlatIconProps {}

/**
 * FinanceIcon - Flat design icon for Finance/Accounting module
 * 
 * Design: Dollar sign ($) with chart bars - simple, clean, recognizable
 * 
 * @example
 * ```tsx
 * // Outline (default)
 * <FinanceIcon />
 * 
 * // Solid (filled)
 * <FinanceIcon weight="solid" />
 * 
 * // Duotone (premium)
 * <FinanceIcon weight="duotone" />
 * 
 * // Custom size and color
 * <FinanceIcon size={32} color="var(--color-primary)" />
 * 
 * // With accessibility
 * <FinanceIcon title="Finance Module" />
 * ```
 */
export const FinanceIconFlat = React.forwardRef<SVGSVGElement, FinanceIconProps>(
  (
    {
      size = 24,
      color = "currentColor",
      weight = "outline",
      title = "Finance",
      ...props
    },
    ref
  ) => {
    return (
      <FlatIconBase
        ref={ref}
        size={size}
        color={color}
        weight={weight}
        title={title}
        {...props}
      >
        {weight === "outline" ? (
          <>
            {/* Dollar Sign */}
            <path d="M12 2v20M9 6h6M9 12h6M9 18h6" />
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="18" r="2" />
            
            {/* Chart Bars */}
            <path d="M3 14h2v4H3z" />
            <path d="M7 12h2v6H7z" />
            <path d="M11 10h2v8h-2z" />
            <path d="M15 8h2v10h-2z" />
            <path d="M19 6h2v12h-2z" />
          </>
        ) : weight === "solid" ? (
          <>
            {/* Filled Dollar Sign */}
            <path d="M12 2v20M9 6h6M9 12h6M9 18h6" strokeWidth={2.5} />
            <circle cx="12" cy="6" r="2.5" />
            <circle cx="12" cy="18" r="2.5" />
            
            {/* Filled Chart Bars */}
            <rect x="3" y="14" width="2" height="4" />
            <rect x="7" y="12" width="2" height="6" />
            <rect x="11" y="10" width="2" height="8" />
            <rect x="15" y="8" width="2" height="10" />
            <rect x="19" y="6" width="2" height="12" />
          </>
        ) : (
          // Duotone: Background + Foreground
          <>
            {/* Background layer (20% opacity) */}
            <g opacity="0.2">
              <path d="M12 2v20M9 6h6M9 12h6M9 18h6" />
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="18" r="2" />
              <rect x="3" y="14" width="2" height="4" />
              <rect x="7" y="12" width="2" height="6" />
              <rect x="11" y="10" width="2" height="8" />
              <rect x="15" y="8" width="2" height="10" />
              <rect x="19" y="6" width="2" height="12" />
            </g>
            
            {/* Foreground layer (100% opacity) */}
            <path d="M12 2v20M9 6h6M9 12h6M9 18h6" />
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="18" r="2" />
            <path d="M3 14h2v4H3z" />
            <path d="M7 12h2v6H7z" />
            <path d="M11 10h2v8h-2z" />
            <path d="M15 8h2v10h-2z" />
            <path d="M19 6h2v12h-2z" />
          </>
        )}
      </FlatIconBase>
    );
  }
);

FinanceIconFlat.displayName = "FinanceIconFlat";

