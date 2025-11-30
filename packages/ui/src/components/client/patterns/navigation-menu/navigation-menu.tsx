/**
 * NavigationMenu Component - Layer 3 Complex Pattern
 *
 * Navigation menu component with dropdown submenus using Popover.
 * Provides hierarchical navigation with hover/click interactions.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { NavigationMenu } from '@aibos/ui/patterns';
 *
 * export default function Nav() {
 *   return (
 *     <NavigationMenu
 *       items={[
 *         { label: 'Home', href: '/' },
 *         { label: 'Products', href: '/products', submenu: [...] },
 *       ]}
 *     />
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import Layer 2 Popover
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../compositions/popover/popover";

// Import Layer 1 Typography
import { Text } from "../../../shared/primitives/typography/text";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type {
  NavigationMenuProps,
  NavigationMenuItem,
  NavigationMenuVariant,
  NavigationMenuSize,
} from "./navigation-menu.types";

/**
 * NavigationMenu - Navigation menu component
 *
 * Features:
 * - Horizontal and vertical variants
 * - Dropdown submenus using Popover
 * - Icon support
 * - Disabled state
 * - Click and hover interactions
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const NavigationMenu = React.forwardRef<
  HTMLElement,
  NavigationMenuProps
>(
  (
    {
      items,
      variant = "horizontal",
      size = "md",
      showIcons = false,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    // Variant-based styling
    const variantStyles: Record<NavigationMenuVariant, string> = {
      default: "flex flex-row gap-1",
      horizontal: "flex flex-row gap-1",
      vertical: "flex flex-col gap-1",
    };

    // Size-based styling
    const sizeStyles: Record<NavigationMenuSize, string> = {
      sm: "text-sm px-2 py-1",
      md: "text-base px-3 py-2",
      lg: "text-lg px-4 py-3",
    };

    // Render menu item
    const renderMenuItem = (item: NavigationMenuItem, index: number) => {
      const hasSubmenu = item.submenu && item.submenu.length > 0;

      if (hasSubmenu) {
        return (
          <Popover key={index}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2",
                  sizeStyles[size],
                  "text-fg",
                  "hover:bg-bg-muted",
                  "rounded-md",
                  "transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  item.disabled && "opacity-50 cursor-not-allowed"
                )}
                disabled={item.disabled}
              >
                {showIcons && item.icon && (
                  <span className="flex-shrink-0">{item.icon}</span>
                )}
                <Text>{item.label}</Text>
                {hasSubmenu && (
                  <span className="ml-auto">▼</span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="start" size="sm">
              <nav className="flex flex-col gap-1">
                {item.submenu?.map((subItem, subIndex) => (
                  <a
                    key={subIndex}
                    href={subItem.href}
                    onClick={subItem.onClick}
                    className={cn(
                      "flex items-center gap-2",
                      "px-3 py-2",
                      "text-fg",
                      "hover:bg-bg-muted",
                      "rounded-md",
                      "transition-colors",
                      "no-underline",
                      subItem.disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {showIcons && subItem.icon && (
                      <span className="flex-shrink-0">{subItem.icon}</span>
                    )}
                    <Text>{subItem.label}</Text>
                  </a>
                ))}
              </nav>
            </PopoverContent>
          </Popover>
        );
      }

      // Regular menu item (no submenu)
      if (item.href) {
        return (
          <a
            key={index}
            href={item.href}
            onClick={item.onClick}
            className={cn(
              "flex items-center gap-2",
              sizeStyles[size],
              "text-fg",
              "hover:bg-bg-muted",
              "rounded-md",
              "transition-colors",
              "no-underline",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              item.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            {showIcons && item.icon && (
              <span className="flex-shrink-0">{item.icon}</span>
            )}
            <Text>{item.label}</Text>
          </a>
        );
      }

      // Button item (no href)
      return (
        <button
          key={index}
          onClick={item.onClick}
          className={cn(
            "flex items-center gap-2",
            sizeStyles[size],
            "text-fg",
            "hover:bg-bg-muted",
            "rounded-md",
            "transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          disabled={item.disabled}
        >
          {showIcons && item.icon && (
            <span className="flex-shrink-0">{item.icon}</span>
          )}
          <Text>{item.label}</Text>
        </button>
      );
    };

    return (
      <nav
        ref={ref as React.RefObject<HTMLElement>["current"]}
        className={cn(
          variantStyles[variant],
          "mcp-layer3-pattern",
          className
        )}
        data-testid={testId}
        aria-label="Navigation menu"
        {...props}
      >
        {items.map((item, index) => renderMenuItem(item, index))}
      </nav>
    );
  }
);

NavigationMenu.displayName = "NavigationMenu";

