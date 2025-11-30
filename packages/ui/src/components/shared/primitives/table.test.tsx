/**
 * Table Component Tests
 *
 * Tests for the Table primitive component and subcomponents following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../tests/utils/accessibility-helpers";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "./table";

describe("Table", () => {
  describe("Rendering", () => {
    it("should render table element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();
    });

    it("should render table with testId", () => {
      const { container } = renderWithTheme(
        <Table testId="test-table">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector('[data-testid="test-table"]');
      expect(table).toBeInTheDocument();
    });

    it("should render table with custom className", () => {
      const { container } = renderWithTheme(
        <Table className="custom-class">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("custom-class");
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      await expectAccessible(container);
    });

    it("should have MCP validation markers", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveAttribute("data-mcp-validated", "true");
      expect(table).toHaveAttribute(
        "data-constitution-compliant",
        "table-shared"
      );
    });
  });

  describe("Variants", () => {
    it("should apply default variant styles", () => {
      const { container } = renderWithTheme(
        <Table variant="default">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();
    });

    it("should apply bordered variant styles", () => {
      const { container } = renderWithTheme(
        <Table variant="bordered">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("border", "border-border");
    });

    it("should apply striped variant styles", () => {
      const { container } = renderWithTheme(
        <Table variant="striped">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();
    });
  });

  describe("Sizes", () => {
    it("should apply small size styles", () => {
      const { container } = renderWithTheme(
        <Table size="sm">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("text-sm");
    });

    it("should apply medium size styles", () => {
      const { container } = renderWithTheme(
        <Table size="md">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("text-base");
    });

    it("should apply large size styles", () => {
      const { container } = renderWithTheme(
        <Table size="lg">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("text-lg");
    });

    it("should default to medium size", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("text-base");
    });
  });

  describe("TableHeader", () => {
    it("should render thead element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const thead = container.querySelector("thead");
      expect(thead).toBeInTheDocument();
    });

    it("should have border styles", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const thead = container.querySelector("thead");
      expect(thead).toHaveClass("border-b", "border-border");
    });
  });

  describe("TableBody", () => {
    it("should render tbody element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const tbody = container.querySelector("tbody");
      expect(tbody).toBeInTheDocument();
    });
  });

  describe("TableFooter", () => {
    it("should render tfoot element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const tfoot = container.querySelector("tfoot");
      expect(tfoot).toBeInTheDocument();
    });

    it("should have footer styles", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const tfoot = container.querySelector("tfoot");
      expect(tfoot).toHaveClass("border-t", "border-border");
      expect(tfoot).toHaveClass("bg-bg-muted");
      expect(tfoot).toHaveClass("font-medium");
    });
  });

  describe("TableRow", () => {
    it("should render tr element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const tr = container.querySelector("tr");
      expect(tr).toBeInTheDocument();
    });

    it("should apply clickable styles when clickable is true", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow clickable>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const tr = container.querySelector("tr");
      expect(tr).toHaveClass("hover:bg-bg-muted", "cursor-pointer");
    });

    it("should have border styles", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const tr = container.querySelector("tr");
      expect(tr).toHaveClass("border-b", "border-border");
    });
  });

  describe("TableHead", () => {
    it("should render th element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const th = container.querySelector("th");
      expect(th).toBeInTheDocument();
    });

    it("should have header styles", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      const th = container.querySelector("th");
      expect(th).toHaveClass("h-12", "px-4");
      expect(th).toHaveClass("text-left", "align-middle", "font-medium");
      expect(th).toHaveClass("text-fg-muted");
    });
  });

  describe("TableCell", () => {
    it("should render td element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const td = container.querySelector("td");
      expect(td).toBeInTheDocument();
    });

    it("should have cell styles", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const td = container.querySelector("td");
      expect(td).toHaveClass("p-4", "align-middle");
    });
  });

  describe("TableCaption", () => {
    it("should render caption element", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableCaption>Table caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = container.querySelector("caption");
      expect(caption).toBeInTheDocument();
      expect(caption?.textContent).toBe("Table caption");
    });

    it("should have caption styles", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableCaption>Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const caption = container.querySelector("caption");
      expect(caption).toHaveClass("mt-4", "text-sm");
      expect(caption).toHaveClass("text-fg-muted");
    });
  });

  describe("Base Styles", () => {
    it("should have base table styles", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toHaveClass("w-full", "caption-bottom");
      expect(table).toHaveClass("text-sm", "leading-relaxed");
    });

    it("should be wrapped in scrollable container", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const wrapper = container.querySelector("div:not(.test-theme-wrapper)");
      expect(wrapper).toHaveClass("relative", "w-full", "overflow-auto");
    });
  });

  describe("Props", () => {
    it("should forward ref", () => {
      const ref = vi.fn();
      renderWithTheme(
        <Table ref={ref}>
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(ref).toHaveBeenCalled();
    });

    it("should accept all HTML table attributes", () => {
      const { container } = renderWithTheme(
        <Table id="test" data-testid="table" aria-label="Test table">
          <TableBody>
            <TableRow>
              <TableCell>Content</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = container.querySelector("#test");
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute("id", "test");
    });
  });

  describe("Edge Cases", () => {
    it("should handle complete table structure", () => {
      const { container } = renderWithTheme(
        <Table>
          <TableCaption>Users</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>john@example.com</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total: 1</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();
      const caption = container.querySelector("caption");
      expect(caption).toBeInTheDocument();
      const thead = container.querySelector("thead");
      expect(thead).toBeInTheDocument();
      const tbody = container.querySelector("tbody");
      expect(tbody).toBeInTheDocument();
      const tfoot = container.querySelector("tfoot");
      expect(tfoot).toBeInTheDocument();
    });
  });
});
