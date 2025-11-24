# Icon Usage Guide - Heroicons v2

This project uses **Heroicons v2** (`@heroicons/react: ^2.2.0`).

## ✅ Heroicons v2 Import Pattern

Heroicons v2 uses size-specific import paths:

```tsx
// 24x24 icons (most common)
import { HomeIcon } from "@heroicons/react/24/outline"; // Outline style
import { HomeIcon } from "@heroicons/react/24/solid"; // Solid style

// 20x20 icons (compact)
import { HomeIcon } from "@heroicons/react/20/solid"; // Solid only

// 16x16 icons (micro - v2 feature)
import { HomeIcon } from "@heroicons/react/16/solid"; // Solid only
```

## Using the Icon Wrapper Component

We provide an `Icon` wrapper component for consistent sizing:

```tsx
import { Icon } from '@aibos/ui'
import { HomeIcon, UserIcon } from '@heroicons/react/24/outline'

// Basic usage
<Icon icon={HomeIcon} size="md" />

// With custom className
<Icon icon={UserIcon} size="lg" className="text-primary" />

// In buttons
<Button>
  <Icon icon={HomeIcon} size="sm" className="mr-2" />
  Home
</Button>
```

## Size Options

- `xs`: `h-3 w-3` (12px)
- `sm`: `h-4 w-4` (16px)
- `md`: `h-5 w-5` (20px) - **default**
- `lg`: `h-6 w-6` (24px)
- `xl`: `h-8 w-8` (32px)

## Direct Usage (Without Wrapper)

You can also use Heroicons directly:

```tsx
import { HomeIcon } from "@heroicons/react/24/outline";

<HomeIcon className="h-5 w-5 text-fg" />;
```

## Common Icons

### Navigation

```tsx
import {
  HomeIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
```

### Actions

```tsx
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
```

### Status

```tsx
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
```

## Migration from v1 (if needed)

If you find any old v1 imports, update them:

```tsx
// ❌ v1 (old)
import { HomeIcon } from "@heroicons/react/solid";
import { HomeIcon } from "@heroicons/react/outline";

// ✅ v2 (current)
import { HomeIcon } from "@heroicons/react/24/solid";
import { HomeIcon } from "@heroicons/react/24/outline";
```

## Icon Naming Changes in v2

Some icons were renamed:

- `mail` → `envelope`
- `search` → `magnifying-glass`
- `dots-vertical` → `ellipsis-vertical`
- `dots-horizontal` → `ellipsis-horizontal`

Check the [Heroicons v2 documentation](https://heroicons.com/) for the full list.
