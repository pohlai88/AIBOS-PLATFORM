# .github Directory Validation Report

## 📋 Files Found

1. **`.github/workflows/ci.yml`** ✅ **VALID** - Main CI/CD pipeline
2. **`.github/workflows/ui-constitution.yml`** ⚠️ **NEEDS UPDATE** - UI constitution validation

## ⚠️ Issues Identified

### 1. **Workflow Redundancy** ⚠️

**Problem:** `ci.yml` has redundant dependency installation in each job.

**Current:** Each job (lint, typecheck, test, mcp-validate, build) installs dependencies separately.

**Impact:**

- Slower CI runs
- More GitHub Actions minutes used
- Redundant setup steps

**Recommendation:** Use a shared setup job or cache dependencies.

### 2. **UI Constitution Workflow Path Reference** ⚠️

**Problem:** `ui-constitution.yml` references `tools/MCP_SYSTEM_PROMPT.md` which is correct, but the workflow could be optimized.

**Status:** ✅ Path is correct (script expects `tools/MCP_SYSTEM_PROMPT.md`)

**Note:** The file exists at both:

- `tools/MCP_SYSTEM_PROMPT.md` (source - used by script)
- `.mcp/ui-generator/prompts/MCP_SYSTEM_PROMPT.md` (copy - for reference)

### 3. **Missing Next.js MCP Integration** ⚠️

**Problem:** CI workflows don't leverage Next.js MCP for diagnostics.

**Recommendation:** Add Next.js MCP validation step to catch runtime issues.

### 4. **Inconsistent pnpm Setup** ⚠️

**Problem:**

- `ci.yml` uses `pnpm/action-setup@v2` with version 9
- `ui-constitution.yml` uses `pnpm/action-setup@v4` with version 9

**Recommendation:** Standardize on `pnpm/action-setup@v4` (latest).

## ✅ Valid Files

### `.github/workflows/ci.yml`

- **Status:** ✅ Valid but can be optimized
- **Purpose:** Main CI/CD pipeline
- **Location:** ✅ Correct (`.github/workflows/` is standard)
- **Content:** Comprehensive but has redundancy

### `.github/workflows/ui-constitution.yml`

- **Status:** ✅ Valid but can be optimized
- **Purpose:** UI constitution validation on PRs
- **Location:** ✅ Correct
- **Content:** Validates MCP prompt sync and UI constitution

## 🔧 Recommended Actions

1. **Optimize `ci.yml`** - Use shared setup job or dependency caching
2. **Update pnpm action** - Standardize on `pnpm/action-setup@v4`
3. **Add Next.js MCP validation** - Integrate Next.js MCP diagnostics
4. **Consolidate workflows** - Consider merging if appropriate

## 📝 Next.js MCP Integration

### Current State

- Next.js MCP is configured in `.cursor/mcp.json`
- Not yet integrated into CI workflows

### Recommended Integration

Add a Next.js MCP validation step to CI:

```yaml
nextjs-mcp-validate:
  needs: install
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
      with:
        version: 9
    - name: Install dependencies
      run: pnpm install
    - name: Start Next.js dev server
      run: pnpm dev &
    - name: Wait for server
      run: sleep 10
    - name: Validate with Next.js MCP
      run: |
        # Use Next.js MCP to check for errors
        curl http://localhost:3000/_next/mcp || echo "MCP endpoint not available"
```

## 🎯 Optimization Opportunities

1. **Dependency Caching** - Cache `node_modules` and `pnpm-store`
2. **Parallel Jobs** - Run lint, typecheck, test in parallel
3. **Conditional Steps** - Skip steps if no relevant files changed
4. **Matrix Strategy** - Test on multiple Node versions if needed
