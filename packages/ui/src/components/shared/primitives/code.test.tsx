/**
 * Code Component Tests
 *
 * Tests for the Code primitive component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import { Code } from "./code";

describe("Code", () => {
  describe("Rendering", () => {
    it("should render code element", () => {
      const { container } = renderWithTheme(<Code>npm install</Code>);
      const code = container.querySelector("code");
      expect(code).toBeInTheDocument();
      expect(code?.textContent).toBe("npm install");
    });

    it("should render code with children", () => {
      const { container } = renderWithTheme(
        <Code>
          <span>const x = 42;</span>
        </Code>
      );
      const code = container.querySelector("code");
      expect(code?.textContent).toContain("const x = 42;");
    });

    it("should render code with custom className", () => {
      const { container } = renderWithTheme(
        <Code className="custom-class">Code</Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("custom-class");
    });

    it("should render code with testId", () => {
      const { container } = renderWithTheme(
        <Code testId="test-code">Code</Code>
      );
      const code = container.querySelector('[data-testid="test-code"]');
      expect(code).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Code>Accessible code</Code>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(<Code>Test</Code>);
      const code = container.querySelector("code");
      expect(code).toHaveAttribute("data-mcp-validated", "true");
      expect(code).toHaveAttribute("data-constitution-compliant", "code-shared");
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Code variant="default">Code</Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("bg-bg-muted");
      expect(code).toHaveClass("text-fg");
      expect(code).toHaveClass("border", "border-border");
    });

    it("should apply success variant styles", () => {
      const { container } = renderWithTheme(
        <Code variant="success">Code</Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("bg-success-soft");
      expect(code).toHaveClass("text-fg");
    });

    it("should apply warning variant styles", () => {
      const { container } = renderWithTheme(
        <Code variant="warning">Code</Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("bg-warning-soft");
      expect(code).toHaveClass("text-fg");
    });

    it("should apply danger variant styles", () => {
      const { container } = renderWithTheme(
        <Code variant="danger">Code</Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("bg-danger-soft");
      expect(code).toHaveClass("text-fg");
    });

    it("should default to default variant", () => {
      const { container } = renderWithTheme(<Code>Code</Code>);
      const code = container.querySelector("code");
      expect(code).toHaveClass("bg-bg-muted");
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Code size="sm">Code</Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("text-sm", "leading-relaxed");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Code size="md">Code</Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("text-[15px]", "leading-relaxed");
    });

    it("should default to small size", () => {
      const { container } = renderWithTheme(<Code>Code</Code>);
      const code = container.querySelector("code");
      expect(code).toHaveClass("text-sm");
    });
  });

  describe("Base Styles", () => {
    it("should have base code styles", () => {
      const { container } = renderWithTheme(<Code>Code</Code>);
      const code = container.querySelector("code");
      expect(code).toHaveClass("inline-block");
      expect(code).toHaveClass("font-mono");
      expect(code).toHaveClass("rounded-[var(--radius-sm)]");
      expect(code).toHaveClass("px-1.5", "py-0.5");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(<Code ref={ref}>Code</Code>);
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML code attributes", () => {
      const { container } = renderWithTheme(
        <Code id="test" data-testid="code" aria-label="Test code">
          Code
        </Code>
      );
      const code = container.querySelector("#test");
      expect(code).toBeInTheDocument();
      expect(code).toHaveAttribute("id", "test");
      expect(code).toHaveAttribute("data-testid", "code");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty children", () => {
      const { container } = renderWithTheme(<Code></Code>);
      const code = container.querySelector("code");
      expect(code).toBeInTheDocument();
    });

    it("should handle null children", () => {
      const { container } = renderWithTheme(<Code>{null}</Code>);
      const code = container.querySelector("code");
      expect(code).toBeInTheDocument();
    });

    it("should combine variant and size correctly", () => {
      const { container } = renderWithTheme(
        <Code variant="success" size="md">
          Code
        </Code>
      );
      const code = container.querySelector("code");
      expect(code).toHaveClass("bg-success-soft");
      expect(code).toHaveClass("text-[15px]");
    });
  });
});

