/**
 * FormSection Component Tests
 *
 * Tests for the FormSection Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { FormSection } from "./form-section";
import { FormField } from "../form-field/form-field";
import { Input } from "../../../../shared/primitives/input";

describe("FormSection", () => {
  describe("Rendering", () => {
    it("should render form section element", () => {
      const { container } = renderWithTheme(
        <FormSection>
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toBeInTheDocument();
    });

    it("should render form section with title", () => {
      const { container } = renderWithTheme(
        <FormSection title="Personal Information">
          <div>Content</div>
        </FormSection>
      );
      const heading = container.querySelector("h3");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe("Personal Information");
    });

    it("should render form section with description", () => {
      const { container } = renderWithTheme(
        <FormSection
          title="Section"
          description="Section description"
        >
          <div>Content</div>
        </FormSection>
      );
      const description = container.querySelector("p");
      expect(description).toBeInTheDocument();
      expect(description?.textContent).toBe("Section description");
    });

    it("should render form section with children", () => {
      const { container } = renderWithTheme(
        <FormSection>
          <FormField label="Field" id="field">
            <Input id="field" />
          </FormField>
        </FormSection>
      );
      const input = container.querySelector("input");
      expect(input).toBeInTheDocument();
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <FormSection testId="test-section">
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="test-section"]');
      expect(section).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <FormSection title="Accessible Section">
          <div>Content</div>
        </FormSection>
      );
      await expectAccessible(container);
    });

    it("should use semantic heading for title", () => {
      const { container } = renderWithTheme(
        <FormSection title="Section Title">
          <div>Content</div>
        </FormSection>
      );
      const heading = container.querySelector("h3");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe("Section Title");
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <FormSection>
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toHaveAttribute("data-mcp-validated", "true");
      expect(section).toHaveAttribute("data-constitution-compliant", "formsection-layer3");
    });
  });

  describe("Collapsible Functionality", () => {
    it("should show collapse button when collapsible is true", () => {
      const { container } = renderWithTheme(
        <FormSection title="Section" collapsible>
          <div>Content</div>
        </FormSection>
      );
      const button = container.querySelector('button[aria-label*="Collapse"]');
      expect(button).toBeInTheDocument();
    });

    it("should not show collapse button when collapsible is false", () => {
      const { container } = renderWithTheme(
        <FormSection title="Section" collapsible={false}>
          <div>Content</div>
        </FormSection>
      );
      const button = container.querySelector('button[aria-label*="Collapse"]');
      expect(button).not.toBeInTheDocument();
    });

    it("should collapse content when button is clicked", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <FormSection title="Section" collapsible>
          <div data-testid="content">Content</div>
        </FormSection>
      );
      const button = container.querySelector('button[aria-label*="Collapse"]') as HTMLElement;
      const content = container.querySelector('[data-testid="content"]');
      
      expect(content).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "true");
      
      await user.click(button);
      
      expect(button).toHaveAttribute("aria-expanded", "false");
      // Content should be hidden when collapsed
      const hiddenContent = container.querySelector('[data-testid="content"]');
      expect(hiddenContent).not.toBeInTheDocument();
    });

    it("should start collapsed when defaultCollapsed is true", () => {
      const { container } = renderWithTheme(
        <FormSection title="Section" collapsible defaultCollapsed>
          <div data-testid="content">Content</div>
        </FormSection>
      );
      const button = container.querySelector('button[aria-label*="Expand"]') as HTMLElement;
      const content = container.querySelector('[data-testid="content"]');
      
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(content).not.toBeInTheDocument();
    });

    it("should hide description when collapsed", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <FormSection
          title="Section"
          description="Description text"
          collapsible
        >
          <div>Content</div>
        </FormSection>
      );
      const description = container.querySelector("p");
      expect(description).toBeInTheDocument();
      
      const button = container.querySelector('button[aria-label*="Collapse"]') as HTMLElement;
      await user.click(button);
      
      const hiddenDescription = container.querySelector("p");
      expect(hiddenDescription).not.toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <FormSection size="sm">
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toHaveClass("gap-3");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <FormSection size="md">
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toHaveClass("gap-4");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <FormSection size="lg">
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toHaveClass("gap-6");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(
        <FormSection>
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toHaveClass("gap-4");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(
        <FormSection ref={ref}>
          <div>Content</div>
        </FormSection>
      );
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML div attributes", () => {
      const { container } = renderWithTheme(
        <FormSection id="test" data-testid="section" className="custom">
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector("#test");
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass("custom");
    });
  });

  describe("Edge Cases", () => {
    it("should handle section without title", () => {
      const { container } = renderWithTheme(
        <FormSection>
          <div>Content</div>
        </FormSection>
      );
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toBeInTheDocument();
      const heading = container.querySelector("h3");
      expect(heading).not.toBeInTheDocument();
    });

    it("should handle section without description", () => {
      const { container } = renderWithTheme(
        <FormSection title="Section">
          <div>Content</div>
        </FormSection>
      );
      const description = container.querySelector("p");
      expect(description).not.toBeInTheDocument();
    });

    it("should handle empty children", () => {
      const { container } = renderWithTheme(<FormSection />);
      const section = container.querySelector('[data-testid="theme-wrapper"] > div');
      expect(section).toBeInTheDocument();
    });

    it("should handle multiple form fields", () => {
      const { container } = renderWithTheme(
        <FormSection title="Section">
          <FormField label="Field 1" id="field1">
            <Input id="field1" />
          </FormField>
          <FormField label="Field 2" id="field2">
            <Input id="field2" />
          </FormField>
        </FormSection>
      );
      const inputs = container.querySelectorAll("input");
      expect(inputs.length).toBe(2);
    });
  });
});



