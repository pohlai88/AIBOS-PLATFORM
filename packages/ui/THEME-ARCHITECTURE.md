# 🎨 Theme Architecture Documentation

**Date:** 2025-01-27  
**Status:** Active  
**Purpose:** Clarify theme file architecture and loading order

---

## Overview

The UI package uses a **layered theme architecture** where CSS variables are defined in a specific order to support:

- Base design system (globals.css)
- Theme variants (default.css, wcag-aa.css, wcag-aaa.css)
- Tenant customization (via data-tenant attribute)
- Dark mode (via .dark class or data-mode='dark')
- Safe mode (via data-safe-mode='true')

---

## File Structure

### 1. `globals.css` - Base Design System (SSOT)

**Location:** `packages/ui/src/design/tokens/globals.css`  
**Purpose:** Single source of truth for all CSS variables  
**Role:** Base layer - defines all tokens with default values

**Key Sections:**

- `:root` - Light mode base tokens
- `.dark, :root[data-mode='dark']` - Dark mode overrides
- `:root[data-tenant='*']` - Tenant customization (accent colors only)
- `:root[data-safe-mode='true']` - Safe mode overrides

**Important:** This file defines the **default values** that are used when no theme is specified.

---

### 2. `default.css` - Professional Theme

**Location:** `packages/ui/src/design/themes/default.css`  
**Purpose:** Professional aesthetic theme with white backgrounds  
**Role:** Theme layer - overrides base tokens when `data-theme='default'` is set

**Key Differences from globals.css:**

- `--color-bg: #ffffff` (white) vs globals.css `#f9fafb` (gray-50)
- Provides cleaner, more professional look
- Still supports tenant customization through accent bridge

**Usage:**

```html
<html data-theme="default" data-tenant="dlbb">
  <!-- Uses default.css theme with DLBB emerald accent -->
</html>
```

---

### 3. `wcag-aa.css` - WCAG AA Compliance Theme

**Location:** `packages/ui/src/design/themes/wcag-aa.css`  
**Purpose:** Legal compliance theme with WCAG AA contrast ratios (4.5:1 minimum)  
**Role:** Compliance layer - **immutable**, overrides all tenant customizations

**Key Features:**

- Uses `!important` to enforce compliance (legal requirement)
- Blocks tenant customizations
- Ensures 4.5:1 contrast ratio minimum
- Enhanced focus rings (3px width)

**Usage:**

```html
<html data-theme="wcag-aa">
  <!-- Tenant customizations are blocked - compliance enforced -->
</html>
```

---

### 4. `wcag-aaa.css` - WCAG AAA Compliance Theme

**Location:** `packages/ui/src/design/themes/wcag-aaa.css`  
**Purpose:** Maximum accessibility theme with WCAG AAA contrast ratios (7:1 minimum)  
**Role:** Maximum compliance layer - **immutable**, equivalent to Safe Mode

**Key Features:**

- Uses `!important` to enforce maximum compliance
- Blocks ALL customizations (tenant, theme, etc.)
- Ensures 7:1 contrast ratio minimum
- Disables animations and shadows
- Minimum text size enforcement (16px body, 14px captions)

**Usage:**

```html
<html data-theme="wcag-aaa" data-safe-mode="true">
  <!-- All customizations blocked - maximum accessibility -->
</html>
```

---

## Theme Loading Order & Specificity

### CSS Specificity Hierarchy (Highest to Lowest)

1. **WCAG AAA Theme** (`data-theme='wcag-aaa'`) - Highest priority
   - Uses `!important` to override everything
   - Blocks tenant, dark mode, and other theme customizations

2. **WCAG AA Theme** (`data-theme='wcag-aa'`) - High priority
   - Uses `!important` for critical tokens
   - Blocks tenant customizations
   - Allows dark mode

3. **Safe Mode** (`data-safe-mode='true'`) - High priority
   - Neutralizes accents
   - Flattens shadows
   - Uses WCAG AAA status colors

4. **Dark Mode** (`.dark` or `data-mode='dark'`) - Medium priority
   - Overrides light mode tokens
   - Works with all themes except WCAG AAA (which blocks it)

5. **Theme Variants** (`data-theme='default'`) - Medium priority
   - Overrides base globals.css values
   - Works with tenant customization
   - Works with dark mode

6. **Tenant Customization** (`data-tenant='*'`) - Low priority
   - Only overrides `--accent-*` tokens
   - Blocked by WCAG themes
   - Works with default theme

7. **Base Tokens** (`globals.css :root`) - Lowest priority
   - Default values when no theme is specified
   - Foundation for all other layers

---

## Theme File Loading

### Recommended Import Order

```css
/* 1. Base design system (SSOT) */
@import "@aibos/ui/src/design/tokens/globals.css";

/* 2. Theme variant (optional) */
@import "@aibos/ui/src/design/themes/default.css";
/* OR */
@import "@aibos/ui/src/design/themes/wcag-aa.css";
/* OR */
@import "@aibos/ui/src/design/themes/wcag-aaa.css";
```

**Important:** Theme files should be loaded **after** globals.css to allow proper overrides.

---

## Theme Selection Logic

### When to Use Each Theme

| Theme                       | Use Case                         | Tenant Customization | Dark Mode       | Safe Mode         |
| --------------------------- | -------------------------------- | -------------------- | --------------- | ----------------- |
| **None** (globals.css only) | Simple apps, prototyping         | ✅ Yes               | ✅ Yes          | ✅ Yes            |
| **default**                 | Professional apps, business apps | ✅ Yes               | ✅ Yes          | ✅ Yes            |
| **wcag-aa**                 | Legal compliance required        | ❌ No (blocked)      | ✅ Yes          | ✅ Yes            |
| **wcag-aaa**                | Maximum accessibility            | ❌ No (blocked)      | ❌ No (blocked) | ✅ Yes (enforced) |

---

## Token Override Examples

### Example 1: Default Theme with Tenant

```html
<html data-theme="default" data-tenant="dlbb"></html>
```

**Result:**

1. `globals.css` sets base tokens
2. `default.css` overrides surface colors (white backgrounds)
3. `data-tenant="dlbb"` overrides accent colors (emerald green)
4. Components use `--color-primary` which flows from `--accent-bg`

**Final Values:**

- `--color-bg: #ffffff` (from default.css)
- `--accent-bg: #22c55e` (from tenant override)
- `--color-primary: #22c55e` (from accent bridge)

---

### Example 2: WCAG AA Theme

```html
<html data-theme="wcag-aa" data-tenant="dlbb" class="dark"></html>
```

**Result:**

1. `globals.css` sets base tokens
2. `wcag-aa.css` overrides with `!important` (blocks tenant)
3. Dark mode is allowed (not blocked by WCAG AA)
4. Tenant customization is **ignored** (blocked by `!important`)

**Final Values:**

- `--accent-bg: #1f2937 !important` (from wcag-aa.css, tenant ignored)
- `--color-primary: #1f2937` (from wcag-aa.css)
- Dark mode tokens apply (if `.dark` class is present)

---

### Example 3: WCAG AAA Theme

```html
<html
  data-theme="wcag-aaa"
  data-tenant="dlbb"
  class="dark"
  data-safe-mode="true"
></html>
```

**Result:**

1. `globals.css` sets base tokens
2. `wcag-aaa.css` overrides with `!important` (blocks everything)
3. Dark mode is **blocked** (WCAG AAA enforces light mode)
4. Tenant customization is **ignored**
5. Safe mode is **enforced** (equivalent to WCAG AAA)

**Final Values:**

- `--color-bg: #ffffff !important` (from wcag-aaa.css, dark mode ignored)
- `--color-fg: #000000 !important` (from wcag-aaa.css)
- `--accent-bg: #000000 !important` (from wcag-aaa.css, tenant ignored)
- All animations disabled
- Shadows disabled

---

## Common Issues & Solutions

### Issue 1: Theme Not Applying

**Problem:** Theme file loaded but tokens not changing

**Solution:**

- Verify theme file is loaded **after** globals.css
- Check HTML has correct `data-theme` attribute
- Verify CSS specificity (WCAG themes use `!important`)

---

### Issue 2: Tenant Customization Not Working

**Problem:** Tenant colors not applying

**Solution:**

- Verify `data-tenant` attribute is set on `<html>` element
- Check if WCAG theme is active (blocks tenant customization)
- Ensure tenant selector matches: `:root[data-tenant='your-tenant']`

---

### Issue 3: Dark Mode Not Working with Theme

**Problem:** Dark mode tokens not applying when theme is active

**Solution:**

- WCAG AAA theme blocks dark mode (by design)
- WCAG AA theme allows dark mode
- Default theme allows dark mode
- Verify `.dark` class or `data-mode='dark'` is set

---

## Best Practices

1. **Always load globals.css first** - It's the foundation
2. **Load theme files after globals.css** - Allows proper overrides
3. **Use data-theme attribute** - Don't rely on class names alone
4. **Test theme combinations** - Verify tenant + theme + dark mode work together
5. **Document custom themes** - If creating new theme files, document them
6. **Respect WCAG themes** - Don't try to override WCAG themes (they use !important for legal compliance)

---

## Migration Notes

### From globals.css-only to theme-based

**Before:**

```html
<html>
  <!-- Uses globals.css base tokens only -->
</html>
```

**After:**

```html
<html data-theme="default">
  <!-- Uses default.css theme (white backgrounds) -->
</html>
```

**Changes:**

- `--color-bg` changes from `#f9fafb` (gray-50) to `#ffffff` (white)
- Other tokens remain the same
- Tenant customization still works

---

## Validation Checklist

- [x] Theme files load after globals.css
- [x] WCAG themes use !important correctly
- [x] Tenant customization only affects accent tokens
- [x] Dark mode works with default and WCAG AA themes
- [x] WCAG AAA theme blocks dark mode (by design)
- [x] Safe mode works with all themes
- [x] Theme specificity hierarchy is documented

---

**Last Updated:** 2025-01-27  
**Maintained By:** Design System Team
