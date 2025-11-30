/**
 * Inline Component Tests
 *
 * Tests for the Inline primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Inline } from "./inline";

// Helper function to get Inline element (excludes test-theme-wrapper)
function getInline(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-component")
  );
}

describe("Inline", () => {
  describe("Rendering", () => {
    it("should render inline element", () => {
      const { container } = renderWithTheme(<Inline>Inline content</Inline>);
      const element = getInline(container);
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toContain("Inline content");
    });

    it("should render inline with children", () => {
      const { container } = renderWithTheme(
        <Inline>
          <div>Item 1</div>
          <div>Item 2</div>
        </Inline>
      );
      const element = getInline(container);
      expect(element?.textContent).toContain("Item 1");
      expect(element?.textContent).toContain("Item 2");
    });

    it("should render inline with custom className", () => {
      const { container } = renderWithTheme(
        <Inline className="custom-class">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("custom-class");
    });

    it("should render inline with id", () => {
      const { container } = renderWithTheme(
        <Inline id="test-inline">Content</Inline>
      );
      const element = container.querySelector("#test-inline");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test-inline");
    });

    it("should render empty inline", () => {
      const { container } = renderWithTheme(<Inline />);
      const element = getInline(container);
      expect(element).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Inline>Accessible inline</Inline>);
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Inline>Test</Inline>);
      const element = getInline(container);
      expect(element).toHaveAttribute("data-mcp-validated", "true");
      expect(element).toHaveAttribute(
        "data-constitution-compliant",
        "inline-shared"
      );
    });

    it("should support semantic HTML elements", () => {
      const { container } = renderWithTheme(
        <Inline as="nav">Navigation</Inline>
      );
      const element = container.querySelector("nav");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Base Styles", () => {
    it("should have flex row layout", () => {
      const { container } = renderWithTheme(<Inline>Content</Inline>);
      const element = getInline(container);
      expect(element).toHaveClass("flex", "flex-row");
    });
  });

  describe("Spacing", () => {
    it("should apply extra small spacing", () => {
      const { container } = renderWithTheme(
        <Inline spacing="xs">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("gap-1");
    });

    it("should apply small spacing", () => {
      const { container } = renderWithTheme(
        <Inline spacing="sm">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("gap-2");
    });

    it("should apply medium spacing", () => {
      const { container } = renderWithTheme(
        <Inline spacing="md">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("gap-4");
    });

    it("should apply large spacing", () => {
      const { container } = renderWithTheme(
        <Inline spacing="lg">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("gap-6");
    });

    it("should apply extra large spacing", () => {
      const { container } = renderWithTheme(
        <Inline spacing="xl">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("gap-8");
    });

    it("should default to medium spacing", () => {
      const { container } = renderWithTheme(<Inline>Default</Inline>);
      const element = getInline(container);
      expect(element).toHaveClass("gap-4");
    });
  });

  describe("Alignment", () => {
    it("should apply start alignment", () => {
      const { container } = renderWithTheme(
        <Inline align="start">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("items-start");
    });

    it("should apply center alignment", () => {
      const { container } = renderWithTheme(
        <Inline align="center">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("items-center");
    });

    it("should apply end alignment", () => {
      const { container } = renderWithTheme(
        <Inline align="end">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("items-end");
    });

    it("should apply baseline alignment", () => {
      const { container } = renderWithTheme(
        <Inline align="baseline">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("items-baseline");
    });

    it("should apply stretch alignment", () => {
      const { container } = renderWithTheme(
        <Inline align="stretch">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("items-stretch");
    });

    it("should default to center alignment", () => {
      const { container } = renderWithTheme(<Inline>Default</Inline>);
      const element = getInline(container);
      expect(element).toHaveClass("items-center");
    });
  });

  describe("Justify", () => {
    it("should apply start justify", () => {
      const { container } = renderWithTheme(
        <Inline justify="start">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("justify-start");
    });

    it("should apply center justify", () => {
      const { container } = renderWithTheme(
        <Inline justify="center">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("justify-center");
    });

    it("should apply end justify", () => {
      const { container } = renderWithTheme(
        <Inline justify="end">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("justify-end");
    });

    it("should apply between justify", () => {
      const { container } = renderWithTheme(
        <Inline justify="between">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("justify-between");
    });

    it("should apply around justify", () => {
      const { container } = renderWithTheme(
        <Inline justify="around">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("justify-around");
    });

    it("should apply evenly justify", () => {
      const { container } = renderWithTheme(
        <Inline justify="evenly">Content</Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("justify-evenly");
    });

    it("should default to start justify", () => {
      const { container } = renderWithTheme(<Inline>Default</Inline>);
      const element = getInline(container);
      expect(element).toHaveClass("justify-start");
    });
  });

  describe("Wrap", () => {
    it("should apply wrap when wrap is true", () => {
      const { container } = renderWithTheme(<Inline wrap>Content</Inline>);
      const element = getInline(container);
      expect(element).toHaveClass("flex-wrap");
    });

    it("should not apply wrap by default", () => {
      const { container } = renderWithTheme(<Inline>Default</Inline>);
      const element = getInline(container);
      expect(element).not.toHaveClass("flex-wrap");
    });
  });

  describe("Full Width", () => {
    it("should apply full width when fullWidth is true", () => {
      const { container } = renderWithTheme(<Inline fullWidth>Content</Inline>);
      const element = getInline(container);
      expect(element).toHaveClass("w-full");
    });

    it("should not apply full width by default", () => {
      const { container } = renderWithTheme(<Inline>Default</Inline>);
      const element = getInline(container);
      expect(element).not.toHaveClass("w-full");
    });
  });

  describe("Semantic Elements", () => {
    it("should render as div by default", () => {
      const { container } = renderWithTheme(<Inline>Content</Inline>);
      const element = container.querySelector("div");
      expect(element).toBeInTheDocument();
    });

    it("should render as nav", () => {
      const { container } = renderWithTheme(
        <Inline as="nav">Navigation</Inline>
      );
      const element = container.querySelector("nav");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Inline ref={ref}>Content</Inline>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Inline id="test" data-testid="inline" aria-label="Test inline">
          Content
        </Inline>
      );
      const element = container.querySelector("#test");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test");
      expect(element).toHaveAttribute("data-testid", "inline");
      expect(element).toHaveAttribute("aria-label", "Test inline");
    });

    it("should accept testId prop", () => {
      const { container } = renderWithTheme(
        <Inline testId="test-inline">Content</Inline>
      );
      const element = container.querySelector('[data-testid="test-inline"]');
      expect(element).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null children", () => {
      const { container } = renderWithTheme(<Inline>{null}</Inline>);
      const element = getInline(container);
      expect(element).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Inline>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </Inline>
      );
      const element = getInline(container);
      expect(element?.textContent).toContain("First");
      expect(element?.textContent).toContain("Second");
      expect(element?.textContent).toContain("Third");
    });

    it("should combine spacing, align, justify, and wrap correctly", () => {
      const { container } = renderWithTheme(
        <Inline spacing="lg" align="baseline" justify="between" wrap>
          Combined
        </Inline>
      );
      const element = getInline(container);
      expect(element).toHaveClass("gap-6");
      expect(element).toHaveClass("items-baseline");
      expect(element).toHaveClass("justify-between");
      expect(element).toHaveClass("flex-wrap");
    });
  });
});
