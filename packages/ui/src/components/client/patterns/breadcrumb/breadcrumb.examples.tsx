/**
 * Breadcrumb Component Examples
 * Usage examples for the Breadcrumb Layer 3 pattern component
 */

import { Breadcrumb } from "./breadcrumb";

/**
 * Basic breadcrumb
 */
export function BasicBreadcrumb() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Electronics", href: "/products/electronics" },
        { label: "Laptops" },
      ]}
    />
  );
}

/**
 * Breadcrumb with custom separator
 */
export function BreadcrumbCustomSeparator() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
        { label: "Team" },
      ]}
      separator=">"
    />
  );
}

/**
 * Breadcrumb with home icon
 */
export function BreadcrumbWithHome() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Settings" },
      ]}
      showHome
    />
  );
}

/**
 * Breadcrumb with icons
 */
export function BreadcrumbWithIcons() {
  return (
    <Breadcrumb
      items={[
        { label: "Dashboard", href: "/", icon: "🏠" },
        { label: "Users", href: "/users", icon: "👥" },
        { label: "Profile", icon: "👤" },
      ]}
    />
  );
}

/**
 * Breadcrumb with truncation
 */
export function BreadcrumbTruncated() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Level 1", href: "/level1" },
        { label: "Level 2", href: "/level1/level2" },
        { label: "Level 3", href: "/level1/level2/level3" },
        { label: "Level 4", href: "/level1/level2/level3/level4" },
        { label: "Current Page" },
      ]}
      maxItems={3}
    />
  );
}

/**
 * Breadcrumb with disabled items
 */
export function BreadcrumbDisabled() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products", disabled: true },
        { label: "Current" },
      ]}
    />
  );
}

/**
 * Single item breadcrumb
 */
export function BreadcrumbSingle() {
  return <Breadcrumb items={[{ label: "Home" }]} />;
}

/**
 * Long breadcrumb path
 */
export function BreadcrumbLongPath() {
  return (
    <Breadcrumb
      items={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "Electronics", href: "/products/electronics" },
        { label: "Computers", href: "/products/electronics/computers" },
        { label: "Laptops", href: "/products/electronics/computers/laptops" },
        { label: "Gaming Laptops", href: "/products/electronics/computers/laptops/gaming" },
        { label: "Current Model" },
      ]}
    />
  );
}

