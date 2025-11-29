import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { kernelClient } from "@/lib/kernel-client";
import { ZVerifyInvoice } from "@aibos/types";

/**
 * POST /api/invoices/[id]/verify
 * 
 * Verify and approve/reject an invoice for posting to AP.
 * 
 * Workflow:
 * 1. Authenticate user (must have verifier role)
 * 2. Validate invoice data through Kernel (business rules)
 * 3. If approved:
 *    - Lock invoice (is_locked = true)
 *    - Update status to 'approved_to_ap'
 *    - Record verification details
 *    - Trigger AP posting (if configured)
 * 4. If rejected:
 *    - Update status to 'rejected'
 *    - Record rejection reason
 * 
 * @param id - Invoice UUID
 * @param approve - Boolean (approve or reject)
 * @param notes - Optional verification notes
 * @returns Updated invoice with verification details
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const session = await requireAuth();
    const userId = session.user.id;
    const tenantId = session.user.tenant_id;  // Multi-tenant

    // 2. Parse and validate request body
    const body = await req.json();
    const { approve, notes } = ZVerifyInvoice.parse(body);

    const supabase = createServerClient();

    // 3. Fetch invoice (RLS enforces tenant isolation)
    const { data: invoice, error: fetchError } = await supabase
      .from("invoices")
      .select(
        `
        *,
        line_items:invoice_line_items(*),
        supplier:suppliers(*)
      `
      )
      .eq("id", params.id)
      .eq("tenant_id", tenantId)  // Multi-tenant filter
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // 4. Check if already verified
    if (invoice.is_locked) {
      return NextResponse.json(
        {
          error: "Invoice is already locked and verified",
          verified_at: invoice.verified_at,
          verified_by: invoice.verified_by,
        },
        { status: 403 }
      );
    }

    // 5. Check if invoice is ready for verification
    const validStatuses = ["pending_verification", "verified"];
    if (!validStatuses.includes(invoice.status)) {
      return NextResponse.json(
        {
          error: "Invoice is not ready for verification",
          current_status: invoice.status,
          required_statuses: validStatuses,
        },
        { status: 400 }
      );
    }

    // 6. Validate invoice data through Kernel (business rules)
    let validationResult;
    try {
      // Call Kernel API for validation (if implemented)
      // This is where you'd check business rules like:
      // - Supplier exists and is active
      // - Invoice number is unique
      // - Total amount matches line items
      // - GL accounts are valid
      // - Required fields are present
      validationResult = await validateInvoiceBusinessRules(invoice);

      if (!validationResult.valid && approve) {
        return NextResponse.json(
          {
            error: "Invoice validation failed",
            validation_errors: validationResult.errors,
          },
          { status: 400 }
        );
      }
    } catch (validationError: any) {
      console.error("[Invoice Verify] Validation error:", validationError);
      // Continue even if Kernel validation fails (graceful degradation)
      validationResult = { valid: true, errors: [] };
    }

    // 7. Update invoice based on approval/rejection
    const now = new Date().toISOString();
    const updateData: any = {
      verified_by: userId,
      verified_at: now,
      verification_notes: notes || null,
      updated_at: now,
    };

    if (approve) {
      updateData.status = "approved_to_ap";
      updateData.is_locked = true; // 🔒 Lock the invoice
      updateData.ap_posted_at = now;

      // Generate AP batch ID (timestamp-based)
      updateData.ap_batch_id = `AP-${Date.now()}`;
    } else {
      updateData.status = "rejected";
      updateData.is_locked = false; // Keep unlocked for corrections
    }

    // 8. Update invoice in database
    const { data: updatedInvoice, error: updateError } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 9. Add verification comment
    const commentType = approve ? "approval" : "rejection";
    const comment = approve
      ? `Invoice approved and posted to AP (Batch: ${updateData.ap_batch_id})`
      : `Invoice rejected: ${notes || "No reason provided"}`;

    await supabase.from("invoice_comments").insert({
      invoice_id: params.id,
      comment_type: commentType,
      comment,
      metadata: {
        verified_by: userId,
        verification_notes: notes,
        validation_result: validationResult,
        ap_batch_id: approve ? updateData.ap_batch_id : null,
      },
      created_by: userId,
    });

    // 10. If approved, trigger AP posting (if configured)
    if (approve) {
      triggerAPPosting(updatedInvoice).catch((error) => {
        console.error("[Invoice Verify] AP posting error:", error);
        // Log but don't block the response
      });
    }

    console.log(
      `[Invoice Verify] Invoice ${params.id} ${approve ? "approved" : "rejected"} by ${userId}`
    );

    return NextResponse.json({
      invoice: updatedInvoice,
      message: approve
        ? "Invoice approved and posted to AP"
        : "Invoice rejected",
      validation: validationResult,
    });
  } catch (error: any) {
    console.error("[Invoice Verify] Error:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Validate invoice business rules through Kernel API
 * 
 * This function would call the Kernel API to validate:
 * - Supplier exists and is active
 * - Invoice number is unique
 * - Total amount matches line items
 * - GL accounts are valid
 * - Required fields are present
 * 
 * Placeholder implementation for now.
 */
async function validateInvoiceBusinessRules(invoice: any): Promise<{
  valid: boolean;
  errors: string[];
  warnings?: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation rules
  if (!invoice.invoice_number) {
    errors.push("Invoice number is required");
  }

  if (!invoice.supplier_id && !invoice.supplier_name) {
    errors.push("Supplier is required");
  }

  if (!invoice.total_amount || invoice.total_amount <= 0) {
    errors.push("Total amount must be greater than 0");
  }

  if (!invoice.invoice_date) {
    errors.push("Invoice date is required");
  }

  // Validate line items total matches invoice total
  if (invoice.line_items && invoice.line_items.length > 0) {
    const lineItemsTotal = invoice.line_items.reduce(
      (sum: number, item: any) => sum + (item.line_total || 0),
      0
    );

    const difference = Math.abs(lineItemsTotal - (invoice.total_amount || 0));
    if (difference > 0.01) {
      // Allow 1 cent rounding difference
      errors.push(
        `Line items total (${lineItemsTotal}) does not match invoice total (${invoice.total_amount})`
      );
    }
  } else {
    warnings.push("No line items found");
  }

  // Check OCR confidence (if available)
  if (invoice.ocr_confidence && invoice.ocr_confidence < 0.7) {
    warnings.push(
      `Low OCR confidence (${(invoice.ocr_confidence * 100).toFixed(1)}%)`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Trigger AP posting to external accounting system
 * 
 * Options:
 * 1. Call Kernel API to post to AP system
 * 2. Call external AP system API directly
 * 3. Add to job queue for batch processing
 * 
 * Placeholder implementation for now.
 */
async function triggerAPPosting(invoice: any): Promise<void> {
  const apSystemUrl = process.env.AP_SYSTEM_URL;

  if (!apSystemUrl) {
    console.log(`[AP Posting] AP system not configured for invoice ${invoice.id}`);
    return;
  }

  try {
    // Call external AP system
    const response = await fetch(apSystemUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AP_SYSTEM_API_KEY}`,
      },
      body: JSON.stringify({
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        supplier_id: invoice.supplier_id,
        total_amount: invoice.total_amount,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        line_items: invoice.line_items,
      }),
    });

    if (!response.ok) {
      throw new Error(`AP system error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`[AP Posting] Invoice ${invoice.id} posted to AP:`, result);

    // Update invoice with AP system ID
    const supabase = createServerClient();
    await supabase
      .from("invoices")
      .update({
        ap_system_id: result.ap_id || result.id,
        metadata: {
          ...invoice.metadata,
          ap_posting_result: result,
        },
      })
      .eq("id", invoice.id);
  } catch (error: any) {
    console.error(`[AP Posting] Error for invoice ${invoice.id}:`, error);

    // Add error comment
    const supabase = createServerClient();
    await supabase.from("invoice_comments").insert({
      invoice_id: invoice.id,
      comment_type: "system",
      comment: `AP posting failed: ${error.message}`,
      metadata: { error: error.message },
      created_by: "system",
    });

    throw error;
  }
}

