import { NextRequest, NextResponse } from "next/server";
import { createServerClient, uploadFile } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { ZCreateInvoice } from "@aibos/types";

/**
 * POST /api/invoices/upload
 * 
 * Upload an invoice file to Supabase Storage and create a database record.
 * 
 * Workflow:
 * 1. Validate authentication
 * 2. Validate file (type, size)
 * 3. Upload to Supabase Storage (bucket: invoices)
 * 4. Create invoice record in database
 * 5. Trigger OCR processing (async)
 * 6. Return invoice record
 * 
 * @param file - Invoice file (PDF, JPG, PNG)
 * @returns Invoice record with OCR status
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await requireAuth();
    const userId = session.user.id;
    const tenantId = session.user.tenant_id;  // Get from JWT (multi-tenant)

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed types: PDF, JPEG, PNG",
          allowed_types: allowedTypes,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size: 10MB",
          max_size: maxSize,
          file_size: file.size,
        },
        { status: 400 }
      );
    }

    // 5. Generate invoice ID and file path
    const invoiceId = crypto.randomUUID();
    const fileExtension = file.name.split(".").pop() || "pdf";

    // Multi-tenant file organization: {tenant_id}/{user_id}/{invoice_id}/file.ext
    const filePath = `${tenantId}/${userId}/${invoiceId}/original.${fileExtension}`;

    console.log(`[Invoice Upload] Tenant: ${tenantId}, User: ${userId}, Uploading file: ${filePath}`);

    // 6. Upload to Supabase Storage
    try {
      await uploadFile("invoices", filePath, file, {
        contentType: file.type,
        upsert: false,
      });
    } catch (uploadError: any) {
      console.error("[Invoice Upload] Storage error:", uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 7. Create invoice record in database
    const supabase = createServerClient();

    const invoiceData = {
      id: invoiceId,
      tenant_id: tenantId,  // Multi-tenant: Always from JWT
      file_bucket: "invoices",
      file_path: filePath,
      file_size: file.size,
      file_type: file.type,
      created_by: userId,
      status: "draft" as const,
      ocr_status: "pending" as const,
    };

    // Validate with Zod
    const validatedData = ZCreateInvoice.parse(invoiceData);

    const { data: invoice, error: dbError } = await supabase
      .from("invoices")
      .insert(validatedData)
      .select()
      .single();

    if (dbError) {
      console.error("[Invoice Upload] Database error:", dbError);
      // Cleanup: Delete uploaded file
      await supabase.storage.from("invoices").remove([filePath]);
      return NextResponse.json(
        { error: `Failed to create invoice record: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 8. Add initial comment
    await supabase.from("invoice_comments").insert({
      invoice_id: invoiceId,
      comment_type: "system",
      comment: `Invoice uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
      metadata: {
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
      },
      created_by: userId,
    });

    // 9. Trigger OCR processing (async - fire and forget)
    triggerOCR(invoiceId, filePath).catch((error) => {
      console.error("[Invoice Upload] OCR trigger error:", error);
      // Log but don't block the response
    });

    console.log(`[Invoice Upload] Success: ${invoiceId}`);

    return NextResponse.json(
      {
        invoice,
        message: "Invoice uploaded successfully. OCR processing started.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Invoice Upload] Error:", error);
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
 * Trigger OCR processing for an invoice
 * 
 * Options:
 * 1. Call Supabase Edge Function (recommended for production)
 * 2. Call external OCR service (Google Vision, AWS Textract, etc.)
 * 3. Add to job queue (Bull, BullMQ, etc.)
 * 
 * This is a placeholder implementation that updates the invoice status.
 */
async function triggerOCR(invoiceId: string, filePath: string): Promise<void> {
  const supabase = createServerClient();

  try {
    // Update status to processing
    await supabase
      .from("invoices")
      .update({ ocr_status: "processing" })
      .eq("id", invoiceId);

    // Option 1: Call Supabase Edge Function (if deployed)
    const edgeFunctionUrl = process.env.SUPABASE_EDGE_FUNCTION_OCR_URL;

    if (edgeFunctionUrl) {
      const response = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ invoiceId, filePath }),
      });

      if (!response.ok) {
        throw new Error(`Edge Function error: ${response.statusText}`);
      }

      console.log(`[OCR] Triggered for invoice ${invoiceId}`);
    } else {
      // Fallback: Just log for now (implement actual OCR later)
      console.log(`[OCR] Would process invoice ${invoiceId} at path ${filePath}`);
      console.log(`[OCR] To enable OCR, set SUPABASE_EDGE_FUNCTION_OCR_URL`);

      // Add comment about OCR being skipped
      await supabase.from("invoice_comments").insert({
        invoice_id: invoiceId,
        comment_type: "system",
        comment: "OCR processing skipped (not configured). Please configure SUPABASE_EDGE_FUNCTION_OCR_URL.",
        created_by: "system",
      });

      // Update status to pending (waiting for manual entry)
      await supabase
        .from("invoices")
        .update({
          ocr_status: "pending",
          status: "pending_verification",
        })
        .eq("id", invoiceId);
    }
  } catch (error: any) {
    console.error(`[OCR] Error for invoice ${invoiceId}:`, error);

    // Update status to failed
    await supabase
      .from("invoices")
      .update({ ocr_status: "failed" })
      .eq("id", invoiceId);

    // Add error comment
    await supabase.from("invoice_comments").insert({
      invoice_id: invoiceId,
      comment_type: "system",
      comment: `OCR processing failed: ${error.message}`,
      metadata: { error: error.message },
      created_by: "system",
    });

    throw error;
  }
}

