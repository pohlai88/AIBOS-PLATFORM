/**
 * Stack Component Tests
 *
 * Tests for the Stack primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Stack } from "./stack";

// Helper function to get Stack element (excludes test-theme-wrapper)
function getStack(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-component")
  );
}

describe("Stack", () => {
  describe("Rendering", () => {
    it("should render stack element", () => {
      const { container } = renderWithTheme(<Stack>Stack content</Stack>);
      const element = getStack(container);
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toContain("Stack content");
    });

    it("should render stack with children", () => {
      const { container } = renderWithTheme(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
        </Stack>
      );
      const element = getStack(container);
      expect(element?.textContent).toContain("Item 1");
      expect(element?.textContent).toContain("Item 2");
    });

    it("should render stack with custom className", () => {
      const { container } = renderWithTheme(
        <Stack className="custom-class">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("custom-class");
    });

    it("should render stack with id", () => {
      const { container } = renderWithTheme(
        <Stack id="test-stack">Content</Stack>
      );
      const element = container.querySelector("#test-stack");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test-stack");
    });

    it("should render empty stack", () => {
      const { container } = renderWithTheme(<Stack />);
      const element = getStack(container);
      expect(element).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Stack>Accessible stack</Stack>);
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Stack>Test</Stack>);
      const element = getStack(container);
      expect(element).toHaveAttribute("data-mcp-validated", "true");
      expect(element).toHaveAttribute(
        "data-constitution-compliant",
        "stack-shared"
      );
    });

    it("should support semantic HTML elements", () => {
      const { container } = renderWithTheme(
        <Stack as="section">Section content</Stack>
      );
      const element = container.querySelector("section");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Base Styles", () => {
    it("should have flex column layout", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const element = getStack(container);
      expect(element).toHaveClass("flex", "flex-col");
    });
  });

  describe("Spacing", () => {
    it("should apply extra small spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="xs">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("gap-1");
    });

    it("should apply small spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="sm">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("gap-2");
    });

    it("should apply medium spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="md">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("gap-4");
    });

    it("should apply large spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="lg">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("gap-6");
    });

    it("should apply extra large spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="xl">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("gap-8");
    });

    it("should default to medium spacing", () => {
      const { container } = renderWithTheme(<Stack>Default</Stack>);
      const element = getStack(container);
      expect(element).toHaveClass("gap-4");
    });
  });

  describe("Alignment", () => {
    it("should apply start alignment", () => {
      const { container } = renderWithTheme(
        <Stack align="start">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("items-start");
    });

    it("should apply center alignment", () => {
      const { container } = renderWithTheme(
        <Stack align="center">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("items-center");
    });

    it("should apply end alignment", () => {
      const { container } = renderWithTheme(<Stack align="end">Content</Stack>);
      const element = getStack(container);
      expect(element).toHaveClass("items-end");
    });

    it("should apply stretch alignment", () => {
      const { container } = renderWithTheme(
        <Stack align="stretch">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("items-stretch");
    });

    it("should default to stretch alignment", () => {
      const { container } = renderWithTheme(<Stack>Default</Stack>);
      const element = getStack(container);
      expect(element).toHaveClass("items-stretch");
    });
  });

  describe("Justify", () => {
    it("should apply start justify", () => {
      const { container } = renderWithTheme(
        <Stack justify="start">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("justify-start");
    });

    it("should apply center justify", () => {
      const { container } = renderWithTheme(
        <Stack justify="center">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("justify-center");
    });

    it("should apply end justify", () => {
      const { container } = renderWithTheme(
        <Stack justify="end">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("justify-end");
    });

    it("should apply between justify", () => {
      const { container } = renderWithTheme(
        <Stack justify="between">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("justify-between");
    });

    it("should apply around justify", () => {
      const { container } = renderWithTheme(
        <Stack justify="around">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("justify-around");
    });

    it("should apply evenly justify", () => {
      const { container } = renderWithTheme(
        <Stack justify="evenly">Content</Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("justify-evenly");
    });

    it("should default to start justify", () => {
      const { container } = renderWithTheme(<Stack>Default</Stack>);
      const element = getStack(container);
      expect(element).toHaveClass("justify-start");
    });
  });

  describe("Full Width", () => {
    it("should apply full width when fullWidth is true", () => {
      const { container } = renderWithTheme(<Stack fullWidth>Content</Stack>);
      const element = getStack(container);
      expect(element).toHaveClass("w-full");
    });

    it("should not apply full width by default", () => {
      const { container } = renderWithTheme(<Stack>Default</Stack>);
      const element = getStack(container);
      expect(element).not.toHaveClass("w-full");
    });
  });

  describe("Semantic Elements", () => {
    it("should render as div by default", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const element = getStack(container);
      expect(element).toBeInTheDocument();
    });

    it("should render as section", () => {
      const { container } = renderWithTheme(
        <Stack as="section">Content</Stack>
      );
      const element = container.querySelector("section");
      expect(element).toBeInTheDocument();
    });

    it("should render as article", () => {
      const { container } = renderWithTheme(
        <Stack as="article">Content</Stack>
      );
      const element = container.querySelector("article");
      expect(element).toBeInTheDocument();
    });

    it("should render as nav", () => {
      const { container } = renderWithTheme(<Stack as="nav">Content</Stack>);
      const element = container.querySelector("nav");
      expect(element).toBeInTheDocument();
    });

    it("should render as main", () => {
      const { container } = renderWithTheme(<Stack as="main">Content</Stack>);
      const element = container.querySelector("main");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Stack ref={ref}>Content</Stack>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Stack id="test" data-testid="stack" aria-label="Test stack">
          Content
        </Stack>
      );
      const element = container.querySelector("#test");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test");
      expect(element).toHaveAttribute("data-testid", "stack");
      expect(element).toHaveAttribute("aria-label", "Test stack");
    });

    it("should accept testId prop", () => {
      const { container } = renderWithTheme(
        <Stack testId="test-stack">Content</Stack>
      );
      const element = container.querySelector('[data-testid="test-stack"]');
      expect(element).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null children", () => {
      const { container } = renderWithTheme(<Stack>{null}</Stack>);
      const element = getStack(container);
      expect(element).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Stack>
          <div>First</div>
          <div>Second</div>
          <div>Third</div>
        </Stack>
      );
      const element = getStack(container);
      expect(element?.textContent).toContain("First");
      expect(element?.textContent).toContain("Second");
      expect(element?.textContent).toContain("Third");
    });

    it("should combine spacing, align, and justify correctly", () => {
      const { container } = renderWithTheme(
        <Stack spacing="lg" align="center" justify="between">
          Combined
        </Stack>
      );
      const element = getStack(container);
      expect(element).toHaveClass("gap-6");
      expect(element).toHaveClass("items-center");
      expect(element).toHaveClass("justify-between");
    });
  });
});
