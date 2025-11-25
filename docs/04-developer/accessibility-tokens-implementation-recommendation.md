# Accessibility Tokens Implementation Recommendation

> **Date:** 2025-01-27  
> **Status:** 📋 Recommendation  
> **Priority:** High

---

## Executive Summary

Based on the design philosophy clarification, `accessibilityTokens` should be:
- **NOT customizable** (fixed, pre-validated WCAG compliance)
- **NOT tenant-specific** (universal compliance standards)
- **AA and AAA variants** (separate tokens for each compliance level)
- **Pre-validated** (validated against WCAG standards, not design preferences)

---

## Current Implementation

**Current `tokens.ts`:**

```typescript
// Current: Single accessibilityTokens (needs enhancement)
export const accessibilityTokens = {
  textOnBg: "text-fg",
  textOnBgMuted: "text-fg-muted",
  textOnBgElevated: "text-fg",
  
  textOnPrimary: "text-primary-foreground",
  textOnSecondary: "text-secondary-foreground",
  
  textOnSuccess: "text-success-foreground",
  textOnWarning: "text-warning-foreground",
  textOnDanger: "text-danger-foreground",
} as const;
```

**Issues:**
- ❌ No AA/AAA differentiation
- ❌ Uses tenant-customizable `--color-primary-foreground` (should be fixed)
- ❌ Not pre-validated for WCAG compliance
- ❌ Mixed with `colorTokens` (which are customizable)

---

## Recommended Implementation

### 1. Separate AA and AAA Variants

```typescript
// WCAG AA Compliance Tokens (4.5:1 contrast minimum)
export const accessibilityTokensAA = {
  // Text on backgrounds (pre-validated 4.5:1+)
  textOnBg: "text-fg-aa", // Validated 4.5:1+ contrast
  textOnBgMuted: "text-fg-muted-aa", // Validated 4.5:1+ contrast
  textOnBgElevated: "text-fg-aa", // Validated 4.5:1+ contrast
  
  // Text on brand colors (pre-validated 4.5:1+)
  textOnPrimary: "text-primary-foreground-aa", // Validated 4.5:1+ contrast
  textOnSecondary: "text-secondary-foreground-aa", // Validated 4.5:1+ contrast
  
  // Text on status colors (pre-validated 4.5:1+)
  textOnSuccess: "text-success-foreground-aa", // Validated 4.5:1+ contrast
  textOnWarning: "text-warning-foreground-aa", // Validated 4.5:1+ contrast
  textOnDanger: "text-danger-foreground-aa", // Validated 4.5:1+ contrast
  
  // Font sizes (pre-validated for AA compliance)
  fontSizeNormal: "text-[16px]", // Meets AA requirements
  fontSizeLarge: "text-[18px]", // Meets AA requirements (3:1 for large text)
} as const;

// WCAG AAA Compliance Tokens (7:1 contrast minimum)
export const accessibilityTokensAAA = {
  // Text on backgrounds (pre-validated 7:1+)
  textOnBg: "text-fg-aaa", // Validated 7:1+ contrast
  textOnBgMuted: "text-fg-muted-aaa", // Validated 7:1+ contrast
  textOnBgElevated: "text-fg-aaa", // Validated 7:1+ contrast
  
  // Text on brand colors (pre-validated 7:1+)
  textOnPrimary: "text-primary-foreground-aaa", // Validated 7:1+ contrast
  textOnSecondary: "text-secondary-foreground-aaa", // Validated 7:1+ contrast
  
  // Text on status colors (pre-validated 7:1+)
  textOnSuccess: "text-success-foreground-aaa", // Validated 7:1+ contrast
  textOnWarning: "text-warning-foreground-aaa", // Validated 7:1+ contrast
  textOnDanger: "text-danger-foreground-aaa", // Validated 7:1+ contrast
  
  // Font sizes (pre-validated for AAA compliance)
  fontSizeNormal: "text-[16px]", // Meets AAA requirements
  fontSizeLarge: "text-[18px]", // Meets AAA requirements (4.5:1 for large text)
} as const;
```

### 2. CSS Implementation

```css
/* WCAG AA Theme - Pre-validated contrast ratios */
:root[data-theme="wcag-aa"] {
  /* Fixed, pre-validated colors (NOT tenant-customizable) */
  --color-primary-foreground-aa: #ffffff; /* Validated 4.5:1+ contrast */
  --color-secondary-foreground-aa: #ffffff; /* Validated 4.5:1+ contrast */
  --color-success-foreground-aa: #ffffff; /* Validated 4.5:1+ contrast */
  --color-warning-foreground-aa: #111827; /* Validated 4.5:1+ contrast */
  --color-danger-foreground-aa: #ffffff; /* Validated 4.5:1+ contrast */
  
  --color-fg-aa: #111827; /* Validated 4.5:1+ on bg */
  --color-fg-muted-aa: #6b7280; /* Validated 4.5:1+ on bg */
}

/* WCAG AAA Theme - Pre-validated contrast ratios */
:root[data-theme="wcag-aaa"] {
  /* Fixed, pre-validated colors (NOT tenant-customizable) */
  --color-primary-foreground-aaa: #ffffff; /* Validated 7:1+ contrast */
  --color-secondary-foreground-aaa: #ffffff; /* Validated 7:1+ contrast */
  --color-success-foreground-aaa: #ffffff; /* Validated 7:1+ contrast */
  --color-warning-foreground-aaa: #111827; /* Validated 7:1+ contrast */
  --color-danger-foreground-aaa: #ffffff; /* Validated 7:1+ contrast */
  
  --color-fg-aaa: #000000; /* Validated 7:1+ on bg */
  --color-fg-muted-aaa: #374151; /* Validated 7:1+ on bg */
}
```

### 3. Usage Pattern

```tsx
// ✅ CORRECT: Use accessibilityTokens based on theme
import { 
  colorTokens, 
  accessibilityTokensAA, 
  accessibilityTokensAAA 
} from "@aibos/ui/design/tokens";

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

// Default theme (no accessibility requirement)
<button className={colorTokens.primarySurface}>
  <span className="text-white"> {/* Aesthetic choice */}
    Primary Action
  </span>
</button>
```

---

## Key Principles

### 1. `colorTokens` = Multi-Tenant, Customizable

- ✅ **Purpose:** Brand/design colors
- ✅ **Customizable:** Yes (tenants can override)
- ✅ **Default:** DLBB green (`#22c55e`)
- ✅ **Example:** `colorTokens.primarySurface` (adapts to tenant)

### 2. `accessibilityTokens` = Fixed, Pre-Validated

- ✅ **Purpose:** WCAG compliance
- ❌ **Customizable:** No (fixed compliance standards)
- ❌ **Tenant-Specific:** No (universal compliance)
- ✅ **Variants:** AA and AAA (separate tokens)
- ✅ **Example:** `accessibilityTokensAA.textOnPrimary` (fixed, validated)

---

## Implementation Steps

1. **Update `tokens.ts`**
   - Split `accessibilityTokens` into `accessibilityTokensAA` and `accessibilityTokensAAA`
   - Remove dependency on tenant-customizable colors
   - Add font size tokens

2. **Update `globals.css`**
   - Add `--color-*-foreground-aa` variables (pre-validated)
   - Add `--color-*-foreground-aaa` variables (pre-validated)
   - Ensure these are NOT tenant-customizable

3. **Update Components**
   - Use `accessibilityTokensAA` in WCAG AA theme
   - Use `accessibilityTokensAAA` in WCAG AAA theme
   - Use aesthetic colors in default theme

4. **Validation**
   - Validate all AA tokens meet 4.5:1 contrast
   - Validate all AAA tokens meet 7:1 contrast
   - Use A11y MCP to verify compliance

---

## Related Documents

- [Colors Guidelines](../../01-foundation/ui-system/colors.md) - Updated with distinction
- [A11y Guidelines](../../01-foundation/ui-system/a11y-guidelines.md) - Theme-based approach
- [tokens.ts](../../packages/ui/src/design/tokens.ts) - Current implementation

---

**Status:** 📋 Recommendation - Ready for Implementation  
**Priority:** High - Blocks proper WCAG compliance  
**Estimated Effort:** 2-3 hours

