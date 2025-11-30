/**
 * Divider Component Tests
 *
 * Tests for the Divider primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Divider } from "./divider";

// Helper function to get Divider element (excludes test-theme-wrapper)
function getDivider(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[role="presentation"]') ||
    container.querySelector('[role="separator"]')
  );
}

describe("Divider", () => {
  describe("Rendering", () => {
    it("should render divider element", () => {
      const { container } = renderWithTheme(<Divider />);
      const divider = getDivider(container);
      expect(divider).toBeInTheDocument();
    });

    it("should render horizontal divider by default", () => {
      const { container } = renderWithTheme(<Divider />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("h-[1px]", "w-full");
      expect(divider).toHaveClass("border-t");
    });

    it("should render vertical divider", () => {
      const { container } = renderWithTheme(<Divider orientation="vertical" />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("w-[1px]", "h-full");
      expect(divider).toHaveClass("border-l");
    });

    it("should render divider with variant", () => {
      const { container } = renderWithTheme(<Divider variant="dashed" />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("border-dashed");
    });

    it("should render divider with label", () => {
      const { container } = renderWithTheme(<Divider label="OR" />);
      const label = container.querySelector("span");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("OR");
    });

    it("should render divider with testId", () => {
      const { container } = renderWithTheme(<Divider testId="test-divider" />);
      const divider = container.querySelector('[data-testid="test-divider"]');
      expect(divider).toBeInTheDocument();
    });

    it("should render divider with custom className", () => {
      const { container } = renderWithTheme(
        <Divider className="custom-class" />
      );
      const divider = getDivider(container);
      expect(divider).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should have proper accessibility attributes", () => {
      const { container } = renderWithTheme(<Divider decorative={false} />);
      const divider = getDivider(container);
      expect(divider).toHaveAttribute("role", "separator");
      expect(divider).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("should have presentation role when decorative", () => {
      const { container } = renderWithTheme(<Divider decorative />);
      const divider = getDivider(container);
      expect(divider).toHaveAttribute("role", "presentation");
    });

    it("should have presentation role when decorative", () => {
      const { container } = renderWithTheme(<Divider decorative />);
      const divider = getDivider(container);
      expect(divider).toHaveAttribute("role", "presentation");
    });

    it("should have separator role when not decorative", () => {
      const { container } = renderWithTheme(<Divider decorative={false} />);
      const divider = getDivider(container);
      expect(divider).toHaveAttribute("role", "separator");
    });

    it("should have aria-orientation attribute", () => {
      const { container } = renderWithTheme(<Divider orientation="vertical" />);
      const divider = getDivider(container);
      expect(divider).toHaveAttribute("aria-orientation", "vertical");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Divider />);
      const divider = getDivider(container);
      expect(divider).toHaveAttribute("data-mcp-validated", "true");
      expect(divider).toHaveAttribute(
        "data-constitution-compliant",
        "divider-shared"
      );
    });
  });

  describe("Orientations", () => {
    it("should apply horizontal orientation styles", () => {
      const { container } = renderWithTheme(
        <Divider orientation="horizontal" />
      );
      const divider = getDivider(container);
      expect(divider).toHaveClass("h-[1px]", "w-full");
      expect(divider).toHaveClass("border-t");
    });

    it("should apply vertical orientation styles", () => {
      const { container } = renderWithTheme(<Divider orientation="vertical" />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("w-[1px]", "h-full");
      expect(divider).toHaveClass("border-l");
    });

    it("should default to horizontal orientation", () => {
      const { container } = renderWithTheme(<Divider />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("h-[1px]", "w-full");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Divider variant="default" />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("border-solid");
    });

    it("should apply dashed variant styles", () => {
      const { container } = renderWithTheme(<Divider variant="dashed" />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("border-dashed");
    });

    it("should apply dotted variant styles", () => {
      const { container } = renderWithTheme(<Divider variant="dotted" />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("border-dotted");
    });

    it("should default to default variant", () => {
      const { container } = renderWithTheme(<Divider />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("border-solid");
    });
  });

  describe("Decorative", () => {
    it("should apply decorative margins when decorative is true", () => {
      const { container } = renderWithTheme(<Divider decorative />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("my-4");
    });

    it("should not apply decorative margins when decorative is false", () => {
      const { container } = renderWithTheme(<Divider decorative={false} />);
      const divider = getDivider(container);
      expect(divider).not.toHaveClass("my-4");
    });

    it("should default to decorative", () => {
      const { container } = renderWithTheme(<Divider />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("my-4");
    });

    it("should apply horizontal margins for vertical divider when decorative", () => {
      const { container } = renderWithTheme(
        <Divider orientation="vertical" decorative />
      );
      const divider = getDivider(container);
      expect(divider).toHaveClass("mx-4");
      expect(divider).not.toHaveClass("my-4");
    });
  });

  describe("Label", () => {
    it("should render label in center for horizontal divider", () => {
      const { container } = renderWithTheme(<Divider label="OR" />);
      const label = container.querySelector("span");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("OR");
    });

    it("should render label with wrapper when provided", () => {
      const { container } = renderWithTheme(<Divider label="OR" />);
      // When label is provided, the divider is wrapped in a flex container
      const wrapper = container.querySelector("div:not(.test-theme-wrapper)");
      expect(wrapper).toHaveClass("flex", "items-center");
    });

    it("should not render label for vertical divider", () => {
      const { container } = renderWithTheme(
        <Divider orientation="vertical" label="OR" />
      );
      const label = container.querySelector("span");
      expect(label).not.toBeInTheDocument();
    });

    it("should render label as ReactNode", () => {
      const { container } = renderWithTheme(
        <Divider label={<span>Custom Label</span>} />
      );
      const label = container.querySelector("span");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Custom Label");
    });
  });

  describe("Base Styles", () => {
    it("should have base divider styles", () => {
      const { container } = renderWithTheme(<Divider />);
      const divider = getDivider(container);
      expect(divider).toHaveClass("shrink-0");
      expect(divider).toHaveClass("border-border");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Divider ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Divider id="test" data-testid="divider" aria-label="Test divider" />
      );
      const divider = container.querySelector("#test");
      expect(divider).toBeInTheDocument();
      expect(divider).toHaveAttribute("id", "test");
      expect(divider).toHaveAttribute("data-testid", "divider");
      expect(divider).toHaveAttribute("aria-label", "Test divider");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty label", () => {
      const { container } = renderWithTheme(<Divider label="" />);
      // Empty string might be treated as falsy, so it might render as regular divider
      // Let's check that it renders something
      const divider = getDivider(container);
      expect(divider).toBeInTheDocument();
    });

    it("should handle null label", () => {
      const { container } = renderWithTheme(<Divider label={null} />);
      const divider = getDivider(container);
      expect(divider).toBeInTheDocument();
    });

    it("should combine orientation and variant correctly", () => {
      const { container } = renderWithTheme(
        <Divider orientation="vertical" variant="dashed" />
      );
      const divider = getDivider(container);
      expect(divider).toHaveClass("w-[1px]", "h-full");
      expect(divider).toHaveClass("border-dashed");
    });
  });
});
