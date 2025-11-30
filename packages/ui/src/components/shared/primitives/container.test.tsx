/**
 * Container Component Tests
 *
 * Tests for the Container primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Container } from "./container";

// Helper function to get Container element (excludes test-theme-wrapper)
function getContainer(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-component")
  );
}

describe("Container", () => {
  describe("Rendering", () => {
    it("should render container element", () => {
      const { container } = renderWithTheme(
        <Container>Container content</Container>
      );
      const element = getContainer(container);
      expect(element).toBeInTheDocument();
      expect(element?.textContent).toContain("Container content");
    });

    it("should render container with children", () => {
      const { container } = renderWithTheme(
        <Container>
          <h1>Title</h1>
          <p>Content</p>
        </Container>
      );
      const element = getContainer(container);
      expect(element?.textContent).toContain("Title");
      expect(element?.textContent).toContain("Content");
    });

    it("should render container with custom className", () => {
      const { container } = renderWithTheme(
        <Container className="custom-class">Content</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("custom-class");
    });

    it("should render container with id", () => {
      const { container } = renderWithTheme(
        <Container id="test-container">Content</Container>
      );
      const element = container.querySelector("#test-container");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test-container");
    });

    it("should render empty container", () => {
      const { container } = renderWithTheme(<Container />);
      const element = getContainer(container);
      expect(element).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Container>Accessible container</Container>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Container>Test</Container>);
      const element = getContainer(container);
      expect(element).toHaveAttribute("data-mcp-validated", "true");
      expect(element).toHaveAttribute(
        "data-constitution-compliant",
        "container-shared"
      );
    });

    it("should support semantic HTML elements", () => {
      const { container } = renderWithTheme(
        <Container as="main">Main content</Container>
      );
      const element = container.querySelector("main");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Container size="sm">Small</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("max-w-screen-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Container size="md">Medium</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("max-w-screen-md");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Container size="lg">Large</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("max-w-screen-lg");
    });

    it("should apply extra large size styles", () => {
      const { container } = renderWithTheme(
        <Container size="xl">XL</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("max-w-screen-xl");
    });

    it("should apply full size styles", () => {
      const { container } = renderWithTheme(
        <Container size="full">Full</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("max-w-full");
    });

    it("should default to xl size", () => {
      const { container } = renderWithTheme(<Container>Default</Container>);
      const element = getContainer(container);
      expect(element).toHaveClass("max-w-screen-xl");
    });
  });

  describe("Padding", () => {
    it("should apply no padding", () => {
      const { container } = renderWithTheme(
        <Container padding="none">No padding</Container>
      );
      const element = getContainer(container);
      expect(element).not.toHaveClass("px-4", "px-6", "px-8");
    });

    it("should apply small padding", () => {
      const { container } = renderWithTheme(
        <Container padding="sm">Small padding</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("px-4");
    });

    it("should apply medium padding", () => {
      const { container } = renderWithTheme(
        <Container padding="md">Medium padding</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("px-6");
    });

    it("should apply large padding", () => {
      const { container } = renderWithTheme(
        <Container padding="lg">Large padding</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("px-8");
    });

    it("should default to medium padding", () => {
      const { container } = renderWithTheme(<Container>Default</Container>);
      const element = getContainer(container);
      expect(element).toHaveClass("px-6");
    });
  });

  describe("Base Styles", () => {
    it("should have base container styles", () => {
      const { container } = renderWithTheme(<Container>Content</Container>);
      const element = getContainer(container);
      expect(element).toHaveClass("w-full");
      expect(element).toHaveClass("mx-auto");
    });
  });

  describe("Vertical Centering", () => {
    it("should center content vertically when centerVertically is true", () => {
      const { container } = renderWithTheme(
        <Container centerVertically>Centered</Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("flex", "items-center", "justify-center");
    });

    it("should not center vertically by default", () => {
      const { container } = renderWithTheme(<Container>Default</Container>);
      const element = getContainer(container);
      expect(element).not.toHaveClass("flex", "items-center", "justify-center");
    });
  });

  describe("Semantic Elements", () => {
    it("should render as div by default", () => {
      const { container } = renderWithTheme(<Container>Content</Container>);
      const element = container.querySelector("div");
      expect(element).toBeInTheDocument();
    });

    it("should render as section", () => {
      const { container } = renderWithTheme(
        <Container as="section">Content</Container>
      );
      const element = container.querySelector("section");
      expect(element).toBeInTheDocument();
    });

    it("should render as article", () => {
      const { container } = renderWithTheme(
        <Container as="article">Content</Container>
      );
      const element = container.querySelector("article");
      expect(element).toBeInTheDocument();
    });

    it("should render as main", () => {
      const { container } = renderWithTheme(
        <Container as="main">Content</Container>
      );
      const element = container.querySelector("main");
      expect(element).toBeInTheDocument();
    });

    it("should render as aside", () => {
      const { container } = renderWithTheme(
        <Container as="aside">Content</Container>
      );
      const element = container.querySelector("aside");
      expect(element).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Container ref={ref}>Content</Container>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Container
          id="test"
          data-testid="container"
          aria-label="Test container"
        >
          Content
        </Container>
      );
      const element = container.querySelector("#test");
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute("id", "test");
      expect(element).toHaveAttribute("data-testid", "container");
      expect(element).toHaveAttribute("aria-label", "Test container");
    });

    it("should accept testId prop", () => {
      const { container } = renderWithTheme(
        <Container testId="test-container">Content</Container>
      );
      const element = container.querySelector('[data-testid="test-container"]');
      expect(element).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null children", () => {
      const { container } = renderWithTheme(<Container>{null}</Container>);
      const element = getContainer(container);
      expect(element).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Container>
          <div>First</div>
          <div>Second</div>
        </Container>
      );
      const element = getContainer(container);
      expect(element?.textContent).toContain("First");
      expect(element?.textContent).toContain("Second");
    });

    it("should combine size and padding correctly", () => {
      const { container } = renderWithTheme(
        <Container size="lg" padding="sm">
          Combined
        </Container>
      );
      const element = getContainer(container);
      expect(element).toHaveClass("max-w-screen-lg");
      expect(element).toHaveClass("px-4");
    });
  });
});
