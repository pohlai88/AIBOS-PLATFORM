import type { KernelClient } from "../client";
import type {
  Invoice,
  InvoiceWithRelations,
  CreateInvoice,
  UpdateInvoice,
  VerifyInvoice,
  InvoiceListQuery,
} from "@aibos/types";

/**
 * Invoice API Resource
 * 
 * Provides methods for interacting with the Kernel Invoice API.
 * These methods can be called from the BFF layer for business logic validation.
 */
export class InvoiceResource {
  constructor(private client: KernelClient) {}

  /**
   * Validate invoice business rules
   * 
   * @param invoiceId - Invoice UUID
   * @returns Validation result with errors/warnings
   */
  async validate(invoiceId: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings?: string[];
  }> {
    return this.client.request("POST", `/invoices/${invoiceId}/validate`, {
      method: "POST",
    });
  }

  /**
   * Verify invoice for AP posting
   * 
   * This method runs business rules validation before approval.
   * Called from the BFF verify endpoint.
   * 
   * @param invoiceId - Invoice UUID
   * @param data - Verification data (approve, notes)
   * @returns Verification result
   */
  async verify(
    invoiceId: string,
    data: VerifyInvoice & { userId: string }
  ): Promise<{
    success: boolean;
    error?: string;
    validation?: {
      valid: boolean;
      errors: string[];
      warnings?: string[];
    };
  }> {
    return this.client.request("POST", `/invoices/${invoiceId}/verify`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Post invoice to AP system
   * 
   * Triggers integration with external AP/ERP system.
   * 
   * @param invoiceId - Invoice UUID
   * @returns AP posting result
   */
  async postToAP(invoiceId: string): Promise<{
    success: boolean;
    ap_system_id?: string;
    batch_id?: string;
    error?: string;
  }> {
    return this.client.request("POST", `/invoices/${invoiceId}/post-to-ap`, {
      method: "POST",
    });
  }

  /**
   * Trigger OCR processing for an invoice
   * 
   * @param invoiceId - Invoice UUID
   * @param filePath - Path to file in storage
   * @returns OCR trigger result
   */
  async triggerOCR(
    invoiceId: string,
    filePath: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    return this.client.request("POST", `/invoices/${invoiceId}/trigger-ocr`, {
      method: "POST",
      body: JSON.stringify({ filePath }),
    });
  }

  /**
   * Get supplier suggestions based on invoice data
   * 
   * Uses OCR data or manual input to suggest matching suppliers.
   * 
   * @param data - Invoice data for matching
   * @returns List of supplier suggestions
   */
  async suggestSuppliers(data: {
    supplier_name?: string;
    supplier_code?: string;
    invoice_number?: string;
  }): Promise<
    Array<{
      id: string;
      name: string;
      code?: string;
      confidence: number;
    }>
  > {
    return this.client.request("POST", "/invoices/suggest-suppliers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Validate GL account codes
   * 
   * @param accounts - Array of GL account codes to validate
   * @returns Validation result for each account
   */
  async validateGLAccounts(
    accounts: string[]
  ): Promise<
    Array<{
      account: string;
      valid: boolean;
      description?: string;
      error?: string;
    }>
  > {
    return this.client.request("POST", "/invoices/validate-gl-accounts", {
      method: "POST",
      body: JSON.stringify({ accounts }),
    });
  }

  /**
   * Get duplicate invoice check
   * 
   * Checks if an invoice with the same number/supplier already exists.
   * 
   * @param invoiceNumber - Invoice number
   * @param supplierId - Supplier UUID
   * @returns Duplicate check result
   */
  async checkDuplicate(
    invoiceNumber: string,
    supplierId: string
  ): Promise<{
    is_duplicate: boolean;
    existing_invoice?: {
      id: string;
      invoice_number: string;
      invoice_date: string;
      total_amount: number;
      status: string;
    };
  }> {
    return this.client.request("POST", "/invoices/check-duplicate", {
      method: "POST",
      body: JSON.stringify({ invoice_number: invoiceNumber, supplier_id: supplierId }),
    });
  }
}

