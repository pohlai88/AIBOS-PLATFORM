# AI-BOS Constitution Sync Pipeline

> **Date:** 2025-01-27  
> **Version:** 2.1.0  
> **Purpose:** Automated sync protocol for constitution files and token system

---

## 🔄 AI-BOS Constitution Sync Pipeline

**Authoritative root = globals.css**

↓

**tokens.yml auto-syncs from globals.css**

↓

**components.yml validated against tokens.yml layer rules**

↓

**rsc.yml validated against Next.js server rules**

↓

**Component directory auto-validated before merge**

---

## 📊 Sync Plan (v2.1)

| Layer                | Authoritative Source         | Auto-Generated? | Sync Required? | Validation |
| -------------------- | ---------------------------- | --------------- | -------------- | ---------- |
| **Global Tokens**    | `globals.css`                | ❌              | ✔             | MCP        |
| **Semantic Tokens**  | `globals.css`                | ❌              | ✔             | MCP        |
| **Utility Tokens**   | `tokens.ts`                  | ✔              | ✔             | MCP        |
| **Component Tokens** | `tokens.ts + components.yml` | ✔              | ✔             | MCP        |
| **components.yml**   | Manual + MCP                 | ✔ validated    | ✔             | MCP        |
| **rsc.yml**          | Manual                       | ✔ validated    | ✔             | MCP        |
| **tokens.yml**       | Manual + globals.css sync    | ✔ validated    | ✔             | MCP        |

---

## 🏆 Golden Rule

**Only `globals.css` can create new raw values.**

Everything else **references upward**.

---

## 📋 Constitution Files Overview

### Files

1. **`tokens.yml`** (v2.1.0) - Token governance, immutability, RSC rules, machine-enforceable rule IDs
2. **`rsc.yml`** (v1.1.0) - React Server Component boundary rules
3. **`components.yml`** (v2.1.0) - Component structure, API, accessibility rules

### Server Implementation

**Server:** `.mcp/component-generator/server.mjs`  
**Function:** `loadConstitution()` loads all three YML files

---

## ✅ Synced Rules

### **Component Constitution (components.yml)**

| Rule Category              | YML Location                    | Server Implementation                      | Status    |
| -------------------------- | ------------------------------- | ------------------------------------------ | --------- |
| Component name validation  | `structure.required`            | `validateAgainstConstitution()` - Line 346 | ✅ Synced |
| Component type validation  | `structure.patterns`            | `validateAgainstConstitution()` - Line 357 | ✅ Synced |
| Radix UI boundaries        | `structure.patterns.primitive`  | `validateAgainstConstitution()` - Line 369 | ✅ Synced |
| Functional Components      | `structure.patterns.functional` | `validateAgainstConstitution()` - Line 357 | ✅ Synced |
| Safe mode compatibility    | `safe_mode.required`            | `validateAgainstConstitution()` - Line 379 | ✅ Synced |
| Token alias mapping        | `styling.token_alias_mapping`   | `validateAgainstConstitution()` - Line 387 | ✅ Synced |
| State machine requirements | `structure.state_machines`      | `validateAgainstConstitution()` - Line 404 | ✅ Synced |
| Props structure            | `props.required`                | `validatePropsStructure()` - Line 532      | ✅ Synced |
| Styling rules              | `styling.forbidden`             | `validateStylingRules()` - Line 537        | ✅ Synced |
| Import validation          | `imports.forbidden`             | `validateImports()` - Line 544             | ✅ Synced |
| Radix boundaries           | `imports.forbidden`             | `validateRadixBoundaries()` - Line 550     | ✅ Synced |
| Semantic naming            | `props.naming`                  | `validateSemanticNaming()` - Line 556      | ✅ Synced |
| Token alias mapping        | `styling.token_alias_mapping`   | `validateTokenAliasMappings()` - Line 562  | ✅ Synced |
| Motion safety              | `motion.reduced_motion`         | `validateMotionSafety()` - Line 568        | ✅ Synced |
| Style drift                | `visual_regression`             | `validateStyleDrift()` - Line 574          | ✅ Synced |
| Keyboard navigation        | `accessibility.keyboard`        | `validateKeyboardNavigation()` - Line 600  | ✅ Synced |
| Focus trapping             | `accessibility.focus`           | `validateFocusTrapping()` - Line 711       | ✅ Synced |
| Semantic landmarks         | `accessibility.required`        | `validateSemanticLandmarks()` - Line 787   | ✅ Synced |
| Heading hierarchy          | `accessibility.required`        | `validateHeadingHierarchy()` - Line 871    | ✅ Synced |
| WCAG contrast              | `accessibility.contrast`        | `validateWCAGContrast()` - Line 600        | ✅ Synced |
| Touch targets              | `accessibility.touchTargets`    | `validateTouchTargets()` - Line 600        | ✅ Synced |
| Typography WCAG            | `accessibility.typography`      | `validateTypographyWCAG()` - Line 600      | ✅ Synced |

### **RSC Constitution (rsc.yml)**

| Rule Category                   | YML Location                             | Server Implementation                  | Status    |
| ------------------------------- | ---------------------------------------- | -------------------------------------- | --------- |
| Server component forbidden APIs | `rules.server.forbidden.browser_globals` | `validateGeneratedCode()` - Line 452   | ⚠️ TODO   |
| Client component requirements   | `rules.client.required`                  | `validateGeneratedCode()` - Line 452   | ⚠️ TODO   |
| Radix UI in RSC                 | `rules.radix_ui.rules`                   | `validateRadixBoundaries()` - Line 550 | ✅ Synced |
| Forbidden hooks                 | `rules.server.forbidden.hooks`           | `validateRSCBoundaries()` - Line 452   | ⚠️ TODO   |
| Server Actions validation       | `rules.server_actions.input_validation`  | `validateServerActions()` - Line 452   | ⚠️ TODO   |

### **Token Constitution (tokens.yml)**

| Rule Category            | YML Location                      | Server Implementation                      | Status  |
| ------------------------ | --------------------------------- | ------------------------------------------ | ------- |
| Token validation         | `validation.requiredChecks`       | `validateAgainstConstitution()` - Line 332 | ⚠️ TODO |
| Token naming             | `naming.rules`                    | `validateTokenNaming()` - Line 332         | ⚠️ TODO |
| Token hierarchy          | `hierarchy[].validation`          | `validateTokenHierarchy()` - Line 332      | ⚠️ TODO |
| Cross-category conflicts | `conflictRules`                   | `validateTokenConflicts()` - Line 332      | ⚠️ TODO |
| Token immutability       | `immutability`                    | `validateTokenImmutability()` - Line 332   | ⚠️ TODO |
| WCAG contrast            | `categories.color.contrast`       | `validateWCAGContrast()` - Line 332        | ⚠️ TODO |
| Tenant overrides         | `categories.color.tenantOverride` | `validateTenantOverrides()` - Line 332     | ⚠️ TODO |
| Safe Mode rules          | `themes.safeMode`                 | `validateSafeMode()` - Line 332            | ⚠️ TODO |
| RSC token rules          | `rsc.rules`                       | `validateRSCTokens()` - Line 332           | ⚠️ TODO |

---

## ⚠️ TODO: Rules Not Yet Implemented

### **1. Token Constitution Validation**

**Location:** `validateAgainstConstitution()` - Line 332  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const tokenValidation = { valid: true, violations: [] }; // TODO: Implement validation

// Should implement:
// - Check tokens exist in globals.css
// - Validate token naming conventions (TOK-NAME-001 through TOK-NAME-004)
// - Check contrast requirements (COL-003)
// - Validate tenant override boundaries (TENANT-001 through TENANT-003)
// - Validate cross-category conflicts (CONFLICT-001 through CONFLICT-005)
// - Validate token immutability (IMMUT-001 through IMMUT-003)
```

**Constitution Rules to Implement:**

- `tokens.yml` → `naming.rules` (TOK-NAME-001 through TOK-NAME-004)
- `tokens.yml` → `hierarchy[].validation` (TOK-HIER-001 through TOK-HIER-031)
- `tokens.yml` → `conflictRules` (CONFLICT-001 through CONFLICT-005)
- `tokens.yml` → `immutability` (IMMUT-001 through IMMUT-003)
- `tokens.yml` → `categories.color.contrast` (COL-003)
- `tokens.yml` → `categories.color.tenantOverride.rules` (TENANT-001 through TENANT-003)
- `tokens.yml` → `themes.safeMode.rules` (SAFE-001 through SAFE-008)
- `tokens.yml` → `rsc.rules` (RSC-001 through RSC-006)
- `tokens.yml` → `validation.requiredChecks` (VAL-001 through VAL-008)

### **2. RSC Boundary Validation**

**Location:** `validateGeneratedCode()` - Line 452  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const rscValidation = { valid: true, violations: [] }; // TODO: Implement validation

// Should implement:
// - Check for browser globals in server components
// - Check for forbidden hooks
// - Check for forbidden imports
// - Validate async component side effects
// - Validate Server Action input validation
```

**Constitution Rules to Implement:**

- `rsc.yml` → `rules.server.forbidden.browser_globals`
- `rsc.yml` → `rules.server.forbidden.hooks`
- `rsc.yml` → `rules.server.forbidden.imports`
- `rsc.yml` → `rules.async_server_components.side_effect_guard`
- `rsc.yml` → `rules.server_actions.input_validation`

### **3. React Structure Validation**

**Location:** `validateGeneratedCode()` - Line 467  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const reactValidation = {
  valid: true,
  violations: [],
  errors: [],
  warnings: [],
}; // TODO: Implement validation

// Should implement:
// - Component structure validation (forwardRef, displayName)
// - Props interface validation
// - Component type validation
```

**Note:** Some React validation is already implemented in separate functions, but not integrated here.

### **4. Accessibility Validation**

**Location:** `validateGeneratedCode()` - Line 487  
**Status:** Placeholder implementation

```javascript
// Current (TODO)
const a11yValidation = { valid: true, violations: [] }; // TODO: Implement validation

// Should implement:
// - Icon-only button aria-label check
// - Form input label association
// - Interactive element roles
// - Image alt text
// - Modal dialog roles
// - WCAG contrast validation
// - Touch target validation
// - Typography WCAG validation
```

**Note:** Accessibility validation exists in `aibos-a11y-validation` MCP server, but not integrated here.

---

## 🔄 Integration Recommendations

### **Option 1: Call Other MCP Servers (Not Possible)**

❌ **MCP servers cannot call other MCP servers directly**

### **Option 2: Share Validation Functions**

✅ **Extract validation logic into shared modules:**

```
packages/ui/constitution/
├── validators/
│   ├── token-validator.mjs
│   ├── rsc-validator.mjs
│   ├── react-validator.mjs
│   └── a11y-validator.mjs
```

**Benefits:**

- ✅ Reusable validation logic
- ✅ Single source of truth
- ✅ Consistent validation across servers

### **Option 3: Implement Inline Validation**

✅ **Implement validation directly in component-generator:**

- Copy validation logic from other MCP servers
- Implement missing validations
- Ensure all constitution rules are checked

**Benefits:**

- ✅ Self-contained server
- ✅ No external dependencies
- ✅ Full control

---

## 📊 Current Implementation Status

### **Implemented Rules: 20/120+ (17%)**

✅ **Fully Implemented:**

- Component name validation
- Component type validation
- Radix UI boundaries
- Functional Components
- Safe mode compatibility
- Token alias mapping
- State machine requirements
- Props structure
- Styling rules
- Import validation
- Semantic naming
- Motion safety
- Style drift
- Keyboard navigation
- Focus trapping
- Semantic landmarks
- Heading hierarchy
- WCAG contrast (partial)
- Touch targets (partial)
- Typography WCAG (partial)

### **Partially Implemented: 5/120+ (4%)**

⚠️ **Placeholder/TODO:**

- Token constitution validation
- RSC boundary validation
- React structure validation
- Accessibility validation
- Server Actions validation

### **Not Implemented: 95+/120+ (79%)**

❌ **Missing:**

- Most token validation rules (naming, hierarchy, conflicts, immutability)
- Most RSC boundary rules
- Most accessibility rules
- Visual regression rules (partial)
- Custom hooks documentation rules
- Token rule ID validation

---

## 🎯 Next Steps

### **Priority 1: Implement Core Validations**

1. **Token Validation** - Implement token existence, naming, hierarchy, conflicts, immutability checks
2. **RSC Boundary** - Implement server/client component validation
3. **Accessibility** - Integrate or implement a11y validation
4. **React Structure** - Complete component structure validation

### **Priority 2: Enhance Existing Validations**

1. **Token Mapping** - Enhance variant-to-token mapping validation
2. **Style Drift** - Improve design-to-code comparison
3. **Motion Safety** - Enhance reduced motion validation
4. **WCAG Compliance** - Complete WCAG AA/AAA validation

### **Priority 3: Add Missing Validations**

1. **Visual Regression** - Implement snapshot testing validation
2. **Custom Hooks** - Add documentation validation
3. **State Machines** - Enhance state machine validation
4. **Rule ID Validation** - Validate all rule IDs are machine-enforceable

---

## 📝 Constitution File Updates Needed

### **tokens.yml**

✅ **Updated to v2.1.0** - File is comprehensive with machine-enforceable rule IDs

### **rsc.yml**

✅ **Up to date (v1.1.0)** - File is comprehensive and matches requirements

### **components.yml**

✅ **Updated to v2.1.0** - File is comprehensive with enhanced rules

**Note:** Constitution files are the source of truth. Server implementation needs to be updated to match them.

---

## 🔍 Validation Checklist

### **Before Component Generation**

- [ ] Component name is PascalCase
- [ ] Component type is valid (primitive/composition/functional/layout)
- [ ] Radix UI usage matches component type
- [ ] Safe mode compatibility checked
- [ ] Token alias mapping validated
- [ ] Token naming follows canonical prefixes
- [ ] Token hierarchy validated
- [ ] Cross-category conflicts checked

### **After Code Generation**

- [ ] RSC boundary rules enforced
- [ ] React structure rules enforced
- [ ] Accessibility rules enforced (WCAG AA/AAA)
- [ ] Styling rules enforced
- [ ] Import rules enforced
- [ ] Motion safety rules enforced
- [ ] Style drift checked
- [ ] Token immutability validated
- [ ] Tenant override boundaries validated
- [ ] Safe Mode rules validated

---

**Last Updated:** 2025-01-27  
**Version:** 2.1.0  
**Status:** Constitution files are comprehensive. Server implementation needs updates to match.
