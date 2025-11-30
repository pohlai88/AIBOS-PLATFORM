# 🚀 AI-BOS Design System - Quick Reference Card

> **TL;DR** - Everything you need in one page

---

## 📦 Import

```typescript
import { themeTokens, gradientTokens, animationTokens } from '@/design/tokens';
```

---

## 🎨 Colors (Material Names)

```typescript
themeTokens.bg              // #0A0A0B - The Void
themeTokens.bgMuted         // #161618 - Graphite Glass
themeTokens.fg              // #F2F0E9 - Bone/Living Light
themeTokens.accent          // #D4A373 - Amber Ember (Human Element)
themeTokens.secondary       // #64748B - Slate Steel (Machine)
themeTokens.success         // #059669 - Emerald
themeTokens.warning         // #D97706 - Amber
themeTokens.danger          // #BE123C - Rose
```

### 🚫 Forbidden
- ❌ Tech Blue (#2563eb)
- ❌ Pure Black (#000)
- ❌ Pure White (#FFF)
- ❌ Bright Red (#ff0000)
- ❌ Pure Greys (#808080)

---

## 📝 Typography (Human vs Machine)

### Fonts
- **Sans** (Inter, Geist): Headlines, body, UI
- **Mono** (JetBrains Mono): Numbers, hashes, IDs, dates

**Rule**: All data = mono, uppercase, `tracking-wider`

### Sizes (14px minimum)
```typescript
themeTokens.fontXs      // 14px - Smallest allowed
themeTokens.fontSm      // 16px - Body
themeTokens.fontBase    // 18px - Comfortable
themeTokens.fontLg      // 20px - Subheading
```

### Headings
```typescript
themeTokens.fontH6      // 16px
themeTokens.fontH5      // 20px
themeTokens.fontH4      // 25px
themeTokens.fontH3      // 31px
themeTokens.fontH2      // 39px
themeTokens.fontH1      // 49px
```

---

## 📏 Spacing (4px grid)

```typescript
themeTokens.spacing2xs   // 4px
themeTokens.spacingXs    // 8px
themeTokens.spacingSm    // 12px
themeTokens.spacingMd    // 16px ← Base
themeTokens.spacingLg    // 24px
themeTokens.spacingXl    // 32px
themeTokens.spacing2xl   // 48px
```

---

## 🔲 Radius

```typescript
themeTokens.radiusSm     // 4px - Tags
themeTokens.radiusMd     // 6px - Buttons
themeTokens.radiusLg     // 8px - Cards
themeTokens.radiusXl     // 12px - Large cards
themeTokens.radiusFull   // Pills
```

---

## 🌑 Shadows

```typescript
themeTokens.shadowSm     // Small cards
themeTokens.shadowMd     // Default
themeTokens.shadowLg     // Elevated
themeTokens.shadowGlow   // Accent glow
```

---

## 🎭 Artifact Layer Classes

### Must-Have
```html
<body class="bg-noise">           <!-- Film texture -->
<main class="glow-ambient">       <!-- AI presence -->
```

### Cards
```html
<div class="border-photonic rounded-xl hover-lift">
  <!-- Light refraction border + smooth hover -->
</div>

<div class="border-photonic-amber">
  <!-- Active/selected state -->
</div>
```

### Text
```html
<h1 class="text-metallic">        <!-- Engraved steel -->
<h2 class="text-gradient-ember">  <!-- Amber gradient -->
```

### Separators
```html
<div class="gradient-divider"></div>
```

### Animations (60bpm Rhythm)
```html
<div class="animate-shimmer">     <!-- AI processing (3s = 3 beats) -->
<div class="glow-pulse">          <!-- Breathing glow (3s) -->
<div class="breathe">             <!-- 60bpm pulse (1s) -->
<div class="fade-in">             <!-- Fade in -->
<div class="hover-lift">          <!-- Lift on hover -->
<div class="tether">              <!-- Mouse magnetization -->
```

### Advanced Effects
```html
<svg class="living-string">       <!-- Lineage visualization -->
```

---

## 🎨 Gradients

```typescript
gradientTokens.ember         // Amber glow
gradientTokens.metallic      // Text gradient
gradientTokens.intelligence  // AI aura
```

**Usage**:
```tsx
<div style={{ background: gradientTokens.ember }} />
```

---

## ⏱️ Animation

### Durations
```typescript
animationTokens.fast       // 150ms
animationTokens.normal     // 300ms
animationTokens.slow       // 500ms
```

### Easing
```typescript
animationTokens.smooth     // cubic-bezier(0.25, 0.8, 0.25, 1)
animationTokens.out        // Ease out
```

**Usage**:
```css
transition: all var(--duration-normal) var(--easing-smooth);
```

---

## 📚 Common Patterns

### Button
```tsx
<button style={{
  background: themeTokens.accent,
  color: '#0A0A0B',
  borderRadius: themeTokens.radiusMd,
  padding: `${themeTokens.spacingSm} ${themeTokens.spacingMd}`,
  fontSize: themeTokens.fontSm,
}}>
  Click Me
</button>
```

### Card
```tsx
<div className="border-photonic rounded-xl p-6 hover-lift">
  <h3 className="text-metallic text-2xl font-light mb-4">
    Title
  </h3>
  <div className="gradient-divider mb-4" />
  <p className="text-sm">Content</p>
</div>
```

### Input
```tsx
<input 
  className="focus-ring"
  style={{
    padding: themeTokens.spacingSm,
    borderRadius: themeTokens.radiusSm,
    fontSize: themeTokens.fontSm,
  }}
/>
```

---

## ✅ Best Practices

### DO ✅
- Use `themeTokens` (not `colorTokens`)
- Use `rem` units (auto-scaling)
- Minimum 14px font size
- Follow 4px grid for spacing
- Test dark mode
- Add `.bg-noise` to body

### DON'T ❌
- Hardcode colors (`#0A0A0B`)
- Use px below 14px
- Skip dark mode testing
- Use pure black/white
- Ignore accessibility

---

## 🔍 Quick Debug

```typescript
// Print all tokens
console.log(themeTokens);

// Check current value
getComputedStyle(document.body).getPropertyValue('--theme-bg');
```

---

## 📖 Full Docs

- **Overview**: `packages/ui/src/design/README.md`
- **Tokens**: `packages/ui/src/design/tokens/README.md`
- **Changelog**: `packages/ui/src/design/CHANGELOG.md`

---

**Version**: 4.0.0 | **Updated**: Nov 27, 2025

