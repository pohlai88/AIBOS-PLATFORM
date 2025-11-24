# @aibos/config-eslint

> **Shared ESLint configuration** for the AIBOS Platform monorepo.

This package provides centralized ESLint configurations following ESLint 9 flat config format.

---

## 📦 Exports

### Main Export

```javascript
import { base, next } from "@aibos/config-eslint";
```

### Named Exports

- `@aibos/config-eslint/base` - Base configuration for non-Next.js packages
- `@aibos/config-eslint/next` - Next.js-specific configuration

---

## 📁 Files

- `eslint.config.mjs` - Main entry point (re-exports base and next)
- `eslint-base.config.mjs` - Base ESLint config for packages (utils, types, etc.)
- `eslint-next.config.mjs` - Next.js ESLint config for applications

---

## 🎯 Usage

### In Next.js Applications

```javascript
// apps/web/eslint.config.mjs (if needed)
import { next } from "@aibos/config-eslint";
export default next;
```

### In Packages

```javascript
// packages/utils/eslint.config.mjs (if needed)
import { base } from "@aibos/config-eslint";
export default base;
```

### Root Monorepo Config

The root `eslint.config.mjs` orchestrates all configs:

```javascript
import { base, next } from "@aibos/config-eslint";

export default [
  // Global ignores
  { ignores: ["node_modules/**", ...] },
  // Next.js apps
  ...next.map(config => ({ ...config, files: ["apps/**/*.{js,jsx,ts,tsx}"] })),
  // Packages
  ...base.map(config => ({ ...config, files: ["packages/**/*.{js,jsx,ts,tsx}"] })),
];
```

---

## ⚙️ Configuration Details

### Base Config (`eslint-base.config.mjs`)

- **Target:** Non-Next.js packages (utils, types, etc.)
- **Features:**
  - TypeScript support
  - JSX support
  - Base rules (no-unused-vars, no-console warnings)
  - Standard ignores

### Next.js Config (`eslint-next.config.mjs`)

- **Target:** Next.js applications
- **Features:**
  - Next.js core web vitals rules
  - Next.js TypeScript rules
  - Next.js-specific settings
  - Next.js ignores (.next, out, etc.)

---

## 📝 ESLint 9 Flat Config Format

All configurations use ESLint 9 flat config format:

```javascript
export default [
  {
    ignores: ["node_modules/**"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: { ... },
    rules: { ... },
  },
];
```

---

## 🔧 Maintenance

### Adding New Rules

1. Update the appropriate config file (`eslint-base.config.mjs` or `eslint-next.config.mjs`)
2. Test with `pnpm lint` in affected packages/apps
3. Update this README if adding new exports

### Version Compatibility

- **ESLint:** ^9.39.1
- **eslint-config-next:** 16.0.3 (for Next.js 16)

---

## 📚 Related Documentation

- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Next.js ESLint Config](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- [Root ESLint Config](../../eslint.config.mjs) - Monorepo orchestration

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Platform Team
