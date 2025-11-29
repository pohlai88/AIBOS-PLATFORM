import { z } from "zod";

// ============================================
// Invoice Status Enums
// ============================================

export const InvoiceStatusEnum = z.enum([
  "draft",
  "pending_verification",
  "verified",
  "approved_to_ap",
  "rejected",
  "on_hold",
]);

export const OCRStatusEnum = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const CommentTypeEnum = z.enum([
  "note",
  "status_change",
  "ocr_result",
  "verification",
  "approval",
  "rejection",
  "system",
]);

// ============================================
// Supplier Schema
// ============================================

export const ZSupplier = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.record(z.unknown()).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ZCreateSupplier = z.object({
  name: z.string().min(1, "Supplier name is required"),
  code: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ZUpdateSupplier = ZCreateSupplier.partial();

// ============================================
// Invoice Schema
// ============================================

export const ZInvoice = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid().nullable().optional(),
  
  // File reference
  file_bucket: z.string().default("invoices"),
  file_path: z.string(),
  file_url: z.string().nullable().optional(),
  file_size: z.number().int().nullable().optional(),
  file_type: z.string().nullable().optional(),
  
  // Invoice data
  invoice_number: z.string().nullable().optional(),
  supplier_id: z.string().uuid().nullable().optional(),
  supplier_name: z.string().nullable().optional(),
  invoice_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  total_amount: z.number().nullable().optional(),
  tax_amount: z.number().nullable().optional(),
  net_amount: z.number().nullable().optional(),
  currency: z.string().default("USD"),
  
  // OCR metadata
  ocr_status: OCRStatusEnum.default("pending"),
  ocr_confidence: z.number().min(0).max(1).nullable().optional(),
  ocr_data: z.record(z.unknown()).nullable().optional(),
  ocr_processed_at: z.string().datetime().nullable().optional(),
  
  // Workflow status
  status: InvoiceStatusEnum.default("draft"),
  is_locked: z.boolean().default(false),
  
  // Verification
  verified_by: z.string().uuid().nullable().optional(),
  verified_at: z.string().datetime().nullable().optional(),
  verification_notes: z.string().nullable().optional(),
  
  // AP integration
  ap_posted_at: z.string().datetime().nullable().optional(),
  ap_batch_id: z.string().nullable().optional(),
  ap_system_id: z.string().nullable().optional(),
  
  // Metadata
  metadata: z.record(z.unknown()).nullable().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ZCreateInvoice = z.object({
  tenant_id: z.string().uuid().optional(),
  file_bucket: z.string().default("invoices"),
  file_path: z.string(),
  file_size: z.number().int().optional(),
  file_type: z.string().optional(),
  invoice_number: z.string().optional(),
  supplier_id: z.string().uuid().optional(),
  supplier_name: z.string().optional(),
  invoice_date: z.string().optional(),
  due_date: z.string().optional(),
  total_amount: z.number().optional(),
  tax_amount: z.number().optional(),
  net_amount: z.number().optional(),
  currency: z.string().default("USD"),
  metadata: z.record(z.unknown()).optional(),
});

export const ZUpdateInvoice = z.object({
  invoice_number: z.string().optional(),
  supplier_id: z.string().uuid().optional(),
  supplier_name: z.string().optional(),
  invoice_date: z.string().optional(),
  due_date: z.string().optional(),
  total_amount: z.number().optional(),
  tax_amount: z.number().optional(),
  net_amount: z.number().optional(),
  currency: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================
// Invoice Line Item Schema
// ============================================

export const ZInvoiceLineItem = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  line_number: z.number().int(),
  description: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
  unit_price: z.number().nullable().optional(),
  line_total: z.number().nullable().optional(),
  tax_rate: z.number().nullable().optional(),
  tax_amount: z.number().nullable().optional(),
  gl_account: z.string().nullable().optional(),
  cost_center: z.string().nullable().optional(),
  project_code: z.string().nullable().optional(),
  ocr_confidence: z.record(z.unknown()).nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ZCreateInvoiceLineItem = z.object({
  invoice_id: z.string().uuid(),
  line_number: z.number().int(),
  description: z.string().optional(),
  quantity: z.number().optional(),
  unit_price: z.number().optional(),
  line_total: z.number().optional(),
  tax_rate: z.number().optional(),
  tax_amount: z.number().optional(),
  gl_account: z.string().optional(),
  cost_center: z.string().optional(),
  project_code: z.string().optional(),
  ocr_confidence: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const ZUpdateInvoiceLineItem = ZCreateInvoiceLineItem.omit({
  invoice_id: true,
  line_number: true,
}).partial();

// ============================================
// Invoice Comment Schema
// ============================================

export const ZInvoiceComment = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  comment_type: CommentTypeEnum.default("note"),
  comment: z.string(),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
});

export const ZCreateInvoiceComment = z.object({
  invoice_id: z.string().uuid(),
  comment_type: CommentTypeEnum.default("note"),
  comment: z.string().min(1, "Comment is required"),
  metadata: z.record(z.unknown()).optional(),
});

// ============================================
// Invoice Verification Schema
// ============================================

export const ZVerifyInvoice = z.object({
  approve: z.boolean(),
  notes: z.string().optional(),
});

// ============================================
// Invoice List Query Schema
// ============================================

export const ZInvoiceListQuery = z.object({
  status: InvoiceStatusEnum.optional(),
  ocr_status: OCRStatusEnum.optional(),
  supplier_id: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sort_by: z.enum(["created_at", "invoice_date", "total_amount"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================
// TypeScript Types
// ============================================

export type Supplier = z.infer<typeof ZSupplier>;
export type CreateSupplier = z.infer<typeof ZCreateSupplier>;
export type UpdateSupplier = z.infer<typeof ZUpdateSupplier>;

export type Invoice = z.infer<typeof ZInvoice>;
export type CreateInvoice = z.infer<typeof ZCreateInvoice>;
export type UpdateInvoice = z.infer<typeof ZUpdateInvoice>;
export type InvoiceStatus = z.infer<typeof InvoiceStatusEnum>;
export type OCRStatus = z.infer<typeof OCRStatusEnum>;

export type InvoiceLineItem = z.infer<typeof ZInvoiceLineItem>;
export type CreateInvoiceLineItem = z.infer<typeof ZCreateInvoiceLineItem>;
export type UpdateInvoiceLineItem = z.infer<typeof ZUpdateInvoiceLineItem>;

export type InvoiceComment = z.infer<typeof ZInvoiceComment>;
export type CreateInvoiceComment = z.infer<typeof ZCreateInvoiceComment>;
export type CommentType = z.infer<typeof CommentTypeEnum>;

export type VerifyInvoice = z.infer<typeof ZVerifyInvoice>;
export type InvoiceListQuery = z.infer<typeof ZInvoiceListQuery>;

// ============================================
// Invoice with Relations
// ============================================

export const ZInvoiceWithRelations = ZInvoice.extend({
  line_items: z.array(ZInvoiceLineItem).optional(),
  comments: z.array(ZInvoiceComment).optional(),
  supplier: ZSupplier.nullable().optional(),
});

export type InvoiceWithRelations = z.infer<typeof ZInvoiceWithRelations>;

