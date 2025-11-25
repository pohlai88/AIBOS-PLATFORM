# Constitution Validators

> **Location:** `.mcp/component-generator/tools/validators/`  
> **Purpose:** Utility modules for constitution validation (NOT MCP servers)  
> **Used By:** `.mcp/component-generator/server.mjs`

---

## ⚠️ Important: These are NOT MCP Servers

These validators are **utility modules** that can be imported by MCP servers. They are **NOT** MCP servers themselves.

- ✅ **Correct Location:** `.mcp/component-generator/tools/validators/`
- ❌ **Wrong Location:** `packages/ui/constitution/validators/` (was here, now moved)

---

## 📁 Structure

```
.mcp/component-generator/tools/validators/
├── constitution-index.yml      # Master index
├── load-constitution.mjs       # Constitution loader
├── validation-pipeline.mjs     # Orchestrator
├── token-validator.mjs         # Token validation
├── rsc-validator.mjs          # RSC boundary validation
├── component-validator.mjs    # Component validation
├── a11y-validator.mjs         # Accessibility validation
├── motion-validator.mjs       # Motion/animation validation
├── visual-validator.mjs       # Visual regression validation
└── utils/
    ├── import-tracer.mjs
    ├── ast-tools.mjs
    └── css-variable-extractor.mjs
```

---

## 🚀 Usage in MCP Server

```javascript
// .mcp/component-generator/server.mjs

import { runValidationPipeline } from "./tools/validators/validation-pipeline.mjs";

async function generateComponent(request) {
  const code = generateCode(request);
  
  // Run validation pipeline
  const validation = await runValidationPipeline(null, {
    filePath: request.filePath,
    code: code,
  });

  if (!validation.valid) {
    return {
      success: false,
      errors: validation.results
        .filter(r => !r.result.valid)
        .flatMap(r => r.result.violations),
    };
  }

  return {
    success: true,
    code: code,
    validation: validation,
  };
}
```

---

## 📊 Validators

### **1. Token Validator** (Priority A)
- Token existence in globals.css
- Token naming conventions
- WCAG contrast compliance
- Tenant override boundaries

### **2. RSC Validator** (Priority B)
- Forbidden browser APIs
- Forbidden React hooks
- Import chain tracing
- Hydration safety

### **3. Component Validator** (Priority C)
- Component structure
- Props validation
- Token alias mapping

### **4. A11y Validator** (Priority D)
- ARIA attributes
- Keyboard navigation
- WCAG compliance

### **5. Motion Validator** (Priority E)
- Animation budgets
- Reduced motion support

### **6. Visual Validator** (Priority F)
- Snapshot baselines
- Visual diff thresholds

---

## 🔄 Integration

These validators are imported by:
- `.mcp/component-generator/server.mjs` - Component generation with validation

They can also be used by:
- Other MCP servers that need constitution validation
- CI/CD pipelines
- Pre-commit hooks

---

## 📝 Constitution Files

The validators read from:
- `packages/ui/constitution/tokens.yml`
- `packages/ui/constitution/components.yml`
- `packages/ui/constitution/rsc.yml`

These files remain in `packages/ui/constitution/` as they are the source of truth.

---

**Last Updated:** 2025-01-27  
**Version:** 2.2.0  
**Status:** ✅ Moved to Correct Location

