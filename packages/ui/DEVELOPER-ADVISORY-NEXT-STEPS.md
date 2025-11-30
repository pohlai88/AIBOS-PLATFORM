# 🚀 Developer Advisory: Next Steps for UI Testing

**Date:** 2025-01-27  
**Status:** ✅ Ready for Next Developer  
**Current Phase:** Primitive Component Testing (Batch 1 Complete)

---

## 📊 Current Status Summary

### ✅ Completed Work

**Test Infrastructure:**
- ✅ Vitest framework configured with 95% coverage thresholds
- ✅ React Testing Library integration
- ✅ Accessibility testing (jest-axe) integrated
- ✅ Test utilities (`renderWithTheme`, `expectAccessible`) created
- ✅ UI Testing MCP server implemented and activated
- ✅ All test patterns validated against GRCD-TESTING.md

**Tested Components (9/31 - 29% Complete):**
1. ✅ **Button** - 40 tests, 99.25% coverage
2. ✅ **Input** - 42 tests, 100% coverage
3. ✅ **Card** - 38 tests, 100% coverage
4. ✅ **Badge** - 41 tests, 99.08% coverage
5. ✅ **Label** - 42 tests, 100% coverage
6. ✅ **Checkbox** - 60 tests, 99.43% coverage
7. ✅ **Radio** - 68 tests, 99.06% coverage
8. ✅ **Select** - 60 tests, 99.4% coverage
9. ✅ **Textarea** - 70 tests, 99.4% coverage

**Total:** 461 tests, all passing ✅

---

## 🎯 Remaining Work

### Priority 1: High-Value Form Components (Next Batch)

These components are commonly used and should be tested next:

1. **Toggle** - Form control component (similar to Checkbox/Radio)
   - File: `packages/ui/src/components/shared/primitives/toggle.tsx`
   - Test file exists but needs enhancement: `toggle.test.tsx`
   - Priority: **HIGH** (form control, user interaction)

2. **FieldGroup** - Form field wrapper with label/helper/error
   - File: `packages/ui/src/components/shared/primitives/field-group.tsx`
   - Test file exists: `field-group.test.tsx`
   - Priority: **HIGH** (composite component, used with form controls)

3. **Link** - Navigation component
   - File: `packages/ui/src/components/shared/primitives/link.tsx`
   - Test file exists: `link.test.tsx`
   - Priority: **MEDIUM** (navigation, accessibility critical)

### Priority 2: Layout & Structure Components

4. **Stack** - Layout component (flex column/row)
   - File: `packages/ui/src/components/shared/primitives/stack.tsx`
   - Test file exists but has failures: `stack.test.tsx`
   - **Action Required:** Fix existing test failures first
   - Priority: **MEDIUM**

5. **Container** - Layout wrapper
   - File: `packages/ui/src/components/shared/primitives/container.tsx`
   - Test file exists: `container.test.tsx`
   - Priority: **MEDIUM**

6. **Surface** - Elevated surface component
   - File: `packages/ui/src/components/shared/primitives/surface.tsx`
   - Test file exists but has failures: `surface.test.tsx`
   - **Action Required:** Fix existing test failures first
   - Priority: **MEDIUM**

7. **Inline** - Inline layout component
   - File: `packages/ui/src/components/shared/primitives/inline.tsx`
   - Test file exists: `inline.test.tsx`
   - Priority: **LOW**

### Priority 3: Feedback & Status Components

8. **Alert** - Alert/notification component
   - File: `packages/ui/src/components/shared/primitives/alert.tsx`
   - Test file exists: `alert.test.tsx`
   - Priority: **MEDIUM** (user feedback)

9. **Progress** - Progress indicator
   - File: `packages/ui/src/components/shared/primitives/progress.tsx`
   - Test file exists: `progress.test.tsx`
   - Priority: **MEDIUM**

10. **Spinner** - Loading spinner
    - File: `packages/ui/src/components/shared/primitives/spinner.tsx`
    - Test file exists: `spinner.test.tsx`
    - Priority: **MEDIUM**

11. **Skeleton** - Loading skeleton
    - File: `packages/ui/src/components/shared/primitives/skeleton.tsx`
    - Test file exists: `skeleton.test.tsx`
    - Priority: **MEDIUM**

### Priority 4: Advanced Components

12. **Avatar** - User avatar component
    - File: `packages/ui/src/components/shared/primitives/avatar.tsx`
    - Test file exists: `avatar.test.tsx`
    - Priority: **MEDIUM**

13. **IconButton** - Icon-only button
    - File: `packages/ui/src/components/shared/primitives/icon-button.tsx`
    - Test file exists: `icon-button.test.tsx`
    - Priority: **MEDIUM**

14. **Tooltip** - Tooltip component
    - File: `packages/ui/src/components/shared/primitives/tooltip.tsx`
    - Test file exists: `tooltip.test.tsx`
    - Priority: **MEDIUM** (interactive, accessibility critical)

15. **AlertDialog** - Modal alert dialog
    - File: `packages/ui/src/components/shared/primitives/alert-dialog.tsx`
    - Test file exists: `alert-dialog.test.tsx`
    - Priority: **MEDIUM** (complex interaction)

### Priority 5: Utility & Display Components

16. **Separator** - Visual separator
    - File: `packages/ui/src/components/shared/primitives/separator.tsx`
    - Test file exists: `separator.test.tsx`
    - Priority: **LOW**

17. **Divider** - Divider component
    - File: `packages/ui/src/components/shared/primitives/divider.tsx`
    - Test file exists: `divider.test.tsx`
    - Priority: **LOW**

18. **Code** - Code display component
    - File: `packages/ui/src/components/shared/primitives/code.tsx`
    - Test file exists: `code.test.tsx`
    - Priority: **LOW**

19. **Breadcrumb** - Breadcrumb navigation
    - File: `packages/ui/src/components/shared/primitives/breadcrumb.tsx`
    - Test file exists: `breadcrumb.test.tsx`
    - Priority: **LOW**

20. **Table** - Table component
    - File: `packages/ui/src/components/shared/primitives/table.tsx`
    - Test file exists but has failures: `table.test.tsx`
    - **Action Required:** Fix existing test failures first
    - Priority: **MEDIUM** (complex component)

21. **IconWrapper** - Icon wrapper utility
    - File: `packages/ui/src/components/shared/primitives/icon-wrapper.tsx`
    - Test file exists: `icon-wrapper.test.tsx`
    - Priority: **LOW**

22. **VisuallyHidden** - Accessibility utility
    - File: `packages/ui/src/components/shared/primitives/visually-hidden.tsx`
    - Test file exists: `visually-hidden.test.tsx`
    - Priority: **MEDIUM** (accessibility critical)

---

## 🛠️ Recommended Next Steps

### Step 1: Fix Existing Test Failures (IMMEDIATE)

**Components with failing tests:**
- `stack.test.tsx` - Multiple failures (element selection issues)
- `surface.test.tsx` - Multiple failures (element selection issues)
- `table.test.tsx` - 1 failure (wrapper selection issue)

**Action:**
1. Review test failures: `pnpm test:run`
2. Fix element selectors (likely need to exclude `test-theme-wrapper`)
3. Verify all tests pass before proceeding

**Estimated Time:** 1-2 hours

### Step 2: Complete Priority 1 Components (HIGH VALUE)

**Recommended Order:**
1. **Toggle** - Similar to Checkbox/Radio, can reuse patterns
2. **FieldGroup** - Composite component, used with form controls
3. **Link** - Navigation component, accessibility critical

**Action:**
1. Review existing test files
2. Enhance tests following GRCD-TESTING.md patterns
3. Ensure 95%+ coverage
4. Run coverage report: `pnpm test:coverage`

**Estimated Time:** 4-6 hours

### Step 3: Complete Priority 2 Components (LAYOUT)

**Recommended Order:**
1. **Stack** - Fix failures first, then enhance
2. **Surface** - Fix failures first, then enhance
3. **Container** - Simple wrapper, quick win
4. **Inline** - Simple layout component

**Action:**
1. Fix existing failures
2. Enhance test coverage
3. Verify layout behavior

**Estimated Time:** 3-4 hours

### Step 4: Complete Priority 3-5 Components (REMAINING)

Continue with remaining components following the priority order.

**Estimated Time:** 8-12 hours

---

## 📚 Key Patterns & Guidelines

### Test File Structure

Follow this structure for all component tests:

```typescript
describe("ComponentName", () => {
  describe("Rendering", () => {
    // Basic rendering tests
  });

  describe("Accessibility", () => {
    // WCAG AA/AAA tests
    // ARIA attributes
    // Keyboard navigation
  });

  describe("Interactions", () => {
    // User interactions (click, type, etc.)
  });

  describe("Variants", () => {
    // Variant styles
  });

  describe("Sizes", () => {
    // Size variants
  });

  describe("States", () => {
    // Disabled, error, loading, etc.
  });

  describe("Props", () => {
    // Prop forwarding
    // Default values
  });

  describe("Base Styles", () => {
    // Base styling tests
  });

  describe("Edge Cases", () => {
    // Edge cases and error handling
  });
});
```

### Common Test Patterns

**1. Element Selection (IMPORTANT):**
```typescript
// ❌ WRONG - selects test-theme-wrapper
const element = container.querySelector("div");

// ✅ CORRECT - excludes test-theme-wrapper
const element = container.querySelector('div:not(.test-theme-wrapper)');
// OR use a helper function
const element = getComponent(container);
```

**2. Label Association:**
```typescript
// React converts htmlFor to 'for' in DOM
expect(label).toHaveAttribute("for", elementId); // ✅ CORRECT
expect(label).toHaveAttribute("htmlFor", elementId); // ❌ WRONG
```

**3. Accessibility Testing:**
```typescript
// ✅ For components WITH labels
await expectAccessible(container);

// ✅ For components WITHOUT labels (form elements)
const results = await axe(container);
expect(results.violations.length).toBeGreaterThan(0); // Expected violation
```

**4. User Interactions:**
```typescript
// ✅ Use userEvent for realistic interactions
const user = userEvent.setup();
await user.click(element);
await user.type(input, "text");
```

### Coverage Requirements

- **Minimum:** 95% for all metrics (statements, branches, functions, lines)
- **Target:** 100% function coverage (achieved for all tested components)
- **Acceptable:** 80%+ branch coverage (some edge cases may be hard to test)

---

## 🔍 Testing Commands

```bash
# Run all tests
pnpm test:run

# Run tests for specific component
pnpm vitest run src/components/shared/primitives/component.test.tsx

# Run with coverage
pnpm test:coverage

# Run specific test file with coverage
pnpm vitest run --coverage src/components/shared/primitives/component.test.tsx

# Watch mode
pnpm test:watch

# UI mode
pnpm test:ui
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Element Selection Failures

**Problem:** Tests fail with "received value must be an HTMLElement"

**Solution:**
```typescript
// Use more specific selectors
const element = container.querySelector('div:not(.test-theme-wrapper)');
// OR use data-testid
const element = container.querySelector('[data-testid="component-id"]');
```

### Issue 2: Label Association Failures

**Problem:** `htmlFor` attribute not found

**Solution:**
```typescript
// React converts htmlFor to 'for' in DOM
expect(label).toHaveAttribute("for", elementId); // ✅
```

### Issue 3: Accessibility Violations for Form Elements

**Problem:** Form elements without labels fail accessibility tests

**Solution:**
```typescript
// For components that SHOULD have labels
it("should require label for accessibility", async () => {
  const { container } = renderWithTheme(<Input />);
  const results = await axe(container);
  expect(results.violations.length).toBeGreaterThan(0); // Expected
});
```

### Issue 4: Keyboard Event Handling

**Problem:** Badge/Button keyboard events not working

**Solution:**
```typescript
// For RSC components, test that onKeyDown prop is accepted
it("should accept onKeyDown handler", () => {
  const handleKeyDown = vi.fn();
  const { container } = renderWithTheme(
    <Badge onKeyDown={handleKeyDown}>Clickable</Badge>
  );
  const badge = getBadge(container);
  const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
  badge?.dispatchEvent(event);
  expect(handleKeyDown).toHaveBeenCalled();
});
```

---

## 📖 Reference Documents

1. **GRCD-TESTING.md** - Single source of truth for testing patterns
2. **TESTING-IMPLEMENTATION-REPORT.md** - Current implementation status
3. **MCP-TESTING-SERVER-RECOMMENDATION.md** - MCP server documentation
4. **.mcp/ui-testing/README.md** - MCP server usage guide

---

## 🎯 Success Criteria

**For Each Component:**
- ✅ All tests passing
- ✅ 95%+ coverage (statements, functions, lines)
- ✅ 80%+ branch coverage
- ✅ Accessibility tests included
- ✅ Zero linting errors
- ✅ Follows GRCD-TESTING.md patterns

**For Overall Package:**
- ✅ All 31 primitive components tested
- ✅ 95%+ overall coverage
- ✅ All tests passing in CI/CD
- ✅ MCP validation passing

---

## 💡 Tips for Success

1. **Start with existing test files** - Many components already have test files that need enhancement
2. **Reuse patterns** - Similar components (Checkbox/Radio/Toggle) can share test patterns
3. **Fix failures first** - Don't add new tests until existing failures are fixed
4. **Run coverage frequently** - Check coverage after each component
5. **Use MCP server** - The UI Testing MCP server can help validate patterns
6. **Follow GRCD** - Always refer to GRCD-TESTING.md for patterns

---

## 📞 Questions or Issues?

If you encounter issues or have questions:

1. Check GRCD-TESTING.md for patterns
2. Review existing test files for similar components
3. Check test utilities in `tests/utils/`
4. Review MCP server documentation

---

**Good luck! 🚀**

The foundation is solid, the patterns are established, and the infrastructure is ready. You're set up for success!

