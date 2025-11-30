/**
 * Badge Component Tests
 *
 * Tests for the Badge primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Badge } from "./badge";

// Helper to get badge element (excluding test-theme-wrapper)
function getBadge(container: HTMLElement): HTMLSpanElement | null {
  return container.querySelector('span:not(.test-theme-wrapper)');
}

describe("Badge", () => {
  describe("Rendering", () => {
    it("should render badge element", () => {
      const { container } = renderWithTheme(<Badge>Badge Text</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain("Badge Text");
    });

    it("should render badge with variant", () => {
      const { container } = renderWithTheme(
        <Badge variant="primary">Primary</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-primary-soft");
    });

    it("should render badge with size", () => {
      const { container } = renderWithTheme(
        <Badge size="lg">Large</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("px-4", "py-2");
    });

    it("should render badge with testId", () => {
      const { container } = renderWithTheme(
        <Badge testId="test-badge">Test</Badge>
      );
      const badge = container.querySelector('[data-testid="test-badge"]');
      expect(badge).toBeInTheDocument();
    });

    it("should render badge with custom className", () => {
      const { container } = renderWithTheme(
        <Badge className="custom-class">Custom</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("custom-class");
    });

    it("should render badge with children", () => {
      const { container } = renderWithTheme(
        <Badge>
          <span>Child 1</span>
          <span>Child 2</span>
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge?.textContent).toContain("Child 1");
      expect(badge?.textContent).toContain("Child 2");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Badge>Accessible badge</Badge>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Badge>Test</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("mcp-shared-component");
      expect(badge).toHaveAttribute("data-mcp-validated", "true");
      expect(badge).toHaveAttribute("data-constitution-compliant", "badge-shared");
    });

    it("should have role='button' when clickable", () => {
      const { container } = renderWithTheme(
        <Badge onClick={vi.fn()}>Clickable</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveAttribute("role", "button");
      expect(badge).toHaveAttribute("tabIndex", "0");
    });

    it("should not have role when not clickable", () => {
      const { container } = renderWithTheme(<Badge>Not Clickable</Badge>);
      const badge = getBadge(container);
      expect(badge).not.toHaveAttribute("role");
      expect(badge).not.toHaveAttribute("tabIndex");
    });

    it("should be accessible with keyboard when clickable", async () => {
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Badge onClick={handleClick}>Keyboard Accessible</Badge>
      );
      const badge = getBadge(container);
      badge?.focus();
      expect(badge).toHaveFocus();
    });

    it("should have focus-visible styles when clickable", () => {
      const { container } = renderWithTheme(
        <Badge onClick={vi.fn()}>Focusable</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("focus-visible:ring-ring");
      expect(badge).toHaveClass("focus-visible:ring-2");
      expect(badge).toHaveClass("focus-visible:outline-none");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Badge onClick={handleClick}>Clickable</Badge>
      );
      const badge = getBadge(container);
      await user.click(badge!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should accept onKeyDown handler", () => {
      const handleKeyDown = vi.fn();
      const { container } = renderWithTheme(
        <Badge onKeyDown={handleKeyDown}>Keyboard</Badge>
      );
      const badge = getBadge(container);
      const enterEvent = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
      badge?.dispatchEvent(enterEvent);
      // Badge accepts onKeyDown via {...props}
      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it("should have tabIndex when clickable", () => {
      const { container } = renderWithTheme(
        <Badge onClick={vi.fn()}>Clickable</Badge>
      );
      const badge = getBadge(container);
      // Badge with onClick should have tabIndex for keyboard navigation
      expect(badge).toHaveAttribute("tabIndex", "0");
    });

    it("should have cursor pointer when clickable", () => {
      const { container } = renderWithTheme(
        <Badge onClick={vi.fn()}>Clickable</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("cursor-pointer");
    });

    it("should have hover styles when clickable", () => {
      const { container } = renderWithTheme(
        <Badge onClick={vi.fn()}>Hoverable</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("hover:opacity-80");
    });

    it("should not be clickable when onClick is not provided", () => {
      const { container } = renderWithTheme(<Badge>Not Clickable</Badge>);
      const badge = getBadge(container);
      expect(badge).not.toHaveClass("cursor-pointer");
      expect(badge).not.toHaveAttribute("role", "button");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Badge>Default</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-bg-muted");
      expect(badge).toHaveClass("text-fg");
      expect(badge).toHaveClass("border", "border-border-subtle");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <Badge variant="primary">Primary</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-primary-soft");
      expect(badge).toHaveClass("text-primary-foreground");
      expect(badge).toHaveClass("border", "border-transparent");
    });

    it("should apply secondary variant styles", () => {
      const { container } = renderWithTheme(
        <Badge variant="secondary">Secondary</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-secondary-soft");
      expect(badge).toHaveClass("text-secondary-foreground");
      expect(badge).toHaveClass("border", "border-transparent");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(
        <Badge variant="success">Success</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-success-soft");
      expect(badge).toHaveClass("text-success-foreground");
      expect(badge).toHaveClass("border", "border-transparent");
    });

    it("should apply warning variant styles", () => {
      const { container } = renderWithTheme(
        <Badge variant="warning">Warning</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-warning-soft");
      expect(badge).toHaveClass("text-warning-foreground");
      expect(badge).toHaveClass("border", "border-transparent");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Badge variant="danger">Danger</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-danger-soft");
      expect(badge).toHaveClass("text-danger-foreground");
      expect(badge).toHaveClass("border", "border-transparent");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Badge size="sm">Small</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("px-2", "py-0.5");
      expect(badge).toHaveClass("text-sm", "leading-relaxed");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(<Badge size="md">Medium</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("px-3", "py-1.5");
      expect(badge).toHaveClass("text-sm", "leading-relaxed");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Badge size="lg">Large</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("px-4", "py-2");
      expect(badge).toHaveClass("text-[15px]", "leading-relaxed");
    });
  });

  describe("Base Styles", () => {
    it("should have base layout styles", () => {
      const { container } = renderWithTheme(<Badge>Base</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("inline-flex", "items-center", "gap-1");
    });

    it("should have base typography styles", () => {
      const { container } = renderWithTheme(<Badge>Base</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("font-medium");
    });

    it("should have overflow hidden", () => {
      const { container } = renderWithTheme(<Badge>Base</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("overflow-hidden");
    });

    it("should have transition styles", () => {
      const { container } = renderWithTheme(<Badge>Base</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("transition-all", "duration-200");
    });

    it("should have whitespace nowrap", () => {
      const { container } = renderWithTheme(<Badge>Base</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("whitespace-nowrap");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Badge ref={ref}>Ref Test</Badge>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML span attributes", () => {
      const { container } = renderWithTheme(
        <Badge id="test-badge" className="custom" data-custom="value">
          HTML Attributes
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveAttribute("id", "test-badge");
      expect(badge).toHaveClass("custom");
      expect(badge).toHaveAttribute("data-custom", "value");
    });

    it("should use default variant when not specified", () => {
      const { container } = renderWithTheme(<Badge>Default</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-bg-muted");
    });

    it("should use default size when not specified", () => {
      const { container } = renderWithTheme(<Badge>Default</Badge>);
      const badge = getBadge(container);
      expect(badge).toHaveClass("px-3", "py-1.5"); // md size
    });

    it("should handle asChild prop (always renders as span)", () => {
      const { container } = renderWithTheme(
        <Badge asChild>As Child</Badge>
      );
      const badge = getBadge(container);
      expect(badge?.tagName.toLowerCase()).toBe("span");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<Badge></Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(<Badge>{null}</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Badge>
          <span>First</span>
          <span>Second</span>
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge?.textContent).toContain("First");
      expect(badge?.textContent).toContain("Second");
    });

    it("should handle combined props", () => {
      const { container } = renderWithTheme(
        <Badge
          variant="primary"
          size="lg"
          className="custom"
          onClick={vi.fn()}
        >
          Combined
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge).toHaveClass("bg-primary-soft");
      expect(badge).toHaveClass("px-4", "py-2");
      expect(badge).toHaveClass("custom");
      expect(badge).toHaveAttribute("role", "button");
    });
  });
});

