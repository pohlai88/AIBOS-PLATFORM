# Quick Guide: Copying Tailkit Components

## Step-by-Step Process

### 1. Find Component on Tailkit
- Go to [tailkit.com/components](https://tailkit.com/components)
- Browse or search for the component you need
- Click on the component to view code

### 2. Copy the Code
- Click "Copy Code" button on Tailkit
- The component code will be copied to clipboard

### 3. Create Component File
- Navigate to `packages/ui/src/components/[category]/`
- Create new file: `ComponentName.tsx`
- Paste the code

### 4. Adapt the Code

#### Add TypeScript Types
```tsx
// Before (from Tailkit)
export default function Component() {
  return <div>...</div>;
}

// After (adapted)
export interface ComponentProps {
  className?: string;
  // Add other props as needed
}

export function Component({ className = '', ...props }: ComponentProps) {
  return <div className={className}>...</div>;
}
```

#### Add 'use client' if Needed
If component uses:
- useState, useEffect, or other hooks
- Event handlers (onClick, onChange, etc.)
- Browser APIs

Add at the top:
```tsx
'use client';
```

#### Fix Imports
- Ensure `@headlessui/react` imports are correct
- Check if icons need `@heroicons/react`
- Remove any unused imports

### 5. Export the Component

Create/update `packages/ui/src/components/[category]/index.ts`:
```typescript
export { Component } from './Component';
export type { ComponentProps } from './Component';
```

Update `packages/ui/src/components/index.ts`:
```typescript
export * from './[category]';
```

### 6. Use in Your App

```tsx
import { Component } from '@aibos/ui';

export default function Page() {
  return <Component />;
}
```

## Tips for Efficiency

1. **Batch Similar Components**: Copy multiple related components at once
2. **Use VS Code Snippets**: Create snippets for common patterns
3. **Component Library**: Build up your library over time
4. **Reuse Patterns**: Many Tailkit components follow similar patterns

## Common Categories

- **Buttons**: `packages/ui/src/components/buttons/`
- **Forms**: `packages/ui/src/components/forms/`
- **Navigation**: `packages/ui/src/components/navigation/`
- **Layout**: `packages/ui/src/components/layout/`
- **Feedback**: `packages/ui/src/components/feedback/` (modals, alerts, toasts)
- **Data Display**: `packages/ui/src/components/data-display/` (tables, lists)
- **Overlays**: `packages/ui/src/components/overlays/` (dropdowns, popovers)

