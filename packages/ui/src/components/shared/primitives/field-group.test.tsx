/**
 * FieldGroup Component Tests
 *
 * Tests for the FieldGroup primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { FieldGroup } from "./field-group";

// Helper function to get FieldGroup element (excludes test-theme-wrapper)
function getFieldGroup(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-component")
  );
}

describe("FieldGroup", () => {
  describe("Rendering", () => {
    it("should render field group element", () => {
      const { container } = renderWithTheme(
        <FieldGroup>
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toBeInTheDocument();
    });

    it("should render field group with label", () => {
      const { container } = renderWithTheme(
        <FieldGroup label="Email" htmlFor="email">
          <input id="email" type="email" />
        </FieldGroup>
      );
      const label = container.querySelector("label");
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Email");
    });

    it("should render field group with helper text", () => {
      const { container } = renderWithTheme(
        <FieldGroup helper="Helper text">
          <input type="text" />
        </FieldGroup>
      );
      const helper = container.querySelector("p");
      expect(helper).toBeInTheDocument();
      expect(helper?.textContent).toBe("Helper text");
    });

    it("should render field group with error message", () => {
      const { container } = renderWithTheme(
        <FieldGroup error="Error message">
          <input type="text" />
        </FieldGroup>
      );
      const error = container.querySelector("p");
      expect(error).toBeInTheDocument();
      expect(error?.textContent).toBe("Error message");
      expect(error).toHaveAttribute("role", "alert");
    });

    it("should render field group with testId", () => {
      const { container } = renderWithTheme(
        <FieldGroup testId="test-field-group">
          <input type="text" />
        </FieldGroup>
      );
      const group = container.querySelector('[data-testid="test-field-group"]');
      expect(group).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <FieldGroup label="Accessible field" htmlFor="accessible-field">
          <input id="accessible-field" type="text" />
        </FieldGroup>
      );
      await expectAccessible(container);
    });

    it("should associate label with input using htmlFor", () => {
      const { container } = renderWithTheme(
        <FieldGroup label="Email" htmlFor="email">
          <input id="email" type="email" />
        </FieldGroup>
      );
      const label = container.querySelector("label");
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", "email");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <FieldGroup>
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveAttribute("data-mcp-validated", "true");
      expect(group).toHaveAttribute(
        "data-constitution-compliant",
        "fieldgroup-shared"
      );
    });

    it("should have role='alert' on error message", () => {
      const { container } = renderWithTheme(
        <FieldGroup error="Error message">
          <input type="text" />
        </FieldGroup>
      );
      const error = container.querySelector('[role="alert"]');
      expect(error).toBeInTheDocument();
    });
  });

  describe("Required Indicator", () => {
    it("should show required indicator when required is true", () => {
      const { container } = renderWithTheme(
        <FieldGroup label="Email" required>
          <input type="email" />
        </FieldGroup>
      );
      const required = container.querySelector('span[aria-label="required"]');
      expect(required).toBeInTheDocument();
      expect(required?.textContent).toBe("*");
    });

    it("should not show required indicator when required is false", () => {
      const { container } = renderWithTheme(
        <FieldGroup label="Email">
          <input type="email" />
        </FieldGroup>
      );
      const required = container.querySelector('span[aria-label="required"]');
      expect(required).not.toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <FieldGroup size="sm">
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveClass("gap-1");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <FieldGroup size="md">
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveClass("gap-1.5");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <FieldGroup size="lg">
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveClass("gap-2");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(
        <FieldGroup>
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveClass("gap-1.5");
    });
  });

  describe("States", () => {
    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <FieldGroup disabled>
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveClass("pointer-events-none", "opacity-50");
    });

    it("should apply disabled styles to label", () => {
      const { container } = renderWithTheme(
        <FieldGroup label="Email" disabled>
          <input type="text" />
        </FieldGroup>
      );
      const label = container.querySelector("label");
      expect(label).toHaveClass("text-fg-muted");
    });
  });

  describe("Error vs Helper", () => {
    it("should show error instead of helper when both are provided", () => {
      const { container } = renderWithTheme(
        <FieldGroup helper="Helper" error="Error">
          <input type="text" />
        </FieldGroup>
      );
      const error = container.querySelector("p");
      expect(error?.textContent).toBe("Error");
      expect(error).toHaveAttribute("role", "alert");
    });

    it("should show helper when no error", () => {
      const { container } = renderWithTheme(
        <FieldGroup helper="Helper text">
          <input type="text" />
        </FieldGroup>
      );
      const helper = container.querySelector("p");
      expect(helper?.textContent).toBe("Helper text");
      expect(helper).not.toHaveAttribute("role", "alert");
    });
  });

  describe("Base Styles", () => {
    it("should have base field group styles", () => {
      const { container } = renderWithTheme(
        <FieldGroup>
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveClass("flex", "flex-col");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(
        <FieldGroup ref={ref}>
          <input type="text" />
        </FieldGroup>
      );
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <FieldGroup id="test" data-testid="field-group">
          <input type="text" />
        </FieldGroup>
      );
      const group = container.querySelector("#test");
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute("id", "test");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<FieldGroup></FieldGroup>);
      const group = getFieldGroup(container);
      expect(group).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(<FieldGroup>{null}</FieldGroup>);
      const group = getFieldGroup(container);
      expect(group).toBeInTheDocument();
    });

    it("should combine size, required, and error correctly", () => {
      const { container } = renderWithTheme(
        <FieldGroup label="Test" size="lg" required error="Error">
          <input type="text" />
        </FieldGroup>
      );
      const group = getFieldGroup(container);
      expect(group).toHaveClass("gap-2");
      const required = container.querySelector('span[aria-label="required"]');
      expect(required).toBeInTheDocument();
      const error = container.querySelector('[role="alert"]');
      expect(error).toBeInTheDocument();
    });
  });
});
