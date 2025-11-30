/**
 * Select Component Tests
 *
 * Tests for the Select primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Select } from "./select";

describe("Select", () => {
  describe("Rendering", () => {
    it("should render select element", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toBeInTheDocument();
    });

    it("should render select with label", () => {
      const { container } = renderWithTheme(
        <Select label="Choose option">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      const label = container.querySelector("label");
      expect(select).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Choose option");
    });

    it("should render select with variant", () => {
      const { container } = renderWithTheme(
        <Select variant="filled" label="Filled">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toBeInTheDocument();
      expect(select).toHaveClass("bg-bg-muted");
    });

    it("should render select with size", () => {
      const { container } = renderWithTheme(
        <Select size="lg" label="Large">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toBeInTheDocument();
      expect(select).toHaveClass("h-13");
    });

    it("should render select with placeholder", () => {
      const { container } = renderWithTheme(
        <Select placeholder="Select an option">
          <option value="1">Option 1</option>
        </Select>
      );
      const placeholder = container.querySelector('option[value=""]');
      expect(placeholder).toBeInTheDocument();
      expect(placeholder?.textContent).toContain("Select an option");
      expect(placeholder).toBeDisabled();
    });

    it("should render placeholder as first option", () => {
      const { container } = renderWithTheme(
        <Select placeholder="Choose">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const options = container.querySelectorAll("option");
      expect(options[0]?.getAttribute("value")).toBe("");
      expect(options[0]?.textContent).toBe("Choose");
      expect(options[0]).toBeDisabled();
    });

    it("should render select with testId", () => {
      const { container } = renderWithTheme(
        <Select testId="test-select">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector('[data-testid="test-select"]');
      expect(select).toBeInTheDocument();
    });

    it("should render select without label", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      const label = container.querySelector("label");
      expect(select).toBeInTheDocument();
      expect(label).not.toBeInTheDocument();
    });

    it("should render chevron icon", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      // Chevron is inside a div with aria-hidden="true"
      const chevronContainer = container.querySelector('div[aria-hidden="true"]');
      const chevron = chevronContainer?.querySelector("svg");
      expect(chevron).toBeInTheDocument();
    });

    it("should have chevron icon with correct positioning", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const chevronContainer = container.querySelector('div[aria-hidden="true"]');
      expect(chevronContainer).toHaveClass("absolute");
      expect(chevronContainer).toHaveClass("top-1/2", "right-3");
      expect(chevronContainer).toHaveClass("-translate-y-1/2");
      expect(chevronContainer).toHaveClass("pointer-events-none");
    });

    it("should have chevron icon with correct styling", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const chevronContainer = container.querySelector('div[aria-hidden="true"]');
      expect(chevronContainer).toHaveClass("text-fg-muted");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Select label="Accessible select">
          <option value="1">Option 1</option>
        </Select>
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes when disabled", () => {
      const { container } = renderWithTheme(
        <Select disabled label="Disabled">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toBeDisabled();
    });

    it("should have proper ARIA attributes when error", () => {
      const { container } = renderWithTheme(
        <Select
          error
          errorMessage="Error message"
          label="Error select"
        >
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("aria-invalid", "true");
      expect(select).toHaveAttribute("aria-describedby");
      const errorId = select?.getAttribute("aria-describedby");
      const errorElement = container.querySelector(`#${errorId}`);
      expect(errorElement).toBeInTheDocument();
    });

    it("should have aria-describedby for helper text", () => {
      const { container } = renderWithTheme(
        <Select helperText="Helper text" label="Helper">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("aria-describedby");
      const helperId = select?.getAttribute("aria-describedby");
      const helperElement = container.querySelector(`#${helperId}`);
      expect(helperElement).toBeInTheDocument();
    });

    it("should prioritize error message over helper text in aria-describedby", () => {
      const { container } = renderWithTheme(
        <Select
          error
          errorMessage="Error"
          helperText="Helper"
          label="Priority"
        >
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      const describedBy = select?.getAttribute("aria-describedby");
      expect(describedBy).toContain("-error");
      expect(describedBy).not.toContain("-helper");
    });

    it("should have proper ARIA attributes when required", () => {
      const { container } = renderWithTheme(
        <Select required label="Required">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("aria-required", "true");
    });

    it("should have proper label association", () => {
      const { container } = renderWithTheme(
        <Select label="Labeled select">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      const label = container.querySelector("label");
      const selectId = select?.getAttribute("id");
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", selectId || "");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("data-mcp-validated", "true");
      expect(select).toHaveAttribute("data-constitution-compliant", "select-shared");
    });

    it("should support keyboard navigation", () => {
      const { container } = renderWithTheme(
        <Select label="Keyboard Test">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select).toHaveClass("focus:ring-ring");
      expect(select).toHaveClass("focus:ring-2");
    });
  });

  describe("Interactions", () => {
    it("should handle change events", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Select onChange={handleChange} label="Changeable">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const select = container.querySelector("select") as HTMLSelectElement;
      await user.selectOptions(select, "2");
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should handle change events via label click", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Select onChange={handleChange} label="Label Click">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const label = container.querySelector("label");
      const select = container.querySelector("select") as HTMLSelectElement;
      await user.click(label!);
      select.focus();
      await user.selectOptions(select, "2");
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should update value on selection", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Select label="Select">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select.value).toBe("1");
      await user.selectOptions(select, "2");
      expect(select.value).toBe("2");
    });

    it("should not change value when disabled", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Select disabled value="1" label="Disabled">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </Select>
      );
      const select = container.querySelector("select") as HTMLSelectElement;
      const initialValue = select.value;
      await user.selectOptions(select, "2");
      expect(select.value).toBe(initialValue);
      expect(select).toBeDisabled();
    });

    it("should have focus styles", () => {
      const { container } = renderWithTheme(
        <Select label="Focus">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("focus:ring-ring");
      expect(select).toHaveClass("focus:ring-2");
      expect(select).toHaveClass("focus:ring-offset-1");
      expect(select).toHaveClass("focus:outline-none");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Select label="Default">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("bg-bg-elevated");
      expect(select).toHaveClass("border", "border-border");
    });

    it("should apply filled variant styles", () => {
      const { container } = renderWithTheme(
        <Select variant="filled" label="Filled">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("bg-bg-muted");
      expect(select).toHaveClass("border-0");
    });

    it("should apply outlined variant styles", () => {
      const { container } = renderWithTheme(
        <Select variant="outlined" label="Outlined">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("bg-transparent");
      expect(select).toHaveClass("border-2", "border-border");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Select size="sm" label="Small">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("h-9");
      expect(select).toHaveClass("px-3", "py-1.5");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Select size="md" label="Medium">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("h-11");
      expect(select).toHaveClass("px-4", "py-2");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Select size="lg" label="Large">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("h-13");
      expect(select).toHaveClass("px-5", "py-2.5");
    });
  });

  describe("States", () => {
    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <Select disabled label="Disabled">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(select).toBeDisabled();
    });

    it("should apply error state styles", () => {
      const { container } = renderWithTheme(
        <Select error errorMessage="Error" label="Error">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("border-[var(--color-danger-soft)]");
    });

    it("should show error message when error is true", () => {
      const { container } = renderWithTheme(
        <Select
          error
          errorMessage="This field is required"
          label="Error"
        >
          <option value="1">Option 1</option>
        </Select>
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("This field is required");
    });

    it("should show helper text when provided", () => {
      const { container } = renderWithTheme(
        <Select helperText="Helper text" label="Helper">
          <option value="1">Option 1</option>
        </Select>
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
      expect(helperText?.textContent).toContain("Helper text");
      expect(helperText).toHaveClass("text-fg-muted");
    });

    it("should not show helper text when error is true", () => {
      const { container } = renderWithTheme(
        <Select
          error
          errorMessage="Error"
          helperText="Helper text"
          label="Error"
        >
          <option value="1">Option 1</option>
        </Select>
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).not.toBeInTheDocument();
    });

    it("should show error message without label", () => {
      const { container } = renderWithTheme(
        <Select error errorMessage="Error without label">
          <option value="1">Option 1</option>
        </Select>
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("Error without label");
    });

    it("should show required indicator", () => {
      const { container } = renderWithTheme(
        <Select required label="Required">
          <option value="1">Option 1</option>
        </Select>
      );
      const label = container.querySelector("label");
      const requiredIndicator = label?.querySelector('span');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator?.textContent).toBe("*");
      expect(requiredIndicator).toHaveClass("text-[var(--color-danger-soft)]");
    });

    it("should not show required indicator when required is false", () => {
      const { container } = renderWithTheme(
        <Select required={false} label="Not Required">
          <option value="1">Option 1</option>
        </Select>
      );
      const label = container.querySelector("label");
      const requiredIndicator = label?.querySelector('span');
      expect(requiredIndicator).not.toBeInTheDocument();
    });
  });

  describe("Base Styles", () => {
    it("should have base width styles", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("w-full");
    });

    it("should have transition styles", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("transition-all", "duration-200");
    });

    it("should have cursor pointer", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("cursor-pointer");
    });

    it("should have appearance-none", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("appearance-none");
    });

    it("should have padding for chevron icon", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("pr-10");
    });

    it("should have MCP shared component marker", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("mcp-shared-component");
    });
  });

  describe("Props", () => {
    it("should accept id prop", () => {
      const { container } = renderWithTheme(
        <Select id="custom-id" label="Custom ID">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("id", "custom-id");
    });

    it("should generate unique id when not provided", () => {
      const { container } = renderWithTheme(
        <Select label="Auto ID">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("id");
      expect(select?.getAttribute("id")).toMatch(/^select-/);
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(
        <Select ref={ref}>
          <option value="1">Option 1</option>
        </Select>
      );
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML select attributes", () => {
      const { container } = renderWithTheme(
        <Select
          id="test-select"
          name="test"
          multiple
          label="HTML Attributes"
        >
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("id", "test-select");
      expect(select).toHaveAttribute("name", "test");
      expect(select).toHaveAttribute("multiple");
    });

    it("should render children options", () => {
      const { container } = renderWithTheme(
        <Select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </Select>
      );
      const options = container.querySelectorAll("option");
      expect(options).toHaveLength(3);
      expect(options[0]?.textContent).toBe("Option 1");
      expect(options[1]?.textContent).toBe("Option 2");
      expect(options[2]?.textContent).toBe("Option 3");
    });

    it("should accept wrapperClassName", () => {
      const { container } = renderWithTheme(
        <Select wrapperClassName="custom-wrapper">
          <option value="1">Option 1</option>
        </Select>
      );
      const wrapper = container.querySelector('div:not(.test-theme-wrapper)');
      expect(wrapper).toHaveClass("custom-wrapper");
    });

    it("should use default variant when not specified", () => {
      const { container } = renderWithTheme(
        <Select label="Default">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("bg-bg-elevated");
    });

    it("should use default size when not specified", () => {
      const { container } = renderWithTheme(
        <Select label="Default">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("h-11"); // md size
    });

    it("should use default required (false) when not specified", () => {
      const { container } = renderWithTheme(
        <Select label="Default">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("aria-required", "false");
    });

    it("should use default disabled (false) when not specified", () => {
      const { container } = renderWithTheme(
        <Select label="Default">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select") as HTMLSelectElement;
      expect(select).not.toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<Select label="Empty" />);
      const select = container.querySelector("select");
      expect(select).toBeInTheDocument();
    });

    it("should handle error without errorMessage", () => {
      const { container } = renderWithTheme(
        <Select error label="Error no message">
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveAttribute("aria-invalid", "true");
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it("should handle placeholder without options", () => {
      const { container } = renderWithTheme(
        <Select placeholder="Select">
        </Select>
      );
      const placeholder = container.querySelector('option[value=""]');
      expect(placeholder).toBeInTheDocument();
    });

    it("should handle combined props", () => {
      const { container } = renderWithTheme(
        <Select
          variant="outlined"
          size="lg"
          label="Combined"
          required
          error
          errorMessage="Error"
          helperText="Helper"
          placeholder="Select"
          disabled
          className="custom"
          wrapperClassName="custom-wrapper"
        >
          <option value="1">Option 1</option>
        </Select>
      );
      const select = container.querySelector("select");
      expect(select).toHaveClass("h-13");
      expect(select).toHaveClass("custom");
      expect(select).toBeDisabled();
    });

    it("should handle label with disabled state", () => {
      const { container } = renderWithTheme(
        <Select disabled label="Disabled Label">
          <option value="1">Option 1</option>
        </Select>
      );
      const label = container.querySelector("label");
      expect(label).toHaveClass("opacity-50");
    });
  });
});

