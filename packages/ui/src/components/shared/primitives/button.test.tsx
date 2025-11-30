/**
 * Button Component Tests
 *
 * Tests for the Button primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Button } from "./button";

describe("Button", () => {
  describe("Rendering", () => {
    it("should render button with text", () => {
      const { container } = renderWithTheme(<Button>Click me</Button>);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toContain("Click me");
    });

    it("should render button with variant", () => {
      const { container } = renderWithTheme(
        <Button variant="primary">Primary Button</Button>
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toContain("Primary Button");
    });

    it("should render button with size", () => {
      const { container } = renderWithTheme(
        <Button size="lg">Large Button</Button>
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toContain("Large Button");
    });

    it("should render button with icon", () => {
      const { container } = renderWithTheme(
        <Button icon={<span data-testid="icon">+</span>}>Add Item</Button>
      );
      const button = container.querySelector("button");
      const icon = container.querySelector('[data-testid="icon"]');
      expect(button).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
      expect(button?.textContent).toContain("Add Item");
    });

    it("should render button with testId", () => {
      const { container } = renderWithTheme(
        <Button testId="submit-button">Submit</Button>
      );
      const button = container.querySelector('[data-testid="submit-button"]');
      expect(button).toBeInTheDocument();
    });

    it("should render button with custom className", () => {
      const { container } = renderWithTheme(
        <Button className="custom-class">Custom</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Button>Click me</Button>);
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes when disabled", () => {
      const { container } = renderWithTheme(
        <Button disabled>Disabled Button</Button>
      );
      const button = container.querySelector("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should have proper ARIA attributes when loading", () => {
      const { container } = renderWithTheme(
        <Button loading>Loading Button</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("should support aria-label", () => {
      const { container } = renderWithTheme(
        <Button aria-label="Submit form">Submit</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-label", "Submit form");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Button>Test</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("data-mcp-validated", "true");
      expect(button).toHaveAttribute("data-constitution-compliant", "button-shared");
    });

    it("should support keyboard navigation", () => {
      const { container } = renderWithTheme(<Button>Keyboard Test</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("focus-visible:ring-ring");
      expect(button).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", () => {
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Button onClick={handleClick}>Click me</Button>
      );
      const button = container.querySelector("button");
      button?.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", () => {
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Button onClick={handleClick} disabled>
          Disabled Button
        </Button>
      );
      const button = container.querySelector("button");
      button?.click();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when loading", () => {
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Button onClick={handleClick} loading>
          Loading Button
        </Button>
      );
      const button = container.querySelector("button");
      button?.click();
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should handle focus events", () => {
      const handleFocus = vi.fn();
      const { container } = renderWithTheme(
        <Button onFocus={handleFocus}>Focus Test</Button>
      );
      const button = container.querySelector("button");
      button?.focus();
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it("should handle blur events", () => {
      const handleBlur = vi.fn();
      const { container } = renderWithTheme(
        <Button onBlur={handleBlur}>Blur Test</Button>
      );
      const button = container.querySelector("button");
      button?.focus();
      button?.blur();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Button>Default</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-bg-elevated");
      expect(button).toHaveClass("text-fg");
      expect(button).toHaveClass("border", "border-border");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <Button variant="primary">Primary</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-primary-soft");
      expect(button).toHaveClass("text-primary-foreground");
    });

    it("should apply secondary variant styles", () => {
      const { container } = renderWithTheme(
        <Button variant="secondary">Secondary</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-secondary-soft");
      expect(button).toHaveClass("text-secondary-foreground");
    });

    it("should apply ghost variant styles", () => {
      const { container } = renderWithTheme(
        <Button variant="ghost">Ghost</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-transparent");
      expect(button).toHaveClass("text-fg");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Button variant="danger">Danger</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("bg-danger-soft");
      expect(button).toHaveClass("text-danger-foreground");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Button size="sm">Small</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("px-3", "py-1.5");
      expect(button).toHaveClass("text-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(<Button size="md">Medium</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("px-4", "py-2");
      expect(button).toHaveClass("text-[15px]");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Button size="lg">Large</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("px-5", "py-2.5");
      expect(button).toHaveClass("text-[15px]");
    });
  });

  describe("States", () => {
    it("should apply disabled state styles", () => {
      const { container } = renderWithTheme(
        <Button disabled>Disabled</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("cursor-not-allowed", "opacity-50");
      expect(button).toBeDisabled();
    });

    it("should apply loading state styles", () => {
      const { container } = renderWithTheme(
        <Button loading>Loading</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("relative");
      expect(button).toHaveClass("cursor-not-allowed", "opacity-50");
      // Check for loading spinner
      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should hide content when loading", () => {
      const { container } = renderWithTheme(
        <Button loading>Loading Content</Button>
      );
      const contentSpan = container.querySelector("span.inline-flex");
      expect(contentSpan).toHaveClass("invisible");
    });

    it("should apply fullWidth styles", () => {
      const { container } = renderWithTheme(
        <Button fullWidth>Full Width</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveClass("w-full");
    });

    it("should apply auto width by default", () => {
      const { container } = renderWithTheme(<Button>Auto Width</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveClass("w-auto");
    });
  });

  describe("Props", () => {
    it("should accept type prop", () => {
      const { container } = renderWithTheme(
        <Button type="submit">Submit</Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("type", "submit");
    });

    it("should default to type='button'", () => {
      const { container } = renderWithTheme(<Button>Default Type</Button>);
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Button ref={ref}>Ref Test</Button>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML button attributes", () => {
      const { container } = renderWithTheme(
        <Button id="test-button" name="test" value="test-value">
          HTML Attributes
        </Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("id", "test-button");
      expect(button).toHaveAttribute("name", "test");
      expect(button).toHaveAttribute("value", "test-value");
    });
  });

  describe("Composition", () => {
    it("should render as span when asChild is true", () => {
      const { container } = renderWithTheme(
        <Button asChild>
          <span>Child Element</span>
        </Button>
      );
      const span = container.querySelector("span.mcp-shared-component");
      expect(span).toBeInTheDocument();
      expect(container.querySelector("button")).not.toBeInTheDocument();
    });

    it("should not apply disabled attribute when asChild is true", () => {
      const { container } = renderWithTheme(
        <Button asChild disabled>
          <span>Child</span>
        </Button>
      );
      const span = container.querySelector("span");
      expect(span).not.toHaveAttribute("disabled");
      expect(span).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<Button></Button>);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(<Button>{null}</Button>);
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Button>
          <span>First</span>
          <span>Second</span>
        </Button>
      );
      const button = container.querySelector("button");
      expect(button?.textContent).toContain("First");
      expect(button?.textContent).toContain("Second");
    });

    it("should handle loading and disabled together", () => {
      const { container } = renderWithTheme(
        <Button loading disabled>
          Loading Disabled
        </Button>
      );
      const button = container.querySelector("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).toHaveAttribute("aria-busy", "true");
    });
  });
});

