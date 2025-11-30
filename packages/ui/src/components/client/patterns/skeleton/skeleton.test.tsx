/**
 * Skeleton Component Tests
 *
 * Tests for the Skeleton Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import { Skeleton } from "./skeleton";

// Helper function to get Skeleton element
function getSkeleton(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[data-testid*="skeleton"]')
  ) as HTMLElement | null;
}

describe("Skeleton", () => {
  describe("Rendering", () => {
    it("should render skeleton component", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Skeleton testId="test-skeleton" />
      );
      const skeleton = container.querySelector('[data-testid="test-skeleton"]');
      expect(skeleton).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <Skeleton className="custom-class" />
      );
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("custom-class");
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      const { container } = renderWithTheme(<Skeleton variant="default" />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("rounded-md");
    });

    it("should render text variant", () => {
      const { container } = renderWithTheme(<Skeleton variant="text" />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("rounded");
    });

    it("should render circular variant", () => {
      const { container } = renderWithTheme(<Skeleton variant="circular" />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("should render rectangular variant", () => {
      const { container } = renderWithTheme(
        <Skeleton variant="rectangular" />
      );
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("rounded-none");
    });
  });

  describe("Sizes", () => {
    it("should render small size for text variant", () => {
      const { container } = renderWithTheme(
        <Skeleton variant="text" size="sm" />
      );
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("h-3");
    });

    it("should render medium size for text variant (default)", () => {
      const { container } = renderWithTheme(<Skeleton variant="text" />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("h-4");
    });

    it("should render large size for text variant", () => {
      const { container } = renderWithTheme(
        <Skeleton variant="text" size="lg" />
      );
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("h-6");
    });
  });

  describe("Dimensions", () => {
    it("should apply width as string", () => {
      const { container } = renderWithTheme(<Skeleton width="200px" />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveStyle({ width: "200px" });
    });

    it("should apply width as number", () => {
      const { container } = renderWithTheme(<Skeleton width={200} />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveStyle({ width: "200px" });
    });

    it("should apply height as string", () => {
      const { container } = renderWithTheme(<Skeleton height="20px" />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveStyle({ height: "20px" });
    });

    it("should apply height as number", () => {
      const { container } = renderWithTheme(<Skeleton height={20} />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveStyle({ height: "20px" });
    });

    it("should apply both width and height", () => {
      const { container } = renderWithTheme(
        <Skeleton width="200px" height="20px" />
      );
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveStyle({ width: "200px", height: "20px" });
    });
  });

  describe("Animation", () => {
    it("should have animation by default", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveClass("animate-pulse");
    });

    it("should not have animation when animate is false", () => {
      const { container } = renderWithTheme(<Skeleton animate={false} />);
      const skeleton = getSkeleton(container);
      expect(skeleton).not.toHaveClass("animate-pulse");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Skeleton />);
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = getSkeleton(container);
      expect(skeleton).toHaveAttribute("aria-busy", "true");
      expect(skeleton).toHaveAttribute("aria-label", "Loading content");
    });
  });

  describe("Composition", () => {
    it("should compose with multiple skeletons", () => {
      const { container } = renderWithTheme(
        <div>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </div>
      );
      const skeletons = container.querySelectorAll(".mcp-layer3-pattern");
      expect(skeletons.length).toBe(3);
    });
  });
});

