# Layout Components

This directory contains production-ready layout components copied from Tailkit, Tailwind, and Next.js MCP.

## Structure

- `dark-slidebar/` - Dark-themed sidebar layouts
- `light-slidebar/` - Light-themed sidebar layouts  
- `stacked/` - Stacked header/footer layouts
- `various/` - Various layout patterns

## Cleanup Status

### ✅ Completed
- Fixed filename typos (`various-llight-content.tsx` → `various-light-content.tsx`, `stacked-brand-headeer-alternative.tsx` → `stacked-brand-header-alternative.tsx`)
- Removed `.md` file that was incorrectly placed
- Updated `index.ts` to export all layout components
- Removed footer attribution links from representative files
- Replaced hardcoded brand names with generic placeholders

### 🔄 In Progress / Recommended
- **Remove footer attribution sections** from all files (15 files remaining)
- **Replace external image URLs** (`cdn.tailkit.com`) with placeholder paths or props
- **Replace hardcoded user names** ("John", "Emma Doe", etc.) with props or placeholders
- **Add TypeScript interfaces** for component props (currently using default exports)
- **Convert to named exports** instead of default exports for better tree-shaking
- **Make brand names configurable** via props instead of hardcoded

## Usage

All components are exported from `packages/ui/src/layouts/index.ts`:

```tsx
import { 
  DarkSidebarBoxedContent,
  LightSidebarFullContent,
  StackedBrandHeaderAlternate,
  // ... etc
} from '@your-package/ui/layouts';
```

## Notes

- Components use `@headlessui/react` for interactive elements
- All components are responsive and support dark mode
- External image URLs should be replaced with your own assets or made configurable via props
- Brand names and user information should be made configurable for production use

