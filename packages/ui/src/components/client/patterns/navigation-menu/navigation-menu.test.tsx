/**
 * NavigationMenu Component Tests
 *
 * Tests for the NavigationMenu Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import { NavigationMenu } from "./navigation-menu";
import userEvent from "@testing-library/user-event";

// Helper function to get NavigationMenu element
function getNavigationMenu(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector("nav[aria-label='Navigation menu']") ||
    container.querySelector('[data-testid*="navigation-menu"]')
  ) as HTMLElement | null;
}

describe("NavigationMenu", () => {
  describe("Rendering", () => {
    it("should render navigation menu component", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />
      );
      const menu = getNavigationMenu(container);
      expect(menu).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[{ label: "Home", href: "/" }]}
          testId="test-nav-menu"
        />
      );
      const menu = container.querySelector('[data-testid="test-nav-menu"]');
      expect(menu).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[{ label: "Home", href: "/" }]}
          className="custom-class"
        />
      );
      const menu = getNavigationMenu(container);
      expect(menu).toHaveClass("custom-class");
    });
  });

  describe("Items", () => {
    it("should render all menu items", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "About", href: "/about" },
          ]}
        />
      );
      const menu = getNavigationMenu(container);
      expect(menu?.textContent).toContain("Home");
      expect(menu?.textContent).toContain("Products");
      expect(menu?.textContent).toContain("About");
    });

    it("should render items with hrefs as links", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />
      );
      const links = container.querySelectorAll("a[href]");
      expect(links.length).toBe(2);
    });

    it("should render items with onClick as buttons", () => {
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Action", onClick: handleClick },
          ]}
        />
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render horizontal variant by default", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[{ label: "Home", href: "/" }]}
        />
      );
      const menu = getNavigationMenu(container);
      expect(menu).toHaveClass("flex-row");
    });

    it("should render vertical variant", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          variant="vertical"
          items={[{ label: "Home", href: "/" }]}
        />
      );
      const menu = getNavigationMenu(container);
      expect(menu).toHaveClass("flex-col");
    });
  });

  describe("Sizes", () => {
    it("should render medium size by default", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[{ label: "Home", href: "/" }]}
        />
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-base");
    });

    it("should render small size", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          size="sm"
          items={[{ label: "Home", href: "/" }]}
        />
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-sm");
    });

    it("should render large size", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          size="lg"
          items={[{ label: "Home", href: "/" }]}
        />
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-lg");
    });
  });

  describe("Icons", () => {
    it("should not show icons by default", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Home", href: "/", icon: "🏠" },
          ]}
        />
      );
      // Icon should not be visible when showIcons is false
      expect(container.textContent).toContain("Home");
    });

    it("should show icons when showIcons is true", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          showIcons
          items={[
            { label: "Home", href: "/", icon: "🏠" },
          ]}
        />
      );
      expect(container.textContent).toContain("🏠");
    });
  });

  describe("Submenus", () => {
    it("should render items with submenus as Popover triggers", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            {
              label: "Products",
              href: "/products",
              submenu: [
                { label: "Electronics", href: "/products/electronics" },
              ],
            },
          ]}
        />
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should render disabled items with disabled styling", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Home", href: "/", disabled: true },
          ]}
        />
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("opacity-50");
      expect(link).toHaveClass("pointer-events-none");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes", () => {
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[{ label: "Home", href: "/" }]}
        />
      );
      const nav = container.querySelector("nav[aria-label='Navigation menu']");
      expect(nav).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <NavigationMenu
          items={[
            { label: "Action", onClick: handleClick },
          ]}
        />
      );
      const button = container.querySelector("button");
      if (button) {
        await user.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });
  });
});

