# @aibos/utils

> **Shared utility functions** for the AIBOS Platform.

This package provides shared utility functions used across the monorepo.

---

## 📦 Installation

This package is part of the AIBOS monorepo and is automatically available to other packages.

```json
{
  "dependencies": {
    "@aibos/utils": "workspace:*"
  }
}
```

---

## 🎯 Usage

### Import Utilities

```typescript
import { formatDate, cn } from "@aibos/utils";
```

### Define Utilities

Add your shared utilities to `src/index.ts`:

```typescript
// packages/utils/src/index.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US").format(date);
}

export function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

---

## 📁 Structure

```
packages/utils/
├── src/
│   └── index.ts        # Export all utilities here
├── package.json
└── README.md
```

---

## ✅ Best Practices

### 1. Function Organization

- ✅ Export all utilities from `src/index.ts`
- ✅ Use pure functions when possible
- ✅ Add JSDoc comments for complex functions
- ✅ Keep functions focused and single-purpose

### 2. Type Safety

```typescript
// ✅ Good: Type-safe utilities
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US").format(date);
}

// ✅ Good: Generic utilities
export function mapArray<T, U>(
  array: T[],
  mapper: (item: T) => U
): U[] {
  return array.map(mapper);
}
```

### 3. Server/Client Compatibility

- ✅ Prefer utilities that work in both Server and Client Components
- ✅ Avoid browser-only APIs (use conditionals if needed)
- ✅ Document any server/client restrictions

---

## 🔗 Related Packages

- `@aibos/types` - Uses types for function parameters
- `@aibos/ui` - Uses utilities for component logic
- `apps/web` - Uses utilities throughout the application

---

## 📚 Next.js Integration

Utilities are automatically available in Next.js applications:

```typescript
// apps/web/app/components/Example.tsx
import { cn } from "@aibos/utils";

export function Example({ className }: { className?: string }) {
  return <div className={cn("base-class", className)}>Example</div>;
}
```

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Platform Team

