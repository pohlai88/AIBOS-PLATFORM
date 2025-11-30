/**
 * Card Component Tests
 *
 * Tests for the Card Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";

import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Card, CardHeader, CardBody, CardFooter } from "./card";
import { Text } from "../../../shared/typography/text";

// Helper function to get Card element (excludes test-theme-wrapper)
function getCard(container: HTMLElement): HTMLElement | null {
  return (container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-layer3-pattern")) as HTMLElement | null;
}

describe("Card", () => {
  describe("Rendering", () => {
    it("should render card element", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toBeInTheDocument();
    });

    it("should render card with header", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardHeader title="Card Title" />
          <CardBody>Content</CardBody>
        </Card>
      );
      const heading = container.querySelector("h4");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe("Card Title");
    });

    it("should render card with header and description", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardHeader title="Card Title" description="Card description" />
          <CardBody>Content</CardBody>
        </Card>
      );
      const description = container.querySelector("p");
      expect(description).toBeInTheDocument();
      expect(description?.textContent).toBe("Card description");
    });

    it("should render card with footer", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody>Content</CardBody>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      const card = getCard(container);
      const footer = card?.querySelector("div:last-child") as HTMLElement;
      expect(footer).toBeInTheDocument();
      expect(footer?.textContent).toContain("Footer content");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Card testId="test-card">
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = container.querySelector('[data-testid="test-card"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      const { container } = renderWithTheme(
        <Card variant="default">
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("border");
    });

    it("should render outlined variant", () => {
      const { container } = renderWithTheme(
        <Card variant="outlined">
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("border-2");
    });

    it("should render elevated variant", () => {
      const { container } = renderWithTheme(
        <Card variant="elevated">
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("shadow-[var(--shadow-md)]");
    });

    it("should render filled variant", () => {
      const { container } = renderWithTheme(
        <Card variant="filled">
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("bg-bg-muted");
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      const { container } = renderWithTheme(
        <Card size="sm">
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("p-3");
    });

    it("should render medium size (default)", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("p-4");
    });

    it("should render large size", () => {
      const { container } = renderWithTheme(
        <Card size="lg">
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("p-6");
    });
  });

  describe("Interactive States", () => {
    it("should render clickable card", () => {
      const { container } = renderWithTheme(
        <Card clickable>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("should call onClick when clickable card is clicked", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Card clickable onClick={handleClick}>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toBeTruthy();
      await user.click(card!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should render hoverable card", () => {
      const { container } = renderWithTheme(
        <Card hoverable>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveClass("hover:shadow-lg");
    });

    it("should not render hoverable card when hoverable is false", () => {
      const { container } = renderWithTheme(
        <Card hoverable={false}>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).not.toHaveClass("hover:shadow-lg");
    });
  });

  describe("CardHeader", () => {
    it("should render custom header content", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardHeader>
            <div>Custom Header</div>
          </CardHeader>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      const header = card?.querySelector("div:first-child") as HTMLElement;
      expect(header?.textContent).toBe("Custom Header");
    });

    it("should render header with testId", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardHeader testId="test-header" title="Title" />
          <CardBody>Content</CardBody>
        </Card>
      );
      const header = container.querySelector('[data-testid="test-header"]');
      expect(header).toBeInTheDocument();
    });
  });

  describe("CardBody", () => {
    it("should render body content", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody>
            <Text>Body content</Text>
          </CardBody>
        </Card>
      );
      const card = getCard(container);
      const body = card?.querySelector("div") as HTMLElement;
      expect(body?.textContent).toBe("Body content");
    });

    it("should render body with testId", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody testId="test-body">Content</CardBody>
        </Card>
      );
      const body = container.querySelector('[data-testid="test-body"]');
      expect(body).toBeInTheDocument();
    });
  });

  describe("CardFooter", () => {
    it("should render footer content", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody>Content</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const card = getCard(container);
      const footer = card?.querySelector("div:last-child") as HTMLElement;
      expect(footer?.textContent).toBe("Footer");
    });

    it("should render footer with testId", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody>Content</CardBody>
          <CardFooter testId="test-footer">Footer</CardFooter>
        </Card>
      );
      const footer = container.querySelector('[data-testid="test-footer"]');
      expect(footer).toBeInTheDocument();
    });

    it("should render footer with border-top", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardBody>Content</CardBody>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const card = getCard(container);
      const footer = card?.querySelector("div:last-child") as HTMLElement;
      expect(footer).toHaveClass("border-t");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Card>
          <CardHeader title="Accessible Card" />
          <CardBody>Content</CardBody>
        </Card>
      );
      await expectAccessible(container);
    });

    it("should have proper keyboard navigation for clickable card", async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Card clickable onClick={handleClick}>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toBeTruthy();

      // Focus the card
      card!.focus();
      expect(card).toHaveFocus();

      // Press Enter
      await user.keyboard("{Enter}");
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Press Space
      await user.keyboard(" ");
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it("should have proper ARIA attributes for clickable card", () => {
      const { container } = renderWithTheme(
        <Card clickable>
          <CardBody>Content</CardBody>
        </Card>
      );
      const card = getCard(container);
      expect(card).toHaveAttribute("role", "button");
      expect(card).toHaveAttribute("tabIndex", "0");
    });
  });

  describe("Composition", () => {
    it("should compose with all sections", () => {
      const { container } = renderWithTheme(
        <Card>
          <CardHeader title="Title" description="Description" />
          <CardBody>
            <Text>Body content</Text>
          </CardBody>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      const card = getCard(container);
      expect(card).toBeInTheDocument();
      expect(card).toBeTruthy();

      const heading = container.querySelector("h4");
      expect(heading?.textContent).toBe("Title");

      const description = container.querySelector("p");
      expect(description?.textContent).toBe("Description");

      const body = card!.querySelector("div:nth-child(2)") as HTMLElement;
      expect(body?.textContent).toContain("Body content");

      const footer = card!.querySelector("div:last-child") as HTMLElement;
      expect(footer?.textContent).toContain("Action");
    });
  });
});
