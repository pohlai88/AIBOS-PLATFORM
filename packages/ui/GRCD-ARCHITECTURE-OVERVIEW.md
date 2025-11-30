# 🏗️ GRCD Architecture Overview - UI Package

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Purpose:** Overview of layered GRCD architecture for UI package

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: GRCD-GLOBALS-CSS.md                          │
│  ─────────────────────────────────────────────────────  │
│  File: globals.css                                       │
│  Role: CSS Variables SSOT                                │
│  Defines: All design tokens as CSS custom properties    │
│  Governance: CSS variable naming, theme overrides       │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: GRCD-TOKEN-THEME.md                           │
│  ─────────────────────────────────────────────────────  │
│  Files: ThemeProvider.tsx, tokens.ts, client.ts         │
│  Role: Theme Management Layer                            │
│  Controls: CSS variables via DOM attributes             │
│  Governance: Theme-first architecture, no direct imports│
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: GRCD-COMPONENTS.md                            │
│  ─────────────────────────────────────────────────────  │
│  Files: All component files in src/components/          │
│  Role: Component Consumer Layer                         │
│  Consumes: Design tokens via Tailwind classes           │
│  Governance: No direct token imports, RSC boundaries   │
└─────────────────────────────────────────────────────────┘
```

---

## GRCD Document Structure

### 1. GRCD-GLOBALS-CSS.md (Foundation Layer)

**Purpose:** Governs `globals.css` - the CSS variables source of truth

**Key Sections:**

- CSS variable naming conventions (Section 3.1)
- Token definition rules (Section 3.2)
- Theme override hierarchy (Section 3.3)
- No duplication policy (Section 4.1)

**Critical Rules:**

- All CSS variables defined in `globals.css` only
- Semantic naming: `--color-*`, `--radius-*`, `--shadow-*`
- Theme hierarchy: Safe Mode > WCAG > Dark > Tenant > Base

**MCP Seed:** `/mcp/ui-globals-css.mcp.json`

---

### 2. GRCD-TOKEN-THEME.md (Bridge Layer)

**Purpose:** Governs ThemeProvider and token consumption patterns

**Key Sections:**

- ThemeProvider architecture (Section 3.1)
- Token consumption rules (Section 3.2)
- Component token usage patterns (Section 3.3)

**Critical Rules:**

- ThemeProvider controls CSS variables via DOM attributes
- Components MUST NOT import tokens directly from `tokens.ts`
- Components MUST use Tailwind classes referencing CSS variables
- `tokens.ts` is for MCP validation only, not component imports

**MCP Seed:** `/mcp/ui-token-theme.mcp.json`

---

### 3. GRCD-COMPONENTS.md (Consumer Layer)

**Purpose:** Governs component implementation and token consumption

**Key Sections:**

- Component token usage patterns (Section 3.1)
- RSC boundary enforcement (Section 3.2)
- Component directory structure (Section 3.3)
- Migration guide (Section 5)

**Critical Rules:**

- No direct token imports in components
- Use Tailwind classes referencing CSS variables
- Respect RSC boundaries (Server/Client/Shared)
- No hardcoded design values

**MCP Seed:** `/mcp/ui-components.mcp.json`

---

### 4. GRCD-UI.md (Master Document)

**Purpose:** Master GRCD that references all layer-specific GRCDs

**Key Sections:**

- Overview of all layers
- Cross-layer requirements
- Master MCP profile
- References to layer-specific GRCDs

**MCP Seed:** `/mcp/ui.mcp.json`

---

## How GRCDs Prevent Violations

### Violation Prevention Flow

```
1. Developer/AI Agent starts work
   ↓
2. Loads appropriate GRCD (GRCD-GLOBALS-CSS.md, GRCD-TOKEN-THEME.md, or GRCD-COMPONENTS.md)
   ↓
3. GRCD specifies correct patterns and forbidden patterns
   ↓
4. MCP validates against GRCD rules
   ↓
5. Violations flagged automatically
   ↓
6. Developer/AI Agent fixes violations
```

### Example: Preventing Direct Token Import

**Scenario:** Developer wants to create a Button component

**Without GRCD:**

```tsx
// ❌ Developer might do this (wrong)
import { colorTokens } from '../../../design/tokens/tokens'
<button className={colorTokens.bgElevated}>
```

**With GRCD-COMPONENTS.md:**

1. Developer reads GRCD-COMPONENTS.md Section 3.1
2. Sees correct pattern: `className="bg-bg-elevated"`
3. Sees forbidden pattern: `import { colorTokens } from 'tokens.ts'`
4. Follows correct pattern
5. MCP validates: ✅ Pass

---

## GRCD Usage Guide

### For CSS Variables Work

**Use:** `GRCD-GLOBALS-CSS.md`

- Adding new CSS variables
- Modifying theme overrides
- Understanding token naming

### For Theme Management Work

**Use:** `GRCD-TOKEN-THEME.md`

- Implementing ThemeProvider
- Understanding theme flow
- Validating token consumption

### For Component Work

**Use:** `GRCD-COMPONENTS.md`

- Creating new components
- Migrating existing components
- Understanding token consumption patterns

### For Overall Architecture

**Use:** `GRCD-UI.md`

- Understanding complete architecture
- Cross-layer requirements
- Master governance rules

---

## MCP Integration

Each GRCD has its own MCP seed file:

1. `/mcp/ui-globals-css.mcp.json` - For globals.css work
2. `/mcp/ui-token-theme.mcp.json` - For theme layer work
3. `/mcp/ui-components.mcp.json` - For component work
4. `/mcp/ui.mcp.json` - Master MCP for overall UI package

**Usage:**

- Load appropriate MCP seed based on work type
- MCP enforces GRCD rules automatically
- Violations flagged in real-time

---

## Benefits of Layered GRCD Architecture

### 1. Focused Governance

- Each layer has its own GRCD
- Clear responsibilities
- No overlap or confusion

### 2. Prevents DRY Violations

- Single source of truth per layer
- No duplication of rules
- Clear hierarchy

### 3. Scalable Architecture

- Easy to extend each layer independently
- Clear boundaries
- Maintainable structure

### 4. AI Agent Friendly

- Clear patterns for each layer
- Forbidden patterns documented
- MCP validation automated

---

## Current Status

### ✅ Completed Items

1. ✅ **GRCD Documents Created**
   - GRCD-GLOBALS-CSS.md
   - GRCD-TOKEN-THEME.md
   - GRCD-COMPONENTS.md
   - GRCD-UI.md (updated)
   - GRCD-TESTING.md
   - GRCD-ARCHITECTURE-OVERVIEW.md (this document)

2. ✅ **MCP Seed Files Created**
   - `/mcp/ui.mcp.json` (Master MCP file)
   - `/mcp/ui-globals-css.mcp.json`
   - `/mcp/ui-token-theme.mcp.json`
   - `/mcp/ui-components.mcp.json`
   - `/mcp/ui-testing.mcp.json`

3. ✅ **Testing Infrastructure Complete**
   - Vitest 2.0.0 configured with 95% coverage thresholds
   - 1,203 tests passing (33 test files)
   - All primitive components tested (31 components)
   - Typography components tested (2 components)
   - Accessibility testing integrated (WCAG AA/AAA)
   - Test utilities created (`renderWithTheme`, `expectAccessible`)

4. ✅ **Component Migration Complete**
   - **37/37 components migrated (100%)**
   - All shared primitives migrated (31/31)
   - All typography components migrated (2/2)
   - All client compositions migrated (4/4)
   - All components use Tailwind classes referencing CSS variables
   - No direct token imports remaining

5. ✅ **Validation Infrastructure Implemented**
   - MCP validation tools exist (`ComponentValidator`, `ValidationPipeline`)
   - Validation hooks implemented (`useMcpValidation`)
   - MCP Provider set up (`McpProvider`)
   - Constitution rule enforcement active

6. ✅ **CSS Optimization Complete**
   - CSS variable count: 199 (under target of 200)
   - File size: ~23.65KB (within target of <50KB)
   - Unused CSS removed (foundation classes, extended spacing tokens)
   - MCP indicators made development-only
   - Dark mode backgrounds differentiated

### ⚪ Pending Items

1. ⚪ **Validation Infrastructure Enforcement** (Deferred - waiting for frontend stability)
   - Pre-commit hooks (Husky)
   - CI/CD integration
   - Automated validation in build pipeline

2. ⚪ **Performance Monitoring** (Future)
   - Bundle size monitoring
   - Runtime performance tracking
   - Component render performance

---

**Status:** ✅ **GRCD Architecture Fully Implemented**  
**Architecture:** Layered GRCD structure prevents violations and ensures scalability  
**Implementation Status:** Core architecture complete, enforcement infrastructure deferred until frontend is stable

**Last Updated:** 2025-01-27  
**Next Review:** After frontend stabilization
