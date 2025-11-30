# Custom ERP Module Icons

This directory contains **premium 3D icons** for AI-BOS ERP modules. All icons are designed to match **Apple/Microsoft/Google quality standards** with sophisticated 3D isometric perspective, gradients, and professional polish. Icons work seamlessly with the `IconWrapper` component.

## Available Icons

- **FinanceIcon** - Finance/Accounting module icon
- **WarehouseIcon** - Warehouse/Inventory module icon

## Usage

### Basic Usage with IconWrapper

```tsx
import { FinanceIcon } from "@aibos/ui/components/shared/primitives/icons";
import { IconWrapper } from "@aibos/ui/components/shared/primitives";

<IconWrapper size="md" variant="primary">
  <FinanceIcon />
</IconWrapper>;
```

### In Navigation Menu

```tsx
import {
  FinanceIcon,
  WarehouseIcon,
} from "@aibos/ui/components/shared/primitives/icons";
import { NavigationMenu } from "@aibos/ui/components/client/patterns";

<NavigationMenu
  showIcons
  items={[
    { label: "Finance", href: "/finance", icon: <FinanceIcon /> },
    { label: "Warehouse", href: "/warehouse", icon: <WarehouseIcon /> },
  ]}
/>;
```

### In Breadcrumb

```tsx
import { FinanceIcon } from "@aibos/ui/components/shared/primitives/icons";
import { Breadcrumb } from "@aibos/ui/components/client/patterns";

<Breadcrumb
  showIcons
  items={[
    { label: "Finance", href: "/finance", icon: <FinanceIcon /> },
    { label: "General Ledger" },
  ]}
/>;
```

### Direct Usage (with className)

```tsx
import { FinanceIcon } from "@aibos/ui/components/shared/primitives/icons";

<FinanceIcon className="w-6 h-6 text-primary" />;
```

## Creating New Icons

### Design Philosophy

All icons follow the **Premium 3D Design Philosophy**:

- **3D Isometric Perspective** - Multiple faces (top, front, side) for depth
- **Sophisticated Gradients** - Multiple gradient layers for dimension
- **Professional Polish** - Apple/Microsoft/Google quality standards
- **Theme-Aware** - Uses `currentColor` for theme compatibility
- **Enterprise-Grade** - Premium appearance for business applications

### Icon Requirements

1. **Follow 3D Premium Pattern:**
   - Use **3D isometric perspective** (30° rotation)
   - Create **multiple faces** (top, front, side) for depth
   - Use **multiple gradients** (3-4 gradients per icon)
   - Use `currentColor` with opacity variations for theme-aware coloring
   - Use `viewBox="0 0 24 24"` for consistent sizing
   - Include `aria-hidden="true"` (IconWrapper handles accessibility)
   - Use `React.useId()` for unique gradient IDs

2. **File Structure:**

   ```
   icons/
   ├── {module-name}-icon.tsx
   ├── index.ts
   └── README.md
   ```

3. **Component Pattern (3D Premium):**

   ```tsx
   import * as React from "react";

   export interface {ModuleName}IconProps extends React.SVGProps<SVGSVGElement> {
     className?: string;
   }

   export const {ModuleName}Icon = React.forwardRef<SVGSVGElement, {ModuleName}IconProps>(
     ({ className, ...props }, ref) => {
       // Generate unique IDs for gradients
       const gradientId1 = React.useId();
       const gradientId2 = React.useId();
       const gradientId3 = React.useId();

       return (
         <svg
           ref={ref}
           xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 24 24"
           fill="none"
           className={className}
           aria-hidden="true"
           {...props}
         >
           <defs>
             {/* Top face gradient - brightest */}
             <linearGradient id={gradientId1} x1="12" y1="4" x2="12" y2="12">
               <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
               <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
             </linearGradient>
             {/* Side face gradient - darkest */}
             <linearGradient id={gradientId2} x1="12" y1="12" x2="20" y2="20">
               <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
               <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
             </linearGradient>
             {/* Front face gradient - medium */}
             <linearGradient id={gradientId3} x1="0" y1="0" x2="24" y2="24">
               <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
               <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
             </linearGradient>
           </defs>

           {/* 3D icon elements with isometric perspective */}
         </svg>
       );
     }
   );

   {ModuleName}Icon.displayName = "{ModuleName}Icon";
   ```

4. **Export in index.ts:**
   ```tsx
   export { {ModuleName}Icon } from './{module-name}-icon'
   export type { {ModuleName}IconProps } from './{module-name}-icon'
   ```

## Icon Design Guidelines (3D Premium)

1. **Size:** Icons should fit within 24x24 viewBox
2. **Perspective:** Use isometric 3D perspective (30° rotation standard)
3. **Faces:** Show multiple faces (top, front, side) for depth
4. **Gradients:** Use 3-4 gradients per icon for dimension
5. **Opacity:** Top face (0.9-1.0), Front (0.7-0.8), Side (0.4-0.6)
6. **Color:** Always use `currentColor` with opacity variations
7. **Shadows:** Add subtle shadows for elevation (opacity 0.1-0.2)
8. **Accessibility:** Icons are decorative; use IconWrapper for labels
9. **Quality:** Match Apple/Microsoft/Google professional standards

## ERP Module Icons Policy

### Main ERP Modules → 3D Custom Icons

**All core modules with premium 3D custom icons:**

- ✅ **FinanceIcon** (Finance/Accounting) - Completed
- ✅ **WarehouseIcon** (Warehouse/Inventory) - Completed
- ✅ **SalesIcon** (Sales/CRM) - Completed
- ✅ **PurchaseIcon** (Procurement) - Completed
- ✅ **ManufacturingIcon** (Production) - Completed
- ✅ **HRIcon** (Human Resources) - Completed
- ✅ **ProjectIcon** (Project Management) - Completed
- ✅ **AssetIcon** (Fixed Assets) - Completed
- ✅ **ReportIcon** (Reporting/Analytics) - Completed
- ✅ **RetailIcon** (Retail POS) - Completed
- ✅ **LogisticsIcon** (Logistics/Supply Chain) - Completed
- ✅ **EcommerceIcon** (E-commerce/Online Sales) - Completed
- ✅ **DashboardIcon** (Dashboard/Analytics) - Completed
- ✅ **QualityAssuranceIcon** (QA/Laboratory) - Completed
- ✅ **ResearchDevelopmentIcon** (R&D) - Completed
- ✅ **CentralKitchenIcon** (Central Kitchen) - Completed
- ✅ **FranchiseIcon** (Franchise Management) - Completed
- ✅ **FnBIcon** (Food & Beverage) - Completed
- ✅ **BakeryIcon** (Bakery) - Completed
- ✅ **CafeIcon** (Cafe) - Completed
- ✅ **PlantationIcon** (Plantation/Farming) - Completed
- ✅ **TradingIcon** (Trading/Exchange) - Completed
- ✅ **MetadataStudioIcon** (Metadata Studio/Data Catalog) - Completed
- ✅ **KernelIcon** (Kernel/Governance Core) - Completed
- ✅ **AiBosIcon** (AI-BOS ERP System) - Completed
- ✅ **LynxIcon** (Lynx AI Assistant) - Completed

**Total:** 26 main modules - **ALL COMPLETED** ✅

### Other Modules → HeroIcons

**For sub-modules, utilities, and secondary features, use HeroIcons:**

- Settings → `Cog6ToothIcon`
- Users → `UsersIcon`
- Notifications → `BellIcon`
- Search → `MagnifyingGlassIcon`
- Help → `QuestionMarkCircleIcon`
- Calendar → `CalendarIcon`
- And all other non-main modules

**See [ERP-ICON-POLICY.md](./ERP-ICON-POLICY.md) for complete policy and decision matrix.**

## Resources

### Design References

- **Apple Icons** - Clean, minimalist, subtle gradients
- **Microsoft Fluent** - Depth, modern 3D effects
- **Google Material** - Elevation, clear geometry

### Documentation

- **[ICON-CREATION-GUIDE.md](./ICON-CREATION-GUIDE.md)** - Complete 3D icon creation guide with philosophy, principles, and step-by-step process
- **[IconWrapper Component](../icon-wrapper.tsx)** - Wrapper for consistent sizing
- **[IconButton Component](../icon-button.tsx)** - Button with icon support

### Reference Implementation

- **[FinanceIcon](./finance-icon.tsx)** - Complete 3D premium icon example with all best practices
