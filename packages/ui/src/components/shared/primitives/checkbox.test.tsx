/**
 * Checkbox Component Tests
 *
 * Tests for the Checkbox primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  describe("Rendering", () => {
    it("should render checkbox input", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it("should render checkbox with label", () => {
      const { container } = renderWithTheme(<Checkbox label="Accept terms" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      const label = container.querySelector("label");
      expect(checkbox).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Accept terms");
    });

    it("should render checkbox with variant", () => {
      const { container } = renderWithTheme(
        <Checkbox variant="primary" label="Primary" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveClass("checked:bg-[var(--color-primary-soft)]");
    });

    it("should render checkbox with size", () => {
      const { container } = renderWithTheme(
        <Checkbox size="lg" label="Large" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveClass("h-6", "w-6");
    });

    it("should render checkbox with testId", () => {
      const { container } = renderWithTheme(
        <Checkbox testId="test-checkbox" />
      );
      const checkbox = container.querySelector('[data-testid="test-checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it("should render checkbox without label", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      const label = container.querySelector("label");
      expect(checkbox).toBeInTheDocument();
      expect(label).not.toBeInTheDocument();
    });

    it("should render checkbox with custom className", () => {
      const { container } = renderWithTheme(
        <Checkbox className="custom-class" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Checkbox label="Accessible checkbox" />
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes when disabled", () => {
      const { container } = renderWithTheme(
        <Checkbox disabled label="Disabled" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeDisabled();
      expect(checkbox).toHaveAttribute("aria-invalid", "false");
    });

    it("should have proper ARIA attributes when error", () => {
      const { container } = renderWithTheme(
        <Checkbox error errorMessage="Error message" label="Error checkbox" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("aria-invalid", "true");
      expect(checkbox).toHaveAttribute("aria-describedby");
      const errorId = checkbox?.getAttribute("aria-describedby");
      const errorElement = container.querySelector(`#${errorId}`);
      expect(errorElement).toBeInTheDocument();
    });

    it("should have aria-describedby for helper text", () => {
      const { container } = renderWithTheme(
        <Checkbox helperText="Helper text" label="Helper" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("aria-describedby");
      const helperId = checkbox?.getAttribute("aria-describedby");
      const helperElement = container.querySelector(`#${helperId}`);
      expect(helperElement).toBeInTheDocument();
    });

    it("should prioritize error message over helper text in aria-describedby", () => {
      const { container } = renderWithTheme(
        <Checkbox
          error
          errorMessage="Error"
          helperText="Helper"
          label="Priority"
        />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      const describedBy = checkbox?.getAttribute("aria-describedby");
      expect(describedBy).toContain("-error");
      expect(describedBy).not.toContain("-helper");
    });

    it("should have proper label association", () => {
      const { container } = renderWithTheme(
        <Checkbox label="Labeled checkbox" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      const label = container.querySelector("label");
      const checkboxId = checkbox?.getAttribute("id");
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", checkboxId || "");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("data-mcp-validated", "true");
      expect(checkbox).toHaveAttribute(
        "data-constitution-compliant",
        "checkbox-shared"
      );
    });

    it("should have proper type attribute", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    it("should require label for accessibility", async () => {
      // Checkbox without label should have accessibility violation
      const { container } = renderWithTheme(<Checkbox />);
      const results = await axe(container);
      // This is expected - form elements need labels for accessibility
      expect(results.violations.length).toBeGreaterThan(0);
    });
  });

  describe("Interactions", () => {
    it("should handle change events", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Checkbox onChange={handleChange} label="Changeable" />
      );
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should handle change events via label click", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Checkbox onChange={handleChange} label="Label Click" />
      );
      const label = container.querySelector("label");
      await user.click(label!);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should toggle checked state on click", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Checkbox label="Toggle" />
      );
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
      await user.click(checkbox);
      expect(checkbox.checked).toBe(true);
      await user.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    it("should support keyboard navigation (Space key)", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Checkbox onChange={handleChange} label="Keyboard" />
      );
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      checkbox.focus();
      await user.keyboard(" ");
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should not toggle when disabled", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Checkbox disabled checked={false} label="Disabled" />
      );
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      const initialChecked = checkbox.checked;
      await user.click(checkbox);
      expect(checkbox.checked).toBe(initialChecked);
      expect(checkbox).toBeDisabled();
    });

    it("should have focus-visible styles", () => {
      const { container } = renderWithTheme(<Checkbox label="Focus" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("focus-visible:ring-ring");
      expect(checkbox).toHaveClass("focus-visible:ring-2");
      expect(checkbox).toHaveClass("focus-visible:ring-offset-2");
      expect(checkbox).toHaveClass("focus-visible:outline-none");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Checkbox label="Default" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("bg-bg-elevated");
      expect(checkbox).toHaveClass("border-border");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <Checkbox variant="primary" label="Primary" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("checked:bg-[var(--color-primary-soft)]");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(
        <Checkbox variant="success" label="Success" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("checked:bg-[var(--color-success-soft)]");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Checkbox variant="danger" label="Danger" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("checked:bg-[var(--color-danger-soft)]");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Checkbox size="sm" label="Small" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("h-4", "w-4");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Checkbox size="md" label="Medium" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("h-5", "w-5");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Checkbox size="lg" label="Large" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("h-6", "w-6");
    });
  });

  describe("States", () => {
    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <Checkbox disabled label="Disabled" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      const label = container.querySelector("label");
      expect(checkbox).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(checkbox).toBeDisabled();
      expect(label).toHaveClass("cursor-not-allowed", "opacity-50");
    });

    it("should apply error state styles", () => {
      const { container } = renderWithTheme(
        <Checkbox error errorMessage="Error" label="Error" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("border-[var(--color-danger-soft)]");
      expect(checkbox).toHaveClass("focus-visible:ring-[var(--color-danger-soft)]");
    });

    it("should show error message when error is true", () => {
      const { container } = renderWithTheme(
        <Checkbox error errorMessage="This field is required" label="Error" />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("This field is required");
      expect(errorMessage).toHaveClass("text-[var(--color-danger-soft)]");
    });

    it("should show error message without label", () => {
      const { container } = renderWithTheme(
        <Checkbox error errorMessage="Error without label" />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("Error without label");
    });

    it("should show helper text when provided", () => {
      const { container } = renderWithTheme(
        <Checkbox helperText="Helper text" label="Helper" />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
      expect(helperText?.textContent).toContain("Helper text");
      expect(helperText).toHaveClass("text-fg-muted");
    });

    it("should show helper text without label", () => {
      const { container } = renderWithTheme(
        <Checkbox helperText="Helper without label" />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
      expect(helperText?.textContent).toContain("Helper without label");
    });

    it("should not show helper text when error is true", () => {
      const { container } = renderWithTheme(
        <Checkbox
          error
          errorMessage="Error"
          helperText="Helper text"
          label="Error"
        />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).not.toBeInTheDocument();
    });

    it("should support indeterminate state", () => {
      const { container } = renderWithTheme(
        <Checkbox indeterminate label="Indeterminate" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("indeterminate:bg-current");
    });

    it("should handle checked state", () => {
      const { container } = renderWithTheme(
        <Checkbox checked label="Checked" />
      );
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it("should handle unchecked state", () => {
      const { container } = renderWithTheme(
        <Checkbox checked={false} label="Unchecked" />
      );
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe("Props", () => {
    it("should accept id prop", () => {
      const { container } = renderWithTheme(
        <Checkbox id="custom-id" label="Custom ID" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("id", "custom-id");
    });

    it("should generate unique id when not provided", () => {
      const { container } = renderWithTheme(<Checkbox label="Auto ID" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("id");
      expect(checkbox?.getAttribute("id")).toMatch(/^checkbox-/);
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Checkbox ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML input attributes", () => {
      const { container } = renderWithTheme(
        <Checkbox
          id="test-checkbox"
          name="test"
          value="test-value"
          label="HTML Attributes"
        />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("id", "test-checkbox");
      expect(checkbox).toHaveAttribute("name", "test");
      expect(checkbox).toHaveAttribute("value", "test-value");
    });

    it("should accept wrapperClassName", () => {
      const { container } = renderWithTheme(
        <Checkbox wrapperClassName="custom-wrapper" label="Wrapper" />
      );
      const wrapper = container.querySelector('div:not(.test-theme-wrapper)');
      expect(wrapper).toHaveClass("custom-wrapper");
    });

    it("should use default variant when not specified", () => {
      const { container } = renderWithTheme(<Checkbox label="Default" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("bg-bg-elevated");
    });

    it("should use default size when not specified", () => {
      const { container } = renderWithTheme(<Checkbox label="Default" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("h-5", "w-5"); // md size
    });

    it("should use default error (false) when not specified", () => {
      const { container } = renderWithTheme(<Checkbox label="Default" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("aria-invalid", "false");
    });

    it("should use default disabled (false) when not specified", () => {
      const { container } = renderWithTheme(<Checkbox label="Default" />);
      const checkbox = container.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox).not.toBeDisabled();
    });
  });

  describe("Base Styles", () => {
    it("should have base layout styles", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("inline-flex", "items-center", "justify-center");
    });

    it("should have base border styles", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("border-2");
    });

    it("should have transition styles", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("transition-all", "duration-200");
    });

    it("should have cursor pointer", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("cursor-pointer");
    });

    it("should have flex-shrink-0", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("flex-shrink-0");
    });

    it("should have MCP shared component marker", () => {
      const { container } = renderWithTheme(<Checkbox />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("mcp-shared-component");
    });
  });

  describe("Edge Cases", () => {
    it("should handle label as ReactNode", () => {
      const { container } = renderWithTheme(
        <Checkbox label={<span>React Node Label</span>} />
      );
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("React Node Label");
    });

    it("should handle empty label", () => {
      const { container } = renderWithTheme(<Checkbox label="" />);
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
    });

    it("should handle error without errorMessage", () => {
      const { container } = renderWithTheme(
        <Checkbox error label="Error no message" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute("aria-invalid", "true");
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it("should handle helper text without label", () => {
      const { container } = renderWithTheme(
        <Checkbox helperText="Helper without label" />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
    });

    it("should handle combined props", () => {
      const { container } = renderWithTheme(
        <Checkbox
          variant="primary"
          size="lg"
          label="Combined"
          error
          errorMessage="Error"
          helperText="Helper"
          disabled
          className="custom"
          wrapperClassName="custom-wrapper"
        />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("h-6", "w-6");
      expect(checkbox).toHaveClass("custom");
      expect(checkbox).toBeDisabled();
    });

    it("should handle indeterminate with checked", () => {
      const { container } = renderWithTheme(
        <Checkbox indeterminate checked label="Indeterminate Checked" />
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveClass("indeterminate:bg-current");
    });
  });
});
