/**
 * DataTable Component Examples
 * Usage examples for the DataTable Layer 3 pattern component
 */

import { DataTable, type DataTableColumn } from "./data-table";

// Example data types
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

// Example data
const users: User[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin", status: "active" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "User", status: "active" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "User", status: "inactive" },
];

const products: Product[] = [
  { id: "1", name: "Product A", price: 99.99, stock: 50, category: "Electronics" },
  { id: "2", name: "Product B", price: 149.99, stock: 30, category: "Clothing" },
  { id: "3", name: "Product C", price: 79.99, stock: 100, category: "Electronics" },
];

/**
 * Basic data table
 */
export function BasicDataTable() {
  const columns: DataTableColumn<User>[] = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "email", header: "Email", accessor: (row) => row.email, sortable: true },
    { id: "role", header: "Role", accessor: (row) => row.role },
    { id: "status", header: "Status", accessor: (row) => row.status },
  ];

  return <DataTable data={users} columns={columns} />;
}

/**
 * Data table with pagination
 */
export function PaginatedDataTable() {
  const columns: DataTableColumn<User>[] = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "email", header: "Email", accessor: (row) => row.email, sortable: true },
    { id: "role", header: "Role", accessor: (row) => row.role },
  ];

  return <DataTable data={users} columns={columns} paginated pageSize={2} />;
}

/**
 * Data table with row selection
 */
export function SelectableDataTable() {
  const columns: DataTableColumn<User>[] = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "email", header: "Email", accessor: (row) => row.email },
    { id: "role", header: "Role", accessor: (row) => row.role },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      selectable
      getRowId={(row) => row.id}
      onSelectionChange={(selectedIds) => console.log("Selected:", selectedIds)}
    />
  );
}

/**
 * Data table with clickable rows
 */
export function ClickableDataTable() {
  const columns: DataTableColumn<User>[] = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "email", header: "Email", accessor: (row) => row.email },
    { id: "role", header: "Role", accessor: (row) => row.role },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      clickable
      onRowClick={(row) => console.log("Clicked:", row)}
    />
  );
}

/**
 * Data table with custom cell rendering
 */
export function CustomCellDataTable() {
  const columns: DataTableColumn<Product>[] = [
    { id: "name", header: "Product", accessor: (row) => row.name, sortable: true },
    {
      id: "price",
      header: "Price",
      accessor: (row) => row.price,
      sortable: true,
      cell: (row) => `$${row.price.toFixed(2)}`,
      align: "right",
    },
    {
      id: "stock",
      header: "Stock",
      accessor: (row) => row.stock,
      cell: (row) => (
        <span className={row.stock < 50 ? "text-danger" : "text-success"}>
          {row.stock}
        </span>
      ),
      align: "center",
    },
    { id: "category", header: "Category", accessor: (row) => row.category },
  ];

  return <DataTable data={products} columns={columns} />;
}

/**
 * Data table with all features
 */
export function FullFeaturedDataTable() {
  const columns: DataTableColumn<User>[] = [
    { id: "name", header: "Name", accessor: (row) => row.name, sortable: true },
    { id: "email", header: "Email", accessor: (row) => row.email, sortable: true },
    { id: "role", header: "Role", accessor: (row) => row.role },
    { id: "status", header: "Status", accessor: (row) => row.status },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      selectable
      paginated
      pageSize={2}
      clickable
      getRowId={(row) => row.id}
      onSelectionChange={(selectedIds) => console.log("Selected:", selectedIds)}
      onRowClick={(row) => console.log("Clicked:", row)}
      onSortChange={(columnId, direction) =>
        console.log("Sort:", columnId, direction)
      }
      onPageChange={(page) => console.log("Page:", page)}
    />
  );
}

/**
 * Empty state data table
 */
export function EmptyDataTable() {
  const columns: DataTableColumn<User>[] = [
    { id: "name", header: "Name", accessor: (row) => row.name },
    { id: "email", header: "Email", accessor: (row) => row.email },
  ];

  return (
    <DataTable
      data={[]}
      columns={columns}
      emptyMessage="No users found"
    />
  );
}

