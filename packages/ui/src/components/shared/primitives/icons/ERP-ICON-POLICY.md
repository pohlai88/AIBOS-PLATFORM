# ERP Module Icon Policy

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Status:** ✅ Active Policy  
**Benchmark Validated:** ✅ Yes (See ERP-ICON-BENCHMARK-RESEARCH.md)

---

## 🎯 Icon Policy Summary

### Main ERP Modules → **3D Premium Icons**
**Custom-built 3D isometric icons** matching Apple/Microsoft/Google quality standards.

**✅ Validated Against Industry Benchmarks:**
- **Zoho:** Uses custom icons for main components (validates custom icon approach)
- **Odoo:** Uses custom UI icons for main modules (validates custom icon approach)
- **QuickBooks:** Uses consistent custom icons for modules (validates custom icon approach)
- **SAP:** Uses representative custom icons with strict guidelines (validates premium approach)

**See [ERP-ICON-BENCHMARK-RESEARCH.md](./ERP-ICON-BENCHMARK-RESEARCH.md) for complete research.**

### Other Modules/Sub-modules → **HeroIcons**
**Standard Heroicons** from `@heroicons/react` library.

---

## 📋 Main ERP Modules (3D Icons Required)

These are the **core, primary ERP modules** that require custom 3D premium icons:

### ✅ All Completed
1. **Finance** (`FinanceIcon`) - Finance/Accounting/General Ledger module ✅
2. **Warehouse** (`WarehouseIcon`) - Warehouse/Inventory management module ✅
3. **Sales** (`SalesIcon`) - Sales/CRM module ✅
4. **Purchase** (`PurchaseIcon`) - Procurement/Purchasing module ✅
5. **Manufacturing** (`ManufacturingIcon`) - Production/Manufacturing module ✅
6. **HR** (`HRIcon`) - Human Resources & Payroll module ✅
7. **Project** (`ProjectIcon`) - Project Management module ✅
8. **Asset** (`AssetIcon`) - Fixed Assets management module ✅
9. **Report** (`ReportIcon`) - Reporting & Analytics module ✅
10. **Retail** (`RetailIcon`) - Retail POS module ✅
11. **Logistics** (`LogisticsIcon`) - Logistics/Supply Chain module ✅
12. **E-commerce** (`EcommerceIcon`) - E-commerce/Online Sales module ✅
13. **Dashboard** (`DashboardIcon`) - Dashboard/Analytics module ✅
14. **Quality Assurance** (`QualityAssuranceIcon`) - QA/Laboratory module ✅
15. **Research & Development** (`ResearchDevelopmentIcon`) - R&D module ✅
16. **Central Kitchen** (`CentralKitchenIcon`) - Central Kitchen module ✅
17. **Franchise** (`FranchiseIcon`) - Franchise management module ✅
18. **F&B** (`FnBIcon`) - Food & Beverage module ✅
19. **Bakery** (`BakeryIcon`) - Bakery module ✅
20. **Cafe** (`CafeIcon`) - Cafe module ✅
21. **Plantation** (`PlantationIcon`) - Plantation/Farming module ✅
22. **Trading** (`TradingIcon`) - Trading/Exchange module ✅
23. **Metadata Studio** (`MetadataStudioIcon`) - Metadata management & data catalog (OpenMetadata-inspired) ✅
24. **Kernel** (`KernelIcon`) - Constitutional authority & governance brain (ZohoOne-inspired) ✅
25. **AI-BOS** (`AiBosIcon`) - ERP system core (Hexagonal cell-based, AI-built, compliance-first) ✅
26. **Lynx** (`LynxIcon`) - AI Assistant (MCP-driven, thread/kite relationship) ✅

**Total Main Modules:** 26 modules - **ALL COMPLETED** ✅

---

## 📚 Other Modules (Use HeroIcons)

For **sub-modules, features, or secondary modules**, use HeroIcons from `@heroicons/react`:

### Examples:
- **Settings** → `Cog6ToothIcon` from HeroIcons
- **Users** → `UsersIcon` from HeroIcons
- **Notifications** → `BellIcon` from HeroIcons
- **Search** → `MagnifyingGlassIcon` from HeroIcons
- **Help** → `QuestionMarkCircleIcon` from HeroIcons
- **Documentation** → `DocumentTextIcon` from HeroIcons
- **Calendar** → `CalendarIcon` from HeroIcons
- **Time Tracking** → `ClockIcon` from HeroIcons
- **Expenses** → `BanknotesIcon` from HeroIcons
- **Invoices** → `DocumentArrowUpIcon` from HeroIcons

### Usage Pattern:
```tsx
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { IconWrapper } from '@aibos/ui/components/shared/primitives';

<IconWrapper size="md" variant="primary">
  <Cog6ToothIcon />
</IconWrapper>
```

---

## 🎨 3D Icon Creation Standards

When creating 3D icons for main modules:

1. **Follow ICON-CREATION-GUIDE.md** - Complete methodology and principles
2. **Reference FinanceIcon** - Use as the quality standard
3. **Match Apple/Microsoft/Google** - Professional, sophisticated appearance
4. **Use 3D Isometric Perspective** - 30° rotation, multiple faces
5. **Theme-Aware** - Use `currentColor` throughout
6. **Export in icons/index.ts** - Make available for use

---

## 🔍 Decision Matrix

**Use 3D Custom Icon if:**
- ✅ It's a **main/core ERP module** (Finance, Sales, Purchase, etc.)
- ✅ It's a **primary navigation item** in the main menu
- ✅ It represents a **major business function**
- ✅ It's listed in the "Main ERP Modules" section above

**Use HeroIcons if:**
- ✅ It's a **sub-module or feature** (Settings, Help, Search, etc.)
- ✅ It's a **secondary navigation item**
- ✅ It's a **utility or tool** (Notifications, Calendar, etc.)
- ✅ It's **not** listed in the "Main ERP Modules" section

---

## 📝 Implementation Checklist

When adding a new ERP module icon:

1. **Check if it's a Main Module**
   - Is it in the "Main ERP Modules" list? → Create 3D icon
   - Is it not in the list? → Use HeroIcons

2. **If Main Module:**
   - [ ] Read `ICON-CREATION-GUIDE.md`
   - [ ] Review `FinanceIcon` as reference
   - [ ] Create 3D icon following methodology
   - [ ] Export in `icons/index.ts`
   - [ ] Update this policy document

3. **If Other Module:**
   - [ ] Find appropriate HeroIcon
   - [ ] Use with `IconWrapper` for consistency
   - [ ] Document usage in component

---

## 🚀 Quick Reference

### Import 3D Custom Icons
```tsx
import { FinanceIcon, WarehouseIcon } from '@aibos/ui/components/shared/primitives/icons';
```

### Import HeroIcons
```tsx
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
```

### Use with IconWrapper
```tsx
<IconWrapper size="md" variant="primary">
  {/* Either custom 3D icon or HeroIcon */}
  <FinanceIcon />
  {/* or */}
  <Cog6ToothIcon />
</IconWrapper>
```

---

**Policy Owner:** Frontend Team  
**Review Date:** After each main module icon creation  
**Status:** ✅ Active and Enforced

