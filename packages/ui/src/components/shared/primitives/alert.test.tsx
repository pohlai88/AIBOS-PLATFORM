/**
 * Alert Component Tests
 *
 * Tests for the Alert primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Alert } from "./alert";

// Helper function to get Alert element (excludes test-theme-wrapper)
function getAlert(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector("div:not(.test-theme-wrapper)") ||
    container.querySelector('[data-mcp-validated="true"]') ||
    container.querySelector('[role="alert"]') ||
    container.querySelector(".mcp-shared-component")
  );
}

describe("Alert", () => {
  describe("Rendering", () => {
    it("should render alert element", () => {
      const { container } = renderWithTheme(<Alert>Alert message</Alert>);
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
      expect(alert?.textContent).toContain("Alert message");
    });

    it("should render alert with variant", () => {
      const { container } = renderWithTheme(
        <Alert variant="success">Success message</Alert>
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass("bg-success-soft");
    });

    it("should render alert with size", () => {
      const { container } = renderWithTheme(
        <Alert size="lg">Large alert</Alert>
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass("px-5", "py-2.5");
    });

    it("should render alert with icon", () => {
      const { container } = renderWithTheme(
        <Alert icon={<span data-testid="icon">ℹ️</span>}>With icon</Alert>
      );
      const icon = container.querySelector('[data-testid="icon"]');
      expect(icon).toBeInTheDocument();
    });

    it("should render alert with heading", () => {
      const { container } = renderWithTheme(
        <Alert heading="Alert Heading">Alert content</Alert>
      );
      const alert = getAlert(container);
      // Heading is rendered inside a div with font-semibold class
      const headingDiv = alert?.querySelector("div.font-semibold");
      expect(headingDiv).toBeInTheDocument();
      expect(headingDiv?.textContent).toContain("Alert Heading");
    });

    it("should render alert with actions", () => {
      const { container } = renderWithTheme(
        <Alert actions={<button>Dismiss</button>}>With actions</Alert>
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
      expect(button?.textContent).toContain("Dismiss");
    });

    it("should render alert with testId", () => {
      const { container } = renderWithTheme(
        <Alert testId="test-alert">Test alert</Alert>
      );
      const alert = container.querySelector('[data-testid="test-alert"]');
      expect(alert).toBeInTheDocument();
    });

    it("should render alert with custom className", () => {
      const { container } = renderWithTheme(
        <Alert className="custom-class">Custom alert</Alert>
      );
      const alert = getAlert(container);
      expect(alert).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Alert>Accessible alert</Alert>);
      await expectAccessible(container);
    });

    it("should have proper role attribute", () => {
      const { container } = renderWithTheme(
        <Alert variant="info">Info alert</Alert>
      );
      const alert = getAlert(container);
      expect(alert).toHaveAttribute("role", "alert");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Alert>Test</Alert>);
      const alert = getAlert(container);
      expect(alert).toHaveClass("mcp-shared-component");
    });
  });

  describe("Variants", () => {
    it("should apply info variant styles", () => {
      const { container } = renderWithTheme(<Alert variant="info">Info</Alert>);
      const alert = getAlert(container);
      expect(alert).toHaveClass("bg-primary-soft");
      expect(alert).toHaveClass("text-fg");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(
        <Alert variant="success">Success</Alert>
      );
      const alert = getAlert(container);
      expect(alert).toHaveClass("bg-success-soft");
    });

    it("should apply warning variant styles", () => {
      const { container } = renderWithTheme(
        <Alert variant="warning">Warning</Alert>
      );
      const alert = getAlert(container);
      expect(alert).toHaveClass("bg-warning-soft");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Alert variant="danger">Danger</Alert>
      );
      const alert = getAlert(container);
      expect(alert).toHaveClass("bg-danger-soft");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(<Alert size="sm">Small</Alert>);
      const alert = getAlert(container);
      expect(alert).toHaveClass("px-3", "py-1.5");
      expect(alert).toHaveClass("text-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(<Alert size="md">Medium</Alert>);
      const alert = getAlert(container);
      expect(alert).toHaveClass("px-4", "py-2");
      expect(alert).toHaveClass("text-[15px]");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(<Alert size="lg">Large</Alert>);
      const alert = getAlert(container);
      expect(alert).toHaveClass("px-5", "py-2.5");
      expect(alert).toHaveClass("text-[15px]");
    });
  });

  describe("Composition", () => {
    it("should render icon, heading, and content together", () => {
      const { container } = renderWithTheme(
        <Alert icon={<span data-testid="icon">ℹ️</span>} heading="Alert Title">
          Alert content
        </Alert>
      );
      const alert = getAlert(container);
      const icon = container.querySelector('[data-testid="icon"]');
      const headingDiv = alert?.querySelector("div.font-semibold");
      expect(icon).toBeInTheDocument();
      expect(headingDiv).toBeInTheDocument();
      expect(headingDiv?.textContent).toContain("Alert Title");
      expect(container.textContent).toContain("Alert content");
    });

    it("should render actions in correct position", () => {
      const { container } = renderWithTheme(
        <Alert actions={<button>Action</button>}>Content</Alert>
      );
      const button = container.querySelector("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<Alert></Alert>);
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(<Alert>{null}</Alert>);
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should handle multiple children", () => {
      const { container } = renderWithTheme(
        <Alert>
          <span>First</span>
          <span>Second</span>
        </Alert>
      );
      const alert = getAlert(container);
      expect(alert?.textContent).toContain("First");
      expect(alert?.textContent).toContain("Second");
    });
  });
});
