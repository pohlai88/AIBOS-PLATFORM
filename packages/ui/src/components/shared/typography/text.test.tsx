/**
 * Text Component Tests
 *
 * Tests for the Text typography component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Text } from "./text";

// Helper function to get Text element (excludes test-theme-wrapper)
function getText(container: HTMLElement, tag: string = "p"): HTMLElement | null {
  // Query for the text element directly, excluding the theme wrapper
  const text = container.querySelector(`${tag}:not(.test-theme-wrapper)`);
  if (text) return text as HTMLElement;
  
  // Fallback to MCP markers
  return (
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-typography")
  ) as HTMLElement | null;
}

describe("Text", () => {
  describe("Rendering", () => {
    it("should render p element by default", () => {
      const { container } = renderWithTheme(<Text>Body text</Text>);
      const text = container.querySelector("p");
      expect(text).toBeInTheDocument();
      expect(text?.textContent).toContain("Body text");
    });

    it("should render with custom element using as prop", () => {
      const { container } = renderWithTheme(
        <Text as="span">Span text</Text>
      );
      const text = container.querySelector("span");
      expect(text).toBeInTheDocument();
      expect(text?.textContent).toContain("Span text");
    });

    it("should render as label element", () => {
      const { container } = renderWithTheme(
        <Text as="label">Label text</Text>
      );
      const text = container.querySelector("label");
      expect(text).toBeInTheDocument();
    });

    it("should render as div element", () => {
      const { container } = renderWithTheme(
        <Text as="div">Div text</Text>
      );
      const text = container.querySelector("div");
      expect(text).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Text testId="test-text">Test Text</Text>
      );
      const text = container.querySelector('[data-testid="test-text"]');
      expect(text).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <Text className="custom-class">Custom Text</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("custom-class");
    });

    it("should render with children", () => {
      const { container } = renderWithTheme(
        <Text>
          <span>Child 1</span>
          <span>Child 2</span>
        </Text>
      );
      const text = container.querySelector("p");
      expect(text?.textContent).toContain("Child 1");
      expect(text?.textContent).toContain("Child 2");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Text>Accessible text</Text>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Text>Text</Text>);
      const text = container.querySelector("p");
      expect(text).toHaveAttribute("data-mcp-validated", "true");
      expect(text).toHaveAttribute(
        "data-constitution-compliant",
        "text-typography"
      );
    });

    it("should support htmlFor when rendered as label", () => {
      const { container } = renderWithTheme(
        <Text as="label" htmlFor="input-id">
          Label Text
        </Text>
      );
      const label = container.querySelector("label");
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", "input-id");
    });
  });

  describe("Sizes", () => {
    it("should apply default md size", () => {
      const { container } = renderWithTheme(<Text>Default Size</Text>);
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-base");
    });

    it("should apply xs size", () => {
      const { container } = renderWithTheme(
        <Text size="xs">Extra Small</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-sm");
    });

    it("should apply sm size", () => {
      const { container } = renderWithTheme(
        <Text size="sm">Small</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-[15px]");
    });

    it("should apply md size", () => {
      const { container } = renderWithTheme(
        <Text size="md">Medium</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-base");
    });

    it("should apply lg size", () => {
      const { container } = renderWithTheme(
        <Text size="lg">Large</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-lg");
    });
  });

  describe("Weights", () => {
    it("should apply default normal weight", () => {
      const { container } = renderWithTheme(<Text>Default Weight</Text>);
      const text = container.querySelector("p");
      expect(text).toHaveClass("font-normal");
    });

    it("should apply normal weight", () => {
      const { container } = renderWithTheme(
        <Text weight="normal">Normal Weight</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("font-normal");
    });

    it("should apply medium weight", () => {
      const { container } = renderWithTheme(
        <Text weight="medium">Medium Weight</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("font-medium");
    });

    it("should apply semibold weight", () => {
      const { container } = renderWithTheme(
        <Text weight="semibold">Semibold Weight</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("font-semibold");
    });

    it("should apply bold weight", () => {
      const { container } = renderWithTheme(
        <Text weight="bold">Bold Weight</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("font-bold");
    });
  });

  describe("Variants", () => {
    it("should apply default variant", () => {
      const { container } = renderWithTheme(
        <Text variant="default">Default Variant</Text>
      );
      const text = container.querySelector("p");
      expect(text).toBeInTheDocument();
    });

    it("should apply label variant", () => {
      const { container } = renderWithTheme(
        <Text variant="label">Label Variant</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-sm", "font-medium");
    });

    it("should apply caption variant", () => {
      const { container } = renderWithTheme(
        <Text variant="caption">Caption Variant</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-xs", "text-fg-subtle");
    });

    it("should apply overline variant", () => {
      const { container } = renderWithTheme(
        <Text variant="overline">Overline Variant</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-xs", "font-medium", "tracking-wide", "uppercase");
    });

    it("should override size when variant is set", () => {
      const { container } = renderWithTheme(
        <Text variant="label" size="lg">
          Label Override
        </Text>
      );
      const text = container.querySelector("p");
      // Variant should override size, so size classes should not be present
      expect(text).toHaveClass("text-sm", "font-medium");
      expect(text).not.toHaveClass("text-lg");
    });
  });

  describe("Colors", () => {
    it("should apply default color", () => {
      const { container } = renderWithTheme(<Text>Default Color</Text>);
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-fg");
    });

    it("should apply muted color", () => {
      const { container } = renderWithTheme(
        <Text color="muted">Muted Color</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-fg-muted");
    });

    it("should apply subtle color", () => {
      const { container } = renderWithTheme(
        <Text color="subtle">Subtle Color</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-fg-subtle");
    });

    it("should apply primary color", () => {
      const { container } = renderWithTheme(
        <Text color="primary">Primary Color</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-primary");
    });

    it("should apply success color", () => {
      const { container } = renderWithTheme(
        <Text color="success">Success Color</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-success");
    });

    it("should apply warning color", () => {
      const { container } = renderWithTheme(
        <Text color="warning">Warning Color</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-warning");
    });

    it("should apply danger color", () => {
      const { container } = renderWithTheme(
        <Text color="danger">Danger Color</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-danger");
    });
  });

  describe("Alignment", () => {
    it("should apply default left alignment", () => {
      const { container } = renderWithTheme(<Text>Left Aligned</Text>);
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-left");
    });

    it("should apply center alignment", () => {
      const { container } = renderWithTheme(
        <Text align="center">Center Aligned</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-center");
    });

    it("should apply right alignment", () => {
      const { container } = renderWithTheme(
        <Text align="right">Right Aligned</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-right");
    });

    it("should apply justify alignment", () => {
      const { container } = renderWithTheme(
        <Text align="justify">Justified</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-justify");
    });
  });

  describe("Truncation", () => {
    it("should not truncate by default", () => {
      const { container } = renderWithTheme(
        <Text>Long text that should not be truncated</Text>
      );
      const text = container.querySelector("p");
      expect(text).not.toHaveClass("truncate");
    });

    it("should apply truncate class when truncate is true", () => {
      const { container } = renderWithTheme(
        <Text truncate>Long text that will be truncated</Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("truncate");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Text ref={ref}>Text</Text>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML element attributes", () => {
      const { container } = renderWithTheme(
        <Text id="test-text" data-testid="text">
          Text
        </Text>
      );
      const text = container.querySelector("#test-text");
      expect(text).toBeInTheDocument();
      expect(text).toHaveAttribute("id", "test-text");
      expect(text).toHaveAttribute("data-testid", "text");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<Text></Text>);
      const text = container.querySelector("p");
      expect(text).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(<Text>{null}</Text>);
      const text = container.querySelector("p");
      expect(text).toBeInTheDocument();
    });

    it("should combine size, weight, variant, color, and align correctly", () => {
      const { container } = renderWithTheme(
        <Text
          size="lg"
          weight="bold"
          variant="default"
          color="primary"
          align="center"
        >
          Combined Props
        </Text>
      );
      const text = container.querySelector("p");
      expect(text).toHaveClass("text-lg");
      expect(text).toHaveClass("font-bold");
      expect(text).toHaveClass("text-primary");
      expect(text).toHaveClass("text-center");
    });

    it("should handle variant with all semantic elements", () => {
      const elements = ["p", "span", "div", "label", "legend", "figcaption", "time", "address"];
      elements.forEach((element) => {
        const { container } = renderWithTheme(
          <Text as={element as any} variant="label">
            Label Text
          </Text>
        );
        const text = container.querySelector(element);
        expect(text).toBeInTheDocument();
      });
    });
  });
});

