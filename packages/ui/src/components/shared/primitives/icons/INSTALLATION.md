# 🚀 Nano Banana Pro Installation Guide

**Date:** 2025-01-27  
**Status:** ✅ **Ready to Install**

---

## 📦 Step 1: Install Dependencies

### Required Packages

```bash
# Material Design Icons
pnpm add @mdi/react @mdi/js

# Framer Motion (for kinetic animations)
pnpm add framer-motion
```

### Where to Install

Install in the workspace root (monorepo) or in `apps/web`:

```bash
# From workspace root
cd C:\AI-BOS\AIBOS-PLATFORM
pnpm add @mdi/react @mdi/js framer-motion

# Or in apps/web if you prefer
cd apps/web
pnpm add @mdi/react @mdi/js framer-motion
```

---

## ✅ Step 2: Verify Implementation

### What's Already Done

1. ✅ **Adaptive Luminance System** - Added to `globals.css`
2. ✅ **ColoredMDIIcon Component** - Created with `variant` and `withBackground` props
3. ✅ **MotionIcon Component** - Created with 3 animation variants
4. ✅ **CSS Utilities** - Glass panel and blob animations added
5. ✅ **Exports** - All components exported from `index.ts`

### Files Created/Modified

- ✅ `packages/ui/src/design/tokens/globals.css` - Adaptive colors + CSS utilities
- ✅ `packages/ui/src/components/shared/primitives/icons/mdi-colored-icon.tsx` - Main component
- ✅ `packages/ui/src/components/shared/primitives/icons/motion-icon.tsx` - Kinetic wrapper
- ✅ `packages/ui/src/components/shared/primitives/icons/index.ts` - Exports

---

## 🎯 Step 3: Test It

### Quick Test

```tsx
// apps/web/app/test-icons/page.tsx
import { mdiHome, mdiLanguageJavascript } from "@mdi/js";
import { ColoredMDIIcon, MotionIcon } from "@aibos/ui/components/shared/primitives/icons";

export default function TestIcons() {
  return (
    <div className="p-8 space-y-4">
      {/* Basic */}
      <ColoredMDIIcon path={mdiHome} variant="primary" />
      
      {/* Glassy */}
      <ColoredMDIIcon path={mdiLanguageJavascript} variant="javascript" withBackground />
      
      {/* Kinetic */}
      <MotionIcon path={mdiHome} variant="primary" animation="revolver" />
    </div>
  );
}
```

---

## 🎨 Step 4: Use in Your App

### Example: Dashboard Icons

```tsx
import { mdiLanguageJavascript, mdiLanguageTypescript, mdiLanguagePython } from "@mdi/js";
import { ColoredMDIIcon } from "@aibos/ui/components/shared/primitives/icons";

<div className="flex gap-4">
  <ColoredMDIIcon path={mdiLanguageJavascript} variant="javascript" withBackground />
  <ColoredMDIIcon path={mdiLanguageTypescript} variant="typescript" withBackground />
  <ColoredMDIIcon path={mdiLanguagePython} variant="python" withBackground />
</div>
```

### Example: Interactive Icons

```tsx
import { mdiCog, mdiHeart, mdiAlertCircle } from "@mdi/js";
import { MotionIcon } from "@aibos/ui/components/shared/primitives/icons";

<div className="flex gap-4">
  <MotionIcon path={mdiCog} variant="secondary" animation="revolver" />
  <MotionIcon path={mdiHeart} variant="error" animation="jelly" />
  <MotionIcon path={mdiAlertCircle} variant="warning" animation="pulse" />
</div>
```

---

## 🔍 Troubleshooting

### Issue: Icons not showing

**Solution:** Make sure `@mdi/react` and `@mdi/js` are installed.

### Issue: Colors not adapting to dark mode

**Solution:** Ensure your app has the `.dark` class on the root element or uses `data-mode="dark"`.

### Issue: MotionIcon not animating

**Solution:** 
1. Make sure `framer-motion` is installed
2. Ensure the component is in a Client Component (use `"use client"` directive)

### Issue: Glassy background not showing

**Solution:** Check browser support for `color-mix()`. If unsupported, the background will fall back to transparent.

---

## ✅ Verification Checklist

- [ ] `@mdi/react` and `@mdi/js` installed
- [ ] `framer-motion` installed
- [ ] Icons render correctly
- [ ] Colors adapt to light/dark mode
- [ ] Glassy backgrounds work
- [ ] Kinetic animations work
- [ ] No TypeScript errors
- [ ] No console errors

---

**Status:** ✅ **Ready to Use - Install dependencies and start coding!**

