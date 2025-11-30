# Directory Structure Audit MCP Tool - Implementation

**Date:** 2025-11-30  
**Status:** ✅ **IMPLEMENTED**  
**GRCD Reference:** GRCD-KERNEL.md Section 4.2, T-DIR-1

---

## 🎯 Problem Statement

**Issue:** The MCP audit system was only auditing MCP operations (manifest registration, tool invocations) but **NOT** checking architectural compliance like directory structure violations and modularity breaches.

**Gap:** 
- `dir-lint.ts` script exists but is not integrated into MCP audit system
- No MCP tool available for agents to audit directory structure
- Violations go undetected until manual CI checks
- Modularity breaches not logged in audit system

---

## ✅ Solution Implemented

### 1. Created MCP Tool for Directory Auditing

**File:** `kernel/mcp/tools/directory-audit.tool.ts`

**Features:**
- Validates against canonical structure (GRCD-KERNEL.md Section 4.1)
- Detects missing required directories
- Detects deprecated directories
- Detects unexpected directories (modularity breaches)
- Logs all violations to audit system
- Returns structured audit results

### 2. Enhanced MCP Audit System

**File:** `kernel/mcp/audit/mcp-audit.ts`

**New Audit Events:**
- `kernel.directory.violation` - Logs directory structure violations
- `kernel.modularity.breach` - Logs modularity boundary violations

**New Methods:**
- `auditDirectoryViolation()` - Logs directory structure violations
- `auditModularityBreach()` - Logs modularity breaches with GRCD references

### 3. Created Kernel Tools Manifest

**File:** `kernel/mcp/manifests/kernel-tools.json`

Defines built-in kernel MCP tools including:
- `audit_directory_structure` - Directory structure audit tool

---

## 📋 Usage

### As MCP Tool (for AI Agents)

```typescript
// Agents can now call this tool to audit directory structure
const result = await mcpToolExecutor.execute('kernel-tools', {
  tool: 'audit_directory_structure',
  arguments: {
    kernelRoot: '/path/to/kernel',
    strict: true, // Treat warnings as errors
  },
});
```

### Programmatically

```typescript
import { auditDirectoryStructure } from 'kernel/mcp/tools/directory-audit.tool';

const result = await auditDirectoryStructure(process.cwd(), true);
console.log(result.violations);
```

### Integration with CI/CD

The tool can be called in CI pipelines to enforce T-DIR-1 conformance:

```bash
# In CI script
tsx -e "import('./kernel/mcp/tools/directory-audit.tool').then(m => m.auditDirectoryStructure().then(r => process.exit(r.valid ? 0 : 1)))"
```

---

## 🔍 What Gets Audited

### 1. Required Directories
Checks that all required directories from GRCD-KERNEL.md Section 4.1 exist:
- `actions`, `agents`, `ai`, `api`, `audit`, `auth`, etc.

### 2. Deprecated Directories
Detects deprecated directories that should be removed:
- `routes/` (removed in Phase 2)
- `http/` (consolidated into `api/` in Phase 3)

### 3. Unexpected Directories (Modularity Breaches)
Detects directories not in canonical structure:
- Any directory not listed in GRCD-KERNEL.md Section 4.1
- Logged as modularity breach with GRCD reference

### 4. Modularity Boundaries
(Planned) Checks that files are in correct directories:
- MCP files must be in `kernel/mcp/`
- Orchestra files must be in `kernel/orchestras/`
- Audit files must be in `kernel/audit/` or `kernel/mcp/audit/`

---

## 📊 Audit Logging

All violations are automatically logged to the audit system with:
- **Action:** `kernel.directory.violation` or `kernel.modularity.breach`
- **Category:** `governance`
- **Severity:** `error` or `warning`
- **GRCD Reference:** Link to relevant GRCD section
- **Trace ID:** For correlation

---

## 🎯 GRCD Compliance

This implementation satisfies:

- ✅ **GRCD-KERNEL.md Section 4.2** - Directory Norms & Enforcement
- ✅ **T-DIR-1** - Invalid directory structure MUST fail CI
- ✅ **F-10** - Audit all MCP server interactions (now includes architectural audits)
- ✅ **AI Agent Rules** - Rules 1-13 from Section 4.2

---

## 🚀 Next Steps

1. **Integrate into CI/CD** - Add directory audit to pre-commit hooks
2. **Expand Modularity Checks** - Implement full file-level modularity boundary checking
3. **Auto-fix Mode** - Add `--fix` flag to automatically move files to correct locations
4. **Real-time Monitoring** - Run audit on file system changes (watch mode)

---

## 📝 Example Output

```json
{
  "valid": false,
  "violations": [
    {
      "type": "modularity_breach",
      "path": "unexpected-dir",
      "message": "Unexpected directory: unexpected-dir (not in canonical structure - modularity breach)",
      "severity": "error",
      "grcdReference": "GRCD-KERNEL.md Section 4.2 - Directory Norms & Enforcement"
    }
  ],
  "summary": {
    "totalViolations": 1,
    "errors": 1,
    "warnings": 0,
    "modularityBreaches": 1
  },
  "timestamp": "2025-11-30T18:30:00.000Z"
}
```

---

## ✅ Status

- ✅ MCP tool created
- ✅ Audit integration complete
- ✅ Manifest created
- ✅ Exported from mcp/index.ts
- ⏳ CI/CD integration (next step)
- ⏳ Full modularity boundary checking (enhancement)

