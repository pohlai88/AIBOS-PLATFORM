/**
 * 📊 CSV/Excel Import/Export — SME-Friendly Data Management
 * 
 * Drag-and-drop import/export for non-technical users
 * 
 * Example:
 * ```typescript
 * const handler = createCSVExcelHandler(storage);
 * 
 * // Import CSV
 * const result = await handler.importCSV({
 *   table: 'customers',
 *   file: csvBuffer,
 *   fileType: 'csv',
 *   hasHeaders: true,
 * });
 * 
 * // Export to Excel
 * const excelBuffer = await handler.exportToExcel({
 *   table: 'orders',
 *   format: 'excel',
 * });
 * ```
 */

export {
  CSVExcelHandler,
  createCSVExcelHandler,
  type ImportOptions,
  type ImportResult,
  type ExportOptions,
} from "./csv-excel.handler";

