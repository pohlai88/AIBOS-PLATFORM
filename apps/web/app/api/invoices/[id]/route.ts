import { NextRequest, NextResponse } from "next/server";
import { createServerClient, getSignedUrl } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { ZUpdateInvoice } from "@aibos/types";

/**
 * GET /api/invoices/[id]
 * 
 * Get invoice by ID with signed URL for file access.
 * Includes related data: line items, comments, supplier.
 * 
 * @param id - Invoice UUID
 * @returns Invoice with relations and signed file URL
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authenticate user
        const session = await requireAuth();
        const userId = session.user.id;
        const tenantId = session.user.tenant_id;  // Multi-tenant

        const supabase = createServerClient();

        // 2. Fetch invoice with relations (RLS will enforce tenant isolation)
        const { data: invoice, error } = await supabase
            .from("invoices")
            .select(
                `
        *,
        line_items:invoice_line_items(*),
        comments:invoice_comments(
          *,
          created_by_user:created_by
        ),
        supplier:suppliers(*)
      `
            )
            .eq("id", params.id)
            .eq("tenant_id", tenantId)  // Multi-tenant filter
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Invoice not found" },
                    { status: 404 }
                );
            }
            throw error;
        }

        // 3. Check authorization (multi-tenant + user ownership)
        if (invoice.tenant_id !== tenantId) {
            return NextResponse.json(
                { error: "Unauthorized: Invoice belongs to different tenant" },
                { status: 403 }
            );
        }

        if (invoice.created_by !== userId) {
            return NextResponse.json(
                { error: "Unauthorized: You do not own this invoice" },
                { status: 403 }
            );
        }

        // 4. Generate signed URL for file (valid for 1 hour)
        let fileUrl = null;
        if (invoice.file_path) {
            fileUrl = await getSignedUrl(invoice.file_bucket, invoice.file_path, 3600);
        }

        // 5. Return invoice with file URL
        return NextResponse.json({
            ...invoice,
            file_url: fileUrl,
        });
    } catch (error: any) {
        console.error("[Invoice Get] Error:", error);
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
 * PATCH /api/invoices/[id]
 * 
 * Update invoice data (manual input/corrections).
 * Only allowed if invoice is unlocked and in draft/pending_verification status.
 * 
 * @param id - Invoice UUID
 * @param body - Invoice fields to update
 * @returns Updated invoice
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authenticate user
        const session = await requireAuth();
        const userId = session.user.id;
        const tenantId = session.user.tenant_id;  // Multi-tenant

        const supabase = createServerClient();

        // 2. Parse and validate request body
        const body = await req.json();
        const updateData = ZUpdateInvoice.parse(body);

        // 3. Check if invoice exists and is editable (RLS enforces tenant isolation)
        const { data: existing, error: fetchError } = await supabase
            .from("invoices")
            .select("id, tenant_id, created_by, is_locked, status")
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

        // 4. Check authorization (multi-tenant + ownership)
        if (existing.tenant_id !== tenantId) {
            return NextResponse.json(
                { error: "Unauthorized: Invoice belongs to different tenant" },
                { status: 403 }
            );
        }

        if (existing.created_by !== userId) {
            return NextResponse.json(
                { error: "Unauthorized: You do not own this invoice" },
                { status: 403 }
            );
        }

        // 5. Check if locked
        if (existing.is_locked) {
            return NextResponse.json(
                {
                    error: "Invoice is locked and cannot be modified",
                    reason: "Invoice has been approved to AP",
                },
                { status: 403 }
            );
        }

        // 6. Check status (only allow edits in draft or pending_verification)
        const editableStatuses = ["draft", "pending_verification"];
        if (!editableStatuses.includes(existing.status)) {
            return NextResponse.json(
                {
                    error: "Invoice cannot be edited in current status",
                    current_status: existing.status,
                    editable_statuses: editableStatuses,
                },
                { status: 403 }
            );
        }

        // 7. Update invoice
        const { data: invoice, error: updateError } = await supabase
            .from("invoices")
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq("id", params.id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        // 8. Add comment about manual update
        const updatedFields = Object.keys(updateData).join(", ");
        await supabase.from("invoice_comments").insert({
            invoice_id: params.id,
            comment_type: "note",
            comment: `Invoice manually updated (fields: ${updatedFields})`,
            metadata: {
                updated_fields: Object.keys(updateData),
                updated_by: userId,
            },
            created_by: userId,
        });

        console.log(`[Invoice Update] Invoice ${params.id} updated by ${userId}`);

        return NextResponse.json(invoice);
    } catch (error: any) {
        console.error("[Invoice Update] Error:", error);

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
 * DELETE /api/invoices/[id]
 * 
 * Delete an invoice and its associated file.
 * Only allowed if invoice is in draft status and unlocked.
 * 
 * @param id - Invoice UUID
 * @returns Success message
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authenticate user
        const session = await requireAuth();
        const userId = session.user.id;
        const tenantId = session.user.tenant_id;  // Multi-tenant

        const supabase = createServerClient();

        // 2. Fetch invoice (RLS enforces tenant isolation)
        const { data: invoice, error: fetchError } = await supabase
            .from("invoices")
            .select("id, tenant_id, created_by, is_locked, status, file_bucket, file_path")
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

        // 3. Check authorization (multi-tenant + ownership)
        if (invoice.tenant_id !== tenantId) {
            return NextResponse.json(
                { error: "Unauthorized: Invoice belongs to different tenant" },
                { status: 403 }
            );
        }

        if (invoice.created_by !== userId) {
            return NextResponse.json(
                { error: "Unauthorized: You do not own this invoice" },
                { status: 403 }
            );
        }

        // 4. Check if locked
        if (invoice.is_locked) {
            return NextResponse.json(
                { error: "Cannot delete locked invoice" },
                { status: 403 }
            );
        }

        // 5. Check status (only allow deletion in draft status)
        if (invoice.status !== "draft") {
            return NextResponse.json(
                {
                    error: "Only draft invoices can be deleted",
                    current_status: invoice.status,
                },
                { status: 403 }
            );
        }

        // 6. Delete file from storage
        if (invoice.file_path) {
            const { error: storageError } = await supabase.storage
                .from(invoice.file_bucket)
                .remove([invoice.file_path]);

            if (storageError) {
                console.error("[Invoice Delete] Storage error:", storageError);
                // Continue with database deletion even if file deletion fails
            }
        }

        // 7. Delete invoice (cascade will delete line items and comments)
        const { error: deleteError } = await supabase
            .from("invoices")
            .delete()
            .eq("id", params.id);

        if (deleteError) {
            throw deleteError;
        }

        console.log(`[Invoice Delete] Invoice ${params.id} deleted by ${userId}`);

        return NextResponse.json({
            message: "Invoice deleted successfully",
            id: params.id,
        });
    } catch (error: any) {
        console.error("[Invoice Delete] Error:", error);
        return NextResponse.json(
            {
                error: error.message || "Internal server error",
                details: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

