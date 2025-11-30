/**
 * AlertDialog Component Tests
 *
 * Tests for the AlertDialog primitive component and subcomponents following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import {
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
} from "./alert-dialog";

// Helper functions to get elements (excludes test-theme-wrapper)
function getOverlay(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector(".mcp-shared-component")
  );
}

function getHeader(container: HTMLElement): HTMLElement | null {
  return container.querySelector("div:not(.test-theme-wrapper)");
}

function getBody(container: HTMLElement): HTMLElement | null {
  return container.querySelector("div:not(.test-theme-wrapper)");
}

function getFooter(container: HTMLElement): HTMLElement | null {
  return container.querySelector("div:not(.test-theme-wrapper)");
}

describe("AlertDialog", () => {
  describe("AlertDialogOverlay", () => {
    it("should render overlay element", () => {
      const { container } = renderWithTheme(<AlertDialogOverlay />);
      const overlay = getOverlay(container);
      expect(overlay).toBeInTheDocument();
    });

    it("should have overlay styles", () => {
      const { container } = renderWithTheme(<AlertDialogOverlay />);
      const overlay = getOverlay(container);
      expect(overlay).toHaveClass("fixed", "inset-0", "z-50");
      expect(overlay).toHaveClass("bg-black/50");
      expect(overlay).toHaveClass("backdrop-blur-sm");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<AlertDialogOverlay />);
      const overlay = getOverlay(container);
      expect(overlay).toHaveAttribute("data-mcp-validated", "true");
      expect(overlay).toHaveAttribute(
        "data-constitution-compliant",
        "alertdialog-overlay-shared"
      );
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<AlertDialogOverlay ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("AlertDialogContent", () => {
    it("should render content element", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent>Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toBeInTheDocument();
    });

    it("should have role='alertdialog'", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent>Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveAttribute("role", "alertdialog");
    });

    it("should have aria-modal='true'", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent>Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveAttribute("aria-modal", "true");
    });

    it("should have content styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent>Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveClass("fixed", "left-1/2", "top-1/2", "z-50");
      expect(content).toHaveClass("-translate-x-1/2", "-translate-y-1/2");
      expect(content).toHaveClass("bg-bg-elevated");
      expect(content).toHaveClass("border", "border-border");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent>Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveAttribute("data-mcp-validated", "true");
      expect(content).toHaveAttribute(
        "data-constitution-compliant",
        "alertdialog-content-shared"
      );
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent testId="test-dialog">Content</AlertDialogContent>
      );
      const content = container.querySelector('[data-testid="test-dialog"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe("AlertDialogContent Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent size="sm">Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveClass("max-w-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent size="md">Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveClass("max-w-lg");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent size="lg">Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveClass("max-w-2xl");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(
        <AlertDialogContent>Content</AlertDialogContent>
      );
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toHaveClass("max-w-lg");
    });
  });

  describe("AlertDialogHeader", () => {
    it("should render header element", () => {
      const { container } = renderWithTheme(
        <AlertDialogHeader>Header</AlertDialogHeader>
      );
      const header = getHeader(container);
      expect(header).toBeInTheDocument();
    });

    it("should have header styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogHeader>Header</AlertDialogHeader>
      );
      const header = getHeader(container);
      expect(header).toHaveClass("p-6");
      expect(header).toHaveClass("flex", "flex-col", "gap-2");
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<AlertDialogHeader ref={ref}>Header</AlertDialogHeader>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("AlertDialogTitle", () => {
    it("should render h2 element", () => {
      const { container } = renderWithTheme(
        <AlertDialogTitle>Title</AlertDialogTitle>
      );
      const title = container.querySelector("h2");
      expect(title).toBeInTheDocument();
      expect(title?.textContent).toBe("Title");
    });

    it("should have title styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogTitle>Title</AlertDialogTitle>
      );
      const title = container.querySelector("h2");
      expect(title).toHaveClass("text-base", "font-semibold");
      expect(title).toHaveClass("text-fg");
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<AlertDialogTitle ref={ref}>Title</AlertDialogTitle>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("AlertDialogDescription", () => {
    it("should render p element", () => {
      const { container } = renderWithTheme(
        <AlertDialogDescription>Description</AlertDialogDescription>
      );
      const description = container.querySelector("p");
      expect(description).toBeInTheDocument();
      expect(description?.textContent).toBe("Description");
    });

    it("should have description styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogDescription>Description</AlertDialogDescription>
      );
      const description = container.querySelector("p");
      expect(description).toHaveClass("text-sm", "leading-relaxed");
      expect(description).toHaveClass("text-fg-muted");
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(
        <AlertDialogDescription ref={ref}>Description</AlertDialogDescription>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("AlertDialogBody", () => {
    it("should render body element", () => {
      const { container } = renderWithTheme(
        <AlertDialogBody>Body</AlertDialogBody>
      );
      const body = getBody(container);
      expect(body).toBeInTheDocument();
    });

    it("should have body styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogBody>Body</AlertDialogBody>
      );
      const body = getBody(container);
      expect(body).toHaveClass("px-6", "pb-6");
      expect(body).toHaveClass("text-fg-muted");
      expect(body).toHaveClass("text-sm", "leading-relaxed");
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<AlertDialogBody ref={ref}>Body</AlertDialogBody>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("AlertDialogFooter", () => {
    it("should render footer element", () => {
      const { container } = renderWithTheme(
        <AlertDialogFooter>Footer</AlertDialogFooter>
      );
      const footer = getFooter(container);
      expect(footer).toBeInTheDocument();
    });

    it("should have footer styles", () => {
      const { container } = renderWithTheme(
        <AlertDialogFooter>Footer</AlertDialogFooter>
      );
      const footer = getFooter(container);
      expect(footer).toHaveClass("p-6");
      expect(footer).toHaveClass("flex", "flex-row-reverse", "gap-2");
      expect(footer).toHaveClass("border-t", "border-border");
    });

    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<AlertDialogFooter ref={ref}>Footer</AlertDialogFooter>);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <>
          <AlertDialogOverlay />
          <AlertDialogContent aria-labelledby="dialog-title">
            <AlertDialogHeader>
              <AlertDialogTitle id="dialog-title">Title</AlertDialogTitle>
              <AlertDialogDescription>Description</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>Footer</AlertDialogFooter>
          </AlertDialogContent>
        </>
      );
      await expectAccessible(container);
    });
  });

  describe("Complete Dialog Structure", () => {
    it("should render complete dialog", () => {
      const { container } = renderWithTheme(
        <>
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody>Additional content</AlertDialogBody>
            <AlertDialogFooter>Actions</AlertDialogFooter>
          </AlertDialogContent>
        </>
      );
      const overlay = container.querySelector("div");
      expect(overlay).toBeInTheDocument();
      const content = container.querySelector('[role="alertdialog"]');
      expect(content).toBeInTheDocument();
      const title = container.querySelector("h2");
      expect(title).toBeInTheDocument();
      const description = container.querySelector("p");
      expect(description).toBeInTheDocument();
    });
  });
});
