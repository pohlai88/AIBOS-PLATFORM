/**
 * 📦 Canonical Storage Format (CSF) Normalizer
 * 
 * Standardizes ALL provider responses into a unified format.
 * No matter what the provider returns, CSF normalizes it.
 * 
 * Features:
 * - Unified response format
 * - Error normalization
 * - Pagination standardization
 * - Metadata extraction
 * - Type coercion
 * - Null handling
 */

import { z } from "zod";

// ═══════════════════════════════════════════════════════════
// Canonical Response Format
// ═══════════════════════════════════════════════════════════

export const CanonicalResponseSchema = z.object({
  // Always present
  success: z.boolean(),
  timestamp: z.string(),
  
  // Data (always array, even for single record)
  data: z.array(z.record(z.any())).default([]),
  count: z.number().default(0),
  
  // Pagination
  pagination: z.object({
    hasMore: z.boolean().default(false),
    cursor: z.string().optional(),
    nextPage: z.string().optional(),
    prevPage: z.string().optional(),
    totalPages: z.number().optional(),
    currentPage: z.number().optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }).optional(),
  
  // Metadata
  meta: z.object({
    provider: z.string(),
    operation: z.string(),
    durationMs: z.number(),
    affectedRows: z.number().optional(),
    insertedId: z.string().optional(),
    warnings: z.array(z.string()).optional(),
  }).optional(),
  
  // Error (if any)
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    retryable: z.boolean().default(false),
    httpStatus: z.number().optional(),
  }).optional(),
});

export type CanonicalResponse = z.infer<typeof CanonicalResponseSchema>;

// ═══════════════════════════════════════════════════════════
// Provider Response Patterns
// ═══════════════════════════════════════════════════════════

interface ProviderResponsePattern {
  dataPath: string | string[];
  countPath?: string;
  errorPath?: string;
  cursorPath?: string;
  totalPath?: string;
  successIndicator?: (response: any) => boolean;
}

const PROVIDER_PATTERNS: Record<string, ProviderResponsePattern> = {
  supabase: {
    dataPath: "data",
    countPath: "count",
    errorPath: "error.message",
    successIndicator: (r) => !r.error,
  },
  aws: {
    dataPath: ["Items", "records", "data"],
    countPath: ["Count", "count"],
    cursorPath: "LastEvaluatedKey",
    successIndicator: (r) => !r.errorMessage,
  },
  azure: {
    dataPath: ["value", "data", "records"],
    countPath: ["@odata.count", "count"],
    cursorPath: "@odata.nextLink",
    successIndicator: (r) => !r.error,
  },
  firebase: {
    dataPath: "documents",
    cursorPath: "nextPageToken",
    successIndicator: (r) => !r.error,
  },
  airtable: {
    dataPath: "records",
    cursorPath: "offset",
    successIndicator: (r) => !r.error,
  },
  notion: {
    dataPath: "results",
    cursorPath: "next_cursor",
    successIndicator: (r) => !r.error,
  },
  rest: {
    dataPath: ["data", "items", "results", "records"],
    countPath: ["total", "count", "totalCount"],
    cursorPath: ["cursor", "next_cursor", "nextCursor"],
    successIndicator: (r) => r.success !== false && !r.error,
  },
};

// ═══════════════════════════════════════════════════════════
// CSF Normalizer
// ═══════════════════════════════════════════════════════════

export class CSFNormalizer {
  /**
   * Normalize any provider response to CSF
   */
  normalize(
    provider: string,
    operation: string,
    rawResponse: any,
    startTime: number
  ): CanonicalResponse {
    const pattern = PROVIDER_PATTERNS[provider] || PROVIDER_PATTERNS.rest;
    const durationMs = Date.now() - startTime;

    try {
      // Check success
      const success = pattern.successIndicator
        ? pattern.successIndicator(rawResponse)
        : this.inferSuccess(rawResponse);

      if (!success) {
        return this.normalizeError(provider, operation, rawResponse, durationMs);
      }

      // Extract data
      const data = this.extractData(rawResponse, pattern.dataPath);
      const count = this.extractCount(rawResponse, pattern.countPath, data);
      const cursor = this.extractValue(rawResponse, pattern.cursorPath);
      const total = this.extractValue(rawResponse, pattern.totalPath);

      // Normalize data records
      const normalizedData = this.normalizeRecords(data, provider);

      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: normalizedData,
        count: normalizedData.length,
        pagination: {
          hasMore: !!cursor,
          cursor: cursor as string | undefined,
          totalPages: total ? Math.ceil(Number(total) / normalizedData.length) : undefined,
        },
        meta: {
          provider,
          operation,
          durationMs,
          affectedRows: normalizedData.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        data: [],
        count: 0,
        error: {
          code: "NORMALIZATION_ERROR",
          message: `Failed to normalize response: ${error.message}`,
          retryable: false,
        },
        meta: {
          provider,
          operation,
          durationMs,
        },
      };
    }
  }

  /**
   * Normalize error response
   */
  normalizeError(
    provider: string,
    operation: string,
    rawResponse: any,
    durationMs: number
  ): CanonicalResponse {
    const errorInfo = this.extractErrorInfo(rawResponse, provider);

    return {
      success: false,
      timestamp: new Date().toISOString(),
      data: [],
      count: 0,
      error: {
        code: errorInfo.code,
        message: errorInfo.message,
        details: errorInfo.details,
        retryable: this.isRetryable(errorInfo.code, errorInfo.httpStatus),
        httpStatus: errorInfo.httpStatus,
      },
      meta: {
        provider,
        operation,
        durationMs,
      },
    };
  }

  /**
   * Normalize single record response
   */
  normalizeSingle(
    provider: string,
    operation: string,
    rawResponse: any,
    startTime: number
  ): CanonicalResponse {
    const response = this.normalize(provider, operation, rawResponse, startTime);
    
    // Ensure single record is wrapped in array
    if (response.success && response.data.length === 0 && rawResponse) {
      const data = this.extractSingleRecord(rawResponse, provider);
      if (data) {
        response.data = [data];
        response.count = 1;
      }
    }

    return response;
  }

  // ═══════════════════════════════════════════════════════════
  // Private Helpers
  // ═══════════════════════════════════════════════════════════

  private extractData(response: any, pathOrPaths: string | string[]): any[] {
    const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
    
    for (const path of paths) {
      const value = this.getNestedValue(response, path);
      if (value !== undefined) {
        return Array.isArray(value) ? value : [value];
      }
    }

    // If response itself is array, use it
    if (Array.isArray(response)) {
      return response;
    }

    return [];
  }

  private extractCount(response: any, pathOrPaths: string | string[] | undefined, data: any[]): number {
    if (!pathOrPaths) return data.length;
    
    const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
    
    for (const path of paths) {
      const value = this.getNestedValue(response, path);
      if (value !== undefined && !isNaN(Number(value))) {
        return Number(value);
      }
    }

    return data.length;
  }

  private extractValue(response: any, pathOrPaths: string | string[] | undefined): any {
    if (!pathOrPaths) return undefined;
    
    const paths = Array.isArray(pathOrPaths) ? pathOrPaths : [pathOrPaths];
    
    for (const path of paths) {
      const value = this.getNestedValue(response, path);
      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private inferSuccess(response: any): boolean {
    if (response === null || response === undefined) return false;
    if (response.error) return false;
    if (response.success === false) return false;
    if (response.status === "error") return false;
    if (response.ok === false) return false;
    return true;
  }

  private normalizeRecords(records: any[], provider: string): Record<string, any>[] {
    return records.map(record => this.normalizeRecord(record, provider));
  }

  private normalizeRecord(record: any, provider: string): Record<string, any> {
    if (!record || typeof record !== "object") {
      return { value: record };
    }

    // Provider-specific normalization
    switch (provider) {
      case "airtable":
        return { id: record.id, ...record.fields };
      case "notion":
        return this.normalizeNotionRecord(record);
      case "firebase":
        return this.normalizeFirebaseRecord(record);
      default:
        return record;
    }
  }

  private normalizeNotionRecord(record: any): Record<string, any> {
    const normalized: Record<string, any> = { id: record.id };
    
    if (record.properties) {
      Object.entries(record.properties).forEach(([key, prop]: [string, any]) => {
        normalized[key] = this.extractNotionValue(prop);
      });
    }

    return normalized;
  }

  private extractNotionValue(prop: any): any {
    if (!prop) return null;
    
    switch (prop.type) {
      case "title":
        return prop.title?.[0]?.plain_text || "";
      case "rich_text":
        return prop.rich_text?.[0]?.plain_text || "";
      case "number":
        return prop.number;
      case "select":
        return prop.select?.name;
      case "multi_select":
        return prop.multi_select?.map((s: any) => s.name) || [];
      case "date":
        return prop.date?.start;
      case "checkbox":
        return prop.checkbox;
      default:
        return prop[prop.type];
    }
  }

  private normalizeFirebaseRecord(record: any): Record<string, any> {
    if (!record.fields) return record;
    
    const normalized: Record<string, any> = {
      id: record.name?.split("/").pop(),
    };

    Object.entries(record.fields).forEach(([key, value]: [string, any]) => {
      normalized[key] = this.extractFirebaseValue(value);
    });

    return normalized;
  }

  private extractFirebaseValue(value: any): any {
    if (!value) return null;
    
    const type = Object.keys(value)[0];
    const val = value[type];

    switch (type) {
      case "stringValue":
      case "integerValue":
      case "doubleValue":
      case "booleanValue":
        return val;
      case "timestampValue":
        return new Date(val).toISOString();
      case "arrayValue":
        return val.values?.map((v: any) => this.extractFirebaseValue(v)) || [];
      case "mapValue":
        const obj: Record<string, any> = {};
        Object.entries(val.fields || {}).forEach(([k, v]) => {
          obj[k] = this.extractFirebaseValue(v);
        });
        return obj;
      default:
        return val;
    }
  }

  private extractSingleRecord(response: any, provider: string): Record<string, any> | null {
    // Try common patterns for single record
    if (response.data && !Array.isArray(response.data)) {
      return this.normalizeRecord(response.data, provider);
    }
    if (response.item) {
      return this.normalizeRecord(response.item, provider);
    }
    if (response.record) {
      return this.normalizeRecord(response.record, provider);
    }
    if (response.id) {
      return this.normalizeRecord(response, provider);
    }
    return null;
  }

  private extractErrorInfo(response: any, provider: string): {
    code: string;
    message: string;
    details?: any;
    httpStatus?: number;
  } {
    // Try various error patterns
    const error = response.error || response.errors?.[0] || response;
    
    return {
      code: error.code || error.errorCode || error.type || "UNKNOWN_ERROR",
      message: error.message || error.errorMessage || error.description || "Unknown error",
      details: error.details || error.data,
      httpStatus: error.status || error.statusCode || error.httpStatus,
    };
  }

  private isRetryable(code: string, httpStatus?: number): boolean {
    // Retryable error codes
    const retryableCodes = [
      "TIMEOUT", "CONNECTION_ERROR", "RATE_LIMITED", "SERVICE_UNAVAILABLE",
      "TEMPORARY_ERROR", "NETWORK_ERROR", "ECONNRESET", "ETIMEDOUT"
    ];

    // Retryable HTTP statuses
    const retryableStatuses = [408, 429, 500, 502, 503, 504];

    return retryableCodes.includes(code) || (httpStatus ? retryableStatuses.includes(httpStatus) : false);
  }
}

export const csfNormalizer = new CSFNormalizer();

