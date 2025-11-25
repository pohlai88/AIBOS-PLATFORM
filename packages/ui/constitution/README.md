# AI-BOS Constitution Framework

> **A Machine-Enforced Governance System for Tokens, Components & RSC**  
> **Version:** 2.2.0  
> **Last Updated:** 2025-01-27  
> **Status:** ✅ Enterprise-Grade, World-Class, Production-Ready

---

## 📘 AI-BOS Constitution Framework

### **A Machine-Enforced Governance System for Tokens, Components & RSC**

AI-BOS uses a **three-pillar Constitution System**:

1. **tokens.yml** — governs _design decisions_
2. **components.yml** — governs _component API + accessibility_
3. **rsc.yml** — governs _server boundaries + imports + CSS variable rules_

### Purpose

The purpose of this framework:

- Provide **machine-readable, MCP-enforceable rules**
- Ensure **UI consistency, accessibility, and safety**
- Guarantee **predictable AI code generation**
- Lock in **WCAG AA / AAA compliance**
- Allow **tenant personalization safely**
- Guarantee **safe mode + theme switching without drift**

### MCP Enforcement

The Constitution Framework is enforced by MCP tools:

- `mcp_react_validate_component`
- `mcp_theme_validate_tokens`
- `mcp_a11y_validate_component`
- `mcp_visual_regression_compare`
- `mcp_state_machine_validate`
- `mcp_rsc_check_boundary`
- `mcp_tailwind_tokens_read_config`

### Validation Pipeline

Every commit is validated across:

**Tokens → Components → RSC Boundaries → A11y → Motion → Visual Regression**

The entire UI system becomes:

**Predictable → Safe → AI-Generatable → Accessible → Immutable**

---

## 📁 Constitution Files

### `tokens.yml` (v2.1.0)

**Token governance and hierarchy rules**

- **Four-layer token system** (Global → Semantic → Component → Utility)
- **12 token categories** (color, spacing, typography, radius, shadow, motion, opacity, density,
  zIndex, focusRing, state, grid)
- **Canonical naming registry** (machine-enforceable prefixes)
- **Token immutability matrix** (what can/cannot be overridden)
- **Cross-category conflict rules** (prevents category mixing)
- **WCAG AA/AAA theme support** (fixed compliance themes)
- **Tenant override boundaries** (aesthetic theme only)
- **Safe Mode rules** (WCAG AAA enforcement)
- **Machine-readable rule IDs** (TOK-NAME-001, COL-001, etc.)
- **Source of Truth:** `packages/ui/src/design/tokens/globals.css`
- **Aligned with:** `docs/01-foundation/ui-system/tokens.md`

### `components.yml` (v2.1.0)

**Component structure and validation rules (120+ rules)**

- Component patterns (primitive, composition, functional, layout)
- Props rules and validation (discriminated unions, token mapping)
- Accessibility requirements (WCAG AA/AAA, touch targets, focus rings)
- State management patterns (state machines for complex components)
- Token alias mapping (variant → semantic tokens)
- Motion safety rules (reduced motion, animation budget)
- Safe Mode behavior (atomic application, WCAG AAA enforcement)
- Visual regression rules (snapshot testing, auto-rollback)
- **Version:** 2.1.0
- **Aligned with:** `docs/01-foundation/ui-system/components-philosophy.md`

### `rsc.yml` (v2.0.0)

**React Server Component boundary rules**

- Server/Client component separation
- Forbidden browser APIs in RSC
- Forbidden hooks in RSC (separated by category)
- Styling rules for RSC (CSS variables only)
- Import tracing rules (transitive validation)
- Server Actions validation (Zod schema enforcement)
- **Version:** 1.1.0
- **Status:** ✅ Up to date

---

## 🎯 Usage

These constitution files are used by:

1. **MCP Component Generator** (`.mcp/component-generator/server.mjs`)
   - Validates generated components against rules
   - Ensures AI-generated code follows design system
   - Enforces React-first architecture
   - Validates token usage (all 12 categories)
   - Validates RSC boundaries
   - Validates accessibility compliance

2. **UI Constitution Validator** (`.mcp/component-generator/tools/validate-constitution.ts`)
   - Validates existing code against rules
   - Prevents violations in codebase
   - Checks WCAG compliance
   - Validates token usage
   - Validates RSC boundaries

3. **Documentation**
   - References for design system rules
   - Governance documentation
   - MCP validation rules

---

## 🔗 Related Files

### Token Implementation

- **Source of Truth:** `packages/ui/src/design/tokens/globals.css` - CSS variable definitions
- **TypeScript Tokens:** `src/design/tokens.ts` - Type-safe token access
- **Documentation:** `docs/01-foundation/ui-system/tokens.md` - Complete token system

### Component Implementation

- **Components:** `packages/ui/src/components/` - Component implementations
- **Documentation:** `docs/01-foundation/ui-system/components-philosophy.md` - Component philosophy

### Documentation

- **UI System Docs:** `docs/01-foundation/ui-system/` - Complete UI system documentation
- **Accessibility:** `docs/01-foundation/ui-system/a11y-guidelines.md` - WCAG compliance
- **Spacing:** `docs/01-foundation/ui-system/spacing.md` - Spacing system
- **Typography:** `docs/01-foundation/ui-system/typography.md` - Typography system
- **Colors:** `docs/01-foundation/ui-system/colors.md` - Color system

---

## 📝 Token Source of Truth

**Important:** All base token values are defined in `packages/ui/src/design/tokens/globals.css` as
CSS variables.

The `tokens.yml` file defines:

- **Governance rules** for tokens
- **Four-layer token hierarchy** (Global → Semantic → Component → Utility)
- **12 token categories** with validation rules
- **Canonical naming registry** (machine-enforceable)
- **Token immutability matrix** (what can/cannot change)
- **Cross-category conflict rules** (prevents mixing)
- **WCAG theme support** (AA, AAA, High Contrast)
- **Tenant override boundaries** (aesthetic theme only)
- **Safe Mode rules** (WCAG AAA enforcement)
- **Machine-readable rule IDs** (for MCP validation)
- **Reference** to `globals.css` as source of truth

When `globals.css` tokens change:

1. Update token values in `packages/ui/src/design/tokens/globals.css`
2. Update `tokens.yml` if governance rules change
3. Update `src/design/tokens.ts` if TypeScript types change
4. Update `docs/01-foundation/ui-system/tokens.md` if documentation changes

---

## 🎨 Token Categories (12 Total)

1. **Color Tokens** - Colors, surfaces, text, accents, status, borders
2. **Spacing Tokens** - 4px baseline grid, semantic spacing, density modes
3. **Typography Tokens** - Major Third scale, semantic typography, WCAG compliance
4. **Radius Tokens** - Border radius, semantic radius
5. **Shadow Tokens** - Box shadows, elevation
6. **Motion Tokens** - Animation durations, easing functions, reduced motion
7. **Opacity Tokens** - Opacity values for states
8. **Density Tokens** - Density modes (compact, default, comfortable)
9. **Z-Index / Layer Tokens** - Layering system for overlays
10. **Focus Ring Tokens** - WCAG-compliant focus indicators
11. **Component State Tokens** - Hover, active, disabled, selected states
12. **Grid & Layout Tokens** - Grid spacing, layout dimensions, containers

**See:** `docs/01-foundation/ui-system/tokens.md` for complete documentation.

---

## ✅ Validation

To validate code against constitution rules:

```bash
# Validate UI constitution
pnpm lint:ui-constitution

# Generate component (validates against constitution)
# Use MCP component-generator server or CLI tool
```

**MCP Validation Tools:**

- `mcp_react_validate_component` - React patterns validation
- `mcp_react_validate_rsc_boundary` - RSC boundary validation
- `mcp_react_check_server_client_usage` - Server/client usage validation
- `mcp_a11y_validate_component` - WCAG compliance validation
- `mcp_theme_validate_tokens` - Token usage validation
- `mcp_tailwind_validate_token_exists` - Token existence validation
- `mcp_tailwind_validate_tailwind_class` - Tailwind class validation
- `mcp_figma_get_variable_defs` - Figma token sync validation
- `mcp_state_machine_validate` - State machine validation
- `mcp_motion_validate_animations` - Motion safety validation
- `mcp_visual_regression_compare` - Visual regression validation

---

## 🌐 Theme Support

**Supported Themes:**

- **Default (Aesthetic)** - Professional, elegant design (tenant-customizable)
- **WCAG AA** - Legal compliance (fixed, no tenant override)
- **WCAG AAA** - Highest accessibility (fixed, no tenant override)
- **High Contrast** - Maximum contrast (fixed, no tenant override)
- **Safe Mode** - Cognitive comfort (disables tenant branding, enforces WCAG AAA)

**See:** `docs/01-foundation/ui-system/tokens.md` for theme documentation.

---

## 📚 Component Categories

**Four Component Categories:**

1. **Primitives** - React-first, token-first, no Radix UI
2. **Compositions** - Radix UI-based, accessibility-critical interactive components
3. **Functional Components** - Data-driven (TanStack Table, Recharts, React Flow)
4. **Layouts** - Page-level components (AppShell, Header, Sidebar)

**See:** `docs/01-foundation/ui-system/components-philosophy.md` for complete documentation.

---

## 🔄 Sync Strategy

See `CONSTITUTION_SYNC.md` for the complete sync pipeline and validation strategy.

**Golden Rule:** Only `globals.css` can create new raw values. Everything else references upward.

---

---

## 🔄 Validation Pipeline

The validation pipeline executes validators in the correct order:

```
Token Validator (Priority A)
    ↓
Component Validator (Priority C) ──┐
RSC Validator (Priority B) ────────┤ (can run in parallel)
    ↓                              │
A11y Validator (Priority D)       │
    ↓                              │
Motion Validator (Priority E)       │
    ↓                              │
Visual Validator (Priority F) ──────┘
```

**⚠️ Important:** Validators are located in `.mcp/component-generator/tools/validators/` (NOT in
this directory).

They are **utility modules** used by MCP servers, not MCP servers themselves.

**See:** `.mcp/component-generator/tools/validators/README.md` for validator documentation.

---

## 📊 Constitution Index

The `constitution-index.yml` file serves as the **master brain** for all validators:

- Defines execution order
- Maps validators to constitutions
- Provides version governance
- Enables auto-discovery

**Location:** `.mcp/component-generator/tools/validators/constitution-index.yml`

**Note:** Constitution YAML files (`tokens.yml`, `components.yml`, `rsc.yml`) remain in
`packages/ui/constitution/` as the source of truth.

---

**Last Updated:** 2025-01-27  
**Version:** 2.2.0  
**Maintained By:** AIBOS Platform Team  
**Status:** ✅ Enterprise-Grade, Machine-Enforceable, World-Class, Production-Ready
