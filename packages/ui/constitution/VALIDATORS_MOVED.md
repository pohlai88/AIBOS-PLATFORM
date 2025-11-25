# ⚠️ Validators Moved to MCP Directory

> **Date:** 2025-01-27  
> **Action:** Validators moved from `packages/ui/constitution/validators/` to `.mcp/component-generator/tools/validators/`

---

## 🎯 Why Moved?

The validators are **utility modules** used by MCP servers, NOT MCP servers themselves.

According to the MCP architecture:
- ✅ **MCP servers** → `.mcp/[server-name]/server.mjs`
- ✅ **MCP tools/utilities** → `.mcp/[server-name]/tools/`
- ❌ **NOT** in `packages/ui/constitution/validators/`

---

## 📁 New Location

```
.mcp/component-generator/tools/validators/
├── constitution-index.yml
├── load-constitution.mjs
├── validation-pipeline.mjs
├── token-validator.mjs
├── rsc-validator.mjs
├── component-validator.mjs
├── a11y-validator.mjs
├── motion-validator.mjs
├── visual-validator.mjs
└── utils/
    ├── import-tracer.mjs
    ├── ast-tools.mjs
    └── css-variable-extractor.mjs
```

---

## 🔄 What Stays in `packages/ui/constitution/`?

These files remain here (they are the source of truth):

- ✅ `tokens.yml` - Token governance rules
- ✅ `components.yml` - Component governance rules
- ✅ `rsc.yml` - RSC boundary rules
- ✅ `README.md` - Constitution documentation
- ✅ `CONSTITUTION_SYNC.md` - Sync status

---

## 📝 Update Imports

If you have any code importing from the old location:

```javascript
// ❌ OLD (wrong)
import { runValidationPipeline } from 
  "packages/ui/constitution/validators/validation-pipeline.mjs";

// ✅ NEW (correct)
import { runValidationPipeline } from 
  "./tools/validators/validation-pipeline.mjs";
```

---

## ✅ Verification

- [x] Validators moved to `.mcp/component-generator/tools/validators/`
- [x] Paths updated in `load-constitution.mjs`
- [x] Paths updated in `validation-pipeline.mjs`
- [x] README created in new location
- [x] Constitution files remain in `packages/ui/constitution/`

---

**Last Updated:** 2025-01-27  
**Status:** ✅ Migration Complete

