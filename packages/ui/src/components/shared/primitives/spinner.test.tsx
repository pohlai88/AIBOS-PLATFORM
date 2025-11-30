/**
 * Spinner Component Tests
 *
 * Tests for the Spinner primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Spinner } from "./spinner";

describe("Spinner", () => {
  describe("Rendering", () => {
    it("should render spinner element", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toBeInTheDocument();
    });

    it("should render spinner as SVG", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toBeInTheDocument();
      expect(spinner?.tagName).toBe("svg");
    });

    it("should render spinner with custom className", () => {
      const { container } = renderWithTheme(
        <Spinner className="custom-class" />
      );
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("custom-class");
    });

    it("should render spinner with testId", () => {
      const { container } = renderWithTheme(
        <Spinner testId="test-spinner" />
      );
      const spinner = container.querySelector('[data-testid="test-spinner"]');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Spinner />
      );
      await expectAccessible(container);
    });

    it("should have role='status'", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("role", "status");
    });

    it("should have aria-label", () => {
      const { container } = renderWithTheme(<Spinner label="Loading content" />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("aria-label", "Loading content");
    });

    it("should default to aria-label='Loading'", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("aria-label", "Loading");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("data-mcp-validated", "true");
      expect(spinner).toHaveAttribute("data-constitution-compliant", "spinner-shared");
    });
  });

  describe("Sizes", () => {
    it("should apply extra small size", () => {
      const { container } = renderWithTheme(<Spinner size="xs" />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("width", "16");
      expect(spinner).toHaveAttribute("height", "16");
    });

    it("should apply small size", () => {
      const { container } = renderWithTheme(<Spinner size="sm" />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("width", "20");
      expect(spinner).toHaveAttribute("height", "20");
    });

    it("should apply medium size", () => {
      const { container } = renderWithTheme(<Spinner size="md" />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("width", "24");
      expect(spinner).toHaveAttribute("height", "24");
    });

    it("should apply large size", () => {
      const { container } = renderWithTheme(<Spinner size="lg" />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("width", "32");
      expect(spinner).toHaveAttribute("height", "32");
    });

    it("should apply extra large size", () => {
      const { container } = renderWithTheme(<Spinner size="xl" />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("width", "40");
      expect(spinner).toHaveAttribute("height", "40");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("width", "24");
      expect(spinner).toHaveAttribute("height", "24");
    });
  });

  describe("SVG Structure", () => {
    it("should have viewBox='0 0 24 24'", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("viewBox", "0 0 24 24");
    });

    it("should have fill='none'", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("fill", "none");
    });

    it("should render circle element", () => {
      const { container } = renderWithTheme(<Spinner />);
      const circle = container.querySelector("circle");
      expect(circle).toBeInTheDocument();
    });

    it("should render path element", () => {
      const { container } = renderWithTheme(<Spinner />);
      const path = container.querySelector("path");
      expect(path).toBeInTheDocument();
    });
  });

  describe("Base Styles", () => {
    it("should have animate-spin class", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("animate-spin");
    });

    it("should have text-fg class", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("text-fg");
    });

    it("should have mcp-shared-component class", () => {
      const { container } = renderWithTheme(<Spinner />);
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveClass("mcp-shared-component");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Spinner ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML SVG attributes", () => {
      const { container } = renderWithTheme(
        <Spinner id="test" data-testid="spinner" aria-label="Custom loading" />
      );
      const spinner = container.querySelector("#test");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("id", "test");
      expect(spinner).toHaveAttribute("data-testid", "spinner");
    });
  });

  describe("Edge Cases", () => {
    it("should handle custom label", () => {
      const { container } = renderWithTheme(
        <Spinner label="Processing payment..." />
      );
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("aria-label", "Processing payment...");
    });

    it("should handle empty label", () => {
      const { container } = renderWithTheme(
        <Spinner label="" />
      );
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("aria-label", "");
    });

    it("should combine size and label correctly", () => {
      const { container } = renderWithTheme(
        <Spinner size="lg" label="Large spinner" />
      );
      const spinner = container.querySelector("svg");
      expect(spinner).toHaveAttribute("width", "32");
      expect(spinner).toHaveAttribute("aria-label", "Large spinner");
    });
  });
});

