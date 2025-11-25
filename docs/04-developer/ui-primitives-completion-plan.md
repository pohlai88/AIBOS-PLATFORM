# UI Primitives Completion Plan

> **Priority:** Complete UI primitives before Next.js migration  
> **Date:** 2025-01-27  
> **Status:** 📋 In Progress

---

## 🎯 Goal

Complete all UI primitives and essential compositions needed for Next.js migration. The Next.js migration will require React components, so we need a solid foundation of UI primitives first.

---

## 📊 Current Status

### ✅ Completed & Exported (6 components)

| Component | Type | Status | Exported |
|-----------|------|-------|----------|
| Button | Primitive | ✅ Complete | ✅ Yes |
| Card | Primitive | ✅ Complete | ✅ Yes |
| Badge | Primitive | ✅ Complete | ✅ Yes |
| Input | Primitive | ✅ Complete | ✅ Yes |
| Tabs | Composition | ✅ Complete | ✅ Yes |
| DropdownMenu | Composition | ✅ Complete | ✅ Yes |

### 🔄 Exists But Not Exported

Many components exist in `packages/ui/src/components/` but are not exported in `index.ts`:

- `accordion.tsx`
- `alert-dialog.tsx`
- `aspect-ratio.tsx`
- `avatar.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `hover-card.tsx`
- `icon.tsx`
- `label.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `one-time-password-field.tsx`
- `password-toggle-field.tsx`
- `popover.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `slider.tsx`
- `switch.tsx`
- `toast.tsx`
- `toggle.tsx`
- `toggle-group.tsx`
- `toolbar.tsx`
- `tooltip.tsx`

### 🔴 Missing Components

Based on documentation requirements:

**Primitives:**
- Icon (exists but needs validation)
- Label (exists but needs validation)
- Separator (exists but needs validation)
- Avatar (exists but needs validation)
- AspectRatio (exists but needs validation)

**Compositions:**
- AlertDialog (exists but needs validation)
- Popover (exists but needs validation)
- Tooltip (exists but needs validation)
- Accordion (exists but needs validation)
- Select (exists but needs validation)
- Checkbox (exists but needs validation)
- RadioGroup (exists but needs validation)
- Switch (exists but needs validation)
- Progress (exists but needs validation)
- Toast (exists but needs validation)

**Layouts:**
- AppShell (exists in `layouts/`)
- Header (exists in `components/`)
- Sidebar (exists in `components/`)
- ContentArea (exists in `components/`)
- Navigation (exists in `components/`)

---

## 🎯 Priority Order

### Phase 1: Core Primitives (Week 1)

**Goal:** Complete all essential primitives needed for basic UI

1. **Icon** (`icon.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High (used everywhere)
   - Dependencies: None

2. **Label** (`label.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High (forms require labels)
   - Dependencies: None

3. **Separator** (`separator.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium (layout component)
   - Dependencies: None

4. **Avatar** (`avatar.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium (user profiles)
   - Dependencies: None

5. **AspectRatio** (`aspect-ratio.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Low (nice to have)
   - Dependencies: None

**Completion Criteria:**
- ✅ All components follow PRIMITIVES.md pattern
- ✅ Use `componentTokens` presets
- ✅ forwardRef and displayName set
- ✅ Exported in `index.ts`
- ✅ Validated against constitution

---

### Phase 2: Essential Compositions (Week 2)

**Goal:** Complete critical interactive components

1. **Dialog** (`dialog.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High (modals essential)
   - Dependencies: Radix UI

2. **AlertDialog** (`alert-dialog.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High (confirmations)
   - Dependencies: Radix UI

3. **Select** (`select.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High (forms)
   - Dependencies: Radix UI

4. **Checkbox** (`checkbox.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High (forms)
   - Dependencies: Radix UI

5. **Switch** (`switch.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium (settings)
   - Dependencies: Radix UI

6. **RadioGroup** (`radio-group.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium (forms)
   - Dependencies: Radix UI

7. **Popover** (`popover.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium (tooltips, menus)
   - Dependencies: Radix UI

8. **Tooltip** (`tooltip.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium (UX enhancement)
   - Dependencies: Radix UI

**Completion Criteria:**
- ✅ Built on Radix UI primitives
- ✅ Client Component (`"use client"`)
- ✅ Full accessibility (ARIA, keyboard)
- ✅ Exported in `index.ts`
- ✅ Validated against constitution

---

### Phase 3: Advanced Compositions (Week 3)

**Goal:** Complete advanced interactive components

1. **Accordion** (`accordion.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium
   - Dependencies: Radix UI

2. **Progress** (`progress.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium
   - Dependencies: Radix UI

3. **Toast** (`toast.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Medium (notifications)
   - Dependencies: Radix UI

4. **Slider** (`slider.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Low
   - Dependencies: Radix UI

5. **Toggle** (`toggle.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Low
   - Dependencies: Radix UI

6. **ToggleGroup** (`toggle-group.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Low
   - Dependencies: Radix UI

7. **ContextMenu** (`context-menu.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Low
   - Dependencies: Radix UI

8. **HoverCard** (`hover-card.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Low
   - Dependencies: Radix UI

9. **ScrollArea** (`scroll-area.tsx`)
   - Status: Exists, needs validation & export
   - Priority: Low
   - Dependencies: Radix UI

10. **Collapsible** (`collapsible.tsx`)
    - Status: Exists, needs validation & export
    - Priority: Low
    - Dependencies: Radix UI

**Completion Criteria:**
- ✅ Same as Phase 2
- ✅ Complex state management where needed
- ✅ Full documentation

---

### Phase 4: Layout Components (Week 4)

**Goal:** Complete layout components for Next.js app structure

1. **AppShell** (`layouts/AppShell.tsx`)
   - Status: Exists, needs validation
   - Priority: High (main layout)
   - Dependencies: Primitives + Compositions

2. **Header** (`components/Header.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High
   - Dependencies: Primitives

3. **Sidebar** (`components/Sidebar.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High
   - Dependencies: Primitives + Compositions

4. **ContentArea** (`components/ContentArea.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High
   - Dependencies: Primitives

5. **Navigation** (`components/Navigation.tsx`)
   - Status: Exists, needs validation & export
   - Priority: High
   - Dependencies: Primitives + Compositions

**Completion Criteria:**
- ✅ Composed from primitives and compositions
- ✅ Responsive design
- ✅ Full keyboard navigation
- ✅ Exported properly
- ✅ Next.js App Router compatible

---

## 📋 Validation Checklist

For each component, verify:

### Primitives
- [ ] Uses `componentTokens` presets
- [ ] No Radix UI dependencies
- [ ] `forwardRef` implemented
- [ ] `displayName` set
- [ ] TypeScript interface extends HTML attributes
- [ ] Server Component compatible (unless interactive)
- [ ] Exported in `index.ts`
- [ ] Validated: `pnpm lint:ui-constitution`

### Compositions
- [ ] Built on Radix UI primitives
- [ ] Client Component (`"use client"`)
- [ ] Full accessibility (ARIA, keyboard)
- [ ] `forwardRef` implemented
- [ ] `displayName` set
- [ ] TypeScript interface extends HTML attributes
- [ ] Exported in `index.ts`
- [ ] Validated: `pnpm lint:ui-constitution`

### Layouts
- [ ] Composed from primitives and compositions
- [ ] Client Component for interactivity
- [ ] Responsive design
- [ ] Full keyboard navigation
- [ ] Exported properly
- [ ] Next.js App Router compatible

---

## 🛠️ Implementation Steps

### For Each Component:

1. **Review Existing Code**
   ```bash
   # Check if component exists
   ls packages/ui/src/components/[component-name].tsx
   ```

2. **Validate Against Constitution**
   ```bash
   pnpm lint:ui-constitution
   ```

3. **Check Token Usage**
   - Verify uses `componentTokens` or atomic tokens
   - No raw colors or Tailwind palette
   - Follows PRIMITIVES.md pattern

4. **Add to Exports**
   ```typescript
   // packages/ui/src/components/index.ts
   export * from "./[component-name]";
   ```

5. **Test Component**
   - Create test file if needed
   - Verify accessibility
   - Check keyboard navigation

6. **Update Documentation**
   - Update component docs if needed
   - Add to component list

---

## 📈 Progress Tracking

### Phase 1: Core Primitives
- [ ] Icon
- [ ] Label
- [ ] Separator
- [ ] Avatar
- [ ] AspectRatio

### Phase 2: Essential Compositions
- [ ] Dialog
- [ ] AlertDialog
- [ ] Select
- [ ] Checkbox
- [ ] Switch
- [ ] RadioGroup
- [ ] Popover
- [ ] Tooltip

### Phase 3: Advanced Compositions
- [ ] Accordion
- [ ] Progress
- [ ] Toast
- [ ] Slider
- [ ] Toggle
- [ ] ToggleGroup
- [ ] ContextMenu
- [ ] HoverCard
- [ ] ScrollArea
- [ ] Collapsible

### Phase 4: Layout Components
- [ ] AppShell
- [ ] Header
- [ ] Sidebar
- [ ] ContentArea
- [ ] Navigation

---

## 🎯 Success Criteria

**Ready for Next.js Migration When:**
- ✅ All Phase 1 primitives complete
- ✅ All Phase 2 compositions complete
- ✅ Essential layouts (AppShell, Header, Sidebar) complete
- ✅ All components exported in `index.ts`
- ✅ All components validated against constitution
- ✅ Documentation updated

---

## 📚 Related Documents

- [Component Constitution](../../packages/ui/constitution/components.yml) - Component rules
- [Primitives Reference](../../packages/ui/src/components/PRIMITIVES.md) - Pattern reference
- [Component README](../../packages/ui/src/components/README.md) - Component guidelines
- [Next.js Migration Plan](./nextjs-migration-plan.md) - Migration plan (on hold)

---

## 🚀 Next Steps

1. **Start Phase 1:** Complete core primitives
2. **Validate:** Run `pnpm lint:ui-constitution` after each component
3. **Export:** Add to `index.ts` after validation
4. **Document:** Update component documentation
5. **Test:** Verify components work in isolation

---

**Status:** 📋 Ready to Start  
**Priority:** High - Blocking Next.js Migration  
**Estimated Duration:** 4 weeks (1 week per phase)

