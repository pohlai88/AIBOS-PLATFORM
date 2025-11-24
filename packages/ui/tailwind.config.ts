// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./packages/ui/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: "var(--color-bg)",
        "bg-muted": "var(--color-bg-muted)",
        "bg-elevated": "var(--color-bg-elevated)",

        // Text
        fg: "var(--color-fg)",
        "fg-muted": "var(--color-fg-muted)",
        "fg-subtle": "var(--color-fg-subtle)",

        // Accent (DLBB Green)
        primary: "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",
        "primary-foreground": "var(--color-primary-foreground)",

        // Secondary
        secondary: "var(--color-secondary)",
        "secondary-soft": "var(--color-secondary-soft)",
        "secondary-foreground": "var(--color-secondary-foreground)",

        // Status
        success: "var(--color-success)",
        "success-soft": "var(--color-success-soft)",
        "success-foreground": "var(--color-success-foreground)",

        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        "warning-foreground": "var(--color-warning-foreground)",

        danger: "var(--color-danger)",
        "danger-soft": "var(--color-danger-soft)",
        "danger-foreground": "var(--color-danger-foreground)",

        info: "var(--color-info-soft)",
        "info-foreground": "var(--color-info-foreground)",

        // Borders / ring
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        ring: "var(--color-ring)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
      },
      maxWidth: {
        container: "var(--aibos-container-max)",
      },
    },
  },
  safelist: [
    // Core semantic classes MCP/AI can always use safely
    "bg-bg",
    "bg-bg-muted",
    "bg-bg-elevated",
    "text-fg",
    "text-fg-muted",
    "text-fg-subtle",
    "bg-primary",
    "bg-primary-soft",
    "text-primary-foreground",
    "border-border",
    "border-border-subtle",
    "ring-ring",
    "bg-success-soft",
    "text-success-foreground",
    "bg-danger-soft",
    "text-danger-foreground",
    "bg-warning-soft",
    "text-warning-foreground",
    "bg-info-soft",
    "text-info-foreground",
    "rounded-sm",
    "rounded-md",
    "rounded-lg",
    "rounded-xl",
    "rounded-full",
    "shadow-xs",
    "shadow-sm",
    "shadow-md",
  ],
};

export default config;
