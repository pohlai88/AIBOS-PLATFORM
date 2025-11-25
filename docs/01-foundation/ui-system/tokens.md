# Design Tokens

> **Token System Documentation** - Token-First, WCAG-Compliant, MCP-Validated  
> **Version:** 2.0.0  
> **Last Updated:** 2025-01-27  
> **Status:** ✅ SSOT - Single Source of Truth

---

## Overview

Design tokens are the **foundation of the AI-BOS design system**. They provide a single source of truth for all visual properties, enabling:

- ✅ Theme switching (Default, WCAG AA, WCAG AAA, High Contrast)
- ✅ Multi-tenant customization
- ✅ Design-code synchronization (Figma → Code)
- ✅ MCP-governed validation
- ✅ Accessibility compliance enforcement
- ✅ Safe Mode support

**Core Principle:** All styling **MUST** flow through design tokens. Raw values (hex colors, px values) are **FORBIDDEN**.

**Validated Against:**

- ✅ Tailwind MCP (token validation)
- ✅ Figma MCP (design-to-code sync)
- ✅ React MCP (no raw values enforcement)
- ✅ A11y MCP (WCAG compliance)
- ✅ Next.js MCP (RSC boundary validation)

---

## Token Architecture

### Four-Layer Token System

AI-BOS uses a **four-layer token hierarchy**:

```
1. Global Tokens (Base Values)
   ↓
2. Semantic Tokens (Meaning-Based)
   ↓
3. Component Tokens (Pre-Composed)
   ↓
4. Utility Tokens (Tailwind Classes)
```

### Layer 1: Global Tokens (Base Values)

**Location:** `packages/ui/src/design/globals.css`

**Purpose:** Raw design values (colors, spacing, typography, etc.)

**Characteristics:**

- ✅ Direct CSS custom properties
- ✅ No semantic meaning
- ✅ Theme-agnostic base values
- ✅ Used by semantic tokens

**Example:**

```css
:root {
  /* Global color values */
  --color-blue-600: #2563eb;
  --color-gray-50: #f9fafb;

  /* Global spacing values */
  --space-4: 1rem; /* 16px */
  --space-6: 1.5rem; /* 24px */

  /* Global typography values */
  --text-base: 1rem;
  --text-lg: 1.125rem;
}
```

---

### Layer 2: Semantic Tokens (Meaning-Based) ⭐ **REQUIRED**

**Location:** `packages/ui/src/design/globals.css`

**Purpose:** Tokens with semantic meaning (surface, text, accent, status, etc.)

**Characteristics:**

- ✅ Map to design system concepts
- ✅ Theme-aware (adapt to WCAG AA/AAA)
- ✅ Tenant-customizable (aesthetic theme only)
- ✅ Used by component tokens

**Semantic Token Categories:**

#### A. Surface Tokens

```css
:root {
  --color-surface: var(--color-bg);
  --color-surface-muted: var(--color-bg-muted);
  --color-surface-elevated: var(--color-bg-elevated);
  --color-surface-inverse: var(--color-fg);
}
```

#### B. Text Tokens

```css
:root {
  --color-text: var(--color-fg);
  --color-text-muted: var(--color-fg-muted);
  --color-text-subtle: var(--color-fg-subtle);
  --color-text-inverse: var(--color-bg);
}
```

#### C. Accent Tokens

```css
:root {
  --color-accent: var(--color-primary);
  --color-accent-soft: var(--color-primary-soft);
  --color-accent-foreground: var(--color-primary-foreground);
  --color-accent-hover: color-mix(in oklch, var(--color-primary) 90%, black);
  --color-accent-active: color-mix(in oklch, var(--color-primary) 80%, black);
  --color-accent-disabled: var(--color-fg-subtle);
}
```

#### D. Status Tokens

```css
:root {
  /* Success */
  --color-success: var(--color-success);
  --color-success-soft: var(--color-success-soft);
  --color-success-foreground: var(--color-success-foreground);

  /* Warning */
  --color-warning: var(--color-warning);
  --color-warning-soft: var(--color-warning-soft);
  --color-warning-foreground: var(--color-warning-foreground);

  /* Danger */
  --color-danger: var(--color-danger);
  --color-danger-soft: var(--color-danger-soft);
  --color-danger-foreground: var(--color-danger-foreground);

  /* Info */
  --color-info: var(--color-primary);
  --color-info-soft: var(--color-primary-soft);
  --color-info-foreground: var(--color-primary-foreground);
}
```

#### E. Border Tokens

```css
:root {
  --color-border: var(--color-border);
  --color-border-subtle: var(--color-border-subtle);
  --color-border-strong: color-mix(in oklch, var(--color-border) 150%, black);
  --color-border-focus: var(--color-ring);
}
```

#### F. Semantic Spacing Tokens

```css
:root {
  /* Component spacing */
  --space-button-y: var(--space-2); /* 8px */
  --space-button-x: var(--space-4); /* 16px */
  --space-input-y: var(--space-3); /* 12px */
  --space-input-x: var(--space-4); /* 16px */
  --space-card-padding: var(--space-6); /* 24px */
  --space-section-gap: var(--space-8); /* 32px */

  /* Layout spacing */
  --space-grid-gap: var(--space-6); /* 24px */
  --space-table-row-padding: var(--space-4); /* 16px */
  --space-list-item-spacing: var(--space-4); /* 16px */
}
```

#### G. Semantic Typography Tokens

```css
:root {
  --text-label: var(--text-xs); /* Labels, captions */
  --text-body: var(--text-base); /* Body text */
  --text-title: var(--text-lg); /* Titles */
  --text-heading: var(--text-xl); /* Headings */
  --text-display: var(--text-2xl); /* Display text */
}
```

#### H. Semantic Radius Tokens

```css
:root {
  --radius-input: var(--radius-md);
  --radius-button: var(--radius-lg);
  --radius-card: var(--radius-lg);
  --radius-dialog: var(--radius-xl);
  --radius-badge: var(--radius-full);
}
```

**TypeScript Semantic Tokens:**

```typescript
export const semanticTokens = {
  // Surface
  surface: "bg-surface",
  surfaceMuted: "bg-surface-muted",
  surfaceElevated: "bg-surface-elevated",

  // Text
  text: "text-text",
  textMuted: "text-text-muted",
  textSubtle: "text-text-subtle",

  // Accent
  accent: "bg-accent",
  accentHover: "hover:bg-accent-hover",
  accentActive: "active:bg-accent-active",
  accentDisabled: "disabled:bg-accent-disabled",

  // Status
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
} as const;
```

**Validated:** ✅ Semantic tokens exist in `globals.css` (via Tailwind MCP)

---

### Layer 3: Component Tokens (Pre-Composed)

**Location:** `packages/ui/src/design/tokens.ts`

**Purpose:** Pre-composed token combinations for common component patterns

**Characteristics:**

- ✅ Combine semantic tokens
- ✅ Include spacing, typography, colors
- ✅ Support density modes
- ✅ RSC-safe (no browser APIs)

**Example:**

```typescript
export const componentTokens = {
  buttonPrimary: [
    "inline-flex items-center justify-center gap-1.5",
    spacingTokens.sm,
    radiusTokens.lg,
    colorTokens.primarySurface,
    accessibilityTokens.textOnPrimary,
    shadowTokens.xs,
    "transition hover:opacity-95 active:scale-[0.98]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ].join(" "),

  card: [
    colorTokens.bgElevated,
    accessibilityTokens.textOnBgElevated,
    "border border-border",
    radiusTokens.lg,
    shadowTokens.xs,
    "p-6", // Uses semantic spacing
  ].join(" "),
} as const;
```

**Component Token Rules:**

1. ✅ **Must use semantic tokens internally** (not global tokens)
2. ✅ **Must support density modes** (compact, normal, spacious)
3. ✅ **Must not contain layout spacing** (use flex/grid instead)
4. ✅ **Must map to Radix primitives** (for Layer 2 compositions)

**Validated:** ✅ Component tokens use semantic tokens (via React MCP)

---

### Layer 4: Utility Tokens (Tailwind Classes)

**Location:** `packages/ui/src/design/tokens.ts`

**Purpose:** TypeScript mappings to Tailwind utility classes

**Characteristics:**

- ✅ Type-safe access
- ✅ Tailwind utility class mappings
- ✅ Developer experience optimization

**Example:**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

colorTokens.surface.default; // "bg-surface"
colorTokens.text.muted; // "text-text-muted"
```

---

## Three-Layer CSS Architecture

### 1. Full Design System CSS

**Location:** `packages/ui/src/design/globals.css`

**Purpose:** Complete design system foundation

**Contains:**

- ✅ All global tokens
- ✅ All semantic tokens
- ✅ Theme overrides (light, dark, WCAG AA, WCAG AAA, high contrast)
- ✅ Tenant overrides (aesthetic theme only)
- ✅ Safe Mode overrides

**Source of Truth:** Design system package

**Purpose:** Reusable across all apps

---

### 2. Safe Mode CSS (Fallback)

**Location:** `apps/web/app/globals.css`

**Purpose:** Minimal fallback styles

**Contains:**

- ✅ Basic reset & typography
- ✅ Fallback color variables
- ✅ Minimal spacing
- ✅ WCAG AAA minimums enforced

**Purpose:** Resilience & fallback if package fails

---

### 3. TypeScript Tokens

**Location:** `packages/ui/src/design/tokens.ts`

**Purpose:** Type-safe token access

**Contains:**

- ✅ TypeScript token mappings
- ✅ Tailwind utility class mappings
- ✅ Component-level token presets
- ✅ Type definitions

**Purpose:** Developer experience

---

### Token Flow

```
Figma Variables
    ↓
packages/ui/src/design/globals.css (Full System)
    ↓
tokens.ts (TypeScript Access)
    ↓
Components (Usage)
    ↓
apps/web/app/globals.css (Safe Mode Fallback)
```

### Architecture Rationale

**Why Dual CSS?**

- ✅ **Cross-Package Resilience:** App remains functional if `@aibos/ui` package fails
- ✅ **Token Reusability:** Full tokens in package can be shared across multiple apps
- ✅ **Design System Ownership:** Tokens co-located with TypeScript tokens
- ✅ **No Single Point of Failure:** Safe mode provides fallback

**Import Order:**

```typescript
// apps/web/app/layout.tsx
import "./globals.css"; // Safe mode - always loads first
import "@aibos/ui/design/globals.css"; // Full design system - enhances safe mode
```

**Validated Against:**

- ✅ Tailwind Tokens MCP (`read_tailwind_config`)
- ✅ Figma Variables MCP (`get_variable_defs`)

---

## Token Categories

**Complete Token System:**

1. **Color Tokens** - Colors, surfaces, text, accents, status
2. **Spacing Tokens** - Spacing scale, semantic spacing, component spacing
3. **Typography Tokens** - Font sizes, weights, line heights, semantic typography
4. **Radius Tokens** - Border radius, semantic radius
5. **Shadow Tokens** - Box shadows, elevation
6. **Motion Tokens** - Animation durations, easing functions
7. **Opacity Tokens** - Opacity values for states
8. **Density Tokens** - Density modes (compact, default, comfortable)
9. **Z-Index / Layer Tokens** - Layering system for overlays
10. **Focus Ring Tokens** - WCAG-compliant focus indicators
11. **Component State Tokens** - Hover, active, disabled, selected states
12. **Grid & Layout Tokens** - Grid spacing, layout dimensions, containers

---

### 1. Color Tokens

#### Global Color Tokens

**CSS Variables:**

```css
:root {
  /* Neutral grayscale */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-500: #6b7280;
  --color-gray-900: #111827;

  /* Brand colors */
  --color-blue-600: #2563eb;
  --color-green-600: #16a34a;
  --color-red-600: #dc2626;
  --color-amber-500: #f59e0b;
}
```

#### Semantic Color Tokens

**Surface Tokens:**

```css
:root {
  --color-surface: var(--color-bg);
  --color-surface-muted: var(--color-bg-muted);
  --color-surface-elevated: var(--color-bg-elevated);
  --color-surface-inverse: var(--color-fg);
}
```

**Text Tokens:**

```css
:root {
  --color-text: var(--color-fg);
  --color-text-muted: var(--color-fg-muted);
  --color-text-subtle: var(--color-fg-subtle);
  --color-text-inverse: var(--color-bg);
}
```

**Accent Tokens (with State):**

```css
:root {
  --color-accent: var(--color-primary);
  --color-accent-soft: var(--color-primary-soft);
  --color-accent-foreground: var(--color-primary-foreground);

  /* State tokens */
  --color-accent-hover: color-mix(in oklch, var(--color-primary) 90%, black);
  --color-accent-active: color-mix(in oklch, var(--color-primary) 80%, black);
  --color-accent-selected: var(--color-primary-soft);
  --color-accent-disabled: var(--color-fg-subtle);
}
```

**Status Tokens:**

```css
:root {
  /* Success */
  --color-success: #16a34a;
  --color-success-soft: color-mix(in oklch, #16a34a 10%, transparent);
  --color-success-foreground: #f9fafb;

  /* Warning */
  --color-warning: #f59e0b;
  --color-warning-soft: color-mix(in oklch, #f59e0b 12%, transparent);
  --color-warning-foreground: #111827;

  /* Danger */
  --color-danger: #dc2626;
  --color-danger-soft: color-mix(in oklch, #dc2626 10%, transparent);
  --color-danger-foreground: #f9fafb;

  /* Info */
  --color-info: var(--color-primary);
  --color-info-soft: var(--color-primary-soft);
  --color-info-foreground: var(--color-primary-foreground);
}
```

**Border Tokens:**

```css
:root {
  --color-border: #e5e7eb;
  --color-border-subtle: #f3f4f6;
  --color-border-strong: color-mix(in oklch, #e5e7eb 150%, black);
  --color-border-focus: var(--color-ring);
  --color-border-error: var(--color-danger);
}
```

**TypeScript Access:**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

// Surface colors
colorTokens.surface.default; // "bg-surface"
colorTokens.surface.muted; // "bg-surface-muted"
colorTokens.surface.elevated; // "bg-surface-elevated"

// Text colors
colorTokens.text.default; // "text-text"
colorTokens.text.muted; // "text-text-muted"
colorTokens.text.subtle; // "text-text-subtle"

// Accent colors
colorTokens.accent.default; // "bg-accent"
colorTokens.accent.hover; // "hover:bg-accent-hover"
colorTokens.accent.active; // "active:bg-accent-active"
colorTokens.accent.disabled; // "disabled:bg-accent-disabled"

// Status colors
colorTokens.status.success; // "bg-success"
colorTokens.status.warning; // "bg-warning"
colorTokens.status.danger; // "bg-danger"
colorTokens.status.info; // "bg-info"
```

**Usage:**

```tsx
import { colorTokens } from "@aibos/ui/design/tokens";

// ✅ CORRECT: Use semantic tokens
<div className={colorTokens.surface.elevated}>
  <p className={colorTokens.text.default}>Content</p>
</div>

// ❌ INCORRECT: Raw hex colors (FORBIDDEN)
<div className="bg-[#ffffff]">
  <p className="text-[#111827]">Content</p>
</div>
```

**Validated:** ✅ All tokens exist in `globals.css` (via Tailwind MCP)

---

### 2. Spacing Tokens

**See:** [Spacing System](./spacing.md) for complete documentation.

**CSS Variables:**

```css
:root {
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
}
```

**Semantic Spacing Tokens:**

```css
:root {
  /* Component spacing */
  --space-button-y: var(--space-2); /* 8px */
  --space-button-x: var(--space-4); /* 16px */
  --space-input-y: var(--space-3); /* 12px (WCAG minimum) */
  --space-input-x: var(--space-4); /* 16px */
  --space-card-padding: var(--space-6); /* 24px */
  --space-section-gap: var(--space-8); /* 32px */

  /* Layout spacing */
  --space-grid-gap: var(--space-6); /* 24px */
  --space-table-row-padding: var(--space-4); /* 16px */
  --space-list-item-spacing: var(--space-4); /* 16px */
}
```

**TypeScript Access:**

```typescript
import { spacingTokens, semanticSpacingTokens } from "@aibos/ui/design/tokens";

spacingTokens.xs; // "px-2 py-1"
spacingTokens.sm; // "px-3 py-1.5"
spacingTokens.md; // "px-4 py-2"
spacingTokens.lg; // "px-5 py-2.5"

semanticSpacingTokens.buttonY; // "py-[var(--space-button-y)]"
semanticSpacingTokens.cardPadding; // "p-[var(--space-card-padding)]"
```

**Usage:**

```tsx
<button className={spacingTokens.md}>Click me</button>
<div className={semanticSpacingTokens.cardPadding}>Card content</div>
```

**Validated:** ✅ Spacing values match 4px grid system (via React MCP)

---

### 3. Typography Tokens

#### Global Typography Tokens

**CSS Variables:**

```css
:root {
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
}
```

#### Semantic Typography Tokens

```css
:root {
  --text-label: var(--text-xs); /* Labels, captions */
  --text-body: var(--text-base); /* Body text */
  --text-title: var(--text-lg); /* Titles */
  --text-heading: var(--text-xl); /* Headings */
  --text-display: var(--text-2xl); /* Display text */
}
```

**TypeScript Access:**

```typescript
import { typographyTokens } from "@aibos/ui/design/tokens";

typographyTokens.labelSm; // "text-[11px] font-medium tracking-wide uppercase"
typographyTokens.bodySm; // "text-sm leading-relaxed"
typographyTokens.bodyMd; // "text-[15px] leading-relaxed"
typographyTokens.headingSm; // "text-sm font-semibold"
typographyTokens.headingMd; // "text-base font-semibold"
typographyTokens.headingLg; // "text-lg font-semibold"
```

**Usage:**

```tsx
<h1 className={typographyTokens.headingLg}>Heading</h1>
<p className={typographyTokens.bodyMd}>Body text</p>
```

**Validated:** ✅ Typography scale follows Major Third (1.250 ratio)

---

### 4. Radius Tokens

#### Global Radius Tokens

**CSS Variables:**

```css
:root {
  --radius-xs: 0.25rem; /* 4px */
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.5rem; /* 8px */
  --radius-xl: 0.75rem; /* 12px */
  --radius-2xl: 1rem; /* 16px */
  --radius-full: 9999px;
}
```

#### Semantic Radius Tokens

```css
:root {
  --radius-input: var(--radius-md);
  --radius-button: var(--radius-lg);
  --radius-card: var(--radius-lg);
  --radius-dialog: var(--radius-xl);
  --radius-badge: var(--radius-full);
}
```

**TypeScript Access:**

```typescript
import { radiusTokens } from "@aibos/ui/design/tokens";

radiusTokens.xs; // "rounded-[var(--radius-xs)]"
radiusTokens.sm; // "rounded-[var(--radius-sm)]"
radiusTokens.md; // "rounded-[var(--radius-md)]"
radiusTokens.lg; // "rounded-[var(--radius-lg)]"
radiusTokens.xl; // "rounded-[var(--radius-xl)]"
radiusTokens.full; // "rounded-[var(--radius-full)]"
```

**Usage:**

```tsx
<div className={radiusTokens.lg}>Content</div>
<button className={radiusTokens.button}>Button</button>
```

---

### 5. Shadow Tokens

**CSS Variables:**

```css
:root {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 6px 16px 0 rgb(15 23 42 / 0.08);
  --shadow-lg: 0 14px 32px 0 rgb(15 23 42 / 0.16);
}
```

**Safe Mode Override:**

```css
[data-safe-mode="true"] {
  --shadow-xs: none;
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}
```

**TypeScript Access:**

```typescript
import { shadowTokens } from "@aibos/ui/design/tokens";

shadowTokens.xs; // "shadow-[var(--shadow-xs)]"
shadowTokens.sm; // "shadow-[var(--shadow-sm)]"
shadowTokens.md; // "shadow-[var(--shadow-md)]"
shadowTokens.lg; // "shadow-[var(--shadow-lg)]"
```

**Usage:**

```tsx
<div className={shadowTokens.md}>Card with shadow</div>
```

**WCAG Rules:**

- ✅ Shadows must meet contrast rules on different backgrounds
- ✅ Safe Mode disables all shadows
- ✅ Shadows must not interfere with focus indicators

---

### 6. Motion Tokens (NEW)

**CSS Variables:**

```css
:root {
  /* Duration */
  --motion-duration-fast: 150ms;
  --motion-duration-normal: 200ms;
  --motion-duration-slow: 300ms;

  /* Easing */
  --motion-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --motion-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --motion-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Reduced motion */
  --motion-reduced: 0ms;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-fast: var(--motion-reduced);
    --motion-duration-normal: var(--motion-reduced);
    --motion-duration-slow: var(--motion-reduced);
  }
}
```

**TypeScript Access:**

```typescript
export const motionTokens = {
  duration: {
    fast: "duration-[var(--motion-duration-fast)]",
    normal: "duration-[var(--motion-duration-normal)]",
    slow: "duration-[var(--motion-duration-slow)]",
  },
  easing: {
    in: "ease-[var(--motion-ease-in)]",
    out: "ease-[var(--motion-ease-out)]",
    inOut: "ease-[var(--motion-ease-in-out)]",
  },
} as const;
```

**Usage:**

```tsx
<div
  className={`transition ${motionTokens.duration.normal} ${motionTokens.easing.out}`}
>
  Content
</div>
```

**WCAG Rules:**

- ✅ Must respect `prefers-reduced-motion`
- ✅ Essential animations only (Safe Mode)
- ✅ Non-essential animations disabled in Safe Mode

---

### 7. Opacity Tokens (NEW)

**CSS Variables:**

```css
:root {
  --opacity-disabled: 0.5;
  --opacity-hover: 0.95;
  --opacity-active: 0.9;
  --opacity-muted: 0.6;
  --opacity-subtle: 0.4;
}
```

**TypeScript Access:**

```typescript
export const opacityTokens = {
  disabled: "opacity-[var(--opacity-disabled)]",
  hover: "hover:opacity-[var(--opacity-hover)]",
  active: "active:opacity-[var(--opacity-active)]",
  muted: "opacity-[var(--opacity-muted)]",
  subtle: "opacity-[var(--opacity-subtle)]",
} as const;
```

**Usage:**

```tsx
<button className={`${opacityTokens.hover} ${opacityTokens.active}`}>
  Button
</button>
```

---

### 8. Density Tokens (NEW)

**Density tokens control spacing adjustments for different use cases.**

**CSS Variables:**

```css
:root {
  /* Density offsets (applied to spacing tokens) */
  --density-compact: -2px; /* Compact: -2px from base */
  --density-default: 0px; /* Default: no offset */
  --density-comfortable: +2px; /* Comfortable: +2px from base */

  /* Density multipliers */
  --density-compact-multiplier: 0.75; /* 75% of base spacing */
  --density-default-multiplier: 1; /* 100% of base spacing */
  --density-comfortable-multiplier: 1.25; /* 125% of base spacing */
}
```

**Density Mode Application:**

```css
[data-density="compact"] {
  /* Apply compact density to spacing tokens */
  --space-button-y: calc(
    var(--space-2) + var(--density-compact)
  ); /* 6px (was 8px) */
  --space-button-x: calc(
    var(--space-4) + var(--density-compact)
  ); /* 14px (was 16px) */
  --space-card-padding: calc(
    var(--space-6) * var(--density-compact-multiplier)
  ); /* 18px (was 24px) */
  --space-table-row-padding: calc(
    var(--space-4) + var(--density-compact)
  ); /* 14px (was 16px) */
}

[data-density="comfortable"] {
  /* Apply comfortable density to spacing tokens */
  --space-button-y: calc(
    var(--space-2) + var(--density-comfortable)
  ); /* 10px (was 8px) */
  --space-button-x: calc(
    var(--space-4) + var(--density-comfortable)
  ); /* 18px (was 16px) */
  --space-card-padding: calc(
    var(--space-6) * var(--density-comfortable-multiplier)
  ); /* 30px (was 24px) */
  --space-table-row-padding: calc(
    var(--space-4) + var(--density-comfortable)
  ); /* 18px (was 16px) */
}
```

**TypeScript Access:**

```typescript
export const densityTokens = {
  compact: "data-density-compact",
  default: "data-density-default",
  comfortable: "data-density-comfortable",
} as const;
```

**Usage:**

```tsx
// Apply density to component
<div data-density="compact">
  <DataTable /> {/* Uses compact spacing */}
</div>

<div data-density="comfortable">
  <Form /> {/* Uses comfortable spacing */}
</div>
```

**Applied To:**

- ✅ Inputs (padding adjustments)
- ✅ Buttons (padding adjustments)
- ✅ Table rows (row height)
- ✅ Cards (padding adjustments)
- ✅ Form fields (spacing between fields)

**Validated:** ✅ Density modes supported (via React MCP)

---

### 9. Z-Index / Layer Tokens (NEW)

**Z-index tokens provide semantic layering for overlays, modals, and floating elements.**

**CSS Variables:**

```css
:root {
  /* Base layers */
  --layer-base: 0;
  --layer-floating: 10;

  /* Overlay layers */
  --layer-tooltip: 20;
  --layer-popover: 30;
  --layer-dropdown: 30;
  --layer-dialog: 40;
  --layer-modal: 40;
  --layer-toast: 50;
  --layer-overlay: 60;
  --layer-maximum: 9999;
}
```

**TypeScript Access:**

```typescript
export const layerTokens = {
  base: "z-[var(--layer-base)]",
  floating: "z-[var(--layer-floating)]",
  tooltip: "z-[var(--layer-tooltip)]",
  popover: "z-[var(--layer-popover)]",
  dropdown: "z-[var(--layer-dropdown)]",
  dialog: "z-[var(--layer-dialog)]",
  modal: "z-[var(--layer-modal)]",
  toast: "z-[var(--layer-toast)]",
  overlay: "z-[var(--layer-overlay)]",
  maximum: "z-[var(--layer-maximum)]",
} as const;
```

**Usage:**

```tsx
// ✅ CORRECT: Use layer tokens
<Tooltip className={layerTokens.tooltip}>Tooltip content</Tooltip>
<Dialog className={layerTokens.dialog}>Dialog content</Dialog>
<Toast className={layerTokens.toast}>Toast message</Toast>

// ❌ INCORRECT: Raw z-index values
<Tooltip className="z-[20]">Tooltip content</Tooltip>
```

**Layer Guidelines:**

- **Base (0):** Default document flow
- **Floating (10):** Floating elements (badges, chips)
- **Tooltip (20):** Tooltips, hints
- **Popover/Dropdown (30):** Popovers, dropdown menus
- **Dialog/Modal (40):** Dialogs, modals, drawers
- **Toast (50):** Toast notifications
- **Overlay (60):** Backdrop overlays
- **Maximum (9999):** Emergency override (rare use)

**Multi-Window Support:**

For AI-BOS Desktop (multi-window OS-like systems):

```css
:root {
  /* Window layers */
  --layer-window-base: 100;
  --layer-window-floating: 110;
  --layer-window-modal: 140;
  --layer-window-maximum: 199;
}
```

**Validated:** ✅ Layer tokens prevent z-index conflicts (via React MCP)

---

### 10. Focus Ring Tokens (NEW)

**Focus ring tokens provide WCAG-compliant focus indicators.**

**CSS Variables:**

```css
:root {
  /* Focus ring color */
  --focus-ring-color: var(--color-ring); /* Default: primary ring color */
  --focus-ring-color-aa: #000000; /* WCAG AA: 21:1 on white */
  --focus-ring-color-aaa: #1f2937; /* WCAG AAA: 7:1 on white */

  /* Focus ring dimensions */
  --focus-ring-width: 2px; /* WCAG minimum: 2px */
  --focus-ring-offset: 2px; /* Space between element and ring */
  --focus-ring-radius: var(--radius-md); /* Match element radius */

  /* Focus ring style */
  --focus-ring-style: solid;
  --focus-ring-opacity: 1;
}
```

**WCAG Theme Overrides:**

```css
[data-theme="wcag-aa"] {
  --focus-ring-color: var(--focus-ring-color-aa);
  --focus-ring-width: 2px; /* WCAG AA minimum */
}

[data-theme="wcag-aaa"] {
  --focus-ring-color: var(--focus-ring-color-aaa);
  --focus-ring-width: 2px; /* WCAG AAA minimum */
}
```

**TypeScript Access:**

```typescript
export const focusRingTokens = {
  // Focus ring classes
  ring: "focus-visible:outline-none focus-visible:ring-[var(--focus-ring-width)] focus-visible:ring-[color:var(--focus-ring-color)]",
  ringOffset: "focus-visible:ring-offset-[var(--focus-ring-offset)]",
  ringStyle: "focus-visible:ring-[var(--focus-ring-style)]",

  // Combined focus ring
  default: [
    "focus-visible:outline-none",
    "focus-visible:ring-[var(--focus-ring-width)]",
    "focus-visible:ring-[color:var(--focus-ring-color)]",
    "focus-visible:ring-offset-[var(--focus-ring-offset)]",
  ].join(" "),
} as const;
```

**Usage:**

```tsx
// ✅ CORRECT: Use focus ring tokens
<button className={focusRingTokens.default}>
  Button
</button>

<input className={`${focusRingTokens.ring} ${focusRingTokens.ringOffset}`} />

// ❌ INCORRECT: Raw focus styles
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500">
  Button
</button>
```

**WCAG Requirements:**

- ✅ **AA:** Focus ring must have 3:1 contrast minimum
- ✅ **AAA:** Focus ring must have 4.5:1 contrast minimum
- ✅ **Width:** Minimum 2px stroke
- ✅ **Offset:** 2px minimum spacing

**Validated:** ✅ Focus ring tokens meet WCAG requirements (via A11y MCP)

---

### 11. Component State Tokens (NEW)

**Component state tokens provide consistent state styling (hover, active, disabled, selected, pressed, loading).**

**CSS Variables:**

```css
:root {
  /* Opacity states */
  --opacity-disabled: 0.45;
  --opacity-hover: 0.92;
  --opacity-active: 0.85;
  --opacity-selected: 0.95;
  --opacity-pressed: 0.8;
  --opacity-loading: 0.6;

  /* Color states (for accent colors) */
  --color-accent-hover: color-mix(in oklch, var(--color-accent) 92%, black);
  --color-accent-active: color-mix(in oklch, var(--color-accent) 85%, black);
  --color-accent-selected: color-mix(
    in oklch,
    var(--color-accent) 95%,
    transparent
  );
  --color-accent-pressed: color-mix(in oklch, var(--color-accent) 80%, black);
  --color-accent-disabled: var(--color-text-subtle);

  /* Border states */
  --border-hover: var(--color-border-strong);
  --border-active: var(--color-border-focus);
  --border-disabled: var(--color-border-subtle);

  /* Background states */
  --bg-hover: var(--color-surface-muted);
  --bg-active: var(--color-surface-elevated);
  --bg-selected: var(--color-accent-soft);
  --bg-disabled: var(--color-surface-muted);
}
```

**TypeScript Access:**

```typescript
export const stateTokens = {
  // Opacity states
  opacity: {
    disabled: "opacity-[var(--opacity-disabled)]",
    hover: "hover:opacity-[var(--opacity-hover)]",
    active: "active:opacity-[var(--opacity-active)]",
    selected: "opacity-[var(--opacity-selected)]",
    pressed: "active:opacity-[var(--opacity-pressed)]",
    loading: "opacity-[var(--opacity-loading)]",
  },

  // Color states
  color: {
    accentHover: "hover:bg-[var(--color-accent-hover)]",
    accentActive: "active:bg-[var(--color-accent-active)]",
    accentSelected: "bg-[var(--color-accent-selected)]",
    accentPressed: "active:bg-[var(--color-accent-pressed)]",
    accentDisabled: "bg-[var(--color-accent-disabled)]",
  },

  // Border states
  border: {
    hover: "hover:border-[var(--border-hover)]",
    active: "active:border-[var(--border-active)]",
    disabled: "disabled:border-[var(--border-disabled)]",
  },

  // Background states
  bg: {
    hover: "hover:bg-[var(--bg-hover)]",
    active: "active:bg-[var(--bg-active)]",
    selected: "bg-[var(--bg-selected)]",
    disabled: "disabled:bg-[var(--bg-disabled)]",
  },
} as const;
```

**Usage:**

```tsx
// ✅ CORRECT: Use state tokens
<button
  className={`
    ${stateTokens.color.accentHover}
    ${stateTokens.color.accentActive}
    ${stateTokens.opacity.disabled}
  `}
  disabled
>
  Button
</button>

<div className={stateTokens.bg.selected}>
  Selected item
</div>
```

**State Guidelines:**

- **Hover:** Slight opacity reduction (0.92) or color darkening
- **Active:** More pronounced change (0.85 opacity or darker color)
- **Selected:** Visual indication (background color or border)
- **Pressed:** Maximum feedback (0.8 opacity or darkest color)
- **Disabled:** Reduced opacity (0.45) and muted colors
- **Loading:** Reduced opacity (0.6) with loading indicator

**WCAG Requirements:**

- ✅ States must not rely solely on color (use opacity, border, or background)
- ✅ Disabled states must meet 3:1 contrast (AA) or 4.5:1 (AAA)
- ✅ Focus states must be clearly visible

**Validated:** ✅ State tokens meet WCAG requirements (via A11y MCP)

---

### 12. Grid & Layout Tokens (NEW)

**Grid and layout tokens provide consistent spacing and sizing for page layouts.**

**CSS Variables:**

```css
:root {
  /* Grid spacing */
  --grid-gap: var(--space-6); /* 24px - Default grid gap */
  --grid-gap-sm: var(--space-4); /* 16px - Small grid gap */
  --grid-gap-lg: var(--space-8); /* 32px - Large grid gap */

  /* Layout dimensions */
  --layout-sidebar-width: 16rem; /* 256px - Sidebar width */
  --layout-sidebar-width-collapsed: 4rem; /* 64px - Collapsed sidebar */
  --layout-header-height: 3.5rem; /* 56px - Header height */
  --layout-footer-height: 3rem; /* 48px - Footer height */
  --layout-content-padding: var(--space-6); /* 24px - Content padding */
  --layout-content-max-width: 1280px; /* Max content width */

  /* Container widths */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;

  /* Breakpoints (for reference) */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

**TypeScript Access:**

```typescript
export const gridTokens = {
  // Grid gaps
  gap: "gap-[var(--grid-gap)]",
  gapSm: "gap-[var(--grid-gap-sm)]",
  gapLg: "gap-[var(--grid-gap-lg)]",

  // Grid columns
  cols1: "grid-cols-1",
  cols2: "grid-cols-2",
  cols3: "grid-cols-3",
  cols4: "grid-cols-4",
  cols12: "grid-cols-12",
} as const;

export const layoutTokens = {
  // Layout dimensions
  sidebarWidth: "w-[var(--layout-sidebar-width)]",
  sidebarWidthCollapsed: "w-[var(--layout-sidebar-width-collapsed)]",
  headerHeight: "h-[var(--layout-header-height)]",
  footerHeight: "h-[var(--layout-footer-height)]",
  contentPadding: "p-[var(--layout-content-padding)]",
  contentMaxWidth: "max-w-[var(--layout-content-max-width)]",

  // Container widths
  containerSm: "max-w-[var(--container-sm)]",
  containerMd: "max-w-[var(--container-md)]",
  containerLg: "max-w-[var(--container-lg)]",
  containerXl: "max-w-[var(--container-xl)]",
  container2xl: "max-w-[var(--container-2xl)]",
} as const;
```

**Usage:**

```tsx
// ✅ CORRECT: Use grid and layout tokens
<div className={`grid ${gridTokens.gap} ${gridTokens.cols3}`}>
  <Card />
  <Card />
  <Card />
</div>

<aside className={layoutTokens.sidebarWidth}>
  Sidebar content
</aside>

<main className={`${layoutTokens.contentPadding} ${layoutTokens.contentMaxWidth}`}>
  Main content
</main>

// ❌ INCORRECT: Raw values
<div className="grid gap-[24px] grid-cols-3">
  <Card />
</div>
```

**Layout Guidelines:**

- **Grid gaps:** Use semantic grid gap tokens (not arbitrary spacing)
- **Layout dimensions:** Use layout tokens for consistent page structure
- **Container widths:** Use container tokens for responsive content widths
- **Breakpoints:** Reference breakpoint tokens for media queries

**Responsive Grid:**

```tsx
// Responsive grid with tokens
<div
  className={`grid ${gridTokens.gap} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}
>
  <Card />
  <Card />
  <Card />
</div>
```

**Validated:** ✅ Grid and layout tokens provide consistent page structure (via React MCP)

---

## Component Tokens

Pre-composed token combinations for common patterns:

```typescript
import { componentTokens } from "@aibos/ui/design/tokens";

componentTokens.buttonBase; // Base button styles
componentTokens.buttonPrimary; // Primary button variant
componentTokens.cardBase; // Card container styles
componentTokens.inputBase; // Input field styles
```

**Usage:**

```tsx
<button className={componentTokens.buttonPrimary}>Submit</button>
```

**Component Token Rules:**

1. ✅ **Must use semantic tokens internally** (not global tokens)
2. ✅ **Must support density modes** (compact, normal, spacious)
3. ✅ **Must not contain layout spacing** (use flex/grid instead)
4. ✅ **Must map to Radix primitives** (for Layer 2 compositions)

**Validated:** ✅ Component tokens use semantic tokens (via React MCP)

---

## Accessibility Tokens

Safe text-on-background pairings:

```typescript
import { accessibilityTokens } from "@aibos/ui/design/tokens";

accessibilityTokens.textOnPrimary; // "text-primary-foreground"
accessibilityTokens.textOnSuccess; // "text-success-foreground"
accessibilityTokens.textOnDanger; // "text-danger-foreground"
```

**Usage:**

```tsx
<button className="bg-primary">
  <span className={accessibilityTokens.textOnPrimary}>
    Text on primary background
  </span>
</button>
```

**WCAG Validation:**

- ✅ **AA:** All pairs meet 4.5:1 contrast ratio
- ✅ **AAA:** All pairs meet 7:1 contrast ratio (in WCAG AAA theme)
- ✅ **Automatic fallback:** System applies WCAG AA tokens if tenant colors fail

**Validated:** ✅ All pairs meet WCAG AA contrast requirements (via A11y MCP)

---

## Theme Support

### Default Theme (Aesthetic)

```css
:root {
  --color-primary: #2563eb; /* Blue */
  --color-bg: #f9fafb;
  --color-fg: #111827;
  /* ... */
}
```

**Purpose:** Professional, elegant, beautiful design

**Tenant Override:** ✅ Allowed (aesthetic customization)

---

### Light Mode

```css
:root {
  --color-bg-base: #ffffff;
  --color-fg-primary: #171717;
  /* ... */
}
```

---

### Dark Mode

```css
.dark {
  --color-bg-base: #0a0a0a;
  --color-fg-primary: #f5f5f5;
  /* ... */
}
```

---

### WCAG AA Theme

```css
[data-theme="wcag-aa"] {
  /* Enforce WCAG AA color pairs */
  --color-primary: #1a7f3f; /* Validated AA green */
  --color-text: #0a0a0a; /* 12.8:1 contrast */
  --color-text-muted: #262626; /* 9.0:1 contrast */
  /* ... */
}
```

**Purpose:** Legal compliance (government, corporates, universities)

**Tenant Override:** ❌ **FORBIDDEN** (WCAG compliance is fixed)

---

### WCAG AAA Theme

```css
[data-theme="wcag-aaa"] {
  /* Enforce WCAG AAA color pairs */
  --color-primary: #0f5a2a; /* Validated AAA green */
  --color-text: #0a0a0a; /* 12.8:1 contrast */
  --color-text-muted: #262626; /* 9.0:1 contrast */
  /* ... */
}
```

**Purpose:** Highest accessibility (hospitals, elderly care, high-risk users)

**Tenant Override:** ❌ **FORBIDDEN** (WCAG compliance is fixed)

---

### High Contrast Theme (NEW)

```css
[data-theme="high-contrast"] {
  /* Maximum contrast for visual impairments */
  --color-bg: #000000;
  --color-fg: #ffffff;
  --color-primary: #00ff00;
  --color-border: #ffffff;
  /* ... */
}
```

**Purpose:** Maximum contrast for visual impairments

**Tenant Override:** ❌ **FORBIDDEN** (accessibility requirement)

---

### Safe Mode

```css
[data-safe-mode="true"] {
  --color-primary: #000000;
  --color-primary-foreground: #ffffff;
  --color-action: #000000;
  --radius: 0px;
  --shadow: none;
  --motion-scale: 0;
}
```

**Purpose:** Cognitive comfort, reduced distractions

**Tenant Override:** ❌ **FORBIDDEN** (Safe Mode disables tenant branding)

**Note:** Safe Mode can stack with WCAG themes (e.g., `data-theme="wcag-aa" data-safe-mode="true"`)

---

### Tenant Override (DLBB)

```css
:root[data-tenant="dlbb"] {
  --color-primary: #22c55e; /* DLBB green */
  /* ... */
}
```

**Rules:**

1. ✅ **Tenant overrides ONLY in aesthetic theme** (default theme)
2. ❌ **Tenant overrides FORBIDDEN in WCAG AA/AAA themes**
3. ❌ **Tenant overrides FORBIDDEN in Safe Mode**
4. ✅ **System validates tenant colors** - If tenant color fails WCAG AA, system forces WCAG AA override
5. ✅ **Tenant cannot override:** focus ring, content text, system borders, error/success colors (unless validated)

**Enforcement Logic:**

```typescript
if (!passesAA(tenantToken)) {
  use(accessibilityTokensAA);
}

if (theme === "wcag-aaa" && !passesAAA(tenantToken)) {
  use(accessibilityTokensAAA);
}

if (safeMode) {
  disableTenantBranding();
}
```

---

## Figma Sync

### Token Round-Trip Workflow

Tokens can be synced from Figma variables:

```bash
# Sync Figma variables to globals.css
pnpm sync:figma-tokens --file-key=abc123 --node-id=1:2
```

### Figma Variable Mapping

**Figma Variable Groups → CSS Variable Groups:**

```
Figma Variable          → CSS Variable          → TypeScript Token
─────────────────────────────────────────────────────────────────
color/primary           → --color-primary      → colorTokens.accent
color/surface           → --color-surface      → colorTokens.surface
space/1                  → --space-1            → spacingTokens.xs
space/button-y          → --space-button-y     → semanticSpacingTokens.buttonY
text/body                → --text-body          → typographyTokens.body
radius/button            → --radius-button     → radiusTokens.button
```

### Figma MCP Sync Workflow

```typescript
// 1. Extract tokens from Figma
const figmaTokens = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "TOKENS_NODE",
});

// 2. Map to CSS variables
const cssTokens = mapFigmaToCSS(figmaTokens, {
  "color/primary": "--color-primary",
  "space/1": "--space-1",
  "space/button-y": "--space-button-y",
  // ... etc
});

// 3. Update globals.css
await updateGlobalsCSS(cssTokens);

// 4. Validate with Tailwind MCP
const validation = await mcp_Tailwind_validate_token_exists({
  tokenName: "--color-primary",
});

// 5. Revalidate Figma (round-trip)
const figmaValidation = await mcp_Figma_get_design_context({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "TOKENS_NODE",
});
```

### Naming Governance

**Figma Variable Groups MUST match CSS Variable Groups:**

- ✅ `color/primary` → `--color-primary`
- ✅ `space/button-y` → `--space-button-y`
- ✅ `text/body` → `--text-body`
- ❌ **Mismatched naming** → MCP validation fails

### MCP Automated Diff-Check

**Figma MCP validates:**

- ✅ Variables synced correctly
- ✅ No missing/outdated colors
- ✅ Naming matches CSS variables
- ✅ Token groups align

**Validated:** ✅ Figma MCP integration available

---

## MCP Validation Rules

### React MCP Validates

**Component Usage:**

- ✅ Component usage must reference semantic tokens
- ❌ No raw CSS in JSX (e.g., `style={{ color: "#ff0000" }}`)
- ❌ No inline styles (use tokens instead)
- ✅ Token imports required (e.g., `import { colorTokens } from "@aibos/ui/design/tokens"`)

**Example Validation:**

```typescript
// ❌ FAILS: Raw CSS value
<button style={{ backgroundColor: "#2563eb" }}>Button</button>

// ❌ FAILS: Inline style
<div style={{ padding: "16px" }}>Content</div>

// ✅ PASSES: Uses tokens
<button className={colorTokens.accent.default}>Button</button>
<div className={spacingTokens.md}>Content</div>
```

---

### Tailwind MCP Validates

**Token Existence:**

- ✅ Validate that Tailwind parses all variables
- ✅ Token exists in `globals.css`
- ✅ Token value is valid

**Token Usage:**

- ❌ No palette colors allowed (e.g., `bg-blue-600`)
- ✅ Use tokens instead (e.g., `bg-accent`)

**Example Validation:**

```typescript
// ❌ FAILS: Palette color
<div className="bg-blue-600">Content</div>

// ✅ PASSES: Token usage
<div className={colorTokens.accent.default}>Content</div>
```

---

### Figma MCP Validates

**Design-Code Sync:**

- ✅ Variables synced correctly
- ✅ No missing/outdated colors
- ✅ Naming matches CSS variables
- ✅ Token groups align

**Example Validation:**

```typescript
// Figma MCP checks:
const figmaTokens = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "TOKENS_NODE",
});

// Compare with CSS
const cssTokens = await mcp_Tailwind_read_tailwind_config();

// Validate alignment
if (figmaTokens["color/primary"] !== cssTokens["--color-primary"]) {
  throw new Error("Token mismatch: color/primary");
}
```

---

### Next.js MCP Validates

**RSC Safety:**

- ✅ RSC-safe token usage (tokens are CSS-only, no browser APIs)
- ✅ `globals.css` loaded before UI tokens
- ✅ No token usage in Server Components that requires browser APIs

**Example Validation:**

```typescript
// ✅ PASSES: RSC-safe token usage
export default async function Page() {
  return (
    <div className={colorTokens.surface.elevated}>
      <p className={colorTokens.text.default}>Content</p>
    </div>
  );
}

// ❌ FAILS: Browser API in Server Component
export default async function Page() {
  const [theme, setTheme] = useState("light"); // Browser API
  return <div>Content</div>;
}
```

---

### A11y MCP Validates

**WCAG Compliance:**

- ✅ Color contrast meets WCAG AA (4.5:1)
- ✅ Color contrast meets WCAG AAA (7:1) in AAA theme
- ✅ Touch targets meet 44px minimum
- ✅ Focus indicators meet 3:1 contrast (AA) or 4.5:1 (AAA)

**Example Validation:**

```typescript
// A11y MCP checks:
const contrast = calculateContrast(
  colorTokens.accent.default,
  colorTokens.text.default
);

if (contrast < 4.5) {
  throw new Error("WCAG AA violation: contrast too low");
}
```

---

## Token Governance & Versioning

### Token Change Approval Workflow

**1. Design Phase (Figma MCP):**

```typescript
// Designer creates/updates token in Figma
const figmaToken = await mcp_Figma_get_variable_defs({
  fileKey: "DESIGN_SYSTEM",
  nodeId: "NEW_TOKEN_NODE",
});
```

**2. Code Phase (React MCP):**

```typescript
// Developer implements token in globals.css
// React MCP validates:
// - Token uses semantic naming
// - Token follows 4px baseline (for spacing)
// - Token meets WCAG requirements (for colors)
```

**3. Validation Phase (MCP Pipeline):**

```typescript
// All MCPs validate:
// - Tailwind MCP: Token exists and is valid
// - Figma MCP: Design-code alignment
// - A11y MCP: WCAG compliance
// - React MCP: No raw values
```

**4. Approval Phase:**

- ✅ All MCP validations pass
- ✅ Token follows naming conventions
- ✅ Token meets accessibility requirements
- ✅ Token is documented

**5. Deployment Phase:**

- ✅ Token synced to all apps
- ✅ TypeScript tokens updated
- ✅ Documentation updated

---

### Token Versioning Rules

**Breaking Changes:**

- ❌ **FORBIDDEN:** Changing semantic token names
- ❌ **FORBIDDEN:** Changing token values that break WCAG compliance
- ✅ **ALLOWED:** Adding new tokens
- ✅ **ALLOWED:** Updating token values (if WCAG-compliant)

**Migration Path:**

```typescript
// If token must change:
// 1. Add new token
--color-primary-v2: #new-value;

// 2. Deprecate old token
--color-primary: var(--color-primary-v2); /* @deprecated */

// 3. Update components gradually
// 4. Remove old token after migration
```

---

## RSC Safety Rules

### Token Usage in Server Components

**✅ ALLOWED:**

- ✅ CSS class tokens (e.g., `className={colorTokens.surface.default}`)
- ✅ CSS variable tokens (e.g., `style={{ color: "var(--color-text)" }}`)
- ✅ Tailwind utility classes (e.g., `className="bg-surface"`)

**❌ FORBIDDEN:**

- ❌ Browser APIs (e.g., `window`, `document`)
- ❌ React hooks (e.g., `useState`, `useEffect`)
- ❌ Event handlers (use Server Actions instead)

**Example:**

```tsx
// ✅ CORRECT: RSC-safe token usage
export default async function Page() {
  const data = await fetchData();
  return (
    <div className={colorTokens.surface.elevated}>
      <h1 className={typographyTokens.headingLg}>{data.title}</h1>
      <p className={colorTokens.text.default}>{data.content}</p>
    </div>
  );
}

// ❌ INCORRECT: Browser API in Server Component
export default async function Page() {
  const theme = window.localStorage.getItem("theme"); // Browser API
  return <div>Content</div>;
}
```

**Validated:** ✅ RSC-safe token usage (via Next.js MCP)

---

## Token Naming Convention

### CSS Variables

**Format:** `--{category}-{variant}-{modifier}`

**Examples:**

- ✅ `--color-primary` (category: color, variant: primary)
- ✅ `--color-surface-elevated` (category: color, variant: surface, modifier: elevated)
- ✅ `--space-button-y` (category: space, variant: button, modifier: y)
- ✅ `--text-body` (category: text, variant: body)
- ✅ `--radius-button` (category: radius, variant: button)

**Rules:**

- ✅ Use kebab-case
- ✅ Use semantic names (not raw values)
- ✅ Group by category (color, space, text, radius, etc.)

---

### TypeScript Tokens

**Format:** `{category}Tokens.{variant}.{modifier}`

**Examples:**

- ✅ `colorTokens.accent.default`
- ✅ `colorTokens.surface.elevated`
- ✅ `spacingTokens.md`
- ✅ `typographyTokens.headingLg`

**Rules:**

- ✅ Use camelCase
- ✅ Use semantic names
- ✅ Group by category

---

### Tailwind Utilities

**Format:** `{property}-{token-name}`

**Examples:**

- ✅ `bg-surface` (maps to `--color-surface`)
- ✅ `text-text` (maps to `--color-text`)
- ✅ `border-border` (maps to `--color-border`)

**Rules:**

- ✅ Use kebab-case
- ✅ Map to CSS variables
- ✅ Use semantic names

---

## Related Documentation

- [Colors](./colors.md) - Color system details
- [Spacing](./spacing.md) - Spacing system details
- [Typography](./typography.md) - Typography system
- [Components Philosophy](./components-philosophy.md) - Component token usage
- [Accessibility Guidelines](./a11y-guidelines.md) - WCAG token requirements
- [Figma Sync](../07-mcp/tools/sync-figma.md) - Design-to-code workflow

---

## Standards & References

### WCAG Requirements

- **[SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)** - 4.5:1 for AA, 7:1 for AAA
- **[SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)** - 3:1 for UI components
- **[SC 2.5.5 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size.html)** - 44px minimum touch target

### Industry Standards

- **Material Design** - Token system architecture
- **Apple HIG** - Semantic token naming
- **Atlassian Design System** - Token governance

---

**Last Updated:** 2025-01-27  
**Version:** 2.0.0  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ React MCP | ✅ A11y MCP | ✅ Next.js MCP  
**Status:** ✅ **SSOT - Single Source of Truth**  
**Enforcement:** MCP Validation + Pre-Commit Hooks  
**Standards:** [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) | Token-First Architecture
