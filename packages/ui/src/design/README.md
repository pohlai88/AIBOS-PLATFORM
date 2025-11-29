# AI-BOS Design System v4.0

> **"Cinematic Intelligence Interface"** - The Artifact Layer Edition

A production-ready design system that combines **Swiss precision** with **cinematic aesthetics**. Built for enterprise AI governance with WCAG AA/AAA compliance.

---

## 🎯 Philosophy

### The Three Laws of AI-BOS UI

AI-BOS is not a standard SaaS—it's a **Life Workspace**. We don't use administrative aesthetics (flat blues, white backgrounds). We build **Artifacts**: interfaces that feel like physical, high-end hardware.

1. **Light, Not Paint** 
   - We don't draw borders; we catch light
   - See: `.border-photonic` - simulates studio lighting on physical objects
   - Psychology: The brain perceives depth through light refraction

2. **Texture, Not Flatness**
   - We use atmospheric grain to simulate film/paper
   - See: `.bg-noise` - transforms digital flat into tactile surfaces
   - Psychology: Texture suggests materiality and quality

3. **Physics, Not Animation**
   - Elements don't just fade; they float, drift, and react
   - See: `.hover-lift`, `.glow-pulse`, tether effects
   - Psychology: Real-world metaphors create intuitive interactions

**Result**: Interfaces that feel like artifacts, not webpages.

---

### The Three Pillars (Technical Foundation)

1. **Organic Precision** (Colors)
   - Warm blacks, not blue-tinted grays
   - Desaturated earth tones (Paper/Ink/Graphite/Ember)
   - No neon gradients - we're not a SaaS toy

2. **Cinematic Depth** (Physics)
   - Photonic borders (light refraction)
   - Atmospheric grain (film texture)
   - Metallic text (engraved steel)
   - Sentient glows (ambient intelligence)

3. **Enterprise Rigor** (Accessibility)
   - WCAG AA baseline (4.5:1 contrast)
   - WCAG AAA available (7:1 contrast)
   - Minimum 14px font size (Figma standard)
   - Auto-scaling typography

---

## 📦 Architecture

```
design/
├── tokens/           # Single Source of Truth (SSOT)
│   ├── globals.css   # Raw CSS variables + Artifact Layer
│   ├── tokens.ts     # TypeScript definitions
│   └── README.md     # Token documentation
│
├── themes/           # Theme variations
│   ├── default.css   # Light mode (WCAG AA)
│   ├── wcag-aa.css   # Enhanced contrast
│   ├── wcag-aaa.css  # Maximum accessibility
│   └── index.css     # Theme loader
│
└── utilities/        # Helper functions
    ├── cn.ts         # Class name merger
    └── token-helpers.ts # Token validators
```

---

## 🚀 Quick Start

### 1. Import the Design System

```typescript
// In your root layout/app
import '@/design/tokens/globals.css';
import '@/design/themes/index.css';
```

### 2. Use Tokens in Components

```tsx
import { themeTokens } from '@/design/tokens';

// ✅ CORRECT - Use theme tokens
<div style={{ color: themeTokens.fg }}>

// ❌ WRONG - Don't use raw colors
<div style={{ color: '#0A0A0B' }}>
```

### 3. Apply Artifact Layer Classes

```tsx
// Photonic borders (light refraction)
<Card className="border-photonic" />

// Metallic text (engraved steel)
<h1 className="text-metallic">Dashboard</h1>

// Atmospheric grain
<body className="bg-noise" />

// Sentient glow
<main className="glow-ambient" />
```

---

## 🎨 The Artifact Layer

### What Makes This Special?

Most design systems stop at **colors and spacing**. We add **physics**.

#### 1. Photonic Borders
Instead of flat `1px solid gray`, we use **light refraction**:

```css
.border-photonic {
  border-top: 1px solid rgba(255, 255, 255, 0.15); /* Top light catch */
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}
```

**Psychology**: The brain perceives this as a physical object under studio lighting.

#### 2. Atmospheric Grain
Subtle fractal noise overlay at 3.5% opacity:

```css
.bg-noise::before {
  background-image: url("data:image/svg+xml...");
  opacity: 0.035;
}
```

**Psychology**: Transforms "digital flat" into "anodized aluminum."

#### 3. Metallic Text
Gradient-filled text for headlines:

```css
.text-metallic {
  background: linear-gradient(180deg, #FFF 0%, #A8A29E 100%);
  -webkit-background-clip: text;
}
```

**Psychology**: Looks engraved, not printed. Luxury branding effect.

#### 4. Sentient Glow
Ambient radial gradient creates "AI presence":

```css
.glow-ambient {
  background: radial-gradient(
    circle at 50% -20%, 
    rgba(212, 163, 115, 0.08) 0%, 
    transparent 60%
  );
}
```

**Psychology**: Suggests intelligence without being distracting.

---

## 📏 Typography System (Figma Best Practices)

### Typography Philosophy: Human vs Machine

We contrast the **Human** (Sans) with the **Machine** (Mono) to create a rhythm between thought and data:

#### Human Voice (Sans-Serif)
- **Fonts**: Inter, Geist, or system sans
- **Usage**: Headlines, body copy, UI labels, explanations
- **Style**: Light weights (200-400), `.text-metallic` for large headers
- **Psychology**: Represents "what the AI understands" - meaning, context, narrative

#### Machine Voice (Monospace)
- **Font**: JetBrains Mono (MANDATORY for precision)
- **Usage**: **REQUIRED for**:
  - Numbers, percentages, probabilities (`87%`, `2.4M`)
  - Dates, timestamps (`09:02 AM`, `2025-11-27`)
  - Hashes, IDs, UUIDs (`#8X92...99`, `SHA: 8x99...21a`)
  - Code snippets, JSON payloads
  - MCP node identifiers (`Node 4`)
- **Style**: Uppercase, `tracking-wider`, desaturated color (`text-stone-500`)
- **Psychology**: Represents "how the AI works" - precision, logic, provenance

**Example**:
```tsx
<div className="border-photonic rounded-xl p-6">
  <h3 className="font-sans text-metallic text-2xl font-light">
    Network Intelligence
  </h3>
  <span className="font-mono text-xs text-stone-500 uppercase tracking-wider">
    HASH: 8X92...99 | CONFIDENCE: 94.1%
  </span>
</div>
```

---

### Font Size Scale

We follow **Figma's minimum 14px rule** with proper scaling:

```css
--font-xs:   0.875rem;  /* 14px - MINIMUM (Figma standard) */
--font-sm:   1rem;      /* 16px - Body text */
--font-base: 1.125rem;  /* 18px - Comfortable reading */
--font-lg:   1.25rem;   /* 20px - Subheadings */
--font-xl:   1.5rem;    /* 24px - Headings */
```

### Why 14px Minimum?

- ✅ Readable on all devices without zooming
- ✅ WCAG AA compliant
- ✅ Industry standard (Google, Apple, Figma)
- ✅ Reduces eye strain for long sessions

### Heading Scale (Type Scale: 1.25 - Perfect Fourth)

```css
--font-h6: 1rem;      /* 16px */
--font-h5: 1.25rem;   /* 20px */
--font-h4: 1.563rem;  /* 25px */
--font-h3: 1.953rem;  /* 31px */
--font-h2: 2.441rem;  /* 39px */
--font-h1: 3.052rem;  /* 49px */
```

### Display Sizes (Hero Headlines)

```css
--font-display-sm: 3.815rem;  /* 61px */
--font-display-md: 4.768rem;  /* 76px */
--font-display-lg: 5.96rem;   /* 95px */
```

---

## 🎨 Color System

### The "Organic Precision" Palette

#### Light Mode
```css
--color-bg:          #FAFAF9;  /* Warm Paper */
--color-fg:          #0A0A0B;  /* Ink */
--color-primary:     #1C1917;  /* Graphite */
--color-accent:      #D4A373;  /* Amber Ember */
```

#### Dark Mode (The "Void")

| Token | Hex | Material Name | Usage |
|-------|-----|---------------|-------|
| `--color-bg` | `#0A0A0B` | **The Void** | Main background - warm black, not blue-black |
| `--color-bg-muted` | `#161618` | **Graphite Glass** | Cards, sidebars (always with blur) |
| `--color-fg` | `#F2F0E9` | **Bone / Living Light** | Primary text - soft white |
| `--color-accent` | `#D4A373` | **Amber Ember** | The Human Element - interaction color |
| `--color-secondary` | `#64748B` | **Slate Steel** | Metadata, hashes, MCP nodes |
| `--color-accent-glow` | `rgba(212, 163, 115, 0.5)` | **Sentient Light** | Ambient backgrounds, glows |

### 🚫 Forbidden Colors (Anti-Patterns)

AI-BOS is not a standard SaaS. **Avoid these**:

- ❌ **"Tech Blue"** (`#2563eb`, `#3b82f6`) - Too generic/SaaS
- ❌ **"Pure Black"** (`#000000`) - Too harsh, use `#0A0A0B` (The Void)
- ❌ **"Pure White"** (`#FFFFFF`) - Reserved for light sources only
- ❌ **"Bright Red"** (`#ff0000`, `#ef4444`) - Use desaturated Rose (`#BE123C`)
- ❌ **"Pure Greys"** (`#808080`, `#666666`) - Use warm Stone variants

**Why**: These create "cheap SaaS" aesthetics. We're building artifacts, not admin panels.

### Status Colors (Desaturated)

```css
--color-success:  #059669;  /* Emerald-700 (not neon green) */
--color-warning:  #D97706;  /* Amber-700 (not yellow) */
--color-danger:   #BE123C;  /* Rose-700 (not bright red) */
```

**Philosophy**: Enterprise apps need calm status colors, not game notifications.

---

## 🔧 Component Guidelines

### When to Use Each Class

| Class | Use Case | Example |
|-------|----------|---------|
| `.border-photonic` | Cards, panels, containers | Dashboard cards |
| `.border-photonic-amber` | Active/selected states | Processing nodes |
| `.text-metallic` | Large headlines | Hero titles |
| `.bg-noise` | Full-page backgrounds | Body element |
| `.glow-ambient` | Section backgrounds | Main content area |
| `.animate-shimmer` | Loading states | AI processing |
| `.gradient-divider` | Content separators | Between sections |

### Responsive Usage

```tsx
// ✅ Mobile-first approach
<Card className="
  border-photonic 
  p-4 md:p-6 lg:p-8
  text-sm md:text-base
" />

// ❌ Don't use fixed sizes
<Card className="p-8 text-lg" />
```

---

## ♿ Accessibility

### WCAG Compliance Levels

1. **Default Theme**: WCAG AA (4.5:1 contrast)
   - Use for most applications
   - Passes all automated audits

2. **WCAG AAA Theme**: (7:1 contrast)
   - Use for government/healthcare
   - Enable via `data-theme="wcag-aaa"`

3. **Safe Mode**: High contrast + larger fonts
   - User preference override
   - Enable via `data-safe-mode="true"`

### Testing Contrast

```bash
# Use the built-in validator
npm run validate:contrast
```

---

## 🎭 Dark Mode

### Automatic Detection

```css
/* Respects system preference */
@media (prefers-color-scheme: dark) {
  :root { /* dark mode variables */ }
}
```

### Manual Override

```tsx
// Force dark mode
<html data-mode="dark">

// Force light mode
<html data-mode="light">
```

---

## 🏢 Multi-Tenancy

### Tenant Overrides

```css
/* DLB Bank (Green branding) */
:root[data-tenant='dlbb'] {
  --theme-brand: #15803d;
}

/* Enterprise (Purple branding) */
:root[data-tenant='enterprise'] {
  --theme-brand: #7c3aed;
}
```

**Important**: Overrides only affect `--theme-brand`. Core palette stays consistent.

---

## 📐 Spacing Scale

Based on 4px grid (Figma standard):

```css
--spacing-2xs: 0.25rem;  /* 4px */
--spacing-xs:  0.5rem;   /* 8px */
--spacing-sm:  0.75rem;  /* 12px */
--spacing-md:  1rem;     /* 16px */
--spacing-lg:  1.5rem;   /* 24px */
--spacing-xl:  2rem;     /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
--spacing-4xl: 6rem;     /* 96px */
```

---

## 🔍 Border Radius

Tighter than typical SaaS (more Swiss/editorial):

```css
--radius-sm:   0.25rem;  /* 4px */
--radius-md:   0.375rem; /* 6px */
--radius-lg:   0.5rem;   /* 8px */
--radius-xl:   0.75rem;  /* 12px */
--radius-2xl:  1rem;     /* 16px */
--radius-full: 9999px;   /* Pills */
```

**Philosophy**: ERPs look better with tight corners vs. rounded consumer apps.

---

## 🎬 Gradients

### Cinematic Gradients (NEW)

```css
/* Ember glow */
--gradient-ember: linear-gradient(135deg, #D4A373 0%, #B8866B 100%);

/* Void depth */
--gradient-void: linear-gradient(180deg, #0A0A0B 0%, #161618 100%);

/* Intelligence aura */
--gradient-intelligence: radial-gradient(
  circle at 50% 50%,
  rgba(212, 163, 115, 0.3) 0%,
  transparent 70%
);
```

### Usage

```tsx
<div style={{ background: 'var(--gradient-ember)' }} />
```

---

## ✨ Animations

### Motion Philosophy: The 60bpm Rhythm

**Concept**: AI-BOS elements breathe at **60 beats per minute** (1 beat = 1 second) - matching a resting heart rate.

```css
/* Slow breathing animations (60bpm = 1s cycle) */
@keyframes breathe {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.breathe {
  animation: breathe 1s ease-in-out infinite; /* 60bpm */
}

/* The "Soft Landing" curve - our signature easing */
--easing-tether: cubic-bezier(0.25, 0.8, 0.25, 1);
```

**Rhythm Guidelines**:
- **1 beat (1s)**: Pulsing indicators, active states
- **2 beats (2s)**: Loading states, processing
- **3 beats (3s)**: Ambient glows, background effects
- **Fast interactions**: 150ms-300ms (sub-beat)

**Psychology**: Matches human resting heart rate → feels "alive" not "robotic"

---

### Built-in Animations

```css
/* Shimmer (AI processing) - 3 beats */
.animate-shimmer { animation: shimmer 3s infinite linear; }

/* Pulse (AI activity) - 2 beats */
.ai-pulse { animation: pulse-ring 2s infinite; }

/* Glow breathing - 3 beats */
.glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
```

### Custom Timing

```css
--duration-fast:   150ms;       /* Sub-beat */
--duration-normal: 300ms;       /* Sub-beat */
--duration-slow:   500ms;       /* Sub-beat */
--duration-cinematic: 1000ms;   /* 1 beat (60bpm) */

--easing-smooth: cubic-bezier(0.25, 0.8, 0.25, 1);  /* The "Soft Landing" */
```

---

## 🌊 Advanced Effects

### The Living String (Visual Lineage)

**Concept**: Animated SVG paths that show decision provenance and data flow (see `audit-room.html`)

```css
/* SVG sine wave animation */
.living-string {
  stroke-dasharray: 10;
  animation: dash 30s linear infinite;
}

@keyframes dash {
  to { stroke-dashoffset: -1000; }
}
```

**SVG Setup**:
```html
<svg class="absolute inset-0 pointer-events-none">
  <defs>
    <linearGradient id="line-gradient">
      <stop offset="0%" stop-color="#64748B" stop-opacity="0.3" />
      <stop offset="50%" stop-color="#D4A373" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#64748B" stop-opacity="0.3" />
    </linearGradient>
  </defs>
  <path 
    d="M 350 300 C 500 300, 500 300, 650 300" 
    stroke="url(#line-gradient)" 
    stroke-width="2" 
    fill="none" 
    class="living-string" 
  />
</svg>
```

**When to use**:
- ✅ Decision provenance flows (audit trails)
- ✅ Data lineage visualization
- ✅ Hero moments (landing page)

**When NOT to use**:
- ❌ Regular navigation
- ❌ Form layouts
- ❌ Data tables

**Implementation**: See `audit-room.html` for production example

---

### The Tether Effect (Mouse Magnetization)

**Concept**: Elements subtly "lean" towards the cursor, creating responsive presence.

```css
/* CSS-only version */
.tether {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tether:hover {
  transform: translateY(-2px) scale(1.01);
}
```

**Enhanced JavaScript version** (3D tilt):
```javascript
const element = document.querySelector('.tether');

element.addEventListener('mousemove', (e) => {
  const rect = element.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  
  element.style.transform = `
    perspective(1000px)
    rotateY(${x * 5}deg) 
    rotateX(${-y * 5}deg)
    translateZ(10px)
  `;
});

element.addEventListener('mouseleave', () => {
  element.style.transform = '';
});
```

**Usage**: Cards, buttons, interactive panels

**Psychology**: Makes UI feel "responsive to human presence" - elements acknowledge the cursor.

---

## 🛠️ Development

### File Structure

```typescript
// tokens.ts - Single source of truth
export const colorTokens = { ... };
export const typographyTokens = { ... };
export const themeTokens = { ... };

// globals.css - CSS variables
@theme {
  --color-bg: #FAFAF9;
  --font-sm: 1rem;
}

// default.css - Theme mappings
:root {
  --theme-bg: var(--color-bg);
}
```

### Adding New Tokens

1. Add to `globals.css` (`@theme` block)
2. Export in `tokens.ts`
3. Map in theme file (`default.css`)
4. Document in this README
5. Update TypeScript types

### Validation

```bash
# Check for unused tokens
npm run tokens:check

# Validate contrast ratios
npm run tokens:contrast

# Generate token documentation
npm run tokens:docs
```

---

## 📚 Examples

### Dashboard Card

```tsx
<div className="border-photonic rounded-xl p-6 bg-black/40 backdrop-blur-xl hover-lift">
  <h3 className="text-metallic text-2xl font-light mb-2">
    Network Intelligence
  </h3>
  <p className="text-stone-400 text-sm leading-relaxed">
    Analyzing 40,201 nodes for latency anomalies.
  </p>
  <div className="gradient-divider my-4" />
  <button className="px-4 py-2 bg-[var(--color-accent)] text-black rounded-lg">
    Execute
  </button>
</div>
```

### Processing State

```tsx
<div className="border-photonic-amber relative overflow-hidden">
  <div className="absolute inset-0 animate-shimmer" />
  <span className="text-xs font-mono text-[#D4A373]">PROCESSING...</span>
</div>
```

### Full Page Layout

```tsx
<body className="bg-noise">
  <div className="glow-ambient min-h-screen">
    <header className="border-photonic backdrop-blur-xl">
      {/* ... */}
    </header>
    <main>
      {/* content */}
    </main>
  </div>
</body>
```

---

## 🎓 Best Practices

### DO ✅

- Use theme tokens (`themeTokens.fg`) not raw CSS variables
- Follow 14px minimum font size
- Apply `.bg-noise` to body for texture
- Use `.border-photonic` for depth
- Test in both light and dark modes
- Validate with WCAG tools

### DON'T ❌

- Hardcode colors (`#0A0A0B`)
- Use font sizes below 14px
- Skip dark mode testing
- Ignore contrast ratios
- Use pure black (`#000`) or pure white (`#FFF`)
- Add borders without photonic effect

---

## 🚀 Migration from v3.x

### Breaking Changes

1. **Minimum font size**: `12px` → `14px`
2. **New required classes**: `.bg-noise`, `.border-photonic`
3. **Token structure**: Added gradient and interactive state tokens
4. **Heading scale**: Changed to Perfect Fourth (1.25 ratio)

### Migration Steps

```bash
# 1. Update dependencies
npm install @aibos/ui@^4.0.0

# 2. Run codemod
npx @aibos/codemod v3-to-v4

# 3. Update imports
# Change: import '@/design/globals.css'
# To:     import '@/design/tokens/globals.css'

# 4. Test dark mode
npm run test:theme
```

---

## 📖 Further Reading

- [Figma Typography Best Practices](https://www.figma.com/best-practices/typography/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Swiss Design Principles](https://www.swissmiss.com/)
- [Material Design Type Scale](https://m2.material.io/design/typography/the-type-system.html)

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/aibos/platform/issues)
- **Docs**: [design.aibos.ai](https://design.aibos.ai)
- **Slack**: `#design-system` channel

---

**Version**: 4.0.0  
**Last Updated**: November 27, 2025  
**Maintainer**: AI-BOS Design Team

