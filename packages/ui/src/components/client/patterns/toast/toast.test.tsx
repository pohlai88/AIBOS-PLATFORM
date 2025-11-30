/**
 * Toast Component Tests
 *
 * Tests for the Toast Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  useToast,
} from "./toast";

// Helper function to get Toast element
function getToast(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[data-testid*="toast"]')
  ) as HTMLElement | null;
}

describe("Toast", () => {
  describe("Rendering", () => {
    it("should render toast provider", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <div>Content</div>
        </ToastProvider>
      );
      const provider = container.querySelector(".mcp-layer3-pattern-provider");
      expect(provider).toBeInTheDocument();
    });

    it("should render toast viewport", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <ToastViewport />
        </ToastProvider>
      );
      const viewport = container.querySelector(".mcp-layer3-pattern-viewport");
      expect(viewport).toBeInTheDocument();
    });

    it("should render toast component", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast description="Toast message" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast).toBeInTheDocument();
    });

    it("should render toast with description", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast description="Test description" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast?.textContent).toContain("Test description");
    });

    it("should render toast with title", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast title="Toast Title" description="Description" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast?.textContent).toContain("Toast Title");
      expect(toast?.textContent).toContain("Description");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast description="Test" testId="test-toast" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = container.querySelector('[data-testid="test-toast"]');
      expect(toast).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast variant="default" description="Default" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast).toBeInTheDocument();
    });

    it("should render info variant", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast variant="info" description="Info" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast).toBeInTheDocument();
    });

    it("should render success variant", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast variant="success" description="Success" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast).toBeInTheDocument();
    });

    it("should render warning variant", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast variant="warning" description="Warning" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast).toBeInTheDocument();
    });

    it("should render error variant", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast variant="error" description="Error" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render default icon for variant", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast variant="success" description="Success" />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      const icon = toast?.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Dismissible", () => {
    it("should render close button when dismissible", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast description="Dismissible" dismissible />
          <ToastViewport />
        </ToastProvider>
      );
      const closeButton = container.querySelector(
        'button[aria-label="Close"]'
      );
      expect(closeButton).toBeInTheDocument();
    });

    it("should not render close button when not dismissible", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast description="Not dismissible" dismissible={false} />
          <ToastViewport />
        </ToastProvider>
      );
      const closeButton = container.querySelector(
        'button[aria-label="Close"]'
      );
      expect(closeButton).not.toBeInTheDocument();
    });
  });

  describe("Action", () => {
    it("should render action button when provided", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast
            description="With action"
            action={<button>Action</button>}
          />
          <ToastViewport />
        </ToastProvider>
      );
      const actionButton = container.querySelector('button:not([aria-label="Close"])');
      expect(actionButton).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast description="Accessible toast" />
          <ToastViewport />
        </ToastProvider>
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA label for close button", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast description="Dismissible" dismissible />
          <ToastViewport />
        </ToastProvider>
      );
      const closeButton = container.querySelector(
        'button[aria-label="Close"]'
      );
      expect(closeButton).toHaveAttribute("aria-label", "Close");
    });
  });

  describe("Composition", () => {
    it("should compose with title, description, and action", () => {
      const { container } = renderWithTheme(
        <ToastProvider>
          <Toast
            variant="success"
            title="Success"
            description="Operation completed"
            action={<button>View</button>}
          />
          <ToastViewport />
        </ToastProvider>
      );
      const toast = getToast(container);
      expect(toast).toBeInTheDocument();
      expect(toast?.textContent).toContain("Success");
      expect(toast?.textContent).toContain("Operation completed");
    });
  });
});

