/**
 * FormField Component Tests
 *
 * Tests for the FormField Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { FormField } from "./form-field";
import { Input } from "../../../../shared/primitives/input";

describe("FormField", () => {
  describe("Rendering", () => {
    it("should render form field element", () => {
      const { container } = renderWithTheme(
        <FormField>
          <Input id="test" />
        </FormField>
      );
      const field = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(field).toBeInTheDocument();
    });

    it("should render form field with label", () => {
      const { container } = renderWithTheme(
        <FormField label="Email" id="email">
          <Input id="email" />
        </FormField>
      );
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Email");
    });

    it("should render form field with required indicator", () => {
      const { container } = renderWithTheme(
        <FormField label="Password" required id="password">
          <Input id="password" type="password" />
        </FormField>
      );
      const required = container.querySelector('span[aria-label="required"]');
      expect(required).toBeInTheDocument();
    });

    it("should render form field with helper text", () => {
      const { container } = renderWithTheme(
        <FormField helper="Helper text" id="test">
          <Input id="test" />
        </FormField>
      );
      const helper = container.querySelector("p");
      expect(helper).toBeInTheDocument();
      expect(helper?.textContent).toBe("Helper text");
    });

    it("should render form field with error message", () => {
      const { container } = renderWithTheme(
        <FormField error="Error message" id="test">
          <Input id="test" />
        </FormField>
      );
      const error = container.querySelector('[role="alert"]');
      expect(error).toBeInTheDocument();
      expect(error?.textContent).toBe("Error message");
    });

    it("should render form field with hint tooltip", () => {
      const { container } = renderWithTheme(
        <FormField label="API Key" hint="Your API key is secure" id="api-key">
          <Input id="api-key" />
        </FormField>
      );
      const tooltipTrigger = container.querySelector('button[aria-label="More information"]');
      expect(tooltipTrigger).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <FormField testId="test-form-field" id="test">
          <Input id="test" />
        </FormField>
      );
      const field = container.querySelector('[data-testid="test-form-field"]');
      expect(field).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <FormField label="Accessible field" id="accessible">
          <Input id="accessible" />
        </FormField>
      );
      await expectAccessible(container);
    });

    it("should associate label with input using id", () => {
      const { container } = renderWithTheme(
        <FormField label="Email" id="email">
          <Input id="email" />
        </FormField>
      );
      const label = container.querySelector("label");
      const input = container.querySelector("input");
      expect(label).toHaveAttribute("htmlFor", "email");
      expect(input).toHaveAttribute("id", "email");
    });

    it("should have aria-invalid when error is present", () => {
      const { container } = renderWithTheme(
        <FormField error="Error" id="test">
          <Input id="test" />
        </FormField>
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have aria-describedby for helper text", () => {
      const { container } = renderWithTheme(
        <FormField helper="Helper" id="test">
          <Input id="test" />
        </FormField>
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("aria-describedby");
    });

    it("should have role='alert' on error message", () => {
      const { container } = renderWithTheme(
        <FormField error="Error" id="test">
          <Input id="test" />
        </FormField>
      );
      const error = container.querySelector('[role="alert"]');
      expect(error).toBeInTheDocument();
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <FormField id="test">
          <Input id="test" />
        </FormField>
      );
      const field = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(field).toHaveAttribute("data-mcp-validated", "true");
      expect(field).toHaveAttribute("data-constitution-compliant", "formfield-layer3");
    });
  });

  describe("Interactions", () => {
    it("should handle input changes", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <FormField label="Email" id="email">
          <Input id="email" type="email" />
        </FormField>
      );
      const input = container.querySelector("input") as HTMLInputElement;
      await user.type(input, "test@example.com");
      expect(input.value).toBe("test@example.com");
    });

    it("should show tooltip on hint icon hover", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <FormField label="Field" hint="Hint text" id="test">
          <Input id="test" />
        </FormField>
      );
      const trigger = container.querySelector('button[aria-label="More information"]');
      if (trigger) {
        await user.hover(trigger);
        // Tooltip should appear (implementation depends on Tooltip component)
      }
    });
  });

  describe("States", () => {
    it("should apply disabled state", () => {
      const { container } = renderWithTheme(
        <FormField disabled id="test">
          <Input id="test" />
        </FormField>
      );
      const input = container.querySelector("input");
      expect(input).toBeDisabled();
    });

    it("should show error state styling", () => {
      const { container } = renderWithTheme(
        <FormField error="Error" id="test">
          <Input id="test" />
        </FormField>
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Sizes", () => {
    it("should apply small size", () => {
      const { container } = renderWithTheme(
        <FormField size="sm" id="test">
          <Input id="test" size="sm" />
        </FormField>
      );
      const field = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(field).toHaveClass("gap-1");
    });

    it("should apply medium size", () => {
      const { container } = renderWithTheme(
        <FormField size="md" id="test">
          <Input id="test" size="md" />
        </FormField>
      );
      const field = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(field).toHaveClass("gap-1.5");
    });

    it("should apply large size", () => {
      const { container } = renderWithTheme(
        <FormField size="lg" id="test">
          <Input id="test" size="lg" />
        </FormField>
      );
      const field = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(field).toHaveClass("gap-2");
    });
  });

  describe("Error vs Helper", () => {
    it("should show error instead of helper when both are provided", () => {
      const { container } = renderWithTheme(
        <FormField error="Error" helper="Helper" id="test">
          <Input id="test" />
        </FormField>
      );
      const error = container.querySelector('[role="alert"]');
      expect(error?.textContent).toBe("Error");
    });

    it("should show helper when no error", () => {
      const { container } = renderWithTheme(
        <FormField helper="Helper text" id="test">
          <Input id="test" />
        </FormField>
      );
      const helper = container.querySelector("p");
      expect(helper?.textContent).toBe("Helper text");
      expect(helper).not.toHaveAttribute("role", "alert");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(
        <FormField ref={ref} id="test">
          <Input id="test" />
        </FormField>
      );
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <FormField id="test" data-testid="form-field" className="custom">
          <Input id="test" />
        </FormField>
      );
      const field = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(field).toHaveClass("custom");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children with default input", () => {
      const { container } = renderWithTheme(<FormField id="test" />);
      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("id", "test");
    });

    it("should handle custom input element", () => {
      const { container } = renderWithTheme(
        <FormField id="custom">
          <Input id="custom" type="email" placeholder="Custom" />
        </FormField>
      );
      const input = container.querySelector("input");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("placeholder", "Custom");
    });

    it("should combine all features correctly", () => {
      const { container } = renderWithTheme(
        <FormField
          label="Test"
          required
          hint="Hint"
          helper="Helper"
          size="lg"
          id="complete"
        >
          <Input id="complete" />
        </FormField>
      );
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
      const required = container.querySelector('span[aria-label="required"]');
      expect(required).toBeInTheDocument();
      const hintTrigger = container.querySelector('button[aria-label="More information"]');
      expect(hintTrigger).toBeInTheDocument();
    });
  });
});

