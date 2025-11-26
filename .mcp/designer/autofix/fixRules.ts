import type { ValidationError } from "../types/ValidationError.js";

export type FixType = "tailwind" | "style" | "token" | "structural";

export interface FixSuggestion {
  fixType: FixType;
  description: string;
  replacement?: {
    class?: string;
    removeClass?: string[];
    style?: Record<string, string | number>;
    token?: string;
    surfaceRole?: string;
  };
  confidence: "high" | "medium" | "low";
}

/**
 * Suggest a fix for a given validation error.
 * Returns null if no automatic fix is available.
 */
export function suggestFix(error: ValidationError): FixSuggestion | null {
  switch (error.code) {
    // =====================
    // Typography Fixes
    // =====================
    case "TYP-001": // TYP_TOO_SMALL
      return {
        fixType: "tailwind",
        description: "Increase font size to minimum (text-sm = 14px)",
        replacement: { class: "text-sm", removeClass: ["text-xs"] },
        confidence: "high",
      };

    case "TYP-002": // TYP_INVALID_WEIGHT
      return {
        fixType: "tailwind",
        description: "Replace font-weight with nearest allowed weight",
        replacement: {
          class: "font-medium",
          removeClass: ["font-thin", "font-extralight", "font-light"],
        },
        confidence: "medium",
      };

    case "TYP-003": // TYP_INVALID_LINEHEIGHT
      return {
        fixType: "tailwind",
        description: "Adjust line-height to recommended range",
        replacement: { class: "leading-normal" },
        confidence: "medium",
      };

    case "TYP-004": // TYP_HEADING_JUMP
      return {
        fixType: "structural",
        description: "Fix heading hierarchy (avoid skipping levels)",
        confidence: "low",
      };

    // =====================
    // Spacing Fixes
    // =====================
    case "SPC-001": // SPC_NOT_GRID
      return {
        fixType: "tailwind",
        description: "Snap gap to nearest grid step (4px increments)",
        replacement: { class: "gap-4", removeClass: ["gap-3", "gap-5"] },
        confidence: "high",
      };

    case "SPC-002": // SPC_ILLEGAL_VALUE
      return {
        fixType: "tailwind",
        description: "Use allowed padding value from spacing scale",
        replacement: { class: "p-4", removeClass: ["p-3", "p-5"] },
        confidence: "high",
      };

    case "SPC-003": // SPC_INCONSISTENT_SIBLING
      return {
        fixType: "tailwind",
        description: "Align spacing with sibling elements",
        confidence: "low",
      };

    // =====================
    // Layout Fixes
    // =====================
    case "LAY-001": // LAY_OVERFLOW
      return {
        fixType: "tailwind",
        description: "Add overflow handling",
        replacement: { class: "overflow-hidden" },
        confidence: "medium",
      };

    case "LAY-002": // LAY_ALIGNMENT
      return {
        fixType: "style",
        description: "Snap position to alignment grid",
        confidence: "low",
      };

    case "LAY-003": // LAY_FRAME_TOO_WIDE
      return {
        fixType: "tailwind",
        description: "Constrain max-width to theme limit",
        replacement: { class: "max-w-7xl" },
        confidence: "medium",
      };

    case "LAY-004": // LAY_FRAME_TOO_NARROW
      return {
        fixType: "tailwind",
        description: "Set minimum width",
        replacement: { class: "min-w-60" },
        confidence: "medium",
      };

    // =====================
    // Geometry Fixes
    // =====================
    case "GEO-001": // GEO_ICON_TOO_SMALL
      return {
        fixType: "style",
        description: "Increase icon size to nearest allowed (24px)",
        replacement: { style: { width: "24px", height: "24px" } },
        confidence: "high",
      };

    case "GEO-002": // GEO_BUTTON_PADDING
      return {
        fixType: "tailwind",
        description: "Increase button padding to minimum",
        replacement: { class: "px-4 py-2" },
        confidence: "high",
      };

    case "GEO-003": // GEO_RADIUS_INVALID
      return {
        fixType: "tailwind",
        description: "Use allowed border-radius value",
        replacement: {
          class: "rounded-md",
          removeClass: ["rounded-sm", "rounded-lg", "rounded-xl"],
        },
        confidence: "medium",
      };

    // =====================
    // Visual Fixes
    // =====================
    case "VIS-001": // VIS_ILLEGAL_SURFACE
      return {
        fixType: "token",
        description: "Use allowed surface role from theme",
        replacement: { surfaceRole: "primary" },
        confidence: "medium",
      };

    case "VIS-002": // VIS_FORBIDDEN_EFFECT
      return {
        fixType: "style",
        description: "Remove forbidden visual effect",
        replacement: { style: { boxShadow: "none" } },
        confidence: "high",
      };

    default:
      return null;
  }
}

/**
 * Get all available fix rules with their descriptions.
 */
export function getAllFixRules(): Record<string, string> {
  return {
    "TYP-001": "Font size too small → text-sm",
    "TYP-002": "Invalid font weight → font-medium",
    "TYP-003": "Invalid line-height → leading-normal",
    "TYP-004": "Heading jump → structural fix",
    "SPC-001": "Gap not on grid → gap-4",
    "SPC-002": "Illegal padding → p-4",
    "SPC-003": "Inconsistent sibling spacing",
    "LAY-001": "Overflow → overflow-hidden",
    "LAY-002": "Alignment off-grid",
    "LAY-003": "Frame too wide → max-w-7xl",
    "LAY-004": "Frame too narrow → min-w-60",
    "GEO-001": "Icon too small → 24px",
    "GEO-002": "Button padding → px-4 py-2",
    "GEO-003": "Invalid radius → rounded-md",
    "VIS-001": "Illegal surface → primary",
    "VIS-002": "Forbidden effect → remove",
  };
}

