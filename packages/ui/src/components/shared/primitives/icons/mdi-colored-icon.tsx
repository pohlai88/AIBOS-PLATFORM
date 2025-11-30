/**
 * ColoredMDIIcon - Material Design Icons with Nano Banana Pro Color System
 *
 * Integrates Material Design Icons with AI-BOS adaptive luminance system.
 * Features: Light/Dark mode colors, glassy backgrounds, theme-aware coloring.
 *
 * Based on Cursor IDE's colored icon approach + Nano Banana Pro enhancements.
 */

import * as React from "react";
// @ts-ignore - @mdi/react types will be available after installation
import Icon from "@mdi/react";
import { cn } from "@aibos/ui/design/utilities";

// Type definition for MDI Icon props (until package is installed)
interface MDIIconProps extends React.SVGProps<SVGSVGElement> {
  path: string;
  size?: number | string;
  color?: string;
  className?: string;
  title?: string;
  spin?: boolean;
}

// Icon color variants using adaptive luminance design tokens
const colorMap: Record<string, string> = {
  // Status colors
  success: "var(--icon-success)",
  warning: "var(--icon-warning)",
  error: "var(--icon-error)",
  info: "var(--icon-info)",

  // Theme colors
  primary: "var(--icon-primary)",
  secondary: "var(--icon-secondary)",
  muted: "var(--icon-muted)",
  default: "var(--color-fg)",

  // File type colors (adaptive luminance)
  javascript: "var(--icon-js)",
  typescript: "var(--icon-ts)",
  python: "var(--icon-py)",
  html: "var(--icon-html)",
  css: "var(--icon-css)",
  react: "var(--icon-react)",
  vue: "var(--icon-vue)",
  node: "var(--icon-node)",
  git: "var(--icon-git)",
};

export type IconColorVariant =
  | "primary"
  | "secondary"
  | "muted"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "javascript"
  | "typescript"
  | "python"
  | "html"
  | "css"
  | "react"
  | "vue"
  | "node"
  | "git";

export interface ColoredMDIIconProps extends Omit<MDIIconProps, "color"> {
  /**
   * Icon path from @mdi/js
   * Example: import { mdiHome } from "@mdi/js"; path={mdiHome}
   */
  path: string;

  /**
   * Size in pixels or string (default: 1 for rem-based sizing)
   * MDI uses rem-based sizing by default (1 = 24px)
   */
  size?: number | string;

  /**
   * The semantic color variant (uses adaptive luminance system)
   * - Status: error, warning, success, info
   * - Theme: primary, secondary, muted, default
   * - File types: javascript, typescript, python, html, css, react, vue, node, git
   */
  variant?: IconColorVariant;

  /**
   * Custom color (overrides variant)
   * Can be: hex, rgb, CSS variable, or named color
   */
  color?: string;

  /**
   * If true, adds a translucent background matching the color (glassy effect)
   * Uses color-mix to create 10-15% opacity background with rounded corners
   */
  withBackground?: boolean;

  /**
   * Title for accessibility (makes icon semantic)
   */
  title?: string;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * ColoredMDIIcon - Material Design Icon with Nano Banana Pro color system
 *
 * Features:
 * - Adaptive luminance (light/dark mode colors)
 * - Glassy background option
 * - Theme-aware coloring
 *
 * @example
 * ```tsx
 * import { mdiHome, mdiLanguageJavascript } from "@mdi/js";
 *
 * // Basic usage
 * <ColoredMDIIcon path={mdiHome} variant="primary" />
 *
 * // File type with glassy background
 * <ColoredMDIIcon path={mdiLanguageJavascript} variant="javascript" withBackground />
 *
 * // Status color
 * <ColoredMDIIcon path={mdiAlertCircle} variant="error" />
 * ```
 */
export const ColoredMDIIcon = React.forwardRef<
  SVGSVGElement,
  ColoredMDIIconProps
>(
  (
    {
      path,
      size = 1,
      variant = "secondary",
      color,
      withBackground = false,
      title,
      className = "",
      ...props
    },
    ref
  ) => {
    // Determine color: custom > variant > default
    const colorVar = color || colorMap[variant] || colorMap.default;

    // Accessibility
    const isDecorative = !title;

    // Base icon style
    const iconStyle: React.CSSProperties = { color: colorVar };

    // If background is requested, wrap in container with glassy effect
    if (withBackground) {
      return (
        <div
          className={cn(
            "inline-flex items-center justify-center rounded-md p-1.5 transition-colors",
            className
          )}
          style={{
            // The Magic: Uses the text color but with 10% opacity for BG
            backgroundColor: `color-mix(in srgb, ${colorVar} 15%, transparent)`,
          }}
        >
          <Icon
            ref={ref}
            path={path}
            size={size}
            color={colorVar}
            role={isDecorative ? "presentation" : "img"}
            aria-hidden={isDecorative ? "true" : undefined}
            aria-label={title}
            title={title}
            {...props}
          />
        </div>
      );
    }

    // Plain icon without background
    return (
      <div
        className={cn("inline-flex items-center", className)}
        style={iconStyle}
      >
        <Icon
          ref={ref}
          path={path}
          size={size}
          color={colorVar}
          role={isDecorative ? "presentation" : "img"}
          aria-hidden={isDecorative ? "true" : undefined}
          aria-label={title}
          title={title}
          {...props}
        />
      </div>
    );
  }
);

ColoredMDIIcon.displayName = "ColoredMDIIcon";
