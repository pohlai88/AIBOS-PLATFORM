# @aibos/types

> **Shared TypeScript types** for the AIBOS Platform.

This package provides shared TypeScript type definitions used across the monorepo.

---

## 📦 Installation

This package is part of the AIBOS monorepo and is automatically available to other packages.

```json
{
  "dependencies": {
    "@aibos/types": "workspace:*"
  }
}
```

---

## 🎯 Usage

### Import Types

```typescript
import type { User, UserRole } from "@aibos/types";
```

### Define Types

Add your shared types to `src/index.ts`:

```typescript
// packages/types/src/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type UserRole = "admin" | "user" | "guest";

export type ApiResponse<T> = {
  data: T;
  error?: string;
  status: number;
};
```

---

## 📁 Structure

```
packages/types/
├── src/
│   └── index.ts        # Export all types here
├── package.json
└── README.md
```

---

## ✅ Best Practices

### 1. Type Organization

- ✅ Export all types from `src/index.ts`
- ✅ Use `export type` for type-only exports
- ✅ Group related types together
- ✅ Use descriptive names

### 2. Type Definitions

```typescript
// ✅ Good: Clear, descriptive types
export interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: Union types for enums
export type Status = "pending" | "active" | "inactive";

// ✅ Good: Generic utility types
export type ApiResponse<T> = {
  data: T;
  error?: string;
};
```

### 3. Re-exports

```typescript
// ✅ Good: Re-export from index
export type { User, UserRole } from "./user";
export type { Product, ProductCategory } from "./product";
```

---

## 🔗 Related Packages

- `@aibos/ui` - Uses types for component props
- `@aibos/utils` - Uses types for function parameters
- `apps/web` - Uses types throughout the application

---

## 📚 Next.js Integration

Types are automatically available in Next.js applications:

```typescript
// apps/web/app/users/page.tsx
import type { User } from "@aibos/types";

export default function UsersPage() {
  const users: User[] = [];
  // Type-safe usage
}
```

---

**Last Updated:** 2024  
**Maintained By:** AIBOS Platform Team
