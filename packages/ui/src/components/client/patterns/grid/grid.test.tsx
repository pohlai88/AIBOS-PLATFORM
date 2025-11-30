/**
 * Grid Component Tests
 *
 * Tests for the Grid Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import { Grid, GridItem } from "./grid";

// Helper function to get Grid element
function getGrid(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[data-testid*="grid"]')
  ) as HTMLElement | null;
}

// Helper function to get GridItem element
function getGridItem(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern-item") ||
    container.querySelector('[data-testid*="grid-item"]')
  ) as HTMLElement | null;
}

describe("Grid", () => {
  describe("Rendering", () => {
    it("should render grid component", () => {
      const { container } = renderWithTheme(<Grid>Content</Grid>);
      const grid = getGrid(container);
      expect(grid).toBeInTheDocument();
      expect(grid?.textContent).toContain("Content");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <Grid testId="test-grid">Content</Grid>
      );
      const grid = container.querySelector('[data-testid="test-grid"]');
      expect(grid).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <Grid className="custom-class">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveClass("custom-class");
    });
  });

  describe("Columns", () => {
    it("should render 12 columns by default", () => {
      const { container } = renderWithTheme(<Grid>Content</Grid>);
      const grid = getGrid(container);
      expect(grid).toHaveStyle({
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
      });
    });

    it("should render 2 columns", () => {
      const { container } = renderWithTheme(
        <Grid columns={2}>Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveStyle({
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      });
    });

    it("should render 6 columns", () => {
      const { container } = renderWithTheme(
        <Grid columns={6}>Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveStyle({
        gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      });
    });
  });

  describe("Gap", () => {
    it("should render medium gap by default", () => {
      const { container } = renderWithTheme(<Grid>Content</Grid>);
      const grid = getGrid(container);
      expect(grid).toHaveClass("gap-4");
    });

    it("should render none gap", () => {
      const { container } = renderWithTheme(
        <Grid gap="none">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveClass("gap-0");
    });

    it("should render small gap", () => {
      const { container } = renderWithTheme(
        <Grid gap="sm">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveClass("gap-2");
    });

    it("should render large gap", () => {
      const { container } = renderWithTheme(
        <Grid gap="lg">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveClass("gap-6");
    });
  });

  describe("Alignment", () => {
    it("should render stretch alignment by default", () => {
      const { container } = renderWithTheme(<Grid>Content</Grid>);
      const grid = getGrid(container);
      expect(grid).toHaveClass("items-stretch");
    });

    it("should render start alignment", () => {
      const { container } = renderWithTheme(
        <Grid align="start">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveClass("items-start");
    });

    it("should render center alignment", () => {
      const { container } = renderWithTheme(
        <Grid align="center">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveClass("items-center");
    });

    it("should render end alignment", () => {
      const { container } = renderWithTheme(
        <Grid align="end">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveClass("items-end");
    });
  });

  describe("Custom Gap", () => {
    it("should apply custom gap as string", () => {
      const { container } = renderWithTheme(
        <Grid gapValue="32px">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveStyle({ gap: "32px" });
    });

    it("should apply custom gap as number", () => {
      const { container } = renderWithTheme(
        <Grid gapValue={32}>Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveStyle({ gap: "32px" });
    });

    it("should override gap when gapValue is provided", () => {
      const { container } = renderWithTheme(
        <Grid gap="lg" gapValue="20px">Content</Grid>
      );
      const grid = getGrid(container);
      expect(grid).toHaveStyle({ gap: "20px" });
      expect(grid).not.toHaveClass("gap-6");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<Grid>Content</Grid>);
      await expectAccessible(container);
    });
  });

  describe("Composition", () => {
    it("should compose with GridItem", () => {
      const { container } = renderWithTheme(
        <Grid>
          <GridItem span={6}>Item 1</GridItem>
          <GridItem span={6}>Item 2</GridItem>
        </Grid>
      );
      const grid = getGrid(container);
      const items = container.querySelectorAll(".mcp-layer3-pattern-item");
      expect(items.length).toBe(2);
    });
  });
});

describe("GridItem", () => {
  describe("Rendering", () => {
    it("should render grid item component", () => {
      const { container } = renderWithTheme(
        <GridItem>Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toBeInTheDocument();
      expect(item?.textContent).toContain("Content");
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <GridItem testId="test-grid-item">Content</GridItem>
      );
      const item = container.querySelector('[data-testid="test-grid-item"]');
      expect(item).toBeInTheDocument();
    });

    it("should render with custom className", () => {
      const { container } = renderWithTheme(
        <GridItem className="custom-class">Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toHaveClass("custom-class");
    });
  });

  describe("Span", () => {
    it("should apply column span", () => {
      const { container } = renderWithTheme(
        <GridItem span={6}>Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toHaveStyle({
        gridColumn: "span 6 / span 6",
      });
    });

    it("should apply different column spans", () => {
      const { container } = renderWithTheme(
        <GridItem span={4}>Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toHaveStyle({
        gridColumn: "span 4 / span 4",
      });
    });
  });

  describe("Start/End Positioning", () => {
    it("should apply start and end positions", () => {
      const { container } = renderWithTheme(
        <GridItem start={1} end={5}>Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toHaveStyle({
        gridColumn: "1 / 5",
      });
    });

    it("should apply start position only", () => {
      const { container } = renderWithTheme(
        <GridItem start={3}>Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toHaveStyle({
        gridColumn: "3 / auto",
      });
    });

    it("should apply end position only", () => {
      const { container } = renderWithTheme(
        <GridItem end={7}>Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toHaveStyle({
        gridColumn: "auto / 7",
      });
    });
  });

  describe("Priority", () => {
    it("should prioritize span over start/end", () => {
      const { container } = renderWithTheme(
        <GridItem span={6} start={1} end={5}>Content</GridItem>
      );
      const item = getGridItem(container);
      expect(item).toHaveStyle({
        gridColumn: "span 6 / span 6",
      });
    });
  });
});

