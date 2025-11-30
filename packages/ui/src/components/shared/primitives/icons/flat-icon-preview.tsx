/**
 * Flat Icon Preview - Showcase Unique Flat Icons
 *
 * Demonstrates distinctive flat icon designs that stand out
 * from generic Tailwind/Heroicons style.
 */

"use client";

import * as React from "react";
import { FlatIconBase, FlatIconProps } from "./FLAT_ICON_BASE";

// ============================================
// Icon 1: Finance - Modern Dollar with Growth
// ============================================
export const FinanceIconPreview = React.forwardRef<
  SVGSVGElement,
  FlatIconProps
>(
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
            {/* Dollar sign with modern styling */}
            <path d="M12 3v18M10 7h4M10 12h4M10 17h4" strokeWidth={2} />
            <circle cx="12" cy="7" r="1.5" />
            <circle cx="12" cy="17" r="1.5" />

            {/* Growth arrow - distinctive upward trend */}
            <path
              d="M16 8l2-2 2 2M18 6v6"
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Chart line - subtle data visualization */}
            <path d="M4 16l2-1 3 2 3-3 2 1" strokeWidth={1.5} opacity={0.6} />
          </>
        ) : weight === "solid" ? (
          <>
            <path d="M12 3v18M10 7h4M10 12h4M10 17h4" strokeWidth={2.5} />
            <circle cx="12" cy="7" r="2" />
            <circle cx="12" cy="17" r="2" />
            <path
              d="M16 8l2-2 2 2M18 6v6"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill={color}
            />
            <rect x="4" y="15" width="1" height="1" />
            <rect x="6" y="16" width="1" height="1" />
            <rect x="9" y="15" width="1" height="1" />
            <rect x="12" y="13" width="1" height="1" />
            <rect x="14" y="16" width="1" height="1" />
          </>
        ) : (
          <>
            <g opacity="0.2">
              <path d="M12 3v18M10 7h4M10 12h4M10 17h4" />
              <circle cx="12" cy="7" r="1.5" />
              <circle cx="12" cy="17" r="1.5" />
            </g>
            <path d="M12 3v18M10 7h4M10 12h4M10 17h4" strokeWidth={2} />
            <circle cx="12" cy="7" r="1.5" />
            <circle cx="12" cy="17" r="1.5" />
            <path
              d="M16 8l2-2 2 2M18 6v6"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path d="M4 16l2-1 3 2 3-3 2 1" strokeWidth={1.5} opacity={0.6} />
          </>
        )}
      </FlatIconBase>
    );
  }
);
FinanceIconPreview.displayName = "FinanceIconPreview";

// ============================================
// Icon 2: Warehouse - Smart Container System
// ============================================
export const WarehouseIconPreview = React.forwardRef<
  SVGSVGElement,
  FlatIconProps
>(
  (
    {
      size = 24,
      color = "currentColor",
      weight = "outline",
      title = "Warehouse",
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
            {/* Modern warehouse building with grid pattern */}
            <rect x="4" y="8" width="16" height="12" rx="1" strokeWidth={2} />
            <path d="M4 8l8-4 8 4" strokeWidth={2} />

            {/* Smart grid system - distinctive pattern */}
            <path d="M8 12v6M12 12v6M16 12v6" strokeWidth={1.5} opacity={0.5} />
            <path d="M4 14h16M4 16h16" strokeWidth={1} opacity={0.3} />

            {/* Inventory indicator dots */}
            <circle cx="6" cy="10" r="0.8" />
            <circle cx="18" cy="10" r="0.8" />
          </>
        ) : weight === "solid" ? (
          <>
            <rect x="4" y="8" width="16" height="12" rx="1" />
            <path d="M4 8l8-4 8 4" fill="none" stroke={color} strokeWidth={2} />
            <rect x="8" y="12" width="2" height="6" />
            <rect x="12" y="12" width="2" height="6" />
            <rect x="16" y="12" width="2" height="6" />
            <circle cx="6" cy="10" r="1" />
            <circle cx="18" cy="10" r="1" />
          </>
        ) : (
          <>
            <g opacity="0.2">
              <rect x="4" y="8" width="16" height="12" rx="1" />
              <path d="M4 8l8-4 8 4" />
            </g>
            <rect x="4" y="8" width="16" height="12" rx="1" strokeWidth={2} />
            <path d="M4 8l8-4 8 4" strokeWidth={2} />
            <path d="M8 12v6M12 12v6M16 12v6" strokeWidth={1.5} opacity={0.5} />
            <circle cx="6" cy="10" r="0.8" />
            <circle cx="18" cy="10" r="0.8" />
          </>
        )}
      </FlatIconBase>
    );
  }
);
WarehouseIconPreview.displayName = "WarehouseIconPreview";

// ============================================
// Icon 3: Sales - Handshake with Growth
// ============================================
export const SalesIconPreview = React.forwardRef<SVGSVGElement, FlatIconProps>(
  (
    {
      size = 24,
      color = "currentColor",
      weight = "outline",
      title = "Sales",
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
            {/* Modern handshake - distinctive design */}
            <path
              d="M8 12c-1-1-2-2-2-4 0-2 2-3 4-3s4 1 4 3c0 2-1 3-2 4"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d="M16 12c1-1 2-2 2-4 0-2-2-3-4-3s-4 1-4 3c0 2 1 3 2 4"
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Growth sparkle - unique touch */}
            <path
              d="M12 6l0.5 1.5 1.5 0.5-1.5 0.5-0.5 1.5-0.5-1.5-1.5-0.5 1.5-0.5z"
              strokeWidth={1}
            />

            {/* Sales trend arrow */}
            <path d="M6 18l3-2 3 1 3-2 3 2" strokeWidth={1.5} opacity={0.6} />
          </>
        ) : weight === "solid" ? (
          <>
            <path
              d="M8 12c-1-1-2-2-2-4 0-2 2-3 4-3s4 1 4 3c0 2-1 3-2 4"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <path
              d="M16 12c1-1 2-2 2-4 0-2-2-3-4-3s-4 1-4 3c0 2 1 3 2 4"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
            <circle cx="12" cy="6" r="1.5" />
            <path d="M6 18l3-2 3 1 3-2 3 2" strokeWidth={2} />
          </>
        ) : (
          <>
            <g opacity="0.2">
              <path d="M8 12c-1-1-2-2-2-4 0-2 2-3 4-3s4 1 4 3c0 2-1 3-2 4" />
              <path d="M16 12c1-1 2-2 2-4 0-2-2-3-4-3s-4 1-4 3c0 2 1 3 2 4" />
            </g>
            <path
              d="M8 12c-1-1-2-2-2-4 0-2 2-3 4-3s4 1 4 3c0 2-1 3-2 4"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d="M16 12c1-1 2-2 2-4 0-2-2-3-4-3s-4 1-4 3c0 2 1 3 2 4"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              d="M12 6l0.5 1.5 1.5 0.5-1.5 0.5-0.5 1.5-0.5-1.5-1.5-0.5 1.5-0.5z"
              strokeWidth={1}
            />
            <path d="M6 18l3-2 3 1 3-2 3 2" strokeWidth={1.5} opacity={0.6} />
          </>
        )}
      </FlatIconBase>
    );
  }
);
SalesIconPreview.displayName = "SalesIconPreview";

// ============================================
// Icon 4: Dashboard - Modern Analytics Grid
// ============================================
export const DashboardIconPreview = React.forwardRef<
  SVGSVGElement,
  FlatIconProps
>(
  (
    {
      size = 24,
      color = "currentColor",
      weight = "outline",
      title = "Dashboard",
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
            {/* Modern grid layout - distinctive pattern */}
            <rect x="3" y="4" width="8" height="6" rx="1" strokeWidth={2} />
            <rect x="13" y="4" width="8" height="6" rx="1" strokeWidth={2} />
            <rect x="3" y="12" width="8" height="8" rx="1" strokeWidth={2} />
            <rect x="13" y="12" width="8" height="8" rx="1" strokeWidth={2} />

            {/* Data visualization elements - unique touch */}
            <circle cx="7" cy="7" r="1.5" opacity={0.6} />
            <path d="M15 7l2 2 3-1" strokeWidth={1.5} opacity={0.6} />
            <path d="M5 16l2-1 2 2" strokeWidth={1.5} opacity={0.6} />
            <rect x="15" y="15" width="4" height="3" rx="0.5" opacity={0.4} />
          </>
        ) : weight === "solid" ? (
          <>
            <rect x="3" y="4" width="8" height="6" rx="1" />
            <rect x="13" y="4" width="8" height="6" rx="1" />
            <rect x="3" y="12" width="8" height="8" rx="1" />
            <rect x="13" y="12" width="8" height="8" rx="1" />
            <circle cx="7" cy="7" r="1.5" fill="white" opacity={0.8} />
            <path
              d="M15 7l2 2 3-1"
              stroke="white"
              strokeWidth={1.5}
              opacity={0.8}
            />
            <path
              d="M5 16l2-1 2 2"
              stroke="white"
              strokeWidth={1.5}
              opacity={0.8}
            />
            <rect
              x="15"
              y="15"
              width="4"
              height="3"
              rx="0.5"
              fill="white"
              opacity={0.6}
            />
          </>
        ) : (
          <>
            <g opacity="0.2">
              <rect x="3" y="4" width="8" height="6" rx="1" />
              <rect x="13" y="4" width="8" height="6" rx="1" />
              <rect x="3" y="12" width="8" height="8" rx="1" />
              <rect x="13" y="12" width="8" height="8" rx="1" />
            </g>
            <rect x="3" y="4" width="8" height="6" rx="1" strokeWidth={2} />
            <rect x="13" y="4" width="8" height="6" rx="1" strokeWidth={2} />
            <rect x="3" y="12" width="8" height="8" rx="1" strokeWidth={2} />
            <rect x="13" y="12" width="8" height="8" rx="1" strokeWidth={2} />
            <circle cx="7" cy="7" r="1.5" opacity={0.6} />
            <path d="M15 7l2 2 3-1" strokeWidth={1.5} opacity={0.6} />
            <path d="M5 16l2-1 2 2" strokeWidth={1.5} opacity={0.6} />
            <rect x="15" y="15" width="4" height="3" rx="0.5" opacity={0.4} />
          </>
        )}
      </FlatIconBase>
    );
  }
);
DashboardIconPreview.displayName = "DashboardIconPreview";

// ============================================
// Icon 5: AI Assistant - Modern Brain/Spark
// ============================================
export const AIIconPreview = React.forwardRef<SVGSVGElement, FlatIconProps>(
  (
    {
      size = 24,
      color = "currentColor",
      weight = "outline",
      title = "AI Assistant",
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
            {/* Modern brain/neural network - distinctive design */}
            <path
              d="M12 4c-2 0-4 1-4 3 0 1 1 2 2 2-1 1-2 2-2 3 0 2 2 3 4 3s4-1 4-3c0-1-1-2-2-2 1 0 2-1 2-2 0-2-2-3-4-3z"
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Neural connections - unique pattern */}
            <circle cx="9" cy="7" r="1" />
            <circle cx="15" cy="7" r="1" />
            <circle cx="10" cy="11" r="1" />
            <circle cx="14" cy="11" r="1" />
            <path d="M9 7l1 4M15 7l-1 4" strokeWidth={1} opacity={0.5} />

            {/* Spark/lightning - AI energy */}
            <path
              d="M12 16l1-2 2 1-1 2-2-1z"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </>
        ) : weight === "solid" ? (
          <>
            <path d="M12 4c-2 0-4 1-4 3 0 1 1 2 2 2-1 1-2 2-2 3 0 2 2 3 4 3s4-1 4-3c0-1-1-2-2-2 1 0 2-1 2-2 0-2-2-3-4-3z" />
            <circle cx="9" cy="7" r="1.5" fill="white" opacity={0.8} />
            <circle cx="15" cy="7" r="1.5" fill="white" opacity={0.8} />
            <circle cx="10" cy="11" r="1.5" fill="white" opacity={0.8} />
            <circle cx="14" cy="11" r="1.5" fill="white" opacity={0.8} />
            <path
              d="M12 16l1-2 2 1-1 2-2-1z"
              stroke="white"
              strokeWidth={1.5}
            />
          </>
        ) : (
          <>
            <g opacity="0.2">
              <path d="M12 4c-2 0-4 1-4 3 0 1 1 2 2 2-1 1-2 2-2 3 0 2 2 3 4 3s4-1 4-3c0-1-1-2-2-2 1 0 2-1 2-2 0-2-2-3-4-3z" />
            </g>
            <path
              d="M12 4c-2 0-4 1-4 3 0 1 1 2 2 2-1 1-2 2-2 3 0 2 2 3 4 3s4-1 4-3c0-1-1-2-2-2 1 0 2-1 2-2 0-2-2-3-4-3z"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <circle cx="9" cy="7" r="1" />
            <circle cx="15" cy="7" r="1" />
            <circle cx="10" cy="11" r="1" />
            <circle cx="14" cy="11" r="1" />
            <path d="M9 7l1 4M15 7l-1 4" strokeWidth={1} opacity={0.5} />
            <path
              d="M12 16l1-2 2 1-1 2-2-1z"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </>
        )}
      </FlatIconBase>
    );
  }
);
AIIconPreview.displayName = "AIIconPreview";
