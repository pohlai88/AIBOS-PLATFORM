# Constitution Framework Quick Start

> **Version:** 2.2.0  
> **Status:** ✅ Production-Ready

---

## 🚀 5-Minute Setup

### **1. Install Dependencies**

```bash
cd packages/ui
pnpm add @babel/parser @babel/traverse yaml
```

### **2. Use in Your Code**

```javascript
import { runValidationPipeline } from './packages/ui/constitution/validators/validation-pipeline.mjs'

// Validate a component
const results = await runValidationPipeline(null, {
  filePath: 'path/to/component.tsx',
  code: componentCode,
})

if (!results.valid) {
  console.error('Validation failed:', results.results)
}
```

### **3. Integration with MCP Server**

```javascript
// .mcp/component-generator/server.mjs
import { runValidationPipeline } from '../../packages/ui/constitution/validators/validation-pipeline.mjs'

async function generateComponent(request) {
  const code = generateCode(request)

  const validation = await runValidationPipeline(null, {
    filePath: request.filePath,
    code: code,
  })

  return {
    code,
    validation,
    valid: validation.valid,
  }
}
```

---

## 📁 File Structure

```
packages/ui/constitution/
├── constitution-index.yml      # Master brain
├── load-constitution.mjs       # Constitution loader
├── tokens.yml                  # Token governance
├── components.yml              # Component rules
├── rsc.yml                     # RSC boundaries
├── validators/
│   ├── token-validator.mjs     # Priority A
│   ├── rsc-validator.mjs       # Priority B
│   ├── component-validator.mjs # Priority C
│   ├── a11y-validator.mjs     # Priority D
│   ├── motion-validator.mjs    # Priority E
│   ├── visual-validator.mjs    # Priority F
│   └── validation-pipeline.mjs # Orchestrator
└── validators/utils/
    ├── import-tracer.mjs
    ├── ast-tools.mjs
    └── css-variable-extractor.mjs
```

---

## ✅ What Gets Validated

### **Token Validator**

- Token exists in globals.css
- Token naming conventions
- WCAG contrast compliance
- Tenant override boundaries
- Safe Mode rules

### **RSC Validator**

- Forbidden browser APIs
- Forbidden React hooks
- Forbidden imports (Radix UI)
- Hydration safety
- Server Actions validation

### **Component Validator**

- forwardRef and displayName
- Props validation
- Token alias mapping
- State machine requirements

### **A11y Validator**

- ARIA attributes
- Keyboard navigation
- Focus management
- Touch targets
- WCAG compliance

### **Motion Validator**

- Animation budgets
- Reduced motion support
- Motion token usage
- Performance optimization

### **Visual Validator**

- Snapshot baselines
- Visual diff thresholds
- Auto-rollback rules

---

## 📊 Validation Results

```javascript
{
  valid: true,
  results: [
    {
      step: "token",
      validator: "validators/token-validator.mjs",
      result: { valid: true, violations: [], warnings: [] }
    },
    // ... more validators
  ]
}
```

---

## 🔧 Configuration

All configuration is in `constitution-index.yml`:

```yaml
pipeline:
  - token
  - component
  - rsc
  - a11y
  - motion
  - visual
```

To skip a validator:

```javascript
const results = await runAllValidations(filePath, content, {
  skipA11y: true,
  skipMotion: true,
})
```

---

**See:** `IMPLEMENTATION_GUIDE.md` for complete documentation.
