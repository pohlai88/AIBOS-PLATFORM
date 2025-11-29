# ✅ Invoice OCR Workflow - Complete Setup Summary

**Date:** November 27, 2025  
**Status:** 🟢 **DATABASE READY** | 🟡 **STORAGE BUCKET NEEDS MANUAL SETUP**

---

## 🎉 What's Been Created

### ✅ Database Tables (Applied to Supabase)

All tables have been created in your PostgreSQL database:

1. **`suppliers`** (9 columns, 2 sample records)
   - Supplier master data
   - Links to invoices via `supplier_id`

2. **`invoices`** (31 columns)
   - Main invoice header with **file storage integration**
   - `file_bucket`, `file_path`, `file_url` columns link to Supabase Storage
   - `is_locked` prevents editing after approval
   - `status` workflow: draft → pending_verification → verified → approved_to_ap
   - `ocr_status` tracking: pending → processing → completed

3. **`invoice_line_items`** (16 columns)
   - Invoice line-level detail
   - Extracted from OCR with confidence scores
   - GL account coding fields

4. **`invoice_comments`** (7 columns)
   - Audit trail and workflow comments
   - Tracks status changes, OCR results, verifications

### 📊 Table Statistics

```
Table                  | Columns | Rows | Status
-----------------------|---------|------|--------
suppliers              | 9       | 2    | ✅ Ready
invoices               | 31      | 0    | ✅ Ready
invoice_line_items     | 16      | 0    | ✅ Ready
invoice_comments       | 7       | 0    | ✅ Ready
```

---

## 🗂️ Next Step: Create Storage Bucket

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/storage/buckets

2. **Click "New bucket"**

3. **Configure bucket:**

   ```
   Name: invoices
   Public: No (private)
   File size limit: 10 MB
   Allowed MIME types:
     - application/pdf
     - image/jpeg
     - image/png
   ```

4. **Create the bucket**

5. **Set up Policies (in SQL Editor):**

Go to: https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/sql/new

Run this SQL:

```sql
-- Allow users to upload their own invoices
CREATE POLICY "Users can upload invoices"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to view their own invoices
CREATE POLICY "Users can view invoices"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own invoices
CREATE POLICY "Users can update invoices"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own invoices
CREATE POLICY "Users can delete invoices"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### Option 2: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref cnlutbuzjqtuicngldak

# Create bucket via SQL
supabase db execute "
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('invoices', 'invoices', false, 10485760);
"
```

---

## 📋 How It Works: Storage ↔ Database Link

### File Organization Structure

```
invoices/                           ← Bucket name
├── {user_id}/                      ← User's folder
│   ├── {invoice_id}/               ← Invoice-specific folder
│   │   ├── original.pdf            ← Uploaded invoice
│   │   ├── ocr_result.json         ← OCR output (optional)
│   │   └── thumbnail.jpg           ← Preview (optional)
│   └── {another_invoice_id}/
│       └── original.pdf
```

### Database Record Links to Storage

```sql
-- Example invoice record
INSERT INTO invoices (
  id,
  file_bucket,                    -- 'invoices'
  file_path,                      -- 'user-123/invoice-456/original.pdf'
  file_size,                      -- 245678
  file_type,                      -- 'application/pdf'
  created_by,                     -- user-123
  status,                         -- 'draft'
  ocr_status                      -- 'pending'
) VALUES (
  'invoice-456',
  'invoices',
  'user-123/invoice-456/original.pdf',
  245678,
  'application/pdf',
  'user-123',
  'draft',
  'pending'
);
```

### Retrieving File URL

```typescript
// In your BFF endpoint
const { data: invoice } = await supabase
  .from("invoices")
  .select("*")
  .eq("id", invoiceId)
  .single();

// Generate signed URL (expires in 1 hour)
const { data: urlData } = await supabase.storage
  .from(invoice.file_bucket)
  .createSignedUrl(invoice.file_path, 3600);

// Return to frontend
return {
  ...invoice,
  file_url: urlData.signedUrl, // https://...supabase.co/storage/v1/object/sign/invoices/...
};
```

---

## 🔄 Complete Workflow Example

### 1. User Uploads Invoice

```typescript
// Frontend
const file = document.querySelector('input[type="file"]').files[0];
const formData = new FormData();
formData.append("file", file);

const response = await fetch("/api/invoices/upload", {
  method: "POST",
  body: formData,
});

const { invoice } = await response.json();
// invoice.status = 'draft'
// invoice.ocr_status = 'pending'
```

### 2. Backend Uploads to Storage & Creates DB Record

```typescript
// BFF endpoint: /api/invoices/upload
const invoiceId = crypto.randomUUID();
const userId = session.user.id;
const filePath = `${userId}/${invoiceId}/original.pdf`;

// Upload to Supabase Storage
await supabase.storage.from("invoices").upload(filePath, file);

// Create database record
await supabase.from("invoices").insert({
  id: invoiceId,
  file_bucket: "invoices",
  file_path: filePath,
  file_size: file.size,
  file_type: file.type,
  created_by: userId,
  status: "draft",
  ocr_status: "pending",
});

// Trigger OCR (async)
await triggerOCR(invoiceId, filePath);
```

### 3. OCR Processing Updates Database

```typescript
// Edge Function or background job
const ocrResult = await processOCR(fileData);

// Update invoice with OCR data
await supabase
  .from("invoices")
  .update({
    ocr_status: "completed",
    ocr_data: ocrResult,
    ocr_confidence: 0.95,
    invoice_number: extractedData.invoiceNumber,
    supplier_name: extractedData.supplierName,
    total_amount: extractedData.totalAmount,
    status: "pending_verification", // Move to next stage
  })
  .eq("id", invoiceId);

// Insert line items
await supabase.from("invoice_line_items").insert(extractedLineItems);
```

### 4. User Manually Edits (UNLOCKED)

```typescript
// User can edit because is_locked = false
await supabase
  .from("invoices")
  .update({
    supplier_name: "Corrected Name",
    total_amount: 1500.0,
  })
  .eq("id", invoiceId)
  .eq("is_locked", false); // Only works if unlocked

// Add comment
await supabase.from("invoice_comments").insert({
  invoice_id: invoiceId,
  comment_type: "note",
  comment: "Corrected supplier name and amount",
  created_by: userId,
});
```

### 5. BFF Verification & Approval to AP

```typescript
// BFF endpoint: /api/invoices/{id}/verify
// Business rule validation happens here
const verification = await kernelClient.invoices.verify({
  invoiceId,
  userId,
  approve: true,
  notes: "All checks passed",
});

if (verification.success) {
  // Lock and approve to AP
  await supabase
    .from("invoices")
    .update({
      status: "approved_to_ap",
      is_locked: true, // 🔒 LOCKED - no more edits
      verified_by: userId,
      verified_at: new Date().toISOString(),
      verification_notes: "Approved for posting",
      ap_posted_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);

  // Add approval comment
  await supabase.from("invoice_comments").insert({
    invoice_id: invoiceId,
    comment_type: "approval",
    comment: "Invoice approved and posted to AP",
    created_by: userId,
  });
}
```

### 6. Status Progression

```
Upload
  ↓
draft (is_locked = false, manual input allowed)
  ↓
OCR Processing
  ↓
pending_verification (is_locked = false, manual input allowed)
  ↓
User Edits (corrections)
  ↓
BFF Verification
  ↓
approved_to_ap (is_locked = true, ❌ no more edits)
  ↓
Posted to AP System
```

---

## 🔒 Key Security Features

### 1. Row Level Security (RLS) - Needs to be Enabled

**Enable RLS:**

```sql
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_comments ENABLE ROW LEVEL SECURITY;

-- Users can only see their own invoices
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Users can only edit unlocked invoices they created
CREATE POLICY "Users can edit unlocked invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    AND is_locked = false
    AND status IN ('draft', 'pending_verification')
  );
```

### 2. File Storage Security

- ✅ Private bucket (not public)
- ✅ User-scoped folders (`{user_id}/`)
- ✅ Signed URLs with expiration
- ✅ MIME type restrictions
- ✅ File size limits

### 3. Lock Mechanism

```sql
-- Check before allowing edits
SELECT is_locked, status
FROM invoices
WHERE id = $1;

-- If is_locked = true → REJECT update
-- If status = 'approved_to_ap' → REJECT update
```

---

## 📝 Implementation Checklist

### Database ✅

- [x] Tables created
- [x] Indexes added
- [x] Sample suppliers inserted
- [ ] Enable RLS policies (run SQL above)
- [ ] Test with sample data

### Storage 🟡

- [ ] Create `invoices` bucket (via dashboard)
- [ ] Set bucket policies (via SQL)
- [ ] Test file upload
- [ ] Test signed URL generation

### Backend/BFF 🟡

- [ ] Implement upload endpoint (`/api/invoices/upload`)
- [ ] Implement get invoice endpoint (`/api/invoices/[id]`)
- [ ] Implement update endpoint (`/api/invoices/[id]`)
- [ ] Implement verify/approve endpoint (`/api/invoices/[id]/verify`)
- [ ] Create OCR Edge Function
- [ ] Add Kernel business rules

### Frontend 🟡

- [ ] File upload component
- [ ] Invoice view/edit form
- [ ] Line items editor
- [ ] Approval workflow UI
- [ ] Status indicators (locked/unlocked)

---

## 📚 Documentation

Complete implementation guide available in:

- **`SUPABASE_STORAGE_INTEGRATION_GUIDE.md`** - Full architecture & code examples
- **`kernel/migrations/016_create_invoice_storage_integration.sql`** - Database schema

---

## 🎯 Summary

### ✅ What's Working

- **Database Schema:** 4 tables with proper relationships
- **Sample Data:** 2 suppliers ready for testing
- **File Integration:** Column structure ready for storage links
- **Workflow States:** Draft → Verification → AP
- **Lock Mechanism:** `is_locked` prevents post-approval edits

### 🔧 What's Next

1. **Create storage bucket** (5 minutes via dashboard)
2. **Set up bucket policies** (copy/paste SQL)
3. **Enable RLS** (copy/paste SQL)
4. **Test upload workflow** (use provided code examples)
5. **Implement OCR** (Edge Function or external service)

### 🔗 Quick Links

- **Create Bucket:** https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/storage/buckets
- **SQL Editor:** https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/sql/new
- **Table Editor:** https://supabase.com/dashboard/project/cnlutbuzjqtuicngldak/editor

---

**Status:** Database ✅ Ready | Storage 🟡 Pending Manual Setup  
**Next Action:** Create storage bucket via dashboard  
**Timeline:** 10 minutes to complete setup
