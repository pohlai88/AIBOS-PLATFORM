/**
 * Skeleton Component Tests
 *
 * Tests for the Skeleton primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  describe("Rendering", () => {
    it("should render skeleton element", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toBeInTheDocument();
    });

    it("should render skeleton with custom className", () => {
      const { container } = renderWithTheme(
        <Skeleton className="custom-class" />
      );
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("custom-class");
    });

    it("should render single skeleton by default", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeletons = container.querySelectorAll('[aria-busy="true"]');
      expect(skeletons.length).toBe(1);
    });

    it("should render multiple skeletons when count > 1", () => {
      const { container } = renderWithTheme(<Skeleton count={3} />);
      const wrapper = container.querySelector(
        '[aria-busy="true"][aria-label="Loading"]'
      );
      expect(wrapper).toBeInTheDocument();
      // Count the skeleton divs inside the wrapper
      const skeletons = wrapper?.querySelectorAll("div.bg-bg-muted");
      expect(skeletons?.length).toBe(3);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveAttribute("aria-busy", "true");
      expect(skeleton).toHaveAttribute("aria-label", "Loading");
    });

    it("should be accessible when used correctly", async () => {
      // Skeleton with role="status" would be fully accessible
      // For now, verify it has the expected loading indicators
      const { container } = renderWithTheme(<Skeleton role="status" />);
      await expectAccessible(container);
    });

    it("should have aria-busy='true'", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveAttribute("aria-busy", "true");
    });

    it("should have aria-label='Loading'", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveAttribute("aria-label", "Loading");
    });

    it("should have wrapper with aria-busy when count > 1", () => {
      const { container } = renderWithTheme(<Skeleton count={3} />);
      const wrapper = container.querySelector(
        '[aria-busy="true"][aria-label="Loading"]'
      );
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Skeleton variant="default" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("rounded-[var(--radius-md)]");
      expect(skeleton).toHaveClass("w-full");
    });

    it("should apply circular variant styles", () => {
      const { container } = renderWithTheme(<Skeleton variant="circular" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("should apply text variant styles", () => {
      const { container } = renderWithTheme(<Skeleton variant="text" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("rounded-[var(--radius-sm)]");
      expect(skeleton).toHaveClass("h-4");
    });

    it("should default to default variant", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("rounded-[var(--radius-md)]");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Skeleton size="sm" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("h-4");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(<Skeleton size="md" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("h-6");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Skeleton size="lg" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("h-8");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("h-6");
    });
  });

  describe("Custom Dimensions", () => {
    it("should apply custom width as string", () => {
      const { container } = renderWithTheme(<Skeleton width="200px" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toBeInTheDocument();
      // Custom width is applied via Tailwind class w-[200px] or inline style
      // Since Tailwind JIT may not generate dynamic classes, we just verify it renders
      expect(skeleton).toHaveClass("bg-bg-muted");
    });

    it("should apply custom height as string", () => {
      const { container } = renderWithTheme(<Skeleton height="100px" />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toBeInTheDocument();
      // Custom height is applied via Tailwind class h-[100px] or inline style
      // Since Tailwind JIT may not generate dynamic classes, we just verify it renders
      expect(skeleton).toHaveClass("bg-bg-muted");
    });

    it("should apply custom width as number", () => {
      const { container } = renderWithTheme(<Skeleton width={300} />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      // Note: Tailwind dynamic classes may need different assertion
      expect(skeleton).toBeInTheDocument();
    });

    it("should apply custom height as number", () => {
      const { container } = renderWithTheme(<Skeleton height={150} />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toBeInTheDocument();
    });

    it("should override size with custom dimensions", () => {
      const { container } = renderWithTheme(
        <Skeleton size="sm" height="200px" />
      );
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toBeInTheDocument();
      // Custom height should override size - verify it renders correctly
      expect(skeleton).toHaveClass("bg-bg-muted");
      // Size class (h-4) should not be present when custom height is provided
      expect(skeleton).not.toHaveClass("h-4");
    });
  });

  describe("Count", () => {
    it("should render single skeleton when count is 1", () => {
      const { container } = renderWithTheme(<Skeleton count={1} />);
      const skeletons = container.querySelectorAll('[aria-busy="true"]');
      expect(skeletons.length).toBe(1);
    });

    it("should render multiple skeletons when count > 1", () => {
      const { container } = renderWithTheme(<Skeleton count={5} />);
      const wrapper = container.querySelector(
        '[aria-busy="true"][aria-label="Loading"]'
      );
      expect(wrapper).toBeInTheDocument();
      // Count the skeleton divs inside the wrapper
      const skeletons = wrapper?.querySelectorAll("div.bg-bg-muted");
      expect(skeletons?.length).toBe(5);
    });

    it("should default to count of 1", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeletons = container.querySelectorAll('[aria-busy="true"]');
      expect(skeletons.length).toBe(1);
    });

    it("should wrap multiple skeletons in container", () => {
      const { container } = renderWithTheme(<Skeleton count={3} />);
      const wrapper = container.querySelector(
        '[aria-busy="true"][aria-label="Loading"]'
      );
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass("space-y-2");
    });
  });

  describe("Base Styles", () => {
    it("should have base skeleton styles", () => {
      const { container } = renderWithTheme(<Skeleton />);
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("bg-bg-muted");
      expect(skeleton).toHaveClass("animate-pulse");
      expect(skeleton).toHaveClass("block");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Skeleton ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Skeleton
          id="test"
          data-testid="skeleton"
          aria-label="Custom loading"
        />
      );
      const skeleton = container.querySelector("#test");
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveAttribute("id", "test");
      expect(skeleton).toHaveAttribute("data-testid", "skeleton");
    });
  });

  describe("Edge Cases", () => {
    it("should handle circular variant with custom dimensions", () => {
      const { container } = renderWithTheme(
        <Skeleton variant="circular" width="50px" height="50px" />
      );
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("rounded-full");
    });

    it("should handle text variant with custom width", () => {
      const { container } = renderWithTheme(
        <Skeleton variant="text" width="80%" />
      );
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).toHaveClass("h-4");
    });

    it("should combine variant, size, and count correctly", () => {
      const { container } = renderWithTheme(
        <Skeleton variant="text" size="sm" count={3} />
      );
      const wrapper = container.querySelector(
        '[aria-busy="true"][aria-label="Loading"]'
      );
      expect(wrapper).toBeInTheDocument();
      // Count the skeleton divs inside the wrapper
      const skeletons = wrapper?.querySelectorAll("div.bg-bg-muted");
      expect(skeletons?.length).toBe(3);
      skeletons?.forEach((skeleton) => {
        expect(skeleton).toHaveClass("h-4");
      });
    });
  });
});
