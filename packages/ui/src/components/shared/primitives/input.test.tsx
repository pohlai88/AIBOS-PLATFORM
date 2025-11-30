/**
 * Input Component Tests
 *
 * Tests for the Input primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";

describe("Input", () => {
  describe("Rendering", () => {
    it("should render input element", () => {
      const { container } = renderWithTheme(<Input />);
      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
    });

    it("should render input with placeholder", () => {
      const { container } = renderWithTheme(
        <Input placeholder="Enter text" />
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("placeholder", "Enter text");
    });

    it("should render input with value", () => {
      const { container } = renderWithTheme(
        <Input value="Test value" onChange={() => {}} />
      );
      const input = container.querySelector("input");
      expect(input).toHaveValue("Test value");
    });

    it("should render input with custom className", () => {
      const { container } = renderWithTheme(
        <Input className="custom-class" />
      );
      const input = container.querySelector("input");
      expect(input).toHaveClass("custom-class");
    });

    it("should render input with id", () => {
      const { container } = renderWithTheme(<Input id="test-input" />);
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("id", "test-input");
    });

    it("should render input with type", () => {
      const { container } = renderWithTheme(<Input type="email" />);
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("type", "email");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Input aria-label="Test input" />);
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes when error", () => {
      const { container } = renderWithTheme(
        <Input error aria-label="Test input" />
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have proper ARIA attributes when disabled", () => {
      const { container } = renderWithTheme(
        <Input disabled aria-label="Test input" />
      );
      const input = container.querySelector("input");
      expect(input).toBeDisabled();
    });

    it("should link helper text with aria-describedby", () => {
      const { container } = renderWithTheme(
        <Input id="test-input" helperText="Helper text" />
      );
      const input = container.querySelector("input");
      const helper = container.querySelector("#test-input-helper");
      expect(input).toHaveAttribute("aria-describedby", "test-input-helper");
      expect(helper).toBeInTheDocument();
      expect(helper?.textContent).toBe("Helper text");
    });

    it("should support aria-label", () => {
      const { container } = renderWithTheme(
        <Input aria-label="Email address" />
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("aria-label", "Email address");
    });

    it("should support aria-describedby with custom value", () => {
      const { container } = renderWithTheme(
        <Input id="test-input" aria-describedby="custom-id" helperText="Helper" />
      );
      const input = container.querySelector("input");
      expect(input?.getAttribute("aria-describedby")).toContain("custom-id");
      expect(input?.getAttribute("aria-describedby")).toContain("test-input-helper");
    });
  });

  describe("Interactions", () => {
    it("should handle change events", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Input onChange={handleChange} />
      );
      const input = container.querySelector("input") as HTMLInputElement;
      await user.type(input, "test");
      expect(handleChange).toHaveBeenCalled();
    });

    it("should handle focus events", () => {
      const handleFocus = vi.fn();
      const { container } = renderWithTheme(<Input onFocus={handleFocus} />);
      const input = container.querySelector("input");
      input?.focus();
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("should handle blur events", () => {
      const handleBlur = vi.fn();
      const { container } = renderWithTheme(<Input onBlur={handleBlur} />);
      const input = container.querySelector("input");
      input?.focus();
      input?.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it("should handle input events", () => {
      const handleInput = vi.fn();
      const { container } = renderWithTheme(<Input onInput={handleInput} />);
      const input = container.querySelector("input");
      const event = new Event("input", { bubbles: true });
      input?.dispatchEvent(event);
      expect(handleInput).toHaveBeenCalled();
    });

    it("should not handle events when disabled", () => {
      const handleChange = vi.fn();
      const { container } = renderWithTheme(
        <Input onChange={handleChange} disabled />
      );
      const input = container.querySelector("input");
      expect(input).toBeDisabled();
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Input />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("bg-bg-elevated");
      expect(input).toHaveClass("border", "border-border");
    });

    it("should apply error variant styles", () => {
      const { container } = renderWithTheme(<Input error />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("border-[var(--color-danger-soft)]");
    });

    it("should apply error variant when error prop is true", () => {
      const { container } = renderWithTheme(<Input variant="default" error />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("border-[var(--color-danger-soft)]");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Input size="sm" />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("py-1.5");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(<Input size="md" />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("py-2");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Input size="lg" />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("py-2.5");
    });
  });

  describe("States", () => {
    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(<Input disabled />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("opacity-50", "cursor-not-allowed");
      expect(input).toBeDisabled();
    });

    it("should render helper text", () => {
      const { container } = renderWithTheme(
        <Input helperText="This is helper text" />
      );
      const helper = container.querySelector("p");
      expect(helper).toBeInTheDocument();
      expect(helper?.textContent).toBe("This is helper text");
    });

    it("should render error helper text with error styling", () => {
      const { container } = renderWithTheme(
        <Input error helperText="This is an error" />
      );
      const helper = container.querySelector("p");
      expect(helper).toBeInTheDocument();
      expect(helper).toHaveClass("text-[var(--color-danger-soft)]");
      expect(helper).toHaveAttribute("role", "alert");
    });

    it("should render helper text with muted color when not error", () => {
      const { container } = renderWithTheme(
        <Input helperText="This is helper text" />
      );
      const helper = container.querySelector("p");
      expect(helper).toHaveClass("text-fg-muted");
      expect(helper).not.toHaveAttribute("role", "alert");
    });

    it("should not render helper text when not provided", () => {
      const { container } = renderWithTheme(<Input />);
      const helper = container.querySelector("p");
      expect(helper).not.toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should accept all HTML input attributes", () => {
      const { container } = renderWithTheme(
        <Input
          name="test-input"
          type="text"
          required
          minLength={5}
          maxLength={10}
        />
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("name", "test-input");
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("minLength", "5");
      expect(input).toHaveAttribute("maxLength", "10");
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Input ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });

    it("should default to variant='default'", () => {
      const { container } = renderWithTheme(<Input />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("bg-bg-elevated");
      expect(input).not.toHaveClass("border-[var(--color-danger-soft)]");
    });

    it("should default to size='md'", () => {
      const { container } = renderWithTheme(<Input />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("py-2");
    });
  });

  describe("Helper Text Integration", () => {
    it("should generate unique helper ID from input id", () => {
      const { container } = renderWithTheme(
        <Input id="email-input" helperText="Enter your email" />
      );
      const helper = container.querySelector("#email-input-helper");
      expect(helper).toBeInTheDocument();
      expect(helper?.textContent).toBe("Enter your email");
    });

    it("should not generate helper ID when id is not provided", () => {
      const { container } = renderWithTheme(
        <Input helperText="Helper text" />
      );
      const input = container.querySelector("input");
      const describedBy = input?.getAttribute("aria-describedby");
      // When id is not provided, helper ID is not generated, so aria-describedby should be null or not contain -helper
      expect(describedBy === null || !describedBy.includes("-helper")).toBe(true);
    });

    it("should combine custom aria-describedby with helper ID", () => {
      const { container } = renderWithTheme(
        <Input
          id="test-input"
          aria-describedby="custom-id"
          helperText="Helper text"
        />
      );
      const input = container.querySelector("input");
      const describedBy = input?.getAttribute("aria-describedby");
      expect(describedBy).toContain("custom-id");
      expect(describedBy).toContain("test-input-helper");
    });
  });

  describe("Focus States", () => {
    it("should have focus-visible styles", () => {
      const { container } = renderWithTheme(<Input />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("focus-visible:ring-2");
      expect(input).toHaveClass("focus-visible:ring-ring");
      expect(input).toHaveClass("focus:outline-none");
    });

    it("should have error focus styles when error", () => {
      const { container } = renderWithTheme(<Input error />);
      const input = container.querySelector("input");
      expect(input).toHaveClass("focus-visible:ring-[var(--color-danger-soft)]");
      expect(input).toHaveClass("focus-visible:border-[var(--color-danger-soft)]");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty value", () => {
      const { container } = renderWithTheme(
        <Input value="" onChange={() => {}} />
      );
      const input = container.querySelector("input");
      expect(input).toHaveValue("");
    });

    it("should handle undefined value", () => {
      const { container } = renderWithTheme(<Input value={undefined} />);
      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
    });

    it("should handle controlled input", () => {
      const { container } = renderWithTheme(
        <Input value="controlled" onChange={() => {}} />
      );
      const input = container.querySelector("input");
      expect(input).toHaveValue("controlled");
    });

    it("should handle uncontrolled input", () => {
      const { container } = renderWithTheme(<Input defaultValue="uncontrolled" />);
      const input = container.querySelector("input");
      expect(input).toHaveValue("uncontrolled");
    });

    it("should handle readOnly state", () => {
      const { container } = renderWithTheme(<Input readOnly value="readonly" />);
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("readOnly");
    });
  });
});

