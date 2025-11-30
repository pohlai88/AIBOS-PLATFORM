/**
 * Stack Component Tests
 *
 * Tests for the Stack Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import { Stack } from "./stack";

// Helper function to get Stack element
function getStack(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[data-testid*="stack"]')
  ) as HTMLElement | null;
}

describe("Stack", () => {
  describe("Rendering", () => {
    it("should render stack component", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const stack = getStack(container);
      expect(stack).toBeInTheDocument();
      expect(stack?.textContent).toContain("Content");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Stack testId="test-stack">Content</Stack>
      );
      const stack = container.querySelector('[data-testid="test-stack"]');
      expect(stack).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <Stack className="custom-class">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("custom-class");
    });
  });

  describe("Direction", () => {
    it("should render column direction by default", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const stack = getStack(container);
      expect(stack).toHaveClass("flex-col");
    });

    it("should render row direction", () => {
      const { container } = renderWithTheme(
        <Stack direction="row">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("flex-row");
    });

    it("should render column direction", () => {
      const { container } = renderWithTheme(
        <Stack direction="column">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("flex-col");
    });
  });

  describe("Alignment", () => {
    it("should render stretch alignment by default", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const stack = getStack(container);
      expect(stack).toHaveClass("items-stretch");
    });

    it("should render start alignment", () => {
      const { container } = renderWithTheme(
        <Stack align="start">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("items-start");
    });

    it("should render center alignment", () => {
      const { container } = renderWithTheme(
        <Stack align="center">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("items-center");
    });

    it("should render end alignment", () => {
      const { container } = renderWithTheme(
        <Stack align="end">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("items-end");
    });
  });

  describe("Justification", () => {
    it("should render start justification by default", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const stack = getStack(container);
      expect(stack).toHaveClass("justify-start");
    });

    it("should render center justification", () => {
      const { container } = renderWithTheme(
        <Stack justify="center">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("justify-center");
    });

    it("should render between justification", () => {
      const { container } = renderWithTheme(
        <Stack justify="between">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("justify-between");
    });

    it("should render around justification", () => {
      const { container } = renderWithTheme(
        <Stack justify="around">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("justify-around");
    });

    it("should render evenly justification", () => {
      const { container } = renderWithTheme(
        <Stack justify="evenly">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("justify-evenly");
    });
  });

  describe("Spacing", () => {
    it("should render medium spacing by default", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const stack = getStack(container);
      expect(stack).toHaveClass("gap-4");
    });

    it("should render none spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="none">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("gap-0");
    });

    it("should render small spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="sm">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("gap-2");
    });

    it("should render large spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="lg">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("gap-6");
    });

    it("should render extra large spacing", () => {
      const { container } = renderWithTheme(
        <Stack spacing="xl">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("gap-8");
    });
  });

  describe("Wrap", () => {
    it("should render nowrap by default", () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      const stack = getStack(container);
      expect(stack).toHaveClass("flex-nowrap");
    });

    it("should render wrap", () => {
      const { container } = renderWithTheme(
        <Stack wrap="wrap">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("flex-wrap");
    });

    it("should render wrap-reverse", () => {
      const { container } = renderWithTheme(
        <Stack wrap="wrap-reverse">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveClass("flex-wrap-reverse");
    });
  });

  describe("Custom Gap", () => {
    it("should apply custom gap as string", () => {
      const { container } = renderWithTheme(
        <Stack gap="32px">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveStyle({ gap: "32px" });
    });

    it("should apply custom gap as number", () => {
      const { container } = renderWithTheme(<Stack gap={32}>Content</Stack>);
      const stack = getStack(container);
      expect(stack).toHaveStyle({ gap: "32px" });
    });

    it("should override spacing when gap is provided", () => {
      const { container } = renderWithTheme(
        <Stack spacing="lg" gap="20px">Content</Stack>
      );
      const stack = getStack(container);
      expect(stack).toHaveStyle({ gap: "20px" });
      expect(stack).not.toHaveClass("gap-6");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Stack>Content</Stack>);
      await expectAccessible(container);
    });
  });

  describe("Composition", () => {
    it("should compose with multiple children", () => {
      const { container } = renderWithTheme(
        <Stack>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Stack>
      );
      const stack = getStack(container);
      expect(stack?.children.length).toBe(3);
    });
  });
});

