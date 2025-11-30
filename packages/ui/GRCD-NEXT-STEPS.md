# 🚀 GRCD Implementation Next Steps

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Status:** Ready for Implementation

---

## Executive Summary

All GRCD documentation gaps have been addressed. This document outlines the prioritized implementation roadmap to make the GRCD governance actionable and enforceable.

**Current State:**
- ✅ All GRCD documentation complete
- ✅ All critical gaps documented
- ⚪ MCP seed files need creation
- ⚪ Validation infrastructure needs implementation
- ⚪ Component migration needs execution
- ⚪ Testing infrastructure needs setup

---

## Priority 1: MCP Seed Files (Foundation)

**Why First:** MCP seed files enable AI agents and developers to follow GRCD rules automatically. This is the foundation for all other work.

### 1.1 Master MCP File

**File:** `packages/ui/mcp/ui.mcp.json`

**Status:** ✅ **COMPLETED**

**Purpose:** Master MCP profile for entire UI package

**Content:** Based on Section 6.2 of GRCD-UI.md

**Action Items:**
- [ ] Create `ui.mcp.json` with master constraints
- [ ] Reference all GRCD documents
- [ ] Include validation rules
- [ ] Set up MCP governance flags

### 1.2 Layer-Specific MCP Files

**Status:** ✅ **COMPLETED**

**Files:**
- ✅ `packages/ui/mcp/ui-globals-css.mcp.json` (Section 6.2 of GRCD-GLOBALS-CSS.md)
- ✅ `packages/ui/mcp/ui-token-theme.mcp.json` (Section 6.2 of GRCD-TOKEN-THEME.md)
- ✅ `packages/ui/mcp/ui-components.mcp.json` (Section 6.2 of GRCD-COMPONENTS.md)

**Completed Actions:**
- ✅ Created each MCP file based on respective GRCD sections
- ✅ Linked to master MCP file via `related_mcp_files`
- ✅ Included layer-specific constraints
- ✅ Set up validation rules per layer
- ✅ All JSON files validated

**Time Taken:** ~1 hour

---

## Priority 2: Component Migration (Fix Violations First)

**Why Second:** Components currently violate GRCD rules (direct token imports from `tokens.ts`). We should fix violations first, then test the corrected patterns. This ensures tests validate correct behavior, not violations.

**Current Violations:**
- ❌ Components import tokens directly from `tokens.ts`
- ❌ Should use Tailwind classes referencing CSS variables instead
- ❌ Input component has broken token usage (template literals)

### 2.1 Audit Current Components

**Status:** ⚪ To be done

**Action Items:**
- [ ] List all components with direct token imports
- [ ] Identify components with hardcoded values
- [ ] Categorize by migration priority (shared → server → client)
- [ ] Create migration checklist per component

### 2.2 Migration Execution

**Status:** ⚪ To be done

**Migration Order:**
1. **Shared components** (lowest risk, no client features)
2. **Server components** (performance critical)
3. **Client components** (most complex, interactive)

**Per Component Migration Steps:**
- [ ] Remove direct token imports (`import { colorTokens } from 'tokens.ts'`)
- [ ] Replace with Tailwind classes (`className="bg-bg-elevated"`)
- [ ] Verify theme switching works
- [ ] Test in browser (light/dark mode)
- [ ] Update documentation

**Example Migration:**

```tsx
// ❌ BEFORE (Violation)
import { colorTokens, spacingTokens } from '../../../design/tokens/tokens'
<button className={cn(colorTokens.bgElevated, spacingTokens.md)}>

// ✅ AFTER (Correct)
<button className="bg-bg-elevated px-4 py-2">
```

**Estimated Time:** 20-40 hours (depending on component count)

---

## Priority 3: Testing Infrastructure (After Migration)

**Why Third:** After components are migrated to correct patterns, set up testing to validate those patterns. This ensures tests verify correct behavior, not violations.

### 3.1 Test Framework Setup

**Status:** ⚪ To be implemented

**Action Items:**
- [ ] Install Vitest and dependencies
  ```bash
  pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @axe-core/react jsdom
  ```
- [ ] Configure `vitest.config.ts`
- [ ] Set up test scripts in `package.json`
- [ ] Configure coverage thresholds (95% minimum)
- [ ] Set up CI/CD integration

### 3.2 Test Utilities

**Status:** ⚪ To be implemented

**File:** `packages/ui/src/test-utils/index.ts`

**Action Items:**
- [ ] Create `renderWithTheme` utility
- [ ] Create `renderWithMCP` utility
- [ ] Create `createMockTheme` utility
- [ ] Create accessibility test helpers
- [ ] Export all utilities from index

### 3.3 Write Tests for Migrated Components

**Status:** ⚪ To be implemented

**Action Items:**
- [ ] Write tests for each migrated component
- [ ] Test token usage (verify no direct imports)
- [ ] Test theme switching
- [ ] Test accessibility (WCAG compliance)
- [ ] Test RSC boundaries
- [ ] Achieve 95% coverage

**Estimated Time:** 4-6 hours setup + 20-30 hours writing tests

---

## Priority 4: Validation Infrastructure (Governance)

**Why Fourth:** Validation infrastructure enforces GRCD rules automatically, preventing violations before they reach production.

### 4.1 MCP Validation Rules

**Status:** ⚪ To be implemented

**Location:** `packages/ui/mcp/tools/`

**Action Items:**
- [ ] Implement token import validation (detect direct imports from `tokens.ts`)
- [ ] Implement hardcoded value detection
- [ ] Implement theme compliance validation
- [ ] Implement RSC boundary validation
- [ ] Integrate with ComponentValidator class

### 4.2 Pre-commit Hooks

**Status:** ⚪ To be implemented

**Action Items:**
- [ ] Set up Husky or similar
- [ ] Add MCP validation hook
- [ ] Add test coverage check
- [ ] Add TypeScript type check
- [ ] Add linting check

### 4.3 CI/CD Integration

**Status:** ⚪ To be implemented

**Action Items:**
- [ ] Add MCP validation step to CI
- [ ] Add test coverage step to CI
- [ ] Add bundle size check to CI
- [ ] Add accessibility testing to CI
- [ ] Configure failure thresholds

**Estimated Time:** 6-8 hours

---

## Priority 5: Performance Monitoring (Quality)

**Why Fifth:** Performance budgets need enforcement to maintain bundle size targets.

### 5.1 Bundle Analyzer Setup

**Status:** ⚪ To be implemented

**Action Items:**
- [ ] Install `@next/bundle-analyzer` or `webpack-bundle-analyzer`
- [ ] Configure bundle analysis script
- [ ] Set up bundle size budgets
- [ ] Create bundle size report generation

### 5.2 Performance Budgets

**Status:** ⚪ To be implemented

**Action Items:**
- [ ] Configure performance budgets in CI
- [ ] Set up alerts for budget violations
- [ ] Create performance dashboard (optional)
- [ ] Document performance optimization process

**Estimated Time:** 2-3 hours

---

## Priority 3: Testing Infrastructure (After Migration)

**Why Third:** After components are migrated to correct patterns, set up testing to validate those patterns. This ensures tests verify correct behavior, not violations.

### 5.1 Audit Current Components

**Status:** ⚪ To be done

**Action Items:**
- [ ] List all components with direct token imports
- [ ] Identify components with hardcoded values
- [ ] Categorize by migration priority
- [ ] Create migration checklist

### 5.2 Migration Execution

**Status:** ⚪ To be done

**Migration Order:**
1. Shared components (lowest risk)
2. Server components (performance critical)
3. Client components (most complex)

**Per Component:**
- [ ] Remove direct token imports
- [ ] Replace with Tailwind classes
- [ ] Verify theme switching works
- [ ] Write tests (if missing)
- [ ] Update documentation

**Estimated Time:** 20-40 hours (depending on component count)

---

## Priority 6: Documentation Enhancement (Polish)

**Why Sixth:** Enhance documentation with examples and guides based on implemented patterns.

### 6.1 Migration Guides

**Status:** ⚪ To be created

**Action Items:**
- [ ] Create component migration guide
- [ ] Create token usage migration guide
- [ ] Create RSC boundary migration guide
- [ ] Add before/after examples

### 6.2 Example Components

**Status:** ⚪ To be created

**Action Items:**
- [ ] Create reference implementations
- [ ] Document best practices
- [ ] Create anti-patterns guide
- [ ] Add troubleshooting section

**Estimated Time:** 4-6 hours

---

## Implementation Roadmap

### Phase 1: Foundation & Migration (Week 1-2)
- ✅ GRCD documentation complete
- ✅ MCP seed files (Priority 1) - **COMPLETED**
- [ ] Component migration (Priority 2) - **NEXT: Fix violations first**

### Phase 2: Testing & Validation (Week 3)
- [ ] Testing infrastructure (Priority 3) - Test migrated components
- [ ] Validation infrastructure (Priority 4) - Enforce GRCD rules
- [ ] Performance monitoring (Priority 5)

### Phase 3: Polish (Week 4)
- [ ] Documentation enhancement (Priority 6)

### Phase 4: Validation (Week 5)
- [ ] Full test coverage (95%+)
- [ ] All components migrated
- [ ] All validations passing
- [ ] Performance budgets met

---

## Success Criteria

**Phase 1 Complete When:**
- [ ] All MCP seed files created and validated
- [ ] Test framework operational
- [ ] Test utilities available
- [ ] Coverage enforcement active

**Phase 2 Complete When:**
- [ ] MCP validation rules implemented
- [ ] Pre-commit hooks active
- [ ] CI/CD validation passing
- [ ] Bundle analyzer configured

**Phase 3 Complete When:**
- [ ] All components migrated
- [ ] Zero direct token imports
- [ ] Zero hardcoded values
- [ ] All tests passing

**Phase 4 Complete When:**
- [ ] 95%+ test coverage achieved
- [ ] All GRCD rules enforced
- [ ] Performance budgets met
- [ ] Documentation complete

---

## Quick Start Commands

### Setup Testing Infrastructure
```bash
cd packages/ui
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @axe-core/react jsdom
pnpm add -D @vitest/ui @vitest/coverage-v8
```

### Setup Bundle Analyzer
```bash
pnpm add -D @next/bundle-analyzer
```

### Run Validations
```bash
# Run tests
pnpm test

# Check coverage
pnpm test:coverage

# Run MCP validation
pnpm validate:mcp

# Analyze bundle
pnpm analyze:bundle
```

---

## Risk Mitigation

**Risk:** Component migration may break existing functionality

**Mitigation:**
- Migrate incrementally (one component at a time)
- Write tests before migration
- Verify in browser after each migration
- Use feature flags if needed

**Risk:** Test coverage may be difficult to achieve

**Mitigation:**
- Start with high-value components
- Use test utilities to reduce boilerplate
- Focus on critical paths first
- Incrementally increase coverage

**Risk:** Performance budgets may be too strict

**Mitigation:**
- Start with realistic budgets
- Monitor and adjust based on data
- Optimize incrementally
- Document exceptions

---

## Dependencies

**External Dependencies:**
- Vitest (testing framework)
- Testing Library (React testing utilities)
- axe-core (accessibility testing)
- Bundle analyzer (performance monitoring)

**Internal Dependencies:**
- MCP infrastructure (from kernel)
- ThemeProvider (must be implemented)
- Design tokens (must be stable)

---

**Status:** ✅ **NEXT STEPS DOCUMENTED**  
**Next Action:** Start with Priority 1 (MCP Seed Files)  
**Estimated Total Time:** 40-60 hours across all phases

