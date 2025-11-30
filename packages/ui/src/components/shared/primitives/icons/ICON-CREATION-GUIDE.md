# Custom Icon Creation Guide for ERP Modules

> **⚠️ IMPORTANT: Icon Policy**
>
> **Main ERP Modules** → Use **3D Custom Icons** (this guide)  
> **Other Modules** → Use **HeroIcons** from `@heroicons/react`
>
> **See [ERP-ICON-POLICY.md](./ERP-ICON-POLICY.md) for complete policy and decision matrix.**

## 🎯 Design Philosophy & Principles

### Core Philosophy

**Premium 3D Icons for Enterprise Applications**

Our icon system follows the design philosophy of **Apple, Microsoft, and Google** - creating sophisticated, professional icons that convey depth, dimension, and premium quality. Icons should be:

1. **Visually Sophisticated** - 3D isometric perspective with depth and dimension
2. **Theme-Aware** - Adapt to any theme using `currentColor` as the base
3. **Professionally Polished** - Multiple gradient layers, subtle shadows, smooth transitions
4. **Enterprise-Grade** - Match the quality standards of major tech companies
5. **Accessible** - Work seamlessly with IconWrapper for proper accessibility

### Design Principles

#### 1. **3D Isometric Perspective**

- Use isometric projection (30° rotation) for 3D objects
- Show multiple faces (top, front, side) to create depth
- Maintain consistent perspective across all elements

#### 2. **Gradient Sophistication**

- Use multiple gradient layers for depth
- Top faces: Lighter gradients (opacity 0.9-1.0)
- Side faces: Darker gradients (opacity 0.4-0.6)
- Front faces: Medium gradients (opacity 0.7-0.8)

#### 3. **Depth & Dimension**

- Apply opacity variations to create depth hierarchy
- Use subtle shadows for elevation
- Layer elements to create visual depth

#### 4. **Color & Theme Integration**

- Base color: Always use `currentColor` for theme compatibility
- Gradients: Use opacity variations of `currentColor`
- Never hardcode colors - always theme-aware

#### 5. **Professional Polish**

- Smooth transitions between faces
- Consistent stroke weights
- Clean geometry and precise alignment
- Subtle details that enhance without cluttering

## 📐 Technical Standards

### Icon Specifications

- **ViewBox:** `0 0 24 24` (standard 24x24 grid)
- **Base Style:** 3D isometric with gradients
- **Color System:** `currentColor` with opacity variations
- **Gradient System:** Linear gradients for depth
- **Shadow System:** Subtle ellipses for depth shadows
- **Unique IDs:** Use `React.useId()` for gradient IDs

### File Structure

```
icons/
├── {module-name}-icon.tsx    # Main icon component
├── index.ts                  # Barrel exports
├── README.md                 # Usage documentation
└── ICON-CREATION-GUIDE.md   # This file
```

## 🛠️ Step-by-Step Creation Process

### Step 1: Plan Your Icon

1. **Identify the Module Concept**
   - What does this ERP module represent?
   - What visual metaphor works best?
   - What objects/elements convey the concept?

2. **Sketch the 3D Structure**
   - Main object (coin, building, document, etc.)
   - Supporting elements (charts, boxes, arrows, etc.)
   - Isometric perspective layout

3. **Define the Visual Hierarchy**
   - Primary element (largest, most prominent)
   - Secondary elements (supporting, smaller)
   - Depth layers (foreground, middle, background)

### Step 2: Create the Component File

Create `{module-name}-icon.tsx`:

```tsx
/**
 * {ModuleName}Icon - Premium 3D ERP Module Icon
 *
 * High-quality 3D-style icon for {Module Name} module in AI-BOS ERP system.
 * Designed to match Apple/Microsoft/Google quality standards.
 *
 * @component Premium 3D ERP icon
 * @version 2.0.0 - 3D Premium Edition
 * @mcp-validated true
 */

import * as React from "react";

export interface {ModuleName}IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const {ModuleName}Icon = React.forwardRef<SVGSVGElement, {ModuleName}IconProps>(
  ({ className, ...props }, ref) => {
    // Generate unique IDs for gradients
    const gradientId1 = React.useId();
    const gradientId2 = React.useId();
    const gradientId3 = React.useId();
    const shadowId = React.useId();

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <defs>
          {/* Gradient definitions */}
        </defs>

        {/* 3D Icon elements */}
      </svg>
    );
  }
);

{ModuleName}Icon.displayName = "{ModuleName}Icon";
```

### Step 3: Define Gradients

Create 3-4 gradients for different faces:

```tsx
<defs>
  {/* Top face gradient - brightest */}
  <linearGradient
    id={gradientId1}
    x1="12"
    y1="4"
    x2="12"
    y2="12"
    gradientUnits="userSpaceOnUse"
  >
    <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
    <stop offset="50%" stopColor="currentColor" stopOpacity="0.85" />
    <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
  </linearGradient>

  {/* Side face gradient - darkest */}
  <linearGradient
    id={gradientId2}
    x1="12"
    y1="12"
    x2="20"
    y2="20"
    gradientUnits="userSpaceOnUse"
  >
    <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
    <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
    <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
  </linearGradient>

  {/* Front face gradient - medium */}
  <linearGradient
    id={gradientId3}
    x1="0"
    y1="0"
    x2="24"
    y2="24"
    gradientUnits="userSpaceOnUse"
  >
    <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
    <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
  </linearGradient>
</defs>
```

### Step 4: Create 3D Objects

#### 3D Cylinder/Coin Pattern

```tsx
{
  /* Top face (ellipse) */
}
<ellipse
  cx="12"
  cy="8"
  rx="6"
  ry="3"
  fill={`url(#${gradientId1})`}
  opacity="0.95"
/>;

{
  /* Side face (trapezoid) */
}
<path
  d="M 6 8 L 6 16 L 18 16 L 18 8 Z"
  fill={`url(#${gradientId2})`}
  opacity="0.85"
/>;

{
  /* Front face (rectangle) */
}
<rect
  x="6"
  y="8"
  width="12"
  height="8"
  fill={`url(#${gradientId3})`}
  opacity="0.7"
/>;
```

#### 3D Box/Cube Pattern

```tsx
{
  /* Top face (parallelogram) */
}
<path
  d="M 4 6 L 10 4 L 16 4 L 10 6 Z"
  fill={`url(#${gradientId1})`}
  opacity="0.9"
/>;

{
  /* Front face (rectangle) */
}
<rect
  x="4"
  y="6"
  width="6"
  height="8"
  fill={`url(#${gradientId3})`}
  opacity="0.7"
/>;

{
  /* Side face (parallelogram) */
}
<path
  d="M 10 4 L 16 4 L 16 12 L 10 14 Z"
  fill={`url(#${gradientId2})`}
  opacity="0.5"
/>;
```

#### 3D Bar/Chart Pattern

```tsx
<g transform="translate(2, 14) rotate(-30 0 0)">
  {/* Top face */}
  <rect
    x="0"
    y="0"
    width="2.5"
    height="1"
    fill={`url(#${gradientId1})`}
    opacity="0.9"
  />
  {/* Front face */}
  <rect
    x="0"
    y="1"
    width="2.5"
    height="4"
    fill={`url(#${gradientId3})`}
    opacity="0.7"
  />
  {/* Side face */}
  <path
    d="M 2.5 1 L 3.5 0.5 L 3.5 4.5 L 2.5 5 Z"
    fill={`url(#${gradientId2})`}
    opacity="0.5"
  />
</g>
```

### Step 5: Add Depth Shadows

```tsx
{
  /* Subtle shadow for elevation */
}
<ellipse
  cx="13"
  cy="16.5"
  rx="5"
  ry="1.5"
  fill="currentColor"
  opacity="0.15"
/>;
```

### Step 6: Add Details

Add symbols, text, or decorative elements on top faces:

```tsx
{
  /* Symbol on top face */
}
<path
  d="M 12 5.5 L 12 10.5 M 10 6.5 C 10.5 6.5 11 7 11 7.5..."
  stroke="currentColor"
  strokeWidth="0.8"
  strokeLinecap="round"
  fill="none"
  opacity="0.9"
/>;
```

### Step 7: Export in index.ts

```tsx
export { {ModuleName}Icon } from './{module-name}-icon'
export type { {ModuleName}IconProps } from './{module-name}-icon'
```

## 🎨 Design Patterns Reference

### Common 3D Shapes

#### Cylinder/Coin

- Top: Ellipse
- Side: Trapezoid path
- Use for: Coins, containers, cylinders

#### Cube/Box

- Top: Parallelogram
- Front: Rectangle
- Side: Parallelogram
- Use for: Boxes, packages, containers

#### Bar/Chart

- Top: Rectangle (rotated)
- Front: Rectangle
- Side: Parallelogram
- Use for: Charts, graphs, data visualization

#### Building/Structure

- Top: Complex polygon
- Front: Rectangle with details
- Side: Parallelogram
- Use for: Buildings, warehouses, structures

### Gradient Opacity Guidelines

| Face Type  | Opacity Range | Purpose                 |
| ---------- | ------------- | ----------------------- |
| Top Face   | 0.9 - 1.0     | Brightest, most visible |
| Front Face | 0.7 - 0.8     | Medium brightness       |
| Side Face  | 0.4 - 0.6     | Darkest, creates depth  |
| Shadow     | 0.1 - 0.2     | Subtle depth indicator  |

### Isometric Transformation

Standard isometric rotation: **-30 degrees**

```tsx
<g transform="translate(x, y) rotate(-30 0 0)">{/* 3D elements */}</g>
```

## 📋 Quality Checklist

Before finalizing an icon, verify:

- [ ] Uses `currentColor` for all colors (no hardcoded colors)
- [ ] Has 3+ gradient definitions for depth
- [ ] Shows multiple faces (top, front, side) for 3D effect
- [ ] Uses `React.useId()` for unique gradient IDs
- [ ] Includes subtle shadow for depth
- [ ] Opacity values follow the guidelines
- [ ] Isometric perspective is consistent
- [ ] Works with IconWrapper component
- [ ] Exported in `index.ts`
- [ ] Includes JSDoc documentation
- [ ] Has `displayName` set
- [ ] Passes linting (no errors)

## 🎯 ERP Module Icon Examples

### FinanceIcon (Reference Implementation)

- **Concept:** Dollar coin + chart bars
- **3D Elements:** Isometric coin, 3D chart bars
- **Gradients:** 3 gradients (coin top/side, chart bars)
- **Details:** Dollar sign on coin, varying bar heights
- **File:** `finance-icon.tsx`

### WarehouseIcon (To Be Updated)

- **Concept:** Warehouse building + inventory boxes
- **3D Elements:** Isometric building, 3D boxes
- **Gradients:** Building faces, box faces
- **Details:** Building structure, stacked boxes

## 🔄 Migration from 2D to 3D

If you have a 2D icon and want to convert to 3D:

1. **Identify the main object** - What is the primary element?
2. **Convert to 3D shape** - Choose cylinder, cube, or custom
3. **Add isometric perspective** - Rotate and transform
4. **Create gradient system** - Top, front, side gradients
5. **Add depth shadows** - Subtle elevation shadows
6. **Refine details** - Add symbols/text on top faces

## 📚 Resources

### Design References

- **Apple Icons:** Clean, minimalist, subtle gradients
- **Microsoft Fluent:** Depth, modern 3D effects
- **Google Material:** Elevation, clear geometry

### Technical References

- **SVG Gradients:** [MDN Linear Gradient](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient)
- **Isometric Projection:** 30° rotation standard
- **React.useId():** [React Docs](https://react.dev/reference/react/useId)

### Code References

- **FinanceIcon:** `finance-icon.tsx` - Complete 3D reference implementation
- **IconWrapper:** `../icon-wrapper.tsx` - Wrapper component
- **IconButton:** `../icon-button.tsx` - Button with icon

## 🚀 Quick Start Template

```tsx
import * as React from "react";

export interface {ModuleName}IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const {ModuleName}Icon = React.forwardRef<SVGSVGElement, {ModuleName}IconProps>(
  ({ className, ...props }, ref) => {
    const gradientId1 = React.useId();
    const gradientId2 = React.useId();
    const gradientId3 = React.useId();

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
        {...props}
      >
        <defs>
          {/* Top face gradient */}
          <linearGradient id={gradientId1} x1="12" y1="4" x2="12" y2="12">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
          </linearGradient>
          {/* Side face gradient */}
          <linearGradient id={gradientId2} x1="12" y1="12" x2="20" y2="20">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
          </linearGradient>
          {/* Front face gradient */}
          <linearGradient id={gradientId3} x1="0" y1="0" x2="24" y2="24">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Your 3D icon elements here */}
      </svg>
    );
  }
);

{ModuleName}Icon.displayName = "{ModuleName}Icon";
```

## ✅ Success Criteria

An icon is complete when it:

1. **Looks Professional** - Matches Apple/Microsoft/Google quality
2. **Has Depth** - Clear 3D perspective with multiple faces
3. **Is Theme-Aware** - Uses `currentColor` throughout
4. **Is Accessible** - Works with IconWrapper
5. **Is Documented** - Has JSDoc and examples
6. **Is Exported** - Available in `index.ts`
7. **Passes Quality Checks** - All checklist items verified

---

**Last Updated:** 2025-01-27  
**Version:** 2.0.0 - 3D Premium Edition  
**Status:** ✅ Active - Use this guide for all new ERP module icons
