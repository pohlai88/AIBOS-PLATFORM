# AI-BOS Component Implementation Matrix

> **Purpose**: Design compliance checklist for every component. Engineers MUST verify against this before PR approval.

---

## 🎨 Core Design Rules

### The Three Laws (MANDATORY)
1. **Light, Not Paint** - Use `.border-photonic`, never flat borders
2. **Texture, Not Flatness** - Use `.bg-noise` on all dark backgrounds
3. **Physics, Not Animation** - Use our easing curves, 60bpm rhythm

---

## 📋 Complete Component Matrix

### Page-Level Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Page Background** | `bg-[#0A0A0B]` + `.bg-noise` | `bg-black`, `bg-gray-900` |
| **Main Content Area** | `.glow-ambient` (ambient radial gradient) | No gradient |
| **Full Page Scroll** | `.smooth-scroll` | Default scroll |

---

### Layout Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Cards/Panels** | `.border-photonic` + `.rounded-xl` | `border`, `border-gray-700` |
| **Active Cards** | `.border-photonic-amber` | Blue borders |
| **Hover Cards** | `.hover-lift` | Scale-only transforms |
| **Glass Panels** | `.backdrop-blur-glass` + `bg-black/40` | Solid backgrounds |
| **Sidebars** | `bg-black/40` + `.backdrop-blur-xl` + `border-white/5` | Opaque sidebars |

---

### Typography Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Hero Headlines (H1)** | `.text-metallic` + `text-5xl` + `font-light` | Flat `text-white`, bold weights |
| **Section Headlines (H2)** | `.text-metallic` + `text-3xl` + `font-light` | Standard white text |
| **Subheadings (H3-H6)** | `text-white` + `font-sans` + `font-medium` | Gradients on small text |
| **Body Text** | `text-stone-300` + `text-sm` + `leading-relaxed` | Pure white, tight spacing |
| **Muted Text** | `text-stone-400` + `text-sm` | Grey-500 or darker |
| **Data/Numbers** | `font-mono` + `uppercase` + `tracking-wider` + `text-stone-500` | Sans font for data |
| **Hashes/IDs** | `font-mono` + `text-xs` + `text-stone-600` | Sans font, large size |
| **Probabilities** | `font-mono` + `text-[#64748B]` (Slate Steel) | Colored text, sans font |
| **Timestamps** | `font-mono` + `text-[10px]` + `uppercase` | Sans font, normal case |

---

### Button Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Primary Action** | `bg-[#D4A373]` + `text-[#0A0A0B]` + `rounded-lg` + `font-mono` | Blue buttons, `rounded-full` |
| **Secondary Action** | `bg-white/5` + `border-white/10` + `text-white` + `hover:bg-white/10` | Grey backgrounds |
| **Danger Action** | `bg-[#BE123C]` + `text-white` | Bright red (#ff0000) |
| **Ghost Button** | `text-stone-400` + `hover:text-white` + `border-none` | Grey borders |
| **Icon Button** | `p-2` + `rounded-md` + `hover:bg-white/5` | Large padding |
| **Button Hover** | Duration: 300ms, Easing: smooth | Instant changes |

---

### Input Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Text Input** | `.focus-ring` + `bg-white/5` + `border-white/10` + `rounded-lg` | Blue focus rings |
| **Search Bar** | `.border-photonic-amber` + `.backdrop-blur-xl` + Floating | Inline inputs |
| **Textarea** | Same as Text Input + `min-h-[100px]` | Auto-resize |
| **Select Dropdown** | `bg-black/60` + `.backdrop-blur-xl` + `border-white/10` | White backgrounds |

---

### Data Display Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Metric Cards** | `.border-photonic` + Large mono number + Small sans label | Sans for numbers |
| **Probability Display** | `font-mono` + `text-2xl` + `text-[#64748B]` | Colored backgrounds |
| **Status Badge** | `bg-{color}-900/30` + `border-{color}-500/20` + `text-{color}-400` | Bright colors |
| **Progress Bar** | `bg-white/10` + `bg-[#D4A373]` (fill) | Blue progress |
| **Data Table Header** | `font-mono` + `text-xs` + `uppercase` + `tracking-wider` | Sans headers |
| **Data Table Cell** | `font-mono` + `text-sm` + `text-stone-300` | Sans for data |
| **JSON Display** | `font-mono` + `text-xs` + `bg-black/50` + Line numbers | Sans font |

---

### Interactive Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Modal Backdrop** | `bg-black/80` + `.backdrop-blur-strong` | Solid black |
| **Modal Panel** | `.border-photonic` + `.backdrop-blur-xl` + `bg-black/60` | White modals |
| **Tooltip** | `bg-black` + `border-white/20` + `text-xs` | Large tooltips |
| **Dropdown Menu** | `.border-photonic` + `.backdrop-blur-xl` + `bg-black/90` | White menus |
| **Toast Notification** | `.border-photonic-amber` + `.slide-up` | Bottom center |

---

### Loading & Empty States

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Loading Spinner** | `.animate-spin-slow` + Amber color | Fast spinning, blue |
| **Shimmer Loading** | `.animate-shimmer` | Grey blocks |
| **Processing State** | `.border-photonic-amber` + Shimmer overlay | Static state |
| **Empty State** | Muted icon + `text-stone-500` + "No data" | Large illustrations |
| **Skeleton** | `.animate-shimmer` + `bg-white/5` | Grey boxes |

---

### Navigation Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Header** | `h-14` + `border-b border-white/5` + `.backdrop-blur-xl` | Solid background |
| **Nav Link (Active)** | `text-[#D4A373]` | Blue, underline |
| **Nav Link (Inactive)** | `text-stone-400` + `hover:text-white` | Grey-500 |
| **Breadcrumb** | `font-mono` + `text-xs` + `/` separator | Arrows, sans font |

---

### Chart & Graph Components

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Line Chart** | Amber stroke (`#D4A373`) + Gradient fill | Bright colors |
| **Bar Chart** | Amber bars with dark background | Multiple colors |
| **Axis Labels** | `font-mono` + `text-xs` + `text-stone-500` | Sans font |
| **Grid Lines** | `stroke-white/5` | Bold grid lines |
| **Chart Tooltip** | `.border-photonic` + Dark background | White tooltips |

---

### Audit Room Specific

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Lineage SVG Path** | `.living-string` + Gradient stroke | Solid color |
| **Decision Node** | Circular + `.border-photonic` + `bg-black` | Squares |
| **Active Node** | `.border-photonic-amber` + Glow | Blue highlight |
| **Evidence Drawer** | Right sidebar + `.backdrop-blur-xl` + JSON mono | Modal |
| **Hash Display** | `font-mono` + `text-xs` + `break-all` | Sans, no-wrap |

---

### Command Stream Specific

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Intent Bar** | Floating bottom-center + `.border-photonic-amber` + `.backdrop-blur-xl` | Top bar |
| **Prediction Card** | `.border-photonic` + Vertical stream | Grid layout |
| **Confidence Score** | `font-mono` + Large size + `text-[#64748B]` | Colored backgrounds |
| **Execute Button** | `bg-[#D4A373]` + `text-black` + `font-mono` + `font-bold` | Blue, rounded-full |

---

### Hero Landing Specific

| Component | Correct Implementation | ❌ Forbidden |
|-----------|----------------------|-------------|
| **Background** | `.bg-noise` + `bg-[#0A0A0B]` + `.glow-ambient` | Flat black |
| **Living String Canvas** | Full viewport + `opacity-60` + White stroke | Static graphic |
| **Hero H1** | `.text-metallic` + `text-6xl` + `font-extralight` | Flat white |
| **CTA Button** | Large + Amber + Mono font | Small, blue |

---

## 🎨 Animation Compliance

### Timing (60bpm Rhythm)

| Animation Type | Duration | Easing | ❌ Forbidden |
|---------------|----------|--------|-------------|
| **Hover Effects** | 300ms | `var(--easing-smooth)` | Instant |
| **Modal Open/Close** | 500ms | `var(--easing-smooth)` | Linear |
| **Page Transitions** | 700ms | `var(--easing-smooth)` | 200ms |
| **Pulse/Breathing** | 1s (60bpm) | `ease-in-out` | 2.3s random |
| **Ambient Glow** | 3s | `ease-in-out` | 1.5s |
| **Loading Shimmer** | 3s | `linear` | 500ms |

---

## 🚫 Global Forbidden Patterns

### Never Use These
- ❌ `bg-blue-500` or any blue accent
- ❌ `border-gray-*` (use `border-white/10`)
- ❌ Pure `#000000` or `#FFFFFF`
- ❌ `rounded-full` on buttons (use `rounded-lg`)
- ❌ `shadow-lg` (use custom shadows or `.border-photonic`)
- ❌ Font weights above 500
- ❌ `uppercase` on sans-serif (only mono)
- ❌ Multiple accent colors
- ❌ Bright status colors (use desaturated)
- ❌ Animations faster than 150ms

---

## ✅ Quality Checklist (Before PR)

Engineers must verify:

- [ ] Background has `.bg-noise`
- [ ] All cards use `.border-photonic`
- [ ] All numbers/data use `font-mono`
- [ ] All headlines use `.text-metallic` (if H1/H2)
- [ ] Primary button is Amber (`#D4A373`)
- [ ] No blue accents anywhere
- [ ] Animation timing follows 60bpm rhythm
- [ ] Hover states use `.hover-lift` or equivalent
- [ ] Focus states use `.focus-ring`
- [ ] Dark mode tested (should be default)

---

## 📖 References

- **Token System**: `packages/ui/src/design/tokens/globals.css`
- **Utility Classes**: `packages/ui/src/design/tokens/globals.css` (@layer utilities)
- **Theme Tokens**: `packages/ui/src/design/themes/default.css`
- **Quick Reference**: `packages/ui/src/design/QUICK-REFERENCE.md`
- **Full Guide**: `packages/ui/src/design/README.md`

---

**Version**: 4.0  
**Last Updated**: November 27, 2025  
**Enforcement**: MANDATORY for all PRs

