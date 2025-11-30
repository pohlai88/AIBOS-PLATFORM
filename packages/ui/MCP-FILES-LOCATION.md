# 📍 MCP Files Location - Frontend UI Package

**Date:** 2025-01-27  
**Purpose:** Complete inventory of all MCP (Model Context Protocol) files in the frontend UI package

---

## 📂 MCP Directory Structure

```
packages/ui/mcp/
├── ui.mcp.json                    # Master UI package MCP
├── ui-components.mcp.json         # Components layer MCP
├── ui-globals-css.mcp.json        # CSS variables SSOT MCP
├── ui-token-theme.mcp.json        # Theme management layer MCP
├── ui-testing.mcp.json            # Testing infrastructure MCP
├── components/                    # MCP component utilities
│   ├── index.ts
│   └── ThemeCssVariables.tsx
├── hooks/                         # MCP validation & generation hooks
│   ├── index.ts
│   ├── useMcpComponents.ts
│   ├── useMcpTheme.ts
│   └── useMcpValidation.ts
├── providers/                     # MCP context providers
│   ├── index.ts
│   ├── McpProvider.tsx
│   └── ThemeProvider.tsx
├── tools/                        # Runtime validation tools
│   ├── index.ts
│   ├── ComponentValidator.ts
│   ├── ValidationPipeline.ts
│   └── VariableBatcher.ts
├── types/                         # MCP type definitions
│   └── mcp.ts
└── index.ts                       # Main MCP export
```

---

## 📋 MCP Seed Files (5 Total)

### 1. Master UI Package MCP

**File:** `packages/ui/mcp/ui.mcp.json`

**Purpose:** Master MCP seed file for the entire UI package

**Key Features:**
- Theme-first architecture enforcement
- RSC boundary validation
- Token usage validation
- Directory structure enforcement
- Dependency compatibility matrix

**Related Files:**
- References: `ui-globals-css.mcp.json`, `ui-token-theme.mcp.json`, `ui-components.mcp.json`
- GRCD: `GRCD-UI.md`

---

### 2. Components Layer MCP

**File:** `packages/ui/mcp/ui-components.mcp.json`

**Purpose:** MCP seed file for component generation and validation

**Key Features:**
- Component token usage validation (no direct imports)
- RSC boundary enforcement
- Accessibility patterns (WCAG 2.2 AA/AAA)
- Test coverage enforcement (95% minimum)
- Component composition patterns

**Related Files:**
- GRCD: `GRCD-COMPONENTS.md`
- Components: `packages/ui/src/components/`

---

### 3. CSS Variables SSOT MCP

**File:** `packages/ui/mcp/ui-globals-css.mcp.json`

**Purpose:** MCP seed file for `globals.css` governance

**Key Features:**
- CSS variable naming conventions
- Duplicate variable detection
- Theme hierarchy validation
- WCAG contrast validation
- Semantic naming enforcement

**Related Files:**
- GRCD: `GRCD-GLOBALS-CSS.md`
- CSS: `packages/ui/src/design/tokens/globals.css`

---

### 4. Theme Management Layer MCP

**File:** `packages/ui/mcp/ui-token-theme.mcp.json`

**Purpose:** MCP seed file for theme and token layer governance

**Key Features:**
- ThemeProvider validation
- Token import validation (no direct imports in components)
- Theme layer compliance check
- Tenant customization support
- WCAG theme support

**Related Files:**
- GRCD: `GRCD-TOKEN-THEME.md`
- Provider: `packages/ui/mcp/providers/ThemeProvider.tsx`
- Tokens: `packages/ui/src/design/tokens/tokens.ts`

---

### 5. Testing Infrastructure MCP

**File:** `packages/ui/mcp/ui-testing.mcp.json`

**Purpose:** MCP seed file for testing infrastructure governance

**Key Features:**
- Test pattern standardization
- Coverage enforcement (95% minimum)
- Accessibility testing integration
- Test utility usage validation
- Standardized test patterns

**Related Files:**
- GRCD: `GRCD-TESTING.md`
- Tests: `packages/ui/tests/`
- Test Utils: `packages/ui/tests/utils/`

---

## 🔧 MCP Implementation Files

### Hooks (`mcp/hooks/`)

- **`useMcpComponents.ts`** - Component generation and validation hooks
- **`useMcpTheme.ts`** - Theme management hooks
- **`useMcpValidation.ts`** - Validation hooks for components

### Providers (`mcp/providers/`)

- **`McpProvider.tsx`** - Main MCP context provider
- **`ThemeProvider.tsx`** - Theme context provider (controls CSS variables)

### Tools (`mcp/tools/`)

- **`ComponentValidator.ts`** - Component validation logic
- **`ValidationPipeline.ts`** - Validation pipeline orchestration
- **`VariableBatcher.ts`** - CSS variable batching utilities

### Types (`mcp/types/`)

- **`mcp.ts`** - TypeScript type definitions for MCP

---

## 📊 MCP File Summary

| File | Component | Version | Last Updated | Status |
|------|-----------|--------|--------------|--------|
| `ui.mcp.json` | ui | 1.0.0 | 2025-01-27 | ✅ Active |
| `ui-components.mcp.json` | components | 1.0.0 | 2025-01-27 | ✅ Active |
| `ui-globals-css.mcp.json` | globals.css | 1.0.0 | 2025-01-27 | ✅ Active |
| `ui-token-theme.mcp.json` | token-theme | 1.0.0 | 2025-01-27 | ✅ Active |
| `ui-testing.mcp.json` | ui-testing | 1.0.0 | 2025-01-27 | ✅ Active |

**Total MCP Seed Files:** 5  
**Total MCP Implementation Files:** 13  
**Status:** ✅ **All MCP files created and validated**

---

## 🔗 MCP File Relationships

```
ui.mcp.json (Master)
├── ui-globals-css.mcp.json (Layer 1: CSS Variables SSOT)
├── ui-token-theme.mcp.json (Layer 2: Theme Management)
└── ui-components.mcp.json (Layer 3: Component Consumption)
    └── ui-testing.mcp.json (Testing Infrastructure)
```

---

## 📖 Usage Instructions

### For AI Agents

1. **Load Master MCP:** Read `packages/ui/mcp/ui.mcp.json` at session start
2. **Load Layer-Specific MCPs:** Read relevant layer MCP files based on task
3. **Follow Constraints:** All constraints in MCP files are mandatory
4. **Validate Output:** Use MCP validation tools before committing

### For Developers

1. **Import MCP Hooks:** Use `@aibos/ui/mcp` for validation and theme management
2. **Use ThemeProvider:** Wrap application with `ThemeProvider` from `@aibos/ui/mcp/providers`
3. **Validate Components:** Use `ComponentValidator` for pre-commit validation
4. **Follow GRCD:** All MCP files reference GRCD documents as source of truth

---

## ✅ Validation Status

All MCP files have been:
- ✅ Created and validated
- ✅ Linked to appropriate GRCD documents
- ✅ Configured with proper constraints
- ✅ Integrated with implementation files
- ✅ Documented in `GRCD-ARCHITECTURE-OVERVIEW.md`

---

**Location:** `packages/ui/mcp/`  
**Status:** ✅ **All MCP files operational**  
**Last Verified:** 2025-01-27

