/**
 * Heading Component Tests
 *
 * Tests for the Heading typography component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Heading } from "./heading";

// Helper function to get Heading element (excludes test-theme-wrapper)
function getHeading(container: HTMLElement, level: number): HTMLElement | null {
  // Query for the heading element directly, excluding the theme wrapper
  const heading = container.querySelector(`h${level}:not(.test-theme-wrapper)`);
  if (heading) return heading as HTMLElement;
  
  // Fallback to MCP markers
  return (
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-typography")
  ) as HTMLElement | null;
}

describe("Heading", () => {
  describe("Rendering", () => {
    it("should render h1 element with level 1", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>Page Title</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toContain("Page Title");
    });

    it("should render h2 element with level 2", () => {
      const { container } = renderWithTheme(
        <Heading level={2}>Section Title</Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toContain("Section Title");
    });

    it("should render h3 element with level 3", () => {
      const { container } = renderWithTheme(
        <Heading level={3}>Subsection</Heading>
      );
      const heading = container.querySelector("h3");
      expect(heading).toBeInTheDocument();
    });

    it("should render h4 element with level 4", () => {
      const { container } = renderWithTheme(
        <Heading level={4}>Heading 4</Heading>
      );
      const heading = container.querySelector("h4");
      expect(heading).toBeInTheDocument();
    });

    it("should render h5 element with level 5", () => {
      const { container } = renderWithTheme(
        <Heading level={5}>Heading 5</Heading>
      );
      const heading = container.querySelector("h5");
      expect(heading).toBeInTheDocument();
    });

    it("should render h6 element with level 6", () => {
      const { container } = renderWithTheme(
        <Heading level={6}>Heading 6</Heading>
      );
      const heading = container.querySelector("h6");
      expect(heading).toBeInTheDocument();
    });

    it("should render with custom element using as prop", () => {
      const { container } = renderWithTheme(
        <Heading level={2} as="div">
          Visual Heading
        </Heading>
      );
      const heading = container.querySelector("div");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toContain("Visual Heading");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Heading level={1} testId="test-heading">
          Test Heading
        </Heading>
      );
      const heading = container.querySelector('[data-testid="test-heading"]');
      expect(heading).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <Heading level={1} className="custom-class">
          Custom Heading
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Heading level={1}>Accessible Heading</Heading>
      );
      await expectAccessible(container);
    });

    it("should have aria-level attribute", () => {
      const { container } = renderWithTheme(
        <Heading level={3}>Heading</Heading>
      );
      const heading = container.querySelector("h3");
      expect(heading).toHaveAttribute("aria-level", "3");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>Heading</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveAttribute("data-mcp-validated", "true");
      expect(heading).toHaveAttribute(
        "data-constitution-compliant",
        "heading-typography"
      );
    });

    it("should maintain proper heading hierarchy", () => {
      const { container } = renderWithTheme(
        <>
          <Heading level={1}>Main Title</Heading>
          <Heading level={2}>Section</Heading>
          <Heading level={3}>Subsection</Heading>
        </>
      );
      const h1 = container.querySelector("h1");
      const h2 = container.querySelector("h2");
      const h3 = container.querySelector("h3");
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should apply default size based on level", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>H1 Default</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-4xl");
    });

    it("should apply custom size override", () => {
      const { container } = renderWithTheme(
        <Heading level={3} size="4xl">
          Large H3
        </Heading>
      );
      const heading = container.querySelector("h3");
      expect(heading).toHaveClass("text-5xl");
    });

    it("should apply xs size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="xs">
          Small Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-sm");
    });

    it("should apply sm size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="sm">
          Small Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-base");
    });

    it("should apply md size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="md">
          Medium Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-lg");
    });

    it("should apply lg size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="lg">
          Large Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-xl");
    });

    it("should apply xl size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="xl">
          XL Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-2xl");
    });

    it("should apply 2xl size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="2xl">
          2XL Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-3xl");
    });

    it("should apply 3xl size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="3xl">
          3XL Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-4xl");
    });

    it("should apply 4xl size", () => {
      const { container } = renderWithTheme(
        <Heading level={2} size="4xl">
          4XL Heading
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-5xl");
    });
  });

  describe("Weights", () => {
    it("should apply default semibold weight", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>Default Weight</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("font-semibold");
    });

    it("should apply normal weight", () => {
      const { container } = renderWithTheme(
        <Heading level={1} weight="normal">
          Normal Weight
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("font-normal");
    });

    it("should apply medium weight", () => {
      const { container } = renderWithTheme(
        <Heading level={1} weight="medium">
          Medium Weight
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("font-medium");
    });

    it("should apply semibold weight", () => {
      const { container } = renderWithTheme(
        <Heading level={1} weight="semibold">
          Semibold Weight
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("font-semibold");
    });

    it("should apply bold weight", () => {
      const { container } = renderWithTheme(
        <Heading level={1} weight="bold">
          Bold Weight
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("font-bold");
    });
  });

  describe("Colors", () => {
    it("should apply default color", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>Default Color</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-fg");
    });

    it("should apply muted color", () => {
      const { container } = renderWithTheme(
        <Heading level={1} color="muted">
          Muted Color
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-fg-muted");
    });

    it("should apply subtle color", () => {
      const { container } = renderWithTheme(
        <Heading level={1} color="subtle">
          Subtle Color
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-fg-subtle");
    });

    it("should apply primary color", () => {
      const { container } = renderWithTheme(
        <Heading level={1} color="primary">
          Primary Color
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-primary");
    });

    it("should apply success color", () => {
      const { container } = renderWithTheme(
        <Heading level={1} color="success">
          Success Color
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-success");
    });

    it("should apply warning color", () => {
      const { container } = renderWithTheme(
        <Heading level={1} color="warning">
          Warning Color
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-warning");
    });

    it("should apply danger color", () => {
      const { container } = renderWithTheme(
        <Heading level={1} color="danger">
          Danger Color
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-danger");
    });
  });

  describe("Alignment", () => {
    it("should apply default left alignment", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>Left Aligned</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-left");
    });

    it("should apply center alignment", () => {
      const { container } = renderWithTheme(
        <Heading level={1} align="center">
          Center Aligned
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-center");
    });

    it("should apply right alignment", () => {
      const { container } = renderWithTheme(
        <Heading level={1} align="right">
          Right Aligned
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-right");
    });

    it("should apply justify alignment", () => {
      const { container } = renderWithTheme(
        <Heading level={1} align="justify">
          Justified
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("text-justify");
    });
  });

  describe("Truncation", () => {
    it("should not truncate by default", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>Long heading text that should not be truncated</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).not.toHaveClass("truncate");
    });

    it("should apply truncate class when truncate is true", () => {
      const { container } = renderWithTheme(
        <Heading level={1} truncate>
          Long heading text that will be truncated
        </Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toHaveClass("truncate");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Heading level={1} ref={ref}>Heading</Heading>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML heading attributes", () => {
      const { container } = renderWithTheme(
        <Heading level={1} id="test-heading" data-testid="heading">
          Heading
        </Heading>
      );
      const heading = container.querySelector("#test-heading");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveAttribute("id", "test-heading");
      expect(heading).toHaveAttribute("data-testid", "heading");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<Heading level={1}></Heading>);
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(
        <Heading level={1}>{null}</Heading>
      );
      const heading = container.querySelector("h1");
      expect(heading).toBeInTheDocument();
    });

    it("should combine size, weight, color, and align correctly", () => {
      const { container } = renderWithTheme(
        <Heading
          level={2}
          size="3xl"
          weight="bold"
          color="primary"
          align="center"
        >
          Combined Props
        </Heading>
      );
      const heading = container.querySelector("h2");
      expect(heading).toHaveClass("text-4xl");
      expect(heading).toHaveClass("font-bold");
      expect(heading).toHaveClass("text-primary");
      expect(heading).toHaveClass("text-center");
    });

    it("should maintain semantic level when using as prop", () => {
      const { container } = renderWithTheme(
        <Heading level={2} as="div">
          Visual Heading
        </Heading>
      );
      const heading = container.querySelector("div:not(.test-theme-wrapper)");
      // Should still have aria-level even when using as="div" for accessibility
      expect(heading).toBeInTheDocument();
      // aria-level is set as a number, but DOM stores it as a string
      expect(heading).toHaveAttribute("aria-level", "2");
    });
  });
});

