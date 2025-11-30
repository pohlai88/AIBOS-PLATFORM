/**
 * Label Component Tests
 *
 * Tests for the Label primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Label } from "./label";

// Helper to get label element (excluding test-theme-wrapper)
function getLabel(container: HTMLElement): HTMLLabelElement | null {
  return container.querySelector('label:not(.test-theme-wrapper)');
}

describe("Label", () => {
  describe("Rendering", () => {
    it("should render label element", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Label Text</Label>
      );
      const label = getLabel(container);
      expect(label).toBeInTheDocument();
      expect(label?.textContent).toContain("Label Text");
    });

    it("should render label with variant", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" variant="default">
          Default Label
        </Label>
      );
      const label = getLabel(container);
      expect(label).toBeInTheDocument();
    });

    it("should render label with size", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" size="lg">
          Large Label
        </Label>
      );
      const label = getLabel(container);
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass("text-[14px]");
    });

    it("should render label with required indicator", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" required>
          Required Label
        </Label>
      );
      const label = getLabel(container);
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(label).toBeInTheDocument();
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator?.textContent).toBe("*");
    });

    it("should render label with custom className", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" className="custom-class">
          Custom Label
        </Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("custom-class");
    });

    it("should render label with children", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">
          <span>Child 1</span>
          <span>Child 2</span>
        </Label>
      );
      const label = getLabel(container);
      expect(label?.textContent).toContain("Child 1");
      expect(label?.textContent).toContain("Child 2");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Accessible Label</Label>
      );
      await expectAccessible(container);
    });

    it("should have proper htmlFor attribute", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test-input">Label Text</Label>
      );
      const label = getLabel(container);
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", "test-input");
    });

    it("should have required indicator with proper ARIA", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" required>
          Required Label
        </Label>
      );
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(requiredIndicator).toHaveAttribute("aria-label", "required");
      expect(requiredIndicator).toHaveAttribute("aria-hidden", "false");
    });

    it("should associate label with input via htmlFor", () => {
      const { container } = renderWithTheme(
        <>
          <Label htmlFor="email-input">Email</Label>
          <input id="email-input" type="email" />
        </>
      );
      const label = getLabel(container);
      const input = container.querySelector('input[id="email-input"]');
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", "email-input");
      expect(input).toBeInTheDocument();
    });

    it("should be accessible without htmlFor when wrapping input", () => {
      const { container } = renderWithTheme(
        <Label>
          Email
          <input type="email" />
        </Label>
      );
      const label = getLabel(container);
      const input = container.querySelector("input");
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should focus associated input when clicked", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <>
          <Label htmlFor="test-input">Test Label</Label>
          <input id="test-input" type="text" />
        </>
      );
      const label = getLabel(container);
      const input = container.querySelector('input[id="test-input"]') as HTMLInputElement;
      await user.click(label!);
      expect(input).toHaveFocus();
    });

    it("should have cursor pointer style", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Clickable Label</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("cursor-pointer");
    });

    it("should prevent text selection", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Non-selectable</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("select-none");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" variant="default">
          Default
        </Label>
      );
      const label = getLabel(container);
      expect(label).toBeInTheDocument();
    });

    it("should apply required variant when required is true", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" required>
          Required
        </Label>
      );
      const label = getLabel(container);
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(label).toBeInTheDocument();
      expect(requiredIndicator).toBeInTheDocument();
    });

    it("should use required variant when required prop is true even if variant is default", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" variant="default" required>
          Required Default
        </Label>
      );
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(requiredIndicator).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" size="sm">
          Small
        </Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("text-xs");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" size="md">
          Medium
        </Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("text-sm");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" size="lg">
          Large
        </Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("text-[14px]");
    });

    it("should use default size (md) when not specified", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Default Size</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("text-sm");
    });
  });

  describe("Required Indicator", () => {
    it("should show required indicator when required is true", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" required>
          Required Field
        </Label>
      );
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator?.textContent).toBe("*");
    });

    it("should not show required indicator when required is false", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" required={false}>
          Optional Field
        </Label>
      );
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(requiredIndicator).not.toBeInTheDocument();
    });

    it("should not show required indicator by default", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Default Field</Label>
      );
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(requiredIndicator).not.toBeInTheDocument();
    });

    it("should style required indicator correctly", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" required>
          Required
        </Label>
      );
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(requiredIndicator).toHaveClass("text-[var(--color-danger-soft)]");
      expect(requiredIndicator).toHaveClass("font-bold");
      expect(requiredIndicator).toHaveClass("ml-1");
    });

    it("should render required indicator after children", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" required>
          Label Text
        </Label>
      );
      const label = getLabel(container);
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(label?.textContent).toContain("Label Text");
      expect(label?.textContent).toContain("*");
      expect(requiredIndicator).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Label htmlFor="test" ref={ref}>Ref Test</Label>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML label attributes", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" id="test-label" className="custom" data-test="value">
          HTML Attributes
        </Label>
      );
      const label = getLabel(container);
      expect(label).toHaveAttribute("id", "test-label");
      // React converts htmlFor to 'for' in the DOM
      expect(label).toHaveAttribute("for", "test");
      expect(label).toHaveClass("custom");
      expect(label).toHaveAttribute("data-test", "value");
    });

    it("should accept children as ReactNode", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">
          <span>Child Element</span>
        </Label>
      );
      const label = getLabel(container);
      const child = container.querySelector("span");
      expect(label).toBeInTheDocument();
      expect(child).toBeInTheDocument();
      expect(child?.textContent).toBe("Child Element");
    });

    it("should use default variant when not specified", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Default Variant</Label>
      );
      const label = getLabel(container);
      expect(label).toBeInTheDocument();
    });

    it("should use default size (md) when not specified", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Default Size</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("text-sm");
    });

    it("should use default required (false) when not specified", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Not Required</Label>
      );
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(requiredIndicator).not.toBeInTheDocument();
    });
  });

  describe("Base Styles", () => {
    it("should apply base typography styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Base Styles</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("font-medium");
    });

    it("should apply base color styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Base Styles</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("text-fg");
    });

    it("should apply base spacing styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Base Styles</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("mb-1.5");
    });

    it("should apply base cursor styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Base Styles</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("cursor-pointer");
    });

    it("should apply base user select styles", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">Base Styles</Label>
      );
      const label = getLabel(container);
      expect(label).toHaveClass("select-none");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test"></Label>
      );
      const label = getLabel(container);
      expect(label).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">{null}</Label>
      );
      const label = getLabel(container);
      expect(label).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test">
          <span>First</span>
          <span>Second</span>
        </Label>
      );
      const label = getLabel(container);
      expect(label?.textContent).toContain("First");
      expect(label?.textContent).toContain("Second");
    });

    it("should handle combined props", () => {
      const { container } = renderWithTheme(
        <Label htmlFor="test" variant="default" size="lg" required className="custom">
          Combined Props
        </Label>
      );
      const label = getLabel(container);
      const requiredIndicator = container.querySelector('span[aria-label="required"]');
      expect(label).toHaveClass("text-[14px]");
      expect(label).toHaveClass("custom");
      expect(requiredIndicator).toBeInTheDocument();
    });

    it("should handle label without htmlFor", () => {
      const { container } = renderWithTheme(
        <Label>
          <input type="text" />
          Wrapped Input
        </Label>
      );
      const label = getLabel(container);
      const input = container.querySelector("input");
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });
});

