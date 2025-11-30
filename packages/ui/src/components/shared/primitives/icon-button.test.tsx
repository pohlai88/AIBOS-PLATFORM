/**
 * IconButton Component Tests
 *
 * Tests for the IconButton primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { IconButton } from "./icon-button";

describe("IconButton", () => {
  describe("Rendering", () => {
    it("should render icon button element", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should render icon button with icon", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span data-testid="icon">Icon</span>} />
      );
      const icon = container.querySelector('[data-testid="icon"]');
      expect(icon).toBeInTheDocument();
    });

    it("should render icon button with custom className", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} className="custom-class" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should render icon button with testId", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} testId="test-button" />
      );
      const button = container.querySelector('[data-testid="test-button"]');
      expect(button).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Accessible button" icon={<span>Icon</span>} />
      );
      await expectAccessible(container);
    });

    it("should have required aria-label", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test button" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-label", "Test button");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("data-mcp-validated", "true");
      expect(button).toHaveAttribute("data-constitution-compliant", "icon-button-shared");
    });

    it("should have aria-busy when loading", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Loading" icon={<span>Icon</span>} loading />
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("should have focus-visible styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("focus-visible:ring-ring");
      expect(button).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <IconButton aria-label="Clickable" icon={<span>Icon</span>} onClick={handleClick} />
      );
      const button = container.querySelector("button") as HTMLElement;
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <IconButton aria-label="Disabled" icon={<span>Icon</span>} onClick={handleClick} disabled />
      );
      const button = container.querySelector("button") as HTMLElement;
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when loading", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <IconButton aria-label="Loading" icon={<span>Icon</span>} onClick={handleClick} loading />
      );
      const button = container.querySelector("button") as HTMLElement;
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Default" icon={<span>Icon</span>} variant="default" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-bg-elevated");
      expect(button).toHaveClass("text-fg");
      expect(button).toHaveClass("border", "border-border");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Primary" icon={<span>Icon</span>} variant="primary" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-primary-soft");
      expect(button).toHaveClass("text-primary-foreground");
    });

    it("should apply secondary variant styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Secondary" icon={<span>Icon</span>} variant="secondary" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-secondary-soft");
      expect(button).toHaveClass("text-fg");
    });

    it("should apply ghost variant styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Ghost" icon={<span>Icon</span>} variant="ghost" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-transparent");
      expect(button).toHaveClass("text-fg");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Danger" icon={<span>Icon</span>} variant="danger" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-danger-soft");
      expect(button).toHaveClass("text-danger-foreground");
    });

    it("should default to default variant", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Default" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-bg-elevated");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Small" icon={<span>Icon</span>} size="sm" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-8", "w-8");
      expect(button).toHaveClass("text-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Medium" icon={<span>Icon</span>} size="md" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-10", "w-10");
      expect(button).toHaveClass("text-base");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Large" icon={<span>Icon</span>} size="lg" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-12", "w-12");
      expect(button).toHaveClass("text-lg");
    });

    it("should apply extra large size styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="XL" icon={<span>Icon</span>} size="xl" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-14", "w-14");
      expect(button).toHaveClass("text-xl");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Default" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("h-10", "w-10");
    });
  });

  describe("States", () => {
    it("should apply loading state styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Loading" icon={<span>Icon</span>} loading />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("pointer-events-none", "opacity-70");
      expect(button).toBeDisabled();
    });

    it("should show spinner when loading", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Loading" icon={<span>Icon</span>} loading />
      );
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Disabled" icon={<span>Icon</span>} disabled />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(button).toBeDisabled();
    });

    it("should be disabled when loading", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Loading" icon={<span>Icon</span>} loading />
      );
      const button = container.querySelector("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Base Styles", () => {
    it("should have base button styles", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("inline-flex", "items-center", "justify-center");
      expect(button).toHaveClass("transition-all", "duration-200");
      expect(button).toHaveClass("cursor-pointer");
      expect(button).toHaveClass("flex-shrink-0");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<IconButton aria-label="Test" icon={<span>Icon</span>} ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML button attributes", () => {
      const { container } = renderWithTheme(
        <IconButton
          aria-label="Test"
          icon={<span>Icon</span>}
          id="test"
          data-testid="button"
          type="submit"
        />
      );
      const button = container.querySelector("#test");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("id", "test");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should default to type='button'", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} />
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null icon", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={null} />
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle both loading and disabled", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} loading disabled />
      );
      const button = container.querySelector("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    it("should combine variant and size correctly", () => {
      const { container } = renderWithTheme(
        <IconButton aria-label="Test" icon={<span>Icon</span>} variant="primary" size="lg" />
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-primary-soft");
      expect(button).toHaveClass("h-12", "w-12");
    });
  });
});

