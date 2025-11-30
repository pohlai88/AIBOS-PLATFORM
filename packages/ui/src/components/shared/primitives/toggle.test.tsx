/**
 * Toggle Component Tests
 *
 * Tests for the Toggle primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./toggle";

describe("Toggle", () => {
  describe("Rendering", () => {
    it("should render toggle element", () => {
      const { container } = renderWithTheme(<Toggle />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toBeInTheDocument();
    });

    it("should render toggle with label", () => {
      const { container } = renderWithTheme(
        <Toggle label="Enable notifications" />
      );
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Enable notifications");
    });

    it("should render toggle without label", () => {
      const { container } = renderWithTheme(<Toggle />);
      const label = container.querySelector("label");
      expect(label).not.toBeInTheDocument();
    });

    it("should render toggle with custom className", () => {
      const { container } = renderWithTheme(
        <Toggle className="custom-class" />
      );
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("custom-class");
    });

    it("should render toggle with testId", () => {
      const { container } = renderWithTheme(<Toggle testId="test-toggle" />);
      const input = container.querySelector('[data-testid="test-toggle"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Toggle label="Accessible toggle" />
      );
      await expectAccessible(container);
    });

    it("should have role='switch'", () => {
      const { container } = renderWithTheme(<Toggle />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveAttribute("role", "switch");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Toggle />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveAttribute("data-mcp-validated", "true");
      expect(input).toHaveAttribute(
        "data-constitution-compliant",
        "toggle-shared"
      );
    });

    it("should have aria-invalid when error is true", () => {
      const { container } = renderWithTheme(
        <Toggle error errorMessage="Error message" />
      );
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-busy when loading", () => {
      const { container } = renderWithTheme(<Toggle loading />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveAttribute("aria-busy", "true");
    });

    it("should have aria-describedby when error message exists", () => {
      const { container } = renderWithTheme(
        <Toggle error errorMessage="Error message" />
      );
      const input = container.querySelector('input[type="checkbox"]');
      const id = input?.getAttribute("id");
      expect(input).toHaveAttribute("aria-describedby", `${id}-error`);
    });

    it("should have aria-describedby when helper text exists", () => {
      const { container } = renderWithTheme(
        <Toggle helperText="Helper text" />
      );
      const input = container.querySelector('input[type="checkbox"]');
      const id = input?.getAttribute("id");
      expect(input).toHaveAttribute("aria-describedby", `${id}-helper`);
    });
  });

  describe("Interactions", () => {
    it("should handle change events", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(<Toggle onChange={handleChange} />);
      const input = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      await user.click(input);
      expect(handleChange).toHaveBeenCalled();
    });

    it("should toggle checked state", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<Toggle />);
      const input = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(input.checked).toBe(false);
      await user.click(input);
      expect(input.checked).toBe(true);
    });

    it("should not toggle when disabled", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<Toggle disabled checked />);
      const input = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(input.checked).toBe(true);
      await user.click(input);
      expect(input.checked).toBe(true);
    });

    it("should not toggle when loading", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(<Toggle loading checked />);
      const input = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(input.checked).toBe(true);
      await user.click(input);
      expect(input.checked).toBe(true);
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Toggle variant="default" />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("bg-bg-muted");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(<Toggle variant="primary" />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("bg-bg-muted");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(<Toggle variant="success" />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("bg-bg-muted");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(<Toggle variant="danger" />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("bg-bg-muted");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Toggle size="sm" />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("h-5", "w-9");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(<Toggle size="md" />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("h-6", "w-11");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Toggle size="lg" />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("h-7", "w-13");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(<Toggle />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("h-6", "w-11");
    });
  });

  describe("States", () => {
    it("should apply error state styles", () => {
      const { container } = renderWithTheme(
        <Toggle error errorMessage="Error" />
      );
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("border-2");
      expect(input).toHaveClass("border-[var(--color-danger-soft)]");
    });

    it("should show error message when error is true", () => {
      const { container } = renderWithTheme(
        <Toggle error errorMessage="Error message" />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toBe("Error message");
    });

    it("should show helper text when provided", () => {
      const { container } = renderWithTheme(
        <Toggle helperText="Helper text" />
      );
      const input = container.querySelector('input[type="checkbox"]');
      const helperId = input?.getAttribute("aria-describedby");
      const helperText = helperId
        ? container.querySelector(`#${helperId}`)
        : null;
      expect(helperText).toBeInTheDocument();
      expect(helperText?.textContent).toContain("Helper text");
    });

    it("should apply loading state styles", () => {
      const { container } = renderWithTheme(<Toggle loading />);
      const thumb = container.querySelector("span[aria-hidden='true']");
      expect(thumb).toHaveClass("animate-pulse");
    });

    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(<Toggle disabled />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(input).toBeDisabled();
    });
  });

  describe("Label Association", () => {
    it("should associate label with input using htmlFor", () => {
      const { container } = renderWithTheme(<Toggle label="Test label" />);
      const input = container.querySelector('input[type="checkbox"]');
      const label = container.querySelector("label");
      const id = input?.getAttribute("id");
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", id || "");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Toggle ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML input attributes", () => {
      const { container } = renderWithTheme(
        <Toggle id="test" data-testid="toggle" aria-label="Test toggle" />
      );
      const input = container.querySelector("#test");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("id", "test");
      expect(input).toHaveAttribute("data-testid", "toggle");
    });

    it("should have type='checkbox'", () => {
      const { container } = renderWithTheme(<Toggle />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveAttribute("type", "checkbox");
    });
  });

  describe("Edge Cases", () => {
    it("should handle both error and helper text", () => {
      const { container } = renderWithTheme(
        <Toggle error errorMessage="Error" helperText="Helper" />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      // Helper text should not be shown when error exists
      const helperText = container.querySelector(
        `#${container.querySelector("input")?.getAttribute("id")}-helper`
      );
      expect(helperText).not.toBeInTheDocument();
    });

    it("should combine variant and size correctly", () => {
      const { container } = renderWithTheme(
        <Toggle variant="primary" size="lg" />
      );
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toHaveClass("h-7", "w-13");
    });
  });
});
