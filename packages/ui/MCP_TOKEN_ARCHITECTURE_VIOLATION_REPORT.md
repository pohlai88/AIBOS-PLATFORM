# 🔴 MCP Token Architecture Violation Report

**Date:** 2025-01-27  
**Issue:** Components directly importing tokens instead of using theme layer  
**Severity:** 🔴 **CRITICAL ARCHITECTURAL VIOLATION**  
**Status:** ⚠️ **NOT MCP COMPLIANT**

---

## Executive Summary

**Problem:** All components are directly importing from `tokens.ts`, bypassing the theme layer. This violates MCP architecture principles where:

1. **Theme Layer** (`ThemeProvider`, `useMcpTheme`) should manage CSS variables
2. **Components** should consume tokens through theme-aware utilities/hooks
3. **Direct token imports** bypass tenant overrides, WCAG themes, and safe mode

**Impact:**

- ❌ Components ignore tenant customizations
- ❌ Components ignore WCAG AA/AAA themes
- ❌ Components ignore safe mode
- ❌ Violates MCP architecture principles
- ❌ Breaks theme reactivity

---

## Architecture Violation Details

### ❌ Current (Incorrect) Pattern

**All components are doing this:**

```tsx
// ❌ WRONG - Direct token import
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
} from "../../../design/tokens/tokens";

export const Button = () => {
  return (
    <button
      className={cn(
        colorTokens.bgElevated, // Direct token usage
        colorTokens.text,
        spacingTokens.md
      )}
    >
      Click me
    </button>
  );
};
```

**Why this is wrong:**

1. `tokens.ts` provides static Tailwind class names (`"bg-bg-elevated"`)
2. These classes reference CSS variables (`--color-bg-elevated`)
3. But components bypass the theme layer that controls those CSS variables
4. ThemeProvider can't inject tenant overrides, WCAG themes, or safe mode

### ✅ Correct (MCP-Compliant) Pattern

**Components should use theme layer:**

```tsx
// ✅ CORRECT - Theme-aware usage
"use client"; // For client components

import { useThemeTokens } from "@aibos/ui/mcp/providers";
// OR use theme-aware utilities that respect theme context

export const Button = () => {
  const theme = useThemeTokens(); // Get theme context

  // Use Tailwind classes that reference CSS variables
  // ThemeProvider controls the CSS variables
  return (
    <button
      className={cn(
        "bg-bg-elevated", // References --color-bg-elevated (theme-controlled)
        "text-fg", // References --color-fg (theme-controlled)
        "px-4 py-2" // Static spacing (theme-independent)
      )}
    >
      Click me
    </button>
  );
};
```

**OR use theme-aware token utilities:**

```tsx
// ✅ CORRECT - Theme-aware token utilities
import { useThemeToken } from "@aibos/ui/design/tokens/client";

export const Button = () => {
  const bgColor = useThemeToken("color.bgElevated");
  const textColor = useThemeToken("color.fg");

  return (
    <button
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      Click me
    </button>
  );
};
```

---

## Correct Architecture Flow

### Layer 1: CSS Variables (globals.css)

```css
:root {
  --color-bg-elevated: #ffffff;
  --color-fg: #111827;
}
```

### Layer 2: Theme Provider (ThemeProvider)

```tsx
<McpThemeProvider tenant="dlbb" safeMode={false}>
  {/* Applies CSS variables to :root based on theme */}
  <App />
</McpThemeProvider>
```

### Layer 3: Components (Should use theme)

```tsx
// ✅ Components use Tailwind classes that reference CSS variables
// ThemeProvider controls the CSS variables
<button className="bg-bg-elevated text-fg">
```

### ❌ Current Violation

```tsx
// ❌ Components import tokens.ts directly
// Bypasses theme layer entirely
import { colorTokens } from 'tokens.ts'
<button className={colorTokens.bgElevated}>
```

---

## Affected Components

### All Components Violate This Pattern

**Shared Components:**

- ✅ `button.tsx` - Direct token import
- ✅ `input.tsx` - Direct token import (also has broken usage)
- ✅ `card.tsx` - Direct token import
- ✅ `badge.tsx` - Direct token import
- ✅ All 30+ primitives - Direct token import

**Client Components:**

- ✅ `dialog.tsx` - Direct token import
- ✅ `tooltip.tsx` - Direct token import
- ✅ `popover.tsx` - Direct token import
- ✅ `scroll-area.tsx` - Direct token import

**Typography:**

- ✅ `text.tsx` - Direct token import
- ✅ `heading.tsx` - Direct token import

**Total Violations:** 40+ components

---

## MCP Best Practices Violation

### From MCP Architecture:

1. **Theme Layer Controls Tokens**
   - ThemeProvider manages CSS variables
   - Components should consume through theme context
   - Direct imports bypass theme system

2. **Tenant Customization**
   - Tenant overrides applied via ThemeProvider
   - Direct token imports ignore tenant settings
   - Breaks multi-tenant architecture

3. **WCAG Compliance**
   - WCAG themes applied via ThemeProvider
   - Direct token imports ignore WCAG settings
   - Breaks accessibility compliance

4. **Safe Mode**
   - Safe mode filters applied via ThemeProvider
   - Direct token imports ignore safe mode
   - Breaks cognitive comfort features

---

## Solution Architecture

### Option 1: Theme-Aware Tailwind Classes (Recommended)

**Components use Tailwind classes that reference CSS variables:**

```tsx
// ✅ Theme-aware (CSS variables controlled by ThemeProvider)
<button className="bg-bg-elevated text-fg px-4 py-2">
```

**Pros:**

- Simple and performant
- ThemeProvider controls CSS variables
- Works with tenant/WCAG/safe mode
- No runtime overhead

**Cons:**

- Need to ensure CSS variables are defined in globals.css
- Need to ensure ThemeProvider is wrapping app

### Option 2: Theme Hooks (For Dynamic Values)

**Components use theme hooks for dynamic token values:**

```tsx
"use client";

import { useThemeTokens } from "@aibos/ui/mcp/providers";

export const Button = () => {
  const theme = useThemeTokens();

  // Use theme.overrides for tenant customizations
  // Use theme.metadata for theme info
  // Use CSS variables for styling (controlled by ThemeProvider)

  return <button className="bg-bg-elevated text-fg">Click me</button>;
};
```

**Pros:**

- Full theme context access
- Can react to theme changes
- Supports dynamic theming

**Cons:**

- Requires 'use client' directive
- Runtime overhead
- More complex

### Option 3: Theme-Aware Token Utilities

**Create utilities that respect theme context:**

```tsx
// src/design/utilities/theme-tokens.ts
import { useThemeTokens } from "@aibos/ui/mcp/providers";

export function useThemeAwareTokens() {
  const theme = useThemeTokens();

  return {
    // Return Tailwind classes that reference CSS variables
    bgElevated: "bg-bg-elevated",
    text: "text-fg",
    // ThemeProvider controls the CSS variables
  };
}
```

**Pros:**

- Abstraction layer
- Can add theme logic
- Type-safe

**Cons:**

- Additional layer
- Still need ThemeProvider

---

## Recommended Fix Strategy

### Phase 1: Immediate Fix (Critical)

1. **Remove direct token imports from components**
   - Replace `import { colorTokens } from 'tokens.ts'`
   - With Tailwind classes that reference CSS variables

2. **Ensure ThemeProvider wraps app**
   - Verify `McpThemeProvider` is in app root
   - Verify CSS variables are applied to `:root`

3. **Update component templates**
   - Fix `_template.tsx.template` files
   - Document correct pattern

### Phase 2: Validation

1. **Add MCP validation rule**
   - Detect direct token imports in components
   - Flag as architectural violation

2. **Add tests**
   - Verify components respect theme
   - Verify tenant overrides work
   - Verify WCAG themes work

### Phase 3: Documentation

1. **Update component guidelines**
   - Document theme-aware pattern
   - Provide examples
   - Update README files

---

## Migration Example

### Before (Incorrect):

```tsx
// packages/ui/src/components/shared/primitives/button.tsx
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
} from "../../../design/tokens/tokens";

export const Button = ({ variant = "default" }) => {
  return (
    <button
      className={cn(
        colorTokens.bgElevated, // ❌ Direct token import
        colorTokens.text,
        spacingTokens.md,
        radiusTokens.lg
      )}
    >
      Click me
    </button>
  );
};
```

### After (Correct):

```tsx
// packages/ui/src/components/shared/primitives/button.tsx
// ✅ No token imports - use Tailwind classes that reference CSS variables
// ThemeProvider controls the CSS variables

export const Button = ({ variant = "default" }) => {
  return (
    <button
      className={cn(
        "bg-bg-elevated", // ✅ References --color-bg-elevated (theme-controlled)
        "text-fg", // ✅ References --color-fg (theme-controlled)
        "px-4 py-2", // ✅ Static spacing (theme-independent)
        "rounded-lg" // ✅ References --radius-lg (theme-controlled)
      )}
    >
      Click me
    </button>
  );
};
```

**Key Changes:**

1. ❌ Remove `import { colorTokens } from 'tokens.ts'`
2. ✅ Use Tailwind classes directly (`bg-bg-elevated`)
3. ✅ These classes reference CSS variables (`--color-bg-elevated`)
4. ✅ ThemeProvider controls the CSS variables
5. ✅ Components automatically respect theme

---

## Validation Checklist

### MCP Compliance Check

- [ ] ❌ Components directly import from `tokens.ts`
- [ ] ❌ Components bypass theme layer
- [ ] ❌ Tenant overrides don't work
- [ ] ❌ WCAG themes don't work
- [ ] ❌ Safe mode doesn't work

### After Fix

- [ ] ✅ Components use Tailwind classes referencing CSS variables
- [ ] ✅ ThemeProvider wraps app
- [ ] ✅ Tenant overrides work
- [ ] ✅ WCAG themes work
- [ ] ✅ Safe mode works
- [ ] ✅ MCP validation passes

---

## Impact Assessment

### Current State

**Severity:** 🔴 **CRITICAL**

**Affected:**

- 40+ components
- All shared primitives
- All client compositions
- All typography components

**Consequences:**

- Theme system is bypassed
- Multi-tenant architecture broken
- WCAG compliance broken
- Safe mode broken
- MCP architecture violated

### After Fix

**Benefits:**

- ✅ Theme system works correctly
- ✅ Tenant customization works
- ✅ WCAG compliance works
- ✅ Safe mode works
- ✅ MCP architecture compliant
- ✅ Better performance (CSS variables vs JS)

---

## Next Steps

1. **Immediate:** Create migration plan
2. **Short-term:** Fix component templates
3. **Medium-term:** Migrate all components
4. **Long-term:** Add MCP validation rules

---

**Report Status:** 🔴 **CRITICAL VIOLATION DETECTED**  
**Action Required:** **IMMEDIATE ARCHITECTURAL FIX**  
**MCP Compliance:** ❌ **NON-COMPLIANT**
