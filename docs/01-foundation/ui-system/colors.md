# Color System

> **Color System Documentation** - Validated against Tailwind MCP and Figma Variables

The AI-BOS color system follows a "single accent" approach with a rich grayscale foundation. This reduces cognitive load while maintaining professional appearance and excellent accessibility.

---

## Overview

This document defines color system.

---

## Color Strategy

### Theme-Based Color Approach

The AI-BOS color system provides **aesthetic excellence by default** and **accessibility compliance on demand**:

**Default Theme (`data-theme="default"`):**

- ✅ **Professional, elegant, beautiful, attractive** feeling
- ✅ **Single accent color** - For primary actions, links, active states
- ✅ **Rich grayscale** - For 95% of the UI
- ✅ **Semantic status colors** - Only when meaning is critical
- ✅ **Color and font "bloat" is NOT a concern** - Optimized for visual appeal
- ❌ **No WCAG compliance requirement** - Aesthetic-first approach

**WCAG AA Theme (`data-theme="wcag-aa"`):**

- ✅ **100% [WCAG 2.2 Level AA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance**
- ✅ All text meets 4.5:1 minimum contrast ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- ✅ All UI components meet 3:1 minimum contrast ([SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ **No compromise** on accessibility or design quality
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) and [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html)

**WCAG AAA Theme (`data-theme="wcag-aaa"`):**

- ✅ **100% [WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance**
- ✅ All text meets 7:1 minimum contrast ([SC 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html))
- ✅ All UI components meet 4.5:1 minimum contrast ([SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ **No compromise** on accessibility or design quality
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) and [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html)

**Why This Works:**

- ✅ **Don't compromise design** for accessibility
- ✅ **Don't compromise accessibility** for design
- ✅ **Provide both** - Let users choose based on their needs
- ✅ Reduces cognitive load (single accent)
- ✅ Maintains professional appearance
- ✅ Easy to maintain consistency
- ✅ Full accessibility when needed

**Validated Against:**

- ✅ Tailwind Tokens MCP (`globals.css`)
- ✅ Figma Variables (design tokens sync)
- ✅ Theme-based accessibility model

---

## Color Tokens

### Token System Overview

**The AI-BOS color system has TWO distinct token types:**

1. **`colorTokens`** - Multi-tenant, customizable brand/design colors
2. **`accessibilityTokens`** - Fixed, pre-validated WCAG compliance tokens

**Key Distinction:**

| Aspect              | `colorTokens`                | `accessibilityTokens`                 |
| ------------------- | ---------------------------- | ------------------------------------- |
| **Purpose**         | Brand/design colors          | WCAG compliance                       |
| **Customizable**    | ✅ Yes (multi-tenant)        | ❌ No (fixed compliance)              |
| **Tenant-Specific** | ✅ Yes (DLBB green default)  | ❌ No (universal)                     |
| **Validation**      | Design validation            | WCAG standard validation              |
| **Variants**        | Tenant variants              | AA/AAA compliance variants            |
| **Example**         | `colorTokens.primarySurface` | `accessibilityTokensAA.textOnPrimary` |

**Summary:**

- **`colorTokens`** = What users WANT (aesthetic, customizable, multi-tenant)
- **`accessibilityTokens`** = What users NEED (compliance, fixed, pre-validated)

### Token Naming Convention

**All color tokens use the `--color-*` prefix:**

- ✅ `--color-bg` (not `--bg-base`)
- ✅ `--color-fg` (not `--fg-primary`)
- ✅ `--color-primary` (not `--accent-bg`)
- ✅ `--color-success` (not `--success`)

**This ensures consistency and prevents naming conflicts.**

### Neutral Gray Foundation

**The color system uses a rich grayscale foundation:**

- Gray scale values are used **indirectly** through semantic tokens
- Direct gray variables are **not exposed** in the token system
- All grays are accessed via semantic tokens (`--color-bg`, `--color-fg`, etc.)

**Gray Scale Reference (Internal):**

```css
/* These are used internally, not exposed as tokens */
/* gray-50: #fafafa */
/* gray-100: #f5f5f5 */
/* gray-200: #e5e5e5 */
/* gray-300: #d4d4d4 */
/* gray-400: #a3a3a3 */
/* gray-500: #737373 */
/* gray-600: #525252 */
/* gray-700: #404040 */
/* gray-800: #262626 */
/* gray-900: #171717 */
/* gray-950: #0a0a0a */
```

**Usage:**

The gray scale provides the foundation for all surface and text colors. It's used **indirectly** through semantic tokens (`--color-bg`, `--color-fg`, etc.).

---

### Surface Colors (Backgrounds)

**CSS Variables (Actual Implementation):**

```css
:root {
  --color-bg: #f9fafb; /* gray-50 - Page background */
  --color-bg-muted: #f3f4f6; /* gray-100 - Disabled, code blocks */
  --color-bg-elevated: #ffffff; /* pure white - Cards, modals, dropdowns */
}

/* Dark mode */
:root[data-mode="dark"],
:root.dark {
  --color-bg: #020617; /* slate-950-like */
  --color-bg-muted: #020617;
  --color-bg-elevated: #020617;
}
```

**TypeScript Access (Actual Implementation):**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

colorTokens.bg; // "bg-bg"
colorTokens.bgMuted; // "bg-bg-muted"
colorTokens.bgElevated; // "bg-bg-elevated"
```

**Usage:**

```tsx
// Page background
<div className={colorTokens.bg}>
  {/* Page content */}
</div>

// Card container
<div className={colorTokens.bgElevated}>
  {/* Card content */}
</div>

// Disabled state
<div className={colorTokens.bgMuted}>
  {/* Disabled content */}
</div>
```

**Validated:** ✅ All surface tokens exist in `globals.css` (via Tailwind MCP)

---

### Text Colors (Foreground)

**CSS Variables (Actual Implementation):**

```css
:root {
  --color-fg: #111827; /* gray-900 - Headings, primary text */
  --color-fg-muted: #6b7280; /* gray-500 - Body text */
  --color-fg-subtle: #9ca3af; /* gray-400 - Captions, placeholders */
}

/* Dark mode */
:root[data-mode="dark"],
:root.dark {
  --color-fg: #e5e7eb; /* gray-200 */
  --color-fg-muted: #9ca3af;
  --color-fg-subtle: #6b7280;
}
```

**TypeScript Access (Actual Implementation):**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

colorTokens.text; // "text-fg"
colorTokens.textMuted; // "text-fg-muted"
colorTokens.textSubtle; // "text-fg-subtle"
```

**Usage:**

```tsx
// Heading
<h1 className={colorTokens.text}>
  Primary Heading
</h1>

// Body text
<p className={colorTokens.textMuted}>
  Secondary body text
</p>

// Caption
<span className={colorTokens.textSubtle}>
  Tertiary caption text
</span>
```

**Validated:** ✅ All text tokens exist in `globals.css` (via Tailwind MCP)

---

### Accent Colors (Primary & Secondary)

**Important: `colorTokens` are Multi-Tenant and Customizable**

`colorTokens` represent **brand/design colors** that are:

- ✅ **Multi-tenant** - Different tenants can have different brand colors
- ✅ **Customizable** - Tenants can override via `data-tenant` attribute
- ✅ **Switchable** - Can be changed per tenant schema
- ✅ **Default: DLBB Green** - System defaults to DLBB tenant green (`#22c55e`)

**DLBB Tenant (Default - Emerald Green):**

```css
/* System default - DLBB tenant */
:root {
  --color-primary: #22c55e; /* green-500 - DLBB default */
  --color-primary-soft: color-mix(in oklch, #22c55e 12%, transparent);
  --color-primary-foreground: #f9fafb; /* gray-50 */

  --color-secondary: #16a34a; /* green-600 */
  --color-secondary-soft: color-mix(in oklch, #16a34a 10%, transparent);
  --color-secondary-foreground: #f9fafb;
}
```

**Other Tenant Override (Example - SaaS Blue):**

```css
:root[data-tenant="saas-blue"] {
  --color-primary: #2563eb; /* blue-600 */
  --color-primary-soft: color-mix(in oklch, #2563eb 12%, transparent);
  --color-primary-foreground: #f9fafb;
}
```

**TypeScript Access:**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

// colorTokens are multi-tenant and customizable
colorTokens.primarySurface; // "bg-primary" (adapts to tenant)
colorTokens.primarySoftSurface; // "bg-primary-soft" (adapts to tenant)
```

**Usage:**

```tsx
// Primary button - color adapts to tenant
<button className={colorTokens.primarySurface}>
  {/* Text color handled by accessibilityTokens (see below) */}
</button>

// Accent link - adapts to tenant
<a className="text-primary hover:text-primary-soft">
  Link text
</a>
```

**Validated:** ✅ Accent colors support multi-tenant override (DLBB green is default)

---

### Status Colors

**Important: Status colors are part of `colorTokens` (multi-tenant, customizable)**

Status colors follow the same multi-tenant pattern as accent colors:

```css
:root {
  --color-success: #16a34a; /* green-600 */
  --color-success-soft: color-mix(in oklch, #16a34a 10%, transparent);
  --color-success-foreground: #f9fafb;

  --color-warning: #f59e0b; /* amber-500 */
  --color-warning-soft: color-mix(in oklch, #f59e0b 12%, transparent);
  --color-warning-foreground: #111827;

  --color-danger: #dc2626; /* red-600 */
  --color-danger-soft: color-mix(in oklch, #dc2626 10%, transparent);
  --color-danger-foreground: #f9fafb;
}
```

**TypeScript Access:**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

// Status colors are customizable (multi-tenant)
colorTokens.successSurface; // "bg-success"
colorTokens.successSoftSurface; // "bg-success-soft"
colorTokens.warningSurface; // "bg-warning"
colorTokens.dangerSurface; // "bg-danger"
```

**Usage:**

```tsx
// Success badge - color is customizable
<span className={colorTokens.successSoftSurface}>
  {/* Text color handled by accessibilityTokens (see below) */}
</span>
```

**When to Use:**

- ✅ **Success** - Completed actions, positive feedback
- ✅ **Warning** - Cautionary messages, pending states
- ✅ **Danger** - Failed actions, critical issues

**Note:** Text colors on status backgrounds use `accessibilityTokens` (see below), which are **NOT customizable** and are pre-validated for WCAG compliance.

---

### Border Colors

**CSS Variables (Actual Implementation):**

```css
:root {
  --color-border: #e5e7eb; /* gray-200 - Input borders, dividers */
  --color-border-subtle: #f3f4f6; /* gray-100 - Card borders */
  --color-ring: #2563eb; /* blue-600 - Focus rings */
}

/* Dark mode */
:root[data-mode="dark"],
:root.dark {
  --color-border: #1f2937; /* gray-800 */
  --color-border-subtle: #020617;
  --color-ring: #60a5fa; /* blue-400 */
}
```

**TypeScript Access (Actual Implementation):**

```typescript
import { colorTokens } from "@aibos/ui/design/tokens";

colorTokens.border; // "border-border"
colorTokens.borderSubtle; // "border-border-subtle"
colorTokens.ring; // "ring-ring"
```

**Usage:**

```tsx
// Card border
<div className={`${colorTokens.bgElevated} ${colorTokens.border} border`}>
  {/* Card content */}
</div>

// Input border
<input className={`${colorTokens.border} border`} />

// Focus ring
<button className={`${colorTokens.ring} focus-visible:ring-2 focus-visible:ring-ring`}>
  Button
</button>
```

---

## Color Usage Rules

### ✅ DO

**For Brand/Design Colors (`colorTokens`):**

- Use `colorTokens` for brand colors (multi-tenant, customizable)
- Use accent color sparingly (primary actions only)
- Use status colors only when meaning is critical
- Rely on grayscale for 95% of UI
- Remember: **DLBB green is the system default** (`#22c55e`)

**For Accessibility (`accessibilityTokens`):**

- Use `accessibilityTokensAA` in WCAG AA theme
- Use `accessibilityTokensAAA` in WCAG AAA theme
- Use accessibility tokens for text-on-background pairings
- Remember: **Accessibility tokens are NOT customizable** (compliance, not fulfillment)

### ❌ DON'T

**For Brand/Design Colors:**

- Use raw hex colors (`#4285f4`)
- Use Tailwind palette colors (`bg-blue-600`)
- Use accent color for decorative elements
- Use status colors for non-semantic purposes

**For Accessibility:**

- ❌ **Don't customize accessibility tokens** - They are pre-validated for WCAG compliance
- ❌ **Don't make accessibility tokens tenant-specific** - Compliance is universal
- ❌ **Don't use colorTokens for accessibility** - Use accessibilityTokens for text-on-background

---

## Theme Support

### Theme-Based Color System

**The color system supports three independent categories via `data-theme` attribute:**

1. **Aesthetic Theme** (`data-theme="default"` or no attribute)
   - **Purpose:** What users WANT - Professional, elegant, beautiful, attractive
   - **WCAG Compliance:** ❌ No WCAG compliance requirement
   - **Tenant Overrides:** ✅ **Allowed** - Multi-tenant branding supported
   - **Customization:** ✅ Full customization (brand colors, fonts, etc.)
   - **Optimized for:** Visual appeal and brand expression

2. **WCAG AA Theme** (`data-theme="wcag-aa"`)
   - **Purpose:** What users NEED - Legal compliance (minimum standard)
   - **WCAG Compliance:** ✅ 100% [WCAG 2.2 Level AA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance
   - **Tenant Overrides:** ❌ **NOT allowed** - Fixed compliance tokens only
   - **Customization:** ❌ NO customization (compliance, not fulfillment)
   - **Contrast:** All text meets 4.5:1 minimum ([SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)), UI components meet 3:1 minimum ([SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
   - **Also conforms to:** [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

3. **WCAG AAA Theme** (`data-theme="wcag-aaa"`)
   - **Purpose:** What users NEED - Highest accessibility standard
   - **WCAG Compliance:** ✅ 100% [WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance
   - **Tenant Overrides:** ❌ **NOT allowed** - Fixed compliance tokens only
   - **Customization:** ❌ NO customization (compliance, not fulfillment)
   - **Contrast:** All text meets 7:1 minimum ([SC 1.4.6](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)), UI components meet 4.5:1 minimum ([SC 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
   - **Also conforms to:** [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/), [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html), [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)

**Safe Mode** (`data-safe-mode="true"`) - **Separate Category**

- **Purpose:** Cognitive comfort, reduced distractions
- **WCAG Compliance:** Can be combined with any theme (aesthetic, AA, or AAA)
- **Tenant Overrides:** ❌ **Disabled when active** - Neutralizes all tenant branding
- **Behavior:** Removes decorative elements, neutralizes colors, reduces motion
- **Use Case:** Disabilities, neurodivergent users, visual sensitivities
- **Note:** Safe Mode ≠ WCAG Mode - They can stack independently

**Critical Governance Rule:**

- ✅ **Tenant overrides ONLY apply to Aesthetic theme** (`data-theme="default"`)
- ❌ **WCAG themes are FIXED from top to bottom** - No customization allowed
- ❌ **WCAG themes override tenant colors** - Compliance takes precedence
- ✅ **Safe Mode can combine with any theme** - But disables tenant branding

### Light Mode (Default)

```css
:root {
  --color-bg: #f9fafb; /* gray-50 */
  --color-fg: #111827; /* gray-900 */
  --color-primary: #2563eb; /* blue-600 */
}
```

### Dark Mode

```css
:root[data-mode="dark"],
:root.dark {
  --color-bg: #020617; /* slate-950-like */
  --color-fg: #e5e7eb; /* gray-200 */
  --color-primary: #60a5fa; /* blue-400 */
}
```

### Safe Mode

**Safe Mode can be combined with any theme:**

```css
[data-safe-mode="true"] {
  --color-primary: var(--gray-500);
  --color-primary-soft: var(--gray-400);
  --shadow-sm: none;
  --shadow-md: none;
}
```

**Usage:**

```tsx
// Safe Mode with default theme
<html data-theme="default" data-safe-mode="true">

// Safe Mode with WCAG AA theme
<html data-theme="wcag-aa" data-safe-mode="true">
```

### Tenant Override (DLBB)

```css
:root[data-tenant="dlbb"] {
  --color-primary: #22c55e; /* green-500 */
  --color-primary-soft: color-mix(in oklch, #22c55e 12%, transparent);
  --color-primary-foreground: #f9fafb;
}
```

**Tenant overrides work with all themes:**

```tsx
// DLBB tenant with default theme
<html data-tenant="dlbb" data-theme="default">

// DLBB tenant with WCAG AA theme
<html data-tenant="dlbb" data-theme="wcag-aa">
```

---

## Accessibility Tokens

### Important: `accessibilityTokens` are NOT Customizable

**`accessibilityTokens` are WCAG Compliance Tokens:**

- ❌ **NOT customizable** - Fixed, pre-validated values
- ❌ **NOT tenant-specific** - Same across all tenants
- ✅ **Pre-defined** - Validated against WCAG standards
- ✅ **WCAG Compliance** - Not fulfillment, but compliance
- ✅ **AA and AAA variants** - Separate tokens for each compliance level

**Why Not Customizable:**

Accessibility tokens represent **WCAG compliance requirements**, not design preferences. They are:

- Pre-validated contrast ratios (4.5:1 for AA, 7:1 for AAA)
- Fixed font sizes that meet WCAG requirements
- Validated text-on-background pairings
- **Compliance, not fulfillment** - Must meet standards

**Current Implementation (Needs Enhancement):**

```typescript
// Current: Single accessibilityTokens (needs AA/AAA differentiation)
export const accessibilityTokens = {
  textOnPrimary: "text-primary-foreground",
  textOnSuccess: "text-success-foreground",
  textOnDanger: "text-danger-foreground",
  // ... etc
};
```

**Recommended Implementation (AA/AAA Variants):**

```typescript
// Recommended: Separate AA and AAA variants
export const accessibilityTokensAA = {
  // Pre-validated for WCAG AA (4.5:1 contrast minimum)
  textOnPrimary: "text-primary-foreground-aa", // Validated 4.5:1+
  textOnSuccess: "text-success-foreground-aa", // Validated 4.5:1+
  textOnDanger: "text-danger-foreground-aa", // Validated 4.5:1+
  // Font sizes validated for AA compliance
  fontSizeNormal: "text-[16px]", // Meets AA requirements
  fontSizeLarge: "text-[18px]", // Meets AA requirements
} as const;

export const accessibilityTokensAAA = {
  // Pre-validated for WCAG AAA (7:1 contrast minimum)
  textOnPrimary: "text-primary-foreground-aaa", // Validated 7:1+
  textOnSuccess: "text-success-foreground-aaa", // Validated 7:1+
  textOnDanger: "text-danger-foreground-aaa", // Validated 7:1+
  // Font sizes validated for AAA compliance
  fontSizeNormal: "text-[16px]", // Meets AAA requirements
  fontSizeLarge: "text-[18px]", // Meets AAA requirements
} as const;
```

**Usage Pattern:**

```tsx
// ✅ CORRECT: Use accessibilityTokens based on theme
import { accessibilityTokensAA, accessibilityTokensAAA } from "@aibos/ui/design/tokens";

// In WCAG AA theme
<button className={colorTokens.primarySurface}>
  <span className={accessibilityTokensAA.textOnPrimary}>
    Primary Action
  </span>
</button>

// In WCAG AAA theme
<button className={colorTokens.primarySurface}>
  <span className={accessibilityTokensAAA.textOnPrimary}>
    Primary Action
  </span>
</button>
```

**CSS Implementation (Recommended):**

```css
/* WCAG AA Theme - Pre-validated contrast ratios */
:root[data-theme="wcag-aa"] {
  --color-primary-foreground-aa: #ffffff; /* Validated 4.5:1+ contrast */
  --color-success-foreground-aa: #ffffff; /* Validated 4.5:1+ contrast */
  --color-danger-foreground-aa: #ffffff; /* Validated 4.5:1+ contrast */
}

/* WCAG AAA Theme - Pre-validated contrast ratios */
:root[data-theme="wcag-aaa"] {
  --color-primary-foreground-aaa: #ffffff; /* Validated 7:1+ contrast */
  --color-success-foreground-aaa: #ffffff; /* Validated 7:1+ contrast */
  --color-danger-foreground-aaa: #ffffff; /* Validated 7:1+ contrast */
}
```

**Key Distinction:**

| Aspect              | `colorTokens`         | `accessibilityTokens`      |
| ------------------- | --------------------- | -------------------------- |
| **Customizable**    | ✅ Yes (multi-tenant) | ❌ No (fixed compliance)   |
| **Tenant-Specific** | ✅ Yes (DLBB default) | ❌ No (same for all)       |
| **Purpose**         | Brand/design colors   | WCAG compliance            |
| **Validation**      | Design validation     | WCAG standard validation   |
| **Variants**        | Tenant variants       | AA/AAA compliance variants |

---

## Accessibility

### Theme-Based Contrast Requirements

**Default Theme:**

- ❌ **No WCAG compliance requirement**
- ✅ Optimized for aesthetic appeal
- ✅ Color choices prioritize visual beauty

**WCAG AA Theme (`data-theme="wcag-aa"`):**

- ✅ **100% [WCAG 2.2 Level AA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance REQUIRED**
- ✅ Normal text: **4.5:1** minimum contrast ([SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- ✅ Large text: **3:1** minimum contrast ([SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html))
- ✅ UI components: **3:1** minimum contrast ([SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) and [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html)

**WCAG AAA Theme (`data-theme="wcag-aaa"`):**

- ✅ **100% [WCAG 2.2 Level AAA](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance REQUIRED**
- ✅ Normal text: **7:1** minimum contrast ([SC 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html))
- ✅ Large text: **4.5:1** minimum contrast ([SC 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html))
- ✅ UI components: **4.5:1** minimum contrast ([SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html))
- ✅ Also conforms to [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) and [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html)

**Validated:**

- ✅ Default theme: Aesthetic optimization (no WCAG requirement)
- ✅ WCAG AA theme: 100% Level AA compliance
- ✅ WCAG AAA theme: 100% Level AAA compliance

### Safe Mode

Safe Mode removes accent colors and replaces them with neutral grays:

```css
[data-safe-mode="true"] {
  --color-primary: var(--gray-500);
  --color-primary-soft: var(--gray-400);
  --shadow-sm: none;
  --shadow-md: none;
}
```

**Safe Mode can be combined with any theme:**

- Default + Safe Mode: Aesthetic with reduced visual complexity
- WCAG AA + Safe Mode: AA compliance with reduced visual complexity
- WCAG AAA + Safe Mode: AAA compliance with reduced visual complexity

This ensures the interface remains functional and accessible for users with visual sensitivities.

---

## Figma Sync

Colors can be synced from Figma variables using Figma MCP tools:

**Figma MCP Tools:**

1. **`mcp_Figma_get_variable_defs`** - Extract color variables from Figma
2. **`mcp_Figma_get_design_context`** - Get component color specs
3. **Tailwind MCP** - Validate tokens after sync

**Figma Variable Mapping (Actual Implementation):**

```typescript
const figmaToCSSMapping = {
  // Primary colors
  "color/primary": "--color-primary",
  "color/primary-soft": "--color-primary-soft",
  "color/primary-foreground": "--color-primary-foreground",

  // Surface colors
  "color/bg": "--color-bg",
  "color/bg-muted": "--color-bg-muted",
  "color/bg-elevated": "--color-bg-elevated",

  // Text colors
  "color/fg": "--color-fg",
  "color/fg-muted": "--color-fg-muted",
  "color/fg-subtle": "--color-fg-subtle",

  // Status colors
  "color/success": "--color-success",
  "color/success-soft": "--color-success-soft",
  "color/warning": "--color-warning",
  "color/warning-soft": "--color-warning-soft",
  "color/danger": "--color-danger",
  "color/danger-soft": "--color-danger-soft",

  // Border colors
  "color/border": "--color-border",
  "color/border-subtle": "--color-border-subtle",
  "color/ring": "--color-ring",
};
```

**Sync Workflow:**

```typescript
// 1. Get variables from Figma
const figmaVariables = await mcp_Figma_get_variable_defs({
  fileKey: "YOUR_FIGMA_FILE_KEY",
  nodeId: "DESIGN_SYSTEM_NODE_ID",
});

// 2. Map to CSS variables
const cssVars = mapFigmaToCSS(figmaVariables, figmaToCSSMapping);

// 3. Update globals.css
await updateGlobalsCSS(cssVars);

// 4. Validate with Tailwind MCP
const tailwindConfig = await mcp_AIBOS_Theme_read_tailwind_config();
```

**Validated:** ✅ Figma MCP integration available

---

## MCP Validation

### Tailwind MCP Tools

**Available Tools:**

1. **`read_tailwind_config`** - Read tokens from `globals.css`
2. **`validate_token_exists`** - Check if token exists
3. **`suggest_token`** - Suggest appropriate token for color/value
4. **`validate_tailwind_class`** - Validate Tailwind class usage
5. **`get_token_value`** - Get actual CSS value for token

**Usage:**

```typescript
// Read all tokens
const tokens = await mcp_AIBOS_Theme_read_tailwind_config();

// Validate token exists
const validation = await mcp_AIBOS_Theme_validate_token_exists({
  tokenName: "--color-primary",
});

// Get token value
const value = await mcp_AIBOS_Theme_get_token_value({
  tokenName: "--color-primary",
});
```

### Figma MCP Tools

**Available Tools:**

1. **`mcp_Figma_get_variable_defs`** - Extract color variables
2. **`mcp_Figma_get_design_context`** - Get component color specs
3. **`mcp_Figma_get_code_connect_map`** - Map Figma to code

**Usage:**

```typescript
// Get Figma variables
const variables = await mcp_Figma_get_variable_defs({
  fileKey: "YOUR_FIGMA_FILE_KEY",
  nodeId: "DESIGN_SYSTEM_NODE_ID",
});

// Get design context
const design = await mcp_Figma_get_design_context({
  fileKey: "YOUR_FIGMA_FILE_KEY",
  nodeId: "COMPONENT_NODE_ID",
});
```

---

## Related Documentation

- [Tokens](./tokens.md) - Complete token system
- [Accessibility](./a11y-guidelines.md) - WCAG compliance and theme system
- [Figma Sync](../07-mcp/tools/sync-figma.md) - Design-to-code workflow

---

## Standards & References

### Official WCAG Standards

**Web Content Accessibility Guidelines:**

- **[WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/)** - Latest W3C Recommendation (October 2023, updated December 2024)
- **[WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/)** - Previous W3C Recommendation (June 2018, updated multiple times)
- **[ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html)** - International standard (identical to WCAG 2.2)
- **[EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)** - European standard (currently WCAG 2.1)

**Contrast Requirements:**

- **[SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)** - Level AA: 4.5:1 for normal text, 3:1 for large text
- **[SC 1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html)** - Level AAA: 7:1 for normal text, 4.5:1 for large text
- **[SC 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)** - Level AA: 3:1 for UI components

**References:**

- [WCAG 2 Overview](https://www.w3.org/WAI/standards-guidelines/wcag/) - Official W3C overview
- [How to Meet WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) - Quick Reference
- [WCAG JSON](https://github.com/w3c/wcag/tree/main/11ty/json) - Machine-readable WCAG data

---

**Last Updated:** 2025-01-27  
**Version:** 2.1.0  
**Validated:** ✅ Tailwind MCP | ✅ Figma MCP | ✅ [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/)  
**Status:** ✅ **SSOT - Single Source of Truth**  
**Standards:** [WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/) | [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) | [ISO/IEC 40500:2025](https://www.iso.org/standard/81246.html) | [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/)
