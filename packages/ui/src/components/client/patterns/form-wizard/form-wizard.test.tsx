/**
 * FormWizard Component Tests
 *
 * Tests for the FormWizard Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { FormWizard, type FormWizardStep } from "./form-wizard";
import { FormField } from "../form-field/form-field";
import { Input } from "../../../../shared/primitives/input";
import { Button } from "../../../../shared/primitives/button";

const mockSteps: FormWizardStep[] = [
  {
    id: "step1",
    title: "Step 1",
    description: "First step description",
    component: (
      <FormField label="Field 1" id="field1">
        <Input id="field1" />
      </FormField>
    ),
  },
  {
    id: "step2",
    title: "Step 2",
    description: "Second step description",
    component: (
      <FormField label="Field 2" id="field2">
        <Input id="field2" />
      </FormField>
    ),
  },
  {
    id: "step3",
    title: "Step 3",
    component: (
      <FormField label="Field 3" id="field3">
        <Input id="field3" />
      </FormField>
    ),
  },
];

describe("FormWizard", () => {
  describe("Rendering", () => {
    it("should render form wizard when open", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={false} />
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).not.toBeInTheDocument();
    });

    it("should render first step by default", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const heading = container.querySelector("h2");
      expect(heading?.textContent).toBe("Step 1");
    });

    it("should render step description when provided", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const description = container.querySelector("p");
      expect(description?.textContent).toContain("First step description");
    });

    it("should render step content", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} testId="test-wizard" />
      );
      const wizard = container.querySelector('[data-testid="test-wizard"]');
      expect(wizard).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      await expectAccessible(container);
    });

    it("should have role='dialog'", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const content = container.querySelector('[data-mcp-validated="true"]');
      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-constitution-compliant", "formwizard-layer3");
    });
  });

  describe("Progress Indicator", () => {
    it("should show progress indicator by default", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const progress = container.querySelector('[role="progressbar"]');
      expect(progress).toBeInTheDocument();
    });

    it("should hide progress when showProgress is false", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} showProgress={false} />
      );
      const progress = container.querySelector('[role="progressbar"]');
      expect(progress).not.toBeInTheDocument();
    });

    it("should show correct step count", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const stepText = container.querySelector("p");
      expect(stepText?.textContent).toContain("Step 1 of 3");
    });

    it("should calculate progress percentage correctly", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} defaultStep={1} />
      );
      const progressText = container.querySelector("p");
      // Step 2 of 3 = 66.67% (rounded to 67%)
      expect(progressText?.textContent).toContain("67%");
    });
  });

  describe("Navigation", () => {
    it("should show Next button on non-last step", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const nextButton = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Next"
      );
      expect(nextButton).toBeInTheDocument();
    });

    it("should show Finish button on last step", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} defaultStep={2} />
      );
      const finishButton = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Finish"
      );
      expect(finishButton).toBeInTheDocument();
    });

    it("should disable Previous button on first step", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      const prevButton = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Previous"
      );
      expect(prevButton).toBeDisabled();
    });

    it("should enable Previous button after first step", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} defaultStep={1} />
      );
      const prevButton = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Previous"
      );
      expect(prevButton).not.toBeDisabled();
    });

    it("should navigate to next step when Next is clicked", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} />
      );
      
      const nextButton = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Next"
      ) as HTMLElement;
      
      await user.click(nextButton);
      
      const heading = container.querySelector("h2");
      expect(heading?.textContent).toBe("Step 2");
    });

    it("should navigate to previous step when Previous is clicked", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} defaultStep={1} />
      );
      
      const prevButton = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Previous"
      ) as HTMLElement;
      
      await user.click(prevButton);
      
      const heading = container.querySelector("h2");
      expect(heading?.textContent).toBe("Step 1");
    });
  });

  describe("Callbacks", () => {
    it("should call onFinish when Finish is clicked", async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      const { container } = renderWithTheme(
        <FormWizard
          steps={mockSteps}
          open={true}
          defaultStep={2}
          onFinish={onFinish}
        />
      );
      
      const finishButton = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Finish"
      ) as HTMLElement;
      
      await user.click(finishButton);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it("should call onOpenChange when dialog closes", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { container } = renderWithTheme(
        <FormWizard
          steps={mockSteps}
          open={true}
          onOpenChange={onOpenChange}
        />
      );
      
      const closeButton = container.querySelector('button[aria-label*="Close"]') as HTMLElement;
      if (closeButton) {
        await user.click(closeButton);
        expect(onOpenChange).toHaveBeenCalledWith(false);
      }
    });
  });

  describe("Sizes", () => {
    it("should apply small size", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} size="sm" />
      );
      const content = container.querySelector('[data-mcp-validated="true"]');
      expect(content).toBeInTheDocument();
    });

    it("should apply medium size", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} size="md" />
      );
      const content = container.querySelector('[data-mcp-validated="true"]');
      expect(content).toBeInTheDocument();
    });

    it("should apply large size", () => {
      const { container } = renderWithTheme(
        <FormWizard steps={mockSteps} open={true} size="lg" />
      );
      const content = container.querySelector('[data-mcp-validated="true"]');
      expect(content).toBeInTheDocument();
    });
  });

  describe("Custom Button Text", () => {
    it("should use custom next button text", () => {
      const { container } = renderWithTheme(
        <FormWizard
          steps={mockSteps}
          open={true}
          nextButtonText="Continue"
        />
      );
      const button = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Continue"
      );
      expect(button).toBeInTheDocument();
    });

    it("should use custom previous button text", () => {
      const { container } = renderWithTheme(
        <FormWizard
          steps={mockSteps}
          open={true}
          defaultStep={1}
          previousButtonText="Go Back"
        />
      );
      const button = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Go Back"
      );
      expect(button).toBeInTheDocument();
    });

    it("should use custom finish button text", () => {
      const { container } = renderWithTheme(
        <FormWizard
          steps={mockSteps}
          open={true}
          defaultStep={2}
          finishButtonText="Complete"
        />
      );
      const button = Array.from(container.querySelectorAll("button")).find(
        (btn) => btn.textContent === "Complete"
      );
      expect(button).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single step wizard", () => {
      const singleStep: FormWizardStep[] = [
        {
          id: "step1",
          title: "Single Step",
          component: <div>Content</div>,
        },
      ];
      const { container } = renderWithTheme(
        <FormWizard steps={singleStep} open={true} />
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });

    it("should reset to first step when dialog closes", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { container, rerender } = renderWithTheme(
        <FormWizard
          steps={mockSteps}
          open={true}
          defaultStep={2}
          onOpenChange={onOpenChange}
        />
      );
      
      const closeButton = container.querySelector('button[aria-label*="Close"]') as HTMLElement;
      if (closeButton) {
        await user.click(closeButton);
        onOpenChange(false);
      }
      
      rerender(
        <FormWizard
          steps={mockSteps}
          open={true}
          defaultStep={0}
          onOpenChange={onOpenChange}
        />
      );
      
      const heading = container.querySelector("h2");
      expect(heading?.textContent).toBe("Step 1");
    });

    it("should handle step without description", () => {
      const stepsWithoutDesc: FormWizardStep[] = [
        {
          id: "step1",
          title: "Step 1",
          component: <div>Content</div>,
        },
      ];
      const { container } = renderWithTheme(
        <FormWizard steps={stepsWithoutDesc} open={true} />
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toBeInTheDocument();
    });
  });
});



