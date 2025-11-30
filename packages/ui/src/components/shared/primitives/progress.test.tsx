/**
 * Progress Component Tests
 *
 * Tests for the Progress primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Progress } from "./progress";

describe("Progress", () => {
  describe("Rendering", () => {
    it("should render progress element", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toBeInTheDocument();
    });

    it("should render progress with variant", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="success" />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toBeInTheDocument();
    });

    it("should render progress with size", () => {
      const { container } = renderWithTheme(
        <Progress value={50} size="lg" />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toBeInTheDocument();
      expect(progress).toHaveClass("h-3");
    });

    it("should render progress bar with correct width", () => {
      const { container } = renderWithTheme(<Progress value={75} />);
      const bar = container.querySelector("div.h-full");
      expect(bar).toBeInTheDocument();
      expect(bar).toHaveStyle({ width: "75%" });
    });

    it("should render progress with label", () => {
      const { container } = renderWithTheme(
        <Progress value={60} showLabel />
      );
      const label = container.querySelector("div[aria-hidden='true']");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("60%");
    });

    it("should render indeterminate progress", () => {
      const { container } = renderWithTheme(<Progress />);
      const progress = container.querySelector("div[role='progressbar']");
      const bar = container.querySelector("div.h-full");
      expect(progress).toBeInTheDocument();
      expect(bar).toHaveClass("animate-progress-indeterminate");
      expect(bar).toHaveStyle({ width: "100%" });
    });

    it("should render progress with testId", () => {
      const { container } = renderWithTheme(
        <Progress value={50} testId="test-progress" />
      );
      const progress = container.querySelector('[data-testid="test-progress"]');
      expect(progress).toBeInTheDocument();
    });

    it("should render progress with custom className", () => {
      const { container } = renderWithTheme(
        <Progress value={50} className="custom-class" />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Progress value={50} />
      );
      await expectAccessible(container);
    });

    it("should have proper role attribute", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveAttribute("role", "progressbar");
    });

    it("should have proper ARIA attributes for determinate progress", () => {
      const { container } = renderWithTheme(<Progress value={75} />);
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveAttribute("aria-valuenow", "75");
      expect(progress).toHaveAttribute("aria-valuemin", "0");
      expect(progress).toHaveAttribute("aria-valuemax", "100");
      expect(progress).toHaveAttribute("aria-label", "75% complete");
    });

    it("should have proper ARIA attributes for indeterminate progress", () => {
      const { container } = renderWithTheme(<Progress />);
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).not.toHaveAttribute("aria-valuenow");
      expect(progress).toHaveAttribute("aria-valuemin", "0");
      expect(progress).toHaveAttribute("aria-valuemax", "100");
      expect(progress).toHaveAttribute("aria-label", "Loading...");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Progress value={50} />);
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveAttribute("data-mcp-validated", "true");
      expect(progress).toHaveAttribute("data-constitution-compliant", "progress-shared");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="default" />
      );
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveClass("bg-fg");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="primary" />
      );
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveClass("bg-[var(--color-primary-soft)]");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="success" />
      );
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveClass("bg-[var(--color-success-soft)]");
    });

    it("should apply warning variant styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="warning" />
      );
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveClass("bg-[var(--color-warning-soft)]");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} variant="danger" />
      );
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveClass("bg-[var(--color-danger-soft)]");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} size="sm" />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveClass("h-1");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} size="md" />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveClass("h-2");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Progress value={50} size="lg" />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveClass("h-3");
    });
  });

  describe("Value Handling", () => {
    it("should clamp value to 0-100 range", () => {
      const { container } = renderWithTheme(<Progress value={150} />);
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveStyle({ width: "100%" });
    });

    it("should handle negative values", () => {
      const { container } = renderWithTheme(<Progress value={-10} />);
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveStyle({ width: "0%" });
    });

    it("should handle zero value", () => {
      const { container } = renderWithTheme(<Progress value={0} />);
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveStyle({ width: "0%" });
    });

    it("should handle 100 value", () => {
      const { container } = renderWithTheme(<Progress value={100} />);
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveStyle({ width: "100%" });
    });

    it("should calculate percentage with custom max", () => {
      const { container } = renderWithTheme(
        <Progress value={50} max={200} />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveAttribute("aria-valuenow", "50");
      expect(progress).toHaveAttribute("aria-valuemax", "200");
    });
  });

  describe("Label", () => {
    it("should show label when showLabel is true", () => {
      const { container } = renderWithTheme(
        <Progress value={75} showLabel />
      );
      const label = container.querySelector("div[aria-hidden='true']");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("75%");
    });

    it("should not show label when showLabel is false", () => {
      const { container } = renderWithTheme(
        <Progress value={75} showLabel={false} />
      );
      const label = container.querySelector("div[aria-hidden='true']");
      expect(label).not.toBeInTheDocument();
    });

    it("should not show label for indeterminate progress", () => {
      const { container } = renderWithTheme(
        <Progress showLabel />
      );
      const label = container.querySelector("div[aria-hidden='true']");
      expect(label).not.toBeInTheDocument();
    });

    it("should format label correctly", () => {
      const { container } = renderWithTheme(
        <Progress value={33.333} showLabel />
      );
      const label = container.querySelector("div[aria-hidden='true']");
      expect(label?.textContent).toContain("33%");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Progress value={50} ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Progress value={50} id="test-progress" className="custom" />
      );
      const progress = container.querySelector("div[role='progressbar']");
      expect(progress).toHaveAttribute("id", "test-progress");
      expect(progress).toHaveClass("custom");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined value (indeterminate)", () => {
      const { container } = renderWithTheme(<Progress />);
      const progress = container.querySelector("div[role='progressbar']");
      const bar = container.querySelector("div.h-full");
      expect(progress).toBeInTheDocument();
      expect(bar).toHaveClass("animate-progress-indeterminate");
    });

    it("should handle very small values", () => {
      const { container } = renderWithTheme(<Progress value={0.1} />);
      const bar = container.querySelector("div.h-full");
      expect(bar).toHaveStyle({ width: "0.1%" });
    });
  });
});

