# Designer MCP Integration Tests

## 3-Phase Integration Test Plan

### Phase 1: Component Render Validation

Validates all UI components render correctly in browser

### Phase 2: Functional Behavior Testing

Tests interactive components function as expected

### Phase 3: Design System Compliance

Full design token and rule validation across all components

---

## Quick Start

```bash
# Run all phases
pnpm test:integration

# Run specific phase
pnpm test:phase1  # Render
pnpm test:phase2  # Functional
pnpm test:phase3  # Design Compliance
```

## Requirements

- Next.js dev server running on port 3000
- Designer MCP registered in mcp.json
- React Validation MCP available
