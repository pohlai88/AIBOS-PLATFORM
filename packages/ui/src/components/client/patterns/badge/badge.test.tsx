/**
 * Badge Component Tests
 *
 * Tests for the Badge Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Badge } from "./badge";

// Helper function to get Badge element (excludes test-theme-wrapper)
function getBadge(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("span:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-layer3-pattern")
  ) as HTMLElement | null;
}

// Simple icon component for testing
const TestIcon = () => (
  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

describe("Badge", () => {
  describe("Rendering", () => {
    it("should render badge element", () => {
      const { container } = renderWithTheme(<Badge>Badge Text</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain("Badge Text");
    });

    it("should render badge with testId", () => {
      const { container } = renderWithTheme(<Badge testId="test-badge">Test</Badge>);
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
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      const { container } = renderWithTheme(<Badge variant="default">Default</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should render primary variant", () => {
      const { container } = renderWithTheme(<Badge variant="primary">Primary</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should render success variant", () => {
      const { container } = renderWithTheme(<Badge variant="success">Success</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should render warning variant", () => {
      const { container } = renderWithTheme(<Badge variant="warning">Warning</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should render danger variant", () => {
      const { container } = renderWithTheme(<Badge variant="danger">Danger</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      const { container } = renderWithTheme(<Badge size="sm">Small</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should render medium size (default)", () => {
      const { container } = renderWithTheme(<Badge>Medium</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should render large size", () => {
      const { container } = renderWithTheme(<Badge size="lg">Large</Badge>);
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render badge with leading icon", () => {
      const { container } = renderWithTheme(
        <Badge leadingIcon={<TestIcon />}>With Icon</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      const icon = badge?.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render badge with trailing icon", () => {
      const { container } = renderWithTheme(
        <Badge trailingIcon={<TestIcon />}>With Icon</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      const icon = badge?.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render badge with both leading and trailing icons", () => {
      const { container } = renderWithTheme(
        <Badge leadingIcon={<TestIcon />} trailingIcon={<TestIcon />}>
          With Icons
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      const icons = badge?.querySelectorAll("svg");
      expect(icons?.length).toBe(2);
    });
  });

  describe("Dismissible", () => {
    it("should render dismissible badge", () => {
      const { container } = renderWithTheme(
        <Badge dismissible>Dismissible</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      const dismissButton = container.querySelector('button[aria-label="Dismiss badge"]');
      expect(dismissButton).toBeInTheDocument();
    });

    it("should call onDismiss when dismiss button is clicked", async () => {
      const handleDismiss = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Badge dismissible onDismiss={handleDismiss}>
          Dismissible
        </Badge>
      );
      const dismissButton = container.querySelector('button[aria-label="Dismiss badge"]');
      expect(dismissButton).toBeTruthy();
      await user.click(dismissButton!);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it("should hide badge after dismissal", async () => {
      const user = userEvent.setup();
      const { container, rerender } = renderWithTheme(
        <Badge dismissible>Dismissible</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();

      const dismissButton = container.querySelector('button[aria-label="Dismiss badge"]');
      await user.click(dismissButton!);

      // Badge should be removed from DOM
      const badgeAfterDismiss = getBadge(container);
      expect(badgeAfterDismiss).not.toBeInTheDocument();
    });

    it("should not show trailing icon when dismissible", () => {
      const { container } = renderWithTheme(
        <Badge dismissible trailingIcon={<TestIcon />}>
          Dismissible
        </Badge>
      );
      const badge = getBadge(container);
      const icons = badge?.querySelectorAll("svg");
      // Should only have dismiss icon, not trailing icon
      expect(icons?.length).toBe(1);
    });
  });

  describe("Clickable", () => {
    it("should render clickable badge", () => {
      const { container } = renderWithTheme(
        <Badge clickable>Clickable</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
    });

    it("should call onClick when clickable badge is clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Badge clickable onClick={handleClick}>
          Clickable
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeTruthy();
      await user.click(badge!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when not clickable", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Badge onClick={handleClick}>Not Clickable</Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeTruthy();
      await user.click(badge!);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Badge>Accessible Badge</Badge>);
      await expectAccessible(container);
    });

    it("should have proper ARIA attributes for dismissible badge", () => {
      const { container } = renderWithTheme(
        <Badge dismissible>Dismissible</Badge>
      );
      const dismissButton = container.querySelector('button[aria-label="Dismiss badge"]');
      expect(dismissButton).toHaveAttribute("aria-label", "Dismiss badge");
    });

    it("should have proper keyboard navigation for clickable badge", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Badge clickable onClick={handleClick}>
          Clickable
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeTruthy();

      // Focus the badge
      badge!.focus();
      expect(badge).toHaveFocus();

      // Press Enter
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Composition", () => {
    it("should compose with icon and dismiss", () => {
      const { container } = renderWithTheme(
        <Badge leadingIcon={<TestIcon />} dismissible>
          Complex Badge
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain("Complex Badge");
      const dismissButton = container.querySelector('button[aria-label="Dismiss badge"]');
      expect(dismissButton).toBeInTheDocument();
    });

    it("should compose with all features", () => {
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Badge
          variant="success"
          size="lg"
          leadingIcon={<TestIcon />}
          dismissible
          clickable
          onClick={handleClick}
        >
          Full Featured
        </Badge>
      );
      const badge = getBadge(container);
      expect(badge).toBeInTheDocument();
      expect(badge?.textContent).toContain("Full Featured");
    });
  });
});

