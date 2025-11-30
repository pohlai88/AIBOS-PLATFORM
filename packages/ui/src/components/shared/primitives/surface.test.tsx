/**
 * Surface Component Tests
 *
 * Tests for the Surface primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Surface } from "./surface";

// Helper function to get Surface element (excludes test-theme-wrapper)
function getSurface(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-component")
  );
}

describe("Surface", () => {
  describe("Rendering", () => {
    it("should render surface element", () => {
      const { container } = renderWithTheme(<Surface>Surface content</Surface>);
      const element = getSurface(container);
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toContain("Surface content");
    });

    it("should render surface with children", () => {
      const { container } = renderWithTheme(
        <Surface>
          <div>Item 1</div>
          <div>Item 2</div>
        </Surface>
      );
      const element = getSurface(container);
      expect(element?.textContent).toContain("Item 1");
      expect(element?.textContent).toContain("Item 2");
    });

    it("should render surface with variant", () => {
      const { container } = renderWithTheme(
        <Surface variant="elevated">Elevated</Surface>
      );
      const element = getSurface(container);
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass("shadow-[var(--shadow-md)]");
    });

    it("should render surface with size", () => {
      const { container } = renderWithTheme(<Surface size="lg">Large</Surface>);
      const element = getSurface(container);
      expect(element).toBeInTheDocument();
      expect(element).toHaveClass("px-5", "py-2.5");
    });

    it("should render surface with custom className", () => {
      const { container } = renderWithTheme(
        <Surface className="custom-class">Custom</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("custom-class");
    });

    it("should render surface with testId", () => {
      const { container } = renderWithTheme(
        <Surface testId="test-surface">Test</Surface>
      );
      const element = container.querySelector('[data-testid="test-surface"]');
      expect(element).toBeInTheDocument();
    });

    it("should render empty surface", () => {
      const { container } = renderWithTheme(<Surface />);
      const element = getSurface(container);
      expect(element).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Surface>Accessible surface</Surface>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Surface>Test</Surface>);
      const element = getSurface(container);
      expect(element).toHaveAttribute("data-mcp-validated", "true");
      expect(element).toHaveAttribute(
        "data-constitution-compliant",
        "surface-shared"
      );
    });

    it("should have button role when onClick is provided", () => {
      const { container } = renderWithTheme(
        <Surface onClick={() => {}}>Clickable</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveAttribute("role", "button");
      expect(element).toHaveAttribute("tabIndex", "0");
    });

    it("should not have button role when not clickable", () => {
      const { container } = renderWithTheme(<Surface>Non-clickable</Surface>);
      const element = getSurface(container);
      expect(element).not.toHaveAttribute("role", "button");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Surface onClick={handleClick}>Clickable</Surface>
      );
      const element = getSurface(container) as HTMLElement;
      await user.click(element);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <Surface disabled>Disabled</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(element).toHaveAttribute("aria-disabled", "true");
    });

    it("should apply loading state styles and prevent pointer events", () => {
      const { container } = renderWithTheme(<Surface loading>Loading</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("pointer-events-none", "opacity-70");
      expect(element).toHaveAttribute("aria-busy", "true");
      expect(element).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Surface>Default</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("bg-bg-elevated");
      expect(element).toHaveClass("border", "border-border-subtle");
    });

    it("should apply elevated variant styles", () => {
      const { container } = renderWithTheme(
        <Surface variant="elevated">Elevated</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("bg-bg-elevated");
      expect(element).toHaveClass("shadow-[var(--shadow-md)]");
    });

    it("should apply outlined variant styles", () => {
      const { container } = renderWithTheme(
        <Surface variant="outlined">Outlined</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("bg-bg");
      expect(element).toHaveClass("border", "border-border");
    });

    it("should apply ghost variant styles", () => {
      const { container } = renderWithTheme(
        <Surface variant="ghost">Ghost</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("bg-transparent");
      expect(element).toHaveClass("border", "border-transparent");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Surface size="sm">Small</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("px-3", "py-1.5");
      expect(element).toHaveClass("text-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Surface size="md">Medium</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("px-4", "py-2");
      expect(element).toHaveClass("text-[15px]");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Surface size="lg">Large</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("px-5", "py-2.5");
      expect(element).toHaveClass("text-[15px]");
    });

    it("should apply extra large size styles", () => {
      const { container } = renderWithTheme(<Surface size="xl">XL</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("px-5", "py-2.5");
      expect(element).toHaveClass("text-sm", "font-semibold");
    });
  });

  describe("Full Width", () => {
    it("should apply full width when fullWidth is true", () => {
      const { container } = renderWithTheme(
        <Surface fullWidth>Full Width</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("w-full");
    });

    it("should not apply full width by default", () => {
      const { container } = renderWithTheme(<Surface>Default</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("w-auto");
    });
  });

  describe("States", () => {
    it("should apply loading state styles", () => {
      const { container } = renderWithTheme(<Surface loading>Loading</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("pointer-events-none", "opacity-70");
      expect(element).toHaveAttribute("aria-busy", "true");
      expect(element).toHaveAttribute("aria-disabled", "true");
    });

    it("should show loading spinner when loading", () => {
      const { container } = renderWithTheme(<Surface loading>Loading</Surface>);
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <Surface disabled>Disabled</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(element).toHaveAttribute("aria-disabled", "true");
    });

    it("should apply interactive styles when clickable", () => {
      const { container } = renderWithTheme(
        <Surface onClick={() => {}}>Clickable</Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveClass("cursor-pointer");
      expect(element).toHaveClass("hover:opacity-95");
      expect(element).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Surface ref={ref}>Content</Surface>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Surface id="test" data-testid="surface" aria-label="Test surface">
          Content
        </Surface>
      );
      const element = container.querySelector("#test");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test");
      expect(element).toHaveAttribute("data-testid", "surface");
      expect(element).toHaveAttribute("aria-label", "Test surface");
    });
  });

  describe("Base Styles", () => {
    it("should have base transition styles", () => {
      const { container } = renderWithTheme(<Surface>Content</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("transition-all", "duration-200");
    });

    it("should have overflow hidden", () => {
      const { container } = renderWithTheme(<Surface>Content</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("overflow-hidden");
    });

    it("should have relative positioning", () => {
      const { container } = renderWithTheme(<Surface>Content</Surface>);
      const element = getSurface(container);
      expect(element).toHaveClass("relative");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null children", () => {
      const { container } = renderWithTheme(<Surface>{null}</Surface>);
      const element = getSurface(container);
      expect(element).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Surface>
          <div>First</div>
          <div>Second</div>
        </Surface>
      );
      const element = getSurface(container);
      expect(element?.textContent).toContain("First");
      expect(element?.textContent).toContain("Second");
    });

    it("should handle both loading and disabled", () => {
      const { container } = renderWithTheme(
        <Surface loading disabled>
          Both
        </Surface>
      );
      const element = getSurface(container);
      expect(element).toHaveAttribute("aria-disabled", "true");
      expect(element).toHaveAttribute("aria-busy", "true");
    });
  });
});
