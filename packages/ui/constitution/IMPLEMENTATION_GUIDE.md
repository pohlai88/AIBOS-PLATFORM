# Constitution Validator Implementation Guide

> **Version:** 1.0.0  
> **Date:** 2025-01-27  
> **Status:** ✅ Complete Implementation

---

## 📁 Folder Structure

```
packages/ui/constitution/
├── constitution-index.yml          # Central registry
├── load-constitution.mjs           # Constitution loader
├── tokens.yml                      # Token governance (v2.1.0)
├── components.yml                  # Component rules (v2.1.0)
├── rsc.yml                         # RSC boundaries (v2.0.0)
├── validators/
│   ├── token-validator.mjs        # Priority A - Token validation
│   ├── rsc-validator.mjs          # Priority B - RSC boundaries
│   ├── component-validator.mjs    # Priority C - Component structure
│   ├── a11y-validator.mjs         # Priority D - Accessibility
│   ├── validation-pipeline.mjs    # Orchestrator
│   └── utils/
│       ├── import-tracer.mjs      # Import chain tracing
│       ├── ast-tools.mjs          # AST parsing utilities
│       └── css-variable-extractor.mjs  # CSS token extraction
└── IMPLEMENTATION_GUIDE.md        # This file
```

---

## 🚀 Quick Start

### 1. Install Dependencies

Add to `packages/ui/package.json`:

```json
{
  "dependencies": {
    "@babel/parser": "^7.23.0",
    "@babel/traverse": "^7.23.0",
    "yaml": "^2.3.0"
  }
}
```

### 2. Use in MCP Server

```javascript
import { runAllValidations } from './packages/ui/constitution/validators/validation-pipeline.mjs'

// In your MCP server
const results = await runAllValidations(filePath, fileContent)

if (!results.valid) {
  // Handle violations
  console.error('Validation failed:', results.violations)
}
```

---

## 📋 Validator Modules

### **token-validator.mjs** (Priority A)

**Purpose:** Validates token usage against `tokens.yml`

**Validates:**

- ✅ Token existence in globals.css (VAL-001)
- ✅ Token naming conventions (VAL-002, TOK-NAME-001-004)
- ✅ WCAG contrast compliance (VAL-003, COL-003)
- ✅ Tenant override rules (VAL-004, TENANT-001-003)
- ✅ Safe Mode rules (VAL-005, SAFE-001-008)
- ✅ Density mode support (VAL-006)
- ✅ State token validation (VAL-007)
- ✅ Cross-category conflicts (VAL-008, CONFLICT-001-005)
- ✅ Token hierarchy (TOK-HIER-001-031)

**Usage:**

```javascript
import { validateToken, validateTokensInFile } from './token-validator.mjs'

// Validate single token
const result = await validateToken('--color-accent', filePath)

// Validate all tokens in file
const result = await validateTokensInFile(filePath, fileContent)
```

---

### **rsc-validator.mjs** (Priority B)

**Purpose:** Validates RSC boundaries against `rsc.yml`

**Validates:**

- ✅ Forbidden browser globals (RSC-003)
- ✅ Forbidden hooks (RSC-002)
- ✅ Forbidden imports (RSC-006)
- ✅ Radix UI in RSC (RSC-006)
- ✅ Hydration safety (RSC-006)
- ✅ Async side effects (RSC-006)
- ✅ Import chain tracing (RSC-006)
- ✅ Server Actions validation (RSC-006)
- ✅ Server component styling (RSC-001)

**Usage:**

```javascript
import { validateRSCBoundaries, validateServerActions } from './rsc-validator.mjs'

// Validate RSC boundaries
const result = await validateRSCBoundaries(filePath, fileContent)

// Validate Server Actions
const result = validateServerActions(filePath, fileContent)
```

---

### **component-validator.mjs** (Priority C)

**Purpose:** Validates component structure against `components.yml`

**Validates:**

- ✅ Component structure (forwardRef, displayName) (COMP-001-003)
- ✅ Props validation
- ✅ Styling rules (COMP-STYLE-001-003)
- ✅ Token alias mapping
- ✅ State machine requirements (COMP-STATE-001)
- ✅ Component category detection

**Usage:**

```javascript
import { validateComponent, detectComponentCategory } from './component-validator.mjs'

// Validate component
const result = await validateComponent(filePath, fileContent)

// Detect category
const category = detectComponentCategory(filePath, fileContent)
// Returns: "primitive" | "composition" | "functional" | "layout"
```

---

### **a11y-validator.mjs** (Priority D)

**Purpose:** Validates accessibility compliance

**Validates:**

- ✅ Keyboard navigation (A11Y-KEY-001-002)
- ✅ ARIA attributes (A11Y-ARIA-001-004)
- ✅ Contrast compliance (A11Y-CONTRAST-001)
- ✅ Focus management (A11Y-FOCUS-001-003)
- ✅ Touch targets (A11Y-TOUCH-001)
- ✅ Typography WCAG (A11Y-TYPE-001)

**Usage:**

```javascript
import { validateAccessibility } from './a11y-validator.mjs'

// Validate accessibility (warnings only, doesn't block)
const result = await validateAccessibility(filePath, fileContent)
```

---

### **validation-pipeline.mjs** (Orchestrator)

**Purpose:** Runs all validators in correct order

**Execution Order:**

1. Token validation (Priority A - required)
2. RSC validation (Priority B - can run in parallel)
3. Component validation (Priority C - depends on token)
4. A11y validation (Priority D - warnings only)

**Usage:**

```javascript
import { runAllValidations, formatValidationResults } from './validation-pipeline.mjs'

// Run all validations
const results = await runAllValidations(filePath, fileContent)

// Format for MCP response
const formatted = formatValidationResults(results)
```

---

## 🔧 Utility Modules

### **import-tracer.mjs**

Traces import chains to detect transitive RSC violations.

**Functions:**

- `traceImport()` - Trace single import
- `checkImportChain()` - Check entire import chain

### **ast-tools.mjs**

AST parsing and analysis utilities.

**Functions:**

- `parseFile()` - Parse file to AST
- `hasForwardRef()` - Check for forwardRef
- `hasDisplayName()` - Check for displayName
- `hasUseClientDirective()` - Check for 'use client'
- `checkForbiddenGlobals()` - Check browser APIs
- `checkForbiddenHooks()` - Check React hooks
- `extractImports()` - Extract all imports
- `importsRadixUI()` - Check for Radix imports
- `isAsyncComponent()` - Check if async

### **css-variable-extractor.mjs**

Extracts and validates CSS variables from globals.css.

**Functions:**

- `extractCSSVariables()` - Extract all CSS variables
- `tokenExists()` - Check if token exists
- `validateTokenNaming()` - Validate naming convention
- `getTokenValue()` - Get token value
- `extractTokenReferences()` - Extract var() references
- `validateTokenHierarchy()` - Validate hierarchy

---

## 🔌 Integration with MCP Server

### Example Integration

```javascript
// .mcp/component-generator/server.mjs

import {
  runAllValidations,
  formatValidationResults,
} from '../../packages/ui/constitution/validators/validation-pipeline.mjs'

// In your component generation handler
async function generateComponent(request) {
  const generatedCode = generateCode(request)
  const filePath = request.filePath

  // Run validation pipeline
  const validationResults = await runAllValidations(filePath, generatedCode)

  if (!validationResults.valid) {
    return {
      success: false,
      errors: validationResults.violations,
      warnings: validationResults.warnings,
    }
  }

  return {
    success: true,
    code: generatedCode,
    validation: formatValidationResults(validationResults),
  }
}
```

---

## 📊 Validation Results Format

```javascript
{
  valid: boolean,
  violations: [
    {
      rule: "VAL-001",
      type: "token_not_found",
      message: "Token --color-accent does not exist in globals.css",
      file: "path/to/file.tsx",
      line: 42,
      token: "--color-accent"
    }
  ],
  warnings: [
    {
      rule: "A11Y-KEY-001",
      type: "missing_keyboard_handler",
      message: "Interactive element should have keyboard handlers",
      file: "path/to/file.tsx",
      line: 15
    }
  ],
  byValidator: {
    token: { valid: true, violations: [], warnings: [] },
    rsc: { valid: true, violations: [], warnings: [] },
    component: { valid: true, violations: [], warnings: [] },
    a11y: { valid: true, violations: [], warnings: [] }
  },
  summary: {
    token: { valid: true, violations: 0, warnings: 0 },
    rsc: { valid: true, violations: 0, warnings: 0 },
    component: { valid: true, violations: 0, warnings: 0 },
    a11y: { valid: true, violations: 0, warnings: 0 }
  },
  metadata: {
    filePath: "path/to/file.tsx",
    timestamp: "2025-01-27T12:00:00.000Z",
    validatorsRun: ["token", "rsc", "component", "a11y"],
    executionOrder: ["token", "rsc", "component", "a11y"]
  }
}
```

---

## 🎯 Next Steps

### 1. Install Dependencies

```bash
cd packages/ui
pnpm add @babel/parser @babel/traverse yaml
```

### 2. Update MCP Server

Integrate `validation-pipeline.mjs` into your component generator.

### 3. Test Validators

Create test files to verify validators work correctly.

### 4. Add CI Integration

Run validators in CI/CD pipeline before merge.

---

## ✅ Implementation Status

| Component                  | Status      | Notes               |
| -------------------------- | ----------- | ------------------- |
| constitution-index.yml     | ✅ Complete | Central registry    |
| load-constitution.mjs      | ✅ Complete | Constitution loader |
| token-validator.mjs        | ✅ Complete | Priority A          |
| rsc-validator.mjs          | ✅ Complete | Priority B          |
| component-validator.mjs    | ✅ Complete | Priority C          |
| a11y-validator.mjs         | ✅ Complete | Priority D          |
| validation-pipeline.mjs    | ✅ Complete | Orchestrator        |
| import-tracer.mjs          | ✅ Complete | Import tracing      |
| ast-tools.mjs              | ✅ Complete | AST utilities       |
| css-variable-extractor.mjs | ✅ Complete | CSS extraction      |

---

**Last Updated:** 2025-01-27  
**Status:** ✅ Ready for Integration
