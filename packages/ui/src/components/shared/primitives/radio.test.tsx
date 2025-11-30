/**
 * Radio Component Tests
 *
 * Tests for the Radio primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { Radio } from "./radio";

describe("Radio", () => {
  describe("Rendering", () => {
    it("should render radio input", () => {
      const { container } = renderWithTheme(<Radio name="test" value="1" />);
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();
    });

    it("should render radio with label", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Option 1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      const label = container.querySelector("label");
      expect(radio).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Option 1");
    });

    it("should render radio with variant", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" variant="primary" label="Primary" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveClass("checked:border-[var(--color-primary-soft)]");
    });

    it("should render radio with size", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" size="lg" label="Large" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveClass("h-6", "w-6");
    });

    it("should render radio with testId", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" testId="test-radio" />
      );
      const radio = container.querySelector('[data-testid="test-radio"]');
      expect(radio).toBeInTheDocument();
    });

    it("should render radio without label", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      const label = container.querySelector("label");
      expect(radio).toBeInTheDocument();
      expect(label).not.toBeInTheDocument();
    });

    it("should render custom dot indicator", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" checked />
      );
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Accessible radio" />
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes when disabled", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" disabled label="Disabled" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeDisabled();
      expect(radio).toHaveAttribute("aria-invalid", "false");
    });

    it("should have proper ARIA attributes when error", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          error
          errorMessage="Error message"
          label="Error radio"
        />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("aria-invalid", "true");
      expect(radio).toHaveAttribute("aria-describedby");
      const errorId = radio?.getAttribute("aria-describedby");
      const errorElement = container.querySelector(`#${errorId}`);
      expect(errorElement).toBeInTheDocument();
    });

    it("should have aria-describedby for helper text", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" helperText="Helper text" label="Helper" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("aria-describedby");
      const helperId = radio?.getAttribute("aria-describedby");
      const helperElement = container.querySelector(`#${helperId}`);
      expect(helperElement).toBeInTheDocument();
    });

    it("should prioritize error message over helper text in aria-describedby", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          error
          errorMessage="Error"
          helperText="Helper"
          label="Priority"
        />
      );
      const radio = container.querySelector('input[type="radio"]');
      const describedBy = radio?.getAttribute("aria-describedby");
      expect(describedBy).toContain("-error");
      expect(describedBy).not.toContain("-helper");
    });

    it("should have proper label association", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Labeled radio" />
      );
      const radio = container.querySelector('input[type="radio"]');
      const label = container.querySelector("label");
      const radioId = radio?.getAttribute("id");
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", radioId || "");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("data-mcp-validated", "true");
      expect(radio).toHaveAttribute("data-constitution-compliant", "radio-shared");
    });

    it("should have proper type attribute", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("type", "radio");
    });

    it("should require label for accessibility", async () => {
      // Radio without label should have accessibility violation
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const results = await axe(container);
      // This is expected - form elements need labels for accessibility
      expect(results.violations.length).toBeGreaterThan(0);
    });

    it("should have custom dot indicator with aria-hidden", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Interactions", () => {
    it("should handle change events", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          onChange={handleChange}
          label="Changeable"
        />
      );
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      await user.click(radio);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should handle change events via label click", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          onChange={handleChange}
          label="Label Click"
        />
      );
      const label = container.querySelector("label");
      await user.click(label!);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should toggle checked state on click", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Toggle" />
      );
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      expect(radio.checked).toBe(false);
      await user.click(radio);
      expect(radio.checked).toBe(true);
    });

    it("should support keyboard navigation (Space key)", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          onChange={handleChange}
          label="Keyboard"
        />
      );
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      radio.focus();
      await user.keyboard(" ");
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should not toggle when disabled", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Radio name="test" value="1" disabled checked={false} label="Disabled" />
      );
      const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
      const initialChecked = radio.checked;
      await user.click(radio);
      expect(radio.checked).toBe(initialChecked);
      expect(radio).toBeDisabled();
    });

    it("should have focus-visible styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Focus" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("focus-visible:ring-ring");
      expect(radio).toHaveClass("focus-visible:ring-2");
      expect(radio).toHaveClass("focus-visible:ring-offset-2");
      expect(radio).toHaveClass("focus-visible:outline-none");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Default" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("bg-bg-elevated");
      expect(radio).toHaveClass("border-border");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" variant="primary" label="Primary" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("checked:border-[var(--color-primary-soft)]");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" variant="success" label="Success" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("checked:border-[var(--color-success-soft)]");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" variant="danger" label="Danger" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("checked:border-[var(--color-danger-soft)]");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" size="sm" label="Small" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("h-4", "w-4");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" size="md" label="Medium" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("h-5", "w-5");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" size="lg" label="Large" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("h-6", "w-6");
    });
  });

  describe("States", () => {
    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" disabled label="Disabled" />
      );
      const radio = container.querySelector('input[type="radio"]');
      const label = container.querySelector("label");
      expect(radio).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(radio).toBeDisabled();
      expect(label).toHaveClass("cursor-not-allowed", "opacity-50");
    });

    it("should apply error state styles", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          error
          errorMessage="Error"
          label="Error"
        />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("border-[var(--color-danger-soft)]");
      expect(radio).toHaveClass("focus-visible:ring-[var(--color-danger-soft)]");
    });

    it("should show error message when error is true", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          error
          errorMessage="This field is required"
          label="Error"
        />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("This field is required");
      expect(errorMessage).toHaveClass("text-[var(--color-danger-soft)]");
    });

    it("should show error message without label", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" error errorMessage="Error without label" />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("Error without label");
    });

    it("should show helper text when provided", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          helperText="Helper text"
          label="Helper"
        />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
      expect(helperText?.textContent).toContain("Helper text");
      expect(helperText).toHaveClass("text-fg-muted");
    });

    it("should show helper text without label", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" helperText="Helper without label" />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
      expect(helperText?.textContent).toContain("Helper without label");
    });

    it("should not show helper text when error is true", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          error
          errorMessage="Error"
          helperText="Helper text"
          label="Error"
        />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).not.toBeInTheDocument();
    });

    it("should handle checked state", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" checked label="Checked" />
      );
      const radio = container.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;
      expect(radio.checked).toBe(true);
    });

    it("should handle unchecked state", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" checked={false} label="Unchecked" />
      );
      const radio = container.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;
      expect(radio.checked).toBe(false);
    });
  });

  describe("Props", () => {
    it("should accept id prop", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" id="custom-id" label="Custom ID" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("id", "custom-id");
    });

    it("should generate unique id when not provided", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Auto ID" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("id");
      expect(radio?.getAttribute("id")).toMatch(/^radio-/);
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Radio name="test" value="1" ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML input attributes", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
          id="test-radio"
          label="HTML Attributes"
        />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("id", "test-radio");
      expect(radio).toHaveAttribute("name", "test");
      expect(radio).toHaveAttribute("value", "1");
    });

    it("should require name prop for radio groups", () => {
      const { container } = renderWithTheme(
        <Radio name="group" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("name", "group");
    });

    it("should accept wrapperClassName", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" wrapperClassName="custom-wrapper" label="Wrapper" />
      );
      const wrapper = container.querySelector('div:not(.test-theme-wrapper)');
      expect(wrapper).toHaveClass("custom-wrapper");
    });

    it("should use default variant when not specified", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Default" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("bg-bg-elevated");
    });

    it("should use default size when not specified", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Default" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("h-5", "w-5"); // md size
    });

    it("should use default error (false) when not specified", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Default" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("aria-invalid", "false");
    });

    it("should use default disabled (false) when not specified", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="Default" />
      );
      const radio = container.querySelector(
        'input[type="radio"]'
      ) as HTMLInputElement;
      expect(radio).not.toBeDisabled();
    });
  });

  describe("Radio Groups", () => {
    it("should work in radio groups", () => {
      const { container } = renderWithTheme(
        <>
          <Radio name="group" value="1" label="Option 1" />
          <Radio name="group" value="2" label="Option 2" />
          <Radio name="group" value="3" label="Option 3" />
        </>
      );
      const radios = container.querySelectorAll('input[type="radio"]');
      expect(radios).toHaveLength(3);
      expect(radios[0]?.getAttribute("name")).toBe("group");
      expect(radios[1]?.getAttribute("name")).toBe("group");
      expect(radios[2]?.getAttribute("name")).toBe("group");
    });
  });

  describe("Base Styles", () => {
    it("should have base layout styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("inline-flex", "items-center", "justify-center");
    });

    it("should have base border styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("border-2");
    });

    it("should have rounded-full for circular shape", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("rounded-full");
    });

    it("should have transition styles", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("transition-all", "duration-200");
    });

    it("should have cursor pointer", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("cursor-pointer");
    });

    it("should have flex-shrink-0 and relative", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("flex-shrink-0", "relative");
    });

    it("should have MCP shared component marker", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("mcp-shared-component");
    });

    it("should have appearance-none to hide default radio", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("appearance-none");
    });
  });

  describe("Custom Dot Indicator", () => {
    it("should render custom dot indicator", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toBeInTheDocument();
    });

    it("should have dot with correct positioning classes", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass("absolute");
      expect(dot).toHaveClass("top-1/2", "left-1/2");
      expect(dot).toHaveClass("-translate-x-1/2", "-translate-y-1/2");
    });

    it("should have dot with rounded-full", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass("rounded-full");
    });

    it("should have dot with pointer-events-none", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass("pointer-events-none");
    });

    it("should have dot with opacity-0 by default", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" />
      );
      const dot = container.querySelector('span[aria-hidden="true"]');
      expect(dot).toHaveClass("opacity-0");
    });
  });

  describe("Edge Cases", () => {
    it("should handle label as ReactNode", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label={<span>React Node Label</span>} />
      );
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("React Node Label");
    });

    it("should handle empty label", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" label="" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toBeInTheDocument();
    });

    it("should handle error without errorMessage", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" error label="Error no message" />
      );
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveAttribute("aria-invalid", "true");
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it("should handle helper text without label", () => {
      const { container } = renderWithTheme(
        <Radio name="test" value="1" helperText="Helper without label" />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
    });

    it("should handle combined props", () => {
      const { container } = renderWithTheme(
        <Radio
          name="test"
          value="1"
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
      const radio = container.querySelector('input[type="radio"]');
      expect(radio).toHaveClass("h-6", "w-6");
      expect(radio).toHaveClass("custom");
      expect(radio).toBeDisabled();
    });
  });
});

