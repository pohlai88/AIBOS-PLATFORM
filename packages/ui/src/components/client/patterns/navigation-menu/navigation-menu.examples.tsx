/**
 * NavigationMenu Component Examples
 * Usage examples for the NavigationMenu Layer 3 pattern component
 */

import { NavigationMenu } from "./navigation-menu";

/**
 * Basic horizontal navigation menu
 */
export function BasicNavigationMenu() {
  return (
    <NavigationMenu
      items={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ]}
    />
  );
}

/**
 * Navigation menu with submenus
 */
export function NavigationMenuWithSubmenus() {
  return (
    <NavigationMenu
      items={[
        { label: "Home", href: "/" },
        {
          label: "Products",
          href: "/products",
          submenu: [
            { label: "Electronics", href: "/products/electronics" },
            { label: "Clothing", href: "/products/clothing" },
            { label: "Books", href: "/products/books" },
          ],
        },
        {
          label: "Services",
          href: "/services",
          submenu: [
            { label: "Consulting", href: "/services/consulting" },
            { label: "Support", href: "/services/support" },
          ],
        },
        { label: "About", href: "/about" },
      ]}
    />
  );
}

/**
 * Vertical navigation menu
 */
export function VerticalNavigationMenu() {
  return (
    <NavigationMenu
      variant="vertical"
      items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Projects", href: "/projects" },
        { label: "Team", href: "/team" },
        { label: "Settings", href: "/settings" },
      ]}
    />
  );
}

/**
 * Navigation menu with icons
 */
export function NavigationMenuWithIcons() {
  return (
    <NavigationMenu
      showIcons
      items={[
        { label: "Home", href: "/", icon: "🏠" },
        { label: "Products", href: "/products", icon: "📦" },
        { label: "About", href: "/about", icon: "ℹ️" },
        { label: "Contact", href: "/contact", icon: "📧" },
      ]}
    />
  );
}

/**
 * Navigation menu with nested submenus
 */
export function NavigationMenuNested() {
  return (
    <NavigationMenu
      items={[
        { label: "Home", href: "/" },
        {
          label: "Products",
          href: "/products",
          submenu: [
            {
              label: "Electronics",
              href: "/products/electronics",
              submenu: [
                { label: "Phones", href: "/products/electronics/phones" },
                { label: "Laptops", href: "/products/electronics/laptops" },
              ],
            },
            { label: "Clothing", href: "/products/clothing" },
          ],
        },
        { label: "About", href: "/about" },
      ]}
    />
  );
}

/**
 * Navigation menu with disabled items
 */
export function NavigationMenuDisabled() {
  return (
    <NavigationMenu
      items={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products", disabled: true },
        { label: "About", href: "/about" },
      ]}
    />
  );
}

/**
 * Navigation menu with click handlers
 */
export function NavigationMenuWithHandlers() {
  return (
    <NavigationMenu
      items={[
        { label: "Home", href: "/" },
        {
          label: "Logout",
          onClick: () => {
            console.log("Logging out...");
          },
        },
      ]}
    />
  );
}

/**
 * Large navigation menu
 */
export function LargeNavigationMenu() {
  return (
    <NavigationMenu
      size="lg"
      items={[
        { label: "Home", href: "/" },
        { label: "Products", href: "/products" },
        { label: "About", href: "/about" },
      ]}
    />
  );
}

