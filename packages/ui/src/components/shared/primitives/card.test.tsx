/**
 * Card Component Tests
 *
 * Tests for the Card primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Card } from "./card";

// Helper to get the Card element from container
const getCard = (container: HTMLElement): HTMLElement => {
  const wrapper = container.querySelector('.test-theme-wrapper');
  const card = wrapper?.firstElementChild as HTMLElement;
  if (!card) {
    throw new Error("Card element not found in container");
  }
  return card;
};

describe("Card", () => {
  describe("Rendering", () => {
    it("should render card element", () => {
      const { container } = renderWithTheme(<Card>Card content</Card>);
      const card = getCard(container);
      expect(card).toBeInTheDocument();
      expect(card?.textContent).toContain("Card content");
    });

    it("should render card with children", () => {
      const { container } = renderWithTheme(
        <Card>
          <h2>Title</h2>
          <p>Content</p>
        </Card>
      );
      const card = getCard(container);
      expect(card.textContent).toContain("Title");
      expect(card.textContent).toContain("Content");
    });

    it("should render card with custom className", () => {
      const { container } = renderWithTheme(
        <Card className="custom-class">Content</Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("custom-class");
    });

    it("should render card with id", () => {
      const { container } = renderWithTheme(
        <Card id="test-card">Content</Card>
      );
      const card = container.querySelector("#test-card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("id", "test-card");
    });

    it("should render empty card", () => {
      const { container } = renderWithTheme(<Card />);
      const card = getCard(container);
      expect(card).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Card>Card content</Card>);
      await expectAccessible(container);
    });

    it("should have role='button' when interactive", () => {
      const { container } = renderWithTheme(
        <Card interactive>Interactive card</Card>
      );
      const card = container.querySelector('[role="button"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("should not have role when not interactive", () => {
      const { container } = renderWithTheme(<Card>Non-interactive card</Card>);
      const card = container.querySelector('[role="button"]');
      expect(card).not.toBeInTheDocument();
    });

    it("should have role='button' when onClick is provided", () => {
      const { container } = renderWithTheme(
        <Card onClick={() => {}}>Clickable card</Card>
      );
      const card = container.querySelector('[role="button"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("should support aria-label", () => {
      const { container } = renderWithTheme(
        <Card aria-label="Card description">Content</Card>
      );
      const card = container.querySelector('[aria-label="Card description"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("aria-label", "Card description");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Card onClick={handleClick}>Clickable</Card>
      );
      const card = getCard(container);
      if (card) {
        await user.click(card);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it("should handle click events when interactive", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Card interactive onClick={handleClick}>
          Interactive
        </Card>
      );
      const card = container.querySelector('[role="button"]') as HTMLElement;
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle keyboard Enter key", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Card interactive onClick={handleClick}>
          Interactive
        </Card>
      );
      const card = container.querySelector('[role="button"]') as HTMLElement;
      card.focus();
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle keyboard Space key", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Card interactive onClick={handleClick}>
          Interactive
        </Card>
      );
      const card = container.querySelector('[role="button"]') as HTMLElement;
      card.focus();
      await user.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should handle keyDown events", () => {
      const handleKeyDown = vi.fn();
      const { container } = renderWithTheme(
        <Card onKeyDown={handleKeyDown}>Card</Card>
      );
      const card = getCard(container);
      if (card) {
        const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
        card.dispatchEvent(event);
        expect(handleKeyDown).toHaveBeenCalled();
      }
    });

    it("should not be clickable when not interactive and no onClick", () => {
      const { container } = renderWithTheme(<Card>Non-clickable</Card>);
      const card = container.querySelector('[role="button"]');
      expect(card).not.toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(<Card>Default</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("bg-bg-elevated");
      expect(card).toHaveClass("border", "border-border-subtle");
    });

    it("should apply elevated variant styles", () => {
      const { container } = renderWithTheme(
        <Card variant="elevated">Elevated</Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("bg-bg-elevated");
      expect(card).toHaveClass("shadow-[var(--shadow-md)]");
    });

    it("should apply outlined variant styles", () => {
      const { container } = renderWithTheme(
        <Card variant="outlined">Outlined</Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("bg-bg");
      expect(card).toHaveClass("border", "border-border");
    });

    it("should apply ghost variant styles", () => {
      const { container } = renderWithTheme(
        <Card variant="ghost">Ghost</Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("bg-transparent");
      expect(card).toHaveClass("border", "border-transparent");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Card size="sm">Small</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("p-3");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(<Card size="md">Medium</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("p-4");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Card size="lg">Large</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("p-6");
    });
  });

  describe("Interactive States", () => {
    it("should apply interactive styles when interactive prop is true", () => {
      const { container } = renderWithTheme(
        <Card interactive>Interactive</Card>
      );
      const card = container.querySelector('[role="button"]');
      expect(card).toHaveClass("cursor-pointer");
      expect(card).toHaveClass("hover:opacity-95");
      expect(card).toHaveClass("focus-visible:ring-2");
    });

    it("should apply interactive styles when onClick is provided", () => {
      const { container } = renderWithTheme(
        <Card onClick={() => {}}>Clickable</Card>
      );
      const card = container.querySelector('[role="button"]');
      expect(card).toHaveClass("cursor-pointer");
      expect(card).toHaveClass("hover:opacity-95");
    });

    it("should not apply interactive styles when not interactive", () => {
      const { container } = renderWithTheme(<Card>Non-interactive</Card>);
      const card = getCard(container);
      expect(card).not.toHaveClass("cursor-pointer");
    });

    it("should have focus-visible styles when interactive", () => {
      const { container } = renderWithTheme(
        <Card interactive>Interactive</Card>
      );
      const card = container.querySelector('[role="button"]');
      expect(card).toHaveClass("focus-visible:outline-none");
      expect(card).toHaveClass("focus-visible:ring-2");
      expect(card).toHaveClass("focus-visible:ring-ring");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Card ref={ref}>Content</Card>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <Card id="test" data-testid="card" aria-label="Test card">
          Content
        </Card>
      );
      const card = container.querySelector("#test");
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("id", "test");
      expect(card).toHaveAttribute("data-testid", "card");
      expect(card).toHaveAttribute("aria-label", "Test card");
    });

    it("should default to variant='default'", () => {
      const { container } = renderWithTheme(<Card>Default</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("bg-bg-elevated");
    });

    it("should default to size='md'", () => {
      const { container } = renderWithTheme(<Card>Default</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("p-4");
    });

    it("should default to interactive=false", () => {
      const { container } = renderWithTheme(<Card>Default</Card>);
      const card = container.querySelector("div");
      expect(card).not.toHaveAttribute("role", "button");
    });
  });

  describe("Base Styles", () => {
    it("should have base transition styles", () => {
      const { container } = renderWithTheme(<Card>Content</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("transition-all", "duration-200");
    });

    it("should have rounded corners", () => {
      const { container } = renderWithTheme(<Card>Content</Card>);
      const card = getCard(container);
      expect(card).toHaveClass("rounded-[var(--radius-lg)]");
    });
  });

  describe("Edge Cases", () => {
    it("should handle null children", () => {
      const { container } = renderWithTheme(<Card>{null}</Card>);
      const card = container.querySelector("div");
      expect(card).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Card>
          <div>First</div>
          <div>Second</div>
        </Card>
      );
      const card = container.querySelector("div");
      expect(card?.textContent).toContain("First");
      expect(card?.textContent).toContain("Second");
    });

    it("should handle both interactive prop and onClick", () => {
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Card interactive onClick={handleClick}>
          Both
        </Card>
      );
      const card = container.querySelector('[role="button"]');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("should handle onKeyDown with custom handler", () => {
      const handleKeyDown = vi.fn();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Card interactive onClick={handleClick} onKeyDown={handleKeyDown}>
          Custom handler
        </Card>
      );
      const card = container.querySelector('[role="button"]') as HTMLElement;
      const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
      card.dispatchEvent(event);
      expect(handleKeyDown).toHaveBeenCalled();
    });
  });
});
