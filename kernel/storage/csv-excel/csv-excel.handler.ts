/**
 * 📊 CSV/Excel Import/Export Handler
 * 
 * SME-friendly data import/export for BYOS™
 * 
 * Features:
 * - Drag-and-drop CSV/Excel import
 * - Auto-mapping to database schemas
 * - Data validation before import
 * - Batch processing for large files
 * - Export any table to CSV/Excel
 * - Column mapping UI support
 * - Error reporting
 * - Preview before import
 */

import { StorageContract } from "../types";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import * as XLSX from "xlsx";

export interface ImportOptions {
  table: string;
  file: Buffer;
  fileType: "csv" | "excel";
  hasHeaders?: boolean;
  columnMapping?: Record<string, string>; // { "CSV Column": "DB Column" }
  skipRows?: number;
  validation?: {
    required?: string[];
    unique?: string[];
    format?: Record<string, RegExp>;
  };
  onProgress?: (progress: number) => void;
}

export interface ImportResult {
  success: boolean;
  rowsImported: number;
  rowsSkipped: number;
  errors: Array<{
    row: number;
    column?: string;
    error: string;
  }>;
  warnings: string[];
}

export interface ExportOptions {
  table: string;
  format: "csv" | "excel";
  columns?: string[];
  where?: Record<string, any>;
  limit?: number;
  includeHeaders?: boolean;
}

export class CSVExcelHandler {
  constructor(private storage: StorageContract) {}

  /**
   * Import CSV file to database
   */
  async importCSV(options: ImportOptions): Promise<ImportResult> {
    const {
      table,
      file,
      hasHeaders = true,
      columnMapping,
      skipRows = 0,
      validation,
      onProgress,
    } = options;

    const result: ImportResult = {
      success: true,
      rowsImported: 0,
      rowsSkipped: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Parse CSV
      const records: any[] = parse(file, {
        columns: hasHeaders,
        skip_empty_lines: true,
        from: skipRows + 1,
        trim: true,
        cast: true,
      });

      const totalRows = records.length;

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + skipRows + 1;

        try {
          // Apply column mapping
          const mappedRow = columnMapping
            ? this.applyColumnMapping(row, columnMapping)
            : row;

          // Validate row
          const validationErrors = this.validateRow(mappedRow, validation);
          if (validationErrors.length > 0) {
            validationErrors.forEach(err => {
              result.errors.push({
                row: rowNumber,
                column: err.column,
                error: err.error,
              });
            });
            result.rowsSkipped++;
            continue;
          }

          // Insert into database
          await this.storage.insert(table, mappedRow);
          result.rowsImported++;

          // Report progress
          if (onProgress) {
            onProgress(Math.round((i / totalRows) * 100));
          }
        } catch (error: any) {
          result.errors.push({
            row: rowNumber,
            error: error.message,
          });
          result.rowsSkipped++;
        }
      }

      result.success = result.rowsImported > 0;

      return result;
    } catch (error: any) {
      return {
        success: false,
        rowsImported: 0,
        rowsSkipped: 0,
        errors: [{ row: 0, error: `CSV parsing failed: ${error.message}` }],
        warnings: [],
      };
    }
  }

  /**
   * Import Excel file to database
   */
  async importExcel(options: ImportOptions): Promise<ImportResult> {
    const { file, table, hasHeaders = true, columnMapping, validation, onProgress } = options;

    try {
      // Parse Excel file
      const workbook = XLSX.read(file, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const records: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: hasHeaders ? undefined : 1,
        defval: null,
      });

      const result: ImportResult = {
        success: true,
        rowsImported: 0,
        rowsSkipped: 0,
        errors: [],
        warnings: [],
      };

      const totalRows = records.length;

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNumber = i + 2; // Excel rows start at 1, plus header

        try {
          // Apply column mapping
          const mappedRow = columnMapping
            ? this.applyColumnMapping(row, columnMapping)
            : row;

          // Validate row
          const validationErrors = this.validateRow(mappedRow, validation);
          if (validationErrors.length > 0) {
            validationErrors.forEach(err => {
              result.errors.push({
                row: rowNumber,
                column: err.column,
                error: err.error,
              });
            });
            result.rowsSkipped++;
            continue;
          }

          // Insert into database
          await this.storage.insert(table, mappedRow);
          result.rowsImported++;

          // Report progress
          if (onProgress) {
            onProgress(Math.round((i / totalRows) * 100));
          }
        } catch (error: any) {
          result.errors.push({
            row: rowNumber,
            error: error.message,
          });
          result.rowsSkipped++;
        }
      }

      result.success = result.rowsImported > 0;

      return result;
    } catch (error: any) {
      return {
        success: false,
        rowsImported: 0,
        rowsSkipped: 0,
        errors: [{ row: 0, error: `Excel parsing failed: ${error.message}` }],
        warnings: [],
      };
    }
  }

  /**
   * Export table to CSV
   */
  async exportToCSV(options: ExportOptions): Promise<Buffer> {
    const { table, columns, where, limit, includeHeaders = true } = options;

    // Build query
    let sql = `SELECT `;
    sql += columns ? columns.join(", ") : "*";
    sql += ` FROM ${table}`;

    const params: any[] = [];
    
    if (where) {
      const whereKeys = Object.keys(where);
      const whereClauses = whereKeys.map((key, i) => `${key} = $${i + 1}`);
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
      params.push(...Object.values(where));
    }

    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    // Execute query
    const rows = await this.storage.rawQuery(sql, params);

    if (rows.length === 0) {
      return Buffer.from("");
    }

    // Convert to CSV
    const csvString = stringify(rows, {
      header: includeHeaders,
      columns: columns || Object.keys(rows[0]),
    });

    return Buffer.from(csvString, "utf8");
  }

  /**
   * Export table to Excel
   */
  async exportToExcel(options: ExportOptions): Promise<Buffer> {
    const { table, columns, where, limit, includeHeaders = true } = options;

    // Build query
    let sql = `SELECT `;
    sql += columns ? columns.join(", ") : "*";
    sql += ` FROM ${table}`;

    const params: any[] = [];

    if (where) {
      const whereKeys = Object.keys(where);
      const whereClauses = whereKeys.map((key, i) => `${key} = $${i + 1}`);
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
      params.push(...Object.values(where));
    }

    if (limit) {
      sql += ` LIMIT ${limit}`;
    }

    // Execute query
    const rows = await this.storage.rawQuery(sql, params);

    if (rows.length === 0) {
      // Return empty workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([[]]);
      XLSX.utils.book_append_sheet(wb, ws, table);
      return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: columns || Object.keys(rows[0]),
      skipHeader: !includeHeaders,
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, table);

    // Write to buffer
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  }

  /**
   * Preview import before committing (returns first N rows)
   */
  async previewImport(
    file: Buffer,
    fileType: "csv" | "excel",
    previewRows: number = 10
  ): Promise<{
    headers: string[];
    rows: any[];
    totalRows: number;
  }> {
    if (fileType === "csv") {
      const records: any[] = parse(file, {
        columns: true,
        skip_empty_lines: true,
        to: previewRows + 1,
        trim: true,
      });

      const allRecords: any[] = parse(file, {
        columns: true,
        skip_empty_lines: true,
      });

      return {
        headers: records.length > 0 ? Object.keys(records[0]) : [],
        rows: records,
        totalRows: allRecords.length,
      };
    } else {
      // Excel
      const workbook = XLSX.read(file, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const allRecords: any[] = XLSX.utils.sheet_to_json(worksheet);
      const previewRecords = allRecords.slice(0, previewRows);

      return {
        headers: allRecords.length > 0 ? Object.keys(allRecords[0]) : [],
        rows: previewRecords,
        totalRows: allRecords.length,
      };
    }
  }

  /**
   * Suggest column mapping based on similarity
   */
  async suggestColumnMapping(
    fileHeaders: string[],
    table: string
  ): Promise<Record<string, string>> {
    // Get table schema from database
    const tableColumns = await this.getTableColumns(table);

    const mapping: Record<string, string> = {};

    fileHeaders.forEach(fileHeader => {
      const normalized = fileHeader.toLowerCase().replace(/[^a-z0-9]/g, "_");
      
      // Try exact match first
      const exactMatch = tableColumns.find(col => 
        col.toLowerCase() === normalized
      );

      if (exactMatch) {
        mapping[fileHeader] = exactMatch;
        return;
      }

      // Try fuzzy match
      const fuzzyMatch = tableColumns.find(col =>
        col.toLowerCase().includes(normalized) ||
        normalized.includes(col.toLowerCase())
      );

      if (fuzzyMatch) {
        mapping[fileHeader] = fuzzyMatch;
      }
    });

    return mapping;
  }

  // ═══════════════════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════════════════

  private applyColumnMapping(
    row: any,
    mapping: Record<string, string>
  ): any {
    const mapped: any = {};

    Object.entries(row).forEach(([key, value]) => {
      const mappedKey = mapping[key] || key;
      mapped[mappedKey] = value;
    });

    return mapped;
  }

  private validateRow(
    row: any,
    validation?: {
      required?: string[];
      unique?: string[];
      format?: Record<string, RegExp>;
    }
  ): Array<{ column: string; error: string }> {
    const errors: Array<{ column: string; error: string }> = [];

    if (!validation) {
      return errors;
    }

    // Required fields
    if (validation.required) {
      validation.required.forEach(field => {
        if (row[field] === null || row[field] === undefined || row[field] === "") {
          errors.push({ column: field, error: "Required field missing" });
        }
      });
    }

    // Format validation
    if (validation.format) {
      Object.entries(validation.format).forEach(([field, regex]) => {
        if (row[field] && !regex.test(String(row[field]))) {
          errors.push({ column: field, error: "Invalid format" });
        }
      });
    }

    return errors;
  }

  private async getTableColumns(table: string): Promise<string[]> {
    if (this.storage.provider === "local") {
      // SQLite
      const result = await this.storage.rawQuery(`PRAGMA table_info(${table})`);
      return result.map((row: any) => row.name);
    } else {
      // PostgreSQL
      const result = await this.storage.rawQuery(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
        [table]
      );
      return result.map((row: any) => row.column_name);
    }
  }
}

/**
 * Factory function
 */
export function createCSVExcelHandler(storage: StorageContract): CSVExcelHandler {
  return new CSVExcelHandler(storage);
}

