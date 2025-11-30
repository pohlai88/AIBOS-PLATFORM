/**
 * IconWrapper Component Tests
 *
 * Tests for the IconWrapper primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { IconWrapper } from "./icon-wrapper";

describe("IconWrapper", () => {
  describe("Rendering", () => {
    it("should render icon wrapper element", () => {
      const { container } = renderWithTheme(
        <IconWrapper>
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toBeInTheDocument();
    });

    it("should render icon wrapper with children", () => {
      const { container } = renderWithTheme(
        <IconWrapper>
          <svg data-testid="icon">
            <path />
          </svg>
        </IconWrapper>
      );
      const icon = container.querySelector('[data-testid="icon"]');
      expect(icon).toBeInTheDocument();
    });

    it("should render icon wrapper with custom className", () => {
      const { container } = renderWithTheme(
        <IconWrapper className="custom-class">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should render icon wrapper with testId", () => {
      const { container } = renderWithTheme(
        <IconWrapper testId="test-icon">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector('[data-testid="test-icon"]');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <IconWrapper label="Accessible icon">
          <span>Icon</span>
        </IconWrapper>
      );
      await expectAccessible(container);
    });

    it("should have aria-label when label is provided", () => {
      const { container } = renderWithTheme(
        <IconWrapper label="Test icon">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveAttribute("aria-label", "Test icon");
    });

    it("should have role='img' when label is provided", () => {
      const { container } = renderWithTheme(
        <IconWrapper label="Test icon">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveAttribute("role", "img");
    });

    it("should have aria-hidden when no label", () => {
      const { container } = renderWithTheme(
        <IconWrapper>
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveAttribute("aria-hidden", "true");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <IconWrapper>
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveAttribute("data-mcp-validated", "true");
      expect(wrapper).toHaveAttribute("data-constitution-compliant", "iconwrapper-shared");
    });
  });

  describe("Sizes", () => {
    it("should apply extra small size styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper size="xs">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("w-3", "h-3");
    });

    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper size="sm">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("w-4", "h-4");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper size="md">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("w-5", "h-5");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper size="lg">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("w-6", "h-6");
    });

    it("should apply extra large size styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper size="xl">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("w-8", "h-8");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(
        <IconWrapper>
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("w-5", "h-5");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper variant="default">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("text-fg");
    });

    it("should apply muted variant styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper variant="muted">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("text-fg-muted");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper variant="primary">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("text-[var(--color-primary-soft)]");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper variant="success">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("text-[var(--color-success-soft)]");
    });

    it("should apply warning variant styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper variant="warning">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("text-[var(--color-warning-soft)]");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper variant="danger">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("text-[var(--color-danger-soft)]");
    });

    it("should default to default variant", () => {
      const { container } = renderWithTheme(
        <IconWrapper>
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("text-fg");
    });
  });

  describe("Base Styles", () => {
    it("should have base icon wrapper styles", () => {
      const { container } = renderWithTheme(
        <IconWrapper>
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("inline-flex", "items-center", "justify-center");
      expect(wrapper).toHaveClass("shrink-0");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(
        <IconWrapper ref={ref}>
          <span>Icon</span>
        </IconWrapper>
      );
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML span attributes", () => {
      const { container } = renderWithTheme(
        <IconWrapper id="test" data-testid="icon" aria-label="Test icon">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("#test");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute("id", "test");
      expect(wrapper).toHaveAttribute("data-testid", "icon");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null children", () => {
      const { container } = renderWithTheme(<IconWrapper>{null}</IconWrapper>);
      const wrapper = container.querySelector("span");
      expect(wrapper).toBeInTheDocument();
    });

    it("should combine size and variant correctly", () => {
      const { container } = renderWithTheme(
        <IconWrapper size="lg" variant="primary">
          <span>Icon</span>
        </IconWrapper>
      );
      const wrapper = container.querySelector("span");
      expect(wrapper).toHaveClass("w-6", "h-6");
      expect(wrapper).toHaveClass("text-[var(--color-primary-soft)]");
    });
  });
});

