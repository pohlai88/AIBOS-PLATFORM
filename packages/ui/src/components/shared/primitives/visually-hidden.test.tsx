/**
 * VisuallyHidden Component Tests
 *
 * Tests for the VisuallyHidden primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { VisuallyHidden } from "./visually-hidden";

describe("VisuallyHidden", () => {
  describe("Rendering", () => {
    it("should render visually hidden element", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Hidden content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toBe("Hidden content");
    });

    it("should render as span by default", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toBeInTheDocument();
      expect(element?.tagName).toBe("SPAN");
    });

    it("should render as div when as='div'", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden as="div">Content</VisuallyHidden>
      );
      const element = container.querySelector("div");
      expect(element).toBeInTheDocument();
      expect(element?.tagName).toBe("DIV");
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden className="custom-class">Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Accessible content</VisuallyHidden>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Test</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveAttribute("data-mcp-validated", "true");
      expect(element).toHaveAttribute("data-constitution-compliant", "visuallyhidden-shared");
    });

    it("should be accessible to screen readers", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Screen reader text</VisuallyHidden>
      );
      const element = container.querySelector("span");
      // Content should be in DOM but visually hidden
      expect(element?.textContent).toBe("Screen reader text");
    });
  });

  describe("Visual Hiding Styles", () => {
    it("should have absolute positioning", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("absolute");
    });

    it("should have minimal dimensions", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("h-px", "w-px");
    });

    it("should have negative margins", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("-m-px", "p-0");
    });

    it("should have overflow hidden", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("overflow-hidden");
    });

    it("should have clip rect", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("clip-[rect(0,0,0,0)]");
    });

    it("should have whitespace nowrap", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("whitespace-nowrap");
    });

    it("should have no border", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>Content</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toHaveClass("border-0");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<VisuallyHidden ref={ref}>Content</VisuallyHidden>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML span attributes", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden id="test" data-testid="hidden" aria-label="Test hidden">
          Content
        </VisuallyHidden>
      );
      const element = container.querySelector("#test");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test");
      expect(element).toHaveAttribute("data-testid", "hidden");
      expect(element).toHaveAttribute("aria-label", "Test hidden");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<VisuallyHidden></VisuallyHidden>);
      const element = container.querySelector("span");
      expect(element).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>{null}</VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <VisuallyHidden>
          <span>First</span>
          <span>Second</span>
        </VisuallyHidden>
      );
      const element = container.querySelector("span");
      expect(element?.textContent).toContain("First");
      expect(element?.textContent).toContain("Second");
    });
  });
});

