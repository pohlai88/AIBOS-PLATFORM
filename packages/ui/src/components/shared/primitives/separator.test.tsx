/**
 * Separator Component Tests
 *
 * Tests for the Separator primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Separator } from "./separator";

// Helper function to get Separator element (excludes test-theme-wrapper)
function getSeparator(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[role="separator"]') ||
    container.querySelector('[role="none"]')
  );
}

describe("Separator", () => {
  describe("Rendering", () => {
    it("should render separator element", () => {
      const { container } = renderWithTheme(<Separator />);
      const separator = getSeparator(container);
      expect(separator).toBeInTheDocument();
    });

    it("should render horizontal separator by default", () => {
      const { container } = renderWithTheme(<Separator />);
      const separator = getSeparator(container);
      expect(separator).toHaveClass("w-full", "h-px");
    });

    it("should render vertical separator", () => {
      const { container } = renderWithTheme(
        <Separator orientation="vertical" />
      );
      const separator = getSeparator(container);
      expect(separator).toHaveClass("h-full", "w-px");
    });

    it("should render separator with custom className", () => {
      const { container } = renderWithTheme(
        <Separator className="custom-class" />
      );
      const separator = getSeparator(container);
      expect(separator).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Separator />);
      await expectAccessible(container);
    });

    it("should have role='separator' when not decorative", () => {
      const { container } = renderWithTheme(<Separator decorative={false} />);
      const separator = getSeparator(container);
      expect(separator).toHaveAttribute("role", "separator");
    });

    it("should have role='none' when decorative", () => {
      const { container } = renderWithTheme(<Separator decorative />);
      const separator = getSeparator(container);
      expect(separator).toHaveAttribute("role", "none");
    });

    it("should have aria-orientation when not decorative", () => {
      const { container } = renderWithTheme(
        <Separator orientation="vertical" decorative={false} />
      );
      const separator = getSeparator(container);
      expect(separator).toHaveAttribute("aria-orientation", "vertical");
    });

    it("should have aria-hidden when decorative", () => {
      const { container } = renderWithTheme(<Separator decorative />);
      const separator = getSeparator(container);
      expect(separator).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Orientations", () => {
    it("should apply horizontal orientation styles", () => {
      const { container } = renderWithTheme(
        <Separator orientation="horizontal" />
      );
      const separator = getSeparator(container);
      expect(separator).toHaveClass("w-full", "h-px");
    });

    it("should apply vertical orientation styles", () => {
      const { container } = renderWithTheme(
        <Separator orientation="vertical" />
      );
      const separator = getSeparator(container);
      expect(separator).toHaveClass("h-full", "w-px");
    });

    it("should default to horizontal orientation", () => {
      const { container } = renderWithTheme(<Separator />);
      const separator = getSeparator(container);
      expect(separator).toHaveClass("w-full", "h-px");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Separator variant="default" />);
      const separator = getSeparator(container);
      expect(separator).toHaveClass("bg-border");
    });

    it("should apply subtle variant styles", () => {
      const { container } = renderWithTheme(<Separator variant="subtle" />);
      const separator = getSeparator(container);
      expect(separator).toHaveClass("bg-border-subtle");
    });

    it("should default to default variant", () => {
      const { container } = renderWithTheme(<Separator />);
      const separator = getSeparator(container);
      expect(separator).toHaveClass("bg-border");
    });
  });

  describe("Base Styles", () => {
    it("should have base separator styles", () => {
      const { container } = renderWithTheme(<Separator />);
      const separator = getSeparator(container);
      expect(separator).toHaveClass("shrink-0");
      expect(separator).toHaveClass("transition-colors", "duration-200");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Separator ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Separator
          id="test"
          data-testid="separator"
          aria-label="Test separator"
        />
      );
      const separator = container.querySelector("#test");
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveAttribute("id", "test");
      expect(separator).toHaveAttribute("data-testid", "separator");
    });
  });

  describe("Edge Cases", () => {
    it("should combine orientation and variant correctly", () => {
      const { container } = renderWithTheme(
        <Separator orientation="vertical" variant="subtle" />
      );
      const separator = getSeparator(container);
      expect(separator).toHaveClass("h-full", "w-px");
      expect(separator).toHaveClass("bg-border-subtle");
    });

    it("should combine decorative and orientation correctly", () => {
      const { container } = renderWithTheme(
        <Separator orientation="vertical" decorative />
      );
      const separator = getSeparator(container);
      expect(separator).toHaveAttribute("role", "none");
      expect(separator).toHaveAttribute("aria-hidden", "true");
    });
  });
});
