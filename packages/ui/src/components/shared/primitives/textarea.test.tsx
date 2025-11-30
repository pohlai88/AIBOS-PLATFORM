/**
 * Textarea Component Tests
 *
 * Tests for the Textarea primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  describe("Rendering", () => {
    it("should render textarea element", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
    });

    it("should render textarea with label", () => {
      const { container } = renderWithTheme(
        <Textarea label="Description" />
      );
      const textarea = container.querySelector("textarea");
      const label = container.querySelector("label");
      expect(textarea).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Description");
    });

    it("should render textarea with variant", () => {
      const { container } = renderWithTheme(
        <Textarea variant="filled" label="Filled" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass("bg-bg-muted");
    });

    it("should render textarea with size", () => {
      const { container } = renderWithTheme(
        <Textarea size="lg" label="Large" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass("min-h-[160px]");
    });

    it("should render textarea with placeholder", () => {
      const { container } = renderWithTheme(
        <Textarea placeholder="Enter text..." />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("placeholder", "Enter text...");
    });

    it("should render textarea with testId", () => {
      const { container } = renderWithTheme(
        <Textarea testId="test-textarea" />
      );
      const textarea = container.querySelector('[data-testid="test-textarea"]');
      expect(textarea).toBeInTheDocument();
    });

    it("should render textarea without label", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      const label = container.querySelector("label");
      expect(textarea).toBeInTheDocument();
      expect(label).not.toBeInTheDocument();
    });

    it("should render textarea with resize control", () => {
      const { container } = renderWithTheme(
        <Textarea resize="none" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("resize-none");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Textarea label="Accessible textarea" />
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes when disabled", () => {
      const { container } = renderWithTheme(
        <Textarea disabled label="Disabled" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toBeDisabled();
    });

    it("should have proper ARIA attributes when error", () => {
      const { container } = renderWithTheme(
        <Textarea error errorMessage="Error message" label="Error textarea" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
      expect(textarea).toHaveAttribute("aria-describedby");
      const errorId = textarea?.getAttribute("aria-describedby");
      const errorElement = container.querySelector(`#${errorId}`);
      expect(errorElement).toBeInTheDocument();
    });

    it("should have aria-describedby for helper text", () => {
      const { container } = renderWithTheme(
        <Textarea helperText="Helper text" label="Helper" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("aria-describedby");
      const helperId = textarea?.getAttribute("aria-describedby");
      const helperElement = container.querySelector(`#${helperId}`);
      expect(helperElement).toBeInTheDocument();
    });

    it("should prioritize error message over helper text in aria-describedby", () => {
      const { container } = renderWithTheme(
        <Textarea
          error
          errorMessage="Error"
          helperText="Helper"
          label="Priority"
        />
      );
      const textarea = container.querySelector("textarea");
      const describedBy = textarea?.getAttribute("aria-describedby");
      expect(describedBy).toContain("-error");
      expect(describedBy).not.toContain("-helper");
    });

    it("should require label for accessibility", async () => {
      // Textarea without label should have accessibility violation
      const { container } = renderWithTheme(<Textarea />);
      const results = await axe(container);
      // This is expected - form elements need labels for accessibility
      expect(results.violations.length).toBeGreaterThan(0);
    });

    it("should have proper ARIA attributes when required", () => {
      const { container } = renderWithTheme(
        <Textarea required label="Required" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("aria-required", "true");
    });

    it("should have proper label association", () => {
      const { container } = renderWithTheme(
        <Textarea label="Labeled textarea" />
      );
      const textarea = container.querySelector("textarea");
      const label = container.querySelector("label");
      const textareaId = textarea?.getAttribute("id");
      expect(textareaId).toBeTruthy();
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", textareaId || "");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("data-mcp-validated", "true");
      expect(textarea).toHaveAttribute("data-constitution-compliant", "textarea-shared");
    });

    it("should support keyboard navigation", () => {
      const { container } = renderWithTheme(
        <Textarea label="Keyboard Test" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea).toHaveClass("focus:ring-ring");
      expect(textarea).toHaveClass("focus:ring-2");
    });
  });

  describe("Interactions", () => {
    it("should handle change events", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Textarea onChange={handleChange} label="Changeable" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      await user.type(textarea, "New text");
      expect(handleChange).toHaveBeenCalled();
    });

    it("should handle input events", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Textarea label="Input" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      await user.type(textarea, "Typing");
      expect(textarea.value).toBe("Typing");
    });

    it("should handle focus and blur events", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Textarea label="Focus" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      await user.click(textarea);
      expect(textarea).toHaveFocus();
      await user.tab();
      expect(textarea).not.toHaveFocus();
    });

    it("should not allow input when disabled", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Textarea disabled value="Initial" label="Disabled" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      const initialValue = textarea.value;
      await user.type(textarea, "New");
      expect(textarea.value).toBe(initialValue);
      expect(textarea).toBeDisabled();
    });

    it("should have focus styles", () => {
      const { container } = renderWithTheme(
        <Textarea label="Focus">
        </Textarea>
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("focus:ring-ring");
      expect(textarea).toHaveClass("focus:ring-2");
      expect(textarea).toHaveClass("focus:ring-offset-1");
      expect(textarea).toHaveClass("focus:outline-none");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Textarea label="Default" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("bg-bg-elevated");
      expect(textarea).toHaveClass("border", "border-border");
    });

    it("should apply filled variant styles", () => {
      const { container } = renderWithTheme(
        <Textarea variant="filled" label="Filled" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("bg-bg-muted");
      expect(textarea).toHaveClass("border-0");
    });

    it("should apply outlined variant styles", () => {
      const { container } = renderWithTheme(
        <Textarea variant="outlined" label="Outlined" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("bg-transparent");
      expect(textarea).toHaveClass("border-2", "border-border");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Textarea size="sm" label="Small" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("min-h-[80px]");
      expect(textarea).toHaveClass("px-3", "py-1.5");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Textarea size="md" label="Medium" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("min-h-[120px]");
      expect(textarea).toHaveClass("px-4", "py-2");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Textarea size="lg" label="Large" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("min-h-[160px]");
      expect(textarea).toHaveClass("px-5", "py-2.5");
    });
  });

  describe("Resize", () => {
    it("should apply none resize", () => {
      const { container } = renderWithTheme(<Textarea resize="none" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("resize-none");
    });

    it("should apply vertical resize", () => {
      const { container } = renderWithTheme(<Textarea resize="vertical" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("resize-y");
    });

    it("should apply horizontal resize", () => {
      const { container } = renderWithTheme(<Textarea resize="horizontal" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("resize-x");
    });

    it("should apply both resize", () => {
      const { container } = renderWithTheme(<Textarea resize="both" />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("resize");
    });
  });

  describe("States", () => {
    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <Textarea disabled label="Disabled" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(textarea).toBeDisabled();
    });

    it("should apply error state styles", () => {
      const { container } = renderWithTheme(
        <Textarea error errorMessage="Error" label="Error" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("border-[var(--color-danger-soft)]");
    });

    it("should show error message when error is true", () => {
      const { container } = renderWithTheme(
        <Textarea
          error
          errorMessage="This field is required"
          label="Error"
        />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("This field is required");
    });

    it("should show helper text when provided", () => {
      const { container } = renderWithTheme(
        <Textarea helperText="Helper text" label="Helper" />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).toBeInTheDocument();
      expect(helperText?.textContent).toContain("Helper text");
      expect(helperText).toHaveClass("text-fg-muted");
    });

    it("should not show helper text when error is true", () => {
      const { container } = renderWithTheme(
        <Textarea
          error
          errorMessage="Error"
          helperText="Helper text"
          label="Error"
        />
      );
      const helperText = container.querySelector('span[id$="-helper"]');
      expect(helperText).not.toBeInTheDocument();
    });

    it("should show error message without label", () => {
      const { container } = renderWithTheme(
        <Textarea error errorMessage="Error without label" />
      );
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage?.textContent).toContain("Error without label");
    });

    it("should show required indicator", () => {
      const { container } = renderWithTheme(
        <Textarea required label="Required" />
      );
      const label = container.querySelector("label");
      const requiredIndicator = label?.querySelector('span');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator?.textContent).toBe("*");
      expect(requiredIndicator).toHaveClass("text-[var(--color-danger-soft)]");
    });

    it("should not show required indicator when required is false", () => {
      const { container } = renderWithTheme(
        <Textarea required={false} label="Not Required" />
      );
      const label = container.querySelector("label");
      const requiredIndicator = label?.querySelector('span');
      expect(requiredIndicator).not.toBeInTheDocument();
    });

    it("should show character count when showCharCount is true", () => {
      const { container } = renderWithTheme(
        <Textarea showCharCount value="Test" />
      );
      const charCount = container.querySelector('span.text-fg-muted');
      expect(charCount).toBeInTheDocument();
      expect(charCount?.textContent).toContain("4");
    });

    it("should show character count with maxLength", () => {
      const { container } = renderWithTheme(
        <Textarea maxLength={100} value="Test" showCharCount />
      );
      const charCount = container.querySelector('span.text-fg-muted');
      expect(charCount).toBeInTheDocument();
      expect(charCount?.textContent).toContain("4 / 100");
    });

    it("should show character count when maxLength is provided without showCharCount", () => {
      const { container } = renderWithTheme(
        <Textarea maxLength={100} value="Test" />
      );
      const charCount = container.querySelector('span.text-fg-muted');
      expect(charCount).toBeInTheDocument();
      expect(charCount?.textContent).toContain("4 / 100");
    });

    it("should update character count when value changes", () => {
      const { container, rerender } = renderWithTheme(
        <Textarea value="Test" showCharCount />
      );
      let charCount = container.querySelector('span.text-fg-muted');
      expect(charCount?.textContent).toContain("4");

      rerender(<Textarea value="Longer text" showCharCount />);
      charCount = container.querySelector('span.text-fg-muted');
      expect(charCount?.textContent).toContain("11");
    });

    it("should show character count format correctly with maxLength", () => {
      const { container } = renderWithTheme(
        <Textarea maxLength={50} value="Hello" showCharCount />
      );
      const charCount = container.querySelector('span.text-fg-muted');
      expect(charCount?.textContent).toBe("5 / 50");
    });
  });

  describe("Base Styles", () => {
    it("should have base width styles", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("w-full");
    });

    it("should have transition styles", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("transition-all", "duration-200");
    });

    it("should have base typography styles", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("text-[15px]", "leading-relaxed");
    });

    it("should have placeholder styling", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("placeholder:text-fg-muted");
    });

    it("should have MCP shared component marker", () => {
      const { container } = renderWithTheme(<Textarea />);
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("mcp-shared-component");
    });
  });

  describe("Props", () => {
    it("should accept id prop", () => {
      const { container } = renderWithTheme(
        <Textarea id="custom-id" label="Custom ID" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("id", "custom-id");
    });

    it("should generate unique id when not provided", () => {
      const { container } = renderWithTheme(
        <Textarea label="Auto ID" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("id");
      expect(textarea?.getAttribute("id")).toMatch(/^textarea-/);
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Textarea ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML textarea attributes", () => {
      const { container } = renderWithTheme(
        <Textarea
          id="test-textarea"
          name="test"
          rows={5}
          cols={50}
          label="HTML Attributes"
        />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("id", "test-textarea");
      expect(textarea).toHaveAttribute("name", "test");
      expect(textarea).toHaveAttribute("rows", "5");
      expect(textarea).toHaveAttribute("cols", "50");
    });

    it("should accept value prop", () => {
      const { container } = renderWithTheme(
        <Textarea value="Controlled value" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Controlled value");
    });

    it("should accept defaultValue prop", () => {
      const { container } = renderWithTheme(
        <Textarea defaultValue="Default value" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Default value");
    });

    it("should accept maxLength prop", () => {
      const { container } = renderWithTheme(
        <Textarea maxLength={100} />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("maxLength", "100");
    });

    it("should accept wrapperClassName", () => {
      const { container } = renderWithTheme(
        <Textarea wrapperClassName="custom-wrapper" />
      );
      const wrapper = container.querySelector('div:not(.test-theme-wrapper)');
      expect(wrapper).toHaveClass("custom-wrapper");
    });

    it("should use default variant when not specified", () => {
      const { container } = renderWithTheme(
        <Textarea label="Default" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("bg-bg-elevated");
    });

    it("should use default size when not specified", () => {
      const { container } = renderWithTheme(
        <Textarea label="Default" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("min-h-[120px]"); // md size
    });

    it("should use default resize (vertical) when not specified", () => {
      const { container } = renderWithTheme(
        <Textarea label="Default" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("resize-y");
    });

    it("should use default required (false) when not specified", () => {
      const { container } = renderWithTheme(
        <Textarea label="Default" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("aria-required", "false");
    });

    it("should use default disabled (false) when not specified", () => {
      const { container } = renderWithTheme(
        <Textarea label="Default" />
      );
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea).not.toBeDisabled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty value", () => {
      const { container } = renderWithTheme(<Textarea value="" />);
      const textarea = container.querySelector("textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("");
    });

    it("should handle error without errorMessage", () => {
      const { container } = renderWithTheme(
        <Textarea error label="Error no message" />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveAttribute("aria-invalid", "true");
      const errorMessage = container.querySelector('[role="alert"]');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it("should calculate character count from defaultValue", () => {
      const { container } = renderWithTheme(
        <Textarea defaultValue="Test value" showCharCount />
      );
      const charCount = container.querySelector('span.text-fg-muted');
      expect(charCount?.textContent).toContain("10");
    });

    it("should handle character count with empty value", () => {
      const { container } = renderWithTheme(
        <Textarea value="" showCharCount />
      );
      const charCount = container.querySelector('span.text-fg-muted');
      expect(charCount?.textContent).toContain("0");
    });

    it("should handle combined props", () => {
      const { container } = renderWithTheme(
        <Textarea
          variant="outlined"
          size="lg"
          resize="none"
          label="Combined"
          required
          error
          errorMessage="Error"
          helperText="Helper"
          maxLength={200}
          showCharCount
          value="Test"
          disabled
          className="custom"
          wrapperClassName="custom-wrapper"
        />
      );
      const textarea = container.querySelector("textarea");
      expect(textarea).toHaveClass("min-h-[160px]");
      expect(textarea).toHaveClass("resize-none");
      expect(textarea).toHaveClass("custom");
      expect(textarea).toBeDisabled();
    });

    it("should handle label with disabled state", () => {
      const { container } = renderWithTheme(
        <Textarea disabled label="Disabled Label" />
      );
      const label = container.querySelector("label");
      expect(label).toHaveClass("opacity-50");
    });
  });
});

