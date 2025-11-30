/**
 * Progress Component Tests
 *
 * Tests for the Progress Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import { Progress } from "./progress";

// Helper function to get Progress element
function getProgress(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[data-testid*="progress"]')
  ) as HTMLElement | null;
}

describe("Progress", () => {
  describe("Rendering", () => {
    it("should render progress component", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const progress = getProgress(container);
      expect(progress).toBeInTheDocument();
    });

    it("should render progress bar", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const progressBar = container.querySelector(".mcp-layer3-pattern-root");
      expect(progressBar).toBeInTheDocument();
    });

    it("should render progress indicator", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Progress value={50} testId="test-progress" />
      );
      const progress = container.querySelector('[data-testid="test-progress"]');
      expect(progress).toBeInTheDocument();
    });
  });

  describe("Value", () => {
    it("should display correct progress value", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toHaveStyle({ transform: "translateX(-50%)" });
    });

    it("should handle 0% progress", () => {
      const { container } = renderWithTheme(<Progress value={0} />);
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toHaveStyle({ transform: "translateX(-100%)" });
    });

    it("should handle 100% progress", () => {
      const { container } = renderWithTheme(<Progress value={100} />);
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toHaveStyle({ transform: "translateX(-0%)" });
    });

    it("should clamp value above max", () => {
      const { container } = renderWithTheme(<Progress value={150} max={100} />);
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toHaveStyle({ transform: "translateX(-0%)" });
    });

    it("should clamp value below 0", () => {
      const { container } = renderWithTheme(<Progress value={-10} />);
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toHaveStyle({ transform: "translateX(-100%)" });
    });

    it("should handle custom max value", () => {
      const { container } = renderWithTheme(<Progress value={5} max={10} />);
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toHaveStyle({ transform: "translateX(-50%)" });
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="default" />
      );
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toBeInTheDocument();
    });

    it("should render primary variant", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="primary" />
      );
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toBeInTheDocument();
    });

    it("should render success variant", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="success" />
      );
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toBeInTheDocument();
    });

    it("should render warning variant", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="warning" />
      );
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toBeInTheDocument();
    });

    it("should render error variant", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="error" />
      );
      const indicator = container.querySelector(".mcp-layer3-pattern-indicator");
      expect(indicator).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      const { container } = renderWithTheme(<Progress value={50} size="sm" />);
      const progressBar = container.querySelector(".mcp-layer3-pattern-root");
      expect(progressBar).toHaveClass("h-1");
    });

    it("should render medium size (default)", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const progressBar = container.querySelector(".mcp-layer3-pattern-root");
      expect(progressBar).toHaveClass("h-2");
    });

    it("should render large size", () => {
      const { container } = renderWithTheme(<Progress value={50} size="lg" />);
      const progressBar = container.querySelector(".mcp-layer3-pattern-root");
      expect(progressBar).toHaveClass("h-3");
    });
  });

  describe("Value Label", () => {
    it("should not show value label by default", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const label = container.querySelector("p");
      expect(label).not.toBeInTheDocument();
    });

    it("should show value label when showValue is true", () => {
      const { container } = renderWithTheme(<Progress value={50} showValue />);
      const label = container.querySelector("p");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("50%");
    });

    it("should use custom formatter when provided", () => {
      const formatValue = (value: number, max: number) => `${value}/${max}`;
      const { container } = renderWithTheme(
        <Progress value={5} max={10} showValue formatValue={formatValue} />
      );
      const label = container.querySelector("p");
      expect(label?.textContent).toContain("5/10");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const progressBar = container.querySelector(".mcp-layer3-pattern-root");
      expect(progressBar).toHaveAttribute("role", "progressbar");
    });
  });
});

