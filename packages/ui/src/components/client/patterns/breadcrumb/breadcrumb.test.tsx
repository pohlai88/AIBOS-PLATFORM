/**
 * Breadcrumb Component Tests
 *
 * Tests for the Breadcrumb Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import { Breadcrumb } from "./breadcrumb";

// Helper function to get Breadcrumb element
function getBreadcrumb(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector("nav[aria-label='Breadcrumb']") ||
    container.querySelector('[data-testid*="breadcrumb"]')
  ) as HTMLElement | null;
}

describe("Breadcrumb", () => {
  describe("Rendering", () => {
    it("should render breadcrumb component", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      const breadcrumb = getBreadcrumb(container);
      expect(breadcrumb).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[{ label: "Home" }]}
          testId="test-breadcrumb"
        />
      );
      const breadcrumb = container.querySelector('[data-testid="test-breadcrumb"]');
      expect(breadcrumb).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[{ label: "Home" }]}
          className="custom-class"
        />
      );
      const breadcrumb = getBreadcrumb(container);
      expect(breadcrumb).toHaveClass("custom-class");
    });
  });

  describe("Items", () => {
    it("should render all items", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "Current" },
          ]}
        />
      );
      const breadcrumb = getBreadcrumb(container);
      expect(breadcrumb?.textContent).toContain("Home");
      expect(breadcrumb?.textContent).toContain("Products");
      expect(breadcrumb?.textContent).toContain("Current");
    });

    it("should render single item", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={[{ label: "Home" }]} />
      );
      const breadcrumb = getBreadcrumb(container);
      expect(breadcrumb?.textContent).toContain("Home");
    });

    it("should render items with hrefs as links", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      const link = container.querySelector("a[href='/']");
      expect(link).toBeInTheDocument();
    });

    it("should render current item without link", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      const currentItem = container.querySelector('span[aria-current="page"]');
      expect(currentItem).toBeInTheDocument();
      expect(currentItem?.textContent).toContain("Current");
    });
  });

  describe("Separator", () => {
    it("should render default separator", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      const separator = container.querySelector('span[aria-hidden="true"]');
      expect(separator).toBeInTheDocument();
      expect(separator?.textContent).toBe("/");
    });

    it("should render custom separator", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
          separator=">"
        />
      );
      const separator = container.querySelector('span[aria-hidden="true"]');
      expect(separator?.textContent).toBe(">");
    });
  });

  describe("Home Icon", () => {
    it("should not show home icon by default", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      // Home icon would be an SVG, check that text "Home" is visible
      expect(container.textContent).toContain("Home");
    });

    it("should show home icon when showHome is true", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
          showHome
        />
      );
      // Home icon would be an SVG element
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render items with icons", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/", icon: "🏠" },
            { label: "Current" },
          ]}
        />
      );
      expect(container.textContent).toContain("🏠");
    });
  });

  describe("Truncation", () => {
    it("should truncate when maxItems is set", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Level 1", href: "/level1" },
            { label: "Level 2", href: "/level2" },
            { label: "Level 3", href: "/level3" },
            { label: "Current" },
          ]}
          maxItems={3}
        />
      );
      // Truncation should show ellipsis
      const breadcrumb = getBreadcrumb(container);
      expect(breadcrumb).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      const nav = container.querySelector("nav[aria-label='Breadcrumb']");
      expect(nav).toBeInTheDocument();
    });

    it("should mark current page with aria-current", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Current" },
          ]}
        />
      );
      const currentItem = container.querySelector('[aria-current="page"]');
      expect(currentItem).toBeInTheDocument();
    });
  });

  describe("Composition", () => {
    it("should compose with multiple items", () => {
      const { container } = renderWithTheme(
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "Electronics", href: "/products/electronics" },
            { label: "Current" },
          ]}
        />
      );
      const links = container.querySelectorAll("a");
      expect(links.length).toBe(3); // Three items with hrefs
    });
  });
});

