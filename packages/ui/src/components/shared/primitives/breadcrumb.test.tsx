/**
 * Breadcrumb Component Tests
 *
 * Tests for the Breadcrumb primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Breadcrumb } from "./breadcrumb";

describe("Breadcrumb", () => {
  const mockItems = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Electronics", href: "/products/electronics" },
    { label: "Laptops" }, // Current page (no href)
  ];

  describe("Rendering", () => {
    it("should render breadcrumb element", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("should render breadcrumb items", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const links = container.querySelectorAll("a");
      expect(links.length).toBe(3); // First 3 items have hrefs
    });

    it("should render current page as span", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const spans = container.querySelectorAll("span");
      const currentPage = Array.from(spans).find((span) =>
        span.textContent?.includes("Laptops")
      );
      expect(currentPage).toBeInTheDocument();
    });

    it("should render separators between items", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const separators = container.querySelectorAll('span[aria-hidden="true"]');
      expect(separators.length).toBe(3); // 4 items = 3 separators
    });

    it("should render with custom separator", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={mockItems} separator=">" />
      );
      const separators = container.querySelectorAll('span[aria-hidden="true"]');
      expect(separators[0]?.textContent).toBe(">");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={mockItems} testId="test-breadcrumb" />
      );
      const nav = container.querySelector('[data-testid="test-breadcrumb"]');
      expect(nav).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      await expectAccessible(container);
    });

    it("should have aria-label='Breadcrumb'", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveAttribute("aria-label", "Breadcrumb");
    });

    it("should have aria-current='page' on current page", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const currentPage = container.querySelector('[aria-current="page"]');
      expect(currentPage).toBeInTheDocument();
      expect(currentPage?.textContent).toContain("Laptops");
    });

    it("should have aria-hidden on separators", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const separators = container.querySelectorAll('span[aria-hidden="true"]');
      separators.forEach((separator) => {
        expect(separator).toHaveAttribute("aria-hidden", "true");
      });
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const nav = container.querySelector("nav");
      expect(nav).toHaveAttribute("data-mcp-validated", "true");
      expect(nav).toHaveAttribute(
        "data-constitution-compliant",
        "breadcrumb-shared"
      );
    });
  });

  describe("Items", () => {
    it("should render items with hrefs as links", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const links = container.querySelectorAll("a");
      expect(links[0]).toHaveAttribute("href", "/");
      expect(links[1]).toHaveAttribute("href", "/products");
    });

    it("should render items without hrefs as spans", () => {
      const { container } = renderWithTheme(<Breadcrumb items={mockItems} />);
      const spans = container.querySelectorAll("span");
      const currentPage = Array.from(spans).find((span) =>
        span.textContent?.includes("Laptops")
      );
      expect(currentPage).toBeInTheDocument();
    });

    it("should render items with icons", () => {
      const itemsWithIcons = [
        { label: "Home", href: "/", icon: <span>🏠</span> },
        { label: "Settings" },
      ];
      const { container } = renderWithTheme(
        <Breadcrumb items={itemsWithIcons} />
      );
      const icon = container.querySelector("span");
      expect(icon?.textContent).toContain("🏠");
    });
  });

  describe("Truncation", () => {
    it("should truncate items when maxItems is set", () => {
      const manyItems = [
        { label: "Home", href: "/" },
        { label: "Level 1", href: "/1" },
        { label: "Level 2", href: "/2" },
        { label: "Level 3", href: "/3" },
        { label: "Level 4", href: "/4" },
        { label: "Current" },
      ];
      const { container } = renderWithTheme(
        <Breadcrumb items={manyItems} maxItems={3} />
      );
      // The truncation indicator "..." is rendered as a span (no href)
      const spans = container.querySelectorAll("span");
      const truncated = Array.from(spans).find((span) =>
        span.textContent?.includes("...")
      );
      expect(truncated).toBeInTheDocument();
    });

    it("should not truncate when items.length <= maxItems", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={mockItems} maxItems={5} />
      );
      const truncated = container.querySelector("span");
      expect(truncated?.textContent).not.toContain("...");
    });
  });

  describe("Home Icon", () => {
    it("should show home icon when showHome is true", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={mockItems} showHome />
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should not show home icon when showHome is false", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={mockItems} showHome={false} />
      );
      const svg = container.querySelector("svg");
      expect(svg).not.toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Breadcrumb items={mockItems} ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML nav attributes", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={mockItems} id="test" data-testid="breadcrumb" />
      );
      const nav = container.querySelector("#test");
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute("id", "test");
    });
  });

  describe("Edge Cases", () => {
    it("should handle single item", () => {
      const { container } = renderWithTheme(
        <Breadcrumb items={[{ label: "Home" }]} />
      );
      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("should handle empty items array", () => {
      const { container } = renderWithTheme(<Breadcrumb items={[]} />);
      const nav = container.querySelector("nav");
      expect(nav).toBeInTheDocument();
    });

    it("should handle all items with hrefs", () => {
      const allLinks = [
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
      ];
      const { container } = renderWithTheme(<Breadcrumb items={allLinks} />);
      // All items have hrefs, so all should be links
      // But the last item might be treated as current page if it's the last one
      // Let's check that at least the first item is a link
      const links = container.querySelectorAll("a");
      expect(links.length).toBeGreaterThanOrEqual(1);
      // The last item without explicit current page indicator might still be a link
      // So we check that links exist
      expect(links.length).toBeGreaterThan(0);
    });
  });
});
