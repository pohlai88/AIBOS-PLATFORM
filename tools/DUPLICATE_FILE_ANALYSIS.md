# Duplicate File Analysis - MCP_SYSTEM_PROMPT.md

## Issue Identified

There are **two copies** of `MCP_SYSTEM_PROMPT.md`:

1. **`tools/MCP_SYSTEM_PROMPT.md`** (361 lines) - ✅ **SOURCE FILE**
2. **`.mcp/ui-generator/prompts/MCP_SYSTEM_PROMPT.md`** (358 lines) - ⚠️ **DUPLICATE/LEGACY**

## Analysis

### Source File: `tools/MCP_SYSTEM_PROMPT.md` ✅

**Status:** ✅ **ACTIVE - This is the source of truth**

- Used by `scripts/sync-mcp-prompt.ts` to generate TypeScript file
- More detailed documentation links (lines 5-8)
- Referenced in `.mcp/ui-generator/README.md`
- This is the file that should be edited

**Workflow:**

1. Edit `tools/MCP_SYSTEM_PROMPT.md`
2. Run `pnpm sync-mcp-prompt`
3. Generates `.mcp/ui-generator/systemPrompt.generated.ts`

### Duplicate File: `.mcp/ui-generator/prompts/MCP_SYSTEM_PROMPT.md` ⚠️

**Status:** ⚠️ **DUPLICATE - Not used by sync script**

- Not referenced in `scripts/sync-mcp-prompt.ts`
- Not imported by `.mcp/ui-generator/server.mjs`
- Slightly different content (simpler documentation links)
- Appears to be a legacy/backup copy
- Creates confusion about which file to edit

**Differences:**

- Line 5-6: Simpler documentation reference
- Missing detailed links to `packages/ui/ui-docs/`
- 3 lines shorter (358 vs 361)

## Recommendation

### ✅ **Remove the duplicate file**

**Action:** Delete `.mcp/ui-generator/prompts/MCP_SYSTEM_PROMPT.md`

**Reason:**

1. Not used by the sync script
2. Not imported by the MCP server
3. Creates confusion about which file to edit
4. The correct workflow uses `tools/MCP_SYSTEM_PROMPT.md` → `systemPrompt.generated.ts`

**Safe to remove because:**

- The sync script only reads from `tools/MCP_SYSTEM_PROMPT.md`
- The MCP server uses `systemPrompt.generated.ts` (TypeScript), not the markdown file
- No code references the `.mcp/ui-generator/prompts/` directory

## Correct Workflow

```
1. Edit: tools/MCP_SYSTEM_PROMPT.md (SOURCE)
   ↓
2. Run: pnpm sync-mcp-prompt
   ↓
3. Generates: .mcp/ui-generator/systemPrompt.generated.ts (USED BY MCP SERVER)
```

## Files to Keep

- ✅ `tools/MCP_SYSTEM_PROMPT.md` - Source file (edit this)
- ✅ `.mcp/ui-generator/systemPrompt.generated.ts` - Generated file (auto-generated)

## Files to Remove

- ❌ `.mcp/ui-generator/prompts/MCP_SYSTEM_PROMPT.md` - Duplicate (not used)

## Verification

After removal, verify:

1. `pnpm sync-mcp-prompt` still works
2. MCP server can import `systemPrompt.generated.ts`
3. No code references the `prompts/` directory
