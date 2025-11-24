# Tailwind CSS Integration

> **Tailwind v4 configuration** for the AI-BOS design system.

This document describes how Tailwind CSS is configured to work with the AI-BOS design system tokens.

---

## Configuration Overview

Tailwind v4 is configured via:

1. **CSS Variables** (`apps/web/app/globals.css`) - Design tokens as CSS custom properties
2. **Tailwind Config** (`tailwind.config.ts`) - Tailwind theme extension mapping

---

## Tailwind Configuration

The Tailwind configuration extends the default theme with design tokens:

```typescript
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
        // Semantic Surface Colors
        "bg-base": "var(--bg-base)",
        "bg-subtle": "var(--bg-subtle)",
        "bg-muted": "var(--bg-muted)",
        "bg-elevated": "var(--bg-elevated)",

        // Text Colors
        "fg-primary": "var(--fg-primary)",
        "fg-secondary": "var(--fg-secondary)",
        "fg-tertiary": "var(--fg-tertiary)",
        "fg-quaternary": "var(--fg-quaternary)",
        "fg-inverse": "var(--fg-inverse)",

        // Borders
        "border-subtle": "var(--border-subtle)",
        "border-medium": "var(--border-medium)",
        "border-strong": "var(--border-strong)",

        // Accent (Primary brand color)
        accent: "var(--accent-bg)",
        "accent-hover": "var(--accent-bg-hover)",
        "accent-active": "var(--accent-bg-active)",
        "accent-fg": "var(--accent-fg)",
        "accent-subtle": "var(--accent-subtle)",

        // Status Colors
        success: "var(--success)",
        "success-light": "var(--success-light)",
        warning: "var(--warning)",
        "warning-light": "var(--warning-light)",
        error: "var(--error)",
        "error-light": "var(--error-light)",
        info: "var(--info)",
        "info-light": "var(--info-light)",

        // Interactive States
        "interactive-hover": "var(--interactive-hover)",
        "interactive-active": "var(--interactive-active)",
      },
      // ... typography, spacing, shadows, etc.
    },
  },
};

export default config;
```

---

## Usage Rules

### ✅ Allowed Semantic Utilities

Use semantic utilities that map to design tokens:

**Surfaces:**
- `bg-bg`, `bg-bg-muted`, `bg-bg-elevated`

**Text:**
- `text-fg`, `text-fg-muted`, `text-fg-subtle`

**Accent:**
- `bg-primary`, `bg-primary-soft`, `text-primary-foreground`

**Border / Ring:**
- `border-border`, `border-border-subtle`, `ring-ring`

**Status:**
- `bg-success-soft`, `bg-danger-soft`, `bg-warning-soft`

### ❌ Forbidden

**Raw Tailwind Palette Colors:**
- `bg-emerald-500`, `text-slate-400`, `border-[#123456]`

**Arbitrary Values:**
- Any `bg-[...hex...]` / `text-[...rgb...]` / arbitrary color class

**Reason:** These bypass the design system and break theme consistency.

---

## Safelist

The configuration includes a safelist to ensure critical utilities are always available:

```typescript
safelist: [
  // Semantic color utilities
  "bg-bg-base",
  "bg-bg-subtle",
  "bg-bg-muted",
  "bg-bg-elevated",
  "text-fg-primary",
  "text-fg-secondary",
  "text-fg-tertiary",
  "text-fg-quaternary",
  "border-border-subtle",
  "border-border-medium",
  "border-border-strong",
  
  // Accent colors
  "bg-accent",
  "bg-accent-hover",
  "bg-accent-subtle",
  "text-accent",
  "text-accent-fg",
  "border-accent",
  
  // Status colors
  "bg-success",
  "bg-success-light",
  "text-success",
  // ... etc
],
```

---

## Dark Mode

Dark mode is configured using the `class` strategy:

```typescript
darkMode: "class",
```

Toggle dark mode by adding/removing the `dark` class on the `<html>` element:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle("dark");
```

CSS variables automatically adapt based on the theme:

```css
:root {
  --bg-base: #ffffff; /* Light mode */
}

.dark {
  --bg-base: #0a0a0a; /* Dark mode */
}
```

---

## Token Mapping

All Tailwind utilities map to CSS custom properties defined in `globals.css`:

| Tailwind Utility | CSS Variable | Purpose |
|-----------------|--------------|---------|
| `bg-bg-elevated` | `--bg-elevated` | Card backgrounds |
| `text-fg-primary` | `--fg-primary` | Primary text |
| `border-border-subtle` | `--border-subtle` | Subtle borders |
| `bg-accent` | `--accent-bg` | Primary accent |
| `rounded-md` | `--radius-md` | Medium border radius |
| `shadow-sm` | `--shadow-sm` | Small shadow |

**📖 Complete Token Reference:** See [Token System](../01-foundation/tokens.md)

---

## Next.js Integration

In Next.js App Router, import the global CSS file:

```tsx
// app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## Validation

The design system validator enforces Tailwind usage rules:

- ✅ Checks for raw Tailwind palette colors
- ✅ Validates semantic token usage
- ✅ Ensures no arbitrary color values

**📖 Validation Rules:** See [Governance Documentation](../GOVERNANCE.md)

---

## Related Documentation

- [Token System](../01-foundation/tokens.md) - Complete token reference
- [Colors](../01-foundation/colors.md) - Color system documentation
- [Next.js Integration](./nextjs.md) - Next.js App Router setup
- [Governance](../GOVERNANCE.md) - Design system rules

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Design System Team

