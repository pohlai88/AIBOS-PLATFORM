# Layer 3: Enterprise Functional Components

> **Data-driven components using React-first headless libraries**  
> **NO Radix UI** - Uses TanStack Table, Recharts, React Flow, TipTap

---

## Overview

Layer 3 components are enterprise-grade, data-driven functional components built with React-first headless libraries. These components handle complex business logic, data visualization, and workflow management.

**Key Characteristics:**
- ✅ NO Radix UI (uses React-first headless libraries)
- ✅ Data-driven and business logic-heavy
- ✅ Client Components (`"use client"`)
- ✅ Complex state management
- ✅ Virtualization and performance optimization
- ✅ Token-based styling (no raw colors)
- ✅ WCAG AA/AAA compliance

---

## Directory Structure

```
functional/
├── data-tables/           # TanStack Table v8
│   ├── data-table/
│   ├── data-table-header/
│   ├── data-table-toolbar/
│   ├── data-table-pagination/
│   └── ...
├── data-visualization/    # Recharts / Visx
│   ├── line-chart/
│   ├── bar-chart/
│   ├── pie-chart/
│   └── ...
├── workflow/              # dnd-kit, custom
│   ├── kanban-board/
│   ├── timeline/
│   ├── stepper/
│   └── ...
├── mapping-graphs/        # React Flow
│   ├── network-graph/
│   ├── workflow-diagram/
│   └── ...
├── editors/               # TipTap / Lexical
│   ├── rich-text-editor/
│   ├── markdown-editor/
│   └── ...
└── business-widgets/      # Various
    ├── calendar/
    ├── file-uploader/
    └── ...
```

---

## Required Dependencies

Before building Layer 3 components, install the required libraries:

```bash
# Data Tables
pnpm add @tanstack/react-table

# Data Visualization
pnpm add recharts
# OR for advanced visualizations
pnpm add @visx/group @visx/scale @visx/shape @visx/axis

# Workflow / DnD
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Graphs
pnpm add reactflow

# Editors
pnpm add @tiptap/react @tiptap/starter-kit
# OR
pnpm add lexical @lexical/react

# Calendar
pnpm add react-big-calendar date-fns
```

---

## MCP Validation

All Layer 3 components are validated by:

| MCP Server | Validates |
|------------|-----------|
| **React MCP** | React patterns, token usage, performance |
| **Tailwind MCP** | Token usage (no raw colors) |
| **A11y MCP** | Accessibility (manual implementation required) |
| **Figma MCP** | Design alignment (optional) |

---

## Component Template

Use the templates in this directory:
- `_template.tsx.template` - Main component
- `_template.types.ts.template` - Type definitions
- `_template.index.ts.template` - Exports

**Key Rules:**
1. NO Radix UI imports
2. Use design tokens exclusively
3. Implement ARIA roles manually
4. Include keyboard navigation
5. Support screen readers
6. Use forwardRef + displayName

---

## Component Inventory

### Data Tables (TanStack Table v8)
| Component | Status | Description |
|-----------|--------|-------------|
| DataTable | 📋 Planned | Main data table |
| DataTableHeader | 📋 Planned | Table header |
| DataTableToolbar | 📋 Planned | Toolbar with actions |
| DataTablePagination | 📋 Planned | Pagination controls |
| DataTableFilter | 📋 Planned | Filter controls |
| VirtualizedList | 📋 Planned | Virtualized rendering |

### Data Visualization (Recharts / Visx)
| Component | Status | Description |
|-----------|--------|-------------|
| LineChart | 📋 Planned | Line chart |
| BarChart | 📋 Planned | Bar chart |
| PieChart | 📋 Planned | Pie chart |
| AreaChart | 📋 Planned | Area chart |
| Sparkline | 📋 Planned | Inline sparkline |

### Workflow Components
| Component | Status | Description |
|-----------|--------|-------------|
| KanbanBoard | 📋 Planned | Kanban board |
| Timeline | 📋 Planned | Timeline view |
| Stepper | 📋 Planned | Multi-step stepper |
| WizardFlow | 📋 Planned | Wizard flow |

### Mapping & Graphs (React Flow)
| Component | Status | Description |
|-----------|--------|-------------|
| NetworkGraph | 📋 Planned | Network visualization |
| WorkflowDiagram | 📋 Planned | Workflow diagram |
| OrgChart | 📋 Planned | Org chart |

### Editors (TipTap / Lexical)
| Component | Status | Description |
|-----------|--------|-------------|
| RichTextEditor | 📋 Planned | Rich text editor |
| MarkdownEditor | 📋 Planned | Markdown editor |
| CodeEditor | 📋 Planned | Code editor |

### Business Widgets
| Component | Status | Description |
|-----------|--------|-------------|
| Calendar | 📋 Planned | Calendar component |
| DatePicker | 📋 Planned | Date picker |
| FileUploader | 📋 Planned | File upload |
| NotificationCenter | 📋 Planned | Notifications |

---

## Accessibility Requirements

Layer 3 components require **manual accessibility implementation**:

### Data Tables
- `role="table"`, `role="row"`, `role="cell"`
- Keyboard navigation (arrow keys)
- Focus management
- Screen reader announcements

### Charts
- `aria-label` for chart descriptions
- Alternative text descriptions
- Colorblind-friendly palettes
- High contrast support

### Editors
- ARIA toolbar structure
- Keyboard shortcuts
- Screen reader compatibility

---

## Status Legend

- ✅ **Implemented** - Component exists and validated
- 🚧 **In Progress** - Being developed
- 📋 **Planned** - Scheduled for implementation
- ❌ **Not Required** - Out of scope

---

**Last Updated:** 2025-01-27  
**Layer:** 3 - Enterprise Functional Components  
**Status:** 📋 Ready for Implementation

