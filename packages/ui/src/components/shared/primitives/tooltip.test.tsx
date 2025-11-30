/**
 * Tooltip Component Tests
 *
 * Tests for the Tooltip primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  describe("Rendering", () => {
    it("should render tooltip element", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Tooltip text" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip?.textContent).toContain("Tooltip text");
    });

    it("should render tooltip with side", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Right tooltip" side="right" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass("left-full");
    });

    it("should render tooltip with size", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Large tooltip" size="lg" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveClass("px-5", "py-2");
    });

    it("should render tooltip with arrow", () => {
      const { container } = renderWithTheme(
        <Tooltip content="With arrow" arrow={true} />
      );
      const arrow = container.querySelector('div[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
    });

    it("should not render arrow when arrow is false", () => {
      const { container } = renderWithTheme(
        <Tooltip content="No arrow" arrow={false} />
      );
      const arrow = container.querySelector('div[aria-hidden="true"]');
      expect(arrow).not.toBeInTheDocument();
    });

    it("should render tooltip with testId", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Test" testId="test-tooltip" />
      );
      const tooltip = container.querySelector('[data-testid="test-tooltip"]');
      expect(tooltip).toBeInTheDocument();
    });

    it("should render tooltip with custom className", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Custom" className="custom-class" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Tooltip content="Accessible tooltip" />
      );
      await expectAccessible(container);
    });

    it("should have proper role attribute", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Tooltip" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveAttribute("role", "tooltip");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Test" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveAttribute("data-mcp-validated", "true");
      expect(tooltip).toHaveAttribute("data-constitution-compliant", "tooltip-shared");
    });

    it("should have pointer-events-none class", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Tooltip" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("pointer-events-none");
    });
  });

  describe("Sides", () => {
    it("should apply top side styles", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Top" side="top" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("bottom-full");
      expect(tooltip).toHaveClass("left-1/2");
    });

    it("should apply right side styles", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Right" side="right" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("left-full");
      expect(tooltip).toHaveClass("top-1/2");
    });

    it("should apply bottom side styles", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Bottom" side="bottom" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("top-full");
      expect(tooltip).toHaveClass("left-1/2");
    });

    it("should apply left side styles", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Left" side="left" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("right-full");
      expect(tooltip).toHaveClass("top-1/2");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Small" size="sm" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("px-3", "py-1");
      expect(tooltip).toHaveClass("text-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Medium" size="md" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("px-4", "py-1.5");
      expect(tooltip).toHaveClass("text-[15px]");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Large" size="lg" />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toHaveClass("px-5", "py-2");
      expect(tooltip).toHaveClass("text-[15px]");
    });
  });

  describe("Arrow", () => {
    it("should render arrow for top side", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Top" side="top" arrow={true} />
      );
      const arrow = container.querySelector('div[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
    });

    it("should render arrow for right side", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Right" side="right" arrow={true} />
      );
      const arrow = container.querySelector('div[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
    });

    it("should render arrow for bottom side", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Bottom" side="bottom" arrow={true} />
      );
      const arrow = container.querySelector('div[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
    });

    it("should render arrow for left side", () => {
      const { container } = renderWithTheme(
        <Tooltip content="Left" side="left" arrow={true} />
      );
      const arrow = container.querySelector('div[aria-hidden="true"]');
      expect(arrow).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Tooltip content="Ref Test" ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept content as ReactNode", () => {
      const { container } = renderWithTheme(
        <Tooltip content={<span>React Node</span>} />
      );
      const tooltip = container.querySelector("div[role='tooltip']");
      const span = container.querySelector("span");
      expect(tooltip).toBeInTheDocument();
      expect(span).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const { container } = renderWithTheme(<Tooltip content="" />);
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toBeInTheDocument();
    });

    it("should handle null content", () => {
      const { container } = renderWithTheme(<Tooltip content={null} />);
      const tooltip = container.querySelector("div[role='tooltip']");
      expect(tooltip).toBeInTheDocument();
    });
  });
});

