# ✅ Priority 2: Validation Infrastructure Enforcement

**Date:** 2025-01-27  
**Status:** Setup Guide  
**Purpose:** Set up automated validation to enforce GRCD rules

---

## Executive Summary

Since all components are migrated (Priority 1 complete), we now need to set up validation infrastructure to **prevent future violations** and **enforce GRCD rules automatically**.

---

## 🎯 Setup Checklist

### 1. Pre-commit Hooks (Husky)

**Status:** ⚪ To be implemented

**Actions:**
- [ ] Install Husky: `pnpm add -D husky`
- [ ] Initialize Husky: `pnpm exec husky init`
- [ ] Create pre-commit hook
- [ ] Add validation scripts

**Files to Create:**
- `.husky/pre-commit` - Runs validation before commit

### 2. MCP Validation Hook

**Status:** ⚪ To be implemented

**Actions:**
- [ ] Create validation script: `scripts/validate-mcp.mjs`
- [ ] Check for token imports
- [ ] Check for hardcoded values
- [ ] Validate RSC boundaries
- [ ] Run in pre-commit hook

### 3. Test Coverage Check

**Status:** ⚪ To be implemented

**Actions:**
- [ ] Add coverage check to pre-commit
- [ ] Ensure 95% threshold
- [ ] Fail if below threshold

### 4. TypeScript Type Check

**Status:** ⚪ To be implemented

**Actions:**
- [ ] Add `tsc --noEmit` to pre-commit
- [ ] Ensure no type errors

### 5. Linting Check

**Status:** ⚪ To be implemented

**Actions:**
- [ ] Add linting to pre-commit
- [ ] Use existing ESLint config

### 6. CI/CD Integration

**Status:** ⚪ To be implemented

**Actions:**
- [ ] Add validation step to CI
- [ ] Add test coverage step
- [ ] Add bundle size check
- [ ] Configure failure thresholds

---

## 📝 Implementation Steps

### Step 1: Install Husky

```powershell
cd packages/ui
pnpm add -D husky
pnpm exec husky init
```

### Step 2: Create Pre-commit Hook

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run validations
pnpm validate:mcp
pnpm test:coverage:check
pnpm type-check
pnpm lint
```

### Step 3: Add Validation Scripts to package.json

```json
{
  "scripts": {
    "validate:mcp": "node scripts/validate-mcp.mjs",
    "test:coverage:check": "vitest run --coverage --coverage.threshold.lines=95",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx"
  }
}
```

### Step 4: Create MCP Validation Script

Create `scripts/validate-mcp.mjs`:

```javascript
// Check for token imports
// Check for hardcoded values
// Validate RSC boundaries
// Report violations
```

### Step 5: Configure CI/CD

Add to `.github/workflows/ci.yml` or similar:

```yaml
- name: Validate MCP
  run: pnpm validate:mcp

- name: Test Coverage
  run: pnpm test:coverage:check

- name: Type Check
  run: pnpm type-check

- name: Lint
  run: pnpm lint
```

---

## ✅ Success Criteria

- [ ] Pre-commit hooks active
- [ ] MCP validation runs automatically
- [ ] Test coverage enforced (95% minimum)
- [ ] TypeScript errors caught
- [ ] Linting errors caught
- [ ] CI/CD validation passing
- [ ] No violations can be committed

---

**Status:** ⚪ **READY TO IMPLEMENT**  
**Next Action:** Install Husky and create pre-commit hook

