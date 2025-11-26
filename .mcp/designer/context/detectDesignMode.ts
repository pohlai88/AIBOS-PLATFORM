/**
 * Design Mode Detection
 * Detects accessibility and visual mode requirements.
 */

export type DesignMode = "default" | "safe" | "aa" | "aaa";

/**
 * Detect design mode from environment and configuration.
 */
export function detectDesignMode(): DesignMode {
  // Check environment variable
  const envMode = process.env.AIBOS_DESIGN_MODE?.toLowerCase();

  if (envMode === "safe") return "safe";
  if (envMode === "aa") return "aa";
  if (envMode === "aaa") return "aaa";

  // Check for accessibility environment hints
  if (process.env.WCAG_LEVEL === "AAA") return "aaa";
  if (process.env.WCAG_LEVEL === "AA") return "aa";

  return "default";
}

/**
 * Get design mode from component metadata or props.
 */
export function detectDesignModeFromProps(props: Record<string, any>): DesignMode | null {
  if (props.accessibilityMode === "aaa" || props["data-wcag"] === "aaa") return "aaa";
  if (props.accessibilityMode === "aa" || props["data-wcag"] === "aa") return "aa";
  if (props.safeMode === true || props["data-safe-mode"] === "true") return "safe";

  return null;
}

/**
 * Get mode-specific design rules.
 */
export function getModeRules(mode: DesignMode): DesignModeRules {
  switch (mode) {
    case "aaa":
      return {
        minContrastRatio: 7,
        minFontSize: 14,
        minTouchTarget: 48,
        requireFocusIndicator: true,
        requireAriaLabels: true,
        forbiddenPatterns: ["text-xs", "opacity-50", "text-gray-400"],
      };
    case "aa":
      return {
        minContrastRatio: 4.5,
        minFontSize: 12,
        minTouchTarget: 44,
        requireFocusIndicator: true,
        requireAriaLabels: true,
        forbiddenPatterns: ["text-xs"],
      };
    case "safe":
      return {
        minContrastRatio: 4.5,
        minFontSize: 14,
        minTouchTarget: 44,
        requireFocusIndicator: true,
        requireAriaLabels: false,
        forbiddenPatterns: ["animate-", "transition-"],
      };
    default:
      return {
        minContrastRatio: 3,
        minFontSize: 12,
        minTouchTarget: 32,
        requireFocusIndicator: false,
        requireAriaLabels: false,
        forbiddenPatterns: [],
      };
  }
}

export interface DesignModeRules {
  minContrastRatio: number;
  minFontSize: number;
  minTouchTarget: number;
  requireFocusIndicator: boolean;
  requireAriaLabels: boolean;
  forbiddenPatterns: string[];
}

