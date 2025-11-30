/**
 * Link Component Tests
 *
 * Tests for the Link primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Link } from "./link";

describe("Link", () => {
  describe("Rendering", () => {
    it("should render link element", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Link text</Link>
      );
      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
      expect(link?.textContent).toContain("Link text");
    });

    it("should render link with href", () => {
      const { container } = renderWithTheme(
        <Link href="/dashboard">Dashboard</Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("href", "/dashboard");
    });

    it("should render link with children", () => {
      const { container } = renderWithTheme(
        <Link href="/test">
          <span>Nested content</span>
        </Link>
      );
      const link = container.querySelector("a");
      expect(link?.textContent).toContain("Nested content");
    });

    it("should render link with custom className", () => {
      const { container } = renderWithTheme(
        <Link href="/test" className="custom-class">
          Link
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("custom-class");
    });

    it("should render link with testId", () => {
      const { container } = renderWithTheme(
        <Link href="/test" testId="test-link">
          Link
        </Link>
      );
      const link = container.querySelector('[data-testid="test-link"]');
      expect(link).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Link href="/test">Accessible link</Link>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Link</Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("data-mcp-validated", "true");
      expect(link).toHaveAttribute("data-constitution-compliant", "link-shared");
    });

    it("should have aria-current='page' when active", () => {
      const { container } = renderWithTheme(
        <Link href="/test" active>
          Active Link
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("aria-current", "page");
    });

    it("should not have aria-current when not active", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Link</Link>
      );
      const link = container.querySelector("a");
      expect(link).not.toHaveAttribute("aria-current");
    });

    it("should have focus-visible styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Link</Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("focus-visible:ring-ring");
      expect(link).toHaveClass("focus-visible:ring-2");
    });
  });

  describe("Interactions", () => {
    it("should handle click events", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = renderWithTheme(
        <Link href="/test" onClick={handleClick}>
          Clickable
        </Link>
      );
      const link = container.querySelector("a") as HTMLElement;
      await user.click(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test" variant="default">
          Default
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-fg");
      expect(link).toHaveClass("hover:opacity-80");
    });

    it("should apply primary variant styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test" variant="primary">
          Primary
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-[var(--color-primary-soft)]");
    });

    it("should apply muted variant styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test" variant="muted">
          Muted
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-fg-muted");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test" variant="danger">
          Danger
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-[var(--color-danger-soft)]");
    });

    it("should default to default variant", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Default</Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-fg");
    });
  });

  describe("Underline", () => {
    it("should apply none underline styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test" underline="none">
          No Underline
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("no-underline");
    });

    it("should apply hover underline styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test" underline="hover">
          Hover Underline
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("no-underline", "hover:underline");
    });

    it("should apply always underline styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test" underline="always">
          Always Underline
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("underline");
    });

    it("should default to hover underline", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Default</Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("no-underline", "hover:underline");
    });
  });

  describe("Active State", () => {
    it("should apply active styles when active is true", () => {
      const { container } = renderWithTheme(
        <Link href="/test" active>
          Active
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("font-semibold");
      expect(link).toHaveClass("text-[var(--color-primary-soft)]");
    });

    it("should not apply active styles when active is false", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Inactive</Link>
      );
      const link = container.querySelector("a");
      expect(link).not.toHaveClass("font-semibold");
    });
  });

  describe("External Links", () => {
    it("should add target='_blank' when external", () => {
      const { container } = renderWithTheme(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("target", "_blank");
    });

    it("should add rel='noopener noreferrer' when external", () => {
      const { container } = renderWithTheme(
        <Link href="https://example.com" external>
          External
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("should not add external attributes when not external", () => {
      const { container } = renderWithTheme(
        <Link href="/internal">Internal</Link>
      );
      const link = container.querySelector("a");
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    });
  });

  describe("Icons", () => {
    it("should render start icon", () => {
      const { container } = renderWithTheme(
        <Link href="/test" startIcon={<span>Icon</span>}>
          Link
        </Link>
      );
      const icon = container.querySelector("span");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("should render end icon", () => {
      const { container } = renderWithTheme(
        <Link href="/test" endIcon={<span>Icon</span>}>
          Link
        </Link>
      );
      const icons = container.querySelectorAll("span");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("should render both start and end icons", () => {
      const { container } = renderWithTheme(
        <Link
          href="/test"
          startIcon={<span>Start</span>}
          endIcon={<span>End</span>}
        >
          Link
        </Link>
      );
      const icons = container.querySelectorAll("span");
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Base Styles", () => {
    it("should have base link styles", () => {
      const { container } = renderWithTheme(
        <Link href="/test">Link</Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("inline-flex", "items-center", "gap-1");
      expect(link).toHaveClass("transition-all", "duration-200");
      expect(link).toHaveClass("cursor-pointer");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Link href="/test" ref={ref}>Link</Link>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML anchor attributes", () => {
      const { container } = renderWithTheme(
        <Link href="/test" id="test" data-testid="link" aria-label="Test link">
          Link
        </Link>
      );
      const link = container.querySelector("#test");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("id", "test");
      expect(link).toHaveAttribute("data-testid", "link");
      expect(link).toHaveAttribute("aria-label", "Test link");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(
        <Link href="/test"></Link>
      );
      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(
        <Link href="/test">{null}</Link>
      );
      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
    });

    it("should combine variant, underline, and active correctly", () => {
      const { container } = renderWithTheme(
        <Link href="/test" variant="primary" underline="always" active>
          Combined
        </Link>
      );
      const link = container.querySelector("a");
      expect(link).toHaveClass("text-[var(--color-primary-soft)]");
      expect(link).toHaveClass("underline");
      expect(link).toHaveClass("font-semibold");
    });
  });
});

