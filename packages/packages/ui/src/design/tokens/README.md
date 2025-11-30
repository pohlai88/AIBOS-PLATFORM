# AI-BOS Design Tokens

> **Single Source of Truth (SSOT)** for all design values in the AI-BOS platform.

---

## 📐 Token Architecture

```
Raw Tokens (globals.css @theme)
        ↓
Color/Typography/Spacing Tokens (tokens.ts)
        ↓
Theme Tokens (default.css, wcag-aa.css, etc.)
        ↓
Components (Use themeTokens only)
```

**Rule**: Components MUST use `themeTokens`, never raw color tokens. This enables:
- Multi-tenancy (tenant overrides)
- Accessibility themes (WCAG AA/AAA)
- Dark mode switching
- Safe mode (high contrast)

---

## 🎨 Token Categories

### 1. Color Tokens

#### Surface Colors
```typescript
colorTokens.bg           // Main background
colorTokens.bgMuted      // Muted background
colorTokens.bgElevated   // Elevated surfaces (cards)
```

#### Text Colors
```typescript
colorTokens.fg          // Primary text
colorTokens.fgMuted     // Secondary text
colorTokens.fgSubtle    // Tertiary text
```

#### Semantic Colors
```typescript
colorTokens.primary         // Primary action
colorTokens.primarySoft     // Primary background tint
colorTokens.primaryForeground // Text on primary

colorTokens.secondary       // Secondary action
colorTokens.brand           // Brand color (tenant override)
colorTokens.accent          // Accent/interaction color (#D4A373)
```

#### Status Colors
```typescript
colorTokens.success         // Success state (#059669)
colorTokens.successSoft     // Success bg tint
colorTokens.warning         // Warning state (#D97706)
colorTokens.danger          // Error/danger state (#BE123C)
```

---

### 2. Typography Tokens

#### Font Sizes (Figma Standard: 14px minimum)

```typescript
typographyTokens.xs    // 14px - Smallest allowed
typographyTokens.sm    // 16px - Body text
typographyTokens.base  // 18px - Comfortable reading
typographyTokens.lg    // 20px - Subheadings
typographyTokens.xl    // 24px - Large text
```

#### Heading Scale (Perfect Fourth: 1.25 ratio)

```typescript
typographyTokens.h6  // 16px
typographyTokens.h5  // 20px
typographyTokens.h4  // 25px
typographyTokens.h3  // 31px
typographyTokens.h2  // 39px
typographyTokens.h1  // 49px
```

#### Display Sizes (Hero Headlines)

```typescript
typographyTokens.displaySm  // 61px
typographyTokens.displayMd  // 76px
typographyTokens.displayLg  // 95px
```

#### Line Heights

```typescript
typographyTokens.lineHeightTight    // 1.2 (headlines)
typographyTokens.lineHeightNormal   // 1.5 (body)
typographyTokens.lineHeightRelaxed  // 1.75 (long-form)
```

---

### 3. Spacing Tokens (4px Grid)

```typescript
spacingTokens['2xs']  // 4px
spacingTokens.xs      // 8px
spacingTokens.sm      // 12px
spacingTokens.md      // 16px - Base unit
spacingTokens.lg      // 24px
spacingTokens.xl      // 32px
spacingTokens['2xl']  // 48px
spacingTokens['3xl']  // 64px
spacingTokens['4xl']  // 96px
spacingTokens['5xl']  // 128px
spacingTokens['6xl']  // 192px
```

**Usage**:
```tsx
<div style={{ padding: spacingTokens.md }}>  // 16px
<div style={{ gap: spacingTokens.lg }}>      // 24px
```

---

### 4. Radius Tokens (Tighter for Enterprise)

```typescript
radiusTokens.xxs    // 2px
radiusTokens.xs     // 3px
radiusTokens.sm     // 4px - Tags, badges
radiusTokens.md     // 6px - Buttons
radiusTokens.lg     // 8px - Cards
radiusTokens.xl     // 12px - Large cards
radiusTokens['2xl'] // 16px - Modals
radiusTokens.full   // 9999px - Pills, avatars
```

---

### 5. Shadow Tokens (Elevation System)

```typescript
shadowTokens.xs    // Subtle depth
shadowTokens.sm    // Small cards
shadowTokens.md    // Default cards
shadowTokens.lg    // Elevated panels
shadowTokens.xl    // Modals
shadowTokens['2xl'] // Overlays
shadowTokens.glow   // Accent glow effect
shadowTokens.inner  // Inset shadow
```

**Note**: Dark mode uses lighter shadows (closer to light source model).

---

### 6. Gradient Tokens (Cinematic Layer)

#### Linear Gradients
```typescript
gradientTokens.ember     // Amber gradient
gradientTokens.void      // Black depth gradient
gradientTokens.glass     // Glass panel gradient
gradientTokens.metallic  // Text gradient (engraved look)
```

#### Radial Gradients
```typescript
gradientTokens.intelligence  // AI aura
gradientTokens.aiGlow       // Ambient background
```

#### Conic Gradients
```typescript
gradientTokens.spinner  // Loading spinner
```

**Usage**:
```tsx
<div style={{ background: gradientTokens.ember }} />
<h1 className="text-gradient-ember">Title</h1>
```

---

### 7. Interactive State Tokens

```typescript
interactiveTokens.accentHover   // #E0B589 (lighter)
interactiveTokens.accentActive  // #C89563 (darker)
interactiveTokens.accentFocus   // Same as base
```

**Usage**:
```css
button:hover {
  background: var(--color-accent-hover);
}
```

---

### 8. Animation Tokens

#### Durations
```typescript
animationTokens.instant    // 100ms - Instant feedback
animationTokens.fast       // 150ms - Quick transitions
animationTokens.normal     // 300ms - Default
animationTokens.slow       // 500ms - Smooth
animationTokens.slower     // 700ms - Deliberate
animationTokens.cinematic  // 1000ms - Dramatic
```

#### Easing Functions
```typescript
animationTokens.linear   // No easing
animationTokens.ease     // Standard ease
animationTokens.in       // Ease in
animationTokens.out      // Ease out
animationTokens.inOut    // Ease in-out
animationTokens.smooth   // Custom smooth (0.25, 0.8, 0.25, 1)
animationTokens.bounce   // Bounce effect
```

**Usage**:
```css
.fade-in {
  transition: opacity var(--duration-normal) var(--easing-smooth);
}
```

---

### 9. Z-Index Tokens (Layering Scale)

```typescript
zIndexTokens.base          // 0 - Normal content
zIndexTokens.dropdown      // 1000
zIndexTokens.sticky        // 1100
zIndexTokens.fixed         // 1200
zIndexTokens.modalBackdrop // 1300
zIndexTokens.modal         // 1400
zIndexTokens.popover       // 1500
zIndexTokens.tooltip       // 1600
zIndexTokens.toast         // 1700
```

**Usage**:
```tsx
<Modal style={{ zIndex: zIndexTokens.modal }} />
```

---

## 🎭 Theme Tokens (Use These in Components!)

Components should ALWAYS use `themeTokens`, not direct color/typography tokens.

```typescript
// ✅ CORRECT
<div style={{ color: themeTokens.fg, fontSize: themeTokens.fontBase }}>

// ❌ WRONG
<div style={{ color: colorTokens.fg, fontSize: '16px' }}>
```

### Why?

1. **Multi-tenancy**: `themeTokens.brand` can be overridden per tenant
2. **Accessibility**: WCAG themes adjust contrast ratios
3. **Dark mode**: Theme tokens switch automatically
4. **Safe mode**: High contrast mode for accessibility

---

## 📦 Importing Tokens

### In TypeScript/React

```typescript
import { 
  themeTokens,      // Use this 99% of the time
  colorTokens,      // Rarely needed
  shadowTokens,
  gradientTokens,
  animationTokens
} from '@/design/tokens';

// Usage
const Button = () => (
  <button style={{
    background: themeTokens.accent,
    color: themeTokens.accentForeground,
    borderRadius: themeTokens.radiusMd,
    padding: `${themeTokens.spacingSm} ${themeTokens.spacingMd}`,
    boxShadow: themeTokens.shadowSm,
    transition: `all ${themeTokens.durationNormal} ${themeTokens.easingSmooth}`
  }}>
    Click Me
  </button>
);
```

### In CSS/Tailwind

```css
/* Direct CSS variables */
.my-card {
  background: var(--theme-bg-elevated);
  border-radius: var(--theme-radius-lg);
  box-shadow: var(--theme-shadow-md);
  padding: var(--theme-spacing-lg);
}

/* With Tailwind arbitrary values */
<div className="
  bg-[var(--theme-bg-elevated)]
  rounded-[var(--theme-radius-lg)]
  shadow-[var(--theme-shadow-md)]
  p-[var(--theme-spacing-lg)]
" />
```

---

## 🎨 Artifact Layer Utility Classes

Pre-built CSS classes for cinematic effects:

### Photonic Borders
```html
<!-- Standard photonic border -->
<div class="border-photonic">...</div>

<!-- Amber variant (active state) -->
<div class="border-photonic-amber">...</div>
```

### Atmospheric Grain
```html
<!-- Film texture overlay -->
<body class="bg-noise">...</body>
```

### Metallic Text
```html
<!-- Engraved steel effect -->
<h1 class="text-metallic">Dashboard</h1>
<h2 class="text-gradient-ember">Revenue</h2>
```

### Sentient Glow
```html
<!-- Ambient AI presence -->
<main class="glow-ambient">...</main>
```

### Animations
```html
<!-- Shimmer (AI processing) -->
<div class="animate-shimmer">Processing...</div>

<!-- Pulse glow -->
<div class="glow-pulse">•</div>

<!-- Hover lift -->
<div class="hover-lift">Card</div>

<!-- Fade in -->
<div class="fade-in">Content</div>

<!-- Slide up -->
<div class="slide-up">Panel</div>
```

### Gradient Dividers
```html
<!-- Horizontal -->
<div class="gradient-divider"></div>

<!-- Vertical -->
<div class="gradient-divider-vertical"></div>
```

### Backdrop Blur
```html
<div class="backdrop-blur-glass">Glass panel</div>
<div class="backdrop-blur-strong">Modal</div>
```

### Focus Ring
```html
<input class="focus-ring" />
```

---

## 🔄 Token Lifecycle

### Adding a New Token

1. **Define in `globals.css`** (inside `@theme` block):
```css
@theme {
  --my-new-color: #FF6B6B;
}
```

2. **Export in `tokens.ts`**:
```typescript
export const colorTokens = {
  // ... existing tokens
  myNewColor: "var(--my-new-color)",
} as const;
```

3. **Map in theme** (`default.css`):
```css
:root[data-theme="default"] {
  --theme-my-new-color: var(--my-new-color);
}
```

4. **Add to `themeTokens`** (in `tokens.ts`):
```typescript
export const themeTokens = {
  // ... existing tokens
  myNewColor: "var(--theme-my-new-color)",
} as const;
```

5. **Document it** (update this README)

6. **Use in components**:
```tsx
<div style={{ color: themeTokens.myNewColor }} />
```

---

## ✅ Best Practices

### DO ✅

- Use `themeTokens` in components
- Follow 14px minimum font size
- Use 4px spacing grid
- Leverage semantic color names
- Test in dark mode
- Validate WCAG contrast
- Use Artifact Layer classes for cinematic effects

### DON'T ❌

- Hardcode colors/sizes
- Use `colorTokens` directly in components
- Use font sizes below 14px
- Break the 4px spacing grid
- Ignore dark mode testing
- Skip accessibility checks
- Use pure black (#000) or pure white (#FFF)

---

## 🧪 Token Validation

```bash
# Check for unused tokens
npm run tokens:check

# Validate contrast ratios
npm run tokens:contrast

# Generate documentation
npm run tokens:docs
```

---

## 📊 Token Coverage

Current token count:

- **Colors**: 40+ (including status, brand, accent)
- **Typography**: 20+ (sizes, headings, displays)
- **Spacing**: 11 scales (4px → 192px)
- **Radius**: 8 scales (2px → full)
- **Shadows**: 8 elevations
- **Gradients**: 7 presets
- **Animations**: 14 timing/easing functions
- **Z-Index**: 9 layers
- **Interactive States**: 3 variants

**Total**: 120+ design tokens

---

## 📚 Related Documentation

- [Main Design System README](../README.md)
- [Theme Configuration](../themes/README.md)
- [WCAG Guidelines](../themes/wcag-aa.css)
- [Utility Helpers](../utilities/README.md)

---

**Version**: 4.0.0  
**Last Updated**: November 27, 2025  
**Maintained by**: AI-BOS Design Team
