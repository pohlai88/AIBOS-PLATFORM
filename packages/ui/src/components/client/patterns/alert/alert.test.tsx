/**
 * Alert Component Tests
 *
 * Tests for the Alert Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { Alert } from "./alert";

// Helper function to get Alert element
function getAlert(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[role="alert"]') ||
    container.querySelector('[data-testid*="alert"]')
  ) as HTMLElement | null;
}

describe("Alert", () => {
  describe("Rendering", () => {
    it("should render alert element", () => {
      const { container } = renderWithTheme(
        <Alert description="Alert message" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveAttribute("role", "alert");
    });

    it("should render alert with description", () => {
      const { container } = renderWithTheme(
        <Alert description="Test description" />
      );
      const alert = getAlert(container);
      expect(alert?.textContent).toContain("Test description");
    });

    it("should render alert with title", () => {
      const { container } = renderWithTheme(
        <Alert title="Alert Title" description="Description" />
      );
      const alert = getAlert(container);
      expect(alert?.textContent).toContain("Alert Title");
      expect(alert?.textContent).toContain("Description");
    });

    it("should render alert with children", () => {
      const { container } = renderWithTheme(
        <Alert>
          <p>Child content</p>
        </Alert>
      );
      const alert = getAlert(container);
      expect(alert?.textContent).toContain("Child content");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Alert description="Test" testId="test-alert" />
      );
      const alert = container.querySelector('[data-testid="test-alert"]');
      expect(alert).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render default variant", () => {
      const { container } = renderWithTheme(
        <Alert variant="default" description="Default" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should render info variant", () => {
      const { container } = renderWithTheme(
        <Alert variant="info" description="Info" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should render success variant", () => {
      const { container } = renderWithTheme(
        <Alert variant="success" description="Success" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should render warning variant", () => {
      const { container } = renderWithTheme(
        <Alert variant="warning" description="Warning" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should render error variant", () => {
      const { container } = renderWithTheme(
        <Alert variant="error" description="Error" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      const { container } = renderWithTheme(
        <Alert size="sm" description="Small" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should render medium size (default)", () => {
      const { container } = renderWithTheme(<Alert description="Medium" />);
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });

    it("should render large size", () => {
      const { container } = renderWithTheme(
        <Alert size="lg" description="Large" />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render default icon for variant", () => {
      const { container } = renderWithTheme(
        <Alert variant="success" description="Success" />
      );
      const alert = getAlert(container);
      const icon = alert?.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should render custom icon when provided", () => {
      const { container } = renderWithTheme(
        <Alert
          variant="info"
          description="Custom icon"
          icon={<span data-testid="custom-icon">🎉</span>}
        />
      );
      const customIcon = container.querySelector('[data-testid="custom-icon"]');
      expect(customIcon).toBeInTheDocument();
    });
  });

  describe("Dismissible", () => {
    it("should render dismiss button when dismissible", () => {
      const { container } = renderWithTheme(
        <Alert description="Dismissible" dismissible />
      );
      const dismissButton = container.querySelector(
        'button[aria-label="Dismiss alert"]'
      );
      expect(dismissButton).toBeInTheDocument();
    });

    it("should call onDismiss when dismiss button is clicked", async () => {
      const handleDismiss = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Alert
          description="Dismissible"
          dismissible
          onDismiss={handleDismiss}
        />
      );
      const dismissButton = container.querySelector(
        'button[aria-label="Dismiss alert"]'
      );
      expect(dismissButton).toBeTruthy();
      await user.click(dismissButton!);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it("should hide alert after dismissal", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <Alert description="Dismissible" dismissible />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();

      const dismissButton = container.querySelector(
        'button[aria-label="Dismiss alert"]'
      );
      await user.click(dismissButton!);

      // Alert should be removed from DOM
      const alertAfterDismiss = getAlert(container);
      expect(alertAfterDismiss).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Alert description="Accessible alert" />
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA role", () => {
      const { container } = renderWithTheme(
        <Alert description="Alert message" />
      );
      const alert = getAlert(container);
      expect(alert).toHaveAttribute("role", "alert");
    });

    it("should have proper ARIA label for dismiss button", () => {
      const { container } = renderWithTheme(
        <Alert description="Dismissible" dismissible />
      );
      const dismissButton = container.querySelector(
        'button[aria-label="Dismiss alert"]'
      );
      expect(dismissButton).toHaveAttribute("aria-label", "Dismiss alert");
    });
  });

  describe("Composition", () => {
    it("should compose with title, description, and dismiss", () => {
      const { container } = renderWithTheme(
        <Alert
          variant="success"
          title="Success"
          description="Operation completed"
          dismissible
        />
      );
      const alert = getAlert(container);
      expect(alert).toBeInTheDocument();
      expect(alert?.textContent).toContain("Success");
      expect(alert?.textContent).toContain("Operation completed");
      const dismissButton = container.querySelector(
        'button[aria-label="Dismiss alert"]'
      );
      expect(dismissButton).toBeInTheDocument();
    });
  });
});

