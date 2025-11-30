/**
 * DataTable Component Tests
 *
 * Tests for the DataTable Layer 3 component following GRCD-TESTING.md patterns
 * Generated using UI Testing MCP server and enhanced for comprehensive coverage
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme } from "../../../../../tests/utils/render-helpers";
import { expectAccessible } from "../../../../../tests/utils/accessibility-helpers";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "./data-table";

// Helper function to get DataTable element
function getDataTable(container: HTMLElement): HTMLElement | null {
  return (
    container.querySelector(".mcp-layer3-pattern") ||
    container.querySelector('[data-testid*="data-table"]')
  ) as HTMLElement | null;
}

// Test data types
interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const testUsers: TestUser[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "User" },
];

const testColumns: DataTableColumn<TestUser>[] = [
  { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
  { id: "email", header: "Email", accessor: (row) => row.email, sortable: true },
  { id: "role", header: "Role", accessor: (row) => row.role },
];

describe("DataTable", () => {
  describe("Rendering", () => {
    it("should render data table", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} />
      );
      const table = container.querySelector("table");
      expect(table).toBeInTheDocument();
    });

    it("should render all data rows", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(testUsers.length);
    });

    it("should render all columns", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} />
      );
      const headers = container.querySelectorAll("thead th");
      // Exclude checkbox column if selectable
      expect(headers.length).toBeGreaterThanOrEqual(testColumns.length);
    });

    it("should render with testId", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} testId="test-table" />
      );
      const table = container.querySelector('[data-testid="test-table"]');
      expect(table).toBeInTheDocument();
    });

    it("should render empty state when no data", () => {
      const { container } = renderWithTheme(
        <DataTable data={[]} columns={testColumns} />
      );
      const emptyState = container.querySelector('[data-testid*="empty"]');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState?.textContent).toContain("No data available");
    });

    it("should render custom empty message", () => {
      const { container } = renderWithTheme(
        <DataTable
          data={[]}
          columns={testColumns}
          emptyMessage="No users found"
        />
      );
      const emptyState = container.querySelector('[data-testid*="empty"]');
      expect(emptyState?.textContent).toContain("No users found");
    });
  });

  describe("Sorting", () => {
    it("should render sortable column headers", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} />
      );
      const sortableHeader = container.querySelector('th[class*="cursor-pointer"]');
      expect(sortableHeader).toBeInTheDocument();
    });

    it("should call onSortChange when sortable column is clicked", async () => {
      const handleSort = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          onSortChange={handleSort}
        />
      );
      const sortableHeader = container.querySelector('th[class*="cursor-pointer"]');
      expect(sortableHeader).toBeTruthy();
      await user.click(sortableHeader!);
      expect(handleSort).toHaveBeenCalled();
    });

    it("should sort data ascending on first click", async () => {
      const handleSort = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          onSortChange={handleSort}
        />
      );
      const nameHeader = Array.from(container.querySelectorAll("th")).find((th) =>
        th.textContent?.includes("Name")
      );
      expect(nameHeader).toBeTruthy();
      await user.click(nameHeader!);
      expect(handleSort).toHaveBeenCalledWith("name", "asc");
    });

    it("should not sort non-sortable columns", async () => {
      const handleSort = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          onSortChange={handleSort}
        />
      );
      const roleHeader = Array.from(container.querySelectorAll("th")).find((th) =>
        th.textContent?.includes("Role")
      );
      expect(roleHeader).toBeTruthy();
      await user.click(roleHeader!);
      expect(handleSort).not.toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    it("should not show pagination when paginated is false", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} paginated={false} />
      );
      const pagination = container.querySelector('button[aria-label*="page"]');
      expect(pagination).not.toBeInTheDocument();
    });

    it("should show pagination when paginated is true", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} paginated pageSize={2} />
      );
      const pagination = container.querySelector('button[aria-label*="page"]');
      expect(pagination).toBeInTheDocument();
    });

    it("should paginate data correctly", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} paginated pageSize={2} />
      );
      const rows = container.querySelectorAll("tbody tr");
      expect(rows.length).toBe(2); // Only 2 rows per page
    });

    it("should call onPageChange when page button is clicked", async () => {
      const handlePageChange = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          paginated
          pageSize={2}
          onPageChange={handlePageChange}
        />
      );
      const nextButton = container.querySelector('button[aria-label="Next page"]');
      expect(nextButton).toBeTruthy();
      await user.click(nextButton!);
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });

    it("should disable previous button on first page", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} paginated pageSize={2} />
      );
      const prevButton = container.querySelector('button[aria-label="Previous page"]');
      expect(prevButton).toBeDisabled();
    });

    it("should disable next button on last page", () => {
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          paginated
          pageSize={2}
          page={1}
        />
      );
      const nextButton = container.querySelector('button[aria-label="Next page"]');
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Row Selection", () => {
    it("should not show checkboxes when selectable is false", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} selectable={false} />
      );
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBe(0);
    });

    it("should show checkboxes when selectable is true", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} selectable />
      );
      const checkboxes = container.querySelectorAll('input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it("should call onSelectionChange when row is selected", async () => {
      const handleSelection = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          selectable
          getRowId={(row) => row.id}
          onSelectionChange={handleSelection}
        />
      );
      const rowCheckbox = container.querySelectorAll('tbody input[type="checkbox"]')[0];
      expect(rowCheckbox).toBeTruthy();
      await user.click(rowCheckbox!);
      expect(handleSelection).toHaveBeenCalled();
    });

    it("should select all rows when header checkbox is clicked", async () => {
      const handleSelection = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          selectable
          getRowId={(row) => row.id}
          onSelectionChange={handleSelection}
        />
      );
      const selectAllCheckbox = container.querySelector('thead input[type="checkbox"]');
      expect(selectAllCheckbox).toBeTruthy();
      await user.click(selectAllCheckbox!);
      expect(handleSelection).toHaveBeenCalled();
    });
  });

  describe("Clickable Rows", () => {
    it("should call onRowClick when row is clicked", async () => {
      const handleRowClick = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          clickable
          onRowClick={handleRowClick}
        />
      );
      const firstRow = container.querySelector("tbody tr");
      expect(firstRow).toBeTruthy();
      await user.click(firstRow!);
      expect(handleRowClick).toHaveBeenCalledWith(testUsers[0]);
    });

    it("should not call onRowClick when clickable is false", async () => {
      const handleRowClick = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          clickable={false}
          onRowClick={handleRowClick}
        />
      );
      const firstRow = container.querySelector("tbody tr");
      expect(firstRow).toBeTruthy();
      await user.click(firstRow!);
      expect(handleRowClick).not.toHaveBeenCalled();
    });
  });

  describe("Custom Cell Rendering", () => {
    it("should use custom cell renderer when provided", () => {
      const columnsWithCustomCell: DataTableColumn<TestUser>[] = [
        {
          id: "name",
          header: "Name",
          accessor: (row) => row.name,
          cell: (row) => <strong>{row.name}</strong>,
        },
      ];
      const { container } = renderWithTheme(
        <DataTable data={[testUsers[0]]} columns={columnsWithCustomCell} />
      );
      const strongElement = container.querySelector("tbody strong");
      expect(strongElement).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} />
      );
      await expectAccessible(container);
    });

    it("should have proper ARIA labels for pagination", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} paginated pageSize={2} />
      );
      const prevButton = container.querySelector('button[aria-label="Previous page"]');
      const nextButton = container.querySelector('button[aria-label="Next page"]');
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it("should have proper ARIA labels for selection", () => {
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} selectable />
      );
      const selectAllCheckbox = container.querySelector('thead input[aria-label*="Select"]');
      expect(selectAllCheckbox).toBeInTheDocument();
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("should work in uncontrolled mode", async () => {
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable data={testUsers} columns={testColumns} paginated pageSize={2} />
      );
      const nextButton = container.querySelector('button[aria-label="Next page"]');
      expect(nextButton).toBeTruthy();
      await user.click(nextButton!);
      // Should navigate to next page without external state
      const pageText = Array.from(container.querySelectorAll("*"))
        .find((el) => el.textContent?.includes("Page 2"));
      expect(pageText).toBeInTheDocument();
    });

    it("should work in controlled mode", async () => {
      const handlePageChange = vi.fn();
      const user = userEvent.setup();
      const { container } = renderWithTheme(
        <DataTable
          data={testUsers}
          columns={testColumns}
          paginated
          pageSize={2}
          page={0}
          onPageChange={handlePageChange}
        />
      );
      const nextButton = container.querySelector('button[aria-label="Next page"]');
      expect(nextButton).toBeTruthy();
      await user.click(nextButton!);
      expect(handlePageChange).toHaveBeenCalledWith(1);
    });
  });
});

