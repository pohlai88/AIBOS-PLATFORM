# AI-BOS Landing Page Engine MCP Server

> **Version:** 1.0.0  
> **Purpose:** Figma-level landing page generation following the AI-BOS "Artifact Layer" design system

## Overview

The Landing Page Engine MCP Server provides tools for generating production-ready landing pages that strictly comply with the AI-BOS design system. It implements the protocol defined in `.cursorrules` and provides programmatic access to design principles, templates, and validation.

## Tools

### 1. `get_landing_page_protocol`

Get the complete AI-BOS Landing Page Engine protocol and workflow instructions.

**Returns:** The master system instruction from `.cursorrules` that defines the 5-step workflow for generating landing pages.

### 2. `get_design_brief_template`

Get the reusable landing page request template.

**Returns:** The template from `LANDING_PAGE_TEMPLATE.md` that shows required inputs for generating a new landing page.

### 3. `get_design_principles`

Get AI-BOS design system principles.

**Parameters:**

- `category` (optional): `"colors" | "typography" | "utilities" | "motion" | "all"` (default: `"all"`)

**Returns:** Design tokens, color palette, typography rules, CSS utilities, and motion guidelines.

### 4. `validate_landing_page`

Validate HTML code against AI-BOS design system compliance.

**Parameters:**

- `html` (required): HTML code to validate

**Returns:** Validation report with:

- Issues (must fix): Forbidden colors, missing semantic HTML, accessibility problems
- Warnings (consider fixing): Missing utilities, typography suggestions
- Detailed checks by category (structure, colors, typography, utilities, accessibility)

## Installation

The server is automatically registered in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "aibos-landing-page-engine": {
      "command": "node",
      "args": [".mcp/landing-page-engine/server.mjs"]
    }
  }
}
```

## Usage

### Via Cursor MCP

Once registered, you can use the tools in Cursor:

```
Get the landing page protocol using aibos-landing-page-engine
```

```
Get design principles for colors using aibos-landing-page-engine
```

```
Validate this HTML code using aibos-landing-page-engine: [paste HTML]
```

### Direct Testing

```bash
cd .mcp/landing-page-engine
node server.mjs
```

## Design System Compliance

The server enforces strict compliance with:

- **Warm Void Palette:** `#0A0A0B` (Canvas), `#161618` (Surface), `#D4A373` (Accent)
- **Forbidden Colors:** No tech blue (`#2563eb`), error red (`#ff0000`), pure grey (`#808080`)
- **Typography:** Inter/Geist for human, JetBrains Mono for machine/data
- **Artifact Utilities:** `.bg-noise`, `.border-photonic`, `.text-metallic`, `.living-string`
- **Motion:** 60bpm rhythm, soft landing curves, magnetic interactions

## Integration with .cursorrules

This MCP server complements the `.cursorrules` file:

- **`.cursorrules`**: Provides the "brain rules" - the protocol the AI follows automatically
- **MCP Server**: Provides programmatic tools for accessing the protocol, templates, and validation

Together, they enable both automatic protocol following (via `.cursorrules`) and explicit tool-based access (via MCP).

## Related Files

- `.cursorrules` - Master system instruction (always active)
- `LANDING_PAGE_TEMPLATE.md` - Reusable request template
- `LANDING_PAGE_ENGINE_README.md` - Usage guide
- `design_principle.md` - AI-BOS design system reference

## License

MIT
