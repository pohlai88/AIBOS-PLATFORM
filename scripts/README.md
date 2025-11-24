# Scripts Documentation

This directory contains utility scripts for the AI-BOS monorepo.

## Available Scripts

### `sync-mcp-prompt.ts`

Syncs the MCP system prompt from `tools/MCP_SYSTEM_PROMPT.md` to the generated TypeScript file.

**Usage:**
```bash
pnpm sync-mcp-prompt
```

**When to run:**
- After editing `tools/MCP_SYSTEM_PROMPT.md`
- Before committing changes to the prompt
- Automatically runs in CI

### `validate-ui-constitution.ts`

Validates that all code follows the UI Constitution rules:
- No raw hex colors
- No Tailwind palette colors (bg-blue-600, etc.)
- No inline visual styles
- No direct Radix imports outside `packages/ui/src/components`

**Usage:**
```bash
pnpm lint:ui-constitution
```

**When to run:**
- Before committing new components
- In CI (automatically runs on PRs)
- When refactoring existing code

### `generate-ui-component.ts`

Generates UI components using the MCP UI generator.

**Usage:**
```bash
pnpm generate:ui <component-name> [description]
```

**Examples:**
```bash
# Generate a tabs component
pnpm generate:ui tabs

# Generate a dialog with description
pnpm generate:ui dialog "A modal dialog component with overlay"
```

**Requirements:**
- `@ai-sdk/openai` and `ai` packages installed
- `OPENAI_API_KEY` environment variable set
- `pnpm sync-mcp-prompt` run first

**What it does:**
1. Calls `runUiGeneratorAgent` from `.mcp/ui-generator/server.ts`
2. Passes your request with the system prompt
3. Generates component code following design system rules
4. Writes to `packages/ui/src/components/<name>.tsx`
5. Updates `packages/ui/src/components/index.ts`

**If dependencies not installed:**
The script will show helpful instructions and you can manually create components following the patterns in existing components.

## Workflow

### Creating a New Component

**Option 1: Using MCP Generator (Recommended)**
```bash
# 1. Generate the component
pnpm generate:ui tabs

# 2. Review the generated code
# 3. Test in your app
# 4. Verify compliance
pnpm lint:ui-constitution
```

**Option 2: Manual Creation**
```bash
# 1. Create packages/ui/src/components/tabs.tsx
# 2. Follow patterns from button.tsx, card.tsx, badge.tsx
# 3. Use tokens from packages/ui/src/design/tokens.ts
# 4. Export in packages/ui/src/components/index.ts
# 5. Verify compliance
pnpm lint:ui-constitution
```

### Updating the System Prompt

```bash
# 1. Edit tools/MCP_SYSTEM_PROMPT.md
# 2. Sync the prompt
pnpm sync-mcp-prompt
# 3. Commit both files
```

## API Alternative

For interactive development, you can also use the API route:

**POST** `/api/generate-ui`
```json
{
  "componentName": "tabs",
  "description": "A tabs component with multiple panels"
}
```

**Response:**
```json
{
  "success": true,
  "code": "// Generated component code..."
}
```

**Note:** Only available in development mode.

