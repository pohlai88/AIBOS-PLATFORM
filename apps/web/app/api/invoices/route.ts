import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import { ZInvoiceListQuery } from "@aibos/types";

/**
 * GET /api/invoices
 * 
 * List invoices with filtering, sorting, and pagination.
 * 
 * Query params:
 * - status: Filter by invoice status (draft, pending_verification, etc.)
 * - ocr_status: Filter by OCR status (pending, processing, completed, failed)
 * - supplier_id: Filter by supplier UUID
 * - limit: Number of results (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - sort_by: Sort field (created_at, invoice_date, total_amount)
 * - sort_order: Sort order (asc, desc)
 * 
 * @returns Paginated list of invoices
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await requireAuth();
    const userId = session.user.id;
    const tenantId = session.user.tenant_id;  // Multi-tenant

    // 2. Parse and validate query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryParams = {
      status: searchParams.get("status") || undefined,
      ocr_status: searchParams.get("ocr_status") || undefined,
      supplier_id: searchParams.get("supplier_id") || undefined,
      limit: parseInt(searchParams.get("limit") || "20"),
      offset: parseInt(searchParams.get("offset") || "0"),
      sort_by: searchParams.get("sort_by") || "created_at",
      sort_order: searchParams.get("sort_order") || "desc",
    };

    // Validate with Zod
    const validated = ZInvoiceListQuery.parse(queryParams);

    const supabase = createServerClient();

    // 3. Build query (RLS enforces tenant isolation)
    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        supplier:suppliers(id, name, code),
        line_items_count:invoice_line_items(count),
        comments_count:invoice_comments(count)
      `,
        { count: "exact" }
      )
      .eq("tenant_id", tenantId)  // Multi-tenant filter
      .eq("created_by", userId); // Only return user's own invoices

    // Apply filters
    if (validated.status) {
      query = query.eq("status", validated.status);
    }

    if (validated.ocr_status) {
      query = query.eq("ocr_status", validated.ocr_status);
    }

    if (validated.supplier_id) {
      query = query.eq("supplier_id", validated.supplier_id);
    }

    // Apply sorting
    query = query.order(validated.sort_by, {
      ascending: validated.sort_order === "asc",
    });

    // Apply pagination
    query = query.range(
      validated.offset,
      validated.offset + validated.limit - 1
    );

    // 4. Execute query
    const { data: invoices, error, count } = await query;

    if (error) {
      throw error;
    }

    // 5. Calculate pagination metadata
    const totalPages = Math.ceil((count || 0) / validated.limit);
    const currentPage = Math.floor(validated.offset / validated.limit) + 1;

    return NextResponse.json({
      data: invoices,
      pagination: {
        total: count || 0,
        limit: validated.limit,
        offset: validated.offset,
        current_page: currentPage,
        total_pages: totalPages,
        has_more: validated.offset + validated.limit < (count || 0),
      },
      filters: {
        status: validated.status,
        ocr_status: validated.ocr_status,
        supplier_id: validated.supplier_id,
      },
      sort: {
        sort_by: validated.sort_by,
        sort_order: validated.sort_order,
      },
    });
  } catch (error: any) {
    console.error("[Invoice List] Error:", error);

    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
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
 * POST /api/invoices
 * 
 * Create a manual invoice without file upload.
 * Useful for manually entered invoices or bulk imports.
 * 
 * @param body - Invoice data
 * @returns Created invoice
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await requireAuth();
    const userId = session.user.id;
    const tenantId = session.user.tenant_id;  // Multi-tenant

    // 2. Parse request body
    const body = await req.json();

    const supabase = createServerClient();

    // 3. Create invoice record (multi-tenant)
    const invoiceData = {
      ...body,
      tenant_id: tenantId,  // Multi-tenant: Always from JWT
      created_by: userId,
      status: body.status || "draft",
      ocr_status: "pending", // Manual entry, no OCR
      is_locked: false,
    };

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 4. Add initial comment
    await supabase.from("invoice_comments").insert({
      invoice_id: invoice.id,
      comment_type: "system",
      comment: "Invoice created manually (no file upload)",
      created_by: userId,
    });

    console.log(`[Invoice Create] Manual invoice created: ${invoice.id}`);

    return NextResponse.json(
      {
        invoice,
        message: "Invoice created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Invoice Create] Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

