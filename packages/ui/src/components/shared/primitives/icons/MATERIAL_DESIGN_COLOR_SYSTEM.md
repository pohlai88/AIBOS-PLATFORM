# 🎨 Material Design Icons + Custom Color System Guide

**Date:** 2025-01-27  
**Purpose:** How to use Material Design Icons with custom color system

---

## 🎯 The Answer: Material Design Icons + Your Color System

**Best Choice:** Use `@mdi/react` with your existing design token system for maximum flexibility and customization.

---

## 📊 Icon Theme Comparison

### Linux Desktop Icon Themes (What You Mentioned)

These are **Linux desktop icon themes** (for file managers, not web apps):

1. **Papirus** - Material/flat design, 7,000+ icons, folder color customization
2. **Tela Circle** - Modern, colorful, circular icons
3. **Reversal** - Colorful, rectangle icons
4. **Paper** - Material Design inspired, clean
5. **Numix Circle** - Circular, colorful icons
6. **White Sur** - macOS-inspired, clean design

**Note:** These are for Linux desktops, not web applications. For web/React, we need different solutions.

---

## ✅ Best Choice for Web/React: Material Design Icons

### Why Material Design Icons (@mdi/react)

1. **7,000+ Icons** - Comprehensive coverage
2. **React Integration** - `@mdi/react` package
3. **Easy Color Customization** - Built-in color prop
4. **SVG-Based** - Scalable, customizable
5. **Well-Maintained** - Active development
6. **Tree-Shakable** - Only import what you use

---

## 🎨 Implementation: Material Design Icons + Custom Colors

### Step 1: Install Material Design Icons

```bash
pnpm add @mdi/react @mdi/js
```

### Step 2: Create Colored Icon Component

```tsx
// packages/ui/src/components/shared/primitives/icons/mdi-icon.tsx
import * as React from "react";
import Icon from "@mdi/react";
import { IconProps as MDIIconProps } from "@mdi/react/dist/IconProps";

// Your design token colors
const iconColors = {
  // File type colors (like Cursor)
  javascript: "var(--icon-js, #F7DF1E)",
  typescript: "var(--icon-ts, #3178C6)",
  python: "var(--icon-py, #3776AB)",
  html: "var(--icon-html, #E34C26)",
  css: "var(--icon-css, #1572B6)",
  react: "var(--icon-react, #61DAFB)",
  vue: "var(--icon-vue, #4FC08D)",

  // Status colors (from your design tokens)
  error: "var(--color-danger)",
  warning: "var(--color-warning)",
  success: "var(--color-success)",
  info: "var(--color-primary)",

  // Theme colors
  primary: "var(--color-primary)",
  secondary: "var(--color-secondary)",
  muted: "var(--color-fg-muted)",
  default: "var(--color-fg)",
};

export interface ColoredMDIIconProps extends Omit<MDIIconProps, "color"> {
  /**
   * Icon path from @mdi/js
   */
  path: string;

  /**
   * Color variant (uses design tokens)
   */
  colorVariant?: keyof typeof iconColors;

  /**
   * Custom color (overrides colorVariant)
   */
  color?: string;

  /**
   * Size in pixels (default: 24)
   */
  size?: number | string;

  /**
   * Title for accessibility
   */
  title?: string;
}

export const ColoredMDIIcon = React.forwardRef<
  SVGSVGElement,
  ColoredMDIIconProps
>(
  (
    { path, colorVariant, color, size = 24, title, className = "", ...props },
    ref
  ) => {
    // Determine color
    const iconColor =
      color || (colorVariant ? iconColors[colorVariant] : iconColors.default);

    // Accessibility
    const isDecorative = !title;

    return (
      <Icon
        ref={ref}
        path={path}
        size={size}
        color={iconColor}
        className={className}
        role={isDecorative ? "presentation" : "img"}
        aria-hidden={isDecorative ? "true" : undefined}
        aria-label={title}
        title={title}
        {...props}
      />
    );
  }
);

ColoredMDIIcon.displayName = "ColoredMDIIcon";
```

### Step 3: Add Color Tokens to Design System

```css
/* packages/ui/src/design/tokens/globals.css */

:root {
  /* ... existing tokens ... */

  /* Icon color tokens (like Cursor) */
  --icon-js: #f7df1e; /* JavaScript/JSON */
  --icon-ts: #3178c6; /* TypeScript */
  --icon-py: #3776ab; /* Python */
  --icon-html: #e34c26; /* HTML */
  --icon-css: #1572b6; /* CSS */
  --icon-react: #61dafb; /* React */
  --icon-vue: #4fc08d; /* Vue */
  --icon-node: #339933; /* Node.js */
  --icon-git: #f05032; /* Git */

  /* Icon status colors (uses existing tokens) */
  --icon-error: var(--color-danger);
  --icon-warning: var(--color-warning);
  --icon-success: var(--color-success);
  --icon-info: var(--color-primary);
}
```

### Step 4: Usage Examples

```tsx
import { mdiHome, mdiAccount, mdiSettings, mdiFileCode } from "@mdi/js";
import { ColoredMDIIcon } from "@aibos/ui/components/shared/primitives/icons";

// Basic usage (uses default color)
<ColoredMDIIcon path={mdiHome} />

// With color variant (uses design tokens)
<ColoredMDIIcon
  path={mdiFileCode}
  colorVariant="javascript"  // Uses --icon-js
/>

<ColoredMDIIcon
  path={mdiFileCode}
  colorVariant="typescript"  // Uses --icon-ts
/>

// Status colors
<ColoredMDIIcon
  path={mdiAlertCircle}
  colorVariant="error"  // Uses --color-danger
/>

// Custom color
<ColoredMDIIcon
  path={mdiHome}
  color="#FF0000"
/>

// With accessibility
<ColoredMDIIcon
  path={mdiHome}
  title="Go to home page"
  colorVariant="primary"
/>
```

---

## 🎨 Advanced: Context-Based Color System (Like Phosphor)

### Create Icon Context Provider

```tsx
// packages/ui/src/components/shared/primitives/icons/icon-context.tsx
import * as React from "react";

interface IconContextValue {
  size?: number | string;
  color?: string;
  colorVariant?: string;
}

const IconContext = React.createContext<IconContextValue>({
  size: 24,
  color: "var(--color-fg)",
});

export const IconContextProvider: React.FC<{
  children: React.ReactNode;
  value?: IconContextValue;
}> = ({ children, value }) => {
  return (
    <IconContext.Provider value={value || {}}>{children}</IconContext.Provider>
  );
};

export const useIconContext = () => React.useContext(IconContext);
```

### Update ColoredMDIIcon to Use Context

```tsx
import { useIconContext } from "./icon-context";

export const ColoredMDIIcon = React.forwardRef<
  SVGSVGElement,
  ColoredMDIIconProps
>((props, ref) => {
  const context = useIconContext();

  // Merge context with props (props override context)
  const size = props.size || context.size || 24;
  const color =
    props.color ||
    (props.colorVariant ? iconColors[props.colorVariant] : null) ||
    context.color ||
    iconColors.default;

  // ... rest of implementation
});
```

### Usage with Context

```tsx
// Global icon styling
<IconContextProvider value={{ size: 24, color: "var(--color-primary)" }}>
  <ColoredMDIIcon path={mdiHome} />  {/* Inherits context */}
  <ColoredMDIIcon path={mdiAccount} />  {/* Inherits context */}
</IconContextProvider>

// Override per icon
<IconContextProvider value={{ size: 24 }}>
  <ColoredMDIIcon path={mdiHome} colorVariant="javascript" />  {/* Overrides color */}
</IconContextProvider>
```

---

## 🎯 File Type Color System (Like Cursor)

### Create File Type Icon Component

```tsx
// packages/ui/src/components/shared/primitives/icons/file-type-icon.tsx
import { mdiFileCode, mdiFile, mdiFileImage, mdiFileDocument } from "@mdi/js";
import { ColoredMDIIcon } from "./mdi-icon";

const fileTypeConfig = {
  javascript: { path: mdiFileCode, colorVariant: "javascript" as const },
  typescript: { path: mdiFileCode, colorVariant: "typescript" as const },
  python: { path: mdiFileCode, colorVariant: "python" as const },
  html: { path: mdiFileCode, colorVariant: "html" as const },
  css: { path: mdiFileCode, colorVariant: "css" as const },
  json: { path: mdiFileCode, colorVariant: "javascript" as const },
  react: { path: mdiFileCode, colorVariant: "react" as const },
  vue: { path: mdiFileCode, colorVariant: "vue" as const },
  default: { path: mdiFile, colorVariant: "default" as const },
};

export interface FileTypeIconProps {
  fileType: keyof typeof fileTypeConfig;
  size?: number | string;
  title?: string;
}

export const FileTypeIcon: React.FC<FileTypeIconProps> = ({
  fileType,
  size = 24,
  title,
}) => {
  const config = fileTypeConfig[fileType] || fileTypeConfig.default;

  return (
    <ColoredMDIIcon
      path={config.path}
      colorVariant={config.colorVariant}
      size={size}
      title={title || `${fileType} file`}
    />
  );
};

// Usage
<FileTypeIcon fileType="javascript" />  // Yellow JS icon
<FileTypeIcon fileType="typescript" />   // Blue TS icon
<FileTypeIcon fileType="python" />      // Blue Python icon
```

---

## 📊 Comparison: Options for AI-BOS

### Option 1: Material Design Icons + Custom Colors ✅ RECOMMENDED

**Pros:**

- ✅ 7,000+ icons ready
- ✅ Easy color customization
- ✅ Integrates with your design tokens
- ✅ React package available
- ✅ Tree-shakable

**Cons:**

- ⚠️ External dependency
- ⚠️ Need to set up color system

**Best For:**

- Quick implementation
- Maximum icon coverage
- Custom color system

---

### Option 2: Codicons + Color System

**Pros:**

- ✅ IDE standard (VS Code)
- ✅ 400+ icons
- ✅ Theme-aware
- ✅ Well-maintained

**Cons:**

- ⚠️ Smaller icon set
- ⚠️ Less customization

**Best For:**

- IDE-like interfaces
- VS Code extensions
- Minimal customization

---

### Option 3: Custom Icons (Current Approach)

**Pros:**

- ✅ Full control
- ✅ No dependencies
- ✅ Custom design

**Cons:**

- ⚠️ Manual work
- ⚠️ Limited coverage
- ⚠️ Maintenance burden

**Best For:**

- Unique brand icons
- Specific requirements
- Full customization

---

### Option 4: Hybrid Approach ⭐ BEST CHOICE

**Use Material Design Icons for:**

- Common UI icons (home, user, settings, etc.)
- File type icons (with colors)
- Status indicators (with colors)

**Use Custom Icons for:**

- ERP module icons (26 icons)
- Brand-specific icons
- Unique features

**Result:**

- ✅ Best of both worlds
- ✅ Comprehensive coverage
- ✅ Custom where needed

---

## 🎯 Recommended Implementation

### Step 1: Install Material Design Icons

```bash
pnpm add @mdi/react @mdi/js
```

### Step 2: Add Color Tokens

```css
/* Add to globals.css */
:root {
  --icon-js: #f7df1e;
  --icon-ts: #3178c6;
  --icon-py: #3776ab;
  /* ... more colors ... */
}
```

### Step 3: Create Colored Icon Component

```tsx
// Use the ColoredMDIIcon component above
```

### Step 4: Use Hybrid Approach

```tsx
// Common icons: Material Design Icons
import { mdiHome, mdiAccount } from "@mdi/js";
<ColoredMDIIcon path={mdiHome} colorVariant="primary" />;

// ERP modules: Custom icons
import { FinanceIcon } from "@aibos/ui/components/shared/primitives/icons";
<FinanceIcon />;
```

---

## ✅ Summary: Best Choice

**For AI-BOS:**

1. **Material Design Icons** (`@mdi/react`) for common icons
2. **Custom color system** using your design tokens
3. **Hybrid approach** - MDI for common, custom for ERP modules
4. **Context provider** for global icon styling (optional)

**Why This is Best:**

- ✅ 7,000+ icons available
- ✅ Easy color customization
- ✅ Integrates with your design system
- ✅ Maintains custom ERP icons
- ✅ Best of both worlds

---

**Status:** ✅ **Recommended Approach - Material Design Icons + Custom Colors**
